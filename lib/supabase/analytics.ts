import { Database } from '@/types/supabase';
import { supabase } from './client';
import { handleSupabaseError } from './errors';

export type PersonalRecord = Database['public']['Tables']['personal_records']['Row'];
export type WorkoutStreak = Database['public']['Tables']['workout_streaks']['Row'];
export type ExerciseSet = Database['public']['Tables']['exercise_sets']['Row'];

export const getUserPersonalRecords = async (userId: string): Promise<PersonalRecord[]> => {
  const { data, error } = await supabase
    .from('personal_records')
    .select(
      `
      *,
      exercise:exercises(name, muscle_groups)
    `
    )
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false });

  if (error) {
    handleSupabaseError(error, 'get_personal_records');
    return [];
  }

  return data || [];
};

export const getUserStreak = async (userId: string): Promise<WorkoutStreak | null> => {
  const { data, error } = await supabase
    .from('workout_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    handleSupabaseError(error, 'get_user_streak');
    return null;
  }

  return data;
};

export const getWorkoutAnalytics = async (
  userId: string,
  startDate?: string,
  endDate?: string
) => {
  let query = supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .not('completed_at', 'is', null);

  if (startDate) {
    query = query.gte('started_at', startDate);
  }

  if (endDate) {
    query = query.lte('started_at', endDate);
  }

  const { data, error } = await query.order('started_at', { ascending: false });

  if (error) {
    handleSupabaseError(error, 'get_workout_analytics');
    return [];
  }

  return data || [];
};

export const getExerciseProgress = async (userId: string, exerciseId: number) => {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select(
      `
      *,
      session_exercise:session_exercises(
        session:workout_sessions(started_at, user_id)
      )
    `
    )
    .eq('session_exercise.session.user_id', userId)
    .eq('session_exercise.exercise_id', exerciseId)
    .eq('completed', true)
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError(error, 'get_exercise_progress');
    return [];
  }

  return data || [];
};
