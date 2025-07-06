import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DeviceAuthContextType {
  isAuthenticated: boolean;
  deviceId: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const DeviceAuthContext = createContext<DeviceAuthContextType | undefined>(undefined);

export function DeviceAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedDeviceId = await AsyncStorage.getItem('deviceId');
      if (storedDeviceId) {
        setDeviceId(storedDeviceId);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const login = async () => {
    try {
      const newDeviceId = Math.random().toString(36).substring(7);
      await AsyncStorage.setItem('deviceId', newDeviceId);
      setDeviceId(newDeviceId);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('deviceId');
      setDeviceId(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <DeviceAuthContext.Provider value={{ isAuthenticated, deviceId, login, logout }}>
      {children}
    </DeviceAuthContext.Provider>
  );
}

export function useDeviceAuth() {
  const context = useContext(DeviceAuthContext);
  if (context === undefined) {
    throw new Error('useDeviceAuth must be used within a DeviceAuthProvider');
  }
  return context;
}
