import React, { createContext, useContext, useState, useEffect } from 'react';
import { Achievement } from '@/types/achievement';
import { AchievementEngine } from '@/lib/achievements/achievementEngine';
import { useLocalWorkoutStorage } from '@/hooks/useLocalWorkoutStorage';
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';

interface AchievementContextType {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  lockedAchievements: Achievement[];
  recentUnlocks: Achievement[];
  totalPoints: number;
  isLoading: boolean;
  error: string | null;
  refreshAchievements: () => Promise<void>;
  checkAchievements: () => Promise<Achievement[]>;
  getAchievementsByCategory: (category: string) => Achievement[];
  getAchievementsByRarity: (rarity: string) => Achievement[];
  triggerAchievementCheck: () => Promise<Achievement[]>;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const { getWorkoutHistory, getWorkoutStats } = useLocalWorkoutStorage();
  const { workouts, stats } = useWorkoutHistory();
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAchievements();
  }, []);

  useEffect(() => {
    if (workouts.length > 0) {
      checkAchievements();
    }
  }, [workouts, stats]);

  const initializeAchievements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const allAchievements = AchievementEngine.getAllAchievements();
      const savedProgress = await loadAchievementProgress();
      
      // Merge saved progress with achievement definitions
      const achievementsWithProgress = allAchievements.map(achievement => {
        const saved = savedProgress.find(p => p.id === achievement.id);
        return {
          ...achievement,
          unlocked: saved?.unlocked || false,
          unlockedAt: saved?.unlockedAt,
          progress: saved?.progress || 0,
        };
      });

      setAchievements(achievementsWithProgress);
    } catch (err) {
      console.error('Error initializing achievements:', err);
      setError('Failed to load achievements');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAchievementProgress = async (): Promise<any[]> => {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const saved = await AsyncStorage.default.getItem('achievement_progress_v2');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading achievement progress:', error);
      return [];
    }
  };

  const saveAchievementProgress = async (achievements: Achievement[]) => {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const progressData = achievements.map(achievement => ({
        id: achievement.id,
        unlocked: achievement.unlocked,
        unlockedAt: achievement.unlockedAt,
        progress: achievement.progress,
      }));
      await AsyncStorage.default.setItem('achievement_progress_v2', JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving achievement progress:', error);
    }
  };

  const checkAchievements = async (): Promise<Achievement[]> => {
    try {
      const workoutHistory = await getWorkoutHistory();
      const workoutStats = await getWorkoutStats();
      
      const newUnlocks = AchievementEngine.checkAchievements(
        achievements,
        workoutHistory,
        workoutStats
      );

      if (newUnlocks.length > 0) {
        const updatedAchievements = achievements.map(achievement => {
          const unlock = newUnlocks.find(u => u.id === achievement.id);
          if (unlock) {
            return {
              ...achievement,
              unlocked: true,
              unlockedAt: new Date().toISOString(),
              progress: achievement.maxProgress,
            };
          }
          return achievement;
        });

        setAchievements(updatedAchievements);
        await saveAchievementProgress(updatedAchievements);
        
        return newUnlocks;
      } else {
        // Update progress for locked achievements
        const updatedAchievements = achievements.map(achievement => {
          if (achievement.unlocked) return achievement;
          
          const updatedProgress = AchievementEngine.calculateProgress(
            achievement,
            workoutHistory,
            workoutStats
          );
          
          return {
            ...achievement,
            progress: updatedProgress,
          };
        });

        setAchievements(updatedAchievements);
        await saveAchievementProgress(updatedAchievements);
      }
      
      return [];
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  };

  const triggerAchievementCheck = async (): Promise<Achievement[]> => {
    return await checkAchievements();
  };

  const refreshAchievements = async () => {
    await initializeAchievements();
    await checkAchievements();
  };

  const getAchievementsByCategory = (category: string): Achievement[] => {
    return achievements.filter(achievement => achievement.category === category);
  };

  const getAchievementsByRarity = (rarity: string): Achievement[] => {
    return achievements.filter(achievement => achievement.rarity === rarity);
  };

  // Computed values
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  
  // Recent unlocks (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentUnlocks = unlockedAchievements.filter(a => 
    a.unlockedAt && new Date(a.unlockedAt) >= sevenDaysAgo
  );

  const totalPoints = unlockedAchievements.reduce((sum, achievement) => sum + achievement.points, 0);

  const contextValue: AchievementContextType = {
    achievements,
    unlockedAchievements,
    lockedAchievements,
    recentUnlocks,
    totalPoints,
    isLoading,
    error,
    refreshAchievements,
    checkAchievements,
    getAchievementsByCategory,
    getAchievementsByRarity,
    triggerAchievementCheck,
  };

  return (
    <AchievementContext.Provider value={contextValue}>
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
}
