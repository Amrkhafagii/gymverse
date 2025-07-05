import React, { createContext, useContext, useState, useEffect } from 'react';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  restTime: number;
  notes?: string;
}

interface Workout {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  duration: number;
  targetMuscles: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  date: string;
  completed: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'strength' | 'endurance' | 'consistency' | 'milestone';
}

interface ProgressEntry {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  muscle?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    arms?: number;
    thighs?: number;
  };
  photos?: string[];
}

interface DataContextType {
  workouts: Workout[];
  achievements: Achievement[];
  progress: ProgressEntry[];
  loading: boolean;
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  updateWorkout: (id: string, workout: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  addProgressEntry: (entry: Omit<ProgressEntry, 'id'>) => void;
  updateProgressEntry: (id: string, entry: Partial<ProgressEntry>) => void;
  deleteProgressEntry: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize with mock data
    const initializeData = () => {
      const mockWorkouts: Workout[] = [
        {
          id: '1',
          name: 'Upper Body Strength',
          description: 'Focus on building upper body strength with compound movements',
          exercises: [
            {
              id: '1',
              name: 'Push-ups',
              sets: 3,
              reps: 12,
              restTime: 60,
              notes: 'Keep core tight'
            },
            {
              id: '2',
              name: 'Pull-ups',
              sets: 3,
              reps: 8,
              restTime: 90,
            },
            {
              id: '3',
              name: 'Dumbbell Press',
              sets: 3,
              reps: 10,
              weight: 25,
              restTime: 60,
            },
          ],
          duration: 45,
          targetMuscles: ['Chest', 'Back', 'Arms'],
          difficulty: 'Intermediate',
          date: new Date().toISOString(),
          completed: false,
        },
        {
          id: '2',
          name: 'Cardio Blast',
          description: 'High-intensity cardio workout to boost endurance',
          exercises: [
            {
              id: '4',
              name: 'Burpees',
              sets: 4,
              reps: 10,
              restTime: 30,
            },
            {
              id: '5',
              name: 'Mountain Climbers',
              sets: 3,
              reps: 20,
              restTime: 30,
            },
            {
              id: '6',
              name: 'Jump Squats',
              sets: 3,
              reps: 15,
              restTime: 45,
            },
          ],
          duration: 30,
          targetMuscles: ['Full Body'],
          difficulty: 'Advanced',
          date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          completed: true,
        },
        {
          id: '3',
          name: 'Lower Body Power',
          description: 'Build leg strength and power with these exercises',
          exercises: [
            {
              id: '7',
              name: 'Squats',
              sets: 4,
              reps: 12,
              weight: 135,
              restTime: 90,
            },
            {
              id: '8',
              name: 'Deadlifts',
              sets: 3,
              reps: 8,
              weight: 185,
              restTime: 120,
            },
            {
              id: '9',
              name: 'Lunges',
              sets: 3,
              reps: 10,
              restTime: 60,
            },
          ],
          duration: 50,
          targetMuscles: ['Legs', 'Glutes'],
          difficulty: 'Intermediate',
          date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          completed: false,
        },
      ];

      const mockAchievements: Achievement[] = [
        {
          id: '1',
          title: 'First Workout',
          description: 'Completed your first workout',
          icon: '🎯',
          unlockedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          category: 'milestone',
        },
        {
          id: '2',
          title: 'Week Warrior',
          description: 'Completed 7 days in a row',
          icon: '🔥',
          unlockedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          category: 'consistency',
        },
        {
          id: '3',
          title: 'Strength Builder',
          description: 'Lifted 1000 lbs total in one session',
          icon: '💪',
          unlockedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          category: 'strength',
        },
      ];

      const mockProgress: ProgressEntry[] = [
        {
          id: '1',
          date: new Date(Date.now() - 30 * 86400000).toISOString(),
          weight: 180,
          bodyFat: 15,
          muscle: 45,
          measurements: {
            chest: 42,
            waist: 32,
            arms: 15,
            thighs: 24,
          },
        },
        {
          id: '2',
          date: new Date(Date.now() - 15 * 86400000).toISOString(),
          weight: 178,
          bodyFat: 14,
          muscle: 46,
          measurements: {
            chest: 42.5,
            waist: 31.5,
            arms: 15.2,
            thighs: 24.2,
          },
        },
        {
          id: '3',
          date: new Date().toISOString(),
          weight: 176,
          bodyFat: 13,
          muscle: 47,
          measurements: {
            chest: 43,
            waist: 31,
            arms: 15.5,
            thighs: 24.5,
          },
        },
      ];

      setWorkouts(mockWorkouts);
      setAchievements(mockAchievements);
      setProgress(mockProgress);
      setLoading(false);
    };

    // Simulate loading delay
    setTimeout(initializeData, 1000);
  }, []);

  const addWorkout = (workout: Omit<Workout, 'id'>) => {
    const newWorkout = {
      ...workout,
      id: Date.now().toString(),
    };
    setWorkouts(prev => [...prev, newWorkout]);
  };

  const updateWorkout = (id: string, updatedWorkout: Partial<Workout>) => {
    setWorkouts(prev => 
      prev.map(workout => 
        workout.id === id ? { ...workout, ...updatedWorkout } : workout
      )
    );
  };

  const deleteWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(workout => workout.id !== id));
  };

  const addProgressEntry = (entry: Omit<ProgressEntry, 'id'>) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setProgress(prev => [...prev, newEntry]);
  };

  const updateProgressEntry = (id: string, updatedEntry: Partial<ProgressEntry>) => {
    setProgress(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, ...updatedEntry } : entry
      )
    );
  };

  const deleteProgressEntry = (id: string) => {
    setProgress(prev => prev.filter(entry => entry.id !== id));
  };

  const value = {
    workouts,
    achievements,
    progress,
    loading,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    addProgressEntry,
    updateProgressEntry,
    deleteProgressEntry,
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
