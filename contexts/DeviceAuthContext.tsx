import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authBridge, AuthBridgeUser } from '@/services/AuthBridge';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

interface DeviceAuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

const DeviceAuthContext = createContext<DeviceAuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: '@gymverse_user',
  USERS_DB: '@gymverse_users_db',
};

interface StoredUser extends User {
  password: string; // Hashed password
}

export function DeviceAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Initialize the auth bridge
      await authBridge.initialize();

      // Check for stored user session
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Sync with Supabase through auth bridge
        await authBridge.signInWithDeviceAuth({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          avatar: userData.avatar,
        });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hashPassword = (password: string): string => {
    // Simple hash function - in production, use a proper hashing library
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // Get existing users
      const existingUsersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
      const existingUsers: StoredUser[] = existingUsersJson ? JSON.parse(existingUsersJson) : [];

      // Check if user already exists
      if (existingUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'User already exists with this email' };
      }

      // Create new user
      const newUser: StoredUser = {
        id: `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email.toLowerCase(),
        name,
        password: hashPassword(password),
        createdAt: new Date().toISOString(),
      };

      // Save to users database
      const updatedUsers = [...existingUsers, newUser];
      await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(updatedUsers));

      // Create user session (without password)
      const userSession: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt,
      };

      // Save current session
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userSession));
      setUser(userSession);

      // Sync with Supabase through auth bridge
      await authBridge.signInWithDeviceAuth({
        id: userSession.id,
        email: userSession.email,
        name: userSession.name,
        avatar: userSession.avatar,
      });

      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Failed to create account' };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // Get existing users
      const existingUsersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
      const existingUsers: StoredUser[] = existingUsersJson ? JSON.parse(existingUsersJson) : [];

      // Find user
      const foundUser = existingUsers.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === hashPassword(password)
      );

      if (!foundUser) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Create user session (without password)
      const userSession: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        avatar: foundUser.avatar,
        createdAt: foundUser.createdAt,
      };

      // Save current session
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userSession));
      setUser(userSession);

      // Sync with Supabase through auth bridge
      await authBridge.signInWithDeviceAuth({
        id: userSession.id,
        email: userSession.email,
        name: userSession.name,
        avatar: userSession.avatar,
      });

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Failed to sign in' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Sign out from auth bridge (which handles Supabase)
      await authBridge.signOut();
      
      // Clear local session
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      setIsLoading(true);

      // Update current user
      const updatedUser = { ...user, ...updates };

      // Update in users database
      const existingUsersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
      const existingUsers: StoredUser[] = existingUsersJson ? JSON.parse(existingUsersJson) : [];
      
      const userIndex = existingUsers.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        existingUsers[userIndex] = { ...existingUsers[userIndex], ...updates };
        await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(existingUsers));
      }

      // Update current session
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Sync with Supabase through auth bridge
      await authBridge.signInWithDeviceAuth({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
      });

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    } finally {
      setIsLoading(false);
    }
  };

  const value: DeviceAuthContextType = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <DeviceAuthContext.Provider value={value}>
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
