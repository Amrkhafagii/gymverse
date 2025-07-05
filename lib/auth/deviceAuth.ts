import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

export interface DeviceUser {
  id: string;
  deviceId: string;
  platform: string;
  deviceName: string;
  createdAt: string;
  lastActiveAt: string;
  isActive: boolean;
}

class DeviceAuthService {
  private static instance: DeviceAuthService;
  private currentUser: DeviceUser | null = null;
  private listeners: ((user: DeviceUser | null) => void)[] = [];

  private constructor() {}

  static getInstance(): DeviceAuthService {
    if (!DeviceAuthService.instance) {
      DeviceAuthService.instance = new DeviceAuthService();
    }
    return DeviceAuthService.instance;
  }

  private async getDeviceIdentifier(): Promise<string> {
    try {
      if (Platform.OS === 'android') {
        // Use Android ID as primary identifier
        const androidId = Application.androidId;
        if (androidId) {
          return `android_${androidId}`;
        }
        
        // Fallback to installation ID if Android ID is not available
        const installationId = Application.getInstallationIdAsync ? 
          await Application.getInstallationIdAsync() : null;
        if (installationId) {
          return `android_install_${installationId}`;
        }
      } else if (Platform.OS === 'ios') {
        // Use identifierForVendor (IDFV) for iOS
        const idfv = await Application.getIosIdForVendorAsync();
        if (idfv) {
          return `ios_${idfv}`;
        }
      }

      // Generate a unique device-based identifier as last resort
      const deviceInfo = `${Platform.OS}_${Device.modelName}_${Device.osVersion}`;
      const timestamp = Date.now().toString();
      return `device_${Buffer.from(deviceInfo + timestamp).toString('base64').slice(0, 16)}`;
    } catch (error) {
      console.error('Error getting device identifier:', error);
      // Generate fallback identifier
      const fallbackId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return fallbackId;
    }
  }

  private async createDeviceUser(deviceId: string): Promise<DeviceUser> {
    const deviceName = Device.deviceName || `${Platform.OS} Device`;
    const now = new Date().toISOString();
    
    const user: DeviceUser = {
      id: deviceId,
      deviceId,
      platform: Platform.OS,
      deviceName,
      createdAt: now,
      lastActiveAt: now,
      isActive: true,
    };

    // Store user data locally
    await AsyncStorage.setItem('device_user', JSON.stringify(user));
    await AsyncStorage.setItem('device_session_active', 'true');
    
    return user;
  }

  private async loadStoredUser(): Promise<DeviceUser | null> {
    try {
      const storedUser = await AsyncStorage.getItem('device_user');
      const sessionActive = await AsyncStorage.getItem('device_session_active');
      
      if (storedUser && sessionActive === 'true') {
        const user: DeviceUser = JSON.parse(storedUser);
        
        // Update last active time
        user.lastActiveAt = new Date().toISOString();
        await AsyncStorage.setItem('device_user', JSON.stringify(user));
        
        return user;
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    }
    return null;
  }

  async initialize(): Promise<DeviceUser> {
    try {
      // First, try to load existing user session
      let user = await this.loadStoredUser();
      
      if (!user) {
        // Create new device-based user session
        const deviceId = await this.getDeviceIdentifier();
        user = await this.createDeviceUser(deviceId);
      }

      this.currentUser = user;
      this.notifyListeners();
      
      return user;
    } catch (error) {
      console.error('Error initializing device auth:', error);
      throw new Error('Failed to initialize device authentication');
    }
  }

  getCurrentUser(): DeviceUser | null {
    return this.currentUser;
  }

  async updateLastActive(): Promise<void> {
    if (this.currentUser) {
      this.currentUser.lastActiveAt = new Date().toISOString();
      await AsyncStorage.setItem('device_user', JSON.stringify(this.currentUser));
    }
  }

  async clearSession(): Promise<void> {
    this.currentUser = null;
    await AsyncStorage.removeItem('device_user');
    await AsyncStorage.removeItem('device_session_active');
    this.notifyListeners();
  }

  async resetDeviceIdentity(): Promise<DeviceUser> {
    await this.clearSession();
    return await this.initialize();
  }

  // Subscription management for state changes
  subscribe(listener: (user: DeviceUser | null) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  // Utility methods for compatibility with existing useAuth pattern
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentUser.isActive;
  }

  getUserId(): string | null {
    return this.currentUser?.id || null;
  }

  getDeviceInfo(): { platform: string; deviceName: string } | null {
    if (!this.currentUser) return null;
    
    return {
      platform: this.currentUser.platform,
      deviceName: this.currentUser.deviceName,
    };
  }
}

export default DeviceAuthService;
