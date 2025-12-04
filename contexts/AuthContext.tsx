import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import {
  supabase,
  Profile,
  getProfile,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  getUserEntitlements,
  type Entitlement,
} from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  entitlements: Entitlement[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    username: string,
    fullName?: string
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasEntitlement: (featureKeyOrProductId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const profileRef = useRef<Profile | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
      queryClient.setQueryData(queryKeys.auth.session, session ?? null);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        loadEntitlements(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session ?? null);
      queryClient.setQueryData(queryKeys.auth.session, session ?? null);
      setUser(session?.user ?? null);
      if (session?.user) {
        if (profileRef.current) {
          queryClient.setQueryData(queryKeys.auth.profile(session.user.id), profileRef.current);
        }
        await loadProfile(session.user.id);
        await loadEntitlements(session.user.id);
      } else {
        setProfile(null);
        setEntitlements([]);
        queryClient.removeQueries({ queryKey: queryKeys.auth.profile() });
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const loadProfile = async (userId: string) => {
    try {
      const profileData = await retry(() => getProfile(userId));
      profileRef.current = profileData;
      setProfile(profileData);
      queryClient.setQueryData(queryKeys.auth.profile(userId), profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEntitlements = async (userId: string) => {
    try {
      const data = await getUserEntitlements(userId);
      setEntitlements(data);
    } catch (error) {
      console.error('Error loading entitlements:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  const hasEntitlement = (featureKeyOrProductId: string) =>
    entitlements.some((e) => e.product_id === featureKeyOrProductId || e.products?.feature_key === featureKeyOrProductId);

  const signIn = async (email: string, password: string) => {
    const { error } = await authSignIn(email, password);
    return { error };
  };

  const signUp = async (email: string, password: string, username: string, fullName?: string) => {
    const { error } = await authSignUp(email, password, username, fullName);
    return { error };
  };

  const signOut = async () => {
    await authSignOut();
    setSession(null);
    profileRef.current = null;
    setProfile(null);
    queryClient.removeQueries({ queryKey: queryKeys.auth.session });
  };

  const value = {
    user,
    session,
    profile,
    entitlements,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    hasEntitlement,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const retry = async <T,>(fn: () => Promise<T>, attempts = 3, delayMs = 400): Promise<T> => {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
