/*
  # Challenge System Optimization

  1. New Tables
    - `challenge_categories` - Organize challenges by type
    - `challenge_participants` - Track challenge participation with detailed stats
    - `challenge_leaderboards` - Materialized view for challenge rankings
    - `challenge_notifications` - Challenge-related notifications

  2. Enhanced Tables
    - `challenges` - Add category, difficulty, and reward information
    - `user_challenges` - Enhanced participation tracking

  3. Performance Optimizations
    - Indexes for common challenge queries
    - Materialized views for leaderboards
    - Triggers for automatic progress updates

  4. Security
    - RLS policies for challenge data
    - Privacy controls for challenge participation
*/

-- Challenge Categories
CREATE TABLE IF NOT EXISTS challenge_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  color text DEFAULT '#3B82F6',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enhanced Challenges Table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'category_id') THEN
    ALTER TABLE challenges ADD COLUMN category_id uuid REFERENCES challenge_categories(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'difficulty') THEN
    ALTER TABLE challenges ADD COLUMN difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'extreme'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'reward_points') THEN
    ALTER TABLE challenges ADD COLUMN reward_points integer DEFAULT 50;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'max_participants') THEN
    ALTER TABLE challenges ADD COLUMN max_participants integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'is_featured') THEN
    ALTER TABLE challenges ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'metadata') THEN
    ALTER TABLE challenges ADD COLUMN metadata jsonb DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'privacy_level') THEN
    ALTER TABLE challenges ADD COLUMN privacy_level text DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends', 'private'));
  END IF;
END $$;

-- Challenge Participants (Enhanced)
CREATE TABLE IF NOT EXISTS challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  current_progress numeric DEFAULT 0,
  best_performance numeric DEFAULT 0,
  completion_percentage numeric(5,2) DEFAULT 0.00,
  rank_position integer,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  performance_data jsonb DEFAULT '{}',
  notifications_enabled boolean DEFAULT true,
  UNIQUE(challenge_id, user_id)
);

-- Challenge Notifications
CREATE TABLE IF NOT EXISTS challenge_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('invite', 'start', 'progress', 'completion', 'ranking', 'end')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Challenge Leaderboard View
CREATE MATERIALIZED VIEW IF NOT EXISTS challenge_leaderboards AS
SELECT 
  cp.challenge_id,
  cp.user_id,
  cp.current_progress,
  cp.best_performance,
  cp.completion_percentage,
  cp.is_completed,
  cp.completed_at,
  ROW_NUMBER() OVER (
    PARTITION BY cp.challenge_id 
    ORDER BY 
      cp.is_completed DESC,
      cp.best_performance DESC,
      cp.current_progress DESC,
      cp.joined_at ASC
  ) as rank_position,
  c.title as challenge_title,
  c.type as challenge_type,
  c.target_value,
  c.end_date,
  c.status as challenge_status
FROM challenge_participants cp
JOIN challenges c ON cp.challenge_id = c.id
WHERE c.status IN ('active', 'completed');

-- Create unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_challenge_leaderboards_unique 
ON challenge_leaderboards (challenge_id, user_id);

-- Enhanced User Challenges (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_challenges') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_challenges' AND column_name = 'performance_history') THEN
      ALTER TABLE user_challenges ADD COLUMN performance_history jsonb DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_challenges' AND column_name = 'streak_count') THEN
      ALTER TABLE user_challenges ADD COLUMN streak_count integer DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_challenges' AND column_name = 'last_activity') THEN
      ALTER TABLE user_challenges ADD COLUMN last_activity timestamptz DEFAULT now();
    END IF;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE challenge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Challenge Categories
CREATE POLICY "Anyone can read active challenge categories"
  ON challenge_categories
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- RLS Policies for Challenge Participants
CREATE POLICY "Users can read challenge participants for public challenges"
  ON challenge_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM challenges c 
      WHERE c.id = challenge_id 
      AND (c.privacy_level = 'public' OR c.created_by = auth.uid() OR challenge_participants.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert own challenge participation"
  ON challenge_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge participation"
  ON challenge_participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Challenge Notifications
CREATE POLICY "Users can read own challenge notifications"
  ON challenge_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge notifications"
  ON challenge_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_progress ON challenge_participants(challenge_id, current_progress DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_completion ON challenge_participants(challenge_id, is_completed, best_performance DESC);

CREATE INDEX IF NOT EXISTS idx_challenge_notifications_user_id ON challenge_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_notifications_unread ON challenge_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_challenge_notifications_created_at ON challenge_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_challenges_category_id ON challenges(category_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_featured ON challenges(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_challenges_end_date ON challenges(end_date);

-- Function to Calculate Challenge Progress
CREATE OR REPLACE FUNCTION calculate_challenge_progress(p_user_id uuid, p_challenge_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  progress_value numeric := 0;
  challenge_record record;
  start_date timestamptz;
  end_date timestamptz;
BEGIN
  -- Get challenge details
  SELECT * INTO challenge_record FROM challenges WHERE id = p_challenge_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  start_date := challenge_record.start_date;
  end_date := COALESCE(challenge_record.end_date, now());
  
  -- Calculate progress based on challenge type
  CASE challenge_record.type
    WHEN 'workout_count' THEN
      SELECT COUNT(*) INTO progress_value
      FROM workouts
      WHERE user_id = p_user_id 
        AND completed_at >= start_date 
        AND completed_at <= end_date
        AND completed_at IS NOT NULL;
        
    WHEN 'total_weight' THEN
      SELECT COALESCE(SUM(
        (sets.actual_weight_kg * sets.actual_reps)
      ), 0) INTO progress_value
      FROM workouts w
      JOIN workout_exercises we ON w.id = we.workout_id
      JOIN workout_sets sets ON we.id = sets.workout_exercise_id
      WHERE w.user_id = p_user_id 
        AND w.completed_at >= start_date 
        AND w.completed_at <= end_date
        AND sets.is_completed = true;
        
    WHEN 'streak_days' THEN
      -- Calculate streak within challenge period
      WITH daily_workouts AS (
        SELECT DATE(completed_at) as workout_date
        FROM workouts
        WHERE user_id = p_user_id 
          AND completed_at >= start_date 
          AND completed_at <= end_date
          AND completed_at IS NOT NULL
        GROUP BY DATE(completed_at)
        ORDER BY DATE(completed_at) DESC
      )
      SELECT COUNT(*) INTO progress_value FROM daily_workouts;
      
    WHEN 'exercise_specific' THEN
      SELECT COALESCE(SUM(sets.actual_reps), 0) INTO progress_value
      FROM workouts w
      JOIN workout_exercises we ON w.id = we.workout_id
      JOIN workout_sets sets ON we.id = sets.workout_exercise_id
      JOIN exercises e ON we.exercise_id = e.id
      WHERE w.user_id = p_user_id 
        AND w.completed_at >= start_date 
        AND w.completed_at <= end_date
        AND e.name = (challenge_record.metadata->>'exercise_name')
        AND sets.is_completed = true;
        
    ELSE
      progress_value := 0;
  END CASE;
  
  -- Update participant progress
  UPDATE challenge_participants
  SET 
    current_progress = progress_value,
    best_performance = GREATEST(best_performance, progress_value),
    completion_percentage = CASE 
      WHEN challenge_record.target_value > 0 
      THEN LEAST(100, (progress_value / challenge_record.target_value) * 100)
      ELSE 0 
    END,
    is_completed = (progress_value >= challenge_record.target_value),
    completed_at = CASE 
      WHEN progress_value >= challenge_record.target_value AND completed_at IS NULL 
      THEN now() 
      ELSE completed_at 
    END
  WHERE user_id = p_user_id AND challenge_id = p_challenge_id;
  
  RETURN progress_value;
END;
$$;

-- Function to Update Challenge Rankings
CREATE OR REPLACE FUNCTION update_challenge_rankings(p_challenge_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update rank positions for all participants in the challenge
  WITH ranked_participants AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        ORDER BY 
          is_completed DESC,
          best_performance DESC,
          current_progress DESC,
          joined_at ASC
      ) as new_rank
    FROM challenge_participants
    WHERE challenge_id = p_challenge_id
  )
  UPDATE challenge_participants cp
  SET rank_position = rp.new_rank
  FROM ranked_participants rp
  WHERE cp.id = rp.id;
  
  -- Refresh materialized view
  REFRESH MATERIALIZED VIEW CONCURRENTLY challenge_leaderboards;
END;
$$;

-- Trigger to Update Rankings on Progress Change
CREATE OR REPLACE FUNCTION trigger_update_challenge_rankings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM update_challenge_rankings(NEW.challenge_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_rankings_on_progress_change
  AFTER UPDATE OF current_progress, best_performance, is_completed ON challenge_participants
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_challenge_rankings();

-- Insert Default Challenge Categories
INSERT INTO challenge_categories (name, description, icon, color, sort_order) VALUES
  ('Strength', 'Strength-based challenges', 'dumbbell', '#EF4444', 1),
  ('Endurance', 'Endurance and cardio challenges', 'activity', '#10B981', 2),
  ('Consistency', 'Habit-building challenges', 'calendar', '#3B82F6', 3),
  ('Volume', 'High-volume training challenges', 'trending-up', '#F59E0B', 4),
  ('Community', 'Team and group challenges', 'users', '#8B5CF6', 5),
  ('Seasonal', 'Time-limited special challenges', 'star', '#EC4899', 6)
ON CONFLICT (name) DO NOTHING;

-- Update existing challenges with categories
UPDATE challenges SET category_id = (
  SELECT id FROM challenge_categories WHERE name = 'Strength'
) WHERE type IN ('max_weight', 'personal_records');

UPDATE challenges SET category_id = (
  SELECT id FROM challenge_categories WHERE name = 'Endurance'
) WHERE type IN ('cardio_minutes', 'distance');

UPDATE challenges SET category_id = (
  SELECT id FROM challenge_categories WHERE name = 'Consistency'
) WHERE type IN ('workout_count', 'streak_days');

UPDATE challenges SET category_id = (
  SELECT id FROM challenge_categories WHERE name = 'Volume'
) WHERE type IN ('total_weight', 'total_reps');
