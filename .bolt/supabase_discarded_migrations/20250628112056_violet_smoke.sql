/*
  # Seed Initial Data for Fitness App

  1. Sample Exercises
    - 17 exercises covering strength, cardio, and bodyweight movements
    - Includes muscle groups, equipment, difficulty levels
    - Demo images from Pexels for visual reference

  2. Sample Achievements
    - 10 achievements for workout milestones, consistency, and social features
    - Points system for gamification
    - JSON criteria for tracking progress

  3. Sample Workout Templates
    - 6 public workout templates for different training styles
    - Beginner to intermediate difficulty levels
    - Complete workout routines with exercises and sets/reps

  4. Workout Exercise Mappings
    - Links exercises to workout templates
    - Includes target sets, reps, rest periods
    - Proper ordering for workout flow
*/

-- Insert sample exercises
INSERT INTO exercises (name, description, instructions, muscle_groups, equipment, difficulty_level, exercise_type, demo_image_url) VALUES
-- Strength Training - Upper Body
('Bench Press', 'Classic chest exercise performed lying on a bench', 'Lie on bench, grip bar slightly wider than shoulders, lower to chest, press up', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['barbell', 'bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'),
('Pull-ups', 'Upper body pulling exercise using body weight', 'Hang from bar with overhand grip, pull body up until chin clears bar', ARRAY['back', 'biceps'], ARRAY['pull-up bar'], 'intermediate', 'strength', 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'),
('Overhead Press', 'Standing shoulder press with barbell or dumbbells', 'Stand with feet shoulder-width apart, press weight overhead', ARRAY['shoulders', 'triceps', 'core'], ARRAY['barbell', 'dumbbells'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'),
('Dumbbell Rows', 'Single-arm rowing exercise for back development', 'Bend over, row dumbbell to hip, squeeze shoulder blade', ARRAY['back', 'biceps'], ARRAY['dumbbells', 'bench'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg'),

-- Strength Training - Lower Body
('Squats', 'Fundamental lower body exercise', 'Stand with feet shoulder-width apart, lower hips back and down, return to standing', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['barbell', 'bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg'),
('Deadlifts', 'Hip hinge movement lifting weight from floor', 'Stand with feet hip-width apart, hinge at hips, lift weight by driving hips forward', ARRAY['hamstrings', 'glutes', 'back'], ARRAY['barbell', 'dumbbells'], 'advanced', 'strength', 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg'),
('Lunges', 'Single-leg exercise for lower body strength', 'Step forward, lower back knee toward ground, return to standing', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['dumbbells', 'bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/4164746/pexels-photo-4164746.jpeg'),
('Romanian Deadlifts', 'Hip hinge exercise targeting hamstrings', 'Hold weight, hinge at hips keeping legs relatively straight', ARRAY['hamstrings', 'glutes'], ARRAY['barbell', 'dumbbells'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'),

-- Bodyweight Exercises
('Push-ups', 'Classic bodyweight chest exercise', 'Start in plank position, lower chest to ground, push back up', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'),
('Burpees', 'Full-body explosive exercise', 'Squat down, jump back to plank, do push-up, jump feet forward, jump up', ARRAY['full body'], ARRAY['bodyweight'], 'intermediate', 'cardio', 'https://images.pexels.com/photos/4164746/pexels-photo-4164746.jpeg'),
('Mountain Climbers', 'Core and cardio exercise', 'Start in plank, alternate bringing knees to chest rapidly', ARRAY['core', 'shoulders'], ARRAY['bodyweight'], 'beginner', 'cardio', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg'),
('Plank', 'Isometric core strengthening exercise', 'Hold straight line from head to heels, engage core', ARRAY['core'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'),

-- Cardio Exercises
('Running', 'Cardiovascular exercise', 'Maintain steady pace, focus on breathing and form', ARRAY['legs', 'cardiovascular'], ARRAY['none'], 'beginner', 'cardio', 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg'),
('Cycling', 'Low-impact cardiovascular exercise', 'Maintain steady cadence, adjust resistance as needed', ARRAY['legs', 'cardiovascular'], ARRAY['bicycle'], 'beginner', 'cardio', 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg'),
('Jump Rope', 'High-intensity cardio exercise', 'Jump with both feet, maintain rhythm', ARRAY['legs', 'cardiovascular'], ARRAY['jump rope'], 'intermediate', 'cardio', 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'),

-- Core Exercises
('Crunches', 'Basic abdominal exercise', 'Lie on back, lift shoulders off ground, squeeze abs', ARRAY['core'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg'),
('Russian Twists', 'Rotational core exercise', 'Sit with knees bent, lean back slightly, rotate torso side to side', ARRAY['core'], ARRAY['bodyweight', 'medicine ball'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg');

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, category, criteria, points) VALUES
('First Workout', 'Complete your first workout session', 'trophy', 'workout', '{"type": "workout_count", "target": 1}', 10),
('Week Warrior', 'Complete 7 workouts in a week', 'calendar', 'consistency', '{"type": "weekly_workouts", "target": 7}', 50),
('Consistency King', 'Maintain a 14-day workout streak', 'zap', 'consistency', '{"type": "streak", "target": 14}', 100),
('Heavy Lifter', 'Lift a total of 10,000 lbs across all workouts', 'dumbbell', 'strength', '{"type": "total_weight", "target": 10000}', 150),
('Century Club', 'Complete 100 total workouts', 'target', 'workout', '{"type": "workout_count", "target": 100}', 200),
('Social Butterfly', 'Make 10 friends on the platform', 'users', 'social', '{"type": "friend_count", "target": 10}', 75),
('Goal Crusher', 'Set and achieve 5 personal records', 'medal', 'strength', '{"type": "personal_records", "target": 5}', 125),
('Cardio King', 'Complete 50 cardio workouts', 'heart', 'workout', '{"type": "cardio_workouts", "target": 50}', 100),
('Strength Master', 'Achieve advanced level in 3 different exercises', 'trophy', 'strength', '{"type": "advanced_exercises", "target": 3}', 300),
('Monthly Milestone', 'Complete 30 workouts in a month', 'calendar', 'consistency', '{"type": "monthly_workouts", "target": 30}', 150);

-- Insert sample workout templates
INSERT INTO workouts (creator_id, name, description, estimated_duration_minutes, difficulty_level, workout_type, is_template, is_public) VALUES
(NULL, 'Beginner Full Body', 'Perfect starter workout targeting all major muscle groups', 45, 'beginner', 'strength', true, true),
(NULL, 'Push Day', 'Upper body pushing muscles: chest, shoulders, triceps', 60, 'intermediate', 'strength', true, true),
(NULL, 'Pull Day', 'Upper body pulling muscles: back, biceps', 55, 'intermediate', 'strength', true, true),
(NULL, 'Leg Day', 'Complete lower body workout', 65, 'intermediate', 'strength', true, true),
(NULL, 'HIIT Cardio', 'High-intensity interval training for fat burning', 30, 'intermediate', 'cardio', true, true),
(NULL, 'Core Blast', 'Focused core strengthening routine', 25, 'beginner', 'strength', true, true);

-- Insert workout exercises for templates
-- Beginner Full Body (workout_id: 1)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, target_duration_seconds) VALUES
(1, 5, 1, 3, ARRAY[12, 12, 12], 90, NULL),  -- Squats
(1, 9, 2, 3, ARRAY[10, 10, 10], 60, NULL),  -- Push-ups
(1, 4, 3, 3, ARRAY[12, 12, 12], 90, NULL),  -- Dumbbell Rows
(1, 12, 4, 3, NULL, 60, 30), -- Plank (30 seconds per set)
(1, 7, 5, 3, ARRAY[10, 10, 10], 90, NULL);  -- Lunges

-- Push Day (workout_id: 2)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, target_duration_seconds) VALUES
(2, 1, 1, 4, ARRAY[8, 8, 6, 6], 120, NULL),   -- Bench Press
(2, 3, 2, 4, ARRAY[10, 10, 8, 8], 90, NULL),  -- Overhead Press
(2, 9, 3, 3, ARRAY[12, 12, 12], 60, NULL),    -- Push-ups
(2, 4, 4, 3, ARRAY[12, 12, 12], 90, NULL);    -- Dumbbell Rows (for balance)

-- Pull Day (workout_id: 3)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, target_duration_seconds) VALUES
(3, 2, 1, 4, ARRAY[6, 6, 5, 5], 120, NULL),   -- Pull-ups
(3, 4, 2, 4, ARRAY[12, 12, 10, 10], 90, NULL), -- Dumbbell Rows
(3, 8, 3, 3, ARRAY[12, 12, 12], 90, NULL);    -- Romanian Deadlifts

-- Leg Day (workout_id: 4)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, target_duration_seconds) VALUES
(4, 5, 1, 4, ARRAY[12, 12, 10, 10], 120, NULL), -- Squats
(4, 6, 2, 4, ARRAY[8, 8, 6, 6], 150, NULL),     -- Deadlifts
(4, 7, 3, 3, ARRAY[12, 12, 12], 90, NULL),      -- Lunges
(4, 8, 4, 3, ARRAY[15, 15, 15], 90, NULL);      -- Romanian Deadlifts

-- HIIT Cardio (workout_id: 5)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, target_duration_seconds) VALUES
(5, 10, 1, 4, NULL, 60, 30),  -- Burpees (30 seconds per set)
(5, 11, 2, 4, NULL, 60, 30),  -- Mountain Climbers (30 seconds per set)
(5, 15, 3, 4, NULL, 60, 30),  -- Jump Rope (30 seconds per set)
(5, 9, 4, 4, ARRAY[15, 15, 15, 15], 60, NULL);  -- Push-ups

-- Core Blast (workout_id: 6)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, target_duration_seconds) VALUES
(6, 12, 1, 3, NULL, 60, 45),   -- Plank (45 seconds per set)
(6, 16, 2, 3, ARRAY[20, 20, 20], 45, NULL), -- Crunches
(6, 17, 3, 3, ARRAY[30, 30, 30], 45, NULL), -- Russian Twists
(6, 11, 4, 3, NULL, 45, 30);   -- Mountain Climbers (30 seconds per set)
