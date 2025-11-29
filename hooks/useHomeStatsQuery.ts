import { useQuery } from '@tanstack/react-query';
import { useWorkoutAnalytics } from './useWorkoutAnalytics';
import { usePersonalRecords } from './usePersonalRecords';

export function useHomeStatsQuery(userId: string | null) {
  const analyticsQuery = useWorkoutAnalytics(userId);
  const { personalRecords, loading: recordsLoading } = usePersonalRecords(userId);

  const query = useQuery({
    queryKey: ['home-stats', userId],
    queryFn: async () => {
      const { stats, streak } = analyticsQuery;
      return {
        workouts: stats.totalWorkouts.toString(),
        streak: (streak?.current_streak || 0).toString(),
        personalRecords: personalRecords.length.toString(),
        hours: Math.floor(stats.totalDuration / 60).toString(),
      };
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  });

  return {
    workouts: query.data?.workouts || '0',
    streak: query.data?.streak || '0',
    personalRecords: query.data?.personalRecords || '0',
    hours: query.data?.hours || '0',
    loading: analyticsQuery.loading || recordsLoading || query.isLoading || query.isFetching,
    refetch: query.refetch,
  };
}
