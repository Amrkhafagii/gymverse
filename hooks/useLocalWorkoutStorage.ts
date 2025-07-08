import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession } from '@/contexts/WorkoutSessionContext';

const WORKOUT_HISTORY_KEY = 'workout_history';
const WORKOUT_STATS_KEY = 'workout_stats';

interface WorkoutStats {
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
}

export function useLocalWorkoutStorage() {
  const [isLoading, setIsLoading] = useState(false);

  const saveWorkout = useCallback(async (workout: WorkoutSession): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Get existing workouts
      const existingWorkouts = await getWorkoutHistory();
      
      // Add new workout (or update if it exists)
      const workoutIndex = existingWorkouts.findIndex(w => w.id === workout.id);
      let updatedWorkouts: WorkoutSession[];
      
      if (workoutIndex >= 0) {
        updatedWorkouts = [...existingWorkouts];
        updatedWorkouts[workoutIndex] = workout;
      } else {
        updatedWorkouts = [workout, ...existingWorkouts];
      }
      
      // Sort by completion date (most recent first)
      updatedWorkouts.sort((a, b) => {
        const dateA = new Date(a.completed_at || a.started_at).getTime();
        const dateB = new Date(b.completed_at || b.started_at).getTime();
        return dateB - dateA;
      });
      
      // Save to storage
      await AsyncStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(updatedWorkouts));
      
      // Update stats
      await updateWorkoutStats(updatedWorkouts);
      
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getWorkoutHistory = useCallback(async (): Promise<WorkoutSession[]> => {
    try {
      const stored = await AsyncStorage.getItem(WORKOUT_HISTORY_KEY);
      if (!stored) return [];
      
      const workouts = JSON.parse(stored) as WorkoutSession[];
      
      // Filter only completed workouts and sort by date
      return workouts
        .filter(workout => workout.completed_at)
        .sort((a, b) => {
          const dateA = new Date(a.completed_at!).getTime();
          const dateB = new Date(b.completed_at!).getTime();
          return dateB - dateA;
        });
    } catch (error) {
      console.error('Error getting workout history:', error);
      return [];
    }
  }, []);

  const getWorkoutStats = useCallback(async (): Promise<WorkoutStats> => {
    try {
      const stored = await AsyncStorage.getItem(WORKOUT_STATS_KEY);
      if (stored) {
        return JSON.parse(stored) as WorkoutStats;
      }
      
      // Calculate stats from scratch if not cached
      const workouts = await getWorkoutHistory();
      return calculateWorkoutStats(workouts);
    } catch (error) {
      console.error('Error getting workout stats:', error);
      return getDefaultStats();
    }
  }, []);

  const updateWorkoutStats = useCallback(async (workouts: WorkoutSession[]): Promise<void> => {
    try {
      const stats = calculateWorkoutStats(workouts.filter(w => w.completed_at));
      await AsyncStorage.setItem(WORKOUT_STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error updating workout stats:', error);
    }
  }, []);

  const deleteWorkoutFromHistory = useCallback(async (workoutId: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const existingWorkouts = await getWorkoutHistory();
      const updatedWorkouts = existingWorkouts.filter(w => w.id !== workoutId);
      
      await AsyncStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(updatedWorkouts));
      await updateWorkoutStats(updatedWorkouts);
      
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearWorkoutHistory = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(WORKOUT_HISTORY_KEY);
      await AsyncStorage.removeItem(WORKOUT_STATS_KEY);
    } catch (error) {
      console.error('Error clearing workout history:', error);
      throw error;
    }
  }, []);

  return {
    saveWorkout,
    getWorkoutHistory,
    getWorkoutStats,
    deleteWorkoutFromHistory,
    clearWorkoutHistory,
    isLoading,
  };
}

function calculateWorkoutStats(workouts: WorkoutSession[]): WorkoutStats {
  if (workouts.length === 0) {
    return getDefaultStats();
  }

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Basic totals
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum, w) => sum + w.total_duration_seconds, 0);
  
  // Calculate sets and reps
  let totalSets = 0;
  let totalReps = 0;
  let totalWeight = 0;
  
  workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      const completedSets = exercise.sets.filter(set => set.is_completed);
      totalSets += completedSets.length;
      
      completedSets.forEach(set => {
        totalReps += set.actual_reps || 0;
        totalWeight += (set.actual_weight_kg || 0) * (set.actual_reps || 0);
      });
    });
  });

  const averageWorkoutDuration = totalDuration / totalWorkouts;

  // Time-based counts
  const workoutsThisWeek = workouts.filter(w => 
    new Date(w.completed_at!) >= oneWeekAgo
  ).length;
  
  const workoutsThisMonth = workouts.filter(w => 
    new Date(w.completed_at!) >= oneMonthAgo
  ).length;

  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(workouts);

  // Favorite exercises
  const exerciseCounts: { [key: string]: number } = {};
  workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      exerciseCounts[exercise.exercise_name] = (exerciseCounts[exercise.exercise_name] || 0) + 1;
    });
  });

  const favoriteExercises = Object.entries(exerciseCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Recent PRs (simplified - would need more complex logic for real PRs)
  const recentPRs = workouts
    .slice(0, 10)
    .flatMap(workout => 
      workout.exercises.flatMap(exercise =>
        exercise.sets
          .filter(set => set.is_personal_record)
          .map(set => ({
            exercise: exercise.exercise_name,
            type: 'weight' as const,
            value: set.actual_weight_kg || 0,
            date: workout.completed_at!,
          }))
      )
    )
    .slice(0, 5);

  return {
    totalWorkouts,
    totalDuration,
    totalSets,
    totalReps,
    totalWeight,
    averageWorkoutDuration,
    workoutsThisWeek,
    workoutsThisMonth,
    currentStreak,
    longestStreak,
    favoriteExercises,
    recentPRs,
  };
}

function calculateStreaks(workouts: WorkoutSession[]): { currentStreak: number; longestStreak: number } {
  if (workouts.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Get unique workout dates (only the date part, not time)
  const workoutDates = workouts
    .map(w => {
      const date = new Date(w.completed_at!);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    })
    .filter((date, index, array) => array.indexOf(date) === index) // Remove duplicates
    .sort((a, b) => b - a); // Sort descending (most recent first)

  const oneDayMs = 24 * 60 * 60 * 1000;
  const today = new Date();
  const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = todayMs;

  for (const workoutDate of workoutDates) {
    if (workoutDate === checkDate || workoutDate === checkDate - oneDayMs) {
      currentStreak++;
      checkDate = workoutDate - oneDayMs;
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: number | null = null;

  for (const workoutDate of workoutDates.reverse()) { // Process in chronological order
    if (prevDate === null || workoutDate === prevDate + oneDayMs) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
    prevDate = workoutDate;
  }

  return { currentStreak, longestStreak };
}

function getDefaultStats(): WorkoutStats {
  return {
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
}
