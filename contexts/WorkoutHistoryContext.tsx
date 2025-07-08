import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalWorkoutStorage } from '@/hooks/useLocalWorkoutStorage';
import { WorkoutSession } from '@/contexts/WorkoutSessionContext';
import { WorkoutAnalyticsEngine, WorkoutAnalytics } from '@/lib/analytics/workoutAnalytics';

interface WorkoutHistoryState {
  workouts: WorkoutSession[];
  analytics: WorkoutAnalytics | null;
  isLoading: boolean;
  error: string | null;
  stats: {
    totalWorkouts: number;
    totalDuration: number;
    totalSets: number;
    totalReps: number;
    totalWeight: number;
    averageWorkoutDuration: number;
    workoutsThisWeek: number;
    workoutsThisMonth: number;
    currentStreak: number;
    longestStreak: number;
    favoriteExercises: { name: string; count: number }[];
    recentPRs: {
      exercise: string;
      type: 'weight' | 'reps' | 'duration';
      value: number;
      date: string;
    }[];
  };
}

interface WorkoutHistoryContextType extends WorkoutHistoryState {
  refreshHistory: () => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  getWorkoutsByDateRange: (startDate: Date, endDate: Date) => WorkoutSession[];
  getExerciseHistory: (exerciseName: string) => WorkoutSession[];
  getWorkoutTrends: (timeframe: 'week' | 'month' | 'year') => {
    labels: string[];
    data: number[];
    type: 'duration' | 'volume' | 'frequency';
  };
  exportWorkoutData: (format?: 'json' | 'csv') => string;
}

const WorkoutHistoryContext = createContext<WorkoutHistoryContextType | undefined>(undefined);

export function WorkoutHistoryProvider({ children }: { children: React.ReactNode }) {
  const { getWorkoutHistory, getWorkoutStats, deleteWorkoutFromHistory } = useLocalWorkoutStorage();
  
  const [state, setState] = useState<WorkoutHistoryState>({
    workouts: [],
    analytics: null,
    isLoading: false,
    error: null,
    stats: {
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
    },
  });

  useEffect(() => {
    refreshHistory();
  }, []);

  const refreshHistory = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const workouts = await getWorkoutHistory();
      const analytics = WorkoutAnalyticsEngine.generateWorkoutAnalytics(workouts);
      
      // Transform analytics to match expected stats format
      const stats = {
        totalWorkouts: analytics.totalWorkouts,
        totalDuration: analytics.totalDuration,
        totalSets: analytics.totalSets,
        totalReps: analytics.totalReps,
        totalWeight: analytics.totalVolume,
        averageWorkoutDuration: analytics.averageWorkoutDuration,
        workoutsThisWeek: analytics.workoutsThisWeek,
        workoutsThisMonth: analytics.workoutsThisMonth,
        currentStreak: analytics.currentStreak,
        longestStreak: analytics.longestStreak,
        favoriteExercises: analytics.favoriteExercises,
        recentPRs: analytics.recentPRs.map(pr => ({
          exercise: 'Unknown Exercise', // This would need exercise name tracking
          type: pr.type as 'weight' | 'reps' | 'duration',
          value: pr.value,
          date: pr.date,
        })),
      };

      setState(prev => ({
        ...prev,
        workouts,
        analytics,
        stats,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error refreshing workout history:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load workout history',
        isLoading: false,
      }));
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    try {
      await deleteWorkoutFromHistory(workoutId);
      await refreshHistory();
    } catch (error) {
      console.error('Error deleting workout:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to delete workout',
      }));
    }
  };

  const getWorkoutsByDateRange = (startDate: Date, endDate: Date): WorkoutSession[] => {
    return state.workouts.filter(workout => {
      if (!workout.completed_at) return false;
      const workoutDate = new Date(workout.completed_at);
      return workoutDate >= startDate && workoutDate <= endDate;
    });
  };

  const getExerciseHistory = (exerciseName: string): WorkoutSession[] => {
    return state.workouts.filter(workout =>
      workout.exercises.some(exercise => 
        exercise.exercise_name.toLowerCase().includes(exerciseName.toLowerCase())
      )
    );
  };

  const getWorkoutTrends = (timeframe: 'week' | 'month' | 'year') => {
    const trends = WorkoutAnalyticsEngine.generateProgressTrends(
      state.workouts, 
      timeframe, 
      'duration'
    );
    
    return {
      labels: trends.map(t => t.label || new Date(t.date).toLocaleDateString()),
      data: trends.map(t => t.value),
      type: 'duration' as const,
    };
  };

  const exportWorkoutData = (format: 'json' | 'csv' = 'json'): string => {
    return WorkoutAnalyticsEngine.exportWorkoutData(state.workouts, format);
  };

  const contextValue: WorkoutHistoryContextType = {
    ...state,
    refreshHistory,
    deleteWorkout,
    getWorkoutsByDateRange,
    getExerciseHistory,
    getWorkoutTrends,
    exportWorkoutData,
  };

  return (
    <WorkoutHistoryContext.Provider value={contextValue}>
      {children}
    </WorkoutHistoryContext.Provider>
  );
}

export function useWorkoutHistory() {
  const context = useContext(WorkoutHistoryContext);
  if (context === undefined) {
    throw new Error('useWorkoutHistory must be used within a WorkoutHistoryProvider');
  }
  return context;
}
