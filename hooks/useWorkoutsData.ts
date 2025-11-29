import { useQuery } from '@tanstack/react-query';
import { Workout, getWorkoutTemplates, getUserWorkouts, logSupabaseError } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';

type WorkoutsData = {
  templates: Workout[];
  userWorkouts: Workout[];
};

export const useWorkoutsData = (userId?: string | null) => {
  const query = useQuery<WorkoutsData>({
    queryKey: queryKeys.workouts.user(userId ?? null),
    queryFn: async () => {
      try {
        const [templates, userWorkouts] = await Promise.all([
          getWorkoutTemplates(),
          userId ? getUserWorkouts(userId) : Promise.resolve([]),
        ]);
        return { templates, userWorkouts };
      } catch (err) {
        logSupabaseError(err, 'fetch_workouts');
        throw err;
      }
    },
    staleTime: 60 * 1000,
  });

  return {
    templates: query.data?.templates ?? [],
    userWorkouts: query.data?.userWorkouts ?? [],
    loading: query.isLoading,
    refetch: query.refetch,
    error: query.error,
  };
};
