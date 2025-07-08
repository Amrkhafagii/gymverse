/*
  # Challenges & Leaderboards Schema

  1. New Tables
    - `leaderboards` - Different leaderboard categories
    - `leaderboard_entries` - User rankings and scores
    - `challenge_templates` - Reusable challenge templates
    - `team_challenges` - Team-based challenges
    - `team_members` - Team membership tracking
    - `challenge_rewards` - Reward system for challenges
    - `user_rewards` - User's earned rewards

  2. Security
    - Enable RLS on all tables
    - Public leaderboards with privacy controls
    - Team-based access controls

  3. Features
    - Multiple leaderboard categories
    - Team challenges and competitions
    - Reward and achievement system
    - Challenge templates for easy creation
    - Comprehensive ranking system
*/

-- Leaderboards
CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('global', 'friends', 'local', 'age_group', 'gender', 'custom')),
  metric_type text NOT NULL CHECK (metric_type IN ('total_volume', 'workout_count', 'streak_length', 'personal_records', 'consistency_score', 'challenge_wins')),
  time_period text DEFAULT 'monthly' CHECK (time_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'all_time')),
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean DEFAULT true,
  is_public boolean DEFAULT true,
  entry_criteria jsonb DEFAULT '{}', -- Age, gender, location filters
  max_entries integer DEFAULT 100,
  update_frequency text DEFAULT 'daily' CHECK (update_frequency IN ('real_time', 'hourly', 'daily', 'weekly')),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leaderboard Entries
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_id uuid REFERENCES leaderboards(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  rank integer NOT NULL,
  score numeric NOT NULL,
  previous_rank integer,
  rank_change integer DEFAULT 0,
  additional_metrics jsonb DEFAULT '{}',
  last_activity timestamptz,
  entry_date timestamptz DEFAULT now(),
  is_tied boolean DEFAULT false,
  tie_breaker_score numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(leaderboard_id, user_id)
);

-- Challenge Templates
CREATE TABLE IF NOT EXISTS challenge_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id),
  name text NOT NULL,
  description text NOT NULL,
  category text CHECK (category IN ('strength', 'endurance', 'consistency', 'volume', 'social', 'custom')),
  difficulty_level text DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'extreme')),
  duration_days integer NOT NULL,
  challenge_type text CHECK (challenge_type IN ('individual', 'team', 'community')),
  target_metric text NOT NULL,
  target_value numeric NOT NULL,
  target_unit text NOT NULL,
  rules jsonb DEFAULT '{}',
  rewards jsonb DEFAULT '{}',
  prerequisites jsonb DEFAULT '{}',
  is_public boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  success_rate numeric DEFAULT 0,
  average_completion_time numeric,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team Challenges
CREATE TABLE IF NOT EXISTS team_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES community_challenges(id) ON DELETE CASCADE NOT NULL,
  team_name text NOT NULL,
  team_description text,
  captain_id uuid REFERENCES auth.users(id) NOT NULL,
  max_members integer DEFAULT 10,
  current_members integer DEFAULT 1,
  team_score numeric DEFAULT 0,
  team_rank integer,
  is_private boolean DEFAULT false,
  invite_code text UNIQUE,
  team_avatar_url text,
  team_motto text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES team_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('captain', 'co_captain', 'member')),
  joined_at timestamptz DEFAULT now(),
  individual_score numeric DEFAULT 0,
  contribution_percentage numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  left_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Challenge Rewards
CREATE TABLE IF NOT EXISTS challenge_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES community_challenges(id),
  template_id uuid REFERENCES challenge_templates(id),
  reward_type text NOT NULL CHECK (reward_type IN ('badge', 'points', 'title', 'item', 'discount', 'feature_unlock')),
  reward_name text NOT NULL,
  reward_description text,
  reward_value numeric,
  reward_data jsonb DEFAULT '{}',
  eligibility_criteria jsonb DEFAULT '{}', -- Top 10%, completion, etc.
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT challenge_or_template_check CHECK (
    (challenge_id IS NOT NULL AND template_id IS NULL) OR
    (challenge_id IS NULL AND template_id IS NOT NULL)
  )
);

-- User Rewards
CREATE TABLE IF NOT EXISTS user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  reward_id uuid REFERENCES challenge_rewards(id) NOT NULL,
  challenge_id uuid REFERENCES community_challenges(id),
  earned_at timestamptz DEFAULT now(),
  is_claimed boolean DEFAULT false,
  claimed_at timestamptz,
  expiry_date timestamptz,
  usage_count integer DEFAULT 0,
  max_usage integer DEFAULT 1,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Challenge Leaderboard Snapshots
CREATE TABLE IF NOT EXISTS challenge_leaderboard_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES community_challenges(id) ON DELETE CASCADE NOT NULL,
  snapshot_date timestamptz DEFAULT now(),
  leaderboard_data jsonb NOT NULL, -- Full leaderboard state
  top_performers jsonb DEFAULT '{}', -- Top 10 for quick access
  statistics jsonb DEFAULT '{}', -- Average scores, participation stats
  created_at timestamptz DEFAULT now()
);

-- Global Statistics
CREATE TABLE IF NOT EXISTS global_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_type text NOT NULL CHECK (stat_type IN ('total_workouts', 'total_users', 'total_volume', 'active_challenges', 'completed_challenges')),
  stat_period text DEFAULT 'all_time' CHECK (stat_period IN ('daily', 'weekly', 'monthly', 'yearly', 'all_time')),
  period_start date,
  period_end date,
  value numeric NOT NULL,
  metadata jsonb DEFAULT '{}',
  calculated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(stat_type, stat_period, period_start)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaderboards_category ON leaderboards(category);
CREATE INDEX IF NOT EXISTS idx_leaderboards_metric_type ON leaderboards(metric_type);
CREATE INDEX IF NOT EXISTS idx_leaderboards_time_period ON leaderboards(time_period);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_leaderboard_id ON leaderboard_entries(leaderboard_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_user_id ON leaderboard_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_rank ON leaderboard_entries(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_score ON leaderboard_entries(score DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_templates_category ON challenge_templates(category);
CREATE INDEX IF NOT EXISTS idx_challenge_templates_difficulty ON challenge_templates(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_team_challenges_challenge_id ON team_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_team_challenges_captain_id ON team_challenges(captain_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_rewards_challenge_id ON challenge_rewards(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_earned_at ON user_rewards(earned_at);
CREATE INDEX IF NOT EXISTS idx_challenge_leaderboard_snapshots_challenge_id ON challenge_leaderboard_snapshots(challenge_id);
CREATE INDEX IF NOT EXISTS idx_global_statistics_type_period ON global_statistics(stat_type, stat_period);

-- Enable RLS
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Leaderboards
CREATE POLICY "Public leaderboards are viewable by everyone"
  ON leaderboards FOR SELECT
  TO authenticated
  USING (is_public = true AND is_active = true);

-- Leaderboard Entries
CREATE POLICY "Users can view public leaderboard entries"
  ON leaderboard_entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leaderboards 
      WHERE id = leaderboard_entries.leaderboard_id 
      AND is_public = true 
      AND is_active = true
    )
  );

-- Challenge Templates
CREATE POLICY "Users can view public challenge templates"
  ON challenge_templates FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can create challenge templates"
  ON challenge_templates FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own challenge templates"
  ON challenge_templates FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Team Challenges
CREATE POLICY "Users can view team challenges for public challenges"
  ON team_challenges FOR SELECT
  TO authenticated
  USING (
    NOT is_private OR 
    captain_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = team_challenges.id 
      AND user_id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Users can create team challenges"
  ON team_challenges FOR INSERT
  TO authenticated
  WITH CHECK (captain_id = auth.uid());

CREATE POLICY "Team captains can update their teams"
  ON team_challenges FOR UPDATE
  TO authenticated
  USING (captain_id = auth.uid());

-- Team Members
CREATE POLICY "Users can view team members of visible teams"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_challenges tc
      WHERE tc.id = team_members.team_id
      AND (
        NOT tc.is_private OR 
        tc.captain_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members tm2
          WHERE tm2.team_id = tc.id 
          AND tm2.user_id = auth.uid() 
          AND tm2.is_active = true
        )
      )
    )
  );

CREATE POLICY "Users can manage their own team membership"
  ON team_members FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Challenge Rewards
CREATE POLICY "Users can view challenge rewards"
  ON challenge_rewards FOR SELECT
  TO authenticated
  USING (is_active = true);

-- User Rewards
CREATE POLICY "Users can view their own rewards"
  ON user_rewards FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert user rewards"
  ON user_rewards FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own rewards"
  ON user_rewards FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Challenge Leaderboard Snapshots
CREATE POLICY "Users can view challenge leaderboard snapshots"
  ON challenge_leaderboard_snapshots FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_challenges 
      WHERE id = challenge_leaderboard_snapshots.challenge_id 
      AND is_public = true
    )
  );

-- Global Statistics
CREATE POLICY "Global statistics are viewable by everyone"
  ON global_statistics FOR SELECT
  TO authenticated
  USING (true);

-- Insert default leaderboards
INSERT INTO leaderboards (name, description, category, metric_type, time_period, is_public) VALUES
  ('Global Volume Leaders', 'Top performers by total volume lifted', 'global', 'total_volume', 'monthly', true),
  ('Workout Warriors', 'Most consistent workout performers', 'global', 'workout_count', 'monthly', true),
  ('Streak Masters', 'Longest workout streaks', 'global', 'streak_length', 'all_time', true),
  ('Record Breakers', 'Most personal records set', 'global', 'personal_records', 'monthly', true),
  ('Consistency Champions', 'Highest consistency scores', 'global', 'consistency_score', 'monthly', true),
  ('Challenge Champions', 'Most challenge victories', 'global', 'challenge_wins', 'all_time', true)
ON CONFLICT DO NOTHING;

-- Insert default challenge templates
INSERT INTO challenge_templates (name, description, category, difficulty_level, duration_days, challenge_type, target_metric, target_value, target_unit, rules) VALUES
  ('30-Day Consistency Challenge', 'Work out for 30 consecutive days', 'consistency', 'medium', 30, 'individual', 'workout_streak', 30, 'days', '{"min_workout_duration": 20, "rest_days_allowed": 0}'),
  ('Volume Beast Challenge', 'Lift 50,000kg total volume in 4 weeks', 'volume', 'hard', 28, 'individual', 'total_volume', 50000, 'kg', '{"compound_exercises_only": false}'),
  ('Strength Surge', 'Increase your total 1RM by 10% in 8 weeks', 'strength', 'medium', 56, 'individual', 'strength_increase', 10, 'percent', '{"exercises": ["squat", "bench_press", "deadlift"]}'),
  ('Team Transformation', 'Team challenge for total volume', 'volume', 'medium', 21, 'team', 'team_total_volume', 100000, 'kg', '{"max_team_size": 5, "min_individual_contribution": 15000}'),
  ('Endurance Elite', 'Complete 100km of cardio in 4 weeks', 'endurance', 'hard', 28, 'individual', 'total_distance', 100, 'km', '{"cardio_exercises_only": true}')
ON CONFLICT DO NOTHING;

-- Function to update leaderboard rankings
CREATE OR REPLACE FUNCTION update_leaderboard_rankings(leaderboard_uuid uuid)
RETURNS void AS $$
BEGIN
  -- Update rankings based on score (descending order)
  WITH ranked_entries AS (
    SELECT 
      id,
      user_id,
      score,
      rank,
      ROW_NUMBER() OVER (ORDER BY score DESC, last_activity DESC) as new_rank
    FROM leaderboard_entries
    WHERE leaderboard_id = leaderboard_uuid
  )
  UPDATE leaderboard_entries le
  SET 
    previous_rank = le.rank,
    rank = re.new_rank,
    rank_change = le.rank - re.new_rank,
    updated_at = now()
  FROM ranked_entries re
  WHERE le.id = re.id
  AND le.rank != re.new_rank;

  -- Update leaderboard last_updated timestamp
  UPDATE leaderboards 
  SET last_updated = now() 
  WHERE id = leaderboard_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate team scores
CREATE OR REPLACE FUNCTION update_team_scores(team_uuid uuid)
RETURNS void AS $$
DECLARE
  total_score numeric := 0;
  member_count integer := 0;
BEGIN
  -- Calculate total team score from active members
  SELECT 
    COALESCE(SUM(cp.current_progress), 0),
    COUNT(*)
  INTO total_score, member_count
  FROM team_members tm
  JOIN challenge_participants cp ON tm.user_id = cp.user_id
  JOIN team_challenges tc ON tm.team_id = tc.id
  WHERE tm.team_id = team_uuid
  AND tm.is_active = true
  AND cp.challenge_id = tc.challenge_id;

  -- Update team score and member count
  UPDATE team_challenges
  SET 
    team_score = total_score,
    current_members = member_count,
    updated_at = now()
  WHERE id = team_uuid;

  -- Update individual contribution percentages
  UPDATE team_members tm
  SET contribution_percentage = CASE 
    WHEN total_score > 0 THEN (cp.current_progress / total_score * 100)
    ELSE 0
  END
  FROM challenge_participants cp
  JOIN team_challenges tc ON tm.team_id = tc.id
  WHERE tm.team_id = team_uuid
  AND tm.user_id = cp.user_id
  AND cp.challenge_id = tc.challenge_id
  AND tm.is_active = true;
END;
$$ LANGUAGE plpgsql;
