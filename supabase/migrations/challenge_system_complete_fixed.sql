/*
  # Complete Challenge System Creation - Fixed

  1. Core Tables
    - `challenge_categories` - Organize challenges by type
    - `challenges` - Main challenges table with all features
    - `challenge_participants` - Track challenge participation
    - `challenge_notifications` - Challenge-related notifications

  2. Performance Features
    - Materialized views for leaderboards
    - Indexes for optimal performance
    - Triggers for automatic updates

  3. Security
    - Row Level Security on all tables
    - Privacy controls for challenges
    - User-specific access policies
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

-- Main Challenges Table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id),
  category_id uuid REFERENCES challenge_categories(id),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('workout_count', 'total_weight', 'streak_days', 'exercise_specific', 'cardio_minutes', 'distance', 'personal_records')),
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'extreme')),
  target_value numeric NOT NULL,
  target_unit text NOT NULL,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  privacy_level text DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends', 'private')),
  max_participants integer,
  current_participants integer DEFAULT 0,
  reward_points integer DEFAULT 50,
  reward_badge text,
  reward_title text,
  is_featured boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Challenge Participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  current_progress numeric DEFAULT 0,
  rank_position integer,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  performance_data jsonb DEFAULT '{}',
  performance_history jsonb DEFAULT '[]',
  streak_count integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
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

-- Challenge Leaderboard Materialized View (Fixed column references)
CREATE MATERIALIZED VIEW IF NOT EXISTS challenge_leaderboards AS
SELECT 
  cp.challenge_id,
  cp.user_id,
  cp.current_progress,
  CASE 
    WHEN c.target_value > 0 
    THEN LEAST(100, (cp.current_progress / c.target_value) * 100)
    ELSE 0 
  END as completion_percentage,
  cp.is_completed,
  cp.completed_at,
  cp.joined_at,
  ROW_NUMBER() OVER (
    PARTITION BY cp.challenge_id 
    ORDER BY 
      cp.is_completed DESC,
      cp.current_progress DESC,
      cp.joined_at ASC
  ) as rank_position,
  c.title as challenge_title,
  c.type as challenge_type,
  c.target_value,
  c.target_unit,
  c.end_date,
  c.status as challenge_status,
  c.difficulty,
  c.reward_points
FROM challenge_participants cp
JOIN challenges c ON cp.challenge_id = c.id
WHERE c.status IN ('active', 'completed');

-- Create unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_challenge_leaderboards_unique 
ON challenge_leaderboards (challenge_id, user_id);

-- Enable RLS
ALTER TABLE challenge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Challenge Categories
CREATE POLICY "Anyone can read active challenge categories"
  ON challenge_categories
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- RLS Policies for Challenges
CREATE POLICY "Users can read public challenges"
  ON challenges
  FOR SELECT
  TO authenticated
  USING (
    privacy_level = 'public' OR 
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM challenge_participants cp 
      WHERE cp.challenge_id = challenges.id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create challenges"
  ON challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own challenges"
  ON challenges
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for Challenge Participants
CREATE POLICY "Users can read challenge participants for accessible challenges"
  ON challenge_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM challenges c 
      WHERE c.id = challenge_id 
      AND (
        c.privacy_level = 'public' OR 
        c.created_by = auth.uid() OR 
        challenge_participants.user_id = auth.uid()
      )
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

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_challenges_category_id ON challenges(category_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_featured ON challenges(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_challenges_end_date ON challenges(end_date);
CREATE INDEX IF NOT EXISTS idx_challenges_created_by ON challenges(created_by);
CREATE INDEX IF NOT EXISTS idx_challenges_privacy ON challenges(privacy_level);

CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_progress ON challenge_participants(challenge_id, current_progress DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_completion ON challenge_participants(challenge_id, is_completed, current_progress DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_rank ON challenge_participants(challenge_id, rank_position);

CREATE INDEX IF NOT EXISTS idx_challenge_notifications_user_id ON challenge_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_notifications_unread ON challenge_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_challenge_notifications_created_at ON challenge_notifications(created_at);

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
      FROM workout_sessions
      WHERE user_id = p_user_id 
        AND completed_at >= start_date 
        AND completed_at <= end_date
        AND completed_at IS NOT NULL;
        
    WHEN 'total_weight' THEN
      SELECT COALESCE(SUM(
        (es.weight_kg * es.reps)
      ), 0) INTO progress_value
      FROM workout_sessions ws
      JOIN workout_exercises we ON ws.id = we.workout_session_id
      JOIN exercise_sets es ON we.id = es.workout_exercise_id
      WHERE ws.user_id = p_user_id 
        AND ws.completed_at >= start_date 
        AND ws.completed_at <= end_date
        AND es.completed = true;
        
    WHEN 'streak_days' THEN
      -- Calculate streak within challenge period
      WITH daily_workouts AS (
        SELECT DATE(completed_at) as workout_date
        FROM workout_sessions
        WHERE user_id = p_user_id 
          AND completed_at >= start_date 
          AND completed_at <= end_date
          AND completed_at IS NOT NULL
        GROUP BY DATE(completed_at)
        ORDER BY DATE(completed_at) DESC
      ),
      streak_calculation AS (
        SELECT workout_date,
               ROW_NUMBER() OVER (ORDER BY workout_date DESC) as rn,
               workout_date - INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY workout_date DESC) - 1) as expected_date
        FROM daily_workouts
      )
      SELECT COUNT(*) INTO progress_value
      FROM streak_calculation
      WHERE workout_date = expected_date;
      
    WHEN 'exercise_specific' THEN
      SELECT COALESCE(SUM(es.reps), 0) INTO progress_value
      FROM workout_sessions ws
      JOIN workout_exercises we ON ws.id = we.workout_session_id
      JOIN exercise_sets es ON we.id = es.workout_exercise_id
      JOIN exercises e ON we.exercise_id = e.id
      WHERE ws.user_id = p_user_id 
        AND ws.completed_at >= start_date 
        AND ws.completed_at <= end_date
        AND e.name = (challenge_record.metadata->>'exercise_name')
        AND es.completed = true;
        
    WHEN 'cardio_minutes' THEN
      SELECT COALESCE(SUM(ws.duration_seconds / 60.0), 0) INTO progress_value
      FROM workout_sessions ws
      JOIN workout_exercises we ON ws.id = we.workout_session_id
      JOIN exercises e ON we.exercise_id = e.id
      JOIN exercise_categories ec ON e.category_id = ec.id
      WHERE ws.user_id = p_user_id 
        AND ws.completed_at >= start_date 
        AND ws.completed_at <= end_date
        AND ec.name ILIKE '%cardio%'
        AND ws.completed_at IS NOT NULL;
        
    ELSE
      progress_value := 0;
  END CASE;
  
  -- Update participant progress
  UPDATE challenge_participants
  SET 
    current_progress = progress_value,
    is_completed = (progress_value >= challenge_record.target_value),
    completed_at = CASE 
      WHEN progress_value >= challenge_record.target_value AND completed_at IS NULL 
      THEN now() 
      ELSE completed_at 
    END,
    last_activity = now()
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

-- Function to Join Challenge
CREATE OR REPLACE FUNCTION join_challenge(p_user_id uuid, p_challenge_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  challenge_record record;
  participant_count integer;
BEGIN
  -- Get challenge details
  SELECT * INTO challenge_record FROM challenges WHERE id = p_challenge_id;
  
  IF NOT FOUND OR challenge_record.status != 'active' THEN
    RETURN false;
  END IF;
  
  -- Check if already joined
  IF EXISTS (SELECT 1 FROM challenge_participants WHERE user_id = p_user_id AND challenge_id = p_challenge_id) THEN
    RETURN false;
  END IF;
  
  -- Check participant limit
  IF challenge_record.max_participants IS NOT NULL THEN
    SELECT COUNT(*) INTO participant_count FROM challenge_participants WHERE challenge_id = p_challenge_id;
    IF participant_count >= challenge_record.max_participants THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Join challenge
  INSERT INTO challenge_participants (challenge_id, user_id)
  VALUES (p_challenge_id, p_user_id);
  
  -- Update participant count
  UPDATE challenges 
  SET current_participants = current_participants + 1
  WHERE id = p_challenge_id;
  
  -- Calculate initial progress
  PERFORM calculate_challenge_progress(p_user_id, p_challenge_id);
  
  -- Create notification
  INSERT INTO challenge_notifications (user_id, challenge_id, notification_type, title, message)
  VALUES (
    p_user_id, 
    p_challenge_id, 
    'start', 
    'Challenge Joined!', 
    'You have successfully joined "' || challenge_record.title || '"'
  );
  
  RETURN true;
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

DROP TRIGGER IF EXISTS update_rankings_on_progress_change ON challenge_participants;
CREATE TRIGGER update_rankings_on_progress_change
  AFTER UPDATE OF current_progress, is_completed ON challenge_participants
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_challenge_rankings();

-- Trigger to Update Challenge Timestamps
CREATE OR REPLACE FUNCTION trigger_update_challenge_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_challenge_timestamp ON challenges;
CREATE TRIGGER update_challenge_timestamp
  BEFORE UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_challenge_timestamp();

-- Insert Default Challenge Categories
INSERT INTO challenge_categories (name, description, icon, color, sort_order) VALUES
  ('Strength', 'Strength-based challenges', 'dumbbell', '#EF4444', 1),
  ('Endurance', 'Endurance and cardio challenges', 'activity', '#10B981', 2),
  ('Consistency', 'Habit-building challenges', 'calendar', '#3B82F6', 3),
  ('Volume', 'High-volume training challenges', 'trending-up', '#F59E0B', 4),
  ('Community', 'Team and group challenges', 'users', '#8B5CF6', 5),
  ('Seasonal', 'Time-limited special challenges', 'star', '#EC4899', 6)
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Challenges
DO $$
DECLARE
  strength_cat_id uuid;
  endurance_cat_id uuid;
  consistency_cat_id uuid;
  volume_cat_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO strength_cat_id FROM challenge_categories WHERE name = 'Strength';
  SELECT id INTO endurance_cat_id FROM challenge_categories WHERE name = 'Endurance';
  SELECT id INTO consistency_cat_id FROM challenge_categories WHERE name = 'Consistency';
  SELECT id INTO volume_cat_id FROM challenge_categories WHERE name = 'Volume';
  
  -- Insert sample challenges
  INSERT INTO challenges (
    category_id, title, description, type, difficulty, target_value, target_unit,
    end_date, reward_points, reward_badge, is_featured
  ) VALUES
  (
    consistency_cat_id,
    '7-Day Workout Streak',
    'Complete a workout for 7 consecutive days and build the habit!',
    'streak_days',
    'medium',
    7,
    'days',
    now() + INTERVAL '14 days',
    300,
    'Streak Master',
    true
  ),
  (
    strength_cat_id,
    'Push-up Champion',
    'Complete 1000 push-ups this month and become a champion!',
    'exercise_specific',
    'hard',
    1000,
    'reps',
    now() + INTERVAL '30 days',
    500,
    'Push-up Champion',
    true
  ),
  (
    volume_cat_id,
    'Volume Beast',
    'Lift 50,000kg total volume this month!',
    'total_weight',
    'extreme',
    50000,
    'kg',
    now() + INTERVAL '30 days',
    750,
    'Volume Beast',
    false
  ),
  (
    consistency_cat_id,
    'Workout Warrior',
    'Complete 20 workouts this month',
    'workout_count',
    'medium',
    20,
    'workouts',
    now() + INTERVAL '30 days',
    400,
    'Workout Warrior',
    true
  ),
  (
    endurance_cat_id,
    'Cardio Crusher',
    'Complete 300 minutes of cardio this month',
    'cardio_minutes',
    'medium',
    300,
    'minutes',
    now() + INTERVAL '30 days',
    350,
    'Cardio Crusher',
    false
  );
END $$;