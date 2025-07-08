/*
  # Analytics & Performance Tracking Schema

  1. New Tables
    - `workout_analytics` - Detailed workout performance metrics
    - `exercise_analytics` - Exercise-specific performance tracking
    - `personal_records` - Personal record tracking and history
    - `performance_trends` - Calculated performance trends
    - `goal_tracking` - User goal setting and progress
    - `nutrition_logs` - Basic nutrition tracking
    - `sleep_logs` - Sleep quality and duration tracking
    - `recovery_metrics` - Recovery and readiness tracking

  2. Security
    - Enable RLS on all tables
    - Users can only access their own analytics data
    - Performance optimization for analytics queries

  3. Features
    - Comprehensive performance analytics
    - Personal record detection and tracking
    - Goal setting and achievement tracking
    - Trend analysis and insights
    - Health metric correlation
*/

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS recovery_metrics CASCADE;
DROP TABLE IF EXISTS sleep_logs CASCADE;
DROP TABLE IF EXISTS nutrition_logs CASCADE;
DROP TABLE IF EXISTS goal_tracking CASCADE;
DROP TABLE IF EXISTS performance_trends CASCADE;
DROP TABLE IF EXISTS personal_records CASCADE;
DROP TABLE IF EXISTS exercise_analytics CASCADE;
DROP TABLE IF EXISTS workout_analytics CASCADE;

-- Workout Analytics
CREATE TABLE workout_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  workout_session_id uuid NOT NULL REFERENCES workout_sessions(id),
  analysis_date timestamptz DEFAULT now(),
  total_volume_kg numeric DEFAULT 0,
  average_intensity numeric, -- 1-10 scale
  volume_load numeric, -- sets × reps × weight
  training_stress_score numeric,
  estimated_calories numeric,
  rest_efficiency_score numeric, -- How well rest times were followed
  form_consistency_score numeric, -- Based on rep timing consistency
  muscle_group_distribution jsonb DEFAULT '{}', -- Percentage per muscle group
  exercise_variety_score numeric,
  workout_efficiency_score numeric, -- Time vs volume ratio
  fatigue_indicators jsonb DEFAULT '{}',
  performance_metrics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Exercise Analytics
CREATE TABLE exercise_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  exercise_id uuid NOT NULL REFERENCES exercises(id),
  analysis_period text DEFAULT 'weekly' CHECK (analysis_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_sessions integer DEFAULT 0,
  total_sets integer DEFAULT 0,
  total_reps integer DEFAULT 0,
  total_volume_kg numeric DEFAULT 0,
  max_weight_kg numeric,
  average_weight_kg numeric,
  max_reps integer,
  average_reps numeric,
  volume_progression_rate numeric, -- Percentage change
  strength_progression_rate numeric,
  consistency_score numeric, -- How regularly performed
  form_improvement_score numeric,
  plateau_indicator boolean DEFAULT false,
  recommended_progression jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, exercise_id, analysis_period, period_start)
);

-- Personal Records
CREATE TABLE personal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  exercise_id uuid NOT NULL REFERENCES exercises(id),
  record_type text NOT NULL CHECK (record_type IN ('max_weight', 'max_reps', 'max_volume', 'max_distance', 'best_time', 'one_rep_max')),
  value numeric NOT NULL,
  unit text NOT NULL,
  reps integer, -- For weight-based records
  sets integer, -- For volume records
  workout_session_id uuid REFERENCES workout_sessions(id),
  exercise_set_id uuid REFERENCES exercise_sets(id),
  achieved_at timestamptz DEFAULT now(),
  previous_record_value numeric,
  improvement_percentage numeric,
  verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'self_verified', 'trainer_verified', 'video_verified')),
  notes text,
  celebration_viewed boolean DEFAULT false,
  is_current boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Performance Trends
CREATE TABLE performance_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  metric_type text NOT NULL CHECK (metric_type IN ('strength', 'endurance', 'volume', 'consistency', 'recovery')),
  trend_period text DEFAULT 'monthly' CHECK (trend_period IN ('weekly', 'monthly', 'quarterly')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  trend_direction text CHECK (trend_direction IN ('improving', 'declining', 'stable', 'fluctuating')),
  trend_strength numeric, -- -1 to 1, negative = declining, positive = improving
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 1),
  data_points integer,
  statistical_significance boolean DEFAULT false,
  trend_data jsonb DEFAULT '{}',
  insights text,
  recommendations text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, metric_type, trend_period, period_start)
);

-- Goal Tracking
CREATE TABLE goal_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  goal_type text NOT NULL CHECK (goal_type IN ('weight_loss', 'muscle_gain', 'strength', 'endurance', 'consistency', 'custom')),
  title text NOT NULL,
  description text,
  target_value numeric NOT NULL,
  current_value numeric DEFAULT 0,
  unit text NOT NULL,
  target_date date,
  start_date date DEFAULT CURRENT_DATE,
  category text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  progress_percentage numeric GENERATED ALWAYS AS (
    CASE 
      WHEN target_value > 0 THEN LEAST(100, (current_value / target_value) * 100)
      ELSE 0 
    END
  ) STORED,
  milestones jsonb DEFAULT '[]', -- Array of milestone objects
  tracking_frequency text DEFAULT 'weekly' CHECK (tracking_frequency IN ('daily', 'weekly', 'monthly')),
  last_updated timestamptz DEFAULT now(),
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Nutrition Logs (Basic)
CREATE TABLE nutrition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  log_date date DEFAULT CURRENT_DATE,
  meal_type text CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout')),
  food_item text NOT NULL,
  quantity numeric,
  unit text,
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  sugar_g numeric,
  sodium_mg numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Sleep Logs
CREATE TABLE sleep_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  sleep_date date DEFAULT CURRENT_DATE,
  bedtime timestamptz,
  wake_time timestamptz,
  duration_hours numeric,
  quality_rating integer CHECK (quality_rating >= 1 AND quality_rating <= 5),
  deep_sleep_hours numeric,
  rem_sleep_hours numeric,
  interruptions integer DEFAULT 0,
  sleep_efficiency numeric, -- Percentage of time in bed actually sleeping
  notes text,
  mood_on_waking integer CHECK (mood_on_waking >= 1 AND mood_on_waking <= 5),
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, sleep_date)
);

-- Recovery Metrics
CREATE TABLE recovery_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  measurement_date date DEFAULT CURRENT_DATE,
  resting_heart_rate integer,
  heart_rate_variability numeric,
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10),
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  muscle_soreness integer CHECK (muscle_soreness >= 1 AND muscle_soreness <= 10),
  motivation_level integer CHECK (motivation_level >= 1 AND motivation_level <= 10),
  recovery_score numeric, -- Calculated composite score
  readiness_to_train integer CHECK (readiness_to_train >= 1 AND readiness_to_train <= 10),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, measurement_date)
);

-- Indexes for performance
CREATE INDEX idx_workout_analytics_user_id ON workout_analytics(user_id);
CREATE INDEX idx_workout_analytics_session_id ON workout_analytics(workout_session_id);
CREATE INDEX idx_exercise_analytics_user_id ON exercise_analytics(user_id);
CREATE INDEX idx_exercise_analytics_exercise_id ON exercise_analytics(exercise_id);
CREATE INDEX idx_exercise_analytics_period ON exercise_analytics(period_start, period_end);
CREATE INDEX idx_personal_records_user_id ON personal_records(user_id);
CREATE INDEX idx_personal_records_exercise_id ON personal_records(exercise_id);
CREATE INDEX idx_personal_records_current ON personal_records(is_current);
CREATE INDEX idx_performance_trends_user_id ON performance_trends(user_id);
CREATE INDEX idx_performance_trends_period ON performance_trends(period_start, period_end);
CREATE INDEX idx_goal_tracking_user_id ON goal_tracking(user_id);
CREATE INDEX idx_goal_tracking_status ON goal_tracking(status);
CREATE INDEX idx_nutrition_logs_user_id ON nutrition_logs(user_id);
CREATE INDEX idx_nutrition_logs_date ON nutrition_logs(log_date);
CREATE INDEX idx_sleep_logs_user_id ON sleep_logs(user_id);
CREATE INDEX idx_sleep_logs_date ON sleep_logs(sleep_date);
CREATE INDEX idx_recovery_metrics_user_id ON recovery_metrics(user_id);
CREATE INDEX idx_recovery_metrics_date ON recovery_metrics(measurement_date);

-- Enable RLS
ALTER TABLE workout_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Workout Analytics
CREATE POLICY "Users can manage their own workout analytics"
  ON workout_analytics FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Exercise Analytics
CREATE POLICY "Users can manage their own exercise analytics"
  ON exercise_analytics FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Personal Records
CREATE POLICY "Users can manage their own personal records"
  ON personal_records FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Performance Trends
CREATE POLICY "Users can view their own performance trends"
  ON performance_trends FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert performance trends"
  ON performance_trends FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Goal Tracking
CREATE POLICY "Users can manage their own goals"
  ON goal_tracking FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Nutrition Logs
CREATE POLICY "Users can manage their own nutrition logs"
  ON nutrition_logs FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Sleep Logs
CREATE POLICY "Users can manage their own sleep logs"
  ON sleep_logs FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Recovery Metrics
CREATE POLICY "Users can manage their own recovery metrics"
  ON recovery_metrics FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to calculate one-rep max
CREATE OR REPLACE FUNCTION calculate_one_rep_max(weight numeric, reps integer)
RETURNS numeric AS $$
BEGIN
  -- Using Epley formula: 1RM = weight × (1 + reps/30)
  IF reps = 1 THEN
    RETURN weight;
  ELSIF reps > 0 AND reps <= 15 THEN
    RETURN weight * (1 + reps::numeric / 30);
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to detect personal records
CREATE OR REPLACE FUNCTION detect_personal_record()
RETURNS TRIGGER AS $$
DECLARE
  current_max numeric;
  one_rep_max numeric;
  session_user_id uuid;
  session_exercise_id uuid;
BEGIN
  -- Only process completed sets
  IF NEW.completed = true THEN
    -- Get user_id and exercise_id for this set
    SELECT ws.user_id, we.exercise_id 
    INTO session_user_id, session_exercise_id
    FROM workout_sessions ws
    JOIN workout_exercises we ON ws.id = we.workout_session_id
    WHERE we.id = NEW.workout_exercise_id;

    -- Check for max weight PR
    IF NEW.weight_kg IS NOT NULL AND NEW.reps IS NOT NULL THEN
      SELECT COALESCE(MAX(value), 0) INTO current_max
      FROM personal_records
      WHERE user_id = session_user_id
      AND exercise_id = session_exercise_id
      AND record_type = 'max_weight'
      AND personal_records.is_current = true;

      -- Insert new max weight record if this is a PR
      IF NEW.weight_kg > current_max THEN
        -- Mark previous records as not current
        UPDATE personal_records 
        SET is_current = false
        WHERE user_id = session_user_id
        AND exercise_id = session_exercise_id
        AND record_type = 'max_weight'
        AND personal_records.is_current = true;

        -- Insert new record
        INSERT INTO personal_records (
          user_id, exercise_id, record_type, value, unit, reps, 
          workout_session_id, exercise_set_id, previous_record_value,
          improvement_percentage, is_current
        )
        SELECT 
          session_user_id,
          session_exercise_id,
          'max_weight',
          NEW.weight_kg,
          'kg',
          NEW.reps,
          ws.id,
          NEW.id,
          current_max,
          CASE WHEN current_max > 0 THEN ((NEW.weight_kg - current_max) / current_max * 100) ELSE 100 END,
          true
        FROM workout_sessions ws
        JOIN workout_exercises we ON ws.id = we.workout_session_id
        WHERE we.id = NEW.workout_exercise_id;
      END IF;

      -- Calculate and check one-rep max
      one_rep_max := calculate_one_rep_max(NEW.weight_kg, NEW.reps);
      IF one_rep_max IS NOT NULL THEN
        SELECT COALESCE(MAX(value), 0) INTO current_max
        FROM personal_records
        WHERE user_id = session_user_id
        AND exercise_id = session_exercise_id
        AND record_type = 'one_rep_max'
        AND personal_records.is_current = true;

        IF one_rep_max > current_max THEN
          -- Mark previous one-rep max records as not current
          UPDATE personal_records 
          SET is_current = false
          WHERE user_id = session_user_id
          AND exercise_id = session_exercise_id
          AND record_type = 'one_rep_max'
          AND personal_records.is_current = true;

          -- Insert new one-rep max record
          INSERT INTO personal_records (
            user_id, exercise_id, record_type, value, unit, reps,
            workout_session_id, exercise_set_id, previous_record_value,
            improvement_percentage, is_current
          )
          SELECT 
            session_user_id,
            session_exercise_id,
            'one_rep_max',
            one_rep_max,
            'kg',
            NEW.reps,
            ws.id,
            NEW.id,
            current_max,
            CASE WHEN current_max > 0 THEN ((one_rep_max - current_max) / current_max * 100) ELSE 100 END,
            true
          FROM workout_sessions ws
          JOIN workout_exercises we ON ws.id = we.workout_session_id
          WHERE we.id = NEW.workout_exercise_id;
        END IF;
      END IF;
    END IF;

    -- Check for max reps PR (at same weight or bodyweight exercises)
    IF NEW.reps IS NOT NULL THEN
      SELECT COALESCE(MAX(reps), 0) INTO current_max
      FROM personal_records pr
      WHERE pr.user_id = session_user_id
      AND pr.exercise_id = session_exercise_id
      AND pr.record_type = 'max_reps'
      AND pr.is_current = true
      AND (NEW.weight_kg IS NULL OR pr.value = NEW.weight_kg);

      IF NEW.reps > current_max THEN
        -- Mark previous max reps records as not current
        UPDATE personal_records 
        SET is_current = false
        WHERE user_id = session_user_id
        AND exercise_id = session_exercise_id
        AND record_type = 'max_reps'
        AND personal_records.is_current = true;

        -- Insert new max reps record
        INSERT INTO personal_records (
          user_id, exercise_id, record_type, value, unit, reps,
          workout_session_id, exercise_set_id, previous_record_value,
          improvement_percentage, is_current
        )
        SELECT 
          session_user_id,
          session_exercise_id,
          'max_reps',
          COALESCE(NEW.weight_kg, 0),
          CASE WHEN NEW.weight_kg IS NOT NULL THEN 'kg' ELSE 'reps' END,
          NEW.reps,
          ws.id,
          NEW.id,
          current_max,
          CASE WHEN current_max > 0 THEN ((NEW.reps - current_max) / current_max * 100) ELSE 100 END,
          true
        FROM workout_sessions ws
        JOIN workout_exercises we ON ws.id = we.workout_session_id
        WHERE we.id = NEW.workout_exercise_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for personal record detection
DROP TRIGGER IF EXISTS detect_personal_record_trigger ON exercise_sets;
CREATE TRIGGER detect_personal_record_trigger
  AFTER INSERT OR UPDATE ON exercise_sets
  FOR EACH ROW
  EXECUTE FUNCTION detect_personal_record();

-- Function to update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS void AS $$
DECLARE
  goal_record RECORD;
  new_progress numeric;
BEGIN
  -- Update strength goals based on personal records
  FOR goal_record IN 
    SELECT * FROM goal_tracking 
    WHERE status = 'active' AND goal_type = 'strength'
  LOOP
    SELECT COALESCE(MAX(value), 0) INTO new_progress
    FROM personal_records
    WHERE user_id = goal_record.user_id
    AND record_type = 'one_rep_max'
    AND is_current = true;

    UPDATE goal_tracking 
    SET current_value = new_progress, 
        last_updated = now(),
        status = CASE WHEN new_progress >= target_value THEN 'completed' ELSE 'active' END,
        completed_at = CASE WHEN new_progress >= target_value THEN now() ELSE NULL END
    WHERE id = goal_record.id;
  END LOOP;

  -- Update consistency goals based on workout frequency
  FOR goal_record IN 
    SELECT * FROM goal_tracking 
    WHERE status = 'active' AND goal_type = 'consistency'
  LOOP
    SELECT COUNT(*) INTO new_progress
    FROM workout_sessions
    WHERE user_id = goal_record.user_id
    AND status = 'completed'
    AND completed_at >= goal_record.start_date;

    UPDATE goal_tracking 
    SET current_value = new_progress, 
        last_updated = now(),
        status = CASE WHEN new_progress >= target_value THEN 'completed' ELSE 'active' END,
        completed_at = CASE WHEN new_progress >= target_value THEN now() ELSE NULL END
    WHERE id = goal_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;