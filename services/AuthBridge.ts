import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface AuthBridgeUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export class AuthBridge {
  private static instance: AuthBridge;
  private isInitialized = false;
  private currentUser: AuthBridgeUser | null = null;
  private listeners: Array<(user: AuthBridgeUser | null) => void> = [];

  private constructor() {}

  static getInstance(): AuthBridge {
    if (!AuthBridge.instance) {
      AuthBridge.instance = new AuthBridge();
    }
    return AuthBridge.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if there's an existing Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        this.currentUser = this.mapSupabaseUserToAuthUser(session.user);
      }

      // Listen for Supabase auth state changes
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          this.handleSupabaseSignOut();
        } else if (session?.user) {
          const authUser = this.mapSupabaseUserToAuthUser(session.user);
          this.updateCurrentUser(authUser);
        }
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('AuthBridge initialization failed:', error);
    }
  }

  async signInWithDeviceAuth(deviceUser: AuthBridgeUser): Promise<void> {
    try {
      // Create or sign in user with Supabase using email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: deviceUser.email,
        password: this.generateDevicePassword(deviceUser.id), // Use device ID as password
      });

      if (error && error.message.includes('Invalid login credentials')) {
        // User doesn't exist, create them
        await this.createSupabaseUser(deviceUser);
      } else if (error) {
        console.error('Supabase sign in error:', error);
        // Continue with device auth even if Supabase fails
      }

      this.updateCurrentUser(deviceUser);
    } catch (error) {
      console.error('AuthBridge sign in failed:', error);
      // Fallback: continue with device auth only
      this.updateCurrentUser(deviceUser);
    }
  }

  async signOut(): Promise<void> {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase sign out error:', error);
    } finally {
      // Always clear local state
      this.updateCurrentUser(null);
    }
  }

  private async createSupabaseUser(deviceUser: AuthBridgeUser): Promise<void> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: deviceUser.email,
        password: this.generateDevicePassword(deviceUser.id),
        options: {
          data: {
            name: deviceUser.name,
            avatar: deviceUser.avatar,
            device_id: deviceUser.id,
          }
        }
      });

      if (error) {
        console.error('Failed to create Supabase user:', error);
        return;
      }

      // If email confirmation is required, we'll handle it gracefully
      if (data.user && !data.session) {
        console.log('User created, email confirmation may be required');
      }
    } catch (error) {
      console.error('Error creating Supabase user:', error);
    }
  }

  private generateDevicePassword(deviceId: string): string {
    // Generate a consistent password based on device ID
    // In production, you might want to use a more secure method
    return `device_${deviceId}_${deviceId.slice(-8)}`;
  }

  private mapSupabaseUserToAuthUser(user: User): AuthBridgeUser {
    return {
      id: user.user_metadata?.device_id || user.id,
      email: user.email || '',
      name: user.user_metadata?.name,
      avatar: user.user_metadata?.avatar,
    };
  }

  private handleSupabaseSignOut(): void {
    // Only update if we're not already signed out
    if (this.currentUser) {
      this.updateCurrentUser(null);
    }
  }

  private updateCurrentUser(user: AuthBridgeUser | null): void {
    this.currentUser = user;
    this.notifyListeners(user);
  }

  private notifyListeners(user: AuthBridgeUser | null): void {
    this.listeners.forEach(listener => {
      try {
        listener(user);
      } catch (error) {
        console.error('AuthBridge listener error:', error);
      }
    });
  }

  // Public methods for external use
  getCurrentUser(): AuthBridgeUser | null {
    return this.currentUser;
  }

  onAuthStateChange(callback: (user: AuthBridgeUser | null) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  async getSupabaseSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Failed to get Supabase session:', error);
      return null;
    }
  }

  isSupabaseAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

export const authBridge = AuthBridge.getInstance();
