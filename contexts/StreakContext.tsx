import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalWorkoutStorage } from '@/hooks/useLocalWorkoutStorage';
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';
import { StreakEngine } from '@/lib/streaks/streakEngine';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  streakStartDate: string | null;
  weeklyStreaks: {
    week: string;
    streak: number;
    workoutDays: string[];
  }[];
  monthlyStats: {
    month: string;
    totalWorkouts: number;
    streakDays: number;
    consistency: number;
  }[];
  milestones: {
    id: string;
    name: string;
    description: string;
    target: number;
    achieved: boolean;
    achievedAt?: string;
    icon: string;
    color: string;
  }[];
  streakRecovery: {
    canRecover: boolean;
    recoveryDeadline: string | null;
    missedDays: number;
    recoveryWorkoutsNeeded: number;
  };
  motivation: {
    message: string;
    type: 'encouragement' | 'celebration' | 'recovery' | 'milestone';
    icon: string;
  };
}

interface StreakContextType {
  streakData: StreakData;
  isLoading: boolean;
  error: string | null;
  refreshStreaks: () => Promise<void>;
  recordWorkout: (workoutDate: string) => Promise<void>;
  useStreakRecovery: () => Promise<boolean>;
  getStreakHistory: (days: number) => { date: string; hasWorkout: boolean }[];
  getMotivationalMessage: () => string;
  checkMilestones: () => void;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

export function StreakProvider({ children }: { children: React.ReactNode }) {
  const { getWorkoutHistory } = useLocalWorkoutStorage();
  const { workouts } = useWorkoutHistory();
  
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    streakStartDate: null,
    weeklyStreaks: [],
    monthlyStats: [],
    milestones: StreakEngine.getStreakMilestones(),
    streakRecovery: {
      canRecover: false,
      recoveryDeadline: null,
      missedDays: 0,
      recoveryWorkoutsNeeded: 0,
    },
    motivation: {
      message: "Ready to start your fitness journey?",
      type: 'encouragement',
      icon: '💪',
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshStreaks();
  }, []);

  useEffect(() => {
    if (workouts.length > 0) {
      refreshStreaks();
    }
  }, [workouts]);

  const refreshStreaks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const workoutHistory = await getWorkoutHistory();
      const calculatedStreaks = StreakEngine.calculateStreaks(workoutHistory);
      const weeklyData = StreakEngine.getWeeklyStreaks(workoutHistory);
      const monthlyData = StreakEngine.getMonthlyStats(workoutHistory);
      const recoveryData = StreakEngine.calculateStreakRecovery(workoutHistory);
      const motivationData = StreakEngine.getMotivationalMessage(calculatedStreaks, recoveryData);
      
      // Load saved milestones progress
      const savedMilestones = await loadMilestoneProgress();
      const updatedMilestones = StreakEngine.updateMilestones(
        savedMilestones,
        calculatedStreaks.currentStreak,
        calculatedStreaks.longestStreak
      );

      setStreakData({
        ...calculatedStreaks,
        weeklyStreaks: weeklyData,
        monthlyStats: monthlyData,
        milestones: updatedMilestones,
        streakRecovery: recoveryData,
        motivation: motivationData,
      });

      // Save milestone progress
      await saveMilestoneProgress(updatedMilestones);
    } catch (err) {
      console.error('Error refreshing streaks:', err);
      setError('Failed to load streak data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMilestoneProgress = async () => {
    try {
      const { getItem } = await import('@react-native-async-storage/async-storage');
      const saved = await getItem('streak_milestones');
      return saved ? JSON.parse(saved) : StreakEngine.getStreakMilestones();
    } catch (error) {
      console.error('Error loading milestone progress:', error);
      return StreakEngine.getStreakMilestones();
    }
  };

  const saveMilestoneProgress = async (milestones: StreakData['milestones']) => {
    try {
      const { setItem } = await import('@react-native-async-storage/async-storage');
      await setItem('streak_milestones', JSON.stringify(milestones));
    } catch (error) {
      console.error('Error saving milestone progress:', error);
    }
  };

  const recordWorkout = async (workoutDate: string) => {
    try {
      // This will be called when a workout is completed
      // The streak calculation will happen in refreshStreaks
      await refreshStreaks();
    } catch (err) {
      console.error('Error recording workout for streak:', err);
    }
  };

  const useStreakRecovery = async (): Promise<boolean> => {
    try {
      if (!streakData.streakRecovery.canRecover) {
        return false;
      }

      // Mark recovery as used
      const { setItem } = await import('@react-native-async-storage/async-storage');
      const recoveryData = {
        usedAt: new Date().toISOString(),
        originalStreak: streakData.currentStreak,
      };
      await setItem('streak_recovery_used', JSON.stringify(recoveryData));

      // Refresh streaks to update recovery status
      await refreshStreaks();
      return true;
    } catch (err) {
      console.error('Error using streak recovery:', err);
      return false;
    }
  };

  const getStreakHistory = (days: number) => {
    const history: { date: string; hasWorkout: boolean }[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const hasWorkout = workouts.some(workout => {
        if (!workout.completed_at) return false;
        const workoutDate = new Date(workout.completed_at).toISOString().split('T')[0];
        return workoutDate === dateString;
      });

      history.push({
        date: dateString,
        hasWorkout,
      });
    }

    return history;
  };

  const getMotivationalMessage = (): string => {
    return streakData.motivation.message;
  };

  const checkMilestones = () => {
    // This will trigger milestone checks and celebrations
    refreshStreaks();
  };

  const contextValue: StreakContextType = {
    streakData,
    isLoading,
    error,
    refreshStreaks,
    recordWorkout,
    useStreakRecovery,
    getStreakHistory,
    getMotivationalMessage,
    checkMilestones,
  };

  return (
    <StreakContext.Provider value={contextValue}>
      {children}
    </StreakContext.Provider>
  );
}

export function useStreakTracking() {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error('useStreakTracking must be used within a StreakProvider');
  }
  return context;
}
