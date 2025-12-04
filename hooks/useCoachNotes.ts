import { useQuery } from '@tanstack/react-query';
import { CoachNotes, getCoachNotesForSession } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';

export function useCoachNotes(sessionId?: string | null) {
  const { data, isLoading, isFetching, error, refetch } = useQuery<{
    notes: CoachNotes | null;
    pathId: string | null;
  }>({
    queryKey: queryKeys.coaching.notes(sessionId ?? null),
    queryFn: () =>
      sessionId ? getCoachNotesForSession(sessionId) : Promise.resolve({ notes: null, pathId: null }),
    enabled: Boolean(sessionId),
    staleTime: 15 * 1000,
  });

  return {
    notes: data?.notes ?? null,
    pathId: data?.pathId ?? null,
    loading: isLoading || isFetching,
    error,
    refresh: refetch,
  };
}
