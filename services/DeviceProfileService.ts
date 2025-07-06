import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceUser, DeviceProfile, DeviceAuthManager } from '@/lib/auth/deviceAuth';
import { AnonymousCloudSync } from '@/lib/sync/anonymousSync';

export interface ProfileStats {
  profileCompleteness: number;
  daysActive: number;
  lastUpdated: Date;
  totalWorkouts?: number; // Will be populated in Chunk 2
  totalAchievements?: number; // Will be populated in Chunk 3
}

export interface DeviceStats {
  storageUsed: number; // in MB
  totalSessions: number;
  averageSessionLength: number; // in minutes
  lastBackupDate?: Date;
}

export class DeviceProfileService {
  private static readonly PROFILE_STATS_KEY = 'profile_stats';
  private static readonly DEVICE_STATS_KEY = 'device_stats';
  private static readonly SESSION_COUNT_KEY = 'session_count';
  private static readonly FIRST_INSTALL_KEY = 'first_install_date';

  // Get comprehensive profile statistics
  static async getProfileStats(deviceId: string): Promise<ProfileStats | null> {
    try {
      const profile = await DeviceAuthManager.loadDeviceProfile(deviceId);
      if (!profile) return null;

      const completeness = this.calculateProfileCompleteness(profile);
      const daysActive = await this.calculateDaysActive(deviceId);
      const lastUpdated = await this.getLastUpdateTime(deviceId);

      const stats: ProfileStats = {
        profileCompleteness: completeness,
        daysActive,
        lastUpdated,
      };

      // Cache stats for performance
      await AsyncStorage.setItem(
        `${this.PROFILE_STATS_KEY}_${deviceId}`,
        JSON.stringify(stats)
      );

      return stats;
    } catch (error) {
      console.error('Failed to get profile stats:', error);
      return null;
    }
  }

  // Get device usage statistics
  static async getDeviceStats(deviceId: string): Promise<DeviceStats> {
    try {
      const storageUsed = await this.calculateStorageUsage();
      const totalSessions = await this.getTotalSessions(deviceId);
      const averageSessionLength = await this.getAverageSessionLength(deviceId);
      const lastBackupDate = await AnonymousCloudSync.getLastSyncTime();

      return {
        storageUsed,
        totalSessions,
        averageSessionLength,
        lastBackupDate: lastBackupDate || undefined,
      };
    } catch (error) {
      console.error('Failed to get device stats:', error);
      return {
        storageUsed: 0,
        totalSessions: 0,
        averageSessionLength: 0,
      };
    }
  }

  // Update specific profile field
  static async updateProfileField(
    deviceId: string,
    field: keyof DeviceProfile,
    value: any
  ): Promise<void> {
    try {
      const currentProfile = await DeviceAuthManager.loadDeviceProfile(deviceId);
      if (!currentProfile) {
        throw new Error('Profile not found');
      }

      const updatedProfile = { ...currentProfile, [field]: value };
      await DeviceAuthManager.saveDeviceProfile(deviceId, updatedProfile);

      // Update last modified time
      await AsyncStorage.setItem(
        `profile_last_updated_${deviceId}`,
        new Date().toISOString()
      );

      console.log(`Profile field ${field} updated successfully`);
    } catch (error) {
      console.error(`Failed to update profile field ${field}:`, error);
      throw new Error(`Failed to update ${field}`);
    }
  }

  // Export complete device data
  static async exportDeviceData(deviceId: string): Promise<{
    data: string;
    fileUri?: string;
  }> {
    try {
      const profile = await DeviceAuthManager.loadDeviceProfile(deviceId);
      const settings = await DeviceAuthManager.loadDeviceSettings(deviceId);
      const stats = await this.getProfileStats(deviceId);
      const deviceStats = await this.getDeviceStats(deviceId);

      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        deviceId: deviceId.substring(0, 12) + '...', // Partial ID for privacy
        profile,
        settings,
        stats,
        deviceStats,
        // Future chunks will add workout data, achievements, etc.
      };

      const dataString = JSON.stringify(exportData, null, 2);

      // In a real app, you'd save this to a file and return the file URI
      // For now, return the data string
      return {
        data: dataString,
      };
    } catch (error) {
      console.error('Failed to export device data:', error);
      throw new Error('Data export failed');
    }
  }

  // Import device data from backup
  static async importDeviceData(deviceId: string, importData: string): Promise<void> {
    try {
      const data = JSON.parse(importData);

      if (!data.profile || !data.settings) {
        throw new Error('Invalid import data format');
      }

      // Validate data structure
      if (!this.validateImportData(data)) {
        throw new Error('Import data validation failed');
      }

      // Import profile
      if (data.profile) {
        await DeviceAuthManager.saveDeviceProfile(deviceId, data.profile);
      }

      // Import settings
      if (data.settings) {
        await DeviceAuthManager.saveDeviceSettings(deviceId, data.settings);
      }

      // Update import timestamp
      await AsyncStorage.setItem(
        `data_imported_${deviceId}`,
        new Date().toISOString()
      );

      console.log('Device data imported successfully');
    } catch (error) {
      console.error('Failed to import device data:', error);
      throw new Error('Data import failed');
    }
  }

  // Clear all device data (for reset functionality)
  static async clearDeviceData(deviceId: string): Promise<void> {
    try {
      // Remove profile and settings
      await AsyncStorage.removeItem(`device_profile_${deviceId}`);
      await AsyncStorage.removeItem(`device_settings_${deviceId}`);
      
      // Remove stats and cache
      await AsyncStorage.removeItem(`${this.PROFILE_STATS_KEY}_${deviceId}`);
      await AsyncStorage.removeItem(`${this.DEVICE_STATS_KEY}_${deviceId}`);
      await AsyncStorage.removeItem(`profile_last_updated_${deviceId}`);
      await AsyncStorage.removeItem(`last_active_${deviceId}`);
      
      // Remove session data
      await AsyncStorage.removeItem(`${this.SESSION_COUNT_KEY}_${deviceId}`);
      
      console.log('Device data cleared successfully');
    } catch (error) {
      console.error('Failed to clear device data:', error);
      throw new Error('Failed to clear device data');
    }
  }

  // Track app session
  static async trackSession(deviceId: string, sessionLengthMinutes: number): Promise<void> {
    try {
      const currentCount = await this.getTotalSessions(deviceId);
      await AsyncStorage.setItem(
        `${this.SESSION_COUNT_KEY}_${deviceId}`,
        (currentCount + 1).toString()
      );

      // Store session length for average calculation
      const sessionsKey = `session_lengths_${deviceId}`;
      const existingSessions = await AsyncStorage.getItem(sessionsKey);
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      
      sessions.push({
        length: sessionLengthMinutes,
        date: new Date().toISOString(),
      });

      // Keep only last 30 sessions for performance
      const recentSessions = sessions.slice(-30);
      await AsyncStorage.setItem(sessionsKey, JSON.stringify(recentSessions));

    } catch (error) {
      console.error('Failed to track session:', error);
    }
  }

  // Get profile completion suggestions
  static getProfileCompletionSuggestions(profile: DeviceProfile): string[] {
    const suggestions: string[] = [];

    if (!profile.fullName) {
      suggestions.push('Add your name to personalize your experience');
    }
    if (!profile.bio) {
      suggestions.push('Write a short bio about your fitness journey');
    }
    if (!profile.dateOfBirth) {
      suggestions.push('Add your birth date for age-specific recommendations');
    }
    if (!profile.heightCm || !profile.weightKg) {
      suggestions.push('Add your height and weight for accurate calorie tracking');
    }
    if (!profile.avatarUrl) {
      suggestions.push('Upload a profile photo');
    }
    if (profile.fitnessLevel === 'beginner') {
      suggestions.push('Update your fitness level as you progress');
    }

    return suggestions;
  }

  // Private helper methods

  private static calculateProfileCompleteness(profile: DeviceProfile): number {
    const fields = [
      'fullName',
      'bio', 
      'dateOfBirth',
      'heightCm',
      'weightKg',
      'avatarUrl'
    ];
    
    const completedFields = fields.filter(field => {
      const value = profile[field as keyof DeviceProfile];
      return value !== undefined && value !== null && value !== '';
    });

    return Math.round((completedFields.length / fields.length) * 100);
  }

  private static async calculateDaysActive(deviceId: string): Promise<number> {
    try {
      const firstInstall = await AsyncStorage.getItem(`${this.FIRST_INSTALL_KEY}_${deviceId}`);
      const installDate = firstInstall ? new Date(firstInstall) : new Date();
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - installDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (error) {
      console.error('Failed to calculate days active:', error);
      return 1;
    }
  }

  private static async getLastUpdateTime(deviceId: string): Promise<Date> {
    try {
      const lastUpdate = await AsyncStorage.getItem(`profile_last_updated_${deviceId}`);
      return lastUpdate ? new Date(lastUpdate) : new Date();
    } catch (error) {
      console.error('Failed to get last update time:', error);
      return new Date();
    }
  }

  private static async calculateStorageUsage(): Promise<number> {
    try {
      // Get all AsyncStorage keys and estimate storage usage
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }

      // Convert bytes to MB
      return Math.round((totalSize / (1024 * 1024)) * 100) / 100;
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
      return 0;
    }
  }

  private static async getTotalSessions(deviceId: string): Promise<number> {
    try {
      const count = await AsyncStorage.getItem(`${this.SESSION_COUNT_KEY}_${deviceId}`);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Failed to get total sessions:', error);
      return 0;
    }
  }

  private static async getAverageSessionLength(deviceId: string): Promise<number> {
    try {
      const sessionsKey = `session_lengths_${deviceId}`;
      const sessionsData = await AsyncStorage.getItem(sessionsKey);
      
      if (!sessionsData) return 0;
      
      const sessions = JSON.parse(sessionsData);
      if (sessions.length === 0) return 0;
      
      const totalLength = sessions.reduce((sum: number, session: any) => sum + session.length, 0);
      return Math.round(totalLength / sessions.length);
    } catch (error) {
      console.error('Failed to get average session length:', error);
      return 0;
    }
  }

  private static validateImportData(data: any): boolean {
    try {
      // Basic validation of import data structure
      if (!data.profile || typeof data.profile !== 'object') return false;
      if (!data.settings || typeof data.settings !== 'object') return false;
      
      // Validate required profile fields
      const requiredProfileFields = ['fitnessLevel', 'preferredUnits', 'isPublic'];
      for (const field of requiredProfileFields) {
        if (!(field in data.profile)) return false;
      }
      
      // Validate required settings fields
      if (!data.settings.notifications || !data.settings.appearance) return false;
      
      return true;
    } catch (error) {
      console.error('Import data validation error:', error);
      return false;
    }
  }
}
