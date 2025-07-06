/**
 * Sync system exports
 * Main entry point for sync functionality
 */

export { SyncEngine } from './SyncEngine';
export { ConflictResolver } from './ConflictResolver';
export { NetworkManager } from './NetworkManager';
export { RetryManager } from './RetryManager';
export { SyncScheduler } from './SyncScheduler';

export type {
  SyncEngineConfig,
  ConflictResolutionResult,
  ConflictResolutionStrategy,
  NetworkResponse,
  NetworkConfig,
  RetryConfig,
  RetryAttempt,
  SyncSchedulerConfig
} from './SyncEngine';

// Convenience factory function
export async function createSyncSystem(config: {
  storage: any; // StorageManager instance
  supabaseUrl: string;
  supabaseKey: string;
  syncConfig?: Partial<any>;
  networkConfig?: Partial<any>;
  schedulerConfig?: Partial<any>;
}) {
  const { NetworkManager } = await import('./NetworkManager');
  const { SyncEngine } = await import('./SyncEngine');
  const { SyncScheduler } = await import('./SyncScheduler');

  const networkManager = new NetworkManager({
    supabaseUrl: config.supabaseUrl,
    supabaseKey: config.supabaseKey,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    ...config.networkConfig
  });

  const syncEngine = new SyncEngine(
    config.storage,
    networkManager,
    config.syncConfig
  );

  const syncScheduler = new SyncScheduler(
    syncEngine,
    config.storage,
    config.schedulerConfig
  );

  return {
    networkManager,
    syncEngine,
    syncScheduler,
    async start() {
      await syncEngine.start();
      await syncScheduler.start();
    },
    async stop() {
      await syncScheduler.stop();
      await syncEngine.stop();
    }
  };
}
