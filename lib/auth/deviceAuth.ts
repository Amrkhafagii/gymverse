import * as Device from 'expo-device';
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface DeviceInfo {
  platform: string;
  deviceName: string;
  model: string | null;
  brand: string | null;
  osVersion: string | null;
  appVersion: string | null;
}

export interface DeviceProfile {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  heightCm?: number;
  weightKg?: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredUnits: 'metric' | 'imperial';
  isPublic: boolean;
  allowAnonymousSharing: boolean;
  cloudBackupEnabled: boolean;
}

export interface DeviceSettings {
  notifications: {
    workoutReminders: boolean;
    progressUpdates: boolean;
    socialActivity: boolean;
  };
  appearance: {
    darkMode: boolean;
    accentColor: string;
  };
  workout: {
    autoStartTimer: boolean;
    hapticFeedback: boolean;
    soundEffects: boolean;
  };
  privacy: {
    shareProgress: boolean;
    showInLeaderboards: boolean;
  };
}

export interface DeviceUser {
  deviceId: string;
  deviceFingerprint: string;
  platform: string;
  deviceName: string;
  profile: DeviceProfile;
  settings: DeviceSettings;
  isFirstLaunch: boolean;
  lastActiveAt: Date;
  createdAt: Date;
}

export class DeviceAuthManager {
  private static readonly DEVICE_ID_KEY = 'device_id';
  private static readonly DEVICE_PROFILE_KEY = 'device_profile';
  private static readonly DEVICE_SETTINGS_KEY = 'device_settings';
  private static readonly FIRST_LAUNCH_KEY = 'first_launch_completed';

  // Generate or retrieve persistent device ID
  static async getOrCreateDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem(this.DEVICE_ID_KEY);
      
      if (!deviceId) {
        // Create unique device ID
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        deviceId = `device_${timestamp}_${random}`;
        await AsyncStorage.setItem(this.DEVICE_ID_KEY, deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('Failed to get/create device ID:', error);
      // Fallback to session-based ID
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  // Generate device fingerprint for verification
  static async generateDeviceFingerprint(): Promise<string> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      
      const fingerprintData = {
        platform: deviceInfo.platform,
        model: deviceInfo.model,
        brand: deviceInfo.brand,
        osVersion: deviceInfo.osVersion,
        appVersion: deviceInfo.appVersion,
      };
      
      // Create hash of device characteristics
      const fingerprintString = JSON.stringify(fingerprintData);
      const fingerprint = btoa(fingerprintString).replace(/[^a-zA-Z0-9]/g, '').substr(0, 32);
      return fingerprint;
    } catch (error) {
      console.error('Failed to generate device fingerprint:', error);
      return `fallback_${Date.now()}`;
    }
  }

  // Get device information
  static async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      return {
        platform: Platform.OS,
        deviceName: Device.deviceName || `${Device.brand} ${Device.modelName}` || 'Unknown Device',
        model: Device.modelName,
        brand: Device.brand,
        osVersion: Device.osVersion,
        appVersion: Application.nativeApplicationVersion,
      };
    } catch (error) {
      console.error('Failed to get device info:', error);
      return {
        platform: Platform.OS,
        deviceName: 'Unknown Device',
        model: null,
        brand: null,
        osVersion: null,
        appVersion: null,
      };
    }
  }

  // Create default profile for new devices
  static createDefaultProfile(): DeviceProfile {
    return {
      fitnessLevel: 'beginner',
      preferredUnits: 'metric',
      isPublic: false,
      allowAnonymousSharing: false,
      cloudBackupEnabled: false,
    };
  }

  // Create default settings for new devices
  static createDefaultSettings(): DeviceSettings {
    return {
      notifications: {
        workoutReminders: true,
        progressUpdates: true,
        socialActivity: false,
      },
      appearance: {
        darkMode: true,
        accentColor: '#9E7FFF',
      },
      workout: {
        autoStartTimer: true,
        hapticFeedback: true,
        soundEffects: false,
      },
      privacy: {
        shareProgress: false,
        showInLeaderboards: false,
      },
    };
  }

  // Check if this is the first app launch
  static async isFirstLaunch(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(this.FIRST_LAUNCH_KEY);
      return completed !== 'true';
    } catch (error) {
      console.error('Failed to check first launch:', error);
      return true;
    }
  }

  // Mark first launch as completed
  static async markFirstLaunchCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.FIRST_LAUNCH_KEY, 'true');
    } catch (error) {
      console.error('Failed to mark first launch completed:', error);
    }
  }

  // Save device profile
  static async saveDeviceProfile(deviceId: string, profile: DeviceProfile): Promise<void> {
    try {
      const profileData = {
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(
        `${this.DEVICE_PROFILE_KEY}_${deviceId}`,
        JSON.stringify(profileData)
      );
    } catch (error) {
      console.error('Failed to save device profile:', error);
      throw new Error('Profile save failed');
    }
  }

  // Load device profile
  static async loadDeviceProfile(deviceId: string): Promise<DeviceProfile | null> {
    try {
      const stored = await AsyncStorage.getItem(`${this.DEVICE_PROFILE_KEY}_${deviceId}`);
      if (stored) {
        const profileData = JSON.parse(stored);
        // Remove updatedAt from profile data
        const { updatedAt, ...profile } = profileData;
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Failed to load device profile:', error);
      return null;
    }
  }

  // Save device settings
  static async saveDeviceSettings(deviceId: string, settings: DeviceSettings): Promise<void> {
    try {
      const settingsData = {
        ...settings,
        updatedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(
        `${this.DEVICE_SETTINGS_KEY}_${deviceId}`,
        JSON.stringify(settingsData)
      );
    } catch (error) {
      console.error('Failed to save device settings:', error);
      throw new Error('Settings save failed');
    }
  }

  // Load device settings
  static async loadDeviceSettings(deviceId: string): Promise<DeviceSettings | null> {
    try {
      const stored = await AsyncStorage.getItem(`${this.DEVICE_SETTINGS_KEY}_${deviceId}`);
      if (stored) {
        const settingsData = JSON.parse(stored);
        // Remove updatedAt from settings data
        const { updatedAt, ...settings } = settingsData;
        return settings;
      }
      return null;
    } catch (error) {
      console.error('Failed to load device settings:', error);
      return null;
    }
  }

  // Create fallback user for error scenarios
  static createFallbackUser(): DeviceUser {
    const now = new Date();
    return {
      deviceId: `fallback_${Date.now()}`,
      deviceFingerprint: `fallback_${Date.now()}`,
      platform: Platform.OS,
      deviceName: 'Unknown Device',
      profile: this.createDefaultProfile(),
      settings: this.createDefaultSettings(),
      isFirstLaunch: true,
      lastActiveAt: now,
      createdAt: now,
    };
  }

  // Update last active timestamp
  static async updateLastActive(deviceId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`last_active_${deviceId}`, new Date().toISOString());
    } catch (error) {
      console.error('Failed to update last active:', error);
    }
  }

  // Get last active timestamp
  static async getLastActive(deviceId: string): Promise<Date> {
    try {
      const stored = await AsyncStorage.getItem(`last_active_${deviceId}`);
      return stored ? new Date(stored) : new Date();
    } catch (error) {
      console.error('Failed to get last active:', error);
      return new Date();
    }
  }
}
