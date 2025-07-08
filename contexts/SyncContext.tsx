import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { offlineSync } from '@/lib/migration/offlineSync';
import { syncEngine } from '@/lib/migration/syncEngine';

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  queueLength: number;
  syncProgress: number;
  error: string | null;
}

interface SyncContextType {
  syncStatus: SyncStatus;
  forcSync: () => Promise<void>;
  pauseSync: () => void;
  resumeSync: () => void;
  clearSyncQueue: () => Promise<void>;
  getSyncQueueStatus: () => any;
  addToSyncQueue: (
    table: string,
    operation: 'insert' | 'update' | 'delete',
    data: any,
    priority?: 'high' | 'medium' | 'low'
  ) => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

interface SyncProviderProps {
  children: ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    lastSyncTime: null,
    queueLength: 0,
    syncProgress: 0,
    error: null,
  });

  const [isPaused, setIsPaused] = useState(false);
  const [syncInterval, setSyncInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Monitor network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = state.isConnected && state.isInternetReachable;
      
      setSyncStatus(prev => ({ ...prev, isOnline }));
      offlineSync.setOnlineStatus(isOnline);

      if (isOnline && !isPaused) {
        startPeriodicSync();
      } else {
        stopPeriodicSync();
      }
    });

    // Initial network check
    NetInfo.fetch().then(state => {
      const isOnline = state.isConnected && state.isInternetReachable;
      setSyncStatus(prev => ({ ...prev, isOnline }));
      offlineSync.setOnlineStatus(isOnline);
    });

    return () => {
      unsubscribe();
      stopPeriodicSync();
    };
  }, [isPaused]);

  const startPeriodicSync = () => {
    if (syncInterval) return;

    const interval = setInterval(async () => {
      if (!isPaused && syncStatus.isOnline) {
        await performSync();
      }
    }, 30000); // Sync every 30 seconds

    setSyncInterval(interval);
  };

  const stopPeriodicSync = () => {
    if (syncInterval) {
      clearInterval(syncInterval);
      setSyncInterval(null);
    }
  };

  const performSync = async () => {
    if (syncStatus.isSyncing || isPaused) return;

    setSyncStatus(prev => ({ 
      ...prev, 
      isSyncing: true, 
      error: null,
      syncProgress: 0 
    }));

    try {
      // Get initial queue status
      const initialStatus = offlineSync.getSyncQueueStatus();
      const totalItems = initialStatus.queueLength;

      if (totalItems === 0) {
        setSyncStatus(prev => ({ 
          ...prev, 
          isSyncing: false,
          lastSyncTime: new Date(),
          syncProgress: 100 
        }));
        return;
      }

      // Process sync queue
      await offlineSync.processSyncQueue();

      // Update progress
      const finalStatus = offlineSync.getSyncQueueStatus();
      const processedItems = totalItems - finalStatus.queueLength;
      const progress = totalItems > 0 ? (processedItems / totalItems) * 100 : 100;

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date(),
        queueLength: finalStatus.queueLength,
        syncProgress: progress,
      }));

      // If there are still items in queue, schedule another sync
      if (finalStatus.queueLength > 0 && syncStatus.isOnline) {
        setTimeout(performSync, 5000); // Retry in 5 seconds
      }

    } catch (error: any) {
      console.error('Sync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: error.message || 'Sync failed',
        syncProgress: 0,
      }));
    }
  };

  const forcSync = async () => {
    await performSync();
  };

  const pauseSync = () => {
    setIsPaused(true);
    stopPeriodicSync();
    setSyncStatus(prev => ({ ...prev, isSyncing: false }));
  };

  const resumeSync = () => {
    setIsPaused(false);
    if (syncStatus.isOnline) {
      startPeriodicSync();
      performSync();
    }
  };

  const clearSyncQueue = async () => {
    await offlineSync.clearSyncQueue();
    setSyncStatus(prev => ({ ...prev, queueLength: 0 }));
  };

  const getSyncQueueStatus = () => {
    return offlineSync.getSyncQueueStatus();
  };

  const addToSyncQueue = async (
    table: string,
    operation: 'insert' | 'update' | 'delete',
    data: any,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    await offlineSync.addToSyncQueue(table, operation, data, priority);
    
    // Update queue length in status
    const status = offlineSync.getSyncQueueStatus();
    setSyncStatus(prev => ({ ...prev, queueLength: status.queueLength }));

    // Trigger immediate sync if online and not paused
    if (syncStatus.isOnline && !isPaused && priority === 'high') {
      performSync();
    }
  };

  // Update queue length periodically
  useEffect(() => {
    const updateQueueLength = () => {
      const status = offlineSync.getSyncQueueStatus();
      setSyncStatus(prev => ({ ...prev, queueLength: status.queueLength }));
    };

    const interval = setInterval(updateQueueLength, 5000);
    return () => clearInterval(interval);
  }, []);

  const contextValue: SyncContextType = {
    syncStatus,
    forcSync,
    pauseSync,
    resumeSync,
    clearSyncQueue,
    getSyncQueueStatus,
    addToSyncQueue,
  };

  return (
    <SyncContext.Provider value={contextValue}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}

// Hook for components that need to sync data
export function useSyncData() {
  const { addToSyncQueue, syncStatus } = useSync();

  const syncInsert = async (table: string, data: any, priority?: 'high' | 'medium' | 'low') => {
    await addToSyncQueue(table, 'insert', data, priority);
  };

  const syncUpdate = async (table: string, data: any, priority?: 'high' | 'medium' | 'low') => {
    await addToSyncQueue(table, 'update', data, priority);
  };

  const syncDelete = async (table: string, id: string, priority?: 'high' | 'medium' | 'low') => {
    await addToSyncQueue(table, 'delete', { id }, priority);
  };

  return {
    syncInsert,
    syncUpdate,
    syncDelete,
    isOnline: syncStatus.isOnline,
    isSyncing: syncStatus.isSyncing,
  };
}
