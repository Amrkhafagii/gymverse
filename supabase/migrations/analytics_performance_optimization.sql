/*
  # Analytics and Performance Optimization

  1. New Tables
    - `user_analytics_cache` - Cache computed analytics for performance
    - `workout_analytics` - Pre-computed workout statistics
    - `exercise_analytics` - Exercise-specific analytics
    - `performance_metrics` - Track various performance indicators

  2. Performance Optimizations
    - Materialized views for complex analytics queries
    - Indexes for common analytics patterns
    - Partitioning for large tables (if needed)
    - Caching strategies for expensive calculations

  3. Analytics Functions
    - Functions for calculating trends and statistics
    - Automated cache refresh mechanisms
    - Performance monitoring utilities

  4. Data Integrity
    - Constraints and validations
    - Cleanup procedures for old data
*/

-- User Analytics Cache
CREATE TABLE IF NOT EXISTS user_analytics_cache (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_workouts integer DEFAULT 0,
  total_exercises integer DEFAULT 0,
  total_sets integer DEFAULT 0,
  total_reps integer DEFAULT 0,
  total_volume_kg numeric DEFAULT 0,
  total_duration_minutes integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  average_workout_duration numeric DEFAULT 0,
  favorite_exercises jsonb DEFAULT '[]',
  weekly_stats jsonb DEFAULT '{}',
  monthly_stats jsonb DEFAULT '{}',
  yearly_stats jsonb DEFAULT '{}',
  personal_records_count integer DEFAULT 0,
  last_workout_date timestamptz,
  cache_updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Workout Analytics
CREATE TABLE IF NOT EXISTS workout_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_exercises integer DEFAULT 0,
  total_sets integer DEFAULT 0,
  total_reps integer DEFAULT 0,
  total_volume_kg numeric DEFAULT 0,
  duration_minutes integer DEFAULT 0,
  intensity_score numeric DEFAULT 0,
  difficulty_rating integer CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
  calories_burned integer DEFAULT 0,
  average_rest_time_seconds integer DEFAULT 0,
  workout_efficiency_score numeric DEFAULT 0,
  muscle_groups_worked text[] DEFAULT '{}',
  exercise_categories text[] DEFAULT '{}',
  performance_metrics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(workout_id)
);

-- Exercise Analytics
CREATE TABLE IF NOT EXISTS exercise_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_sessions integer DEFAULT 0,
  total_sets integer DEFAULT 0,
  total_reps integer DEFAULT 0,
  total_volume_kg numeric DEFAULT 0,
  max_weight_kg numeric DEFAULT 0,
  max_reps integer DEFAULT 0,
  average_weight_kg numeric DEFAULT 0,
  average_reps numeric DEFAULT 0,
  progression_rate numeric DEFAULT 0,
  consistency_score numeric DEFAULT 0,
  last_performed_at timestamptz,
  first_performed_at timestamptz,
  performance_trend text DEFAULT 'stable' CHECK (performance_trend IN ('improving', 'stable', 'declining')),
  strength_level text DEFAULT 'beginner' CHECK (strength_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  analytics_data jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(exercise_id, user_id)
);

-- Performance Metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type text NOT NULL CHECK (metric_type IN ('strength', 'endurance', 'volume', 'consistency', 'intensity')),
  metric_name text NOT NULL,
  current_value numeric NOT NULL,
  previous_value numeric DEFAULT 0,
  change_percentage numeric DEFAULT 0,
  trend_direction text DEFAULT 'stable' CHECK (trend_direction IN ('up', 'down', 'stable')),
  measurement_date date DEFAULT CURRENT_DATE,
  time_period text DEFAULT 'weekly' CHECK (time_period IN ('daily', 'weekly', 'monthly', 'yearly')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, metric_type, metric_name, measurement_date, time_period)
);

-- Materialized View for User Progress Summary
CREATE MATERIALIZED VIEW IF NOT EXISTS user_progress_summary AS
SELECT 
  u.id as user_id,
  COUNT(DISTINCT w.id) as total_workouts,
  COUNT(DISTINCT we.exercise_id) as unique_exercises,
  SUM(ws.actual_reps) as total_reps,
  SUM(ws.actual_weight_kg * ws.actual_reps) as total_volume_kg,
  AVG(EXTRACT(EPOCH FROM (w.completed_at - w.started_at))/60) as avg_workout_duration,
  COUNT(DISTINCT pr.id) as personal_records,
  MAX(w.completed_at) as last_workout_date,
  MIN(w.completed_at) as first_workout_date
FROM auth.users u
LEFT JOIN workouts w ON u.id = w.user_id AND w.completed_at IS NOT NULL
LEFT JOIN workout_exercises we ON w.id = we.workout_id
LEFT JOIN workout_sets ws ON we.id = ws.workout_exercise_id AND ws.is_completed = true
LEFT JOIN personal_records pr ON u.id = pr.user_id
GROUP BY u.id;

-- Create unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_progress_summary_user_id 
ON user_progress_summary (user_id);

-- Materialized View for Exercise Performance Trends
CREATE MATERIALIZED VIEW IF NOT EXISTS exercise_performance_trends AS
SELECT 
  e.id as exercise_id,
  e.name as exercise_name,
  u.id as user_id,
  COUNT(DISTINCT w.id) as workout_count,
  COUNT(ws.id) as total_sets,
  SUM(ws.actual_reps) as total_reps,
  MAX(ws.actual_weight_kg) as max_weight,
  AVG(ws.actual_weight_kg) as avg_weight,
  AVG(ws.actual_reps) as avg_reps,
  MAX(w.completed_at) as last_performed,
  MIN(w.completed_at) as first_performed,
  -- Calculate progression rate (weight increase over time)
  CASE 
    WHEN COUNT(DISTINCT w.id) > 1 THEN
      (MAX(ws.actual_weight_kg) - MIN(ws.actual_weight_kg)) / 
      NULLIF(EXTRACT(DAYS FROM (MAX(w.completed_at) - MIN(w.completed_at))), 0)
    ELSE 0
  END as progression_rate_per_day
FROM exercises e
JOIN workout_exercises we ON e.id = we.exercise_id
JOIN workouts w ON we.workout_id = w.id AND w.completed_at IS NOT NULL
JOIN workout_sets ws ON we.id = ws.workout_exercise_id AND ws.is_completed = true
JOIN auth.users u ON w.user_id = u.id
GROUP BY e.id, e.name, u.id
HAVING COUNT(DISTINCT w.id) > 0;

-- Create unique index for exercise trends
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercise_performance_trends_unique 
ON exercise_performance_trends (exercise_id, user_id);

-- Enable RLS
ALTER TABLE user_analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read their own analytics cache"
  ON user_analytics_cache
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics cache"
  ON user_analytics_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics cache"
  ON user_analytics_cache
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own workout analytics"
  ON workout_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own exercise analytics"
  ON exercise_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own performance metrics"
  ON performance_metrics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_analytics_cache_updated_at ON user_analytics_cache(cache_updated_at);
CREATE INDEX IF NOT EXISTS idx_workout_analytics_user_id ON workout_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_analytics_created_at ON workout_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_exercise_analytics_user_id ON exercise_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_analytics_exercise_id ON exercise_analytics(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_analytics_updated_at ON exercise_analytics(updated_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type_date ON performance_metrics(user_id, metric_type, measurement_date);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at);

-- Function to Calculate User Analytics
CREATE OR REPLACE FUNCTION calculate_user_analytics(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  analytics_record record;
  streak_count integer := 0;
  longest_streak integer := 0;
BEGIN
  -- Calculate basic statistics
  SELECT 
    COUNT(DISTINCT w.id) as total_workouts,
    COUNT(DISTINCT we.exercise_id) as total_exercises,
    COUNT(ws.id) as total_sets,
    COALESCE(SUM(ws.actual_reps), 0) as total_reps,
    COALESCE(SUM(ws.actual_weight_kg * ws.actual_reps), 0) as total_volume,
    COALESCE(AVG(EXTRACT(EPOCH FROM (w.completed_at - w.started_at))/60), 0) as avg_duration,
    MAX(w.completed_at) as last_workout,
    COUNT(DISTINCT pr.id) as pr_count
  INTO analytics_record
  FROM workouts w
  LEFT JOIN workout_exercises we ON w.id = we.workout_id
  LEFT JOIN workout_sets ws ON we.id = ws.workout_exercise_id AND ws.is_completed = true
  LEFT JOIN personal_records pr ON pr.user_id = p_user_id
  WHERE w.user_id = p_user_id AND w.completed_at IS NOT NULL;
  
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
  SELECT COUNT(*) INTO streak_count
  FROM streak_calculation
  WHERE workout_date = expected_date;
  
  -- Calculate longest streak (simplified version)
  longest_streak := GREATEST(streak_count, 0);
  
  -- Get favorite exercises
  WITH exercise_frequency AS (
    SELECT 
      e.name,
      COUNT(*) as frequency
    FROM workouts w
    JOIN workout_exercises we ON w.id = we.workout_id
    JOIN exercises e ON we.exercise_id = e.id
    WHERE w.user_id = p_user_id AND w.completed_at IS NOT NULL
    GROUP BY e.id, e.name
    ORDER BY frequency DESC
    LIMIT 5
  )
  -- Update or insert analytics cache
  INSERT INTO user_analytics_cache (
    user_id,
    total_workouts,
    total_exercises,
    total_sets,
    total_reps,
    total_volume_kg,
    average_workout_duration,
    current_streak,
    longest_streak,
    personal_records_count,
    last_workout_date,
    favorite_exercises,
    cache_updated_at
  )
  SELECT 
    p_user_id,
    analytics_record.total_workouts,
    analytics_record.total_exercises,
    analytics_record.total_sets,
    analytics_record.total_reps,
    analytics_record.total_volume,
    analytics_record.avg_duration,
    streak_count,
    longest_streak,
    analytics_record.pr_count,
    analytics_record.last_workout,
    COALESCE(json_agg(json_build_object('name', ef.name, 'frequency', ef.frequency)), '[]'::json),
    now()
  FROM exercise_frequency ef
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_workouts = EXCLUDED.total_workouts,
    total_exercises = EXCLUDED.total_exercises,
    total_sets = EXCLUDED.total_sets,
    total_reps = EXCLUDED.total_reps,
    total_volume_kg = EXCLUDED.total_volume_kg,
    average_workout_duration = EXCLUDED.average_workout_duration,
    current_streak = EXCLUDED.current_streak,
    longest_streak = EXCLUDED.longest_streak,
    personal_records_count = EXCLUDED.personal_records_count,
    last_workout_date = EXCLUDED.last_workout_date,
    favorite_exercises = EXCLUDED.favorite_exercises,
    cache_updated_at = now();
END;
$$;

-- Function to Calculate Workout Analytics
CREATE OR REPLACE FUNCTION calculate_workout_analytics(p_workout_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  workout_record record;
  analytics_data jsonb;
BEGIN
  -- Get workout details
  SELECT 
    w.user_id,
    COUNT(DISTINCT we.exercise_id) as exercise_count,
    COUNT(ws.id) as set_count,
    COALESCE(SUM(ws.actual_reps), 0) as rep_count,
    COALESCE(SUM(ws.actual_weight_kg * ws.actual_reps), 0) as volume_kg,
    EXTRACT(EPOCH FROM (w.completed_at - w.started_at))/60 as duration_minutes,
    ARRAY_AGG(DISTINCT e.primary_muscle_group) FILTER (WHERE e.primary_muscle_group IS NOT NULL) as muscle_groups,
    ARRAY_AGG(DISTINCT e.category) FILTER (WHERE e.category IS NOT NULL) as categories
  INTO workout_record
  FROM workouts w
  LEFT JOIN workout_exercises we ON w.id = we.workout_id
  LEFT JOIN workout_sets ws ON we.id = ws.workout_exercise_id AND ws.is_completed = true
  LEFT JOIN exercises e ON we.exercise_id = e.id
  WHERE w.id = p_workout_id
  GROUP BY w.id, w.user_id, w.started_at, w.completed_at;
  
  -- Calculate intensity score (simplified)
  analytics_data := jsonb_build_object(
    'average_weight_per_set', CASE WHEN workout_record.set_count > 0 THEN workout_record.volume_kg / workout_record.set_count ELSE 0 END,
    'sets_per_exercise', CASE WHEN workout_record.exercise_count > 0 THEN workout_record.set_count::numeric / workout_record.exercise_count ELSE 0 END
  );
  
  -- Insert workout analytics
  INSERT INTO workout_analytics (
    workout_id,
    user_id,
    total_exercises,
    total_sets,
    total_reps,
    total_volume_kg,
    duration_minutes,
    intensity_score,
    muscle_groups_worked,
    exercise_categories,
    performance_metrics
  )
  VALUES (
    p_workout_id,
    workout_record.user_id,
    workout_record.exercise_count,
    workout_record.set_count,
    workout_record.rep_count,
    workout_record.volume_kg,
    workout_record.duration_minutes,
    LEAST(10, workout_record.volume_kg / NULLIF(workout_record.duration_minutes, 0) / 10), -- Simplified intensity
    workout_record.muscle_groups,
    workout_record.categories,
    analytics_data
  )
  ON CONFLICT (workout_id) DO UPDATE SET
    total_exercises = EXCLUDED.total_exercises,
    total_sets = EXCLUDED.total_sets,
    total_reps = EXCLUDED.total_reps,
    total_volume_kg = EXCLUDED.total_volume_kg,
    duration_minutes = EXCLUDED.duration_minutes,
    intensity_score = EXCLUDED.intensity_score,
    muscle_groups_worked = EXCLUDED.muscle_groups_worked,
    exercise_categories = EXCLUDED.exercise_categories,
    performance_metrics = EXCLUDED.performance_metrics;
END;
$$;

-- Function to Refresh Analytics Caches
CREATE OR REPLACE FUNCTION refresh_analytics_caches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Refresh materialized views
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_progress_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY exercise_performance_trends;
  
  -- Update analytics cache for users with recent activity
  PERFORM calculate_user_analytics(user_id)
  FROM user_analytics_cache
  WHERE cache_updated_at < now() - INTERVAL '1 hour'
     OR cache_updated_at IS NULL;
END;
$$;

-- Trigger to Calculate Analytics on Workout Completion
CREATE OR REPLACE FUNCTION trigger_calculate_workout_analytics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND (OLD.completed_at IS NULL OR OLD.completed_at != NEW.completed_at) THEN
    PERFORM calculate_workout_analytics(NEW.id);
    PERFORM calculate_user_analytics(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER calculate_analytics_on_workout_completion
  AFTER UPDATE ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_workout_analytics();

-- Schedule regular cache refresh (would be handled by a cron job in production)
-- This is a placeholder for the refresh schedule
COMMENT ON FUNCTION refresh_analytics_caches() IS 'Should be called periodically (e.g., every hour) to refresh analytics caches';
