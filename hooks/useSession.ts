import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { useQueryClient } from '@tanstack/react-query';

export function useSession() {
  const { session, user, loading } = useAuth();
  const queryClient = useQueryClient();

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data.session) {
      queryClient.setQueryData(queryKeys.auth.session, data.session);
    }
    return { session: data.session ?? null, error };
  };

  return {
    session,
    user,
    loading,
    refreshSession,
  };
}
