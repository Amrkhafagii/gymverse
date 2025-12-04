import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logCoachingEvent, recalculateCoachingPath } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';

export function usePathRecalc(userId?: string | null) {
  const queryClient = useQueryClient();
  const pathsKey = queryKeys.coaching.paths(userId);

  const mutation = useMutation({
    mutationFn: (pathId: string) => recalculateCoachingPath(pathId),
    onSuccess: async (_data, pathId) => {
      await logCoachingEvent(pathId, 'recalc', { source: 'manual' });
      queryClient.invalidateQueries({ queryKey: pathsKey });
    },
  });

  return {
    recalc: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
}
