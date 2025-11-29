import { supabase } from './client';
import { handleSupabaseError } from './errors';

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error: handleSupabaseError(error, 'auth_sign_in') };
};

export const signUp = async (
  email: string,
  password: string,
  username: string,
  fullName?: string
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName,
      },
    },
  });
  return { data, error: handleSupabaseError(error, 'auth_sign_up') };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error: handleSupabaseError(error, 'auth_sign_out') };
};
