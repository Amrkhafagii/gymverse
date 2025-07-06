import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DeviceAuthManager, DeviceUser, DeviceProfile, DeviceSettings } from '@/lib/auth/deviceAuth';
import { AnonymousCloudSync } from '@/lib/sync/anonymousSync';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DeviceAuthContextType {
  user: DeviceUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  isFirstLaunch: boolean;
  updateProfile: (updates: Partial<DeviceProfile>) => Promise<void>;
  updateSettings: (updates: Partial<DeviceSettings>) => Promise<void>;
  enableCloudBackup: (backupKey: string) => Promise<string>;
  disableCloudBackup: () => Promise<void>;
  syncToCloud: () => Promise<void>;
  exportDeviceData: () => Promise<string>;
  importDeviceData: (data: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const DeviceAuthContext = createContext<DeviceAuthContextType | undefined>(undefined);

export function useDeviceAuth() {
  const context = useContext(DeviceAuthContext);
  if (context === undefined) {
    throw new Error('useDeviceAuth must be used within a DeviceAuthProvider');
  }
  return context;
}

interface DeviceAuthProviderProps {
  children: ReactNode;
}

export function DeviceAuthProvider({ children }: DeviceAuthProviderProps) {
  const [user, setUser] = useState<DeviceUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    initializeDeviceAuth();
  }, []);

  const initializeDeviceAuth = async () => {
    try {
      setIsLoading(true);
      
      // Generate or retrieve device identity
      const deviceId = await DeviceAuthManager.getOrCreateDeviceId();
      const deviceFingerprint = await DeviceAuthManager.generateDeviceFingerprint();
      const deviceInfo = await DeviceAuthManager.getDeviceInfo();
      
      // Check if this is first launch
      const firstLaunch = await DeviceAuthManager.isFirstLaunch();
      setIsFirstLaunch(firstLaunch);
      
      // Load existing profile and settings or create new ones
      const existingProfile = await DeviceAuthManager.loadDeviceProfile(deviceId);
      const existingSettings = await DeviceAuthManager.loadDeviceSettings(deviceId);
      
      const profile = existingProfile || DeviceAuthManager.createDefaultProfile();
      const settings = existingSettings || DeviceAuthManager.createDefaultSettings();
      
      // Get timestamps
      const lastActiveAt = await DeviceAuthManager.getLastActive(deviceId);
      const createdAt = existingProfile ? lastActiveAt : new Date();
      
      const deviceUser: DeviceUser = {
        deviceId,
        deviceFingerprint,
        platform: deviceInfo.platform,
        deviceName: deviceInfo.deviceName,
        profile,
        settings,
        isFirstLaunch: firstLaunch,
        lastActiveAt,
        createdAt,
      };

      // Save/update device info if this is a new profile
      if (!existingProfile) {
        await DeviceAuthManager.saveDeviceProfile(deviceId, profile);
      }
      if (!existingSettings) {
        await DeviceAuthManager.saveDeviceSettings(deviceId, settings);
      }
      
      // Update last active timestamp
      await DeviceAuthManager.updateLastActive(deviceId);
      
      setUser(deviceUser);
      setIsInitialized(true);
      
      console.log('Device auth initialized:', {
        deviceId: deviceId.substring(0, 12) + '...',
        platform: deviceInfo.platform,
        isFirstLaunch: firstLaunch,
      });
      
    } catch (error) {
      console.error('Device auth initialization failed:', error);
      // Create minimal fallback user
      const fallbackUser = DeviceAuthManager.createFallbackUser();
      setUser(fallbackUser);
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<DeviceProfile>) => {
    if (!user) {
      throw new Error('No user available for profile update');
    }

    try {
      const updatedProfile = { ...user.profile, ...updates };
      const updatedUser = { 
        ...user, 
        profile: updatedProfile,
        lastActiveAt: new Date(),
      };
      
      // Save locally
      await DeviceAuthManager.saveDeviceProfile(user.deviceId, updatedProfile);
      await DeviceAuthManager.updateLastActive(user.deviceId);
      
      setUser(updatedUser);
      
      // Optional cloud sync if enabled
      if (updatedProfile.cloudBackupEnabled) {
        try {
          await syncToCloud();
        } catch (error) {
          console.warn('Cloud sync failed after profile update:', error);
          // Don't throw error - local update succeeded
        }
      }
      
      console.log('Profile updated successfully');
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error('Profile update failed');
    }
  };

  const updateSettings = async (updates: Partial<DeviceSettings>) => {
    if (!user) {
      throw new Error('No user available for settings update');
    }

    try {
      const updatedSettings = { ...user.settings, ...updates };
      const updatedUser = { 
        ...user, 
        settings: updatedSettings,
        lastActiveAt: new Date(),
      };
      
      // Save locally
      await DeviceAuthManager.saveDeviceSettings(user.deviceId, updatedSettings);
      await DeviceAuthManager.updateLastActive(user.deviceId);
      
      setUser(updatedUser);
      
      console.log('Settings updated successfully');
      
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw new Error('Settings update failed');
    }
  };

  const enableCloudBackup = async (backupKey: string): Promise<string> => {
    if (!user) {
      throw new Error('No user available for cloud backup');
    }

    try {
      const backupId = await AnonymousCloudSync.enableCloudBackup(user, backupKey);
      
      // Update profile to reflect cloud backup enabled
      await updateProfile({ cloudBackupEnabled: true });
      
      // Store backup key locally (encrypted in production)
      await AsyncStorage.setItem('user_backup_key', backupKey);
      
      console.log('Cloud backup enabled successfully');
      return backupId;
      
    } catch (error) {
      console.error('Failed to enable cloud backup:', error);
      throw new Error('Cloud backup setup failed');
    }
  };

  const disableCloudBackup = async () => {
    if (!user) {
      throw new Error('No user available');
    }

    try {
      // Remove local backup data
      await AsyncStorage.removeItem('cloud_backup_id');
      await AsyncStorage.removeItem('user_backup_key');
      await AsyncStorage.removeItem('last_cloud_sync');
      
      // Update profile
      await updateProfile({ cloudBackupEnabled: false });
      
      console.log('Cloud backup disabled successfully');
      
    } catch (error) {
      console.error('Failed to disable cloud backup:', error);
      throw new Error('Failed to disable cloud backup');
    }
  };

  const syncToCloud = async () => {
    if (!user || !user.profile.cloudBackupEnabled) {
      throw new Error('Cloud backup not enabled');
    }

    try {
      await AnonymousCloudSync.syncToCloud(user);
      console.log('Cloud sync completed successfully');
      
    } catch (error) {
      console.error('Cloud sync failed:', error);
      throw new Error('Cloud sync failed');
    }
  };

  const exportDeviceData = async (): Promise<string> => {
    if (!user) {
      throw new Error('No user data to export');
    }

    try {
      const exportData = {
        deviceInfo: {
          deviceId: user.deviceId,
          platform: user.platform,
          deviceName: user.deviceName,
          createdAt: user.createdAt,
        },
        profile: user.profile,
        settings: user.settings,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };
      
      const dataString = JSON.stringify(exportData, null, 2);
      
      // In a real app, you'd save this to a file and return the file URI
      console.log('Data exported successfully');
      return dataString;
      
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('Data export failed');
    }
  };

  const importDeviceData = async (data: string) => {
    try {
      const importData = JSON.parse(data);
      
      if (!importData.profile || !importData.settings) {
        throw new Error('Invalid import data format');
      }
      
      // Update profile and settings
      await updateProfile(importData.profile);
      await updateSettings(importData.settings);
      
      console.log('Data imported successfully');
      
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Data import failed');
    }
  };

  const completeOnboarding = async () => {
    try {
      await DeviceAuthManager.markFirstLaunchCompleted();
      
      if (user) {
        const updatedUser = { ...user, isFirstLaunch: false };
        setUser(updatedUser);
      }
      
      setIsFirstLaunch(false);
      console.log('Onboarding completed');
      
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw new Error('Onboarding completion failed');
    }
  };

  const refreshUser = async () => {
    if (user) {
      try {
        // Reload profile and settings from storage
        const profile = await DeviceAuthManager.loadDeviceProfile(user.deviceId);
        const settings = await DeviceAuthManager.loadDeviceSettings(user.deviceId);
        const lastActiveAt = await DeviceAuthManager.getLastActive(user.deviceId);
        
        if (profile && settings) {
          const refreshedUser = {
            ...user,
            profile,
            settings,
            lastActiveAt,
          };
          setUser(refreshedUser);
        }
        
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  const contextValue: DeviceAuthContextType = {
    user,
    isLoading,
    isInitialized,
    isFirstLaunch,
    updateProfile,
    updateSettings,
    enableCloudBackup,
    disableCloudBackup,
    syncToCloud,
    exportDeviceData,
    importDeviceData,
    completeOnboarding,
    refreshUser,
  };

  return (
    <DeviceAuthContext.Provider value={contextValue}>
      {children}
    </DeviceAuthContext.Provider>
  );
}
