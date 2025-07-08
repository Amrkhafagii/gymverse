/*
  # Measurements & Body Tracking Schema

  1. New Tables
    - `measurement_types` - Available measurement categories
    - `user_measurements` - User's body measurements over time
    - `measurement_goals` - User's measurement targets
    - `body_composition` - Body fat, muscle mass tracking
    - `measurement_photos` - Progress photos linked to measurements

  2. Security
    - Enable RLS on all tables
    - Users can only access their own measurement data
    - Measurement types are publicly readable

  3. Features
    - Comprehensive body measurement tracking
    - Progress visualization and trend analysis
    - Goal setting and achievement tracking
    - Photo documentation integration
*/

-- Measurement Types
CREATE TABLE IF NOT EXISTS measurement_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('body', 'circumference', 'composition', 'performance')),
  unit text NOT NULL,
  description text,
  icon text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- User Measurements
CREATE TABLE IF NOT EXISTS user_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  measurement_type_id uuid REFERENCES measurement_types(id) NOT NULL,
  value numeric NOT NULL,
  measured_at timestamptz DEFAULT now(),
  notes text,
  photo_url text,
  is_estimated boolean DEFAULT false,
  measurement_context text, -- 'morning', 'evening', 'post_workout', etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Measurement Goals
CREATE TABLE IF NOT EXISTS measurement_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  measurement_type_id uuid REFERENCES measurement_types(id) NOT NULL,
  target_value numeric NOT NULL,
  current_value numeric,
  start_value numeric,
  target_date date,
  goal_type text DEFAULT 'target' CHECK (goal_type IN ('target', 'maintain', 'range')),
  min_value numeric, -- For range goals
  max_value numeric, -- For range goals
  is_active boolean DEFAULT true,
  achieved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, measurement_type_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Body Composition
CREATE TABLE IF NOT EXISTS body_composition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  measured_at timestamptz DEFAULT now(),
  body_fat_percentage numeric,
  muscle_mass_kg numeric,
  bone_mass_kg numeric,
  water_percentage numeric,
  visceral_fat_level integer,
  metabolic_age integer,
  bmr_calories integer, -- Basal Metabolic Rate
  measurement_method text CHECK (measurement_method IN ('bioelectrical_impedance', 'dexa_scan', 'bod_pod', 'calipers', 'visual_estimate')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Measurement Photos
CREATE TABLE IF NOT EXISTS measurement_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  photo_url text NOT NULL,
  photo_type text DEFAULT 'progress' CHECK (photo_type IN ('progress', 'before', 'after', 'comparison')),
  angle text CHECK (angle IN ('front', 'side', 'back', 'custom')),
  measurement_date date DEFAULT CURRENT_DATE,
  associated_measurements uuid[], -- Array of measurement IDs
  tags text[] DEFAULT '{}',
  notes text,
  is_private boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_measurements_user_id ON user_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_measurements_type_id ON user_measurements(measurement_type_id);
CREATE INDEX IF NOT EXISTS idx_user_measurements_measured_at ON user_measurements(measured_at);
CREATE INDEX IF NOT EXISTS idx_measurement_goals_user_id ON measurement_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_measurement_goals_active ON measurement_goals(is_active);
CREATE INDEX IF NOT EXISTS idx_body_composition_user_id ON body_composition(user_id);
CREATE INDEX IF NOT EXISTS idx_body_composition_measured_at ON body_composition(measured_at);
CREATE INDEX IF NOT EXISTS idx_measurement_photos_user_id ON measurement_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_measurement_photos_date ON measurement_photos(measurement_date);

-- Enable RLS
ALTER TABLE measurement_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_composition ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Measurement Types (public read)
CREATE POLICY "Measurement types are viewable by everyone"
  ON measurement_types FOR SELECT
  TO authenticated
  USING (is_active = true);

-- User Measurements
CREATE POLICY "Users can manage their own measurements"
  ON user_measurements FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Measurement Goals
CREATE POLICY "Users can manage their own measurement goals"
  ON measurement_goals FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Body Composition
CREATE POLICY "Users can manage their own body composition data"
  ON body_composition FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Measurement Photos
CREATE POLICY "Users can manage their own measurement photos"
  ON measurement_photos FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Insert default measurement types
INSERT INTO measurement_types (name, display_name, category, unit, description, icon, sort_order) VALUES
  ('weight', 'Weight', 'body', 'kg', 'Total body weight', 'scale', 1),
  ('height', 'Height', 'body', 'cm', 'Total height', 'ruler', 2),
  ('body_fat', 'Body Fat %', 'composition', '%', 'Body fat percentage', 'percent', 3),
  ('muscle_mass', 'Muscle Mass', 'composition', 'kg', 'Total muscle mass', 'muscle', 4),
  ('chest', 'Chest', 'circumference', 'cm', 'Chest circumference', 'circle', 5),
  ('waist', 'Waist', 'circumference', 'cm', 'Waist circumference', 'circle', 6),
  ('hips', 'Hips', 'circumference', 'cm', 'Hip circumference', 'circle', 7),
  ('bicep_left', 'Left Bicep', 'circumference', 'cm', 'Left bicep circumference', 'circle', 8),
  ('bicep_right', 'Right Bicep', 'circumference', 'cm', 'Right bicep circumference', 'circle', 9),
  ('thigh_left', 'Left Thigh', 'circumference', 'cm', 'Left thigh circumference', 'circle', 10),
  ('thigh_right', 'Right Thigh', 'circumference', 'cm', 'Right thigh circumference', 'circle', 11),
  ('neck', 'Neck', 'circumference', 'cm', 'Neck circumference', 'circle', 12),
  ('forearm_left', 'Left Forearm', 'circumference', 'cm', 'Left forearm circumference', 'circle', 13),
  ('forearm_right', 'Right Forearm', 'circumference', 'cm', 'Right forearm circumference', 'circle', 14),
  ('calf_left', 'Left Calf', 'circumference', 'cm', 'Left calf circumference', 'circle', 15),
  ('calf_right', 'Right Calf', 'circumference', 'cm', 'Right calf circumference', 'circle', 16)
ON CONFLICT (name) DO NOTHING;
