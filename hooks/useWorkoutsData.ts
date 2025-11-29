import { useQuery } from '@tanstack/react-query';
import { Workout, getWorkoutTemplates, getUserWorkouts } from '@/lib/supabase';

type WorkoutsData = {
  templates: Workout[];
  userWorkouts: Workout[];
};

export const useWorkoutsData = (userId?: string | null) => {
  const query = useQuery<WorkoutsData>({
    queryKey: ['workouts', userId],
    queryFn: async () => {
      const [templates, userWorkouts] = await Promise.all([
        getWorkoutTemplates(),
        userId ? getUserWorkouts(userId) : Promise.resolve([]),
      ]);
      return { templates, userWorkouts };
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
