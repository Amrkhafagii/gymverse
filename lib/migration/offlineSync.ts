import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase';
import { syncEngine } from './syncEngine';

export interface SyncQueueItem {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  localId?: string;
  timestamp: number;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ConflictResolution {
  strategy: 'server_wins' | 'client_wins' | 'merge' | 'manual';
  resolver?: (serverData: any, clientData: any) => any;
}

class OfflineSync {
  private syncQueue: SyncQueueItem[] = [];
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private conflictResolvers: Map<string, ConflictResolution> = new Map();

  constructor() {
    this.initializeConflictResolvers();
    this.loadSyncQueue();
  }

  private initializeConflictResolvers() {
    // Workout sessions - prefer client data for active sessions
    this.conflictResolvers.set('workout_sessions', {
      strategy: 'merge',
      resolver: (serverData, clientData) => ({
        ...serverData,
        ...clientData,
        updated_at: new Date().toISOString(),
        // Preserve client data for active sessions
        is_active: clientData.is_active || serverData.is_active,
        current_exercise_index: clientData.current_exercise_index ?? serverData.current_exercise_index,
      })
    });

    // Exercise sets - merge with latest timestamps
    this.conflictResolvers.set('exercise_sets', {
      strategy: 'merge',
      resolver: (serverData, clientData) => ({
        ...serverData,
        ...clientData,
        // Keep the most recent completion data
        completed_at: clientData.completed_at || serverData.completed_at,
        actual_reps: clientData.actual_reps ?? serverData.actual_reps,
        actual_weight: clientData.actual_weight ?? serverData.actual_weight,
      })
    });

    // Measurements - client wins for recent entries
    this.conflictResolvers.set('measurements', {
      strategy: 'client_wins'
    });

    // Progress photos - client wins
    this.conflictResolvers.set('progress_photos', {
      strategy: 'client_wins'
    });

    // Achievements - merge unlock status
    this.conflictResolvers.set('user_achievements', {
      strategy: 'merge',
      resolver: (serverData, clientData) => ({
        ...serverData,
        ...clientData,
        unlocked_at: serverData.unlocked_at || clientData.unlocked_at,
        progress: Math.max(serverData.progress || 0, clientData.progress || 0),
      })
    });

    // Default resolver for other tables
    this.conflictResolvers.set('default', {
      strategy: 'server_wins'
    });
  }

  async addToSyncQueue(
    table: string,
    operation: 'insert' | 'update' | 'delete',
    data: any,
    priority: 'high' | 'medium' | 'low' = 'medium',
    localId?: string
  ) {
    const queueItem: SyncQueueItem = {
      id: `${table}_${operation}_${Date.now()}_${Math.random()}`,
      table,
      operation,
      data,
      localId,
      timestamp: Date.now(),
      retryCount: 0,
      priority
    };

    this.syncQueue.push(queueItem);
    await this.saveSyncQueue();

    // Try immediate sync if online
    if (this.isOnline && !this.syncInProgress) {
      this.processSyncQueue();
    }
  }

  async processSyncQueue() {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;

    try {
      // Sort by priority and timestamp
      const sortedQueue = this.syncQueue.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return a.timestamp - b.timestamp;
      });

      const processedItems: string[] = [];

      for (const item of sortedQueue) {
        try {
          await this.processSyncItem(item);
          processedItems.push(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          
          // Increment retry count
          item.retryCount++;
          
          // Remove item if max retries reached
          if (item.retryCount >= 3) {
            console.warn(`Max retries reached for item ${item.id}, removing from queue`);
            processedItems.push(item.id);
          }
        }
      }

      // Remove processed items from queue
      this.syncQueue = this.syncQueue.filter(item => !processedItems.includes(item.id));
      await this.saveSyncQueue();

    } finally {
      this.syncInProgress = false;
    }
  }

  private async processSyncItem(item: SyncQueueItem) {
    const { table, operation, data, localId } = item;

    switch (operation) {
      case 'insert':
        await this.handleInsert(table, data, localId);
        break;
      case 'update':
        await this.handleUpdate(table, data);
        break;
      case 'delete':
        await this.handleDelete(table, data.id);
        break;
    }
  }

  private async handleInsert(table: string, data: any, localId?: string) {
    try {
      const { data: insertedData, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      // Update local storage with server ID if we have a local ID
      if (localId && insertedData) {
        await this.updateLocalIdMapping(table, localId, insertedData.id);
      }

      return insertedData;
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        // Handle duplicate - try to update instead
        await this.handleUpdate(table, data);
      } else {
        throw error;
      }
    }
  }

  private async handleUpdate(table: string, data: any) {
    // Check for conflicts
    const { data: serverData, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('id', data.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // Not found is ok
      throw fetchError;
    }

    let finalData = data;

    // Resolve conflicts if server data exists
    if (serverData) {
      const resolver = this.conflictResolvers.get(table) || this.conflictResolvers.get('default')!;
      finalData = this.resolveConflict(serverData, data, resolver);
    }

    const { error } = await supabase
      .from(table)
      .upsert(finalData);

    if (error) throw error;
  }

  private async handleDelete(table: string, id: string) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error && error.code !== 'PGRST116') { // Ignore not found
      throw error;
    }
  }

  private resolveConflict(serverData: any, clientData: any, resolution: ConflictResolution): any {
    switch (resolution.strategy) {
      case 'server_wins':
        return serverData;
      case 'client_wins':
        return clientData;
      case 'merge':
        return resolution.resolver ? resolution.resolver(serverData, clientData) : { ...serverData, ...clientData };
      case 'manual':
        // For now, default to merge - in a real app, you'd show a UI for manual resolution
        return { ...serverData, ...clientData };
      default:
        return serverData;
    }
  }

  private async updateLocalIdMapping(table: string, localId: string, serverId: string) {
    const mappingKey = `id_mapping_${table}`;
    const existingMappings = await AsyncStorage.getItem(mappingKey);
    const mappings = existingMappings ? JSON.parse(existingMappings) : {};
    
    mappings[localId] = serverId;
    await AsyncStorage.setItem(mappingKey, JSON.stringify(mappings));
  }

  async getServerIdForLocalId(table: string, localId: string): Promise<string | null> {
    const mappingKey = `id_mapping_${table}`;
    const existingMappings = await AsyncStorage.getItem(mappingKey);
    const mappings = existingMappings ? JSON.parse(existingMappings) : {};
    
    return mappings[localId] || null;
  }

  private async saveSyncQueue() {
    await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
  }

  private async loadSyncQueue() {
    try {
      const queueData = await AsyncStorage.getItem('sync_queue');
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  setOnlineStatus(isOnline: boolean) {
    const wasOffline = !this.isOnline;
    this.isOnline = isOnline;

    // If we just came back online, process the queue
    if (wasOffline && isOnline && this.syncQueue.length > 0) {
      this.processSyncQueue();
    }
  }

  async clearSyncQueue() {
    this.syncQueue = [];
    await this.saveSyncQueue();
  }

  getSyncQueueStatus() {
    return {
      queueLength: this.syncQueue.length,
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      highPriorityItems: this.syncQueue.filter(item => item.priority === 'high').length,
      failedItems: this.syncQueue.filter(item => item.retryCount > 0).length,
    };
  }

  // Batch sync for better performance
  async batchSync(items: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>[]) {
    const batchItems = items.map(item => ({
      ...item,
      id: `batch_${item.table}_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      retryCount: 0,
    }));

    this.syncQueue.push(...batchItems);
    await this.saveSyncQueue();

    if (this.isOnline && !this.syncInProgress) {
      this.processSyncQueue();
    }
  }

  // Force sync specific table
  async forceSyncTable(table: string) {
    const tableItems = this.syncQueue.filter(item => item.table === table);
    
    for (const item of tableItems) {
      try {
        await this.processSyncItem(item);
        this.syncQueue = this.syncQueue.filter(queueItem => queueItem.id !== item.id);
      } catch (error) {
        console.error(`Failed to force sync item ${item.id}:`, error);
      }
    }

    await this.saveSyncQueue();
  }
}

export const offlineSync = new OfflineSync();
