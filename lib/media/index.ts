/**
 * Media system exports
 * Main entry point for media caching functionality
 */

export { MediaCacheManager } from './MediaCacheManager';
export type {
  MediaCacheConfig,
  MediaDownloadProgress,
  MediaCacheStats
} from './MediaCacheManager';

// Convenience factory function
export async function createMediaCacheSystem(config: {
  storage: any; // StorageManager instance
  network: any; // NetworkManager instance
  cacheConfig?: Partial<any>;
}) {
  const { MediaCacheManager } = await import('./MediaCacheManager');

  const mediaCacheManager = new MediaCacheManager(
    config.storage,
    config.network,
    config.cacheConfig
  );

  await mediaCacheManager.initialize();

  return {
    mediaCacheManager,
    async getMediaUrl(url: string, priority?: any, onProgress?: any) {
      return mediaCacheManager.getMediaUrl(url, priority, onProgress);
    },
    async preloadMedia(urls: string[], priority?: any) {
      return mediaCacheManager.preloadMedia(urls, priority);
    },
    async getCacheStats() {
      return mediaCacheManager.getCacheStats();
    },
    async clearCache() {
      return mediaCacheManager.clearCache();
    },
    async optimizeCache() {
      return mediaCacheManager.optimizeCache();
    }
  };
}
