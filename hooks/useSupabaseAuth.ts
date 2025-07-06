import { useEffect, useState } from 'react';
import { authBridge, AuthBridgeUser } from '@/services/AuthBridge';

export function useSupabaseAuth() {
  const [user, setUser] = useState<AuthBridgeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize and get current user
    const initializeAuth = async () => {
      await authBridge.initialize();
      setUser(authBridge.getCurrentUser());
      setIsLoading(false);
    };

    initializeAuth();

    // Listen for auth state changes
    const unsubscribe = authBridge.onAuthStateChange((authUser) => {
      setUser(authUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    supabaseSession: authBridge.getSupabaseSession(),
  };
}
