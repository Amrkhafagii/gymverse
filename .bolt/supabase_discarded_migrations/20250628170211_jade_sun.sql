/*
  # Comprehensive Workout Templates

  1. New Data
    - Complete workout templates with exercises
    - Workout exercises with proper targeting
  2. Dependencies
    - Requires exercises from calm_shape.sql migration
    - References exercise IDs from the updated exercise table
*/

-- Insert comprehensive workout templates
INSERT INTO workouts (name, description, estimated_duration_minutes, difficulty_level, workout_type, is_template, is_public) VALUES
-- Beginner workouts
('Beginner Full Body', 'A complete full-body workout perfect for beginners', 30, 'beginner', 'strength', true, true),
('Beginner Cardio Blast', 'Low-impact cardio workout for beginners', 20, 'beginner', 'cardio', true, true),
('Morning Stretch', 'Gentle stretching routine to start your day', 15, 'beginner', 'flexibility', true, true),

-- Intermediate workouts
('Upper Body Power', 'Intense upper body strength training', 45, 'intermediate', 'strength', true, true),
('Lower Body Blast', 'Comprehensive lower body workout', 40, 'intermediate', 'strength', true, true),
('HIIT Cardio', 'High-intensity interval training', 25, 'intermediate', 'hiit', true, true),
('Core Crusher', 'Focused core strengthening workout', 30, 'intermediate', 'strength', true, true),

-- Advanced workouts
('Advanced Full Body', 'Challenging full-body workout for experienced athletes', 60, 'advanced', 'strength', true, true),
('Strength & Power', 'Heavy lifting focused on building strength', 50, 'advanced', 'strength', true, true),
('Endurance Challenge', 'Long-duration cardio endurance test', 45, 'advanced', 'cardio', true, true),
('Athletic Performance', 'Sport-specific training for athletes', 55, 'advanced', 'mixed', true, true);

-- Insert workout exercises for Beginner Full Body (workout_id will be 1)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes) VALUES
-- Beginner Full Body
(1, 1, 0, 3, ARRAY[8, 10, 12], 60, 'Start with knee push-ups if needed'),
(1, 9, 1, 3, ARRAY[10, 12, 15], 60, 'Focus on proper form'),
(1, 4, 2, 2, ARRAY[5, 8], 90, 'Use assistance if needed'),
(1, 16, 3, 3, ARRAY[12, 15, 15], 45, 'Control the movement'),
(1, 19, 4, 3, ARRAY[30, 45, 60], 60, 'Hold steady position'),

-- Beginner Cardio Blast
(2, 22, 0, 3, NULL, 60, NULL),
(2, 24, 1, 3, NULL, 45, NULL),
(2, 21, 2, 1, NULL, 0, 'Cool down pace'),

-- Morning Stretch
(3, 25, 0, 1, NULL, 30, 'Hold for 30 seconds'),
(3, 26, 1, 1, NULL, 30, 'Hold each side for 30 seconds'),
(3, 27, 2, 1, NULL, 30, 'Repeat 10 times slowly'),

-- Upper Body Power
(4, 2, 0, 4, ARRAY[6, 8, 10, 12], 90, 'Progressive overload'),
(4, 3, 1, 3, ARRAY[8, 10, 12], 75, 'Control the negative'),
(4, 5, 2, 3, ARRAY[6, 8, 10], 90, 'Full range of motion'),
(4, 6, 3, 4, ARRAY[5, 6, 8, 10], 120, 'Focus on form'),
(4, 13, 4, 3, ARRAY[8, 10, 12], 60, 'Slow and controlled'),
(4, 16, 5, 3, ARRAY[12, 15, 15], 45, 'Squeeze at the top'),
(4, 17, 6, 3, ARRAY[10, 12, 15], 45, 'Full extension'),

-- Lower Body Blast
(5, 9, 0, 4, ARRAY[12, 15, 18, 20], 75, 'Go deep'),
(5, 10, 1, 3, ARRAY[10, 12, 15], 60, 'Each leg'),
(5, 11, 2, 3, ARRAY[8, 10, 12], 75, 'Feel the stretch'),
(5, 12, 3, 4, ARRAY[15, 20, 25, 30], 45, 'Full range of motion'),
(5, 6, 4, 3, ARRAY[5, 6, 8], 120, 'Heavy weight'),

-- HIIT Cardio
(6, 23, 0, 4, NULL, 30, '30 seconds work, 30 seconds rest'),
(6, 22, 1, 4, NULL, 30, '30 seconds work, 30 seconds rest'),
(6, 24, 2, 4, NULL, 30, '30 seconds work, 30 seconds rest'),
(6, 20, 3, 3, NULL, 60, 'High intensity'),

-- Core Crusher
(7, 19, 0, 3, ARRAY[30, 45, 60], 45, 'Hold steady'),
(7, 20, 1, 3, ARRAY[15, 20, 25], 45, 'Control the movement'),
(7, 21, 2, 3, ARRAY[10, 15, 20], 45, 'Each side'),
(7, 22, 3, 3, NULL, 60, 'High knees'),
(7, 1, 4, 2, ARRAY[10, 15], 60, 'Slow and controlled'),

-- Advanced Full Body
(8, 6, 0, 5, ARRAY[3, 5, 5, 8, 10], 180, 'Heavy compound movement'),
(8, 2, 1, 4, ARRAY[5, 6, 8, 10], 120, 'Progressive sets'),
(8, 5, 2, 4, ARRAY[5, 6, 8, 10], 90, 'Strict form'),
(8, 9, 3, 4, ARRAY[15, 18, 20, 25], 90, 'Deep squats'),
(8, 13, 4, 3, ARRAY[6, 8, 10], 75, 'Heavy weight'),
(8, 19, 5, 3, ARRAY[60, 90, 120], 60, 'Extended holds'),

-- Strength & Power
(9, 6, 0, 5, ARRAY[1, 3, 5, 5, 8], 240, 'Max effort sets'),
(9, 2, 1, 5, ARRAY[3, 5, 5, 8, 10], 180, 'Heavy bench press'),
(9, 9, 2, 4, ARRAY[3, 5, 8, 10], 150, 'Back squats'),
(9, 13, 3, 4, ARRAY[5, 6, 8, 10], 120, 'Overhead press'),
(9, 7, 4, 3, ARRAY[5, 8, 10], 120, 'Bent-over rows'),

-- Endurance Challenge
(10, 21, 0, 1, NULL, 0, '30 minutes steady pace'),
(10, 22, 1, 5, NULL, 60, '2 minutes each set'),
(10, 24, 2, 3, NULL, 90, 'High intensity intervals'),

-- Athletic Performance
(11, 23, 0, 4, NULL, 45, 'Explosive movement'),
(11, 6, 1, 4, ARRAY[3, 5, 5, 8], 180, 'Power development'),
(11, 10, 2, 3, ARRAY[8, 10, 12], 60, 'Single leg power'),
(11, 22, 3, 4, NULL, 60, 'Agility component'),
(11, 13, 4, 3, ARRAY[5, 8, 10], 90, 'Overhead stability'),
(11, 19, 5, 3, ARRAY[45, 60, 90], 60, 'Core stability');

-- Set target duration for cardio exercises
UPDATE workout_exercises 
SET target_duration_seconds = 300, target_reps = NULL 
WHERE exercise_id IN (21, 22, 23, 24) AND target_reps IS NULL;

-- Set specific durations for HIIT exercises
UPDATE workout_exercises 
SET target_duration_seconds = 30 
WHERE workout_id = 6 AND exercise_id IN (22, 23, 24);

-- Set longer duration for endurance challenge
UPDATE workout_exercises 
SET target_duration_seconds = 1800 
WHERE workout_id = 10 AND exercise_id = 21;

UPDATE workout_exercises 
SET target_duration_seconds = 120 
WHERE workout_id = 10 AND exercise_id = 22;

UPDATE workout_exercises 
SET target_duration_seconds = 45 
WHERE workout_id = 10 AND exercise_id = 24;

-- Set durations for flexibility exercises
UPDATE workout_exercises 
SET target_duration_seconds = 30, target_reps = NULL 
WHERE exercise_id IN (25, 26, 27);

-- Set specific duration for cat-cow stretch
UPDATE workout_exercises 
SET target_duration_seconds = 60, target_reps = NULL 
WHERE exercise_id = 27;
