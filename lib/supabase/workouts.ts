import { Database } from '@/types/supabase';
import { supabase } from './client';
import { handleSupabaseError } from './errors';

export type Exercise = Database['public']['Tables']['exercises']['Row'];
export type Workout = Database['public']['Tables']['workouts']['Row'];
export type WorkoutInsert = Database['public']['Tables']['workouts']['Insert'];
export type WorkoutExercise = Database['public']['Tables']['workout_exercises']['Row'];
export type WorkoutExerciseInsert = Database['public']['Tables']['workout_exercises']['Insert'];
export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row'];
export type WorkoutSessionInsert = Database['public']['Tables']['workout_sessions']['Insert'];

export const getExercises = async (): Promise<Exercise[]> => {
  const { data, error } = await supabase.from('exercises').select('*').order('name');

  if (error) {
    handleSupabaseError(error, 'get_exercises');
    return [];
  }

  return data || [];
};

export const getWorkoutTemplates = async (): Promise<Workout[]> => {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('is_template', true)
    .eq('is_public', true)
    .order('name');

  if (error) {
    handleSupabaseError(error, 'get_workout_templates');
    return [];
  }

  return data || [];
};

export const getUserWorkouts = async (userId: string): Promise<Workout[]> => {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError(error, 'get_user_workouts');
    return [];
  }

  return data || [];
};

export const createWorkout = async (workout: WorkoutInsert) => {
  const { data, error } = await supabase.from('workouts').insert(workout).select().single();

  return { data, error: handleSupabaseError(error, 'create_workout') };
};

export const createWorkoutExercise = async (workoutExercise: WorkoutExerciseInsert) => {
  const { data, error } = await supabase
    .from('workout_exercises')
    .insert(workoutExercise)
    .select()
    .single();

  return { data, error: handleSupabaseError(error, 'create_workout_exercise') };
};

export const createWorkoutSession = async (session: WorkoutSessionInsert) => {
  const { data, error } = await supabase.from('workout_sessions').insert(session).select().single();

  return { data, error: handleSupabaseError(error, 'create_workout_session') };
};

export const completeWorkoutSession = async (
  sessionId: number,
  duration: number,
  calories?: number,
  rating?: number
) => {
  const { data, error } = await supabase
    .from('workout_sessions')
    .update({
      completed_at: new Date().toISOString(),
      duration_minutes: duration,
      calories_burned: calories,
      rating,
    })
    .eq('id', sessionId)
    .select()
    .single();

  return { data, error: handleSupabaseError(error, 'complete_workout_session') };
};
