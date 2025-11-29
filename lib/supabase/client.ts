import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/react-native';
import { Database } from '@/types/supabase';
import { getRequiredEnv } from '../env';
import { secureStoreAdapter } from './storage';

const supabaseUrl = getRequiredEnv('EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getRequiredEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');

const tracedFetch: typeof fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : (input as Request).url;
  Sentry.addBreadcrumb({
    category: 'supabase',
    message: url,
    level: 'info',
    data: { method: init?.method || 'GET' },
  });

  try {
    return await fetch(input as any, init as any);
  } catch (err) {
    Sentry.captureException(err, {
      tags: { service: 'supabase' },
      extra: { url, method: init?.method || 'GET' },
    });
    throw err;
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: secureStoreAdapter,
  },
  global: {
    fetch: tracedFetch,
  },
});
