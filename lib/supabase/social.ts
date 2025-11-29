import { Database } from '@/types/supabase';
import { supabase } from './client';
import { handleSupabaseError } from './errors';

export type SocialPost = Database['public']['Tables']['social_posts']['Row'];
export type SocialPostInsert = Database['public']['Tables']['social_posts']['Insert'];

export const createSocialPost = async (post: SocialPostInsert) => {
  const { data, error } = await supabase.from('social_posts').insert(post).select().single();

  return { data, error: handleSupabaseError(error, 'create_social_post') };
};
