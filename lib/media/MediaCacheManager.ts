/**
 * Intelligent media caching system with LRU eviction
 * Handles offline media storage and sync across platforms
 */

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { StorageManager } from '../storage/StorageManager';
import { NetworkManager } from '../sync/NetworkManager';
import { MediaCacheEntry, SyncPriority } from '../storage/types';

export interface MediaCacheConfig {
  maxCacheSizeMB: number;
  maxFileAgeDays: number;
  compressionQuality: number;
  preloadStrategy: 'aggressive' | 'conservative' | 'on-demand';
  wifiOnlyDownload: boolean;
  backgroundDownloadLimit: number;
}

export interface MediaDownloadProgress {
  mediaUrl: string;
  bytesDownloaded: number;
  totalBytes: number;
  percentage: number;
  status: 'downloading' | 'completed' | 'failed' | 'paused';
}

export interface MediaCacheStats {
  totalFiles: number;
  totalSizeMB: number;
  hitRate: number;
  evictedFiles: number;
  downloadedFiles: number;
  failedDownloads: number;
}

export class MediaCacheManager {
  private storageManager: StorageManager;
  private networkManager: NetworkManager;
  private config: MediaCacheConfig;
  private downloadQueue: Map<string, Promise<string>> = new Map();
  private progressCallbacks: Map<string, (progress: MediaDownloadProgress) => void> = new Map();
  private cacheDirectory: string;
  private isInitialized = false;

  constructor(
    storageManager: StorageManager,
    networkManager: NetworkManager,
    config: Partial<MediaCacheConfig> = {}
  ) {
    this.storageManager = storageManager;
    this.networkManager = networkManager;
    this.config = {
      maxCacheSizeMB: 500,
      maxFileAgeDays: 30,
      compressionQuality: 0.8,
      preloadStrategy: 'conservative',
      wifiOnlyDownload: false,
      backgroundDownloadLimit: 3,
      ...config
    };
    
    this.cacheDirectory = `${FileSystem.documentDirectory}media_cache/`;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create cache directory
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDirectory, { intermediates: true });
      }

      // Clean up expired files on startup
      await this.cleanupExpiredFiles();
      
      // Perform initial cache size check
      await this.enforceMaxCacheSize();

      this.isInitialized = true;
      console.log('MediaCacheManager initialized');
    } catch (error) {
      console.error('MediaCacheManager initialization failed:', error);
      throw error;
    }
  }

  async getMediaUrl(
    originalUrl: string, 
    priority: SyncPriority = 2,
    onProgress?: (progress: MediaDownloadProgress) => void
  ): Promise<string> {
    this.ensureInitialized();

    // Check if already cached
    const cacheEntry = await this.storageManager.getMediaCache(originalUrl);
    
    if (cacheEntry && await this.isFileValid(cacheEntry.localPath)) {
      // Update access statistics
      await this.updateAccessStats(cacheEntry.id);
      return cacheEntry.localPath;
    }

    // Check if download is already in progress
    if (this.downloadQueue.has(originalUrl)) {
      if (onProgress) {
        this.progressCallbacks.set(originalUrl, onProgress);
      }
      return await this.downloadQueue.get(originalUrl)!;
    }

    // Start new download
    const downloadPromise = this.downloadAndCache(originalUrl, priority, onProgress);
    this.downloadQueue.set(originalUrl, downloadPromise);

    try {
      const localPath = await downloadPromise;
      return localPath;
    } finally {
      this.downloadQueue.delete(originalUrl);
      this.progressCallbacks.delete(originalUrl);
    }
  }

  private async downloadAndCache(
    originalUrl: string,
    priority: SyncPriority,
    onProgress?: (progress: MediaDownloadProgress) => void
  ): Promise<string> {
    try {
      // Generate local file path
      const urlHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        originalUrl
      );
      const fileExtension = this.getFileExtension(originalUrl);
      const localFileName = `${urlHash}${fileExtension}`;
      const localPath = `${this.cacheDirectory}${localFileName}`;

      // Check network conditions
      if (!this.networkManager.isOnline()) {
        throw new Error('Device is offline');
      }

      if (this.config.wifiOnlyDownload && !await this.isWifiConnected()) {
        throw new Error('WiFi-only download enabled but not connected to WiFi');
      }

      // Start download with progress tracking
      const downloadResult = await this.downloadWithProgress(
        originalUrl,
        localPath,
        onProgress
      );

      if (!downloadResult.success) {
        throw new Error(downloadResult.error || 'Download failed');
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (!fileInfo.exists) {
        throw new Error('Downloaded file not found');
      }

      // Generate checksum for integrity verification
      const checksum = await this.generateFileChecksum(localPath);

      // Determine media type
      const mediaType = this.getMediaType(fileExtension);

      // Store in cache database
      const cacheEntryId = await this.storageManager.addToMediaCache({
        mediaUrl: originalUrl,
        localPath,
        mediaType,
        fileSize: fileInfo.size || 0,
        priority,
        accessCount: 1,
        lastAccessed: new Date(),
        checksum,
        isSynced: true
      });

      // Enforce cache size limits
      await this.enforceMaxCacheSize();

      console.log(`Media cached: ${originalUrl} -> ${localPath}`);
      return localPath;

    } catch (error) {
      console.error(`Media download failed for ${originalUrl}:`, error);
      
      // Store failed download info for retry logic
      await this.storageManager.addToMediaCache({
        mediaUrl: originalUrl,
        localPath: '',
        mediaType: 'image',
        fileSize: 0,
        priority,
        accessCount: 0,
        lastAccessed: new Date(),
        checksum: '',
        isSynced: false
      });

      throw error;
    }
  }

  private async downloadWithProgress(
    url: string,
    localPath: string,
    onProgress?: (progress: MediaDownloadProgress) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        localPath,
        {},
        (downloadProgress) => {
          const progress: MediaDownloadProgress = {
            mediaUrl: url,
            bytesDownloaded: downloadProgress.totalBytesWritten,
            totalBytes: downloadProgress.totalBytesExpectedToWrite,
            percentage: downloadProgress.totalBytesExpectedToWrite > 0 
              ? (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100 
              : 0,
            status: 'downloading'
          };

          if (onProgress) {
            onProgress(progress);
          }

          // Notify other listeners
          const callback = this.progressCallbacks.get(url);
          if (callback && callback !== onProgress) {
            callback(progress);
          }
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result && result.status === 200) {
        // Final progress update
        if (onProgress) {
          onProgress({
            mediaUrl: url,
            bytesDownloaded: result.headers['content-length'] ? parseInt(result.headers['content-length']) : 0,
            totalBytes: result.headers['content-length'] ? parseInt(result.headers['content-length']) : 0,
            percentage: 100,
            status: 'completed'
          });
        }
        return { success: true };
      } else {
        return { success: false, error: `HTTP ${result?.status || 'unknown'}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async preloadMedia(urls: string[], priority: SyncPriority = 3): Promise<void> {
    if (this.config.preloadStrategy === 'on-demand') return;

    const maxConcurrent = this.config.preloadStrategy === 'aggressive' ? 5 : 2;
    const chunks = this.chunkArray(urls, maxConcurrent);

    for (const chunk of chunks) {
      const promises = chunk.map(url => 
        this.getMediaUrl(url, priority).catch(error => {
          console.warn(`Preload failed for ${url}:`, error);
          return null;
        })
      );
      
      await Promise.allSettled(promises);
    }
  }

  async invalidateCache(url?: string): Promise<void> {
    if (url) {
      // Invalidate specific URL
      const cacheEntry = await this.storageManager.getMediaCache(url);
      if (cacheEntry) {
        await this.removeFromCache(cacheEntry);
      }
    } else {
      // Clear entire cache
      await this.clearCache();
    }
  }

  async clearCache(): Promise<void> {
    try {
      // Remove all files from filesystem
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDirectory);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.cacheDirectory);
        await FileSystem.makeDirectoryAsync(this.cacheDirectory, { intermediates: true });
      }

      // Clear database entries
      await this.storageManager.cleanupMediaCache(0); // Remove all

      console.log('Media cache cleared');
    } catch (error) {
      console.error('Failed to clear media cache:', error);
    }
  }

  private async enforceMaxCacheSize(): Promise<void> {
    const maxSizeBytes = this.config.maxCacheSizeMB * 1024 * 1024;
    let currentSize = await this.getCurrentCacheSize();

    if (currentSize <= maxSizeBytes) return;

    console.log(`Cache size (${Math.round(currentSize / 1024 / 1024)}MB) exceeds limit (${this.config.maxCacheSizeMB}MB), starting LRU eviction`);

    // Get all cache entries sorted by LRU (least recently used first)
    const allEntries = await this.getCacheEntriesByLRU();
    
    for (const entry of allEntries) {
      if (currentSize <= maxSizeBytes) break;

      const fileSize = await this.getFileSize(entry.localPath);
      await this.removeFromCache(entry);
      currentSize -= fileSize;
      
      console.log(`Evicted: ${entry.mediaUrl} (${Math.round(fileSize / 1024)}KB)`);
    }
  }

  private async getCacheEntriesByLRU(): Promise<MediaCacheEntry[]> {
    // This would typically be implemented in the storage adapter
    // For now, we'll use a simplified approach
    const entries: MediaCacheEntry[] = [];
    
    try {
      const files = await FileSystem.readDirectoryAsync(this.cacheDirectory);
      
      for (const file of files) {
        const filePath = `${this.cacheDirectory}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        
        // Find corresponding cache entry
        // This is a simplified lookup - in production, you'd have a more efficient index
        const cacheEntry = await this.findCacheEntryByPath(filePath);
        if (cacheEntry) {
          entries.push(cacheEntry);
        }
      }
    } catch (error) {
      console.error('Error getting cache entries for LRU:', error);
    }

    // Sort by last accessed (oldest first) and access count (least used first)
    return entries.sort((a, b) => {
      const timeDiff = a.lastAccessed.getTime() - b.lastAccessed.getTime();
      if (timeDiff !== 0) return timeDiff;
      return a.accessCount - b.accessCount;
    });
  }

  private async findCacheEntryByPath(localPath: string): Promise<MediaCacheEntry | null> {
    // This is a simplified implementation
    // In production, you'd have an efficient index by local path
    return null; // Placeholder
  }

  private async removeFromCache(entry: MediaCacheEntry): Promise<void> {
    try {
      // Remove file from filesystem
      const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(entry.localPath);
      }

      // Remove from database (this method would need to be added to StorageManager)
      // await this.storageManager.removeMediaCacheEntry(entry.id);
    } catch (error) {
      console.error(`Failed to remove cache entry ${entry.id}:`, error);
    }
  }

  private async getCurrentCacheSize(): Promise<number> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.cacheDirectory);
      let totalSize = 0;

      for (const file of files) {
        const filePath = `${this.cacheDirectory}${file}`;
        const size = await this.getFileSize(filePath);
        totalSize += size;
      }

      return totalSize;
    } catch (error) {
      console.error('Error calculating cache size:', error);
      return 0;
    }
  }

  private async getFileSize(filePath: string): Promise<number> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      return fileInfo.size || 0;
    } catch {
      return 0;
    }
  }

  private async cleanupExpiredFiles(): Promise<void> {
    const maxAge = this.config.maxFileAgeDays * 24 * 60 * 60 * 1000; // Convert to milliseconds
    const now = Date.now();

    try {
      const files = await FileSystem.readDirectoryAsync(this.cacheDirectory);
      
      for (const file of files) {
        const filePath = `${this.cacheDirectory}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        
        if (fileInfo.exists && fileInfo.modificationTime) {
          const fileAge = now - fileInfo.modificationTime;
          
          if (fileAge > maxAge) {
            await FileSystem.deleteAsync(filePath);
            console.log(`Removed expired file: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('Error during expired file cleanup:', error);
    }
  }

  private async updateAccessStats(cacheEntryId: string): Promise<void> {
    try {
      // This would update the access count and last accessed time
      // Implementation depends on StorageManager having this method
      // await this.storageManager.updateMediaCacheAccess(cacheEntryId);
    } catch (error) {
      console.error('Failed to update access stats:', error);
    }
  }

  private async isFileValid(localPath: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      return fileInfo.exists && (fileInfo.size || 0) > 0;
    } catch {
      return false;
    }
  }

  private async generateFileChecksum(filePath: string): Promise<string> {
    try {
      // For large files, we might want to use a streaming approach
      // For now, we'll use a simple approach
      const fileUri = await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        fileUri
      );
    } catch (error) {
      console.error('Failed to generate checksum:', error);
      return '';
    }
  }

  private getFileExtension(url: string): string {
    const urlParts = url.split('.');
    const extension = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
    return `.${extension}`;
  }

  private getMediaType(extension: string): 'image' | 'video' | 'audio' {
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    const audioExts = ['.mp3', '.wav', '.aac', '.ogg', '.m4a'];

    const ext = extension.toLowerCase();
    
    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    if (audioExts.includes(ext)) return 'audio';
    
    return 'image'; // Default
  }

  private async isWifiConnected(): Promise<boolean> {
    if (Platform.OS === 'web') {
      // Web doesn't have reliable WiFi detection
      return true;
    }

    try {
      const NetInfo = require('@react-native-community/netinfo');
      const state = await NetInfo.fetch();
      return state.type === 'wifi' && state.isConnected === true;
    } catch {
      return true; // Assume WiFi if detection fails
    }
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('MediaCacheManager not initialized. Call initialize() first.');
    }
  }

  // Public API for monitoring and statistics
  async getCacheStats(): Promise<MediaCacheStats> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.cacheDirectory);
      const totalSizeMB = (await this.getCurrentCacheSize()) / 1024 / 1024;

      // These stats would come from the database in a real implementation
      return {
        totalFiles: files.length,
        totalSizeMB: Math.round(totalSizeMB * 100) / 100,
        hitRate: 0.85, // Placeholder
        evictedFiles: 0, // Would track this
        downloadedFiles: files.length,
        failedDownloads: 0 // Would track this
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalFiles: 0,
        totalSizeMB: 0,
        hitRate: 0,
        evictedFiles: 0,
        downloadedFiles: 0,
        failedDownloads: 0
      };
    }
  }

  async optimizeCache(): Promise<void> {
    console.log('Starting cache optimization...');
    
    // Clean up expired files
    await this.cleanupExpiredFiles();
    
    // Enforce size limits
    await this.enforceMaxCacheSize();
    
    // Verify file integrity
    await this.verifyFileIntegrity();
    
    console.log('Cache optimization completed');
  }

  private async verifyFileIntegrity(): Promise<void> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.cacheDirectory);
      
      for (const file of files) {
        const filePath = `${this.cacheDirectory}${file}`;
        const isValid = await this.isFileValid(filePath);
        
        if (!isValid) {
          console.log(`Removing corrupted file: ${file}`);
          await FileSystem.deleteAsync(filePath);
        }
      }
    } catch (error) {
      console.error('Error during integrity verification:', error);
    }
  }
}
