import DataMigrationService, { MigrationProgress, MigrationResult } from './dataMigration';
import SyncEngine, { SyncStatus, SyncConflict } from './syncEngine';
import OfflineSyncManager, { OfflineQueueStatus } from './offlineSync';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase';

export interface MigrationStatus {
  isRequired: boolean;
  isCompleted: boolean;
  completedAt?: string;
  lastAttempt?: string;
  errors: string[];
}

export interface SystemStatus {
  migration: MigrationStatus;
  sync: SyncStatus;
  offline: OfflineQueueStatus;
}

class MigrationManager {
  private dataMigration: DataMigrationService;
  private syncEngine: SyncEngine;
  private offlineSync: OfflineSyncManager;
  private onStatusUpdate?: (status: SystemStatus) => void;

  constructor(onStatusUpdate?: (status: SystemStatus) => void) {
    this.onStatusUpdate = onStatusUpdate;
    
    // Initialize services
    this.dataMigration = new DataMigrationService(this.handleMigrationProgress.bind(this));
    this.syncEngine = new SyncEngine(this.handleSyncConflicts.bind(this));
    this.offlineSync = new OfflineSyncManager();
    
    this.initialize();
  }

  private async initialize() {
    // Load pending operations
    await this.syncEngine.loadPendingOperations();
    
    // Start periodic status updates
    setInterval(() => {
      this.updateSystemStatus();
    }, 30000); // Update every 30 seconds
  }

  private handleMigrationProgress(progress: MigrationProgress) {
    console.log(`Migration Progress: ${progress.step} - ${progress.progress}/${progress.total}`);
    this.updateSystemStatus();
  }

  private async handleSyncConflicts(conflicts: SyncConflict[]): Promise<SyncConflict[]> {
    // Simple conflict resolution: prefer local data
    // In a real app, you might want to show a UI for user to resolve conflicts
    return conflicts.map(conflict => ({
      ...conflict,
      localData: conflict.localData // Keep local changes
    }));
  }

  async checkMigrationRequired(): Promise<boolean> {
    try {
      // Check if user has local data that needs migration
      const localDataKeys = [
        'workout_sessions',
        'workout_history',
        'user_achievements',
        'measurements',
        'progress_photos',
        'social_posts'
      ];

      for (const key of localDataKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data && JSON.parse(data).length > 0) {
          // Check if migration was already completed
          const migrationStatus = await this.dataMigration.checkMigrationStatus();
          return !migrationStatus.completed;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking migration requirement:', error);
      return false;
    }
  }

  async performMigration(): Promise<MigrationResult> {
    try {
      // Record migration attempt
      await AsyncStorage.setItem('migration_last_attempt', new Date().toISOString());
      
      // Perform the migration
      const result = await this.dataMigration.migrateAllData();
      
      // Update status
      this.updateSystemStatus();
      
      return result;
    } catch (error) {
      console.error('Migration failed:', error);
      return {
        success: false,
        migratedData: {
          workouts: 0,
          achievements: 0,
          measurements: 0,
          photos: 0,
          social: 0
        },
        errors: [error instanceof Error ? error.message : 'Unknown migration error']
      };
    }
  }

  async getMigrationStatus(): Promise<MigrationStatus> {
    try {
      const migrationStatus = await this.dataMigration.checkMigrationStatus();
      const lastAttempt = await AsyncStorage.getItem('migration_last_attempt');
      const errors = await AsyncStorage.getItem('migration_errors');
      
      return {
        isRequired: await this.checkMigrationRequired(),
        isCompleted: migrationStatus.completed,
        completedAt: migrationStatus.date,
        lastAttempt: lastAttempt || undefined,
        errors: errors ? JSON.parse(errors) : []
      };
    } catch (error) {
      return {
        isRequired: false,
        isCompleted: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async getSystemStatus(): Promise<SystemStatus> {
    const [migrationStatus, syncStatus, offlineStatus] = await Promise.all([
      this.getMigrationStatus(),
      this.syncEngine.getSyncStatus(),
      this.offlineSync.getQueueStatus()
    ]);

    return {
      migration: migrationStatus,
      sync: syncStatus,
      offline: offlineStatus
    };
  }

  private async updateSystemStatus() {
    if (this.onStatusUpdate) {
      const status = await this.getSystemStatus();
      this.onStatusUpdate(status);
    }
  }

  async forceSync(): Promise<boolean> {
    return await this.syncEngine.performSync();
  }

  async clearAllData(): Promise<void> {
    // Clear local data
    await this.dataMigration.clearLocalData();
    
    // Clear pending operations
    await this.syncEngine.clearPendingOperations();
    await this.offlineSync.clearQueue();
    
    // Clear migration status
    await AsyncStorage.multiRemove([
      'migration_completed',
      'migration_date',
      'migration_last_attempt',
      'migration_errors'
    ]);
  }

  async resetMigration(): Promise<void> {
    await AsyncStorage.multiRemove([
      'migration_completed',
      'migration_date',
      'migration_last_attempt',
      'migration_errors'
    ]);
  }

  // Utility methods for app integration
  async addOfflineOperation(table: string, operation: 'insert' | 'update' | 'delete', data: any): Promise<void> {
    await this.syncEngine.addPendingOperation(table, operation, data);
    await this.offlineSync.addOperation({
      id: data.id || Date.now().toString(),
      table,
      operation,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3
    });
  }

  async validateDatabaseConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('exercises').select('id').limit(1);
      return !error;
    } catch (error) {
      return false;
    }
  }

  async getDataSummary(): Promise<{
    local: Record<string, number>;
    remote: Record<string, number>;
  }> {
    const localSummary: Record<string, number> = {};
    const remoteSummary: Record<string, number> = {};

    // Get local data counts
    const localKeys = [
      'workout_history',
      'user_achievements', 
      'measurements',
      'progress_photos',
      'social_posts'
    ];

    for (const key of localKeys) {
      try {
        const data = await AsyncStorage.getItem(key);
        localSummary[key] = data ? JSON.parse(data).length : 0;
      } catch (error) {
        localSummary[key] = 0;
      }
    }

    // Get remote data counts (if authenticated)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const tables = [
          'workout_sessions',
          'user_achievements',
          'user_measurements', 
          'progress_photos',
          'social_posts'
        ];

        for (const table of tables) {
          try {
            const { count } = await supabase
              .from(table)
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id);
            
            remoteSummary[table] = count || 0;
          } catch (error) {
            remoteSummary[table] = 0;
          }
        }
      }
    } catch (error) {
      console.error('Error getting remote data summary:', error);
    }

    return { local: localSummary, remote: remoteSummary };
  }

  // Backup and restore functionality
  async createBackup(): Promise<string> {
    try {
      const localKeys = [
        'workout_sessions',
        'workout_history',
        'user_achievements',
        'streaks',
        'measurements',
        'progress_photos',
        'social_posts'
      ];

      const backup: Record<string, any> = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {}
      };

      for (const key of localKeys) {
        const data = await AsyncStorage.getItem(key);
        backup.data[key] = data ? JSON.parse(data) : null;
      }

      const backupString = JSON.stringify(backup);
      
      // Store backup locally
      await AsyncStorage.setItem('data_backup', backupString);
      
      return backupString;
    } catch (error) {
      throw new Error(`Backup creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async restoreFromBackup(backupString: string): Promise<void> {
    try {
      const backup = JSON.parse(backupString);
      
      if (!backup.data || !backup.timestamp) {
        throw new Error('Invalid backup format');
      }

      // Restore each data type
      for (const [key, data] of Object.entries(backup.data)) {
        if (data) {
          await AsyncStorage.setItem(key, JSON.stringify(data));
        }
      }

      // Reset migration status to allow re-migration
      await this.resetMigration();
      
    } catch (error) {
      throw new Error(`Backup restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default MigrationManager;
