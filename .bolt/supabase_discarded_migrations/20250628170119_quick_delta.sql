/*
  # Initial Database Setup

  1. New Tables
    - `exercises` - Exercise library with details
    - `achievements` - Achievement system
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  muscle_groups TEXT[] NOT NULL,
  equipment TEXT[],
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  exercise_type TEXT DEFAULT 'strength' CHECK (exercise_type IN ('strength', 'cardio', 'flexibility', 'balance')),
  demo_video_url TEXT,
  demo_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Create policy for exercises (public read access)
CREATE POLICY "Anyone can view exercises"
  ON exercises
  FOR SELECT
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups ON exercises USING gin (muscle_groups);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises USING btree (difficulty_level);
CREATE INDEX IF NOT EXISTS idx_exercises_type ON exercises USING btree (exercise_type);
CREATE INDEX IF NOT EXISTS idx_exercises_name_search ON exercises USING gin (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_exercises_description_search ON exercises USING gin (to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_exercises_equipment_gin ON exercises USING gin (equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups_gin ON exercises USING gin (muscle_groups);

-- Insert initial exercises
INSERT INTO exercises (name, description, instructions, muscle_groups, equipment, difficulty_level, exercise_type, demo_image_url) VALUES
-- Chest exercises
('Push-ups', 'Classic bodyweight chest exercise', 'Start in plank position, lower body to ground, push back up', ARRAY['chest', 'shoulders', 'triceps'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg'),
('Bench Press', 'Barbell chest press on bench', 'Lie on bench, lower bar to chest, press up', ARRAY['chest', 'shoulders', 'triceps'], ARRAY['barbell', 'bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'),
('Incline Dumbbell Press', 'Upper chest focused press', 'Press dumbbells on inclined bench', ARRAY['chest', 'shoulders'], ARRAY['dumbbells', 'incline bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'),
('Chest Dips', 'Bodyweight chest exercise on parallel bars', 'Lower body between bars, push back up', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['parallel bars'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg'),

-- Back exercises
('Pull-ups', 'Upper body pulling exercise', 'Hang from bar, pull body up until chin over bar', ARRAY['back', 'biceps'], ARRAY['pull-up bar'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg'),
('Deadlifts', 'Full body compound movement', 'Lift barbell from ground to hip level', ARRAY['back', 'glutes', 'hamstrings'], ARRAY['barbell'], 'advanced', 'strength', 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg'),
('Bent-over Rows', 'Back strengthening exercise', 'Bend over, pull weight to lower chest', ARRAY['back', 'biceps'], ARRAY['barbell'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'),
('Lat Pulldowns', 'Latissimus dorsi focused exercise', 'Pull bar down to upper chest', ARRAY['back', 'biceps'], ARRAY['cable machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg'),

-- Leg exercises
('Squats', 'Lower body compound exercise', 'Lower hips back and down, return to standing', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg'),
('Lunges', 'Single leg strengthening exercise', 'Step forward, lower back knee, return to start', ARRAY['quadriceps', 'glutes'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'),
('Romanian Deadlifts', 'Hamstring and glute focused exercise', 'Hinge at hips, lower weight, return to standing', ARRAY['hamstrings', 'glutes'], ARRAY['dumbbells'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg'),
('Calf Raises', 'Calf muscle strengthening', 'Rise up on toes, lower slowly', ARRAY['calves'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'),

-- Shoulder exercises
('Shoulder Press', 'Overhead pressing movement', 'Press weights overhead from shoulder level', ARRAY['shoulders', 'triceps'], ARRAY['dumbbells'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg'),
('Lateral Raises', 'Side deltoid isolation', 'Raise arms to sides until parallel to ground', ARRAY['shoulders'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg'),
('Front Raises', 'Front deltoid isolation', 'Raise arms forward until parallel to ground', ARRAY['shoulders'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'),

-- Arm exercises
('Bicep Curls', 'Bicep isolation exercise', 'Curl weights up to shoulders', ARRAY['biceps'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg'),
('Tricep Extensions', 'Tricep isolation exercise', 'Extend arms overhead', ARRAY['triceps'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'),
('Hammer Curls', 'Neutral grip bicep exercise', 'Curl with neutral wrist position', ARRAY['biceps', 'forearms'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg'),

-- Core exercises
('Plank', 'Core stability exercise', 'Hold straight body position', ARRAY['core'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg'),
('Crunches', 'Abdominal strengthening', 'Lift shoulders off ground', ARRAY['core'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'),
('Russian Twists', 'Oblique strengthening', 'Rotate torso side to side', ARRAY['core', 'obliques'], ARRAY['bodyweight'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg'),
('Mountain Climbers', 'Dynamic core exercise', 'Alternate bringing knees to chest in plank', ARRAY['core', 'shoulders'], ARRAY['bodyweight'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'),

-- Cardio exercises
('Running', 'Cardiovascular endurance exercise', 'Maintain steady pace for duration', ARRAY['legs', 'cardiovascular'], ARRAY['none'], 'beginner', 'cardio', 'https://images.pexels.com/photos/4164746/pexels-photo-4164746.jpeg'),
('Jumping Jacks', 'Full body cardio exercise', 'Jump while spreading legs and raising arms', ARRAY['full body', 'cardiovascular'], ARRAY['bodyweight'], 'beginner', 'cardio', 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'),
('Burpees', 'High intensity full body exercise', 'Squat, jump back to plank, jump forward, jump up', ARRAY['full body', 'cardiovascular'], ARRAY['bodyweight'], 'advanced', 'cardio', 'https://images.pexels.com/photos/4164746/pexels-photo-4164746.jpeg'),
('High Knees', 'Running in place with high knees', 'Run in place bringing knees to chest level', ARRAY['legs', 'cardiovascular'], ARRAY['bodyweight'], 'beginner', 'cardio', 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'),

-- Flexibility exercises
('Forward Fold', 'Hamstring and back stretch', 'Bend forward reaching toward toes', ARRAY['hamstrings', 'back'], ARRAY['bodyweight'], 'beginner', 'flexibility', 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg'),
('Pigeon Pose', 'Hip flexor stretch', 'Stretch hip flexors in seated position', ARRAY['hips', 'glutes'], ARRAY['bodyweight'], 'intermediate', 'flexibility', 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg'),
('Cat-Cow Stretch', 'Spinal mobility exercise', 'Alternate between arching and rounding spine', ARRAY['back', 'core'], ARRAY['bodyweight'], 'beginner', 'flexibility', 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg');

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT DEFAULT 'workout' CHECK (category IN ('workout', 'strength', 'endurance', 'consistency', 'social')),
  criteria JSONB NOT NULL,
  points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create policy for achievements (public read access)
CREATE POLICY "Anyone can view active achievements"
  ON achievements
  FOR SELECT
  TO public
  USING (is_active = true);

-- Insert initial achievements
INSERT INTO achievements (name, description, icon, category, criteria, points) VALUES
-- Workout achievements
('First Steps', 'Complete your first workout', 'trophy', 'workout', '{"type": "workout_count", "target": 1}', 10),
('Getting Started', 'Complete 5 workouts', 'trophy', 'workout', '{"type": "workout_count", "target": 5}', 25),
('Dedicated', 'Complete 10 workouts', 'trophy', 'workout', '{"type": "workout_count", "target": 10}', 50),
('Committed', 'Complete 25 workouts', 'trophy', 'workout', '{"type": "workout_count", "target": 25}', 100),
('Fitness Enthusiast', 'Complete 50 workouts', 'trophy', 'workout', '{"type": "workout_count", "target": 50}', 200),
('Workout Warrior', 'Complete 100 workouts', 'trophy', 'workout', '{"type": "workout_count", "target": 100}', 500),

-- Consistency achievements
('Streak Starter', 'Maintain a 3-day workout streak', 'zap', 'consistency', '{"type": "streak", "target": 3}', 15),
('Week Warrior', 'Maintain a 7-day workout streak', 'zap', 'consistency', '{"type": "streak", "target": 7}', 50),
('Consistency King', 'Maintain a 14-day workout streak', 'zap', 'consistency', '{"type": "streak", "target": 14}', 100),
('Unstoppable', 'Maintain a 30-day workout streak', 'zap', 'consistency', '{"type": "streak", "target": 30}', 300),

-- Weekly achievements
('Active Week', 'Complete 3 workouts in a week', 'calendar', 'consistency', '{"type": "weekly_workouts", "target": 3}', 30),
('Power Week', 'Complete 5 workouts in a week', 'calendar', 'consistency', '{"type": "weekly_workouts", "target": 5}', 75),
('Beast Mode Week', 'Complete 7 workouts in a week', 'calendar', 'consistency', '{"type": "weekly_workouts", "target": 7}', 150),

-- Monthly achievements
('Monthly Milestone', 'Complete 12 workouts in a month', 'target', 'consistency', '{"type": "monthly_workouts", "target": 12}', 100),
('Monthly Master', 'Complete 20 workouts in a month', 'target', 'consistency', '{"type": "monthly_workouts", "target": 20}', 200),

-- Strength achievements
('First PR', 'Set your first personal record', 'award', 'strength', '{"type": "personal_records", "target": 1}', 25),
('Record Breaker', 'Set 5 personal records', 'award', 'strength', '{"type": "personal_records", "target": 5}', 75),
('Strength Master', 'Set 10 personal records', 'award', 'strength', '{"type": "personal_records", "target": 10}', 150),
('PR Machine', 'Set 25 personal records', 'award', 'strength', '{"type": "personal_records", "target": 25}', 400),

-- Cardio achievements
('Cardio Starter', 'Complete 5 cardio workouts', 'zap', 'endurance', '{"type": "cardio_workouts", "target": 5}', 50),
('Cardio Enthusiast', 'Complete 15 cardio workouts', 'zap', 'endurance', '{"type": "cardio_workouts", "target": 15}', 100),
('Endurance Master', 'Complete 30 cardio workouts', 'zap', 'endurance', '{"type": "cardio_workouts", "target": 30}', 250);