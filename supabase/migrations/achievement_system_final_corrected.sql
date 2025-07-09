/*
  # Achievement System Final Migration (Column Structure Corrected)

  1. New Tables
    - `achievement_progress` - Track detailed progress for multi-step achievements
    - `achievement_notifications` - Store achievement unlock notifications
    - `achievement_categories` - Organize achievements into categories
    - `user_achievement_stats` - Cache achievement statistics for performance

  2. Enhanced Tables
    - `achievements` - Add missing columns and enhance existing structure
    - `user_achievements` - Add progress tracking and unlock context

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their achievement data

  4. Performance
    - Add indexes for common queries
    - Add triggers for automatic progress calculation

  Note: Creates all necessary columns for achievements table
*/

-- Achievement Categories (using integer IDs to match existing schema)
CREATE TABLE IF NOT EXISTS achievement_categories (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  color text DEFAULT '#3B82F6',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced Achievements Table - Add ALL missing columns
DO $$
BEGIN
  -- Add title column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'title') THEN
    ALTER TABLE achievements ADD COLUMN title text;
  END IF;
  
  -- Add description column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'description') THEN
    ALTER TABLE achievements ADD COLUMN description text;
  END IF;
  
  -- Add icon column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'icon') THEN
    ALTER TABLE achievements ADD COLUMN icon text;
  END IF;
  
  -- Add category_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'category_id') THEN
    ALTER TABLE achievements ADD COLUMN category_id integer REFERENCES achievement_categories(id);
  END IF;
  
  -- Add difficulty column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'difficulty') THEN
    ALTER TABLE achievements ADD COLUMN difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'legendary'));
  END IF;
  
  -- Add reward_points column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'reward_points') THEN
    ALTER TABLE achievements ADD COLUMN reward_points integer DEFAULT 10;
  END IF;
  
  -- Add is_secret column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'is_secret') THEN
    ALTER TABLE achievements ADD COLUMN is_secret boolean DEFAULT false;
  END IF;
  
  -- Add prerequisites column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'prerequisites') THEN
    ALTER TABLE achievements ADD COLUMN prerequisites jsonb DEFAULT '[]';
  END IF;
  
  -- Add metadata column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'metadata') THEN
    ALTER TABLE achievements ADD COLUMN metadata jsonb DEFAULT '{}';
  END IF;
  
  -- Add type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'type') THEN
    ALTER TABLE achievements ADD COLUMN type text DEFAULT 'milestone';
  END IF;
  
  -- Add target_value column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'target_value') THEN
    ALTER TABLE achievements ADD COLUMN target_value integer DEFAULT 1;
  END IF;
  
  -- Add is_active column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'is_active') THEN
    ALTER TABLE achievements ADD COLUMN is_active boolean DEFAULT true;
  END IF;
  
  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'created_at') THEN
    ALTER TABLE achievements ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
  
  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'updated_at') THEN
    ALTER TABLE achievements ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Achievement Progress Tracking (using integer achievement_id)
CREATE TABLE IF NOT EXISTS achievement_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id integer NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  current_progress integer DEFAULT 0,
  target_progress integer NOT NULL,
  progress_data jsonb DEFAULT '{}',
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Achievement Notifications (using integer achievement_id)
CREATE TABLE IF NOT EXISTS achievement_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id integer NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('unlock', 'progress', 'milestone')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- User Achievement Statistics Cache
CREATE TABLE IF NOT EXISTS user_achievement_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_achievements integer DEFAULT 0,
  unlocked_achievements integer DEFAULT 0,
  total_points integer DEFAULT 0,
  completion_percentage numeric(5,2) DEFAULT 0.00,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_unlock_date timestamptz,
  stats_data jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Enhanced User Achievements
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_achievements' AND column_name = 'unlock_context') THEN
    ALTER TABLE user_achievements ADD COLUMN unlock_context jsonb DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_achievements' AND column_name = 'progress_at_unlock') THEN
    ALTER TABLE user_achievements ADD COLUMN progress_at_unlock integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_achievements' AND column_name = 'celebration_shown') THEN
    ALTER TABLE user_achievements ADD COLUMN celebration_shown boolean DEFAULT false;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE achievement_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievement_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Achievement Categories (Public Read)
CREATE POLICY "Anyone can read achievement categories"
  ON achievement_categories
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- RLS Policies for Achievement Progress
CREATE POLICY "Users can read own achievement progress"
  ON achievement_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievement progress"
  ON achievement_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievement progress"
  ON achievement_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Achievement Notifications
CREATE POLICY "Users can read own achievement notifications"
  ON achievement_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own achievement notifications"
  ON achievement_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for User Achievement Stats
CREATE POLICY "Users can read own achievement stats"
  ON user_achievement_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievement stats"
  ON user_achievement_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievement stats"
  ON user_achievement_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_achievement_progress_user_id ON achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_achievement_id ON achievement_progress(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_last_updated ON achievement_progress(last_updated);

CREATE INDEX IF NOT EXISTS idx_achievement_notifications_user_id ON achievement_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_notifications_is_read ON achievement_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_achievement_notifications_created_at ON achievement_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_achievements_category_id ON achievements(category_id);
CREATE INDEX IF NOT EXISTS idx_achievements_difficulty ON achievements(difficulty);
CREATE INDEX IF NOT EXISTS idx_achievements_is_secret ON achievements(is_secret);
CREATE INDEX IF NOT EXISTS idx_achievements_title ON achievements(title);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(type);

-- Functions for Achievement Progress Calculation
CREATE OR REPLACE FUNCTION calculate_achievement_progress(p_user_id uuid, p_achievement_id integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  progress_value integer := 0;
  achievement_record record;
BEGIN
  -- Get achievement details
  SELECT * INTO achievement_record FROM achievements WHERE id = p_achievement_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Calculate progress based on achievement type
  CASE COALESCE(achievement_record.type, 'milestone')
    WHEN 'workout_count' THEN
      SELECT COUNT(*) INTO progress_value
      FROM workouts
      WHERE user_id = p_user_id AND completed_at IS NOT NULL;
      
    WHEN 'streak_days' THEN
      -- Calculate current streak
      WITH daily_workouts AS (
        SELECT DATE(completed_at) as workout_date
        FROM workouts
        WHERE user_id = p_user_id AND completed_at IS NOT NULL
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
      
    WHEN 'total_weight' THEN
      SELECT COALESCE(SUM(
        (sets.actual_weight_kg * sets.actual_reps)
      ), 0)::integer INTO progress_value
      FROM workouts w
      JOIN workout_exercises we ON w.id = we.workout_id
      JOIN workout_sets sets ON we.id = sets.workout_exercise_id
      WHERE w.user_id = p_user_id AND sets.is_completed = true;
      
    WHEN 'personal_records' THEN
      SELECT COUNT(*) INTO progress_value
      FROM personal_records
      WHERE user_id = p_user_id;
      
    ELSE
      progress_value := 0;
  END CASE;
  
  -- Update or insert progress record
  INSERT INTO achievement_progress (user_id, achievement_id, current_progress, target_progress)
  VALUES (p_user_id, p_achievement_id, progress_value, COALESCE(achievement_record.target_value, 1))
  ON CONFLICT (user_id, achievement_id)
  DO UPDATE SET
    current_progress = progress_value,
    last_updated = now();
  
  RETURN progress_value;
END;
$$;

-- Function to Update User Achievement Stats
CREATE OR REPLACE FUNCTION update_user_achievement_stats(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count integer;
  unlocked_count integer;
  total_points_earned integer;
  completion_pct numeric;
BEGIN
  -- Get total achievements count
  SELECT COUNT(*) INTO total_count FROM achievements WHERE COALESCE(is_active, true) = true;
  
  -- Get unlocked achievements count
  SELECT COUNT(*) INTO unlocked_count
  FROM user_achievements
  WHERE user_id = p_user_id;
  
  -- Calculate total points earned
  SELECT COALESCE(SUM(COALESCE(a.reward_points, 10)), 0) INTO total_points_earned
  FROM user_achievements ua
  JOIN achievements a ON ua.achievement_id = a.id
  WHERE ua.user_id = p_user_id;
  
  -- Calculate completion percentage
  completion_pct := CASE WHEN total_count > 0 THEN (unlocked_count::numeric / total_count::numeric) * 100 ELSE 0 END;
  
  -- Update or insert stats
  INSERT INTO user_achievement_stats (
    user_id,
    total_achievements,
    unlocked_achievements,
    total_points,
    completion_percentage,
    updated_at
  )
  VALUES (
    p_user_id,
    total_count,
    unlocked_count,
    total_points_earned,
    completion_pct,
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_achievements = total_count,
    unlocked_achievements = unlocked_count,
    total_points = total_points_earned,
    completion_percentage = completion_pct,
    updated_at = now();
END;
$$;

-- Trigger to Update Stats on Achievement Unlock
CREATE OR REPLACE FUNCTION trigger_update_achievement_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM update_user_achievement_stats(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_stats_on_achievement_unlock ON user_achievements;
CREATE TRIGGER update_stats_on_achievement_unlock
  AFTER INSERT ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_achievement_stats();

-- Insert Default Achievement Categories
INSERT INTO achievement_categories (name, description, icon, color, sort_order) VALUES
  ('Consistency', 'Achievements for regular workout habits', 'calendar', '#10B981', 1),
  ('Strength', 'Achievements for strength milestones', 'dumbbell', '#EF4444', 2),
  ('Volume', 'Achievements for workout volume', 'trending-up', '#3B82F6', 3),
  ('Milestones', 'Major fitness milestones', 'trophy', '#F59E0B', 4),
  ('Social', 'Social and community achievements', 'users', '#8B5CF6', 5),
  ('Special', 'Special and seasonal achievements', 'star', '#EC4899', 6)
ON CONFLICT (name) DO NOTHING;

-- Wait for categories to be inserted, then add achievements
DO $$
BEGIN
  -- Only insert achievements if none exist with these titles
  IF NOT EXISTS (SELECT 1 FROM achievements WHERE title = 'First Workout') THEN
    INSERT INTO achievements (title, description, icon, type, target_value, reward_points, difficulty, category_id) 
    VALUES (
      'First Workout',
      'Complete your first workout session',
      '🎯',
      'workout_count',
      1,
      10,
      'easy',
      (SELECT id FROM achievement_categories WHERE name = 'Milestones')
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM achievements WHERE title = 'Workout Warrior') THEN
    INSERT INTO achievements (title, description, icon, type, target_value, reward_points, difficulty, category_id) 
    VALUES (
      'Workout Warrior',
      'Complete 10 workout sessions',
      '💪',
      'workout_count',
      10,
      25,
      'medium',
      (SELECT id FROM achievement_categories WHERE name = 'Consistency')
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM achievements WHERE title = 'Streak Master') THEN
    INSERT INTO achievements (title, description, icon, type, target_value, reward_points, difficulty, category_id) 
    VALUES (
      'Streak Master',
      'Maintain a 7-day workout streak',
      '🔥',
      'streak_days',
      7,
      50,
      'hard',
      (SELECT id FROM achievement_categories WHERE name = 'Consistency')
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM achievements WHERE title = 'Volume Beast') THEN
    INSERT INTO achievements (title, description, icon, type, target_value, reward_points, difficulty, category_id) 
    VALUES (
      'Volume Beast',
      'Lift 10,000kg total volume',
      '🏋️',
      'total_weight',
      10000,
      75,
      'hard',
      (SELECT id FROM achievement_categories WHERE name = 'Volume')
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM achievements WHERE title = 'Personal Best') THEN
    INSERT INTO achievements (title, description, icon, type, target_value, reward_points, difficulty, category_id) 
    VALUES (
      'Personal Best',
      'Set your first personal record',
      '🏆',
      'personal_records',
      1,
      15,
      'easy',
      (SELECT id FROM achievement_categories WHERE name = 'Strength')
    );
  END IF;
END $$;

-- Update existing achievements with categories (if they exist and don't have categories)
UPDATE achievements SET category_id = (
  SELECT id FROM achievement_categories WHERE name = 'Consistency'
) WHERE category_id IS NULL AND (
  COALESCE(title, '') ILIKE '%streak%' OR 
  COALESCE(title, '') ILIKE '%consistency%' OR 
  COALESCE(title, '') ILIKE '%habit%' OR
  COALESCE(type, '') IN ('streak_days', 'workout_count')
);

UPDATE achievements SET category_id = (
  SELECT id FROM achievement_categories WHERE name = 'Strength'
) WHERE category_id IS NULL AND (
  COALESCE(title, '') ILIKE '%strength%' OR 
  COALESCE(title, '') ILIKE '%record%' OR 
  COALESCE(title, '') ILIKE '%pr%' OR
  COALESCE(type, '') IN ('personal_records', 'max_weight')
);

UPDATE achievements SET category_id = (
  SELECT id FROM achievement_categories WHERE name = 'Volume'
) WHERE category_id IS NULL AND (
  COALESCE(title, '') ILIKE '%volume%' OR 
  COALESCE(title, '') ILIKE '%weight%' OR 
  COALESCE(title, '') ILIKE '%total%' OR
  COALESCE(type, '') IN ('total_weight', 'total_reps')
);

UPDATE achievements SET category_id = (
  SELECT id FROM achievement_categories WHERE name = 'Milestones'
) WHERE category_id IS NULL AND (
  COALESCE(title, '') ILIKE '%first%' OR 
  COALESCE(title, '') ILIKE '%milestone%'
);

-- Set default category for any remaining achievements
UPDATE achievements SET category_id = (
  SELECT id FROM achievement_categories WHERE name = 'Milestones'
) WHERE category_id IS NULL;
