import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Mock data types to match the expected structure
interface Exercise {
  id: string;
  name: string;
  description: string;
  targetMuscles: string[];
  duration: number;
}

interface Workout {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  duration: number;
  targetMuscles: string[];
  date: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
}

interface DataContextType {
  workouts: Workout[];
  achievements: Achievement[];
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development
  const mockWorkouts: Workout[] = [
    {
      id: '1',
      name: 'Morning Strength',
      description: 'Full body strength training to start your day',
      exercises: [
        {
          id: '1',
          name: 'Push-ups',
          description: 'Classic bodyweight exercise',
          targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
          duration: 5
        },
        {
          id: '2',
          name: 'Squats',
          description: 'Lower body compound movement',
          targetMuscles: ['Quadriceps', 'Glutes'],
          duration: 5
        }
      ],
      duration: 45,
      targetMuscles: ['Chest', 'Shoulders', 'Legs'],
      date: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Evening Cardio',
      description: 'High intensity cardio session',
      exercises: [
        {
          id: '3',
          name: 'Burpees',
          description: 'Full body explosive movement',
          targetMuscles: ['Full Body'],
          duration: 10
        }
      ],
      duration: 30,
      targetMuscles: ['Full Body'],
      date: new Date().toISOString(),
    }
  ];

  const mockAchievements: Achievement[] = [
    {
      id: '1',
      title: 'First Workout',
      description: 'Completed your first workout session',
      unlockedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    },
    {
      id: '2',
      title: 'Week Warrior',
      description: 'Completed 7 workouts in a week',
      unlockedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    },
    {
      id: '3',
      title: 'Consistency King',
      description: 'Maintained a 7-day workout streak',
      unlockedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    }
  ];

  const mockExercises: Exercise[] = [
    {
      id: '1',
      name: 'Push-ups',
      description: 'Classic bodyweight exercise targeting chest, shoulders, and triceps',
      targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
      duration: 5
    },
    {
      id: '2',
      name: 'Squats',
      description: 'Lower body compound movement targeting quadriceps and glutes',
      targetMuscles: ['Quadriceps', 'Glutes'],
      duration: 5
    },
    {
      id: '3',
      name: 'Burpees',
      description: 'Full body explosive movement combining squat, plank, and jump',
      targetMuscles: ['Full Body'],
      duration: 10
    },
    {
      id: '4',
      name: 'Plank',
      description: 'Core strengthening isometric exercise',
      targetMuscles: ['Core', 'Shoulders'],
      duration: 3
    },
    {
      id: '5',
      name: 'Lunges',
      description: 'Single-leg exercise targeting quadriceps, glutes, and balance',
      targetMuscles: ['Quadriceps', 'Glutes', 'Calves'],
      duration: 8
    }
  ];

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would fetch from Supabase
      setWorkouts(mockWorkouts);
      setAchievements(mockAchievements);
      setExercises(mockExercises);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load initial data
    setWorkouts(mockWorkouts);
    setAchievements(mockAchievements);
    setExercises(mockExercises);
  }, []);

  const value: DataContextType = {
    workouts,
    achievements,
    exercises,
    loading,
    error,
    refreshData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
