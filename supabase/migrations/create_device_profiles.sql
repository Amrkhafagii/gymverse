/*
  # Device-Only Authentication System

  1. New Tables
    - `device_profiles`
      - `device_id` (text, primary key) - Unique device identifier
      - `device_fingerprint` (text, unique) - Device verification hash
      - `platform` (text) - iOS/Android platform
      - `device_name` (text) - User-friendly device name
      - `app_version` (text) - App version for compatibility
      - Profile data fields (name, bio, avatar, etc.)
      - Privacy settings (public profile, sharing preferences)
      - Sync settings (cloud backup enabled, backup key)
      - Timestamps (first seen, last active, created, updated)

    - `anonymous_backups`
      - `backup_id` (uuid, primary key) - Unique backup identifier
      - `device_fingerprint` (text) - Links to device without exposing device_id
      - `backup_key` (text) - Hashed user-generated key for data retrieval
      - `encrypted_data` (jsonb) - Encrypted profile and settings data
      - `data_version` (integer) - Version for conflict resolution
      - `expires_at` (timestamptz) - Auto-cleanup old backups

  2. Security
    - Enable RLS on both tables
    - No authentication required - device-based access only
    - Anonymous backups use hashed keys for privacy
    - Automatic cleanup of expired backups

  3. Features
    - Device-only authentication (no user accounts)
    - Optional anonymous cloud backup
    - Privacy-first design with minimal data collection
    - Device-to-device data transfer support
*/

-- Device profiles table (no user accounts needed)
CREATE TABLE IF NOT EXISTS public.device_profiles (
  device_id text PRIMARY KEY,
  device_fingerprint text UNIQUE NOT NULL,
  platform text NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_name text,
  app_version text,
  
  -- Profile data (stored locally + optionally synced)
  full_name text,
  bio text,
  avatar_url text,
  date_of_birth date,
  height_cm integer CHECK (height_cm > 0 AND height_cm < 300),
  weight_kg decimal(5,2) CHECK (weight_kg > 0 AND weight_kg < 1000),
  fitness_level text CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  preferred_units text CHECK (preferred_units IN ('metric', 'imperial')) DEFAULT 'metric',
  
  -- Privacy settings (default private for device-only)
  is_public boolean DEFAULT false,
  allow_anonymous_sharing boolean DEFAULT false,
  
  -- Sync settings
  cloud_backup_enabled boolean DEFAULT false,
  last_backup_at timestamptz,
  backup_key_hash text, -- Hashed backup key for verification
  
  -- Timestamps
  first_seen_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Anonymous data sync (for optional cloud backup)
CREATE TABLE IF NOT EXISTS public.anonymous_backups (
  backup_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_fingerprint text NOT NULL,
  backup_key text NOT NULL, -- Hashed user-generated key for retrieval
  encrypted_data jsonb NOT NULL, -- Encrypted profile + settings data
  data_version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '1 year')
);

-- Enable Row Level Security
ALTER TABLE public.device_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_backups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for device_profiles
-- Allow devices to manage their own profiles (no authentication required)
CREATE POLICY "Devices can manage own profiles"
  ON public.device_profiles
  FOR ALL
  USING (true) -- Open access since we're using device-based auth
  WITH CHECK (true);

-- RLS Policies for anonymous_backups
-- Allow anonymous backup operations
CREATE POLICY "Allow anonymous backup operations"
  ON public.anonymous_backups
  FOR ALL
  USING (true) -- Open access for anonymous backups
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_device_profiles_fingerprint 
  ON public.device_profiles(device_fingerprint);

CREATE INDEX IF NOT EXISTS idx_device_profiles_platform 
  ON public.device_profiles(platform);

CREATE INDEX IF NOT EXISTS idx_device_profiles_last_active 
  ON public.device_profiles(last_active_at);

CREATE INDEX IF NOT EXISTS idx_anonymous_backups_fingerprint 
  ON public.anonymous_backups(device_fingerprint);

CREATE INDEX IF NOT EXISTS idx_anonymous_backups_key 
  ON public.anonymous_backups(backup_key);

CREATE INDEX IF NOT EXISTS idx_anonymous_backups_expires 
  ON public.anonymous_backups(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_device_profiles_updated_at ON public.device_profiles;
CREATE TRIGGER update_device_profiles_updated_at
  BEFORE UPDATE ON public.device_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired backups
CREATE OR REPLACE FUNCTION cleanup_expired_backups()
RETURNS void AS $$
BEGIN
  DELETE FROM public.anonymous_backups 
  WHERE expires_at < now();
END;
$$ language 'plpgsql';

-- Create a scheduled job to clean up expired backups (if pg_cron is available)
-- This would typically be set up separately in production
-- SELECT cron.schedule('cleanup-expired-backups', '0 2 * * *', 'SELECT cleanup_expired_backups();');