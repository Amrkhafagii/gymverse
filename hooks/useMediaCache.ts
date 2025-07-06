/**
 * React hook for media caching functionality
 * Provides easy access to MediaCacheManager from components
 */

import { useState, useEffect, useCallback } from 'react';
import { MediaCacheManager, MediaDownloadProgress } from '@/lib/media/MediaCacheManager';
import { SyncPriority } from '@/lib/storage/types';

interface UseMediaCacheReturn {
  getMediaUrl: (url: string, priority?: SyncPriority) => Promise<string>;
  preloadMedia: (urls: string[], priority?: SyncPriority) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  downloadProgress: MediaDownloadProgress | null;
  cacheStats: any;
  clearCache: () => Promise<void>;
  optimizeCache: () => Promise<void>;
}

let mediaCacheManagerInstance: MediaCacheManager | null = null;

export const useMediaCache = (): UseMediaCacheReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<MediaDownloadProgress | null>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);

  // Initialize MediaCacheManager if not already done
  useEffect(() => {
    initializeMediaCache();
  }, []);

  const initializeMediaCache = async () => {
    if (mediaCacheManagerInstance) return;

    try {
      // This would typically be injected via context or dependency injection
      // For now, we'll create a placeholder that would be replaced with actual instances
      console.log('MediaCacheManager would be initialized here with StorageManager and NetworkManager instances');
      
      // In a real implementation:
      // const storageManager = getStorageManager();
      // const networkManager = getNetworkManager();
      // mediaCacheManagerInstance = new MediaCacheManager(storageManager, networkManager);
      // await mediaCacheManagerInstance.initialize();
    } catch (err) {
      console.error('Failed to initialize MediaCacheManager:', err);
      setError(err instanceof Error ? err.message : 'Initialization failed');
    }
  };

  const getMediaUrl = useCallback(async (url: string, priority: SyncPriority = 2): Promise<string> => {
    if (!mediaCacheManagerInstance) {
      // Fallback to original URL if cache manager not available
      console.warn('MediaCacheManager not initialized, returning original URL');
      return url;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const cachedUrl = await mediaCacheManagerInstance.getMediaUrl(
        url, 
        priority,
        (progress) => setDownloadProgress(progress)
      );
      
      return cachedUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get media URL';
      setError(errorMessage);
      console.error('Media cache error:', err);
      
      // Return original URL as fallback
      return url;
    } finally {
      setIsLoading(false);
      setDownloadProgress(null);
    }
  }, []);

  const preloadMedia = useCallback(async (urls: string[], priority: SyncPriority = 3): Promise<void> => {
    if (!mediaCacheManagerInstance) {
      console.warn('MediaCacheManager not initialized, skipping preload');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await mediaCacheManagerInstance.preloadMedia(urls, priority);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to preload media';
      setError(errorMessage);
      console.error('Media preload error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCache = useCallback(async (): Promise<void> => {
    if (!mediaCacheManagerInstance) {
      console.warn('MediaCacheManager not initialized');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await mediaCacheManagerInstance.clearCache();
      
      // Refresh cache stats
      const stats = await mediaCacheManagerInstance.getCacheStats();
      setCacheStats(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cache';
      setError(errorMessage);
      console.error('Cache clear error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const optimizeCache = useCallback(async (): Promise<void> => {
    if (!mediaCacheManagerInstance) {
      console.warn('MediaCacheManager not initialized');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await mediaCacheManagerInstance.optimizeCache();
      
      // Refresh cache stats
      const stats = await mediaCacheManagerInstance.getCacheStats();
      setCacheStats(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize cache';
      setError(errorMessage);
      console.error('Cache optimization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load cache stats on mount
  useEffect(() => {
    const loadCacheStats = async () => {
      if (!mediaCacheManagerInstance) return;

      try {
        const stats = await mediaCacheManagerInstance.getCacheStats();
        setCacheStats(stats);
      } catch (err) {
        console.error('Failed to load cache stats:', err);
      }
    };

    loadCacheStats();
  }, []);

  return {
    getMediaUrl,
    preloadMedia,
    isLoading,
    error,
    downloadProgress,
    cacheStats,
    clearCache,
    optimizeCache,
  };
};

// Utility hook for batch media operations
export const useBatchMediaCache = () => {
  const { getMediaUrl, preloadMedia } = useMediaCache();
  const [batchProgress, setBatchProgress] = useState<{
    total: number;
    completed: number;
    failed: number;
    current?: string;
  }>({ total: 0, completed: 0, failed: 0 });

  const batchGetMediaUrls = useCallback(async (
    urls: string[], 
    priority: SyncPriority = 2
  ): Promise<{ url: string; cachedUrl: string | null }[]> => {
    setBatchProgress({ total: urls.length, completed: 0, failed: 0 });
    
    const results: { url: string; cachedUrl: string | null }[] = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      setBatchProgress(prev => ({ ...prev, current: url }));
      
      try {
        const cachedUrl = await getMediaUrl(url, priority);
        results.push({ url, cachedUrl });
        setBatchProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
      } catch (error) {
        console.error(`Failed to cache ${url}:`, error);
        results.push({ url, cachedUrl: null });
        setBatchProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
      }
    }
    
    setBatchProgress(prev => ({ ...prev, current: undefined }));
    return results;
  }, [getMediaUrl]);

  return {
    batchGetMediaUrls,
    batchProgress,
    preloadMedia,
  };
};
