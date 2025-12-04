import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CoachingPath,
  CoachingPathStatus,
  CreateCoachingPathInput,
  createCoachingPath,
  getCoachingPaths,
  logCoachingEvent,
  updateCoachingPathStatus,
} from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';

type UpdateStatusInput = {
  pathId: string;
  status: CoachingPathStatus;
};

export function useCoachingPaths(userId?: string | null) {
  const queryClient = useQueryClient();
  const pathsKey = queryKeys.coaching.paths(userId);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch: refresh,
  } = useQuery<CoachingPath[]>({
    queryKey: pathsKey,
    queryFn: getCoachingPaths,
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateCoachingPathInput) => createCoachingPath(input),
    onSuccess: async (pathId) => {
      const id = typeof pathId === 'string' ? pathId : null;
      if (id) {
        await logCoachingEvent(id, 'recalc', { reason: 'path_created' });
      }
      queryClient.invalidateQueries({ queryKey: pathsKey });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ pathId, status }: UpdateStatusInput) =>
      updateCoachingPathStatus(pathId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pathsKey });
    },
  });

  const pausePath = (pathId: string) => statusMutation.mutateAsync({ pathId, status: 'paused' });
  const resumePath = (pathId: string) => statusMutation.mutateAsync({ pathId, status: 'active' });
  const completePath = (pathId: string) =>
    statusMutation.mutateAsync({ pathId, status: 'completed' });

  const activePath = useMemo(
    () => (data ?? []).find((path) => path.status === 'active') ?? null,
    [data]
  );
  const completedPaths = useMemo(
    () => (data ?? []).filter((path) => path.status === 'completed'),
    [data]
  );

  return {
    paths: data ?? [],
    activePath,
    completedPaths,
    loading: isLoading || isFetching,
    error,
    refresh,
    createPath: createMutation.mutateAsync,
    pausePath,
    resumePath,
    completePath,
    isCreating: createMutation.isPending,
    isUpdatingStatus: statusMutation.isPending,
  };
}
