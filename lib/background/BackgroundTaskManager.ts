/**
 * Cross-platform background task management
 * Handles background sync, media downloads, and data processing
 */

import { Platform } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Network from 'expo-network';
import { SyncEngine } from '../sync/SyncEngine';
import { MediaCacheManager } from '../media/MediaCacheManager';
import { StorageManager } from '../storage/StorageManager';

// Task identifiers
const BACKGROUND_SYNC_TASK = 'background-sync';
const MEDIA_PRELOAD_TASK = 'media-preload';
const CACHE_CLEANUP_TASK = 'cache-cleanup';
const DATA_BACKUP_TASK = 'data-backup';

export interface BackgroundTaskConfig {
  syncInterval: number; // seconds
  mediaPreloadInterval: number; // seconds
  cacheCleanupInterval: number; // seconds
  dataBackupInterval: number; // seconds
  maxBackgroundTime: number; // seconds
  wifiOnlyTasks: string[];
  batteryOptimizedTasks: string[];
}

export interface TaskExecutionResult {
  taskName: string;
  success: boolean;
  duration: number;
  error?: string;
  dataProcessed?: number;
}

export class BackgroundTaskManager {
  private syncEngine: SyncEngine;
  private mediaCacheManager: MediaCacheManager;
  private storageManager: StorageManager;
  private config: BackgroundTaskConfig;
  private registeredTasks: Set<string> = new Set();
  private taskHistory: TaskExecutionResult[] = [];
  private isInitialized = false;

  constructor(
    syncEngine: SyncEngine,
    mediaCacheManager: MediaCacheManager,
    storageManager: StorageManager,
    config: Partial<BackgroundTaskConfig> = {}
  ) {
    this.syncEngine = syncEngine;
    this.mediaCacheManager = mediaCacheManager;
    this.storageManager = storageManager;
    this.config = {
      syncInterval: 900, // 15 minutes
      mediaPreloadInterval: 1800, // 30 minutes
      cacheCleanupInterval: 3600, // 1 hour
      dataBackupInterval: 7200, // 2 hours
      maxBackgroundTime: 25, // 25 seconds (iOS limit is 30)
      wifiOnlyTasks: [MEDIA_PRELOAD_TASK, DATA_BACKUP_TASK],
      batteryOptimizedTasks: [CACHE_CLEANUP_TASK, DATA_BACKUP_TASK],
      ...config
    };

    this.initializeTaskDefinitions();
  }

  private initializeTaskDefinitions(): void {
    if (Platform.OS === 'web') return;

    // Background Sync Task
    TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
      return await this.executeTask(BACKGROUND_SYNC_TASK, async () => {
        console.log('🔄 Background sync started');
        
        if (!await this.shouldExecuteTask(BACKGROUND_SYNC_TASK)) {
          return { skipped: true, reason: 'Conditions not met' };
        }

        // Get high-priority operations only
        const pendingCount = await this.syncEngine.getPendingOperationsCount();
        if (pendingCount === 0) {
          return { skipped: true, reason: 'No pending operations' };
        }

        // Execute sync with timeout
        await Promise.race([
          this.syncEngine.forcSync(),
          this.createTimeout(this.config.maxBackgroundTime * 1000)
        ]);

        return { processed: pendingCount };
      });
    });

    // Media Preload Task
    TaskManager.defineTask(MEDIA_PRELOAD_TASK, async () => {
      return await this.executeTask(MEDIA_PRELOAD_TASK, async () => {
        console.log('📱 Media preload started');
        
        if (!await this.shouldExecuteTask(MEDIA_PRELOAD_TASK)) {
          return { skipped: true, reason: 'Conditions not met' };
        }

        // Get media URLs that need preloading
        const mediaUrls = await this.getMediaUrlsForPreload();
        if (mediaUrls.length === 0) {
          return { skipped: true, reason: 'No media to preload' };
        }

        // Preload with timeout
        await Promise.race([
          this.mediaCacheManager.preloadMedia(mediaUrls.slice(0, 5), 3), // Low priority, max 5 items
          this.createTimeout(this.config.maxBackgroundTime * 1000)
        ]);

        return { processed: Math.min(mediaUrls.length, 5) };
      });
    });

    // Cache Cleanup Task
    TaskManager.defineTask(CACHE_CLEANUP_TASK, async () => {
      return await this.executeTask(CACHE_CLEANUP_TASK, async () => {
        console.log('🧹 Cache cleanup started');
        
        if (!await this.shouldExecuteTask(CACHE_CLEANUP_TASK)) {
          return { skipped: true, reason: 'Conditions not met' };
        }

        const statsBefore = await this.mediaCacheManager.getCacheStats();
        
        await Promise.race([
          this.mediaCacheManager.optimizeCache(),
          this.createTimeout(this.config.maxBackgroundTime * 1000)
        ]);

        const statsAfter = await this.mediaCacheManager.getCacheStats();
        const cleanedFiles = statsBefore.totalFiles - statsAfter.totalFiles;

        return { processed: cleanedFiles };
      });
    });

    // Data Backup Task
    TaskManager.defineTask(DATA_BACKUP_TASK, async () => {
      return await this.executeTask(DATA_BACKUP_TASK, async () => {
        console.log('💾 Data backup started');
        
        if (!await this.shouldExecuteTask(DATA_BACKUP_TASK)) {
          return { skipped: true, reason: 'Conditions not met' };
        }

        // Create local backup of critical data
        const backupResult = await this.createDataBackup();
        
        return { processed: backupResult.itemsBackedUp };
      });
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized || Platform.OS === 'web') return;

    try {
      // Check background fetch status
      const status = await BackgroundFetch.getStatusAsync();
      if (status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
        console.warn('⚠️ Background fetch is restricted');
        return;
      }

      console.log('🚀 Initializing background tasks...');
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Background task initialization failed:', error);
      throw error;
    }
  }

  async registerAllTasks(): Promise<void> {
    if (Platform.OS === 'web') return;

    const tasks = [
      { name: BACKGROUND_SYNC_TASK, interval: this.config.syncInterval },
      { name: MEDIA_PRELOAD_TASK, interval: this.config.mediaPreloadInterval },
      { name: CACHE_CLEANUP_TASK, interval: this.config.cacheCleanupInterval },
      { name: DATA_BACKUP_TASK, interval: this.config.dataBackupInterval }
    ];

    for (const task of tasks) {
      await this.registerTask(task.name, task.interval);
    }
  }

  async registerTask(taskName: string, intervalSeconds: number): Promise<void> {
    if (Platform.OS === 'web' || this.registeredTasks.has(taskName)) return;

    try {
      await BackgroundFetch.registerTaskAsync(taskName, {
        minimumInterval: intervalSeconds,
        stopOnTerminate: false,
        startOnBoot: true,
      });

      this.registeredTasks.add(taskName);
      console.log(`✅ Registered background task: ${taskName} (${intervalSeconds}s interval)`);
    } catch (error) {
      console.error(`❌ Failed to register task ${taskName}:`, error);
    }
  }

  async unregisterTask(taskName: string): Promise<void> {
    if (Platform.OS === 'web' || !this.registeredTasks.has(taskName)) return;

    try {
      await BackgroundFetch.unregisterTaskAsync(taskName);
      this.registeredTasks.delete(taskName);
      console.log(`🗑️ Unregistered background task: ${taskName}`);
    } catch (error) {
      console.error(`❌ Failed to unregister task ${taskName}:`, error);
    }
  }

  async unregisterAllTasks(): Promise<void> {
    const tasks = Array.from(this.registeredTasks);
    for (const taskName of tasks) {
      await this.unregisterTask(taskName);
    }
  }

  private async executeTask(
    taskName: string, 
    taskFunction: () => Promise<any>
  ): Promise<BackgroundFetch.BackgroundFetchResult> {
    const startTime = Date.now();
    
    try {
      console.log(`⏱️ Executing ${taskName}...`);
      
      const result = await taskFunction();
      const duration = Date.now() - startTime;
      
      const executionResult: TaskExecutionResult = {
        taskName,
        success: true,
        duration,
        dataProcessed: result.processed || 0
      };

      this.recordTaskExecution(executionResult);

      if (result.skipped) {
        console.log(`⏭️ ${taskName} skipped: ${result.reason}`);
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      console.log(`✅ ${taskName} completed in ${duration}ms, processed: ${result.processed || 0}`);
      return BackgroundFetch.BackgroundFetchResult.NewData;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      const executionResult: TaskExecutionResult = {
        taskName,
        success: false,
        duration,
        error: error.message
      };

      this.recordTaskExecution(executionResult);
      
      console.error(`❌ ${taskName} failed after ${duration}ms:`, error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  }

  private async shouldExecuteTask(taskName: string): Promise<boolean> {
    // Check network conditions for WiFi-only tasks
    if (this.config.wifiOnlyTasks.includes(taskName)) {
      const networkState = await Network.getNetworkStateAsync();
      if (networkState.type !== Network.NetworkStateType.WIFI) {
        console.log(`📶 ${taskName} requires WiFi, current: ${networkState.type}`);
        return false;
      }
    }

    // Check battery conditions for battery-optimized tasks
    if (this.config.batteryOptimizedTasks.includes(taskName)) {
      // TODO: Implement battery level check
      // For now, assume battery is sufficient
    }

    // Check if device is online for network-dependent tasks
    if ([BACKGROUND_SYNC_TASK, MEDIA_PRELOAD_TASK, DATA_BACKUP_TASK].includes(taskName)) {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        console.log(`🌐 ${taskName} requires network connection`);
        return false;
      }
    }

    return true;
  }

  private async getMediaUrlsForPreload(): Promise<string[]> {
    // Get recent workout images and progress photos that aren't cached
    try {
      // This would query the database for recent media URLs
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      console.error('Error getting media URLs for preload:', error);
      return [];
    }
  }

  private async createDataBackup(): Promise<{ itemsBackedUp: number }> {
    try {
      // Create backup of critical offline data
      const workouts = await this.storageManager.list('workout', { limit: 50 });
      const measurements = await this.storageManager.list('measurement', { limit: 100 });
      const progressPhotos = await this.storageManager.list('progress_photo', { limit: 20 });

      const backupData = {
        timestamp: new Date().toISOString(),
        workouts,
        measurements,
        progressPhotos,
        version: '1.0'
      };

      // Store backup locally (could also upload to cloud storage)
      const backupPath = `${require('expo-file-system').documentDirectory}backup_${Date.now()}.json`;
      await require('expo-file-system').writeAsStringAsync(
        backupPath, 
        JSON.stringify(backupData)
      );

      const totalItems = workouts.length + measurements.length + progressPhotos.length;
      console.log(`💾 Backup created: ${totalItems} items`);

      return { itemsBackedUp: totalItems };
    } catch (error) {
      console.error('Data backup failed:', error);
      return { itemsBackedUp: 0 };
    }
  }

  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Task timeout')), ms)
    );
  }

  private recordTaskExecution(result: TaskExecutionResult): void {
    this.taskHistory.push(result);
    
    // Keep only recent history to prevent memory leaks
    if (this.taskHistory.length > 100) {
      this.taskHistory.splice(0, this.taskHistory.length - 100);
    }
  }

  // Public API for monitoring
  getTaskHistory(taskName?: string): TaskExecutionResult[] {
    if (taskName) {
      return this.taskHistory.filter(result => result.taskName === taskName);
    }
    return [...this.taskHistory];
  }

  getTaskStatistics(): {
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
    taskBreakdown: Record<string, { executions: number; successRate: number }>;
  } {
    if (this.taskHistory.length === 0) {
      return {
        totalExecutions: 0,
        successRate: 0,
        averageDuration: 0,
        taskBreakdown: {}
      };
    }

    const totalExecutions = this.taskHistory.length;
    const successfulExecutions = this.taskHistory.filter(r => r.success).length;
    const successRate = successfulExecutions / totalExecutions;
    const averageDuration = this.taskHistory.reduce((sum, r) => sum + r.duration, 0) / totalExecutions;

    const taskBreakdown: Record<string, { executions: number; successRate: number }> = {};
    
    for (const result of this.taskHistory) {
      if (!taskBreakdown[result.taskName]) {
        taskBreakdown[result.taskName] = { executions: 0, successRate: 0 };
      }
      taskBreakdown[result.taskName].executions++;
    }

    for (const taskName of Object.keys(taskBreakdown)) {
      const taskResults = this.taskHistory.filter(r => r.taskName === taskName);
      const taskSuccesses = taskResults.filter(r => r.success).length;
      taskBreakdown[taskName].successRate = taskSuccesses / taskResults.length;
    }

    return {
      totalExecutions,
      successRate,
      averageDuration,
      taskBreakdown
    };
  }

  async getBackgroundFetchStatus(): Promise<{
    status: string;
    registeredTasks: string[];
    lastExecution?: Date;
  }> {
    if (Platform.OS === 'web') {
      return {
        status: 'not_supported',
        registeredTasks: []
      };
    }

    try {
      const status = await BackgroundFetch.getStatusAsync();
      const statusMap = {
        [BackgroundFetch.BackgroundFetchStatus.Restricted]: 'restricted',
        [BackgroundFetch.BackgroundFetchStatus.Denied]: 'denied',
        [BackgroundFetch.BackgroundFetchStatus.Available]: 'available'
      };

      const lastExecution = this.taskHistory.length > 0 
        ? new Date(Math.max(...this.taskHistory.map(r => Date.now() - r.duration)))
        : undefined;

      return {
        status: statusMap[status] || 'unknown',
        registeredTasks: Array.from(this.registeredTasks),
        lastExecution
      };
    } catch (error) {
      return {
        status: 'error',
        registeredTasks: Array.from(this.registeredTasks)
      };
    }
  }

  // Manual task triggers for testing
  async triggerTask(taskName: string): Promise<TaskExecutionResult> {
    if (!this.registeredTasks.has(taskName)) {
      throw new Error(`Task ${taskName} is not registered`);
    }

    console.log(`🔧 Manually triggering ${taskName}...`);
    
    // This would typically use TaskManager.executeTaskAsync in a real implementation
    // For now, we'll simulate the execution
    const startTime = Date.now();
    
    try {
      // Simulate task execution based on task type
      let processed = 0;
      switch (taskName) {
        case BACKGROUND_SYNC_TASK:
          processed = await this.syncEngine.getPendingOperationsCount();
          await this.syncEngine.forcSync();
          break;
        case CACHE_CLEANUP_TASK:
          await this.mediaCacheManager.optimizeCache();
          processed = 1;
          break;
        default:
          processed = 1;
      }

      const result: TaskExecutionResult = {
        taskName,
        success: true,
        duration: Date.now() - startTime,
        dataProcessed: processed
      };

      this.recordTaskExecution(result);
      return result;
    } catch (error) {
      const result: TaskExecutionResult = {
        taskName,
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      };

      this.recordTaskExecution(result);
      return result;
    }
  }
}
