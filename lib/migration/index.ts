// Main migration system exports
export { default as MigrationManager } from './migrationManager';
export { default as DataMigrationService } from './dataMigration';
export { default as SyncEngine } from './syncEngine';
export { default as OfflineSyncManager } from './offlineSync';
export { default as MigrationUtils } from './migrationUtils';

// Hooks
export {
  useMigrationManager,
  useMigrationStatus,
  useDataSummary,
  useOfflineOperations
} from './migrationHooks';

// Types
export type {
  MigrationProgress,
  MigrationResult
} from './dataMigration';

export type {
  SyncStatus,
  SyncConflict
} from './syncEngine';

export type {
  OfflineOperation,
  OfflineQueueStatus
} from './offlineSync';

export type {
  SystemStatus,
  MigrationStatus
} from './migrationManager';

export type {
  ValidationResult,
  DataIntegrityCheck
} from './migrationUtils';

// Migration workflow helper
export const createMigrationWorkflow = () => {
  return {
    async checkRequirements() {
      const utils = await import('./migrationUtils');
      return await utils.MigrationUtils.validateLocalData();
    },

    async performMigration(onProgress?: (progress: any) => void) {
      const { default: MigrationManager } = await import('./migrationManager');
      const manager = new MigrationManager(onProgress);
      return await manager.performMigration();
    },

    async validateResult(userId: string) {
      const utils = await import('./migrationUtils');
      return await utils.MigrationUtils.checkDataIntegrity(userId);
    },

    async cleanup() {
      const utils = await import('./migrationUtils');
      await utils.MigrationUtils.cleanupLocalData();
    }
  };
};
