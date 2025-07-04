import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  PROFILE: 'profile',
  SETTINGS: 'settings',
  STREAK: 'workout_streak',
  ACHIEVEMENTS: 'achievements',
  ONBOARDING: 'onboarding_completed',
  THEME: 'theme_preference',
  UNITS: 'units_preference',
  NOTIFICATIONS: 'notification_settings',
  PRIVACY: 'privacy_settings',
  BACKUP: 'last_backup_date',
} as const;

// Profile data interface
export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  date_of_birth?: string;
  height_cm?: number;
  weight_kg?: number;
  fitness_level?: 'beginner' | 'intermediate' | 'advanced';
  fitness_goals?: string[];
  preferred_units?: 'metric' | 'imperial';
  created_at: string;
  updated_at: string;
}

// Settings interface
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  units: 'metric' | 'imperial';
  notifications: {
    workout_reminders: boolean;
    achievement_alerts: boolean;
    progress_updates: boolean;
    rest_timer: boolean;
  };
  privacy: {
    analytics: boolean;
    crash_reports: boolean;
  };
  workout: {
    default_rest_time: number;
    auto_start_timer: boolean;
    show_weight_suggestions: boolean;
  };
}

// Workout streak interface
export interface WorkoutStreak {
  current_streak: number;
  longest_streak: number;
  last_workout_date?: string;
  streak_start_date?: string;
  updated_at: string;
}

// Achievement interface
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'workout' | 'strength' | 'endurance' | 'consistency' | 'social';
  unlocked: boolean;
  unlocked_at?: string;
  progress?: number;
  target?: number;
}

// Generic storage functions
export const storeData = async <T>(key: string, value: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
    throw error;
  }
};

export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return null;
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing all AsyncStorage data:', error);
    throw error;
  }
};

// Profile functions
export const getProfile = async (): Promise<Profile | null> => {
  return await getData<Profile>(STORAGE_KEYS.PROFILE);
};

export const saveProfile = async (profile: Profile): Promise<void> => {
  const updatedProfile = {
    ...profile,
    updated_at: new Date().toISOString(),
  };
  await storeData(STORAGE_KEYS.PROFILE, updatedProfile);
};

export const createDefaultProfile = async (): Promise<Profile> => {
  const defaultProfile: Profile = {
    id: `user_${Date.now()}`,
    username: 'GymVerse User',
    fitness_level: 'beginner',
    fitness_goals: [],
    preferred_units: 'metric',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  await saveProfile(defaultProfile);
  return defaultProfile;
};

// Settings functions
export const getSettings = async (): Promise<AppSettings> => {
  const settings = await getData<AppSettings>(STORAGE_KEYS.SETTINGS);
  
  // Return default settings if none exist
  if (!settings) {
    const defaultSettings: AppSettings = {
      theme: 'dark',
      units: 'metric',
      notifications: {
        workout_reminders: true,
        achievement_alerts: true,
        progress_updates: true,
        rest_timer: true,
      },
      privacy: {
        analytics: false,
        crash_reports: true,
      },
      workout: {
        default_rest_time: 60,
        auto_start_timer: true,
        show_weight_suggestions: true,
      },
    };
    
    await saveSettings(defaultSettings);
    return defaultSettings;
  }
  
  return settings;
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  await storeData(STORAGE_KEYS.SETTINGS, settings);
};

export const updateSettings = async (updates: Partial<AppSettings>): Promise<void> => {
  const currentSettings = await getSettings();
  const updatedSettings = { ...currentSettings, ...updates };
  await saveSettings(updatedSettings);
};

// Workout streak functions
export const getWorkoutStreak = async (): Promise<WorkoutStreak> => {
  const streak = await getData<WorkoutStreak>(STORAGE_KEYS.STREAK);
  
  if (!streak) {
    const defaultStreak: WorkoutStreak = {
      current_streak: 0,
      longest_streak: 0,
      updated_at: new Date().toISOString(),
    };
    
    await saveWorkoutStreak(defaultStreak);
    return defaultStreak;
  }
  
  return streak;
};

export const saveWorkoutStreak = async (streak: WorkoutStreak): Promise<void> => {
  const updatedStreak = {
    ...streak,
    updated_at: new Date().toISOString(),
  };
  await storeData(STORAGE_KEYS.STREAK, updatedStreak);
};

export const updateWorkoutStreak = async (workoutDate: string): Promise<WorkoutStreak> => {
  const currentStreak = await getWorkoutStreak();
  const today = new Date().toDateString();
  const workoutDay = new Date(workoutDate).toDateString();
  const lastWorkoutDay = currentStreak.last_workout_date 
    ? new Date(currentStreak.last_workout_date).toDateString() 
    : null;

  let updatedStreak = { ...currentStreak };

  // If workout is today and we haven't recorded today yet
  if (workoutDay === today && lastWorkoutDay !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    if (lastWorkoutDay === yesterdayString) {
      // Continue streak
      updatedStreak.current_streak += 1;
    } else if (!lastWorkoutDay) {
      // First workout
      updatedStreak.current_streak = 1;
      updatedStreak.streak_start_date = workoutDate;
    } else {
      // Streak broken, start new
      updatedStreak.current_streak = 1;
      updatedStreak.streak_start_date = workoutDate;
    }

    updatedStreak.last_workout_date = workoutDate;
    
    // Update longest streak if current is longer
    if (updatedStreak.current_streak > updatedStreak.longest_streak) {
      updatedStreak.longest_streak = updatedStreak.current_streak;
    }

    await saveWorkoutStreak(updatedStreak);
  }

  return updatedStreak;
};

// Achievement functions
export const getAchievements = async (): Promise<Achievement[]> => {
  const achievements = await getData<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS);
  
  if (!achievements) {
    const defaultAchievements = await initializeDefaultAchievements();
    return defaultAchievements;
  }
  
  return achievements;
};

export const saveAchievements = async (achievements: Achievement[]): Promise<void> => {
  await storeData(STORAGE_KEYS.ACHIEVEMENTS, achievements);
};

export const unlockAchievement = async (achievementId: string): Promise<boolean> => {
  const achievements = await getAchievements();
  const achievement = achievements.find(a => a.id === achievementId);
  
  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true;
    achievement.unlocked_at = new Date().toISOString();
    await saveAchievements(achievements);
    return true;
  }
  
  return false;
};

const initializeDefaultAchievements = async (): Promise<Achievement[]> => {
  const defaultAchievements: Achievement[] = [
    {
      id: 'first_workout',
      name: 'First Steps',
      description: 'Complete your first workout',
      icon: '🎯',
      category: 'workout',
      unlocked: false,
    },
    {
      id: 'week_streak',
      name: 'Week Warrior',
      description: 'Maintain a 7-day workout streak',
      icon: '🔥',
      category: 'consistency',
      unlocked: false,
    },
    {
      id: 'month_streak',
      name: 'Monthly Master',
      description: 'Maintain a 30-day workout streak',
      icon: '💪',
      category: 'consistency',
      unlocked: false,
    },
    {
      id: 'ten_workouts',
      name: 'Perfect Ten',
      description: 'Complete 10 workouts',
      icon: '🏆',
      category: 'workout',
      unlocked: false,
    },
    {
      id: 'fifty_workouts',
      name: 'Half Century',
      description: 'Complete 50 workouts',
      icon: '🌟',
      category: 'workout',
      unlocked: false,
    },
    {
      id: 'hundred_workouts',
      name: 'Century Club',
      description: 'Complete 100 workouts',
      icon: '👑',
      category: 'workout',
      unlocked: false,
    },
    {
      id: 'first_pr',
      name: 'Personal Best',
      description: 'Set your first personal record',
      icon: '📈',
      category: 'strength',
      unlocked: false,
    },
    {
      id: 'cardio_king',
      name: 'Cardio King',
      description: 'Complete 25 cardio sessions',
      icon: '❤️',
      category: 'endurance',
      unlocked: false,
    },
  ];
  
  await saveAchievements(defaultAchievements);
  return defaultAchievements;
};

// Onboarding functions
export const isOnboardingCompleted = async (): Promise<boolean> => {
  const completed = await getData<boolean>(STORAGE_KEYS.ONBOARDING);
  return completed === true;
};

export const setOnboardingCompleted = async (): Promise<void> => {
  await storeData(STORAGE_KEYS.ONBOARDING, true);
};

// Utility functions
export const getAllStorageData = async (): Promise<Record<string, any>> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const stores = await AsyncStorage.multiGet(keys);
    
    const data: Record<string, any> = {};
    stores.forEach(([key, value]) => {
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });
    
    return data;
  } catch (error) {
    console.error('Error getting all storage data:', error);
    return {};
  }
};

export const getStorageSize = async (): Promise<number> => {
  try {
    const data = await getAllStorageData();
    const jsonString = JSON.stringify(data);
    return new Blob([jsonString]).size;
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return 0;
  }
};
