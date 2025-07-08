import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  streakStartDate: string | null;
  totalWorkouts: number;
  weeklyGoal: number;
  monthlyGoal: number;
}

interface StreakContextType {
  streakData: StreakData;
  updateStreak: (workoutDate: string) => Promise<void>;
  resetStreak: () => Promise<void>;
  setWeeklyGoal: (goal: number) => Promise<void>;
  setMonthlyGoal: (goal: number) => Promise<void>;
  getStreakProgress: () => {
    weeklyProgress: number;
    monthlyProgress: number;
    isOnTrack: boolean;
  };
  isLoading: boolean;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

const STREAK_STORAGE_KEY = '@gymverse_streak_data';

const defaultStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastWorkoutDate: null,
  streakStartDate: null,
  totalWorkouts: 0,
  weeklyGoal: 3,
  monthlyGoal: 12,
};

export function StreakProvider({ children }: { children: ReactNode }) {
  const [streakData, setStreakData] = useState<StreakData>(defaultStreakData);
  const [isLoading, setIsLoading] = useState(true);

  // Load streak data on mount
  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        setStreakData(parsedData);
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveStreakData = async (data: StreakData) => {
    try {
      await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
      setStreakData(data);
    } catch (error) {
      console.error('Error saving streak data:', error);
    }
  };

  const updateStreak = async (workoutDate: string) => {
    const workoutDay = new Date(workoutDate);
    const today = new Date();
    const lastWorkout = streakData.lastWorkoutDate ? new Date(streakData.lastWorkoutDate) : null;

    let newStreakData = { ...streakData };

    // If this is the first workout or continuing streak
    if (!lastWorkout) {
      // First workout ever
      newStreakData = {
        ...newStreakData,
        currentStreak: 1,
        longestStreak: Math.max(1, newStreakData.longestStreak),
        lastWorkoutDate: workoutDate,
        streakStartDate: workoutDate,
        totalWorkouts: newStreakData.totalWorkouts + 1,
      };
    } else {
      const daysDifference = Math.floor((workoutDay.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDifference === 1) {
        // Consecutive day - continue streak
        const newCurrentStreak = newStreakData.currentStreak + 1;
        newStreakData = {
          ...newStreakData,
          currentStreak: newCurrentStreak,
          longestStreak: Math.max(newCurrentStreak, newStreakData.longestStreak),
          lastWorkoutDate: workoutDate,
          totalWorkouts: newStreakData.totalWorkouts + 1,
        };
      } else if (daysDifference === 0) {
        // Same day - just update total workouts
        newStreakData = {
          ...newStreakData,
          totalWorkouts: newStreakData.totalWorkouts + 1,
        };
      } else {
        // Streak broken - reset
        newStreakData = {
          ...newStreakData,
          currentStreak: 1,
          lastWorkoutDate: workoutDate,
          streakStartDate: workoutDate,
          totalWorkouts: newStreakData.totalWorkouts + 1,
        };
      }
    }

    await saveStreakData(newStreakData);
  };

  const resetStreak = async () => {
    await saveStreakData(defaultStreakData);
  };

  const setWeeklyGoal = async (goal: number) => {
    const newData = { ...streakData, weeklyGoal: goal };
    await saveStreakData(newData);
  };

  const setMonthlyGoal = async (goal: number) => {
    const newData = { ...streakData, monthlyGoal: goal };
    await saveStreakData(newData);
  };

  const getStreakProgress = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate workouts this week and month
    // This is simplified - in real implementation, you'd track individual workout dates
    const weeklyProgress = Math.min(streakData.currentStreak, streakData.weeklyGoal);
    const monthlyProgress = Math.min(streakData.totalWorkouts, streakData.monthlyGoal);

    return {
      weeklyProgress: (weeklyProgress / streakData.weeklyGoal) * 100,
      monthlyProgress: (monthlyProgress / streakData.monthlyGoal) * 100,
      isOnTrack: weeklyProgress >= streakData.weeklyGoal * 0.7, // 70% of weekly goal
    };
  };

  return (
    <StreakContext.Provider
      value={{
        streakData,
        updateStreak,
        resetStreak,
        setWeeklyGoal,
        setMonthlyGoal,
        getStreakProgress,
        isLoading,
      }}
    >
      {children}
    </StreakContext.Provider>
  );
}

export function useStreak() {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
}
