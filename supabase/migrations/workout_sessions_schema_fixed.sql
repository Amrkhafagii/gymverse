/*
  # Workout Sessions & Exercise Tracking Schema - Fixed

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

-- Exercise Categories
CREATE TABLE IF NOT EXISTS exercise_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Exercises Library
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  instructions text,
  muscle_groups text[] DEFAULT ARRAY[]::text[],
  equipment text[] DEFAULT ARRAY[]::text[],
  difficulty_level text DEFAULT 'beginner',
  category_id uuid,
  is_custom boolean DEFAULT false,
  created_by uuid,
  image_url text,
  video_url text,
  tips text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workout Templates
CREATE TABLE IF NOT EXISTS workout_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category text,
  estimated_duration_minutes integer,
  difficulty_level text DEFAULT 'beginner',
  is_public boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workout Sessions
CREATE TABLE IF NOT EXISTS workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  notes text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_seconds integer DEFAULT 0,
  total_volume_kg numeric DEFAULT 0,
  total_sets integer DEFAULT 0,
  total_reps integer DEFAULT 0,
  calories_burned integer DEFAULT 0,
  status text DEFAULT 'active',
  template_id uuid,
  location text,
  mood_rating integer,
  energy_level integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workout Exercises (exercises within a workout session)
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id uuid,
  template_id uuid,
  exercise_id uuid NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  target_sets integer,
  target_reps integer,
  target_weight_kg numeric,
  target_duration_seconds integer,
  rest_time_seconds integer DEFAULT 60,
  notes text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Exercise Sets
CREATE TABLE IF NOT EXISTS exercise_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id uuid NOT NULL,
  set_number integer NOT NULL,
  reps integer,
  weight_kg numeric,
  duration_seconds integer,
  distance_meters numeric,
  rest_time_seconds integer,
  rpe integer,
  notes text,
  is_warmup boolean DEFAULT false,
  is_failure boolean DEFAULT false,
  is_drop_set boolean DEFAULT false,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraints one by one with proper checks
-- Exercises constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'exercises_difficulty_level_check' 
    AND table_name = 'exercises'
  ) THEN
    ALTER TABLE exercises ADD CONSTRAINT exercises_difficulty_level_check 
    CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));
  END IF;
END $$;

-- Workout Templates constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'workout_templates_difficulty_level_check' 
    AND table_name = 'workout_templates'
  ) THEN
    ALTER TABLE workout_templates ADD CONSTRAINT workout_templates_difficulty_level_check 
    CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));
  END IF;
END $$;

-- Workout Sessions constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'workout_sessions_status_check' 
    AND table_name = 'workout_sessions'
  ) THEN
    ALTER TABLE workout_sessions ADD CONSTRAINT workout_sessions_status_check 
    CHECK (status IN ('active', 'paused', 'completed', 'cancelled'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'workout_sessions_mood_rating_check' 
    AND table_name = 'workout_sessions'
  ) THEN
    ALTER TABLE workout_sessions ADD CONSTRAINT workout_sessions_mood_rating_check 
    CHECK (mood_rating >= 1 AND mood_rating <= 5);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'workout_sessions_energy_level_check' 
    AND table_name = 'workout_sessions'
  ) THEN
    ALTER TABLE workout_sessions ADD CONSTRAINT workout_sessions_energy_level_check 
    CHECK (energy_level >= 1 AND energy_level <= 5);
  END IF;
END $$;

-- Exercise Sets constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'exercise_sets_rpe_check' 
    AND table_name = 'exercise_sets'
  ) THEN
    ALTER TABLE exercise_sets ADD CONSTRAINT exercise_sets_rpe_check 
    CHECK (rpe >= 1 AND rpe <= 10);
  END IF;
END $$;

-- Workout Exercises constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'workout_or_template_check' 
    AND table_name = 'workout_exercises'
  ) THEN
    ALTER TABLE workout_exercises ADD CONSTRAINT workout_or_template_check 
    CHECK (
      (workout_session_id IS NOT NULL AND template_id IS NULL) OR
      (workout_session_id IS NULL AND template_id IS NOT NULL)
    );
  END IF;
END $$;

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'exercises_category_id_fkey' 
    AND table_name = 'exercises'
  ) THEN
    ALTER TABLE exercises ADD CONSTRAINT exercises_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES exercise_categories(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'exercises_created_by_fkey' 
    AND table_name = 'exercises'
  ) THEN
    ALTER TABLE exercises ADD CONSTRAINT exercises_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'workout_templates_user_id_fkey' 
    AND table_name = 'workout_templates'
  ) THEN
    ALTER TABLE workout_templates ADD CONSTRAINT workout_templates_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'workout_sessions_user_id_fkey' 
    AND table_name = 'workout_sessions'
  ) THEN
    ALTER TABLE workout_sessions ADD CONSTRAINT workout_sessions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'workout_exercises_workout_session_id_fkey' 
    AND table_name = 'workout_exercises'
  ) THEN
    ALTER TABLE workout_exercises ADD CONSTRAINT workout_exercises_workout_session_id_fkey 
    FOREIGN KEY (workout_session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'workout_exercises_template_id_fkey' 
    AND table_name = 'workout_exercises'
  ) THEN
    ALTER TABLE workout_exercises ADD CONSTRAINT workout_exercises_template_id_fkey 
    FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'workout_exercises_exercise_id_fkey' 
    AND table_name = 'workout_exercises'
  ) THEN
    ALTER TABLE workout_exercises ADD CONSTRAINT workout_exercises_exercise_id_fkey 
    FOREIGN KEY (exercise_id) REFERENCES exercises(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'exercise_sets_workout_exercise_id_fkey' 
    AND table_name = 'exercise_sets'
  ) THEN
    ALTER TABLE exercise_sets ADD CONSTRAINT exercise_sets_workout_exercise_id_fkey 
    FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_status ON workout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_completed_at ON workout_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_session_id ON workout_exercises(workout_session_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_template_id ON workout_exercises(template_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_workout_exercise_id ON exercise_sets(workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercises_category_id ON exercises(category_id);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);

-- Enable RLS
ALTER TABLE exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Exercise Categories (public read)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Exercise categories are viewable by everyone' 
    AND tablename = 'exercise_categories'
  ) THEN
    CREATE POLICY "Exercise categories are viewable by everyone"
      ON exercise_categories FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Exercises (public read for non-custom, user write for custom)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Public exercises are viewable by everyone' 
    AND tablename = 'exercises'
  ) THEN
    CREATE POLICY "Public exercises are viewable by everyone"
      ON exercises FOR SELECT
      TO authenticated
      USING (NOT is_custom OR created_by = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can create custom exercises' 
    AND tablename = 'exercises'
  ) THEN
    CREATE POLICY "Users can create custom exercises"
      ON exercises FOR INSERT
      TO authenticated
      WITH CHECK (is_custom = true AND created_by = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can update their custom exercises' 
    AND tablename = 'exercises'
  ) THEN
    CREATE POLICY "Users can update their custom exercises"
      ON exercises FOR UPDATE
      TO authenticated
      USING (is_custom = true AND created_by = auth.uid());
  END IF;
END $$;

-- Workout Sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can manage their own workout sessions' 
    AND tablename = 'workout_sessions'
  ) THEN
    CREATE POLICY "Users can manage their own workout sessions"
      ON workout_sessions FOR ALL
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Workout Templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view public templates and their own templates' 
    AND tablename = 'workout_templates'
  ) THEN
    CREATE POLICY "Users can view public templates and their own templates"
      ON workout_templates FOR SELECT
      TO authenticated
      USING (is_public = true OR user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can manage their own templates' 
    AND tablename = 'workout_templates'
  ) THEN
    CREATE POLICY "Users can manage their own templates"
      ON workout_templates FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can update their own templates' 
    AND tablename = 'workout_templates'
  ) THEN
    CREATE POLICY "Users can update their own templates"
      ON workout_templates FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can delete their own templates' 
    AND tablename = 'workout_templates'
  ) THEN
    CREATE POLICY "Users can delete their own templates"
      ON workout_templates FOR DELETE
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Workout Exercises
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can manage workout exercises in their sessions' 
    AND tablename = 'workout_exercises'
  ) THEN
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
  END IF;
END $$;

-- Exercise Sets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can manage sets in their workout exercises' 
    AND tablename = 'exercise_sets'
  ) THEN
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
  END IF;
END $$;

-- Insert default exercise categories
INSERT INTO exercise_categories (name, description, icon, color) VALUES
  ('Chest', 'Chest and pectoral exercises', 'muscle', '#EF4444'),
  ('Back', 'Back and latissimus exercises', 'muscle', '#10B981'),
  ('Shoulders', 'Shoulder and deltoid exercises', 'muscle', '#F59E0B'),
  ('Arms', 'Biceps, triceps, and arm exercises', 'muscle', '#8B5CF6'),
  ('Legs', 'Quadriceps, hamstrings, and leg exercises', 'muscle', '#3B82F6'),
  ('Core', 'Abdominal and core exercises', 'muscle', '#F97316'),
  ('Cardio', 'Cardiovascular and endurance exercises', 'heart', '#EC4899'),
  ('Full Body', 'Compound and full body exercises', 'body', '#6B7280')
ON CONFLICT DO NOTHING;

-- Insert common exercises
INSERT INTO exercises (name, description, muscle_groups, equipment, difficulty_level, category_id) VALUES
  ('Push-ups', 'Classic bodyweight chest exercise', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['bodyweight'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Chest')),
  ('Bench Press', 'Barbell chest press exercise', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['barbell', 'bench'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Chest')),
  ('Pull-ups', 'Bodyweight back exercise', ARRAY['back', 'biceps'], ARRAY['pull-up bar'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Back')),
  ('Squats', 'Fundamental leg exercise', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['bodyweight'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Legs')),
  ('Deadlifts', 'Compound full body exercise', ARRAY['back', 'glutes', 'hamstrings', 'traps'], ARRAY['barbell'], 'advanced', (SELECT id FROM exercise_categories WHERE name = 'Full Body')),
  ('Plank', 'Core stability exercise', ARRAY['core', 'shoulders'], ARRAY['bodyweight'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Core'))
ON CONFLICT DO NOTHING;
