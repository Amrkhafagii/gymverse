import { useState, useEffect, useCallback } from 'react';
import MigrationManager, { SystemStatus, MigrationStatus } from './migrationManager';
import { MigrationResult } from './dataMigration';

// Global migration manager instance
let migrationManagerInstance: MigrationManager | null = null;

export const useMigrationManager = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!migrationManagerInstance) {
      migrationManagerInstance = new MigrationManager(setSystemStatus);
    }

    const initializeStatus = async () => {
      if (migrationManagerInstance) {
        const status = await migrationManagerInstance.getSystemStatus();
        setSystemStatus(status);
        setIsLoading(false);
      }
    };

    initializeStatus();
  }, []);

  const performMigration = useCallback(async (): Promise<MigrationResult> => {
    if (!migrationManagerInstance) {
      throw new Error('Migration manager not initialized');
    }
    return await migrationManagerInstance.performMigration();
  }, []);

  const forceSync = useCallback(async (): Promise<boolean> => {
    if (!migrationManagerInstance) {
      throw new Error('Migration manager not initialized');
    }
    return await migrationManagerInstance.forceSync();
  }, []);

  const clearAllData = useCallback(async (): Promise<void> => {
    if (!migrationManagerInstance) {
      throw new Error('Migration manager not initialized');
    }
    await migrationManagerInstance.clearAllData();
  }, []);

  const createBackup = useCallback(async (): Promise<string> => {
    if (!migrationManagerInstance) {
      throw new Error('Migration manager not initialized');
    }
    return await migrationManagerInstance.createBackup();
  }, []);

  const restoreFromBackup = useCallback(async (backup: string): Promise<void> => {
    if (!migrationManagerInstance) {
      throw new Error('Migration manager not initialized');
    }
    await migrationManagerInstance.restoreFromBackup(backup);
  }, []);

  const addOfflineOperation = useCallback(async (
    table: string, 
    operation: 'insert' | 'update' | 'delete', 
    data: any
  ): Promise<void> => {
    if (!migrationManagerInstance) {
      throw new Error('Migration manager not initialized');
    }
    await migrationManagerInstance.addOfflineOperation(table, operation, data);
  }, []);

  return {
    systemStatus,
    isLoading,
    performMigration,
    forceSync,
    clearAllData,
    createBackup,
    restoreFromBackup,
    addOfflineOperation,
    migrationManager: migrationManagerInstance
  };
};

export const useMigrationStatus = () => {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (migrationManagerInstance) {
        const status = await migrationManagerInstance.getMigrationStatus();
        setMigrationStatus(status);
        setIsLoading(false);
      }
    };

    checkStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { migrationStatus, isLoading };
};

export const useDataSummary = () => {
  const [dataSummary, setDataSummary] = useState<{
    local: Record<string, number>;
    remote: Record<string, number>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSummary = useCallback(async () => {
    if (migrationManagerInstance) {
      setIsLoading(true);
      const summary = await migrationManagerInstance.getDataSummary();
      setDataSummary(summary);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  return { dataSummary, isLoading, refreshSummary };
};

export const useOfflineOperations = () => {
  const addOperation = useCallback(async (
    table: string,
    operation: 'insert' | 'update' | 'delete',
    data: any
  ) => {
    if (migrationManagerInstance) {
      await migrationManagerInstance.addOfflineOperation(table, operation, data);
    }
  }, []);

  return { addOperation };
};
