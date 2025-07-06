/**
 * Background sync scheduler
 * Manages automatic sync triggers and scheduling
 */

import { Platform } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { SyncEngine } from './SyncEngine';
import { StorageManager } from '../storage/StorageManager';

const BACKGROUND_SYNC_TASK = 'background-sync';

export interface SyncSchedulerConfig {
  backgroundSyncInterval: number; // in seconds
  foregroundSyncInterval: number; // in seconds
  wifiOnlySync: boolean;
  batteryOptimized: boolean;
  maxBackgroundTime: number; // in seconds
}

export class SyncScheduler {
  private syncEngine: SyncEngine;
  private storageManager: StorageManager;
  private config: SyncSchedulerConfig;
  private foregroundInterval: NodeJS.Timeout | null = null;
  private isBackgroundRegistered = false;
  private appStateListener: any = null;

  constructor(
    syncEngine: SyncEngine,
    storageManager: StorageManager,
    config: Partial<SyncSchedulerConfig> = {}
  ) {
    this.syncEngine = syncEngine;
    this.storageManager = storageManager;
    this.config = {
      backgroundSyncInterval: 900, // 15 minutes
      foregroundSyncInterval: 30, // 30 seconds
      wifiOnlySync: false,
      batteryOptimized: true,
      maxBackgroundTime: 25, // 25 seconds (iOS limit is 30)
      ...config
    };

    this.initializeTaskManager();
  }

  private initializeTaskManager(): void {
    if (Platform.OS === 'web') return;

    // Define background task
    TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
      try {
        console.log('Background sync task started');
        
        const startTime = Date.now();
        const maxTime = this.config.maxBackgroundTime * 1000;

        // Check if we should sync (network conditions, battery, etc.)
        if (!(await this.shouldPerformBackgroundSync())) {
          console.log('Background sync skipped due to conditions');
          return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // Start sync with timeout
        const syncPromise = this.performBackgroundSync();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Background sync timeout')), maxTime)
        );

        await Promise.race([syncPromise, timeoutPromise]);

        const duration = Date.now() - startTime;
        console.log(`Background sync completed in ${duration}ms`);

        return BackgroundFetch.BackgroundFetchResult.NewData;
      } catch (error) {
        console.error('Background sync failed:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });
  }

  async start(): Promise<void> {
    // Start foreground sync
    await this.startForegroundSync();

    // Register background sync (mobile only)
    if (Platform.OS !== 'web') {
      await this.registerBackgroundSync();
    }

    // Listen for app state changes
    this.setupAppStateListener();
  }

  async stop(): Promise<void> {
    // Stop foreground sync
    if (this.foregroundInterval) {
      clearInterval(this.foregroundInterval);
      this.foregroundInterval = null;
    }

    // Unregister background sync
    if (this.isBackgroundRegistered && Platform.OS !== 'web') {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
      this.isBackgroundRegistered = false;
    }

    // Remove app state listener
    if (this.appStateListener) {
      this.appStateListener.remove();
      this.appStateListener = null;
    }
  }

  private async startForegroundSync(): Promise<void> {
    if (this.foregroundInterval) return;

    this.foregroundInterval = setInterval(async () => {
      try {
        if (await this.shouldPerformForegroundSync()) {
          await this.syncEngine.forcSync();
        }
      } catch (error) {
        console.error('Foreground sync error:', error);
      }
    }, this.config.foregroundSyncInterval * 1000);
  }

  private async registerBackgroundSync(): Promise<void> {
    if (this.isBackgroundRegistered) return;

    try {
      // Check if background fetch is available
      const status = await BackgroundFetch.getStatusAsync();
      if (status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
        console.warn('Background fetch is restricted');
        return;
      }

      // Register background task
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: this.config.backgroundSyncInterval,
        stopOnTerminate: false,
        startOnBoot: true,
      });

      this.isBackgroundRegistered = true;
      console.log('Background sync registered');
    } catch (error) {
      console.error('Failed to register background sync:', error);
    }
  }

  private setupAppStateListener(): void {
    if (Platform.OS === 'web') return;

    const { AppState } = require('react-native');
    
    this.appStateListener = AppState.addEventListener('change', (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App became active, trigger immediate sync
        this.syncEngine.forcSync().catch(error => {
          console.error('App activation sync failed:', error);
        });
      }
    });
  }

  private async shouldPerformForegroundSync(): Promise<boolean> {
    // Check if there are pending operations
    const pendingCount = await this.syncEngine.getPendingOperationsCount();
    if (pendingCount === 0) return false;

    // Check network conditions
    if (this.config.wifiOnlySync) {
      // TODO: Implement WiFi-only check
      // For now, assume any connection is acceptable
    }

    return true;
  }

  private async shouldPerformBackgroundSync(): Promise<boolean> {
    // Check if there are pending operations
    const pendingCount = await this.syncEngine.getPendingOperationsCount();
    if (pendingCount === 0) return false;

    // Check battery optimization settings
    if (this.config.batteryOptimized) {
      // TODO: Implement battery level check
      // For now, assume battery is sufficient
    }

    // Check network conditions
    if (this.config.wifiOnlySync) {
      // TODO: Implement WiFi-only check
    }

    return true;
  }

  private async performBackgroundSync(): Promise<void> {
    // Get high-priority operations only for background sync
    const operations = await this.storageManager.getSyncQueue(1); // High priority only
    
    if (operations.length === 0) return;

    // Process a limited number of operations in background
    const maxOperations = Math.min(operations.length, 5);
    console.log(`Processing ${maxOperations} high-priority operations in background`);

    // Use a shorter timeout for background operations
    const originalConfig = { ...this.syncEngine['config'] };
    this.syncEngine['config'].maxConcurrentOperations = 2;
    this.syncEngine['config'].batchSize = 3;

    try {
      await this.syncEngine.forcSync();
    } finally {
      // Restore original config
      this.syncEngine['config'] = originalConfig;
    }
  }

  // Manual sync triggers
  async triggerImmediateSync(): Promise<void> {
    await this.syncEngine.forcSync();
  }

  async triggerHighPrioritySync(): Promise<void> {
    // Process only high-priority operations
    const operations = await this.storageManager.getSyncQueue(1);
    if (operations.length > 0) {
      await this.syncEngine.forcSync();
    }
  }

  // Configuration updates
  updateConfig(newConfig: Partial<SyncSchedulerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart with new config
    this.stop().then(() => this.start()).catch(error => {
      console.error('Failed to restart sync scheduler with new config:', error);
    });
  }

  // Status and monitoring
  async getSyncSchedulerStatus(): Promise<{
    foregroundSyncActive: boolean;
    backgroundSyncRegistered: boolean;
    nextBackgroundSync?: Date;
    pendingOperations: number;
    lastSyncTime?: Date;
  }> {
    const pendingOperations = await this.syncEngine.getPendingOperationsCount();
    const syncStatus = await this.syncEngine.getSyncStatus();

    return {
      foregroundSyncActive: this.foregroundInterval !== null,
      backgroundSyncRegistered: this.isBackgroundRegistered,
      pendingOperations,
      lastSyncTime: syncStatus?.lastActivity
    };
  }
}
