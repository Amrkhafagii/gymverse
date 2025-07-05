import { supabase } from './index';
import type { Database } from './types';

type Achievement = Database['public']['Tables']['achievements']['Row'];
type AchievementInsert = Database['public']['Tables']['achievements']['Insert'];

export const getAchievements = async (userId: string) => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });
  
  return { data, error };
};

export const unlockAchievement = async (achievement: AchievementInsert) => {
  const { data, error } = await supabase
    .from('achievements')
    .insert(achievement)
    .select()
    .single();
  
  return { data, error };
};

export const checkAchievementExists = async (userId: string, title: string) => {
  const { data, error } = await supabase
    .from('achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('title', title)
    .single();
  
  return { data, error };
};
