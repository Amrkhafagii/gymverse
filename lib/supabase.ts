import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cfltlvkiglukppjqoxwn.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmbHRsdmtpZ2x1a3BwanFveHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDYzNjAsImV4cCI6MjA2NjY4MjM2MH0.VTMaE1R-KuqKTzqQWnjIvaiWM5vK-Y7VTnYT9wXc7o8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
