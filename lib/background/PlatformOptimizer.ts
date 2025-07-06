/**
 * Platform-specific optimizations for background tasks
 * Handles iOS, Android, and Web differences
 */

import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';

export interface PlatformCapabilities {
  backgroundFetch: boolean;
  backgroundProcessing: boolean;
  pushNotifications: boolean;
  fileSystemAccess: boolean;
  networkMonitoring: boolean;
  batteryOptimization: boolean;
  maxBackgroundTime: number; // seconds
  maxConcurrentTasks: number;
}

export interface OptimizationRecommendations {
  syncInterval: number;
  batchSize: number;
  maxRetries: number;
  cacheSize: number; // MB
  preloadStrategy: 'aggressive' | 'conservative' | 'disabled';
  compressionLevel: number;
}

export class PlatformOptimizer {
  private capabilities: PlatformCapabilities;
  private deviceInfo: any = {};

  constructor() {
    this.capabilities = this.detectPlatformCapabilities();
    this.initializeDeviceInfo();
  }

  private detectPlatformCapabilities(): PlatformCapabilities {
    switch (Platform.OS) {
      case 'ios':
        return {
          backgroundFetch: true,
          backgroundProcessing: true,
          pushNotifications: true,
          fileSystemAccess: true,
          networkMonitoring: true,
          batteryOptimization: true,
          maxBackgroundTime: 30, // iOS gives 30 seconds
          maxConcurrentTasks: 3
        };

      case 'android':
        return {
          backgroundFetch: true,
          backgroundProcessing: true,
          pushNotifications: true,
          fileSystemAccess: true,
          networkMonitoring: true,
          batteryOptimization: true,
          maxBackgroundTime: 60, // Android is more flexible
          maxConcurrentTasks: 5
        };

      case 'web':
        return {
          backgroundFetch: false, // Limited support
          backgroundProcessing: false,
          pushNotifications: true, // Service workers
          fileSystemAccess: true, // IndexedDB/localStorage
          networkMonitoring: true,
          batteryOptimization: false,
          maxBackgroundTime: 0, // No background processing
          maxConcurrentTasks: 10 // No real limit
        };

      default:
        return {
          backgroundFetch: false,
          backgroundProcessing: false,
          pushNotifications: false,
          fileSystemAccess: false,
          networkMonitoring: false,
          batteryOptimization: false,
          maxBackgroundTime: 0,
          maxConcurrentTasks: 1
        };
    }
  }

  private async initializeDeviceInfo(): Promise<void> {
    try {
      this.deviceInfo = {
        deviceType: Device.deviceType,
        deviceName: Device.deviceName,
        osName: Device.osName,
        osVersion: Device.osVersion,
        platform: Platform.OS,
        isDevice: Device.isDevice,
        totalMemory: Device.totalMemory,
        supportedCpuArchitectures: Device.supportedCpuArchitectures,
        applicationId: Application.applicationId,
        applicationName: Application.applicationName
      };

      console.log('📱 Device Info:', this.deviceInfo);
    } catch (error) {
      console.error('Failed to get device info:', error);
    }
  }

  getOptimizationRecommendations(): OptimizationRecommendations {
    const baseRecommendations: OptimizationRecommendations = {
      syncInterval: 300, // 5 minutes
      batchSize: 10,
      maxRetries: 3,
      cacheSize: 100, // MB
      preloadStrategy: 'conservative',
      compressionLevel: 0.8
    };

    // Platform-specific optimizations
    switch (Platform.OS) {
      case 'ios':
        return {
          ...baseRecommendations,
          syncInterval: 900, // 15 minutes (iOS is strict about background)
          batchSize: 5, // Smaller batches for limited background time
          cacheSize: this.getRecommendedCacheSize('ios'),
          preloadStrategy: this.getPreloadStrategy('ios'),
          compressionLevel: 0.9 // Higher compression for iOS
        };

      case 'android':
        return {
          ...baseRecommendations,
          syncInterval: 600, // 10 minutes
          batchSize: 8,
          cacheSize: this.getRecommendedCacheSize('android'),
          preloadStrategy: this.getPreloadStrategy('android'),
          compressionLevel: 0.8
        };

      case 'web':
        return {
          ...baseRecommendations,
          syncInterval: 30, // More frequent on web (no background limits)
          batchSize: 20, // Larger batches
          maxRetries: 5,
          cacheSize: this.getRecommendedCacheSize('web'),
          preloadStrategy: 'aggressive', // Web can handle more aggressive preloading
          compressionLevel: 0.7 // Less compression (faster processing)
        };

      default:
        return baseRecommendations;
    }
  }

  private getRecommendedCacheSize(platform: string): number {
    const totalMemory = this.deviceInfo.totalMemory || 4 * 1024 * 1024 * 1024; // Default 4GB
    const memoryGB = totalMemory / (1024 * 1024 * 1024);

    switch (platform) {
      case 'ios':
        // iOS is more memory-constrained
        if (memoryGB < 2) return 50; // 50MB for older devices
        if (memoryGB < 4) return 100; // 100MB for mid-range
        return 200; // 200MB for high-end

      case 'android':
        // Android varies widely
        if (memoryGB < 2) return 75;
        if (memoryGB < 4) return 150;
        if (memoryGB < 8) return 300;
        return 500; // High-end Android devices

      case 'web':
        // Web can use more storage
        return 1000; // 1GB for web

      default:
        return 100;
    }
  }

  private getPreloadStrategy(platform: string): 'aggressive' | 'conservative' | 'disabled' {
    const deviceType = this.deviceInfo.deviceType;
    
    switch (platform) {
      case 'ios':
        // iOS background limitations
        return deviceType === Device.DeviceType.TABLET ? 'conservative' : 'conservative';

      case 'android':
        // Android can be more aggressive
        if (deviceType === Device.DeviceType.TABLET) return 'aggressive';
        return 'conservative';

      case 'web':
        return 'aggressive'; // Web has no background limitations

      default:
        return 'disabled';
    }
  }

  optimizeForLowMemory(): OptimizationRecommendations {
    return {
      syncInterval: 1800, // 30 minutes
      batchSize: 3, // Very small batches
      maxRetries: 2,
      cacheSize: 25, // Minimal cache
      preloadStrategy: 'disabled',
      compressionLevel: 0.95 // Maximum compression
    };
  }

  optimizeForLowBattery(): OptimizationRecommendations {
    return {
      syncInterval: 3600, // 1 hour
      batchSize: 5,
      maxRetries: 1, // Fewer retries to save battery
      cacheSize: 50,
      preloadStrategy: 'disabled',
      compressionLevel: 0.9
    };
  }

  optimizeForSlowNetwork(): OptimizationRecommendations {
    return {
      syncInterval: 600, // 10 minutes
      batchSize: 2, // Very small batches
      maxRetries: 5, // More retries for unreliable network
      cacheSize: 200, // Larger cache to reduce network requests
      preloadStrategy: 'disabled',
      compressionLevel: 0.95 // High compression for slow networks
    };
  }

  getBackgroundTaskLimitations(): {
    maxExecutionTime: number;
    maxConcurrentTasks: number;
    requiresUserPermission: boolean;
    canScheduleExactAlarms: boolean;
    supportsBatchOperations: boolean;
  } {
    switch (Platform.OS) {
      case 'ios':
        return {
          maxExecutionTime: 30, // seconds
          maxConcurrentTasks: 1, // iOS is very restrictive
          requiresUserPermission: true,
          canScheduleExactAlarms: false,
          supportsBatchOperations: false
        };

      case 'android':
        return {
          maxExecutionTime: 60,
          maxConcurrentTasks: 3,
          requiresUserPermission: true, // For newer Android versions
          canScheduleExactAlarms: true,
          supportsBatchOperations: true
        };

      case 'web':
        return {
          maxExecutionTime: 0, // No background execution
          maxConcurrentTasks: 0,
          requiresUserPermission: false,
          canScheduleExactAlarms: false,
          supportsBatchOperations: true // Via service workers
        };

      default:
        return {
          maxExecutionTime: 0,
          maxConcurrentTasks: 0,
          requiresUserPermission: true,
          canScheduleExactAlarms: false,
          supportsBatchOperations: false
        };
    }
  }

  shouldUseBackgroundSync(): boolean {
    return this.capabilities.backgroundFetch && this.capabilities.backgroundProcessing;
  }

  shouldUseAggressiveCaching(): boolean {
    const memoryGB = (this.deviceInfo.totalMemory || 0) / (1024 * 1024 * 1024);
    return memoryGB >= 4 && Platform.OS !== 'ios';
  }

  shouldCompressMedia(): boolean {
    // Always compress on mobile, optional on web
    return Platform.OS !== 'web';
  }

  getRecommendedSyncStrategy(): {
    strategy: 'realtime' | 'periodic' | 'manual';
    interval?: number;
    triggers: string[];
  } {
    if (Platform.OS === 'web') {
      return {
        strategy: 'realtime',
        triggers: ['user_action', 'network_change', 'visibility_change']
      };
    }

    if (this.capabilities.backgroundFetch) {
      return {
        strategy: 'periodic',
        interval: this.getOptimizationRecommendations().syncInterval,
        triggers: ['background_fetch', 'app_foreground', 'network_change']
      };
    }

    return {
      strategy: 'manual',
      triggers: ['user_action', 'app_foreground']
    };
  }

  // Performance monitoring
  async measurePerformance<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<{ result: T; duration: number; memoryUsage?: number }> {
    const startTime = Date.now();
    const startMemory = this.getMemoryUsage();

    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      const endMemory = this.getMemoryUsage();
      const memoryUsage = endMemory && startMemory ? endMemory - startMemory : undefined;

      console.log(`⚡ ${operationName} completed in ${duration}ms${memoryUsage ? `, memory: ${memoryUsage}MB` : ''}`);

      return { result, duration, memoryUsage };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${operationName} failed after ${duration}ms:`, error);
      throw error;
    }
  }

  private getMemoryUsage(): number | undefined {
    if (Platform.OS === 'web' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
    }
    return undefined;
  }

  // Public API
  getCapabilities(): PlatformCapabilities {
    return { ...this.capabilities };
  }

  getDeviceInfo(): any {
    return { ...this.deviceInfo };
  }

  isLowEndDevice(): boolean {
    const memoryGB = (this.deviceInfo.totalMemory || 0) / (1024 * 1024 * 1024);
    return memoryGB < 2 || this.deviceInfo.deviceType === Device.DeviceType.PHONE;
  }

  supportsFeature(feature: keyof PlatformCapabilities): boolean {
    return this.capabilities[feature];
  }
}

// Singleton instance
let platformOptimizerInstance: PlatformOptimizer | null = null;

export const getPlatformOptimizer = (): PlatformOptimizer => {
  if (!platformOptimizerInstance) {
    platformOptimizerInstance = new PlatformOptimizer();
  }
  return platformOptimizerInstance;
};
