/*
  # Offline-First Sync Infrastructure

  1. New Tables
    - `sync_queue` - Manages pending sync operations with retry logic
    - `conflict_resolution` - Tracks and resolves data conflicts
    - `entity_versions` - Version tracking for conflict detection
    - `sync_status` - Real-time sync status monitoring
    - `media_cache` - Media file caching metadata
    - `offline_sessions` - Offline workout session tracking

  2. Security
    - Enable RLS on all sync tables
    - Add policies for authenticated users to manage their sync data
    - Ensure data isolation between users

  3. Indexes
    - Optimized indexes for sync operations
    - Performance indexes for conflict resolution
    - Media cache lookup optimization
*/

-- Sync Queue Table
CREATE TABLE IF NOT EXISTS sync_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  operation_type text NOT NULL CHECK (operation_type IN ('create', 'update', 'delete')),
  priority integer NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3), -- 1=high, 2=medium, 3=low
  data jsonb NOT NULL,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  next_retry_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Entity Versions for Conflict Detection
CREATE TABLE IF NOT EXISTS entity_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  version_number integer NOT NULL DEFAULT 1,
  last_modified_at timestamptz DEFAULT now(),
  last_modified_by uuid REFERENCES auth.users(id),
  checksum text NOT NULL,
  data_snapshot jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

-- Conflict Resolution Tracking
CREATE TABLE IF NOT EXISTS conflict_resolution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  conflict_type text NOT NULL CHECK (conflict_type IN ('version_mismatch', 'concurrent_edit', 'delete_conflict')),
  local_version integer NOT NULL,
  remote_version integer NOT NULL,
  local_data jsonb NOT NULL,
  remote_data jsonb NOT NULL,
  resolution_strategy text CHECK (resolution_strategy IN ('last_write_wins', 'merge', 'user_prompt', 'manual')),
  resolved_data jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'escalated')),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Sync Status Monitoring
CREATE TABLE IF NOT EXISTS sync_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  total_operations integer DEFAULT 0,
  completed_operations integer DEFAULT 0,
  failed_operations integer DEFAULT 0,
  current_operation text,
  progress_percentage decimal(5,2) DEFAULT 0.00,
  status text DEFAULT 'idle' CHECK (status IN ('idle', 'syncing', 'completed', 'failed', 'paused')),
  started_at timestamptz,
  completed_at timestamptz,
  last_activity_at timestamptz DEFAULT now(),
  error_details jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Media Cache Metadata
CREATE TABLE IF NOT EXISTS media_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  local_path text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video', 'audio')),
  file_size bigint NOT NULL,
  cache_priority integer DEFAULT 2 CHECK (cache_priority BETWEEN 1 AND 3),
  access_count integer DEFAULT 0,
  last_accessed_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  checksum text NOT NULL,
  is_synced boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, media_url)
);

-- Offline Session Tracking
CREATE TABLE IF NOT EXISTS offline_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type text NOT NULL CHECK (session_type IN ('workout', 'measurement', 'progress_photo')),
  local_session_id text NOT NULL,
  session_data jsonb NOT NULL,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  is_synced boolean DEFAULT false,
  sync_attempts integer DEFAULT 0,
  last_sync_attempt_at timestamptz,
  sync_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, local_session_id)
);

-- Enable Row Level Security
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflict_resolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Sync Queue
CREATE POLICY "Users can manage their sync queue"
  ON sync_queue
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Entity Versions
CREATE POLICY "Users can manage their entity versions"
  ON entity_versions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Conflict Resolution
CREATE POLICY "Users can manage their conflicts"
  ON conflict_resolution
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Sync Status
CREATE POLICY "Users can manage their sync status"
  ON sync_status
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Media Cache
CREATE POLICY "Users can manage their media cache"
  ON media_cache
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Offline Sessions
CREATE POLICY "Users can manage their offline sessions"
  ON offline_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_sync_queue_user_priority ON sync_queue(user_id, priority, next_retry_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_entity_versions_lookup ON entity_versions(user_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_conflict_resolution_status ON conflict_resolution(user_id, status);
CREATE INDEX IF NOT EXISTS idx_sync_status_session ON sync_status(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_media_cache_access ON media_cache(user_id, last_accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_cache_priority ON media_cache(cache_priority, file_size DESC);
CREATE INDEX IF NOT EXISTS idx_offline_sessions_sync ON offline_sessions(user_id, is_synced, created_at);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_sync_queue_updated_at BEFORE UPDATE ON sync_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sync_status_updated_at BEFORE UPDATE ON sync_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_cache_updated_at BEFORE UPDATE ON media_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offline_sessions_updated_at BEFORE UPDATE ON offline_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
