import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, Profile } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';

export function useProfile(targetUserId?: string | null) {
  const { user, profile: ctxProfile, loading: authLoading, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const userId = targetUserId ?? user?.id ?? null;

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<Profile | null>({
    queryKey: queryKeys.auth.profile(userId),
    queryFn: async () => {
      if (!userId) return null;
      return getProfile(userId);
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    initialData: userId ? ctxProfile : null,
  });

  useEffect(() => {
    if (userId && ctxProfile) {
      queryClient.setQueryData(queryKeys.auth.profile(userId), ctxProfile);
    }
  }, [ctxProfile, queryClient, userId]);

  const refresh = async () => {
    await refreshProfile();
    await refetch();
  };

  return {
    profile: data ?? null,
    loading: authLoading || isLoading || isFetching,
    refreshProfile: refresh,
  };
}
