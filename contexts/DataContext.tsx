import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

// Types
export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment: string;
  instructions: string[];
  tips?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  reps: number;
  weight: number;
  restTime?: number;
  completed: boolean;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  duration?: number;
  completedAt?: string;
  createdAt: string;
  userId: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: Omit<WorkoutExercise, 'sets'>[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  createdAt: string;
}

export interface ProgressEntry {
  id: string;
  exerciseId: string;
  date: string;
  weight: number;
  reps: number;
  sets: number;
  volume: number;
  userId: string;
}

interface DataContextType {
  // Exercises
  exercises: Exercise[];
  getExercise: (id: string) => Exercise | undefined;
  addExercise: (exercise: Omit<Exercise, 'id'>) => Promise<Exercise>;
  updateExercise: (id: string, updates: Partial<Exercise>) => Promise<void>;
  
  // Workouts
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt' | 'userId'>) => Promise<Workout>;
  updateWorkout: (id: string, updates: Partial<Workout>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  
  // Templates
  templates: WorkoutTemplate[];
  addTemplate: (template: Omit<WorkoutTemplate, 'id' | 'createdAt'>) => Promise<WorkoutTemplate>;
  updateTemplate: (id: string, updates: Partial<WorkoutTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  
  // Progress
  progressEntries: ProgressEntry[];
  addProgressEntry: (entry: Omit<ProgressEntry, 'id' | 'userId'>) => Promise<ProgressEntry>;
  getExerciseProgress: (exerciseId: string) => ProgressEntry[];
  
  // Analytics
  getWorkoutStats: () => {
    totalWorkouts: number;
    totalVolume: number;
    averageDuration: number;
    workoutsThisWeek: number;
  };
  
  isLoading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  EXERCISES: '@gymverse_exercises',
  WORKOUTS: '@gymverse_workouts',
  TEMPLATES: '@gymverse_templates',
  PROGRESS: '@gymverse_progress',
};

export function DataProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isAuthenticated } = useSupabaseAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeData();
  }, [isAuthenticated, authUser]);

  const initializeData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isAuthenticated && authUser) {
        // Try to load from Supabase first, fallback to local storage
        await loadFromSupabase();
      } else {
        // Load from local storage only
        await loadFromLocalStorage();
      }

      // Load default exercises if none exist
      if (exercises.length === 0) {
        await loadDefaultExercises();
      }
    } catch (err) {
      console.error('Failed to initialize data:', err);
      setError('Failed to load data');
      // Fallback to local storage
      await loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromSupabase = async () => {
    try {
      // Load exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*');

      if (exercisesError) throw exercisesError;

      // Load workouts
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', authUser?.id);

      if (workoutsError) throw workoutsError;

      // Load templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('workout_templates')
        .select('*');

      if (templatesError) throw templatesError;

      // Load progress
      const { data: progressData, error: progressError } = await supabase
        .from('progress_entries')
        .select('*')
        .eq('user_id', authUser?.id);

      if (progressError) throw progressError;

      // Update state with Supabase data
      if (exercisesData) setExercises(exercisesData);
      if (workoutsData) setWorkouts(workoutsData);
      if (templatesData) setTemplates(templatesData);
      if (progressData) setProgressEntries(progressData);

    } catch (error) {
      console.error('Failed to load from Supabase:', error);
      // Fallback to local storage
      await loadFromLocalStorage();
    }
  };

  const loadFromLocalStorage = async () => {
    try {
      const [exercisesData, workoutsData, templatesData, progressData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.EXERCISES),
        AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS),
        AsyncStorage.getItem(STORAGE_KEYS.TEMPLATES),
        AsyncStorage.getItem(STORAGE_KEYS.PROGRESS),
      ]);

      if (exercisesData) setExercises(JSON.parse(exercisesData));
      if (workoutsData) setWorkouts(JSON.parse(workoutsData));
      if (templatesData) setTemplates(JSON.parse(templatesData));
      if (progressData) setProgressEntries(JSON.parse(progressData));
    } catch (error) {
      console.error('Failed to load from local storage:', error);
    }
  };

  const loadDefaultExercises = async () => {
    const defaultExercises: Exercise[] = [
      {
        id: 'ex_1',
        name: 'Bench Press',
        category: 'Chest',
        muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
        equipment: 'Barbell',
        instructions: [
          'Lie flat on bench with feet firmly on ground',
          'Grip barbell with hands slightly wider than shoulder width',
          'Lower bar to chest with control',
          'Press bar up explosively to starting position'
        ],
        difficulty: 'intermediate',
        imageUrl: 'https://images.pexels.com/photos/703012/pexels-photo-703012.jpeg'
      },
      {
        id: 'ex_2',
        name: 'Squats',
        category: 'Legs',
        muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
        equipment: 'Barbell',
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower body by bending knees and hips',
          'Keep chest up and knees tracking over toes',
          'Return to starting position'
        ],
        difficulty: 'beginner',
        imageUrl: 'https://images.pexels.com/photos/685530/pexels-photo-685530.jpeg'
      },
      {
        id: 'ex_3',
        name: 'Deadlift',
        category: 'Back',
        muscleGroups: ['Hamstrings', 'Glutes', 'Lower Back', 'Traps'],
        equipment: 'Barbell',
        instructions: [
          'Stand with feet hip-width apart, bar over mid-foot',
          'Bend at hips and knees to grip bar',
          'Keep chest up and back straight',
          'Drive through heels to lift bar'
        ],
        difficulty: 'advanced',
        imageUrl: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'
      }
    ];

    setExercises(defaultExercises);
    await AsyncStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(defaultExercises));
  };

  // Exercise methods
  const getExercise = (id: string): Exercise | undefined => {
    return exercises.find(ex => ex.id === id);
  };

  const addExercise = async (exerciseData: Omit<Exercise, 'id'>): Promise<Exercise> => {
    const newExercise: Exercise = {
      ...exerciseData,
      id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const updatedExercises = [...exercises, newExercise];
    setExercises(updatedExercises);
    await AsyncStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(updatedExercises));

    // Try to sync with Supabase if authenticated
    if (isAuthenticated) {
      try {
        await supabase.from('exercises').insert([newExercise]);
      } catch (error) {
        console.error('Failed to sync exercise with Supabase:', error);
      }
    }

    return newExercise;
  };

  const updateExercise = async (id: string, updates: Partial<Exercise>): Promise<void> => {
    const updatedExercises = exercises.map(ex => 
      ex.id === id ? { ...ex, ...updates } : ex
    );
    setExercises(updatedExercises);
    await AsyncStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(updatedExercises));

    // Try to sync with Supabase if authenticated
    if (isAuthenticated) {
      try {
        await supabase.from('exercises').update(updates).eq('id', id);
      } catch (error) {
        console.error('Failed to sync exercise update with Supabase:', error);
      }
    }
  };

  // Workout methods
  const addWorkout = async (workoutData: Omit<Workout, 'id' | 'createdAt' | 'userId'>): Promise<Workout> => {
    const newWorkout: Workout = {
      ...workoutData,
      id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      userId: authUser?.id || 'local_user',
    };

    const updatedWorkouts = [...workouts, newWorkout];
    setWorkouts(updatedWorkouts);
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(updatedWorkouts));

    // Try to sync with Supabase if authenticated
    if (isAuthenticated) {
      try {
        await supabase.from('workouts').insert([{
          ...newWorkout,
          user_id: authUser?.id,
        }]);
      } catch (error) {
        console.error('Failed to sync workout with Supabase:', error);
      }
    }

    return newWorkout;
  };

  const updateWorkout = async (id: string, updates: Partial<Workout>): Promise<void> => {
    const updatedWorkouts = workouts.map(w => 
      w.id === id ? { ...w, ...updates } : w
    );
    setWorkouts(updatedWorkouts);
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(updatedWorkouts));

    // Try to sync with Supabase if authenticated
    if (isAuthenticated) {
      try {
        await supabase.from('workouts').update(updates).eq('id', id);
      } catch (error) {
        console.error('Failed to sync workout update with Supabase:', error);
      }
    }
  };

  const deleteWorkout = async (id: string): Promise<void> => {
    const updatedWorkouts = workouts.filter(w => w.id !== id);
    setWorkouts(updatedWorkouts);
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(updatedWorkouts));

    // Try to sync with Supabase if authenticated
    if (isAuthenticated) {
      try {
        await supabase.from('workouts').delete().eq('id', id);
      } catch (error) {
        console.error('Failed to sync workout deletion with Supabase:', error);
      }
    }
  };

  // Template methods
  const addTemplate = async (templateData: Omit<WorkoutTemplate, 'id' | 'createdAt'>): Promise<WorkoutTemplate> => {
    const newTemplate: WorkoutTemplate = {
      ...templateData,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updatedTemplates));

    // Try to sync with Supabase if authenticated
    if (isAuthenticated) {
      try {
        await supabase.from('workout_templates').insert([newTemplate]);
      } catch (error) {
        console.error('Failed to sync template with Supabase:', error);
      }
    }

    return newTemplate;
  };

  const updateTemplate = async (id: string, updates: Partial<WorkoutTemplate>): Promise<void> => {
    const updatedTemplates = templates.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    setTemplates(updatedTemplates);
    await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updatedTemplates));

    // Try to sync with Supabase if authenticated
    if (isAuthenticated) {
      try {
        await supabase.from('workout_templates').update(updates).eq('id', id);
      } catch (error) {
        console.error('Failed to sync template update with Supabase:', error);
      }
    }
  };

  const deleteTemplate = async (id: string): Promise<void> => {
    const updatedTemplates = templates.filter(t => t.id !== id);
    setTemplates(updatedTemplates);
    await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updatedTemplates));

    // Try to sync with Supabase if authenticated
    if (isAuthenticated) {
      try {
        await supabase.from('workout_templates').delete().eq('id', id);
      } catch (error) {
        console.error('Failed to sync template deletion with Supabase:', error);
      }
    }
  };

  // Progress methods
  const addProgressEntry = async (entryData: Omit<ProgressEntry, 'id' | 'userId'>): Promise<ProgressEntry> => {
    const newEntry: ProgressEntry = {
      ...entryData,
      id: `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: authUser?.id || 'local_user',
    };

    const updatedProgress = [...progressEntries, newEntry];
    setProgressEntries(updatedProgress);
    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(updatedProgress));

    // Try to sync with Supabase if authenticated
    if (isAuthenticated) {
      try {
        await supabase.from('progress_entries').insert([{
          ...newEntry,
          user_id: authUser?.id,
        }]);
      } catch (error) {
        console.error('Failed to sync progress with Supabase:', error);
      }
    }

    return newEntry;
  };

  const getExerciseProgress = (exerciseId: string): ProgressEntry[] => {
    return progressEntries
      .filter(entry => entry.exerciseId === exerciseId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Analytics
  const getWorkoutStats = () => {
    const totalWorkouts = workouts.length;
    const totalVolume = progressEntries.reduce((sum, entry) => sum + entry.volume, 0);
    const averageDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / totalWorkouts || 0;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const workoutsThisWeek = workouts.filter(w => 
      new Date(w.createdAt) >= oneWeekAgo
    ).length;

    return {
      totalWorkouts,
      totalVolume,
      averageDuration,
      workoutsThisWeek,
    };
  };

  const value: DataContextType = {
    exercises,
    getExercise,
    addExercise,
    updateExercise,
    workouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    progressEntries,
    addProgressEntry,
    getExerciseProgress,
    getWorkoutStats,
    isLoading,
    error,
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
