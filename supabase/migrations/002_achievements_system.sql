/*
  # Achievements & Streaks System Schema

  1. New Tables
    - `achievement_definitions` - Available achievements and their criteria
    - `user_achievements` - User's unlocked achievements
    - `achievement_progress` - Progress tracking for achievements
    - `streaks` - User streak tracking
    - `streak_history` - Historical streak data
    - `milestones` - User milestone tracking

  2. Security
    - Enable RLS on all tables
    - Users can only view/modify their own achievement data
    - Achievement definitions are publicly readable

  3. Features
    - Comprehensive achievement system with progress tracking
    - Streak calculation and milestone rewards
    - Achievement categories and difficulty levels
    - Progress notifications and celebrations
*/

-- Achievement Definitions
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('workout', 'streak', 'volume', 'consistency', 'social', 'milestone')),
  difficulty text DEFAULT 'bronze' CHECK (difficulty IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  icon text NOT NULL,
  badge_color text DEFAULT '#3B82F6',
  points integer DEFAULT 10,
  criteria jsonb NOT NULL, -- Flexible criteria definition
  is_active boolean DEFAULT true,
  is_repeatable boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  achievement_id uuid REFERENCES achievement_definitions(id) NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  progress_data jsonb DEFAULT '{}',
  notification_sent boolean DEFAULT false,
  celebration_viewed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Achievement Progress (for tracking progress toward achievements)
CREATE TABLE IF NOT EXISTS achievement_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  achievement_id uuid REFERENCES achievement_definitions(id) NOT NULL,
  current_value numeric DEFAULT 0,
  target_value numeric NOT NULL,
  progress_percentage numeric GENERATED ALWAYS AS (
    CASE 
      WHEN target_value > 0 THEN LEAST(100, (current_value / target_value) * 100)
      ELSE 0 
    END
  ) STORED,
  last_updated timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Streaks
CREATE TABLE IF NOT EXISTS streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  streak_type text NOT NULL CHECK (streak_type IN ('workout', 'login', 'goal_completion', 'consistency')),
  current_count integer DEFAULT 0,
  best_count integer DEFAULT 0,
  last_activity_date date,
  started_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

-- Streak History
CREATE TABLE IF NOT EXISTS streak_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  streak_type text NOT NULL,
  count integer NOT NULL,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  reason text, -- 'completed', 'broken', 'reset'
  created_at timestamptz DEFAULT now()
);

-- Milestones
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  milestone_type text NOT NULL CHECK (milestone_type IN ('first_workout', 'weight_milestone', 'rep_milestone', 'time_milestone', 'streak_milestone')),
  title text NOT NULL,
  description text,
  value numeric,
  unit text,
  achieved_at timestamptz DEFAULT now(),
  celebration_viewed boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_user_id ON achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_percentage ON achievement_progress(progress_percentage);
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_type ON streaks(streak_type);
CREATE INDEX IF NOT EXISTS idx_streak_history_user_id ON streak_history(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_type ON milestones(milestone_type);

-- Enable RLS
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Achievement Definitions (public read)
CREATE POLICY "Achievement definitions are viewable by everyone"
  ON achievement_definitions FOR SELECT
  TO authenticated
  USING (is_active = true);

-- User Achievements
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own achievements"
  ON user_achievements FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Achievement Progress
CREATE POLICY "Users can manage their own achievement progress"
  ON achievement_progress FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Streaks
CREATE POLICY "Users can manage their own streaks"
  ON streaks FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Streak History
CREATE POLICY "Users can view their own streak history"
  ON streak_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own streak history"
  ON streak_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Milestones
CREATE POLICY "Users can manage their own milestones"
  ON milestones FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Insert default achievement definitions
INSERT INTO achievement_definitions (name, description, category, difficulty, icon, badge_color, points, criteria) VALUES
  ('First Workout', 'Complete your first workout session', 'milestone', 'bronze', 'trophy', '#CD7F32', 10, '{"type": "workout_count", "target": 1}'),
  ('Workout Warrior', 'Complete 10 workout sessions', 'workout', 'silver', 'muscle', '#C0C0C0', 25, '{"type": "workout_count", "target": 10}'),
  ('Fitness Fanatic', 'Complete 50 workout sessions', 'workout', 'gold', 'star', '#FFD700', 50, '{"type": "workout_count", "target": 50}'),
  ('Consistency King', 'Maintain a 7-day workout streak', 'streak', 'silver', 'fire', '#FF6B35', 30, '{"type": "workout_streak", "target": 7}'),
  ('Streak Master', 'Maintain a 30-day workout streak', 'streak', 'gold', 'flame', '#FF4500', 75, '{"type": "workout_streak", "target": 30}'),
  ('Volume Beast', 'Lift 10,000kg total volume', 'volume', 'gold', 'weight', '#4A90E2', 60, '{"type": "total_volume", "target": 10000}'),
  ('Early Bird', 'Complete 5 morning workouts', 'consistency', 'bronze', 'sunrise', '#FFA500', 20, '{"type": "morning_workouts", "target": 5}'),
  ('Social Butterfly', 'Share 10 workout posts', 'social', 'silver', 'share', '#9B59B6', 35, '{"type": "posts_shared", "target": 10}'),
  ('Personal Best', 'Set your first personal record', 'milestone', 'bronze', 'target', '#E74C3C', 15, '{"type": "personal_records", "target": 1}'),
  ('PR Machine', 'Set 10 personal records', 'milestone', 'gold', 'medal', '#F39C12', 65, '{"type": "personal_records", "target": 10}')
ON CONFLICT DO NOTHING;
