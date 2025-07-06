/**
 * OfflineContext - Provides offline-first functionality to the entire app
 * Integrates all offline systems (storage, sync, media caching, background tasks)
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { StorageManager, initializeStorage } from '@/lib/storage/StorageManager';
import { createSyncSystem } from '@/lib/sync';
import { createMediaCacheSystem } from '@/lib/media';
import { createBackgroundSystem } from '@/lib/background';
import { getPlatformOptimizer } from '@/lib/background/PlatformOptimizer';

interface OfflineContextValue {
  // System instances
  storageManager: StorageManager | null;
  syncEngine: any | null;
  mediaCacheManager: any | null;
  backgroundTaskManager: any | null;
  
  // System status
  isInitialized: boolean;
  isOnline: boolean;
  initializationError: string | null;
  
  // System controls
  initialize: () => Promise<void>;
  shutdown: () => Promise<void>;
  
  // Quick access methods
  forceSync: () => Promise<void>;
  clearCache: () => Promise<void>;
  getSystemHealth: () => Promise<any>;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

interface OfflineProviderProps {
  children: ReactNode;
  supabaseUrl: string;
  supabaseKey: string;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({
  children,
  supabaseUrl,
  supabaseKey,
}) => {
  const [storageManager, setStorageManager] = useState<StorageManager | null>(null);
  const [syncEngine, setSyncEngine] = useState<any>(null);
  const [mediaCacheManager, setMediaCacheManager] = useState<any>(null);
  const [backgroundTaskManager, setBackgroundTaskManager] = useState<any>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  const initialize = async () => {
    if (isInitialized) return;

    try {
      console.log('🚀 Initializing offline-first systems...');
      setInitializationError(null);

      // Get platform optimizations
      const platformOptimizer = getPlatformOptimizer();
      const recommendations = platformOptimizer.getOptimizationRecommendations();
      
      console.log('📱 Platform recommendations:', recommendations);

      // 1. Initialize Storage System
      console.log('💾 Initializing storage system...');
      const storage = await initializeStorage({
        databaseName: 'gymverse.db',
        version: 1,
        encryptionKey: 'your-encryption-key', // In production, use secure key management
      });
      setStorageManager(storage);

      // 2. Initialize Sync System
      console.log('🔄 Initializing sync system...');
      const syncSystem = await createSyncSystem({
        storage,
        supabaseUrl,
        supabaseKey,
        syncConfig: {
          batchSize: recommendations.batchSize,
          maxRetries: recommendations.maxRetries,
          syncInterval: recommendations.syncInterval,
        },
        networkConfig: {
          timeout: 30000,
          retryAttempts: recommendations.maxRetries,
        },
      });
      setSyncEngine(syncSystem.syncEngine);

      // 3. Initialize Media Cache System
      console.log('📱 Initializing media cache system...');
      const mediaCacheSystem = await createMediaCacheSystem({
        storage,
        network: syncSystem.networkManager,
        cacheConfig: {
          maxCacheSizeMB: recommendations.cacheSize,
          compressionQuality: recommendations.compressionLevel,
          preloadStrategy: recommendations.preloadStrategy,
        },
      });
      setMediaCacheManager(mediaCacheSystem.mediaCacheManager);

      // 4. Initialize Background Task System
      console.log('⚙️ Initializing background task system...');
      const backgroundSystem = await createBackgroundSystem({
        syncEngine: syncSystem.syncEngine,
        mediaCacheManager: mediaCacheSystem.mediaCacheManager,
        storageManager: storage,
        taskConfig: {
          syncInterval: recommendations.syncInterval,
          maxBackgroundTime: platformOptimizer.getBackgroundTaskLimitations().maxExecutionTime,
        },
      });
      setBackgroundTaskManager(backgroundSystem.backgroundTaskManager);

      // 5. Start all systems
      console.log('▶️ Starting all systems...');
      await Promise.all([
        syncSystem.start(),
        backgroundSystem.start(),
      ]);

      setIsInitialized(true);
      console.log('✅ All offline-first systems initialized successfully!');

      // Log system health
      const health = await getSystemHealth();
      console.log('🏥 System health:', health);

    } catch (error) {
      console.error('❌ Failed to initialize offline systems:', error);
      setInitializationError(error instanceof Error ? error.message : 'Initialization failed');
    }
  };

  const shutdown = async () => {
    if (!isInitialized) return;

    try {
      console.log('🛑 Shutting down offline systems...');

      // Stop background tasks first
      if (backgroundTaskManager) {
        await backgroundTaskManager.unregisterAllTasks();
      }

      // Stop sync engine
      if (syncEngine) {
        await syncEngine.stop();
      }

      // Close storage
      if (storageManager) {
        await storageManager.close();
      }

      // Reset state
      setStorageManager(null);
      setSyncEngine(null);
      setMediaCacheManager(null);
      setBackgroundTaskManager(null);
      setIsInitialized(false);

      console.log('✅ All systems shut down successfully');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  };

  const forceSync = async () => {
    if (!syncEngine) {
      console.warn('Sync engine not initialized');
      return;
    }

    try {
      await syncEngine.forcSync();
      console.log('✅ Force sync completed');
    } catch (error) {
      console.error('❌ Force sync failed:', error);
      throw error;
    }
  };

  const clearCache = async () => {
    if (!mediaCacheManager) {
      console.warn('Media cache manager not initialized');
      return;
    }

    try {
      await mediaCacheManager.clearCache();
      console.log('✅ Cache cleared');
    } catch (error) {
      console.error('❌ Cache clear failed:', error);
      throw error;
    }
  };

  const getSystemHealth = async () => {
    const health: any = {
      timestamp: new Date().toISOString(),
      systems: {},
    };

    try {
      // Storage health
      if (storageManager) {
        health.systems.storage = await storageManager.getStorageHealth();
      }

      // Media cache health
      if (mediaCacheManager) {
        health.systems.mediaCache = await mediaCacheManager.getCacheStats();
      }

      // Background task health
      if (backgroundTaskManager) {
        health.systems.backgroundTasks = await backgroundTaskManager.getTaskStatistics();
      }

      // Platform info
      const platformOptimizer = getPlatformOptimizer();
      health.platform = {
        capabilities: platformOptimizer.getCapabilities(),
        deviceInfo: platformOptimizer.getDeviceInfo(),
        isLowEndDevice: platformOptimizer.isLowEndDevice(),
      };

      return health;
    } catch (error) {
      console.error('Failed to get system health:', error);
      return { error: error instanceof Error ? error.message : 'Health check failed' };
    }
  };

  // Initialize on mount
  useEffect(() => {
    initialize();

    // Cleanup on unmount
    return () => {
      shutdown();
    };
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isInitialized) {
        // App became active, trigger sync
        forceSync().catch(console.error);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isInitialized]);

  // Monitor network status
  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        // This would use a proper network monitoring library
        // For now, we'll assume online
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      }
    };

    checkNetworkStatus();
    const interval = setInterval(checkNetworkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const contextValue: OfflineContextValue = {
    // System instances
    storageManager,
    syncEngine,
    mediaCacheManager,
    backgroundTaskManager,
    
    // System status
    isInitialized,
    isOnline,
    initializationError,
    
    // System controls
    initialize,
    shutdown,
    
    // Quick access methods
    forceSync,
    clearCache,
    getSystemHealth,
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = (): OfflineContextValue => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

// Utility hooks for specific systems
export const useStorage = () => {
  const { storageManager } = useOffline();
  return storageManager;
};

export const useSync = () => {
  const { syncEngine, forceSync } = useOffline();
  return { syncEngine, forceSync };
};

export const useMediaCache = () => {
  const { mediaCacheManager } = useOffline();
  return mediaCacheManager;
};

export const useBackgroundTasks = () => {
  const { backgroundTaskManager } = useOffline();
  return backgroundTaskManager;
};
