/*
  # Create body measurements table
  
  1. New Tables
    - `body_measurements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `measurement_date` (date)
      - `weight` (decimal, optional)
      - `body_fat_percentage` (decimal, optional)
      - `muscle_mass` (decimal, optional)
      - `chest` (decimal, optional)
      - `waist` (decimal, optional)
      - `hips` (decimal, optional)
      - `bicep_left` (decimal, optional)
      - `bicep_right` (decimal, optional)
      - `thigh_left` (decimal, optional)
      - `thigh_right` (decimal, optional)
      - `neck` (decimal, optional)
      - `forearm_left` (decimal, optional)
      - `forearm_right` (decimal, optional)
      - `calf_left` (decimal, optional)
      - `calf_right` (decimal, optional)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `body_measurements` table
    - Add policies for authenticated users to manage their own measurements
*/

CREATE TABLE IF NOT EXISTS body_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  measurement_date date NOT NULL DEFAULT CURRENT_DATE,
  weight decimal(5,2),
  body_fat_percentage decimal(4,1),
  muscle_mass decimal(5,2),
  chest decimal(5,1),
  waist decimal(5,1),
  hips decimal(5,1),
  bicep_left decimal(4,1),
  bicep_right decimal(4,1),
  thigh_left decimal(5,1),
  thigh_right decimal(5,1),
  neck decimal(4,1),
  forearm_left decimal(4,1),
  forearm_right decimal(4,1),
  calf_left decimal(4,1),
  calf_right decimal(4,1),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own measurements" ON body_measurements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own measurements" ON body_measurements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own measurements" ON body_measurements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own measurements" ON body_measurements
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS body_measurements_user_id_idx ON body_measurements(user_id);
CREATE INDEX IF NOT EXISTS body_measurements_date_idx ON body_measurements(measurement_date DESC);
CREATE INDEX IF NOT EXISTS body_measurements_user_date_idx ON body_measurements(user_id, measurement_date DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_body_measurements_updated_at 
  BEFORE UPDATE ON body_measurements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();