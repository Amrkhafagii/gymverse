import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDeviceAuth } from './DeviceAuthContext';

export interface WorkoutSet {
  id: string;
  set_number: number;
  target_reps: number;
  actual_reps?: number;
  target_weight_kg?: number;
  actual_weight_kg?: number;
  target_duration_seconds?: number;
  actual_duration_seconds?: number;
  is_completed: boolean;
  is_warmup?: boolean;
  notes?: string;
  completed_at?: string;
  rest_started_at?: string;
  rest_duration_seconds?: number;
}

export interface WorkoutExercise {
  id: string;
  exercise_id: string;
  exercise_name: string;
  exercise_type: 'strength' | 'cardio' | 'flexibility' | 'plyometric';
  muscle_groups: string[];
  equipment: string[];
  order_index: number;
  target_sets: number;
  target_reps: number[];
  target_weight_kg?: number;
  target_duration_seconds?: number;
  rest_seconds: number;
  notes?: string;
  sets: WorkoutSet[];
  started_at?: string;
  completed_at?: string;
}

export interface WorkoutSession {
  id: string;
  workout_name: string;
  workout_template_id?: string;
  started_at: string;
  completed_at?: string;
  is_active: boolean;
  is_paused: boolean;
  total_duration_seconds: number;
  total_rest_seconds: number;
  exercises: WorkoutExercise[];
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface WorkoutSessionState {
  currentSession: WorkoutSession | null;
  isLoading: boolean;
  error: string | null;
  activeRestTimer: {
    exerciseId: string;
    setId: string;
    startTime: number;
    duration: number;
  } | null;
}

type WorkoutSessionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SESSION'; payload: WorkoutSession | null }
  | { type: 'UPDATE_SESSION'; payload: Partial<WorkoutSession> }
  | { type: 'UPDATE_SET'; payload: { exerciseId: string; setId: string; updates: Partial<WorkoutSet> } }
  | { type: 'START_REST_TIMER'; payload: { exerciseId: string; setId: string; duration: number } }
  | { type: 'STOP_REST_TIMER' }
  | { type: 'UPDATE_EXERCISE'; payload: { exerciseId: string; updates: Partial<WorkoutExercise> } };

const initialState: WorkoutSessionState = {
  currentSession: null,
  isLoading: false,
  error: null,
  activeRestTimer: null,
};

function workoutSessionReducer(state: WorkoutSessionState, action: WorkoutSessionAction): WorkoutSessionState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_SESSION':
      return { ...state, currentSession: action.payload };
    
    case 'UPDATE_SESSION':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          ...action.payload,
          updated_at: new Date().toISOString(),
        },
      };
    
    case 'UPDATE_SET':
      if (!state.currentSession) return state;
      const { exerciseId, setId, updates } = action.payload;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          exercises: state.currentSession.exercises.map(exercise =>
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
        },
      };
    
    case 'UPDATE_EXERCISE':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          exercises: state.currentSession.exercises.map(exercise =>
            exercise.id === action.payload.exerciseId
              ? { ...exercise, ...action.payload.updates }
              : exercise
          ),
          updated_at: new Date().toISOString(),
        },
      };
    
    case 'START_REST_TIMER':
      return {
        ...state,
        activeRestTimer: {
          exerciseId: action.payload.exerciseId,
          setId: action.payload.setId,
          startTime: Date.now(),
          duration: action.payload.duration,
        },
      };
    
    case 'STOP_REST_TIMER':
      return {
        ...state,
        activeRestTimer: null,
      };
    
    default:
      return state;
  }
}

interface WorkoutSessionContextType extends WorkoutSessionState {
  startWorkoutSession: (workoutName: string, exercises: Omit<WorkoutExercise, 'id' | 'sets'>[]) => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  completeSession: () => Promise<void>;
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => Promise<void>;
  updateExercise: (exerciseId: string, updates: Partial<WorkoutExercise>) => Promise<void>;
  startRestTimer: (exerciseId: string, setId: string, duration: number) => void;
  stopRestTimer: () => void;
  loadActiveSession: () => Promise<void>;
  deleteSession: () => Promise<void>;
}

const WorkoutSessionContext = createContext<WorkoutSessionContextType | undefined>(undefined);

const STORAGE_KEY = 'workout_session_current';

export function WorkoutSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(workoutSessionReducer, initialState);
  const { user } = useDeviceAuth();

  // Load active session on mount
  useEffect(() => {
    loadActiveSession();
  }, []);

  // Auto-save session changes
  useEffect(() => {
    if (state.currentSession) {
      saveSessionToStorage(state.currentSession);
    }
  }, [state.currentSession]);

  const saveSessionToStorage = async (session: WorkoutSession) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving workout session:', error);
    }
  };

  const loadActiveSession = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const sessionData = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (sessionData) {
        const session: WorkoutSession = JSON.parse(sessionData);
        // Only load if session is still active and belongs to current user
        if (session.is_active && session.user_id === user?.id) {
          dispatch({ type: 'SET_SESSION', payload: session });
        } else {
          // Clear inactive session
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading workout session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load workout session' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const generateSetId = () => `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const generateExerciseId = () => `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const startWorkoutSession = async (
    workoutName: string,
    exercises: Omit<WorkoutExercise, 'id' | 'sets'>[]
  ) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const sessionExercises: WorkoutExercise[] = exercises.map((exercise, index) => ({
        ...exercise,
        id: generateExerciseId(),
        order_index: index,
        sets: Array.from({ length: exercise.target_sets }, (_, setIndex) => ({
          id: generateSetId(),
          set_number: setIndex + 1,
          target_reps: exercise.target_reps[setIndex] || exercise.target_reps[0],
          target_weight_kg: exercise.target_weight_kg,
          target_duration_seconds: exercise.target_duration_seconds,
          is_completed: false,
          is_warmup: setIndex === 0 && exercise.target_sets > 1, // First set is warmup if multiple sets
        })),
      }));

      const newSession: WorkoutSession = {
        id: sessionId,
        workout_name: workoutName,
        started_at: now,
        is_active: true,
        is_paused: false,
        total_duration_seconds: 0,
        total_rest_seconds: 0,
        exercises: sessionExercises,
        user_id: user.id,
        created_at: now,
        updated_at: now,
      };

      dispatch({ type: 'SET_SESSION', payload: newSession });
    } catch (error) {
      console.error('Error starting workout session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start workout session' });
    }
  };

  const pauseSession = async () => {
    if (!state.currentSession) return;
    
    dispatch({
      type: 'UPDATE_SESSION',
      payload: { is_paused: true },
    });
  };

  const resumeSession = async () => {
    if (!state.currentSession) return;
    
    dispatch({
      type: 'UPDATE_SESSION',
      payload: { is_paused: false },
    });
  };

  const completeSession = async () => {
    if (!state.currentSession) return;

    try {
      const completedSession = {
        ...state.currentSession,
        is_active: false,
        is_paused: false,
        completed_at: new Date().toISOString(),
      };

      // Save to workout history
      const historyKey = 'workout_history';
      const existingHistory = await AsyncStorage.getItem(historyKey);
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.unshift(completedSession);
      
      // Keep only last 100 workouts in local storage
      if (history.length > 100) {
        history.splice(100);
      }
      
      await AsyncStorage.setItem(historyKey, JSON.stringify(history));
      
      // Clear current session
      await AsyncStorage.removeItem(STORAGE_KEY);
      dispatch({ type: 'SET_SESSION', payload: null });
    } catch (error) {
      console.error('Error completing workout session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to complete workout session' });
    }
  };

  const updateSet = async (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => {
    dispatch({
      type: 'UPDATE_SET',
      payload: { exerciseId, setId, updates },
    });
  };

  const updateExercise = async (exerciseId: string, updates: Partial<WorkoutExercise>) => {
    dispatch({
      type: 'UPDATE_EXERCISE',
      payload: { exerciseId, updates },
    });
  };

  const startRestTimer = (exerciseId: string, setId: string, duration: number) => {
    dispatch({
      type: 'START_REST_TIMER',
      payload: { exerciseId, setId, duration },
    });
  };

  const stopRestTimer = () => {
    dispatch({ type: 'STOP_REST_TIMER' });
  };

  const deleteSession = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      dispatch({ type: 'SET_SESSION', payload: null });
    } catch (error) {
      console.error('Error deleting workout session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete workout session' });
    }
  };

  const contextValue: WorkoutSessionContextType = {
    ...state,
    startWorkoutSession,
    pauseSession,
    resumeSession,
    completeSession,
    updateSet,
    updateExercise,
    startRestTimer,
    stopRestTimer,
    loadActiveSession,
    deleteSession,
  };

  return (
    <WorkoutSessionContext.Provider value={contextValue}>
      {children}
    </WorkoutSessionContext.Provider>
  );
}

export function useWorkoutSession() {
  const context = useContext(WorkoutSessionContext);
  if (context === undefined) {
    throw new Error('useWorkoutSession must be used within a WorkoutSessionProvider');
  }
  return context;
}
