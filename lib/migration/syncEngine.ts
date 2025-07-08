import { supabase } from '../supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: string | null;
  pendingChanges: number;
  syncInProgress: boolean;
}

export interface SyncConflict {
  id: string;
  table: string;
  localData: any;
  remoteData: any;
  conflictType: 'update' | 'delete';
}

class SyncEngine {
  private syncInProgress = false;
  private pendingOperations: Map<string, any[]> = new Map();
  private conflictResolver?: (conflicts: SyncConflict[]) => Promise<SyncConflict[]>;

  constructor(conflictResolver?: (conflicts: SyncConflict[]) => Promise<SyncConflict[]>) {
    this.conflictResolver = conflictResolver;
    this.initializeSync();
  }

  private async initializeSync() {
    // Listen for network changes
    NetInfo.addEventListener(state => {
      if (state.isConnected && !this.syncInProgress) {
        this.performSync();
      }
    });

    // Set up periodic sync
    setInterval(() => {
      if (!this.syncInProgress) {
        this.performSync();
      }
    }, 5 * 60 * 1000); // Sync every 5 minutes
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const netInfo = await NetInfo.fetch();
    const lastSync = await AsyncStorage.getItem('last_sync_timestamp');
    const pendingChanges = await this.getPendingChangesCount();

    return {
      isOnline: netInfo.isConnected || false,
      lastSync,
      pendingChanges,
      syncInProgress: this.syncInProgress
    };
  }

  async performSync(): Promise<boolean> {
    if (this.syncInProgress) {
      return false;
    }

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return false;
    }

    this.syncInProgress = true;

    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Sync in order: upload local changes, then download remote changes
      await this.uploadLocalChanges(user.id);
      await this.downloadRemoteChanges(user.id);

      // Update last sync timestamp
      await AsyncStorage.setItem('last_sync_timestamp', new Date().toISOString());

      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  private async uploadLocalChanges(userId: string): Promise<void> {
    const tables = [
      'workout_sessions',
      'user_measurements', 
      'progress_photos',
      'social_posts',
      'user_achievements'
    ];

    for (const table of tables) {
      const pendingChanges = this.pendingOperations.get(table) || [];
      
      for (const change of pendingChanges) {
        try {
          await this.uploadChange(table, change, userId);
          // Remove from pending after successful upload
          this.removePendingOperation(table, change.id);
        } catch (error) {
          console.error(`Failed to upload change for ${table}:`, error);
          // Keep in pending for retry
        }
      }
    }
  }

  private async downloadRemoteChanges(userId: string): Promise<void> {
    const lastSync = await AsyncStorage.getItem('last_sync_timestamp');
    const syncTimestamp = lastSync ? new Date(lastSync) : new Date(0);

    // Download changes for each table
    await this.downloadTableChanges('workout_sessions', userId, syncTimestamp);
    await this.downloadTableChanges('user_measurements', userId, syncTimestamp);
    await this.downloadTableChanges('progress_photos', userId, syncTimestamp);
    await this.downloadTableChanges('social_posts', userId, syncTimestamp);
    await this.downloadTableChanges('user_achievements', userId, syncTimestamp);
  }

  private async downloadTableChanges(table: string, userId: string, since: Date): Promise<void> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .gte('updated_at', since.toISOString());

      if (error) throw error;

      if (data && data.length > 0) {
        await this.mergeRemoteChanges(table, data);
      }
    } catch (error) {
      console.error(`Failed to download changes for ${table}:`, error);
    }
  }

  private async mergeRemoteChanges(table: string, remoteData: any[]): Promise<void> {
    const localKey = this.getLocalStorageKey(table);
    const localDataStr = await AsyncStorage.getItem(localKey);
    const localData = localDataStr ? JSON.parse(localDataStr) : [];

    const mergedData = [...localData];
    const conflicts: SyncConflict[] = [];

    for (const remoteItem of remoteData) {
      const localIndex = mergedData.findIndex(item => item.id === remoteItem.id);
      
      if (localIndex === -1) {
        // New remote item, add it
        mergedData.push(remoteItem);
      } else {
        const localItem = mergedData[localIndex];
        const localUpdated = new Date(localItem.updated_at || localItem.created_at);
        const remoteUpdated = new Date(remoteItem.updated_at || remoteItem.created_at);

        if (remoteUpdated > localUpdated) {
          // Remote is newer, use remote data
          mergedData[localIndex] = remoteItem;
        } else if (localUpdated > remoteUpdated) {
          // Local is newer, check for conflicts
          if (this.hasConflict(localItem, remoteItem)) {
            conflicts.push({
              id: remoteItem.id,
              table,
              localData: localItem,
              remoteData: remoteItem,
              conflictType: 'update'
            });
          }
        }
      }
    }

    // Handle conflicts if resolver is provided
    if (conflicts.length > 0 && this.conflictResolver) {
      const resolvedConflicts = await this.conflictResolver(conflicts);
      
      for (const conflict of resolvedConflicts) {
        const index = mergedData.findIndex(item => item.id === conflict.id);
        if (index !== -1) {
          mergedData[index] = conflict.localData; // Use resolved data
        }
      }
    }

    // Save merged data back to local storage
    await AsyncStorage.setItem(localKey, JSON.stringify(mergedData));
  }

  private hasConflict(localItem: any, remoteItem: any): boolean {
    // Simple conflict detection - check if both have been modified
    const localModified = localItem.updated_at || localItem.created_at;
    const remoteModified = remoteItem.updated_at || remoteItem.created_at;
    
    return Math.abs(new Date(localModified).getTime() - new Date(remoteModified).getTime()) < 1000;
  }

  private async uploadChange(table: string, change: any, userId: string): Promise<void> {
    const { operation, data } = change;

    switch (operation) {
      case 'insert':
        await supabase.from(table).insert({ ...data, user_id: userId });
        break;
      case 'update':
        await supabase.from(table).update(data).eq('id', data.id).eq('user_id', userId);
        break;
      case 'delete':
        await supabase.from(table).delete().eq('id', data.id).eq('user_id', userId);
        break;
    }
  }

  async addPendingOperation(table: string, operation: 'insert' | 'update' | 'delete', data: any): Promise<void> {
    const pending = this.pendingOperations.get(table) || [];
    pending.push({
      id: data.id || Date.now().toString(),
      operation,
      data,
      timestamp: new Date().toISOString()
    });
    
    this.pendingOperations.set(table, pending);
    
    // Persist pending operations
    await AsyncStorage.setItem(
      `pending_operations_${table}`,
      JSON.stringify(pending)
    );

    // Try to sync immediately if online
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected && !this.syncInProgress) {
      this.performSync();
    }
  }

  private removePendingOperation(table: string, operationId: string): void {
    const pending = this.pendingOperations.get(table) || [];
    const filtered = pending.filter(op => op.id !== operationId);
    this.pendingOperations.set(table, filtered);
    
    // Persist updated pending operations
    AsyncStorage.setItem(
      `pending_operations_${table}`,
      JSON.stringify(filtered)
    );
  }

  private async getPendingChangesCount(): Promise<number> {
    let total = 0;
    for (const operations of this.pendingOperations.values()) {
      total += operations.length;
    }
    return total;
  }

  private getLocalStorageKey(table: string): string {
    const keyMap: Record<string, string> = {
      'workout_sessions': 'workout_history',
      'user_measurements': 'measurements',
      'progress_photos': 'progress_photos',
      'social_posts': 'social_posts',
      'user_achievements': 'user_achievements'
    };
    
    return keyMap[table] || table;
  }

  async loadPendingOperations(): Promise<void> {
    const tables = [
      'workout_sessions',
      'user_measurements',
      'progress_photos', 
      'social_posts',
      'user_achievements'
    ];

    for (const table of tables) {
      try {
        const pendingStr = await AsyncStorage.getItem(`pending_operations_${table}`);
        if (pendingStr) {
          const pending = JSON.parse(pendingStr);
          this.pendingOperations.set(table, pending);
        }
      } catch (error) {
        console.error(`Failed to load pending operations for ${table}:`, error);
      }
    }
  }

  async clearPendingOperations(): Promise<void> {
    this.pendingOperations.clear();
    
    const tables = [
      'workout_sessions',
      'user_measurements',
      'progress_photos',
      'social_posts', 
      'user_achievements'
    ];

    for (const table of tables) {
      await AsyncStorage.removeItem(`pending_operations_${table}`);
    }
  }

  async forcePullFromRemote(userId: string): Promise<void> {
    // Clear local data and download everything from remote
    await this.clearLocalData();
    await this.downloadRemoteChanges(userId);
  }

  private async clearLocalData(): Promise<void> {
    const keys = [
      'workout_history',
      'measurements',
      'progress_photos',
      'social_posts',
      'user_achievements'
    ];

    await AsyncStorage.multiRemove(keys);
  }
}

export default SyncEngine;
