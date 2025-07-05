import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import DeviceAuthService, { DeviceUser } from '@/lib/auth/deviceAuth';

interface DeviceAuthContextType {
  user: DeviceUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  clearSession: () => Promise<void>;
  resetDeviceIdentity: () => Promise<void>;
  updateLastActive: () => Promise<void>;
}

const DeviceAuthContext = createContext<DeviceAuthContextType | undefined>(undefined);

interface DeviceAuthProviderProps {
  children: ReactNode;
}

export function DeviceAuthProvider({ children }: DeviceAuthProviderProps) {
  const [user, setUser] = useState<DeviceUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authService = DeviceAuthService.getInstance();

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((newUser) => {
      setUser(newUser);
    });

    // Initialize authentication
    initializeAuth();

    return unsubscribe;
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const deviceUser = await authService.initialize();
      setUser(deviceUser);
    } catch (error) {
      console.error('Failed to initialize device authentication:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const initialize = async () => {
    await initializeAuth();
  };

  const clearSession = async () => {
    try {
      await authService.clearSession();
      setUser(null);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  };

  const resetDeviceIdentity = async () => {
    try {
      setIsLoading(true);
      const newUser = await authService.resetDeviceIdentity();
      setUser(newUser);
    } catch (error) {
      console.error('Failed to reset device identity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLastActive = async () => {
    try {
      await authService.updateLastActive();
    } catch (error) {
      console.error('Failed to update last active:', error);
    }
  };

  const value: DeviceAuthContextType = {
    user,
    isLoading,
    isAuthenticated: authService.isAuthenticated(),
    initialize,
    clearSession,
    resetDeviceIdentity,
    updateLastActive,
  };

  return (
    <DeviceAuthContext.Provider value={value}>
      {children}
    </DeviceAuthContext.Provider>
  );
}

export function useDeviceAuth(): DeviceAuthContextType {
  const context = useContext(DeviceAuthContext);
  if (context === undefined) {
    throw new Error('useDeviceAuth must be used within a DeviceAuthProvider');
  }
  return context;
}

// Compatibility hook to maintain existing useAuth interface
export function useAuth() {
  const deviceAuth = useDeviceAuth();
  
  return {
    user: deviceAuth.user,
    isLoading: deviceAuth.isLoading,
    isAuthenticated: deviceAuth.isAuthenticated,
    // Map device auth methods to expected useAuth interface
    signOut: deviceAuth.clearSession,
    initialize: deviceAuth.initialize,
  };
}
