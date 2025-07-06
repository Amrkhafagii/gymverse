/**
 * Platform-agnostic storage manager
 * Provides unified interface for SQLite/Realm across platforms
 */

import { Platform } from 'react-native';
import { 
  IStorageAdapter, 
  StorageConfig, 
  EntityMetadata, 
  SyncOperation, 
  ConflictResolution,
  MediaCacheEntry,
  OfflineSession,
  SyncStatusInfo,
  QueryOptions,
  SyncEvent,
  SyncEventListener,
  SyncPriority,
  OperationType
} from './types';

// Platform-specific adapter imports
import { SQLiteStorageAdapter } from './adapters/SQLiteAdapter';
import { RealmStorageAdapter } from './adapters/RealmAdapter';
import { WebStorageAdapter } from './adapters/WebAdapter';

export class StorageManager {
  private adapter: IStorageAdapter;
  private eventListeners: Map<string, SyncEventListener[]> = new Map();
  private isInitialized = false;

  constructor(private config: StorageConfig) {
    this.adapter = this.createAdapter();
  }

  private createAdapter(): IStorageAdapter {
    if (Platform.OS === 'web') {
      return new WebStorageAdapter();
    } else {
      // For React Native, prefer SQLite for better cross-platform consistency
      // Can be configured to use Realm if needed
      return new SQLiteStorageAdapter();
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.adapter.initialize(this.config);
      this.isInitialized = true;
      this.emitEvent({
        type: 'sync_started',
        sessionId: 'initialization',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Storage initialization failed:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (!this.isInitialized) return;
    
    await this.adapter.close();
    this.isInitialized = false;
    this.eventListeners.clear();
  }

  // Entity Operations with automatic metadata management
  async create<T extends Record<string, any>>(
    entityType: string, 
    data: T,
    priority: SyncPriority = 2
  ): Promise<string> {
    this.ensureInitialized();
    
    const id = await this.adapter.create(entityType, data);
    
    // Create metadata
    const metadata: EntityMetadata = {
      id,
      entityType,
      version: 1,
      lastModified: new Date(),
      checksum: this.generateChecksum(data),
      syncStatus: 'pending'
    };
    
    await this.adapter.updateMetadata(entityType, id, metadata);
    
    // Add to sync queue
    await this.addToSyncQueue({
      entityType,
      entityId: id,
      operation: 'create',
      priority,
      data,
      retryCount: 0,
      maxRetries: 3,
      nextRetryAt: new Date()
    });
    
    return id;
  }

  async read<T>(entityType: string, id: string): Promise<T | null> {
    this.ensureInitialized();
    return this.adapter.read<T>(entityType, id);
  }

  async update<T extends Record<string, any>>(
    entityType: string, 
    id: string, 
    data: Partial<T>,
    priority: SyncPriority = 2
  ): Promise<void> {
    this.ensureInitialized();
    
    // Get current metadata for version checking
    const currentMetadata = await this.adapter.getMetadata(entityType, id);
    if (!currentMetadata) {
      throw new Error(`Entity ${entityType}:${id} not found`);
    }
    
    await this.adapter.update(entityType, id, data);
    
    // Update metadata
    const newVersion = currentMetadata.version + 1;
    const updatedMetadata: Partial<EntityMetadata> = {
      version: newVersion,
      lastModified: new Date(),
      checksum: this.generateChecksum(data),
      syncStatus: 'pending'
    };
    
    await this.adapter.updateMetadata(entityType, id, updatedMetadata);
    
    // Add to sync queue
    await this.addToSyncQueue({
      entityType,
      entityId: id,
      operation: 'update',
      priority,
      data,
      retryCount: 0,
      maxRetries: 3,
      nextRetryAt: new Date()
    });
  }

  async delete(
    entityType: string, 
    id: string,
    priority: SyncPriority = 1
  ): Promise<void> {
    this.ensureInitialized();
    
    // Mark as deleted in metadata (soft delete for sync)
    await this.adapter.updateMetadata(entityType, id, {
      isDeleted: true,
      lastModified: new Date(),
      syncStatus: 'pending'
    });
    
    // Add to sync queue
    await this.addToSyncQueue({
      entityType,
      entityId: id,
      operation: 'delete',
      priority,
      data: { deleted: true },
      retryCount: 0,
      maxRetries: 3,
      nextRetryAt: new Date()
    });
    
    // Actual deletion happens after successful sync
  }

  async list<T>(entityType: string, options?: QueryOptions): Promise<T[]> {
    this.ensureInitialized();
    return this.adapter.list<T>(entityType, options);
  }

  // Sync Queue Operations
  async addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'createdAt'>): Promise<string> {
    return this.adapter.addToSyncQueue(operation);
  }

  async getSyncQueue(priority?: SyncPriority): Promise<SyncOperation[]> {
    return this.adapter.getSyncQueue(priority);
  }

  async updateSyncOperation(id: string, updates: Partial<SyncOperation>): Promise<void> {
    await this.adapter.updateSyncOperation(id, updates);
  }

  async removeSyncOperation(id: string): Promise<void> {
    await this.adapter.removeSyncOperation(id);
  }

  // Conflict Resolution
  async addConflict(conflict: Omit<ConflictResolution, 'id'>): Promise<string> {
    const conflictId = await this.adapter.addConflict(conflict);
    
    this.emitEvent({
      type: 'conflict_detected',
      sessionId: 'conflict_resolution',
      data: { conflictId, ...conflict },
      timestamp: new Date()
    });
    
    return conflictId;
  }

  async getConflicts(): Promise<ConflictResolution[]> {
    return this.adapter.getConflicts();
  }

  async resolveConflict(id: string, resolution: Partial<ConflictResolution>): Promise<void> {
    await this.adapter.resolveConflict(id, resolution);
  }

  // Media Cache Operations
  async addToMediaCache(entry: Omit<MediaCacheEntry, 'id'>): Promise<string> {
    return this.adapter.addToMediaCache(entry);
  }

  async getMediaCache(url: string): Promise<MediaCacheEntry | null> {
    const entry = await this.adapter.getMediaCache(url);
    
    if (entry) {
      // Update access count and last accessed time
      await this.adapter.updateMediaCache(entry.id, {
        accessCount: entry.accessCount + 1,
        lastAccessed: new Date()
      });
    }
    
    return entry;
  }

  async cleanupMediaCache(maxSizeMB: number = 500): Promise<void> {
    await this.adapter.cleanupMediaCache(maxSizeMB);
  }

  // Offline Session Management
  async createOfflineSession(session: Omit<OfflineSession, 'id'>): Promise<string> {
    return this.adapter.createOfflineSession(session);
  }

  async getOfflineSession(localSessionId: string): Promise<OfflineSession | null> {
    return this.adapter.getOfflineSession(localSessionId);
  }

  async updateOfflineSession(id: string, updates: Partial<OfflineSession>): Promise<void> {
    await this.adapter.updateOfflineSession(id, updates);
  }

  async getUnsyncedSessions(): Promise<OfflineSession[]> {
    return this.adapter.getUnsyncedSessions();
  }

  // Sync Status Management
  async updateSyncStatus(sessionId: string, status: Partial<SyncStatusInfo>): Promise<void> {
    await this.adapter.updateSyncStatus(sessionId, status);
    
    this.emitEvent({
      type: 'sync_progress',
      sessionId,
      data: status,
      timestamp: new Date()
    });
  }

  async getSyncStatus(sessionId: string): Promise<SyncStatusInfo | null> {
    return this.adapter.getSyncStatus(sessionId);
  }

  // Event Management
  addEventListener(eventType: string, listener: SyncEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  removeEventListener(eventType: string, listener: SyncEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(event: SyncEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
  }

  // Utility Methods
  private generateChecksum(data: any): string {
    // Simple checksum generation - in production, use a proper hash function
    return btoa(JSON.stringify(data)).slice(0, 16);
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('StorageManager not initialized. Call initialize() first.');
    }
  }

  // Health Check
  async getStorageHealth(): Promise<{
    isHealthy: boolean;
    pendingSyncOperations: number;
    unresolvedConflicts: number;
    cacheSize: number;
    unsyncedSessions: number;
  }> {
    const syncQueue = await this.getSyncQueue();
    const conflicts = await this.getConflicts();
    const unsyncedSessions = await this.getUnsyncedSessions();
    
    return {
      isHealthy: this.isInitialized && conflicts.length === 0,
      pendingSyncOperations: syncQueue.length,
      unresolvedConflicts: conflicts.filter(c => c.status === 'pending').length,
      cacheSize: 0, // TODO: Calculate actual cache size
      unsyncedSessions: unsyncedSessions.length
    };
  }
}

// Singleton instance
let storageManagerInstance: StorageManager | null = null;

export const getStorageManager = (config?: StorageConfig): StorageManager => {
  if (!storageManagerInstance && config) {
    storageManagerInstance = new StorageManager(config);
  }
  
  if (!storageManagerInstance) {
    throw new Error('StorageManager not initialized. Provide config on first call.');
  }
  
  return storageManagerInstance;
};

export const initializeStorage = async (config: StorageConfig): Promise<StorageManager> => {
  const manager = getStorageManager(config);
  await manager.initialize();
  return manager;
};
