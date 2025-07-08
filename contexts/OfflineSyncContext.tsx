import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface SyncItem {
  id: string;
  type: 'workout' | 'measurement' | 'achievement' | 'social' | 'photo';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  retryCount: number;
  lastAttempt?: string;
  error?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime?: string;
  pendingItems: number;
  failedItems: number;
  syncProgress: number;
}

interface OfflineSyncContextType {
  syncStatus: SyncStatus;
  addToSyncQueue: (item: Omit<SyncItem, 'id' | 'timestamp' | 'retryCount'>) => Promise<void>;
  forcSync: () => Promise<void>;
  clearSyncQueue: () => Promise<void>;
  getSyncQueue: () => SyncItem[];
  retryFailedItems: () => Promise<void>;
  isOfflineMode: boolean;
  enableOfflineMode: () => void;
  disableOfflineMode: () => void;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

const SYNC_QUEUE_KEY = '@gymverse_sync_queue';
const SYNC_STATUS_KEY = '@gymverse_sync_status';
const OFFLINE_MODE_KEY = '@gymverse_offline_mode';

const MAX_RETRY_COUNT = 3;
const SYNC_INTERVAL = 30000; // 30 seconds

export function OfflineSyncProvider({ children }: { children: ReactNode }) {
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    pendingItems: 0,
    failedItems: 0,
    syncProgress: 0,
  });
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    initializeSync();
    setupNetworkListener();
    setupPeriodicSync();
  }, []);

  const initializeSync = async () => {
    await loadSyncQueue();
    await loadSyncStatus();
    await loadOfflineMode();
  };

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = state.isConnected && state.isInternetReachable;
      setSyncStatus(prev => ({ ...prev, isOnline }));
      
      if (isOnline && !isOfflineMode) {
        // Auto-sync when coming back online
        setTimeout(() => forcSync(), 1000);
      }
    });

    return unsubscribe;
  };

  const setupPeriodicSync = () => {
    const interval = setInterval(() => {
      if (syncStatus.isOnline && !isOfflineMode && syncQueue.length > 0) {
        forcSync();
      }
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  };

  const loadSyncQueue = async () => {
    try {
      const stored = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (stored) {
        const queue = JSON.parse(stored);
        setSyncQueue(queue);
        updateSyncStatus(queue);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  };

  const loadSyncStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem(SYNC_STATUS_KEY);
      if (stored) {
        const status = JSON.parse(stored);
        setSyncStatus(prev => ({ ...prev, ...status }));
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const loadOfflineMode = async () => {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_MODE_KEY);
      if (stored) {
        setIsOfflineMode(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading offline mode:', error);
    }
  };

  const saveSyncQueue = async (queue: SyncItem[]) => {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      setSyncQueue(queue);
      updateSyncStatus(queue);
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  };

  const saveSyncStatus = async (status: Partial<SyncStatus>) => {
    try {
      const newStatus = { ...syncStatus, ...status };
      await AsyncStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(newStatus));
      setSyncStatus(newStatus);
    } catch (error) {
      console.error('Error saving sync status:', error);
    }
  };

  const updateSyncStatus = (queue: SyncItem[]) => {
    const pendingItems = queue.filter(item => item.retryCount < MAX_RETRY_COUNT).length;
    const failedItems = queue.filter(item => item.retryCount >= MAX_RETRY_COUNT).length;
    
    setSyncStatus(prev => ({
      ...prev,
      pendingItems,
      failedItems,
    }));
  };

  const addToSyncQueue = async (itemData: Omit<SyncItem, 'id' | 'timestamp' | 'retryCount'>) => {
    const newItem: SyncItem = {
      ...itemData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    const updatedQueue = [...syncQueue, newItem];
    await saveSyncQueue(updatedQueue);

    // Try to sync immediately if online and not in offline mode
    if (syncStatus.isOnline && !isOfflineMode) {
      setTimeout(() => forcSync(), 100);
    }
  };

  const forcSync = async () => {
    if (syncStatus.isSyncing || isOfflineMode) return;

    await saveSyncStatus({ isSyncing: true, syncProgress: 0 });

    try {
      const itemsToSync = syncQueue.filter(item => item.retryCount < MAX_RETRY_COUNT);
      
      for (let i = 0; i < itemsToSync.length; i++) {
        const item = itemsToSync[i];
        
        try {
          await syncItem(item);
          
          // Remove successfully synced item
          const updatedQueue = syncQueue.filter(queueItem => queueItem.id !== item.id);
          await saveSyncQueue(updatedQueue);
          
        } catch (error) {
          // Update retry count and error
          const updatedQueue = syncQueue.map(queueItem =>
            queueItem.id === item.id
              ? {
                  ...queueItem,
                  retryCount: queueItem.retryCount + 1,
                  lastAttempt: new Date().toISOString(),
                  error: error instanceof Error ? error.message : 'Unknown error',
                }
              : queueItem
          );
          await saveSyncQueue(updatedQueue);
        }

        // Update progress
        const progress = ((i + 1) / itemsToSync.length) * 100;
        await saveSyncStatus({ syncProgress: progress });
      }

      await saveSyncStatus({
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
        syncProgress: 100,
      });

    } catch (error) {
      console.error('Sync error:', error);
      await saveSyncStatus({ isSyncing: false, syncProgress: 0 });
    }
  };

  const syncItem = async (item: SyncItem): Promise<void> => {
    // This would normally make API calls to sync with backend
    // For now, we'll simulate the sync process
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate random success/failure for demo
        if (Math.random() > 0.1) { // 90% success rate
          resolve();
        } else {
          reject(new Error('Network error'));
        }
      }, 1000);
    });
  };

  const clearSyncQueue = async () => {
    await saveSyncQueue([]);
  };

  const getSyncQueue = (): SyncItem[] => {
    return syncQueue;
  };

  const retryFailedItems = async () => {
    const updatedQueue = syncQueue.map(item => ({
      ...item,
      retryCount: 0,
      error: undefined,
    }));
    
    await saveSyncQueue(updatedQueue);
    await forcSync();
  };

  const enableOfflineMode = async () => {
    setIsOfflineMode(true);
    await AsyncStorage.setItem(OFFLINE_MODE_KEY, JSON.stringify(true));
  };

  const disableOfflineMode = async () => {
    setIsOfflineMode(false);
    await AsyncStorage.setItem(OFFLINE_MODE_KEY, JSON.stringify(false));
    
    // Sync when coming back online
    if (syncStatus.isOnline) {
      setTimeout(() => forcSync(), 100);
    }
  };

  return (
    <OfflineSyncContext.Provider
      value={{
        syncStatus,
        addToSyncQueue,
        forcSync,
        clearSyncQueue,
        getSyncQueue,
        retryFailedItems,
        isOfflineMode,
        enableOfflineMode,
        disableOfflineMode,
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
}

export function useOfflineSync() {
  const context = useContext(OfflineSyncContext);
  if (context === undefined) {
    throw new Error('useOfflineSync must be used within an OfflineSyncProvider');
  }
  return context;
}
