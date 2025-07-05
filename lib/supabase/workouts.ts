import { supabase } from './index';
import type { Database } from './types';

type Workout = Database['public']['Tables']['workouts']['Row'];
type WorkoutInsert = Database['public']['Tables']['workouts']['Insert'];
type WorkoutUpdate = Database['public']['Tables']['workouts']['Update'];

export const getWorkouts = async (userId: string) => {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const createWorkout = async (workout: WorkoutInsert) => {
  const { data, error } = await supabase
    .from('workouts')
    .insert(workout)
    .select()
    .single();
  
  return { data, error };
};

export const updateWorkout = async (id: string, updates: WorkoutUpdate) => {
  const { data, error } = await supabase
    .from('workouts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

export const deleteWorkout = async (id: string) => {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', id);
  
  return { error };
};
