import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  Profile, 
  AppSettings, 
  WorkoutStreak, 
  Achievement,
  getProfile,
  saveProfile,
  getSettings,
  saveSettings,
  getWorkoutStreak,
  updateWorkoutStreak,
  getAchievements,
  unlockAchievement as unlockAchievementStorage
} from '@/lib/storage/asyncStorage';

interface DataContextType {
  // Profile
  profile: Profile | null;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  
  // Settings
  settings: AppSettings | null;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  
  // Streak
  streak: WorkoutStreak | null;
  recordWorkout: (date?: string) => Promise<void>;
  
  // Achievements
  achievements: Achievement[];
  unlockAchievement: (achievementId: string) => Promise<boolean>;
  
  // Loading state
  loading: boolean;
  
  // Refresh data
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [streak, setStreak] = useState<WorkoutStreak | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [profileData, settingsData, streakData, achievementsData] = await Promise.all([
        getProfile(),
        getSettings(),
        getWorkoutStreak(),
        getAchievements(),
      ]);
      
      setProfile(profileData);
      setSettings(settingsData);
      setStreak(streakData);
      setAchievements(achievementsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    
    try {
      const updatedProfile = { ...profile, ...updates };
      await saveProfile(updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    if (!settings) return;
    
    try {
      const updatedSettings = { ...settings, ...updates };
      await saveSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const recordWorkout = async (date?: string) => {
    try {
      const workoutDate = date || new Date().toISOString();
      const updatedStreak = await updateWorkoutStreak(workoutDate);
      setStreak(updatedStreak);
      
      // Check for streak achievements
      await checkStreakAchievements(updatedStreak.current_streak);
    } catch (error) {
      console.error('Error recording workout:', error);
      throw error;
    }
  };

  const unlockAchievement = async (achievementId: string): Promise<boolean> => {
    try {
      const unlocked = await unlockAchievementStorage(achievementId);
      
      if (unlocked) {
        const updatedAchievements = achievements.map(achievement =>
          achievement.id === achievementId
            ? { ...achievement, unlocked: true, unlocked_at: new Date().toISOString() }
            : achievement
        );
        setAchievements(updatedAchievements);
      }
      
      return unlocked;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
  };

  const checkStreakAchievements = async (currentStreak: number) => {
    const streakAchievements = [
      { id: 'week_streak', threshold: 7 },
      { id: 'month_streak', threshold: 30 },
    ];

    for (const { id, threshold } of streakAchievements) {
      if (currentStreak >= threshold) {
        await unlockAchievement(id);
      }
    }
  };

  const refreshData = async () => {
    await loadInitialData();
  };

  const value = {
    profile,
    updateProfile,
    settings,
    updateSettings,
    streak,
    recordWorkout,
    achievements,
    unlockAchievement,
    loading,
    refreshData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
