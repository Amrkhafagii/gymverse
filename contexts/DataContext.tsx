import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Profile {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

interface Streak {
  current_streak: number;
  longest_streak: number;
  last_workout_date: string | null;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlocked_at: string | null;
  icon: string;
  category: string;
}

interface DataContextType {
  profile: Profile | null;
  streak: Streak | null;
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockProfile: Profile = {
          id: '1',
          username: 'FitnessWarrior',
          email: 'user@example.com',
          created_at: new Date().toISOString(),
        };

        const mockStreak: Streak = {
          current_streak: 7,
          longest_streak: 21,
          last_workout_date: new Date().toISOString(),
        };

        const mockAchievements: Achievement[] = [
          {
            id: '1',
            title: 'First Workout',
            description: 'Complete your first workout',
            unlocked: true,
            unlocked_at: new Date().toISOString(),
            icon: 'trophy',
            category: 'milestone',
          },
          {
            id: '2',
            title: 'Week Warrior',
            description: 'Maintain a 7-day streak',
            unlocked: true,
            unlocked_at: new Date().toISOString(),
            icon: 'flame',
            category: 'streak',
          },
          {
            id: '3',
            title: 'Consistency King',
            description: 'Maintain a 30-day streak',
            unlocked: false,
            unlocked_at: null,
            icon: 'crown',
            category: 'streak',
          },
          {
            id: '4',
            title: 'Strength Builder',
            description: 'Complete 50 strength workouts',
            unlocked: false,
            unlocked_at: null,
            icon: 'dumbbell',
            category: 'workout',
          },
          {
            id: '5',
            title: 'Cardio Champion',
            description: 'Complete 25 cardio sessions',
            unlocked: false,
            unlocked_at: null,
            icon: 'heart',
            category: 'workout',
          },
        ];

        setProfile(mockProfile);
        setStreak(mockStreak);
        setAchievements(mockAchievements);
        setError(null);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const value: DataContextType = {
    profile,
    streak,
    achievements,
    loading,
    error,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
