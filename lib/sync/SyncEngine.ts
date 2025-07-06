/**
 * Core synchronization engine
 * Manages sync queue processing and conflict resolution
 */

import { 
  StorageManager, 
  SyncOperation, 
  ConflictResolution, 
  SyncPriority, 
  SyncStatusInfo,
  SyncEvent,
  SyncEventListener
} from '../storage/types';
import { NetworkManager } from './NetworkManager';
import { ConflictResolver } from './ConflictResolver';
import { RetryManager } from './RetryManager';

export interface SyncEngineConfig {
  maxConcurrentOperations: number;
  syncIntervalMs: number;
  retryDelayMs: number;
  maxRetryAttempts: number;
  batchSize: number;
  priorityWeights: Record<SyncPriority, number>;
}

export class SyncEngine {
  private storageManager: StorageManager;
  private networkManager: NetworkManager;
  private conflictResolver: ConflictResolver;
  private retryManager: RetryManager;
  private config: SyncEngineConfig;
  
  private isRunning = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private activeSyncOperations = new Set<string>();
  private currentSessionId: string | null = null;
  
  constructor(
    storageManager: StorageManager,
    networkManager: NetworkManager,
    config: Partial<SyncEngineConfig> = {}
  ) {
    this.storageManager = storageManager;
    this.networkManager = networkManager;
    this.conflictResolver = new ConflictResolver(storageManager, networkManager);
    this.retryManager = new RetryManager();
    
    this.config = {
      maxConcurrentOperations: 5,
      syncIntervalMs: 30000, // 30 seconds
      retryDelayMs: 1000,
      maxRetryAttempts: 3,
      batchSize: 10,
      priorityWeights: { 1: 3, 2: 2, 3: 1 }, // High priority gets 3x weight
      ...config
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.currentSessionId = this.generateSessionId();
    
    // Initialize sync status
    await this.storageManager.updateSyncStatus(this.currentSessionId, {
      status: 'idle',
      totalOperations: 0,
      completedOperations: 0,
      failedOperations: 0,
      progressPercentage: 0,
      startedAt: new Date(),
      lastActivity: new Date()
    });
    
    // Start periodic sync
    this.syncInterval = setInterval(() => {
      this.processSyncQueue().catch(error => {
        console.error('Sync queue processing error:', error);
      });
    }, this.config.syncIntervalMs);
    
    // Process initial queue
    await this.processSyncQueue();
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    // Wait for active operations to complete
    await this.waitForActiveOperations();
    
    if (this.currentSessionId) {
      await this.storageManager.updateSyncStatus(this.currentSessionId, {
        status: 'completed',
        completedAt: new Date(),
        lastActivity: new Date()
      });
    }
  }

  async forcSync(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Sync engine not running. Call start() first.');
    }
    
    await this.processSyncQueue();
  }

  async processSyncQueue(): Promise<void> {
    if (!this.networkManager.isOnline()) {
      console.log('Device offline, skipping sync');
      return;
    }

    try {
      // Get pending operations sorted by priority
      const operations = await this.getPrioritizedOperations();
      
      if (operations.length === 0) {
        await this.updateSyncStatus({ status: 'idle' });
        return;
      }

      await this.updateSyncStatus({
        status: 'syncing',
        totalOperations: operations.length,
        progressPercentage: 0,
        currentOperation: 'Starting sync...'
      });

      // Process operations in batches
      const batches = this.createBatches(operations, this.config.batchSize);
      let completedCount = 0;
      let failedCount = 0;

      for (const batch of batches) {
        const batchPromises = batch.map(operation => 
          this.processSyncOperation(operation)
            .then(() => completedCount++)
            .catch(() => failedCount++)
        );

        await Promise.allSettled(batchPromises);

        // Update progress
        const progress = ((completedCount + failedCount) / operations.length) * 100;
        await this.updateSyncStatus({
          completedOperations: completedCount,
          failedOperations: failedCount,
          progressPercentage: Math.round(progress),
          currentOperation: `Processing batch ${batches.indexOf(batch) + 1}/${batches.length}`
        });
      }

      // Final status update
      await this.updateSyncStatus({
        status: completedCount === operations.length ? 'completed' : 'failed',
        completedAt: new Date(),
        currentOperation: undefined
      });

    } catch (error) {
      console.error('Sync queue processing failed:', error);
      await this.updateSyncStatus({
        status: 'failed',
        errorDetails: { message: error.message, stack: error.stack }
      });
    }
  }

  private async processSyncOperation(operation: SyncOperation): Promise<void> {
    const operationId = operation.id;
    
    if (this.activeSyncOperations.has(operationId)) {
      return; // Already processing
    }

    this.activeSyncOperations.add(operationId);

    try {
      await this.updateSyncStatus({
        currentOperation: `${operation.operation} ${operation.entityType}:${operation.entityId}`
      });

      // Execute the sync operation
      const result = await this.executeSyncOperation(operation);

      if (result.success) {
        // Remove from sync queue on success
        await this.storageManager.removeSyncOperation(operationId);
        
        // Update entity metadata
        await this.storageManager.updateMetadata(
          operation.entityType,
          operation.entityId,
          { syncStatus: 'synced' }
        );
      } else {
        // Handle failure with retry logic
        await this.handleSyncFailure(operation, result.error);
      }

    } catch (error) {
      console.error(`Sync operation ${operationId} failed:`, error);
      await this.handleSyncFailure(operation, error);
    } finally {
      this.activeSyncOperations.delete(operationId);
    }
  }

  private async executeSyncOperation(operation: SyncOperation): Promise<{ success: boolean; error?: any; conflictData?: any }> {
    try {
      switch (operation.operation) {
        case 'create':
          return await this.syncCreate(operation);
        case 'update':
          return await this.syncUpdate(operation);
        case 'delete':
          return await this.syncDelete(operation);
        default:
          throw new Error(`Unknown operation type: ${operation.operation}`);
      }
    } catch (error) {
      return { success: false, error };
    }
  }

  private async syncCreate(operation: SyncOperation): Promise<{ success: boolean; error?: any }> {
    try {
      const response = await this.networkManager.createEntity(
        operation.entityType,
        operation.data
      );

      if (response.success) {
        // Update local entity with server ID if different
        if (response.data.id !== operation.entityId) {
          await this.storageManager.update(
            operation.entityType,
            operation.entityId,
            { serverId: response.data.id }
          );
        }
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error };
    }
  }

  private async syncUpdate(operation: SyncOperation): Promise<{ success: boolean; error?: any; conflictData?: any }> {
    try {
      // Get current local metadata for version checking
      const localMetadata = await this.storageManager.getMetadata(
        operation.entityType,
        operation.entityId
      );

      if (!localMetadata) {
        return { success: false, error: 'Local entity not found' };
      }

      const response = await this.networkManager.updateEntity(
        operation.entityType,
        operation.entityId,
        operation.data,
        localMetadata.version
      );

      if (response.success) {
        return { success: true };
      } else if (response.conflict) {
        // Handle conflict
        await this.handleConflict(operation, response.conflictData, localMetadata);
        return { success: false, error: 'Conflict detected', conflictData: response.conflictData };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error };
    }
  }

  private async syncDelete(operation: SyncOperation): Promise<{ success: boolean; error?: any }> {
    try {
      const response = await this.networkManager.deleteEntity(
        operation.entityType,
        operation.entityId
      );

      if (response.success) {
        // Perform actual local deletion after successful sync
        await this.storageManager.delete(operation.entityType, operation.entityId);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error };
    }
  }

  private async handleConflict(
    operation: SyncOperation,
    remoteData: any,
    localMetadata: any
  ): Promise<void> {
    const localData = await this.storageManager.read(
      operation.entityType,
      operation.entityId
    );

    const conflict: Omit<ConflictResolution, 'id'> = {
      entityType: operation.entityType,
      entityId: operation.entityId,
      conflictType: 'version_mismatch',
      localVersion: localMetadata.version,
      remoteVersion: remoteData.version || localMetadata.version + 1,
      localData,
      remoteData,
      status: 'pending'
    };

    const conflictId = await this.storageManager.addConflict(conflict);
    
    // Try automatic resolution
    const resolution = await this.conflictResolver.resolveConflict(conflictId);
    
    if (resolution.autoResolved) {
      console.log(`Conflict ${conflictId} auto-resolved using ${resolution.strategy}`);
    } else {
      console.log(`Conflict ${conflictId} requires manual resolution`);
      // Update entity metadata to indicate conflict
      await this.storageManager.updateMetadata(
        operation.entityType,
        operation.entityId,
        { syncStatus: 'conflict' }
      );
    }
  }

  private async handleSyncFailure(operation: SyncOperation, error: any): Promise<void> {
    const newRetryCount = operation.retryCount + 1;
    
    if (newRetryCount >= operation.maxRetries) {
      // Max retries reached, mark as failed
      await this.storageManager.updateSyncOperation(operation.id, {
        error: error.message || 'Max retries exceeded'
      });
      
      await this.storageManager.updateMetadata(
        operation.entityType,
        operation.entityId,
        { syncStatus: 'error' }
      );
      
      console.error(`Sync operation ${operation.id} failed permanently:`, error);
    } else {
      // Schedule retry with exponential backoff
      const retryDelay = this.retryManager.calculateRetryDelay(
        newRetryCount,
        this.config.retryDelayMs
      );
      
      const nextRetryAt = new Date(Date.now() + retryDelay);
      
      await this.storageManager.updateSyncOperation(operation.id, {
        retryCount: newRetryCount,
        nextRetryAt,
        error: error.message || 'Sync failed'
      });
      
      console.log(`Sync operation ${operation.id} scheduled for retry ${newRetryCount}/${operation.maxRetries} at ${nextRetryAt}`);
    }
  }

  private async getPrioritizedOperations(): Promise<SyncOperation[]> {
    const allOperations = await this.storageManager.getSyncQueue();
    
    // Filter operations that are ready for retry
    const readyOperations = allOperations.filter(op => 
      op.nextRetryAt <= new Date() && 
      !this.activeSyncOperations.has(op.id)
    );
    
    // Sort by priority (higher priority first) and creation time
    return readyOperations.sort((a, b) => {
      const priorityDiff = a.priority - b.priority; // Lower number = higher priority
      if (priorityDiff !== 0) return priorityDiff;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async waitForActiveOperations(): Promise<void> {
    while (this.activeSyncOperations.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async updateSyncStatus(updates: Partial<SyncStatusInfo>): Promise<void> {
    if (this.currentSessionId) {
      await this.storageManager.updateSyncStatus(this.currentSessionId, {
        ...updates,
        lastActivity: new Date()
      });
    }
  }

  private generateSessionId(): string {
    return `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API for monitoring
  async getSyncStatus(): Promise<SyncStatusInfo | null> {
    if (!this.currentSessionId) return null;
    return this.storageManager.getSyncStatus(this.currentSessionId);
  }

  async getPendingOperationsCount(): Promise<number> {
    const operations = await this.storageManager.getSyncQueue();
    return operations.length;
  }

  async getConflictsCount(): Promise<number> {
    const conflicts = await this.storageManager.getConflicts();
    return conflicts.filter(c => c.status === 'pending').length;
  }

  // Event handling
  addEventListener(eventType: string, listener: SyncEventListener): void {
    this.storageManager.addEventListener(eventType, listener);
  }

  removeEventListener(eventType: string, listener: SyncEventListener): void {
    this.storageManager.removeEventListener(eventType, listener);
  }
}
