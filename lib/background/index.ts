/**
 * Background processing exports
 * Main entry point for background task functionality
 */

export { BackgroundTaskManager } from './BackgroundTaskManager';
export { PlatformOptimizer, getPlatformOptimizer } from './PlatformOptimizer';

export type {
  BackgroundTaskConfig,
  TaskExecutionResult,
  PlatformCapabilities,
  OptimizationRecommendations
} from './BackgroundTaskManager';

// Convenience factory function
export async function createBackgroundSystem(config: {
  syncEngine: any;
  mediaCacheManager: any;
  storageManager: any;
  taskConfig?: Partial<any>;
}) {
  const { BackgroundTaskManager } = await import('./BackgroundTaskManager');
  const { getPlatformOptimizer } = await import('./PlatformOptimizer');

  const platformOptimizer = getPlatformOptimizer();
  const optimizedConfig = {
    ...platformOptimizer.getOptimizationRecommendations(),
    ...config.taskConfig
  };

  const backgroundTaskManager = new BackgroundTaskManager(
    config.syncEngine,
    config.mediaCacheManager,
    config.storageManager,
    optimizedConfig
  );

  await backgroundTaskManager.initialize();

  return {
    backgroundTaskManager,
    platformOptimizer,
    async start() {
      await backgroundTaskManager.registerAllTasks();
    },
    async stop() {
      await backgroundTaskManager.unregisterAllTasks();
    },
    async getStatus() {
      return backgroundTaskManager.getBackgroundFetchStatus();
    },
    async getStatistics() {
      return backgroundTaskManager.getTaskStatistics();
    }
  };
}
