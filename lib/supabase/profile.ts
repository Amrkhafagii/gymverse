import { Database } from '@/types/supabase';
import { supabase } from './client';
import { handleSupabaseError } from './errors';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

  if (error) {
    if ((error as any)?.code === 'PGRST116') {
      return null;
    }
    handleSupabaseError(error, 'get_profile');
    return null;
  }

  return data;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error: handleSupabaseError(error, 'update_profile') };
};
