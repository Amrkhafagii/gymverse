import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceUser } from '@/lib/auth/deviceAuth';
import { supabase } from '@/lib/supabase';

export interface BackupData {
  profile: any;
  settings: any;
  deviceInfo: {
    platform: string;
    deviceName: string;
  };
  workoutData?: any; // Will be populated in Chunk 2
  achievements?: any; // Will be populated in Chunk 3
}

export class AnonymousCloudSync {
  private static readonly BACKUP_ID_KEY = 'cloud_backup_id';
  private static readonly BACKUP_KEY_KEY = 'user_backup_key';
  private static readonly LAST_SYNC_KEY = 'last_cloud_sync';

  // Enable cloud backup with user-generated key
  static async enableCloudBackup(user: DeviceUser, userKey: string): Promise<string> {
    try {
      // Validate backup key
      if (!userKey || userKey.length < 8) {
        throw new Error('Backup key must be at least 8 characters long');
      }

      // Prepare data for backup
      const backupData: BackupData = {
        profile: user.profile,
        settings: user.settings,
        deviceInfo: {
          platform: user.platform,
          deviceName: user.deviceName,
        },
      };

      // Encrypt user data with their key
      const encryptedData = await this.encryptUserData(backupData, userKey);
      
      // Store anonymously in Supabase
      const { data, error } = await supabase
        .from('anonymous_backups')
        .insert({
          device_fingerprint: user.deviceFingerprint,
          backup_key: await this.hashKey(userKey), // Hashed for lookup
          encrypted_data: encryptedData,
          data_version: 1,
        })
        .select('backup_id')
        .single();

      if (error) {
        console.error('Supabase backup error:', error);
        throw new Error('Failed to create cloud backup');
      }

      // Save backup info locally
      await AsyncStorage.setItem(this.BACKUP_ID_KEY, data.backup_id);
      await AsyncStorage.setItem(this.BACKUP_KEY_KEY, userKey);
      await AsyncStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
      
      console.log('Cloud backup enabled successfully:', data.backup_id);
      return data.backup_id;
      
    } catch (error) {
      console.error('Cloud backup enable failed:', error);
      throw new Error('Failed to enable cloud backup');
    }
  }

  // Sync data to cloud (update existing backup)
  static async syncToCloud(user: DeviceUser): Promise<void> {
    try {
      const backupId = await AsyncStorage.getItem(this.BACKUP_ID_KEY);
      const userKey = await AsyncStorage.getItem(this.BACKUP_KEY_KEY);
      
      if (!backupId || !userKey) {
        throw new Error('Cloud backup not configured');
      }

      // Prepare updated data
      const backupData: BackupData = {
        profile: user.profile,
        settings: user.settings,
        deviceInfo: {
          platform: user.platform,
          deviceName: user.deviceName,
        },
      };

      const encryptedData = await this.encryptUserData(backupData, userKey);
      const currentVersion = await this.getCurrentVersion(backupId);
      
      const { error } = await supabase
        .from('anonymous_backups')
        .update({
          encrypted_data: encryptedData,
          data_version: currentVersion + 1,
        })
        .eq('backup_id', backupId);

      if (error) {
        console.error('Supabase sync error:', error);
        throw new Error('Failed to sync to cloud');
      }
      
      // Update local sync status
      await AsyncStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
      
      console.log('Cloud sync completed successfully');
      
    } catch (error) {
      console.error('Cloud sync failed:', error);
      throw new Error('Failed to sync to cloud');
    }
  }

  // Restore data from cloud with user key
  static async restoreFromCloud(deviceFingerprint: string, userKey: string): Promise<BackupData | null> {
    try {
      if (!userKey || userKey.length < 8) {
        throw new Error('Invalid backup key');
      }

      const hashedKey = await this.hashKey(userKey);
      
      const { data, error } = await supabase
        .from('anonymous_backups')
        .select('encrypted_data, backup_id')
        .eq('device_fingerprint', deviceFingerprint)
        .eq('backup_key', hashedKey)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.log('No backup found or invalid key');
        return null;
      }

      // Decrypt and restore user data
      const backupData = await this.decryptUserData(data.encrypted_data, userKey);
      
      // Store backup info locally for future syncs
      await AsyncStorage.setItem(this.BACKUP_ID_KEY, data.backup_id);
      await AsyncStorage.setItem(this.BACKUP_KEY_KEY, userKey);
      
      console.log('Data restored from cloud successfully');
      return backupData;
      
    } catch (error) {
      console.error('Cloud restore failed:', error);
      return null;
    }
  }

  // Check if cloud backup is available for device
  static async checkBackupAvailable(deviceFingerprint: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('anonymous_backups')
        .select('backup_id')
        .eq('device_fingerprint', deviceFingerprint)
        .limit(1)
        .single();

      return !error && !!data;
      
    } catch (error) {
      console.error('Failed to check backup availability:', error);
      return false;
    }
  }

  // Get last sync time
  static async getLastSyncTime(): Promise<Date | null> {
    try {
      const lastSync = await AsyncStorage.getItem(this.LAST_SYNC_KEY);
      return lastSync ? new Date(lastSync) : null;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  }

  // Check if cloud backup is configured
  static async isCloudBackupConfigured(): Promise<boolean> {
    try {
      const backupId = await AsyncStorage.getItem(this.BACKUP_ID_KEY);
      const userKey = await AsyncStorage.getItem(this.BACKUP_KEY_KEY);
      return !!(backupId && userKey);
    } catch (error) {
      console.error('Failed to check backup configuration:', error);
      return false;
    }
  }

  // Delete cloud backup
  static async deleteCloudBackup(): Promise<void> {
    try {
      const backupId = await AsyncStorage.getItem(this.BACKUP_ID_KEY);
      
      if (backupId) {
        const { error } = await supabase
          .from('anonymous_backups')
          .delete()
          .eq('backup_id', backupId);

        if (error) {
          console.error('Failed to delete cloud backup:', error);
        }
      }

      // Clear local backup data
      await AsyncStorage.removeItem(this.BACKUP_ID_KEY);
      await AsyncStorage.removeItem(this.BACKUP_KEY_KEY);
      await AsyncStorage.removeItem(this.LAST_SYNC_KEY);
      
      console.log('Cloud backup deleted successfully');
      
    } catch (error) {
      console.error('Failed to delete cloud backup:', error);
      throw new Error('Failed to delete cloud backup');
    }
  }

  // Private helper methods

  private static async encryptUserData(data: BackupData, key: string): Promise<string> {
    try {
      // Simple encryption - in production use proper encryption library like crypto-js
      const dataString = JSON.stringify(data);
      const encrypted = btoa(dataString + '::' + key);
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  private static async decryptUserData(encryptedData: string, key: string): Promise<BackupData> {
    try {
      // Simple decryption - in production use proper decryption
      const decrypted = atob(encryptedData);
      const [dataString] = decrypted.split('::' + key);
      
      if (!dataString) {
        throw new Error('Invalid backup key');
      }
      
      return JSON.parse(dataString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data - invalid backup key');
    }
  }

  private static async hashKey(key: string): Promise<string> {
    try {
      // Simple hash - use proper hashing in production (e.g., SHA-256)
      const hash = btoa(key + 'salt_gymverse_2024').replace(/[^a-zA-Z0-9]/g, '');
      return hash.substr(0, 32);
    } catch (error) {
      console.error('Key hashing failed:', error);
      throw new Error('Failed to process backup key');
    }
  }

  private static async getCurrentVersion(backupId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('anonymous_backups')
        .select('data_version')
        .eq('backup_id', backupId)
        .single();

      if (error || !data) {
        return 1;
      }

      return data.data_version || 1;
    } catch (error) {
      console.error('Failed to get current version:', error);
      return 1;
    }
  }
}
