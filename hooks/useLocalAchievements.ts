import { useState, useEffect } from 'react';
import { AchievementEngine, Achievement, WorkoutStats } from '@/lib/achievementEngine';
import { useLocalWorkoutStorage } from '@/hooks/useLocalWorkoutStorage';
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';

interface LocalAchievementState {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  lockedAchievements: Achievement[];
  recentUnlocks: Achievement[];
  totalPoints: number;
  isLoading: boolean;
  error: string | null;
}

export function useLocalAchievements() {
  const { getWorkoutHistory, getWorkoutStats } = useLocalWorkoutStorage();
  const { workouts, stats } = useWorkoutHistory();
  
  const [state, setState] = useState<LocalAchievementState>({
    achievements: [],
    unlockedAchievements: [],
    lockedAchievements: [],
    recentUnlocks: [],
    totalPoints: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    initializeAchievements();
  }, []);

  useEffect(() => {
    if (workouts.length > 0) {
      checkAndUpdateAchievements();
    }
  }, [workouts, stats]);

  const initializeAchievements = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
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

      updateAchievementState(achievementsWithProgress);
    } catch (error) {
      console.error('Error initializing achievements:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load achievements',
        isLoading: false,
      }));
    }
  };

  const checkAndUpdateAchievements = async () => {
    try {
      const workoutHistory = await getWorkoutHistory();
      const workoutStats = await getWorkoutStats();
      
      const newUnlocks = AchievementEngine.checkAchievements(
        workoutHistory,
        workoutStats,
        state.achievements
      );

      if (newUnlocks.length > 0) {
        const updatedAchievements = state.achievements.map(achievement => {
          const unlock = newUnlocks.find(u => u.id === achievement.id);
          return unlock || achievement;
        });

        updateAchievementState(updatedAchievements, newUnlocks);
        await saveAchievementProgress(updatedAchievements);
      } else {
        // Update progress for locked achievements
        const updatedAchievements = state.achievements.map(achievement => {
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

        updateAchievementState(updatedAchievements);
        await saveAchievementProgress(updatedAchievements);
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const loadAchievementProgress = async (): Promise<any[]> => {
    try {
      const { getItem } = await import('@react-native-async-storage/async-storage');
      const saved = await getItem('local_achievement_progress');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading achievement progress:', error);
      return [];
    }
  };

  const saveAchievementProgress = async (achievements: Achievement[]) => {
    try {
      const { setItem } = await import('@react-native-async-storage/async-storage');
      const progressData = achievements.map(achievement => ({
        id: achievement.id,
        unlocked: achievement.unlocked,
        unlockedAt: achievement.unlockedAt,
        progress: achievement.progress,
      }));
      await setItem('local_achievement_progress', JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving achievement progress:', error);
    }
  };

  const updateAchievementState = (achievements: Achievement[], newUnlocks: Achievement[] = []) => {
    const unlocked = achievements.filter(a => a.unlocked);
    const locked = achievements.filter(a => !a.unlocked);
    
    // Recent unlocks (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recent = unlocked.filter(a => 
      a.unlockedAt && new Date(a.unlockedAt) >= sevenDaysAgo
    );

    const totalPoints = unlocked.reduce((sum, achievement) => sum + achievement.points, 0);

    setState(prev => ({
      ...prev,
      achievements,
      unlockedAchievements: unlocked,
      lockedAchievements: locked,
      recentUnlocks: recent,
      totalPoints,
      isLoading: false,
    }));
  };

  const getAchievementsByCategory = (category: string): Achievement[] => {
    return state.achievements.filter(achievement => achievement.category === category);
  };

  const getAchievementsByRarity = (rarity: string): Achievement[] => {
    return state.achievements.filter(achievement => achievement.rarity === rarity);
  };

  const refreshAchievements = async () => {
    await initializeAchievements();
    await checkAndUpdateAchievements();
  };

  return {
    ...state,
    getAchievementsByCategory,
    getAchievementsByRarity,
    refreshAchievements,
    checkAndUpdateAchievements,
  };
}
