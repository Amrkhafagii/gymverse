/*
  # Workout Sessions & Exercise Tracking Schema - Complete

  1. New Tables
    - `workout_sessions` - Core workout session tracking
    - `exercises` - Exercise library and definitions
    - `workout_exercises` - Exercises within a workout session
    - `exercise_sets` - Individual sets within exercises
    - `workout_templates` - Saved workout templates
    - `exercise_categories` - Exercise categorization

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Ensure data isolation between users

  3. Features
    - Complete workout session lifecycle tracking
    - Exercise library with categories and muscle groups
    - Set-by-set tracking with rest timers
    - Workout templates for quick session creation
    - Progress tracking and analytics support
*/

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS exercise_sets CASCADE;
DROP TABLE IF EXISTS workout_exercises CASCADE;
DROP TABLE IF EXISTS workout_sessions CASCADE;
DROP TABLE IF EXISTS workout_templates CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS exercise_categories CASCADE;

-- Exercise Categories
CREATE TABLE exercise_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Exercises Library
CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  instructions text,
  muscle_groups text[] DEFAULT ARRAY[]::text[],
  equipment text[] DEFAULT ARRAY[]::text[],
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category_id uuid REFERENCES exercise_categories(id),
  is_custom boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  image_url text,
  video_url text,
  tips text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workout Templates
CREATE TABLE workout_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  description text,
  category text,
  estimated_duration_minutes integer,
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_public boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workout Sessions
CREATE TABLE workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  notes text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_seconds integer DEFAULT 0,
  total_volume_kg numeric DEFAULT 0,
  total_sets integer DEFAULT 0,
  total_reps integer DEFAULT 0,
  calories_burned integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  template_id uuid REFERENCES workout_templates(id),
  location text,
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 5),
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workout Exercises (exercises within a workout session)
CREATE TABLE workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id uuid REFERENCES workout_sessions(id) ON DELETE CASCADE,
  template_id uuid REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id),
  order_index integer NOT NULL DEFAULT 0,
  target_sets integer,
  target_reps integer,
  target_weight_kg numeric,
  target_duration_seconds integer,
  rest_time_seconds integer DEFAULT 60,
  notes text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (
    (workout_session_id IS NOT NULL AND template_id IS NULL) OR
    (workout_session_id IS NULL AND template_id IS NOT NULL)
  )
);

-- Exercise Sets
CREATE TABLE exercise_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id uuid NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_number integer NOT NULL,
  reps integer,
  weight_kg numeric,
  duration_seconds integer,
  distance_meters numeric,
  rest_time_seconds integer,
  rpe integer CHECK (rpe >= 1 AND rpe <= 10),
  notes text,
  is_warmup boolean DEFAULT false,
  is_failure boolean DEFAULT false,
  is_drop_set boolean DEFAULT false,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_status ON workout_sessions(status);
CREATE INDEX idx_workout_sessions_completed_at ON workout_sessions(completed_at);
CREATE INDEX idx_workout_exercises_session_id ON workout_exercises(workout_session_id);
CREATE INDEX idx_workout_exercises_template_id ON workout_exercises(template_id);
CREATE INDEX idx_exercise_sets_workout_exercise_id ON exercise_sets(workout_exercise_id);
CREATE INDEX idx_exercises_category_id ON exercises(category_id);
CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);

-- Enable RLS
ALTER TABLE exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Exercise Categories (public read)
CREATE POLICY "Exercise categories are viewable by everyone"
  ON exercise_categories FOR SELECT
  TO authenticated
  USING (true);

-- Exercises (public read for non-custom, user write for custom)
CREATE POLICY "Public exercises are viewable by everyone"
  ON exercises FOR SELECT
  TO authenticated
  USING (NOT is_custom OR created_by = auth.uid());

CREATE POLICY "Users can create custom exercises"
  ON exercises FOR INSERT
  TO authenticated
  WITH CHECK (is_custom = true AND created_by = auth.uid());

CREATE POLICY "Users can update their custom exercises"
  ON exercises FOR UPDATE
  TO authenticated
  USING (is_custom = true AND created_by = auth.uid());

-- Workout Sessions
CREATE POLICY "Users can manage their own workout sessions"
  ON workout_sessions FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Workout Templates
CREATE POLICY "Users can view public templates and their own templates"
  ON workout_templates FOR SELECT
  TO authenticated
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can manage their own templates"
  ON workout_templates FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own templates"
  ON workout_templates FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own templates"
  ON workout_templates FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Workout Exercises
CREATE POLICY "Users can manage workout exercises in their sessions"
  ON workout_exercises FOR ALL
  TO authenticated
  USING (
    (workout_session_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE id = workout_exercises.workout_session_id 
      AND user_id = auth.uid()
    )) OR
    (template_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workout_templates 
      WHERE id = workout_exercises.template_id 
      AND user_id = auth.uid()
    ))
  )
  WITH CHECK (
    (workout_session_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE id = workout_exercises.workout_session_id 
      AND user_id = auth.uid()
    )) OR
    (template_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workout_templates 
      WHERE id = workout_exercises.template_id 
      AND user_id = auth.uid()
    ))
  );

-- Exercise Sets
CREATE POLICY "Users can manage sets in their workout exercises"
  ON exercise_sets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      LEFT JOIN workout_sessions ws ON we.workout_session_id = ws.id
      LEFT JOIN workout_templates wt ON we.template_id = wt.id
      WHERE we.id = exercise_sets.workout_exercise_id
      AND (ws.user_id = auth.uid() OR wt.user_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      LEFT JOIN workout_sessions ws ON we.workout_session_id = ws.id
      LEFT JOIN workout_templates wt ON we.template_id = wt.id
      WHERE we.id = exercise_sets.workout_exercise_id
      AND (ws.user_id = auth.uid() OR wt.user_id = auth.uid())
    )
  );

-- Insert default exercise categories
INSERT INTO exercise_categories (name, description, icon, color) VALUES
  ('Chest', 'Chest and pectoral exercises', 'muscle', '#EF4444'),
  ('Back', 'Back and latissimus exercises', 'muscle', '#10B981'),
  ('Shoulders', 'Shoulder and deltoid exercises', 'muscle', '#F59E0B'),
  ('Arms', 'Biceps, triceps, and arm exercises', 'muscle', '#8B5CF6'),
  ('Legs', 'Quadriceps, hamstrings, and leg exercises', 'muscle', '#3B82F6'),
  ('Core', 'Abdominal and core exercises', 'muscle', '#F97316'),
  ('Cardio', 'Cardiovascular and endurance exercises', 'heart', '#EC4899'),
  ('Full Body', 'Compound and full body exercises', 'body', '#6B7280');

-- Insert common exercises
INSERT INTO exercises (name, description, muscle_groups, equipment, difficulty_level, category_id) VALUES
  ('Push-ups', 'Classic bodyweight chest exercise', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['bodyweight'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Chest')),
  ('Bench Press', 'Barbell chest press exercise', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['barbell', 'bench'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Chest')),
  ('Pull-ups', 'Bodyweight back exercise', ARRAY['back', 'biceps'], ARRAY['pull-up bar'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Back')),
  ('Squats', 'Fundamental leg exercise', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['bodyweight'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Legs')),
  ('Deadlifts', 'Compound full body exercise', ARRAY['back', 'glutes', 'hamstrings', 'traps'], ARRAY['barbell'], 'advanced', (SELECT id FROM exercise_categories WHERE name = 'Full Body')),
  ('Plank', 'Core stability exercise', ARRAY['core', 'shoulders'], ARRAY['bodyweight'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Core'));
