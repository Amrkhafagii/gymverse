/*
  # Comprehensive Workout Templates

  1. New Workout Templates
    - 20+ professional workout templates
    - Each template has 8-12 exercises
    - Covers all workout types: strength, cardio, HIIT, flexibility, mixed
    - Multiple difficulty levels: beginner, intermediate, advanced
    - Proper exercise progression and muscle group targeting

  2. Template Categories
    - Full Body Workouts (3 templates)
    - Upper Body Workouts (3 templates) 
    - Lower Body Workouts (3 templates)
    - Push/Pull/Legs Split (3 templates)
    - Cardio Workouts (3 templates)
    - HIIT Workouts (3 templates)
    - Flexibility/Yoga (2 templates)

  3. Exercise Programming
    - Proper set/rep schemes for each exercise type
    - Appropriate rest periods
    - Progressive difficulty
    - Balanced muscle group targeting
*/

-- Clear existing workout templates and exercises
DELETE FROM workout_exercises WHERE workout_id IN (SELECT id FROM workouts WHERE is_template = true);
DELETE FROM workouts WHERE is_template = true;

-- Insert comprehensive workout templates
INSERT INTO workouts (creator_id, name, description, estimated_duration_minutes, difficulty_level, workout_type, is_template, is_public) VALUES

-- FULL BODY WORKOUTS
(NULL, 'Beginner Full Body', 'Perfect starter workout targeting all major muscle groups with bodyweight and basic exercises', 45, 'beginner', 'strength', true, true),
(NULL, 'Intermediate Full Body', 'Balanced full-body workout combining compound movements with isolation exercises', 60, 'intermediate', 'strength', true, true),
(NULL, 'Advanced Full Body', 'Intense full-body session with complex movements and heavy compound lifts', 75, 'advanced', 'strength', true, true),

-- UPPER BODY WORKOUTS
(NULL, 'Upper Body Power', 'Focus on chest, back, shoulders, and arms with compound movements', 50, 'intermediate', 'strength', true, true),
(NULL, 'Push Day Blast', 'Chest, shoulders, and triceps focused workout for maximum upper body development', 55, 'intermediate', 'strength', true, true),
(NULL, 'Pull Day Strength', 'Back and biceps focused workout for building pulling strength and muscle', 55, 'intermediate', 'strength', true, true),

-- LOWER BODY WORKOUTS
(NULL, 'Leg Day Foundation', 'Complete lower body workout targeting quads, hamstrings, glutes, and calves', 60, 'intermediate', 'strength', true, true),
(NULL, 'Glute Builder', 'Specialized workout for building strong, powerful glutes and posterior chain', 50, 'beginner', 'strength', true, true),
(NULL, 'Lower Body Power', 'Explosive lower body workout combining strength and power movements', 65, 'advanced', 'strength', true, true),

-- PUSH/PULL/LEGS SPLIT
(NULL, 'PPL Push Session', 'Dedicated push day focusing on chest, shoulders, and triceps development', 60, 'intermediate', 'strength', true, true),
(NULL, 'PPL Pull Session', 'Comprehensive pull day targeting back, rear delts, and biceps', 60, 'intermediate', 'strength', true, true),
(NULL, 'PPL Leg Session', 'Complete leg day covering quads, hamstrings, glutes, and calves', 70, 'intermediate', 'strength', true, true),

-- CARDIO WORKOUTS
(NULL, 'Cardio Blast', 'High-intensity cardio workout to improve cardiovascular fitness and burn calories', 30, 'beginner', 'cardio', true, true),
(NULL, 'Endurance Builder', 'Moderate-intensity cardio session for building aerobic capacity', 45, 'intermediate', 'cardio', true, true),
(NULL, 'Cardio Challenge', 'Advanced cardio workout combining different movement patterns and intensities', 40, 'advanced', 'cardio', true, true),

-- HIIT WORKOUTS
(NULL, 'HIIT Beginner', 'Introduction to high-intensity interval training with bodyweight exercises', 25, 'beginner', 'hiit', true, true),
(NULL, 'HIIT Metabolic', 'Fat-burning HIIT workout combining strength and cardio movements', 30, 'intermediate', 'hiit', true, true),
(NULL, 'HIIT Elite', 'Advanced high-intensity workout for maximum calorie burn and conditioning', 35, 'advanced', 'hiit', true, true),

-- FLEXIBILITY WORKOUTS
(NULL, 'Morning Mobility', 'Gentle morning routine to improve flexibility and prepare for the day', 20, 'beginner', 'flexibility', true, true),
(NULL, 'Deep Stretch Flow', 'Comprehensive stretching routine for improved flexibility and recovery', 30, 'intermediate', 'flexibility', true, true),

-- MIXED WORKOUTS
(NULL, 'Athletic Performance', 'Sport-specific training combining strength, power, and agility', 55, 'advanced', 'mixed', true, true),
(NULL, 'Functional Fitness', 'Real-world movement patterns for everyday strength and mobility', 50, 'intermediate', 'mixed', true, true);

-- Get workout IDs for exercise insertion
DO $$
DECLARE
    beginner_full_body_id INT;
    intermediate_full_body_id INT;
    advanced_full_body_id INT;
    upper_body_power_id INT;
    push_day_id INT;
    pull_day_id INT;
    leg_day_foundation_id INT;
    glute_builder_id INT;
    lower_body_power_id INT;
    ppl_push_id INT;
    ppl_pull_id INT;
    ppl_legs_id INT;
    cardio_blast_id INT;
    endurance_builder_id INT;
    cardio_challenge_id INT;
    hiit_beginner_id INT;
    hiit_metabolic_id INT;
    hiit_elite_id INT;
    morning_mobility_id INT;
    deep_stretch_id INT;
    athletic_performance_id INT;
    functional_fitness_id INT;
BEGIN
    -- Get workout IDs
    SELECT id INTO beginner_full_body_id FROM workouts WHERE name = 'Beginner Full Body' AND is_template = true;
    SELECT id INTO intermediate_full_body_id FROM workouts WHERE name = 'Intermediate Full Body' AND is_template = true;
    SELECT id INTO advanced_full_body_id FROM workouts WHERE name = 'Advanced Full Body' AND is_template = true;
    SELECT id INTO upper_body_power_id FROM workouts WHERE name = 'Upper Body Power' AND is_template = true;
    SELECT id INTO push_day_id FROM workouts WHERE name = 'Push Day Blast' AND is_template = true;
    SELECT id INTO pull_day_id FROM workouts WHERE name = 'Pull Day Strength' AND is_template = true;
    SELECT id INTO leg_day_foundation_id FROM workouts WHERE name = 'Leg Day Foundation' AND is_template = true;
    SELECT id INTO glute_builder_id FROM workouts WHERE name = 'Glute Builder' AND is_template = true;
    SELECT id INTO lower_body_power_id FROM workouts WHERE name = 'Lower Body Power' AND is_template = true;
    SELECT id INTO ppl_push_id FROM workouts WHERE name = 'PPL Push Session' AND is_template = true;
    SELECT id INTO ppl_pull_id FROM workouts WHERE name = 'PPL Pull Session' AND is_template = true;
    SELECT id INTO ppl_legs_id FROM workouts WHERE name = 'PPL Leg Session' AND is_template = true;
    SELECT id INTO cardio_blast_id FROM workouts WHERE name = 'Cardio Blast' AND is_template = true;
    SELECT id INTO endurance_builder_id FROM workouts WHERE name = 'Endurance Builder' AND is_template = true;
    SELECT id INTO cardio_challenge_id FROM workouts WHERE name = 'Cardio Challenge' AND is_template = true;
    SELECT id INTO hiit_beginner_id FROM workouts WHERE name = 'HIIT Beginner' AND is_template = true;
    SELECT id INTO hiit_metabolic_id FROM workouts WHERE name = 'HIIT Metabolic' AND is_template = true;
    SELECT id INTO hiit_elite_id FROM workouts WHERE name = 'HIIT Elite' AND is_template = true;
    SELECT id INTO morning_mobility_id FROM workouts WHERE name = 'Morning Mobility' AND is_template = true;
    SELECT id INTO deep_stretch_id FROM workouts WHERE name = 'Deep Stretch Flow' AND is_template = true;
    SELECT id INTO athletic_performance_id FROM workouts WHERE name = 'Athletic Performance' AND is_template = true;
    SELECT id INTO functional_fitness_id FROM workouts WHERE name = 'Functional Fitness' AND is_template = true;

    -- BEGINNER FULL BODY WORKOUT (8 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes) VALUES
    (beginner_full_body_id, (SELECT id FROM exercises WHERE name = 'Squats'), 0, 3, ARRAY[8,10,12], 90, 'Focus on proper form and depth'),
    (beginner_full_body_id, (SELECT id FROM exercises WHERE name = 'Push-ups'), 1, 3, ARRAY[5,8,10], 60, 'Modify on knees if needed'),
    (beginner_full_body_id, (SELECT id FROM exercises WHERE name = 'Bent-Over Rows'), 2, 3, ARRAY[8,10,12], 90, 'Keep back straight and core engaged'),
    (beginner_full_body_id, (SELECT id FROM exercises WHERE name = 'Lunges'), 3, 3, ARRAY[6,8,10], 60, 'Alternate legs each rep'),
    (beginner_full_body_id, (SELECT id FROM exercises WHERE name = 'Shoulder Press'), 4, 3, ARRAY[8,10,12], 75, 'Start with light weight'),
    (beginner_full_body_id, (SELECT id FROM exercises WHERE name = 'Plank'), 5, 3, ARRAY[20,30,45], 60, 'Hold for specified seconds'),
    (beginner_full_body_id, (SELECT id FROM exercises WHERE name = 'Glute Bridges'), 6, 3, ARRAY[10,12,15], 45, 'Squeeze glutes at the top'),
    (beginner_full_body_id, (SELECT id FROM exercises WHERE name = 'Calf Raises'), 7, 3, ARRAY[12,15,20], 45, 'Full range of motion');

    -- INTERMEDIATE FULL BODY WORKOUT (10 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes) VALUES
    (intermediate_full_body_id, (SELECT id FROM exercises WHERE name = 'Deadlifts'), 0, 4, ARRAY[6,8,8,10], 120, 'Focus on hip hinge movement'),
    (intermediate_full_body_id, (SELECT id FROM exercises WHERE name = 'Bench Press'), 1, 4, ARRAY[6,8,8,10], 120, 'Control the weight on descent'),
    (intermediate_full_body_id, (SELECT id FROM exercises WHERE name = 'Bulgarian Split Squats'), 2, 3, ARRAY[8,10,12], 90, 'Each leg separately'),
    (intermediate_full_body_id, (SELECT id FROM exercises WHERE name = 'Pull-ups'), 3, 3, ARRAY[5,6,8], 120, 'Use assistance if needed'),
    (intermediate_full_body_id, (SELECT id FROM exercises WHERE name = 'Dumbbell Shoulder Press'), 4, 3, ARRAY[8,10,12], 75, 'Controlled movement'),
    (intermediate_full_body_id, (SELECT id FROM exercises WHERE name = 'Romanian Deadlifts'), 5, 3, ARRAY[10,12,15], 90, 'Feel stretch in hamstrings'),
    (intermediate_full_body_id, (SELECT id FROM exercises WHERE name = 'Dips'), 6, 3, ARRAY[6,8,10], 90, 'Full range of motion'),
    (intermediate_full_body_id, (SELECT id FROM exercises WHERE name = 'Barbell Rows'), 7, 3, ARRAY[8,10,12], 90, 'Pull to lower chest'),
    (intermediate_full_body_id, (SELECT id FROM exercises WHERE name = 'Russian Twists'), 8, 3, ARRAY[15,20,25], 60, 'Control the rotation'),
    (intermediate_full_body_id, (SELECT id FROM exercises WHERE name = 'Farmer Walks'), 9, 3, ARRAY[30,45,60], 90, 'Walk for specified seconds');

    -- ADVANCED FULL BODY WORKOUT (12 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes) VALUES
    (advanced_full_body_id, (SELECT id FROM exercises WHERE name = 'Squats'), 0, 5, ARRAY[5,6,8,8,10], 150, 'Heavy weight, perfect form'),
    (advanced_full_body_id, (SELECT id FROM exercises WHERE name = 'Deadlifts'), 1, 5, ARRAY[3,5,5,6,8], 180, 'Progressive overload'),
    (advanced_full_body_id, (SELECT id FROM exercises WHERE name = 'Bench Press'), 2, 4, ARRAY[6,6,8,10], 120, 'Explosive concentric'),
    (advanced_full_body_id, (SELECT id FROM exercises WHERE name = 'Pull-ups'), 3, 4, ARRAY[6,8,8,10], 120, 'Add weight if possible'),
    (advanced_full_body_id, (SELECT id FROM exercises WHERE name = 'Overhead Press'), 4, 4, ARRAY[5,6,8,10], 120, 'Strict form, no leg drive'),
    (advanced_full_body_id, (SELECT id FROM exercises WHERE name = 'Barbell Rows'), 5, 4, ARRAY[6,8,8,10], 90, 'Heavy weight, controlled'),
    (advanced_full_body_id, (SELECT id FROM exercises WHERE name = 'Bulgarian Split Squats'), 6, 3, ARRAY[8,10,12], 90, 'Add weight for difficulty'),
    (advanced_full_body_id, (SELECT id FROM exercises WHERE name = 'Dips'), 7, 3, ARRAY[8,10,12], 90, 'Add weight if possible'),
    (advanced_full_body_id, (SELECT id FROM exercises WHERE name = 'Romanian Deadlifts'), 8, 3, ARRAY[10,12,15], 75, 'Focus on hamstring stretch'),
    (advanced_full_body_id, (SELECT id FROM exercises WHERE name = 'Hanging Leg Raises'), 9, 3, ARRAY[8,10,12], 75, 'Control the movement'),
    (advanced_full_body_id, (SELECT id FROM exercises WHERE name = 'Turkish Get-ups'), 10, 3, ARRAY[3,5,5], 90, 'Each side separately'),
    (advanced_full_body_id, (SELECT id FROM exercises WHERE name = 'Burpees'), 11, 3, ARRAY[8,10,12], 90, 'Explosive movement');

    -- UPPER BODY POWER WORKOUT (9 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes) VALUES
    (upper_body_power_id, (SELECT id FROM exercises WHERE name = 'Bench Press'), 0, 4, ARRAY[6,6,8,10], 120, 'Focus on explosive push'),
    (upper_body_power_id, (SELECT id FROM exercises WHERE name = 'Pull-ups'), 1, 4, ARRAY[6,8,8,10], 120, 'Control the negative'),
    (upper_body_power_id, (SELECT id FROM exercises WHERE name = 'Overhead Press'), 2, 4, ARRAY[6,8,8,10], 90, 'Drive through heels'),
    (upper_body_power_id, (SELECT id FROM exercises WHERE name = 'Barbell Rows'), 3, 4, ARRAY[6,8,8,10], 90, 'Pull to sternum'),
    (upper_body_power_id, (SELECT id FROM exercises WHERE name = 'Dips'), 4, 3, ARRAY[8,10,12], 75, 'Deep stretch at bottom'),
    (upper_body_power_id, (SELECT id FROM exercises WHERE name = 'Barbell Curls'), 5, 3, ARRAY[8,10,12], 60, 'No swinging'),
    (upper_body_power_id, (SELECT id FROM exercises WHERE name = 'Close-Grip Bench Press'), 6, 3, ARRAY[8,10,12], 75, 'Focus on triceps'),
    (upper_body_power_id, (SELECT id FROM exercises WHERE name = 'Face Pulls'), 7, 3, ARRAY[12,15,20], 60, 'Squeeze rear delts'),
    (upper_body_power_id, (SELECT id FROM exercises WHERE name = 'Diamond Push-ups'), 8, 3, ARRAY[6,8,10], 60, 'Hands in diamond shape');

    -- PUSH DAY BLAST WORKOUT (10 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes) VALUES
    (push_day_id, (SELECT id FROM exercises WHERE name = 'Bench Press'), 0, 4, ARRAY[6,8,8,10], 120, 'Primary chest movement'),
    (push_day_id, (SELECT id FROM exercises WHERE name = 'Overhead Press'), 1, 4, ARRAY[6,8,8,10], 120, 'Strict form'),
    (push_day_id, (SELECT id FROM exercises WHERE name = 'Incline Dumbbell Press'), 2, 3, ARRAY[8,10,12], 90, 'Upper chest focus'),
    (push_day_id, (SELECT id FROM exercises WHERE name = 'Dips'), 3, 3, ARRAY[8,10,12], 90, 'Lower chest emphasis'),
    (push_day_id, (SELECT id FROM exercises WHERE name = 'Lateral Raises'), 4, 3, ARRAY[10,12,15], 60, 'Control the weight'),
    (push_day_id, (SELECT id FROM exercises WHERE name = 'Close-Grip Bench Press'), 5, 3, ARRAY[8,10,12], 75, 'Triceps focus'),
    (push_day_id, (SELECT id FROM exercises WHERE name = 'Dumbbell Flyes'), 6, 3, ARRAY[10,12,15], 60, 'Chest isolation'),
    (push_day_id, (SELECT id FROM exercises WHERE name = 'Overhead Tricep Extension'), 7, 3, ARRAY[10,12,15], 60, 'Full tricep stretch'),
    (push_day_id, (SELECT id FROM exercises WHERE name = 'Front Raises'), 8, 3, ARRAY[10,12,15], 45, 'Front delt isolation'),
    (push_day_id, (SELECT id FROM exercises WHERE name = 'Tricep Pushdowns'), 9, 3, ARRAY[12,15,20], 45, 'Squeeze at bottom');

    -- PULL DAY STRENGTH WORKOUT (10 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes) VALUES
    (pull_day_id, (SELECT id FROM exercises WHERE name = 'Deadlifts'), 0, 4, ARRAY[5,6,8,10], 150, 'Primary pulling movement'),
    (pull_day_id, (SELECT id FROM exercises WHERE name = 'Pull-ups'), 1, 4, ARRAY[6,8,8,10], 120, 'Wide grip variation'),
    (pull_day_id, (SELECT id FROM exercises WHERE name = 'Barbell Rows'), 2, 4, ARRAY[6,8,8,10], 90, 'Pull to lower chest'),
    (pull_day_id, (SELECT id FROM exercises WHERE name = 'Lat Pulldowns'), 3, 3, ARRAY[8,10,12], 75, 'Wide grip, lean back'),
    (pull_day_id, (SELECT id FROM exercises WHERE name = 'Seated Cable Rows'), 4, 3, ARRAY[8,10,12], 75, 'Squeeze shoulder blades'),
    (pull_day_id, (SELECT id FROM exercises WHERE name = 'Barbell Curls'), 5, 3, ARRAY[8,10,12], 60, 'Strict form'),
    (pull_day_id, (SELECT id FROM exercises WHERE name = 'Face Pulls'), 6, 3, ARRAY[12,15,20], 60, 'Rear delt focus'),
    (pull_day_id, (SELECT id FROM exercises WHERE name = 'Hammer Curls'), 7, 3, ARRAY[10,12,15], 60, 'Neutral grip'),
    (pull_day_id, (SELECT id FROM exercises WHERE name = 'Shrugs'), 8, 3, ARRAY[10,12,15], 60, 'Trap development'),
    (pull_day_id, (SELECT id FROM exercises WHERE name = 'Cable Curls'), 9, 3, ARRAY[12,15,20], 45, 'Constant tension');

    -- LEG DAY FOUNDATION WORKOUT (10 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes) VALUES
    (leg_day_foundation_id, (SELECT id FROM exercises WHERE name = 'Squats'), 0, 4, ARRAY[6,8,8,10], 150, 'Go deep, drive through heels'),
    (leg_day_foundation_id, (SELECT id FROM exercises WHERE name = 'Romanian Deadlifts'), 1, 4, ARRAY[6,8,8,10], 120, 'Hamstring focus'),
    (leg_day_foundation_id, (SELECT id FROM exercises WHERE name = 'Leg Press'), 2, 3, ARRAY[10,12,15], 90, 'Full range of motion'),
    (leg_day_foundation_id, (SELECT id FROM exercises WHERE name = 'Bulgarian Split Squats'), 3, 3, ARRAY[8,10,12], 90, 'Each leg separately'),
    (leg_day_foundation_id, (SELECT id FROM exercises WHERE name = 'Leg Curls'), 4, 3, ARRAY[10,12,15], 75, 'Hamstring isolation'),
    (leg_day_foundation_id, (SELECT id FROM exercises WHERE name = 'Leg Extensions'), 5, 3, ARRAY[10,12,15], 75, 'Quad isolation'),
    (leg_day_foundation_id, (SELECT id FROM exercises WHERE name = 'Hip Thrusts'), 6, 3, ARRAY[10,12,15], 75, 'Glute activation'),
    (leg_day_foundation_id, (SELECT id FROM exercises WHERE name = 'Walking Lunges'), 7, 3, ARRAY[10,12,15], 60, 'Each leg counts as one'),
    (leg_day_foundation_id, (SELECT id FROM exercises WHERE name = 'Calf Raises'), 8, 4, ARRAY[12,15,20,25], 45, 'Full range of motion'),
    (leg_day_foundation_id, (SELECT id FROM exercises WHERE name = 'Wall Sit'), 9, 3, ARRAY[30,45,60], 60, 'Hold for specified seconds');

    -- GLUTE BUILDER WORKOUT (8 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes) VALUES
    (glute_builder_id, (SELECT id FROM exercises WHERE name = 'Hip Thrusts'), 0, 4, ARRAY[8,10,12,15], 90, 'Primary glute movement'),
    (glute_builder_id, (SELECT id FROM exercises WHERE name = 'Romanian Deadlifts'), 1, 4, ARRAY[8,10,12,15], 90, 'Feel the stretch'),
    (glute_builder_id, (SELECT id FROM exercises WHERE name = 'Bulgarian Split Squats'), 2, 3, ARRAY[8,10,12], 75, 'Rear foot elevated'),
    (glute_builder_id, (SELECT id FROM exercises WHERE name = 'Glute Bridges'), 3, 3, ARRAY[12,15,20], 60, 'Squeeze at the top'),
    (glute_builder_id, (SELECT id FROM exercises WHERE name = 'Reverse Lunges'), 4, 3, ARRAY[10,12,15], 60, 'Step back, not forward'),
    (glute_builder_id, (SELECT id FROM exercises WHERE name = 'Clamshells'), 5, 3, ARRAY[15,20,25], 45, 'Side-lying position'),
    (glute_builder_id, (SELECT id FROM exercises WHERE name = 'Fire Hydrants'), 6, 3, ARRAY[12,15,20], 45, 'Each leg separately'),
    (glute_builder_id, (SELECT id FROM exercises WHERE name = 'Single-Leg Glute Bridges'), 7, 3, ARRAY[8,10,12], 60, 'One leg at a time');

    -- LOWER BODY POWER WORKOUT (9 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes) VALUES
    (lower_body_power_id, (SELECT id FROM exercises WHERE name = 'Jump Squats'), 0, 4, ARRAY[6,8,8,10], 120, 'Explosive upward movement'),
    (lower_body_power_id, (SELECT id FROM exercises WHERE name = 'Deadlifts'), 1, 4, ARRAY[5,6,8,10], 150, 'Heavy weight, perfect form'),
    (lower_body_power_id, (SELECT id FROM exercises WHERE name = 'Box Jumps'), 2, 4, ARRAY[5,6,8,10], 120, 'Land softly'),
    (lower_body_power_id, (SELECT id FROM exercises WHERE name = 'Bulgarian Split Squats'), 3, 3, ARRAY[8,10,12], 90, 'Add weight for power'),
    (lower_body_power_id, (SELECT id FROM exercises WHERE name = 'Single-Leg Deadlifts'), 4, 3, ARRAY[6,8,10], 90, 'Balance and strength'),
    (lower_body_power_id, (SELECT id FROM exercises WHERE name = 'Broad Jumps'), 5, 3, ARRAY[5,6,8], 120, 'Maximum distance'),
    (lower_body_power_id, (SELECT id FROM exercises WHERE name = 'Goblet Squats'), 6, 3, ARRAY[10,12,15], 75, 'Deep squat position'),
    (lower_body_power_id, (SELECT id FROM exercises WHERE name = 'Lateral Lunges'), 7, 3, ARRAY[8,10,12], 60, 'Each side separately'),
    (lower_body_power_id, (SELECT id FROM exercises WHERE name = 'Calf Raises'), 8, 4, ARRAY[15,20,25,30], 45, 'Explosive concentric');

    -- PPL PUSH SESSION WORKOUT (11 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes) VALUES
    (ppl_push_id, (SELECT id FROM exercises WHERE name = 'Bench Press'), 0, 4, ARRAY[6,6,8,10], 120, 'Primary chest movement'),
    (ppl_push_id, (SELECT id FROM exercises WHERE name = 'Overhead Press'), 1, 4, ARRAY[6,8,8,10], 120, 'Shoulder development'),
    (ppl_push_id, (SELECT id FROM exercises WHERE name = 'Incline Dumbbell Press'), 2, 3, ARRAY[8,10,12], 90, 'Upper chest focus'),
    (ppl_push_id, (SELECT id FROM exercises WHERE name = 'Dips'), 3, 3, ARRAY[8,10,12], 90, 'Compound tricep movement'),
    (ppl_push_id, (SELECT id FROM exercises WHERE name = 'Lateral Raises'), 4, 4, ARRAY[10,12,15,20], 60, 'Side delt isolation'),
    (ppl_push_id, (SELECT id FROM exercises WHERE name = 'Close-Grip Bench Press'), 5, 3, ARRAY[8,10,12], 75, 'Tricep focus'),
    (ppl_push_id, (SELECT id FROM exercises WHERE name = 'Dumbbell Flyes'), 6, 3, ARRAY[10,12,15], 60, 'Chest isolation'),
    (ppl_push_id, (SELECT id FROM exercises WHERE name = 'Arnold Press'), 7, 3, ARRAY[8,10,12], 60, 'Shoulder rotation'),
    (ppl_push_id, (SELECT id FROM exercises WHERE name = 'Overhead Tricep Extension'), 8, 3, ARRAY[10,12,15], 60, 'Tricep stretch'),
    (ppl_push_id, (SELECT id FROM exercises WHERE name = 'Front Raises'), 9, 3, ARRAY[10,12,15], 45, 'Front delt isolation'),
    (ppl_push_id, (SELECT id FROM exercises WHERE name = 'Diamond Push-ups'), 10, 3, ARRAY[8,10,12], 60, 'Tricep emphasis');

    -- PPL PULL SESSION WORKOUT (11 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes) VALUES
    (ppl_pull_id, (SELECT id FROM exercises WHERE name = 'Deadlifts'), 0, 4, ARRAY[5,6,8,10], 150, 'Primary pulling movement'),
    (ppl_pull_id, (SELECT id FROM exercises WHERE name = 'Pull-ups'), 1, 4, ARRAY[6,8,8,10], 120, 'Lat development'),
    (ppl_pull_id, (SELECT id FROM exercises WHERE name = 'Barbell Rows'), 2, 4, ARRAY[6,8,8,10], 90, 'Mid-back focus'),
    (ppl_pull_id, (SELECT id FROM exercises WHERE name = 'Lat Pulldowns'), 3, 3, ARRAY[8,10,12], 75, 'Lat isolation'),
    (ppl_pull_id, (SELECT id FROM exercises WHERE name = 'Seated Cable Rows'), 4, 3, ARRAY[8,10,12], 75, 'Rhomboid focus'),
    (ppl_pull_id, (SELECT id FROM exercises WHERE name = 'T-Bar Rows'), 5, 3, ARRAY[8,10,12], 75, 'Thick back development'),
    (ppl_pull_id, (SELECT id FROM exercises WHERE name = 'Barbell Curls'), 6, 3, ARRAY[8,10,12], 60, 'Bicep mass'),
    (ppl_pull_id, (SELECT id FROM exercises WHERE name = 'Face Pulls'), 7, 3, ARRAY[12,15,20], 60, 'Rear delt health'),
    (ppl_pull_id, (SELECT id FROM exercises WHERE name = 'Hammer Curls'), 8, 3, ARRAY[10,12,15], 60, 'Brachialis focus'),
    (ppl_pull_id, (SELECT id FROM exercises WHERE name = 'Shrugs'), 9, 3, ARRAY[10,12,15], 60, 'Trap development'),
    (ppl_pull_id, (SELECT id FROM exercises WHERE name = 'Preacher Curls'), 10, 3, ARRAY[8,10,12], 60, 'Bicep isolation');

    -- PPL LEG SESSION WORKOUT (12 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes) VALUES
    (ppl_legs_id, (SELECT id FROM exercises WHERE name = 'Squats'), 0, 4, ARRAY[6,8,8,10], 150, 'Primary leg movement'),
    (ppl_legs_id, (SELECT id FROM exercises WHERE name = 'Romanian Deadlifts'), 1, 4, ARRAY[6,8,8,10], 120, 'Hamstring focus'),
    (ppl_legs_id, (SELECT id FROM exercises WHERE name = 'Leg Press'), 2, 3, ARRAY[10,12,15], 90, 'Quad development'),
    (ppl_legs_id, (SELECT id FROM exercises WHERE name = 'Bulgarian Split Squats'), 3, 3, ARRAY[8,10,12], 90, 'Unilateral strength'),
    (ppl_legs_id, (SELECT id FROM exercises WHERE name = 'Leg Curls'), 4, 3, ARRAY[10,12,15], 75, 'Hamstring isolation'),
    (ppl_legs_id, (SELECT id FROM exercises WHERE name = 'Leg Extensions'), 5, 3, ARRAY[10,12,15], 75, 'Quad isolation'),
    (ppl_legs_id, (SELECT id FROM exercises WHERE name = 'Hip Thrusts'), 6, 3, ARRAY[10,12,15], 75, 'Glute focus'),
    (ppl_legs_id, (SELECT id FROM exercises WHERE name = 'Walking Lunges'), 7, 3, ARRAY[10,12,15], 60, 'Dynamic movement'),
    (ppl_legs_id, (SELECT id FROM exercises WHERE name = 'Stiff-Leg Deadlifts'), 8, 3, ARRAY[10,12,15], 75, 'Hamstring stretch'),
    (ppl_legs_id, (SELECT id FROM exercises WHERE name = 'Goblet Squats'), 9, 3, ARRAY[12,15,20], 60, 'Squat pattern'),
    (ppl_legs_id, (SELECT id FROM exercises WHERE name = 'Calf Raises'), 10, 4, ARRAY[15,20,25,30], 45, 'Calf development'),
    (ppl_legs_id, (SELECT id FROM exercises WHERE name = 'Reverse Lunges'), 11, 3, ARRAY[10,12,15], 60, 'Glute emphasis');

    -- CARDIO BLAST WORKOUT (8 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, target_duration_seconds, rest_seconds, notes) VALUES
    (cardio_blast_id, (SELECT id FROM exercises WHERE name = 'Jumping Jacks'), 0, 3, NULL, 45, 60, 'High intensity'),
    (cardio_blast_id, (SELECT id FROM exercises WHERE name = 'High Knees'), 1, 3, NULL, 30, 45, 'Drive knees up'),
    (cardio_blast_id, (SELECT id FROM exercises WHERE name = 'Burpees'), 2, 3, ARRAY[8,10,12], NULL, 90, 'Full body movement'),
    (cardio_blast_id, (SELECT id FROM exercises WHERE name = 'Mountain Climbers'), 3, 3, NULL, 45, 60, 'Keep core tight'),
    (cardio_blast_id, (SELECT id FROM exercises WHERE name = 'Jump Squats'), 4, 3, ARRAY[10,12,15], NULL, 75, 'Explosive movement'),
    (cardio_blast_id, (SELECT id FROM exercises WHERE name = 'Running in Place'), 5, 3, NULL, 60, 45, 'Pump arms actively'),
    (cardio_blast_id, (SELECT id FROM exercises WHERE name = 'Box Jumps'), 6, 3, ARRAY[8,10,12], NULL, 90, 'Land softly'),
    (cardio_blast_id, (SELECT id FROM exercises WHERE name = 'Bear Crawl'), 7, 3, NULL, 30, 60, 'Keep hips low');

    -- ENDURANCE BUILDER WORKOUT (8 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, target_duration_seconds, rest_seconds, notes) VALUES
    (endurance_builder_id, (SELECT id FROM exercises WHERE name = 'Running in Place'), 0, 4, NULL, 120, 60, 'Moderate pace'),
    (endurance_builder_id, (SELECT id FROM exercises WHERE name = 'Jumping Jacks'), 1, 4, NULL, 90, 45, 'Steady rhythm'),
    (endurance_builder_id, (SELECT id FROM exercises WHERE name = 'Step-ups'), 2, 3, ARRAY[15,20,25], NULL, 60, 'Alternate legs'),
    (endurance_builder_id, (SELECT id FROM exercises WHERE name = 'High Knees'), 3, 3, NULL, 60, 45, 'Controlled pace'),
    (endurance_builder_id, (SELECT id FROM exercises WHERE name = 'Butt Kickers'), 4, 3, NULL, 60, 45, 'Heel to glute'),
    (endurance_builder_id, (SELECT id FROM exercises WHERE name = 'Side Steps'), 5, 3, NULL, 90, 60, 'Lateral movement'),
    (endurance_builder_id, (SELECT id FROM exercises WHERE name = 'Arm Circles'), 6, 3, NULL, 45, 30, 'Forward and backward'),
    (endurance_builder_id, (SELECT id FROM exercises WHERE name = 'Marching in Place'), 7, 3, NULL, 120, 45, 'Lift knees high');

    -- CARDIO CHALLENGE WORKOUT (10 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, target_duration_seconds, rest_seconds, notes) VALUES
    (cardio_challenge_id, (SELECT id FROM exercises WHERE name = 'Burpees'), 0, 4, ARRAY[6,8,10,12], NULL, 90, 'Maximum effort'),
    (cardio_challenge_id, (SELECT id FROM exercises WHERE name = 'Mountain Climbers'), 1, 4, NULL, 45, 60, 'Fast pace'),
    (cardio_challenge_id, (SELECT id FROM exercises WHERE name = 'Jump Squats'), 2, 4, ARRAY[10,12,15,20], NULL, 75, 'Explosive power'),
    (cardio_challenge_id, (SELECT id FROM exercises WHERE name = 'High Knees'), 3, 3, NULL, 60, 45, 'Maximum height'),
    (cardio_challenge_id, (SELECT id FROM exercises WHERE name = 'Box Jumps'), 4, 3, ARRAY[8,10,12], NULL, 120, 'High box if possible'),
    (cardio_challenge_id, (SELECT id FROM exercises WHERE name = 'Battle Ropes'), 5, 3, NULL, 45, 90, 'Alternating waves'),
    (cardio_challenge_id, (SELECT id FROM exercises WHERE name = 'Broad Jumps'), 6, 3, ARRAY[5,6,8], NULL, 120, 'Maximum distance'),
    (cardio_challenge_id, (SELECT id FROM exercises WHERE name = 'Bear Crawl'), 7, 3, NULL, 45, 75, 'Forward and backward'),
    (cardio_challenge_id, (SELECT id FROM exercises WHERE name = 'Jumping Jacks'), 8, 3, NULL, 60, 45, 'High intensity'),
    (cardio_challenge_id, (SELECT id FROM exercises WHERE name = 'Plank Jacks'), 9, 3, ARRAY[10,12,15], NULL, 60, 'Plank position');

    -- HIIT BEGINNER WORKOUT (8 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, target_duration_seconds, rest_seconds, notes) VALUES
    (hiit_beginner_id, (SELECT id FROM exercises WHERE name = 'Jumping Jacks'), 0, 3, NULL, 30, 60, '30 seconds work, 60 rest'),
    (hiit_beginner_id, (SELECT id FROM exercises WHERE name = 'Bodyweight Squats'), 1, 3, ARRAY[10,12,15], NULL, 60, 'Focus on form'),
    (hiit_beginner_id, (SELECT id FROM exercises WHERE name = 'Push-ups'), 2, 3, ARRAY[5,8,10], NULL, 60, 'Modify if needed'),
    (hiit_beginner_id, (SELECT id FROM exercises WHERE name = 'High Knees'), 3, 3, NULL, 30, 60, 'Moderate pace'),
    (hiit_beginner_id, (SELECT id FROM exercises WHERE name = 'Lunges'), 4, 3, ARRAY[6,8,10], NULL, 60, 'Alternate legs'),
    (hiit_beginner_id, (SELECT id FROM exercises WHERE name = 'Plank'), 5, 3, NULL, 20, 60, 'Hold position'),
    (hiit_beginner_id, (SELECT id FROM exercises WHERE name = 'Glute Bridges'), 6, 3, ARRAY[10,12,15], NULL, 45, 'Squeeze glutes'),
    (hiit_beginner_id, (SELECT id FROM exercises WHERE name = 'Marching in Place'), 7, 3, NULL, 45, 45, 'Active recovery');

    -- HIIT METABOLIC WORKOUT (10 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, target_duration_seconds, rest_seconds, notes) VALUES
    (hiit_metabolic_id, (SELECT id FROM exercises WHERE name = 'Burpees'), 0, 4, ARRAY[6,8,10,12], NULL, 75, '45 seconds work, 75 rest'),
    (hiit_metabolic_id, (SELECT id FROM exercises WHERE name = 'Jump Squats'), 1, 4, ARRAY[8,10,12,15], NULL, 75, 'Explosive movement'),
    (hiit_metabolic_id, (SELECT id FROM exercises WHERE name = 'Mountain Climbers'), 2, 4, NULL, 45, 75, 'Fast pace'),
    (hiit_metabolic_id, (SELECT id FROM exercises WHERE name = 'Push-ups'), 3, 4, ARRAY[8,10,12,15], NULL, 75, 'Full range of motion'),
    (hiit_metabolic_id, (SELECT id FROM exercises WHERE name = 'High Knees'), 4, 3, NULL, 45, 60, 'Drive knees up'),
    (hiit_metabolic_id, (SELECT id FROM exercises WHERE name = 'Thrusters'), 5, 3, ARRAY[8,10,12], NULL, 90, 'Squat to press'),
    (hiit_metabolic_id, (SELECT id FROM exercises WHERE name = 'Plank Jacks'), 6, 3, ARRAY[10,12,15], NULL, 60, 'Plank position'),
    (hiit_metabolic_id, (SELECT id FROM exercises WHERE name = 'Reverse Lunges'), 7, 3, ARRAY[8,10,12], NULL, 60, 'Each leg'),
    (hiit_metabolic_id, (SELECT id FROM exercises WHERE name = 'Russian Twists'), 8, 3, ARRAY[15,20,25], NULL, 60, 'Core rotation'),
    (hiit_metabolic_id, (SELECT id FROM exercises WHERE name = 'Bear Crawl'), 9, 3, NULL, 30, 75, 'Forward and back');

    -- HIIT ELITE WORKOUT (12 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, target_duration_seconds, rest_seconds, notes) VALUES
    (hiit_elite_id, (SELECT id FROM exercises WHERE name = 'Burpees'), 0, 4, ARRAY[8,10,12,15], NULL, 60, '60 seconds work, 60 rest'),
    (hiit_elite_id, (SELECT id FROM exercises WHERE name = 'Jump Squats'), 1, 4, ARRAY[12,15,18,20], NULL, 60, 'Maximum height'),
    (hiit_elite_id, (SELECT id FROM exercises WHERE name = 'Mountain Climbers'), 2, 4, NULL, 60, 60, 'Sprint pace'),
    (hiit_elite_id, (SELECT id FROM exercises WHERE name = 'Box Jumps'), 3, 4, ARRAY[8,10,12,15], NULL, 90, 'High box'),
    (hiit_elite_id, (SELECT id FROM exercises WHERE name = 'Thrusters'), 4, 3, ARRAY[10,12,15], NULL, 75, 'Heavy weight'),
    (hiit_elite_id, (SELECT id FROM exercises WHERE name = 'Battle Ropes'), 5, 3, NULL, 60, 90, 'Alternating waves'),
    (hiit_elite_id, (SELECT id FROM exercises WHERE name = 'Turkish Get-ups'), 6, 3, ARRAY[3,5,5], NULL, 90, 'Each side'),
    (hiit_elite_id, (SELECT id FROM exercises WHERE name = 'Broad Jumps'), 7, 3, ARRAY[5,6,8], NULL, 120, 'Maximum distance'),
    (hiit_elite_id, (SELECT id FROM exercises WHERE name = 'Clean and Press'), 8, 3, ARRAY[5,6,8], NULL, 120, 'Full body power'),
    (hiit_elite_id, (SELECT id FROM exercises WHERE name = 'Bear Crawl'), 9, 3, NULL, 45, 75, 'Complex patterns'),
    (hiit_elite_id, (SELECT id FROM exercises WHERE name = 'Hanging Leg Raises'), 10, 3, ARRAY[6,8,10], NULL, 75, 'Control the swing'),
    (hiit_elite_id, (SELECT id FROM exercises WHERE name = 'Plank to Push-up'), 11, 3, ARRAY[6,8,10], NULL, 60, 'Smooth transition');

    -- MORNING MOBILITY WORKOUT (8 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, target_duration_seconds, rest_seconds, notes) VALUES
    (morning_mobility_id, (SELECT id FROM exercises WHERE name = 'Cat-Cow Stretch'), 0, 2, ARRAY[8,10], NULL, 30, 'Gentle spinal movement'),
    (morning_mobility_id, (SELECT id FROM exercises WHERE name = 'Downward Dog'), 1, 2, NULL, 30, 30, 'Hold and breathe'),
    (morning_mobility_id, (SELECT id FROM exercises WHERE name = 'Child''s Pose'), 2, 2, NULL, 45, 30, 'Relax and stretch'),
    (morning_mobility_id, (SELECT id FROM exercises WHERE name = 'Hip Circles'), 3, 2, ARRAY[8,10], NULL, 30, 'Each direction'),
    (morning_mobility_id, (SELECT id FROM exercises WHERE name = 'Arm Circles'), 4, 2, ARRAY[10,12], NULL, 30, 'Forward and backward'),
    (morning_mobility_id, (SELECT id FROM exercises WHERE name = 'Leg Swings'), 5, 2, ARRAY[8,10], NULL, 30, 'Each leg'),
    (morning_mobility_id, (SELECT id FROM exercises WHERE name = 'Neck Rolls'), 6, 2, ARRAY[5,8], NULL, 30, 'Slow and controlled'),
    (morning_mobility_id, (SELECT id FROM exercises WHERE name = 'Gentle Twists'), 7, 2, ARRAY[6,8], NULL, 30, 'Each side');

    -- DEEP STRETCH FLOW WORKOUT (10 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, target_duration_seconds, rest_seconds, notes) VALUES
    (deep_stretch_id, (SELECT id FROM exercises WHERE name = 'Downward Dog'), 0, 3, NULL, 60, 30, 'Deep breathing'),
    (deep_stretch_id, (SELECT id FROM exercises WHERE name = 'Pigeon Pose'), 1, 3, NULL, 45, 30, 'Each side'),
    (deep_stretch_id, (SELECT id FROM exercises WHERE name = 'Child''s Pose'), 2, 3, NULL, 60, 30, 'Rest position'),
    (deep_stretch_id, (SELECT id FROM exercises WHERE name = 'Cat-Cow Stretch'), 3, 3, ARRAY[10,12,15], NULL, 30, 'Spinal mobility'),
    (deep_stretch_id, (SELECT id FROM exercises WHERE name = 'Seated Forward Fold'), 4, 3, NULL, 60, 30, 'Hamstring stretch'),
    (deep_stretch_id, (SELECT id FROM exercises WHERE name = 'Cobra Stretch'), 5, 3, NULL, 30, 30, 'Chest opener'),
    (deep_stretch_id, (SELECT id FROM exercises WHERE name = 'Hip Flexor Stretch'), 6, 3, NULL, 45, 30, 'Each side'),
    (deep_stretch_id, (SELECT id FROM exercises WHERE name = 'Shoulder Stretch'), 7, 3, NULL, 30, 30, 'Cross-body stretch'),
    (deep_stretch_id, (SELECT id FROM exercises WHERE name = 'Spinal Twist'), 8, 3, NULL, 45, 30, 'Seated position'),
    (deep_stretch_id, (SELECT id FROM exercises WHERE name = 'Savasana'), 9, 1, NULL, 300, 0, 'Final relaxation');

    -- ATHLETIC PERFORMANCE WORKOUT (11 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, target_duration_seconds, rest_seconds, notes) VALUES
    (athletic_performance_id, (SELECT id FROM exercises WHERE name = 'Box Jumps'), 0, 4, ARRAY[5,6,8,10], NULL, 120, 'Explosive power'),
    (athletic_performance_id, (SELECT id FROM exercises WHERE name = 'Broad Jumps'), 1, 4, ARRAY[3,5,5,6], NULL, 120, 'Horizontal power'),
    (athletic_performance_id, (SELECT id FROM exercises WHERE name = 'Agility Ladder'), 2, 3, NULL, 30, 90, 'Quick feet'),
    (athletic_performance_id, (SELECT id FROM exercises WHERE name = 'Single-Leg Deadlifts'), 3, 3, ARRAY[6,8,10], NULL, 90, 'Balance and strength'),
    (athletic_performance_id, (SELECT id FROM exercises WHERE name = 'Lateral Lunges'), 4, 3, ARRAY[8,10,12], NULL, 75, 'Lateral movement'),
    (athletic_performance_id, (SELECT id FROM exercises WHERE name = 'Medicine Ball Slams'), 5, 3, ARRAY[8,10,12], NULL, 90, 'Power development'),
    (athletic_performance_id, (SELECT id FROM exercises WHERE name = 'Cone Drills'), 6, 3, NULL, 45, 120, 'Change of direction'),
    (athletic_performance_id, (SELECT id FROM exercises WHERE name = 'Plyometric Push-ups'), 7, 3, ARRAY[5,6,8], NULL, 90, 'Upper body power'),
    (athletic_performance_id, (SELECT id FROM exercises WHERE name = 'Sprint Intervals'), 8, 3, NULL, 30, 120, 'Maximum effort'),
    (athletic_performance_id, (SELECT id FROM exercises WHERE name = 'Turkish Get-ups'), 9, 3, ARRAY[3,5,5], NULL, 90, 'Full body coordination'),
    (athletic_performance_id, (SELECT id FROM exercises WHERE name = 'Bear Crawl'), 10, 3, NULL, 45, 75, 'Core stability');

    -- FUNCTIONAL FITNESS WORKOUT (10 exercises)
    INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, target_duration_seconds, rest_seconds, notes) VALUES
    (functional_fitness_id, (SELECT id FROM exercises WHERE name = 'Farmer Walks'), 0, 3, NULL, 45, 90, 'Heavy carries'),
    (functional_fitness_id, (SELECT id FROM exercises WHERE name = 'Turkish Get-ups'), 1, 3, ARRAY[3,5,5], NULL, 90, 'Each side'),
    (functional_fitness_id, (SELECT id FROM exercises WHERE name = 'Goblet Squats'), 2, 3, ARRAY[10,12,15], NULL, 75, 'Deep squat pattern'),
    (functional_fitness_id, (SELECT id FROM exercises WHERE name = 'Single-Arm Rows'), 3, 3, ARRAY[8,10,12], NULL, 75, 'Each arm'),
    (functional_fitness_id, (SELECT id FROM exercises WHERE name = 'Overhead Carries'), 4, 3, NULL, 30, 90, 'Core stability'),
    (functional_fitness_id, (SELECT id FROM exercises WHERE name = 'Step-ups'), 5, 3, ARRAY[8,10,12], NULL, 60, 'Each leg'),
    (functional_fitness_id, (SELECT id FROM exercises WHERE name = 'Bear Crawl'), 6, 3, NULL, 30, 75, 'Quadrupedal movement'),
    (functional_fitness_id, (SELECT id FROM exercises WHERE name = 'Dead Bug'), 7, 3, ARRAY[8,10,12], NULL, 60, 'Core stability'),
    (functional_fitness_id, (SELECT id FROM exercises WHERE name = 'Suitcase Carries'), 8, 3, NULL, 45, 75, 'Unilateral loading'),
    (functional_fitness_id, (SELECT id FROM exercises WHERE name = 'Wall Sit'), 9, 3, NULL, 45, 60, 'Isometric strength');

END $$;
