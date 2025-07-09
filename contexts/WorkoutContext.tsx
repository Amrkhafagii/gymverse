import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDeviceAuth } from './DeviceAuthContext';

export interface Exercise {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'plyometric';
  muscle_groups: string[];
  equipment: string[];
  instructions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  image_url?: string;
}

export interface WorkoutSet {
  id: string;
  exercise_id: string;
  set_number: number;
  target_reps?: number;
  actual_reps?: number;
  target_weight_kg?: number;
  actual_weight_kg?: number;
  target_duration_seconds?: number;
  actual_duration_seconds?: number;
  rest_seconds?: number;
  notes?: string;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
  order: number;
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  created_at: string;
  updated_at: string;
  is_template: boolean;
  user_id: string;
  duration_minutes?: number;
  calories_burned?: number;
  notes?: string;
}

interface WorkoutState {
  workouts: Workout[];
  exercises: Exercise[];
  currentWorkout: Workout | null;
  isLoading: boolean;
  error: string | null;
}

type WorkoutAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WORKOUTS'; payload: Workout[] }
  | { type: 'SET_EXERCISES'; payload: Exercise[] }
  | { type: 'SET_CURRENT_WORKOUT'; payload: Workout | null }
  | { type: 'ADD_WORKOUT'; payload: Workout }
  | { type: 'UPDATE_WORKOUT'; payload: Workout }
  | { type: 'DELETE_WORKOUT'; payload: string }
  | { type: 'UPDATE_SET'; payload: { workoutId: string; exerciseId: string; setId: string; updates: Partial<WorkoutSet> } };

const initialState: WorkoutState = {
  workouts: [],
  exercises: [],
  currentWorkout: null,
  isLoading: false,
  error: null,
};

function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_WORKOUTS':
      return { ...state, workouts: action.payload };
    
    case 'SET_EXERCISES':
      return { ...state, exercises: action.payload };
    
    case 'SET_CURRENT_WORKOUT':
      return { ...state, currentWorkout: action.payload };
    
    case 'ADD_WORKOUT':
      return { ...state, workouts: [action.payload, ...state.workouts] };
    
    case 'UPDATE_WORKOUT':
      return {
        ...state,
        workouts: state.workouts.map(w => 
          w.id === action.payload.id ? action.payload : w
        ),
        currentWorkout: state.currentWorkout?.id === action.payload.id ? action.payload : state.currentWorkout,
      };
    
    case 'DELETE_WORKOUT':
      return {
        ...state,
        workouts: state.workouts.filter(w => w.id !== action.payload),
        currentWorkout: state.currentWorkout?.id === action.payload ? null : state.currentWorkout,
      };
    
    case 'UPDATE_SET':
      const { workoutId, exerciseId, setId, updates } = action.payload;
      const updateWorkoutSets = (workout: Workout) => ({
        ...workout,
        exercises: workout.exercises.map(exercise =>
          exercise.id === exerciseId
            ? {
                ...exercise,
                sets: exercise.sets.map(set =>
                  set.id === setId ? { ...set, ...updates } : set
                ),
              }
            : exercise
        ),
        updated_at: new Date().toISOString(),
      });

      return {
        ...state,
        workouts: state.workouts.map(w => 
          w.id === workoutId ? updateWorkoutSets(w) : w
        ),
        currentWorkout: state.currentWorkout?.id === workoutId 
          ? updateWorkoutSets(state.currentWorkout) 
          : state.currentWorkout,
      };
    
    default:
      return state;
  }
}

interface WorkoutContextType extends WorkoutState {
  loadWorkouts: () => Promise<void>;
  loadExercises: () => Promise<void>;
  createWorkout: (workout: Omit<Workout, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<Workout>;
  updateWorkout: (workout: Workout) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  setCurrentWorkout: (workout: Workout | null) => void;
  updateSet: (workoutId: string, exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => Promise<void>;
  duplicateWorkout: (workoutId: string) => Promise<Workout>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WORKOUTS: 'workouts',
  EXERCISES: 'exercises',
};

// Mock exercise data
const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Bench Press',
    type: 'strength',
    muscle_groups: ['chest', 'triceps', 'shoulders'],
    equipment: ['barbell', 'bench'],
    instructions: ['Lie on bench', 'Lower bar to chest', 'Press up'],
    difficulty: 'intermediate',
    image_url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
  },
  {
    id: '2',
    name: 'Squat',
    type: 'strength',
    muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: ['barbell'],
    instructions: ['Stand with feet shoulder-width apart', 'Lower into squat', 'Stand back up'],
    difficulty: 'beginner',
    image_url: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg',
  },
  {
    id: '3',
    name: 'Deadlift',
    type: 'strength',
    muscle_groups: ['hamstrings', 'glutes', 'back'],
    equipment: ['barbell'],
    instructions: ['Stand over bar', 'Grip bar', 'Lift with legs and back'],
    difficulty: 'advanced',
    image_url: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg',
  },
  {
    id: '4',
    name: 'Running',
    type: 'cardio',
    muscle_groups: ['legs', 'cardiovascular'],
    equipment: [],
    instructions: ['Start at comfortable pace', 'Maintain steady rhythm', 'Cool down gradually'],
    difficulty: 'beginner',
    image_url: 'https://images.pexels.com/photos/1200000/pexels-photo-1200000.jpeg',
  },
  {
    id: '5',
    name: 'Push-ups',
    type: 'strength',
    muscle_groups: ['chest', 'triceps', 'shoulders'],
    equipment: [],
    instructions: ['Start in plank position', 'Lower chest to ground', 'Push back up'],
    difficulty: 'beginner',
    image_url: 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg',
  },
];

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(workoutReducer, initialState);
  const { user } = useDeviceAuth();

  useEffect(() => {
    if (user) {
      loadWorkouts();
      loadExercises();
    }
  }, [user]);

  const loadWorkouts = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS);
      const workouts = stored ? JSON.parse(stored) : [];
      dispatch({ type: 'SET_WORKOUTS', payload: workouts });
    } catch (error) {
      console.error('Error loading workouts:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load workouts' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadExercises = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.EXERCISES);
      const exercises = stored ? JSON.parse(stored) : mockExercises;
      
      // If no stored exercises, save mock data
      if (!stored) {
        await AsyncStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(mockExercises));
      }
      
      dispatch({ type: 'SET_EXERCISES', payload: exercises });
    } catch (error) {
      console.error('Error loading exercises:', error);
      dispatch({ type: 'SET_EXERCISES', payload: mockExercises });
    }
  };

  const saveWorkouts = async (workouts: Workout[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    } catch (error) {
      console.error('Error saving workouts:', error);
    }
  };

  const createWorkout = async (workoutData: Omit<Workout, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Workout> => {
    if (!user) throw new Error('User not authenticated');

    const workout: Workout = {
      ...workoutData,
      id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user.id,
    };

    dispatch({ type: 'ADD_WORKOUT', payload: workout });
    await saveWorkouts([workout, ...state.workouts]);
    
    return workout;
  };

  const updateWorkout = async (workout: Workout) => {
    const updatedWorkout = {
      ...workout,
      updated_at: new Date().toISOString(),
    };

    dispatch({ type: 'UPDATE_WORKOUT', payload: updatedWorkout });
    
    const updatedWorkouts = state.workouts.map(w => 
      w.id === workout.id ? updatedWorkout : w
    );
    await saveWorkouts(updatedWorkouts);
  };

  const deleteWorkout = async (workoutId: string) => {
    dispatch({ type: 'DELETE_WORKOUT', payload: workoutId });
    
    const filteredWorkouts = state.workouts.filter(w => w.id !== workoutId);
    await saveWorkouts(filteredWorkouts);
  };

  const setCurrentWorkout = (workout: Workout | null) => {
    dispatch({ type: 'SET_CURRENT_WORKOUT', payload: workout });
  };

  const updateSet = async (workoutId: string, exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => {
    dispatch({
      type: 'UPDATE_SET',
      payload: { workoutId, exerciseId, setId, updates },
    });

    // Save updated workouts
    const updatedWorkouts = state.workouts.map(workout => {
      if (workout.id !== workoutId) return workout;
      
      return {
        ...workout,
        exercises: workout.exercises.map(exercise =>
          exercise.id === exerciseId
            ? {
                ...exercise,
                sets: exercise.sets.map(set =>
                  set.id === setId ? { ...set, ...updates } : set
                ),
              }
            : exercise
        ),
        updated_at: new Date().toISOString(),
      };
    });

    await saveWorkouts(updatedWorkouts);
  };

  const duplicateWorkout = async (workoutId: string): Promise<Workout> => {
    const originalWorkout = state.workouts.find(w => w.id === workoutId);
    if (!originalWorkout) throw new Error('Workout not found');

    const duplicatedWorkout = await createWorkout({
      ...originalWorkout,
      name: `${originalWorkout.name} (Copy)`,
      exercises: originalWorkout.exercises.map(exercise => ({
        ...exercise,
        id: `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sets: exercise.sets.map(set => ({
          ...set,
          id: `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          completed: false,
          actual_reps: undefined,
          actual_weight_kg: undefined,
          actual_duration_seconds: undefined,
        })),
      })),
    });

    return duplicatedWorkout;
  };

  const contextValue: WorkoutContextType = {
    ...state,
    loadWorkouts,
    loadExercises,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    setCurrentWorkout,
    updateSet,
    duplicateWorkout,
  };

  return (
    <WorkoutContext.Provider value={contextValue}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
