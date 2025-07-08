import { useState, useEffect } from 'react';
import { useLocalWorkoutStorage } from './useLocalWorkoutStorage';
import { WorkoutSession } from '@/contexts/WorkoutSessionContext';
import { WorkoutAnalyticsEngine, WorkoutAnalytics, ExerciseMetrics, ProgressTrend } from '@/lib/analytics/workoutAnalytics';

interface WorkoutHistoryState {
  workouts: WorkoutSession[];
  analytics: WorkoutAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

export function useWorkoutHistory() {
  const { getWorkoutHistory, getWorkoutStats } = useLocalWorkoutStorage();
  
  const [state, setState] = useState<WorkoutHistoryState>({
    workouts: [],
    analytics: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    loadWorkoutHistory();
  }, []);

  const loadWorkoutHistory = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const history = await getWorkoutHistory();
      const analytics = WorkoutAnalyticsEngine.generateWorkoutAnalytics(history);
      
      setState(prev => ({
        ...prev,
        workouts: history,
        analytics,
        isLoading: false,
      }));
    } catch (err) {
      console.error('Error loading workout history:', err);
      setState(prev => ({
        ...prev,
        error: 'Failed to load workout history',
        isLoading: false,
      }));
    }
  };

  const refreshHistory = async () => {
    await loadWorkoutHistory();
  };

  const getWorkoutsByExercise = (exerciseName: string): WorkoutSession[] => {
    return state.workouts.filter(workout =>
      workout.exercises.some(exercise => 
        exercise.exercise_name.toLowerCase().includes(exerciseName.toLowerCase())
      )
    );
  };

  const getWorkoutsByDateRange = (startDate: Date, endDate: Date): WorkoutSession[] => {
    return state.workouts.filter(workout => {
      if (!workout.completed_at) return false;
      const workoutDate = new Date(workout.completed_at);
      return workoutDate >= startDate && workoutDate <= endDate;
    });
  };

  const getExerciseMetrics = (exerciseName: string): ExerciseMetrics => {
    return WorkoutAnalyticsEngine.calculateExerciseMetrics(state.workouts, exerciseName);
  };

  const getProgressTrends = (
    timeframe: 'week' | 'month' | 'year',
    type: 'weight' | 'volume' | 'duration' | 'frequency'
  ): ProgressTrend[] => {
    return WorkoutAnalyticsEngine.generateProgressTrends(state.workouts, timeframe, type);
  };

  const exportWorkoutData = (format: 'json' | 'csv' = 'json'): string => {
    return WorkoutAnalyticsEngine.exportWorkoutData(state.workouts, format);
  };

  const getWorkoutTrends = (timeframe: 'week' | 'month' | 'year') => {
    const trends = getProgressTrends(timeframe, 'duration');
    return {
      labels: trends.map(t => t.label || new Date(t.date).toLocaleDateString()),
      data: trends.map(t => t.value),
      type: 'duration' as const,
    };
  };

  // Computed values from analytics
  const stats = state.analytics ? {
    totalWorkouts: state.analytics.totalWorkouts,
    totalDuration: state.analytics.totalDuration,
    totalSets: state.analytics.totalSets,
    totalReps: state.analytics.totalReps,
    totalWeight: state.analytics.totalVolume,
    averageWorkoutDuration: state.analytics.averageWorkoutDuration,
    workoutsThisWeek: state.analytics.workoutsThisWeek,
    workoutsThisMonth: state.analytics.workoutsThisMonth,
    currentStreak: state.analytics.currentStreak,
    longestStreak: state.analytics.longestStreak,
    favoriteExercises: state.analytics.favoriteExercises,
    recentPRs: state.analytics.recentPRs.map(pr => ({
      exercise: 'Unknown Exercise', // This would need to be tracked in the PR data
      type: pr.type,
      value: pr.value,
      date: pr.date,
    })),
  } : {
    totalWorkouts: 0,
    totalDuration: 0,
    totalSets: 0,
    totalReps: 0,
    totalWeight: 0,
    averageWorkoutDuration: 0,
    workoutsThisWeek: 0,
    workoutsThisMonth: 0,
    currentStreak: 0,
    longestStreak: 0,
    favoriteExercises: [],
    recentPRs: [],
  };

  return {
    workouts: state.workouts,
    analytics: state.analytics,
    stats,
    isLoading: state.isLoading,
    error: state.error,
    refreshHistory,
    getWorkoutsByExercise,
    getWorkoutsByDateRange,
    getExerciseMetrics,
    getProgressTrends,
    getWorkoutTrends,
    exportWorkoutData,
  };
}
