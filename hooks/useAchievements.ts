import { useState, useEffect } from 'react';
import { Achievement } from '@/lib/supabase';
import { 
  checkAllAchievements, 
  getUserAchievements, 
  getUserAchievementProgress,
  UserAchievement,
  AchievementProgress
} from '@/lib/achievements';

export function useAchievements(userId: string | null) {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserAchievements();
      loadAchievementProgress();
    }
  }, [userId]);

  const loadUserAchievements = async () => {
    if (!userId) return;
    
    try {
      const achievements = await getUserAchievements(userId);
      setUserAchievements(achievements);
    } catch (error) {
      console.error('Error loading user achievements:', error);
    }
  };

  const loadAchievementProgress = async () => {
    if (!userId) return;
    
    try {
      const progress = await getUserAchievementProgress(userId);
      setAchievementProgress(progress);
    } catch (error) {
      console.error('Error loading achievement progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewAchievements = async () => {
    if (!userId) return [];
    
    try {
      const newlyUnlocked = await checkAllAchievements(userId);
      if (newlyUnlocked.length > 0) {
        setNewAchievements(newlyUnlocked);
        // Refresh user achievements and progress
        await loadUserAchievements();
        await loadAchievementProgress();
      }
      return newlyUnlocked;
    } catch (error) {
      console.error('Error checking for new achievements:', error);
      return [];
    }
  };

  const clearNewAchievements = () => {
    setNewAchievements([]);
  };

  const getTotalPoints = () => {
    return userAchievements.reduce((total, ua) => total + ua.achievement.points, 0);
  };

  const getUnlockedCount = () => {
    return userAchievements.length;
  };

  const getTotalAchievements = () => {
    return achievementProgress.length;
  };

  return {
    userAchievements,
    achievementProgress,
    newAchievements,
    loading,
    checkForNewAchievements,
    clearNewAchievements,
    getTotalPoints,
    getUnlockedCount,
    getTotalAchievements,
    refreshAchievements: loadUserAchievements,
    refreshProgress: loadAchievementProgress,
  };
}