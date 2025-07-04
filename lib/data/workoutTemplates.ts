export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  goal: 'strength' | 'weight_loss' | 'muscle_building' | 'endurance' | 'flexibility' | 'general_fitness';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  equipment_needed: string[];
  muscle_groups: string[];
  exercises: TemplateExercise[];
  image_url: string;
  tags: string[];
  created_by: 'system' | 'user';
  popularity_score: number;
  estimated_calories: number;
}

export interface TemplateExercise {
  exercise_name: string;
  exercise_type: 'strength' | 'cardio' | 'flexibility' | 'balance';
  muscle_groups: string[];
  equipment?: string[];
  order_index: number;
  sets: number;
  reps?: number[];
  duration_seconds?: number;
  weight_suggestion?: 'bodyweight' | 'light' | 'moderate' | 'heavy';
  rest_seconds: number;
  instructions: string;
  tips?: string;
}

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  // STRENGTH TRAINING TEMPLATES
  {
    id: 'upper-body-strength',
    name: 'Upper Body Strength Builder',
    description: 'Build upper body strength with compound movements focusing on chest, back, shoulders, and arms.',
    goal: 'strength',
    difficulty: 'intermediate',
    duration_minutes: 45,
    equipment_needed: ['barbell', 'dumbbells', 'bench', 'pull_up_bar'],
    muscle_groups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
    image_url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
    tags: ['strength', 'upper_body', 'compound', 'muscle_building'],
    created_by: 'system',
    popularity_score: 95,
    estimated_calories: 280,
    exercises: [
      {
        exercise_name: 'Bench Press',
        exercise_type: 'strength',
        muscle_groups: ['chest', 'shoulders', 'triceps'],
        equipment: ['barbell', 'bench'],
        order_index: 0,
        sets: 4,
        reps: [6, 8, 10],
        weight_suggestion: 'heavy',
        rest_seconds: 120,
        instructions: '1. Lie on bench with feet flat on floor\n2. Grip bar slightly wider than shoulders\n3. Lower bar to chest, then press up',
        tips: 'Keep your core tight and maintain a slight arch in your back'
      },
      {
        exercise_name: 'Pull-ups',
        exercise_type: 'strength',
        muscle_groups: ['lats', 'biceps', 'rhomboids'],
        equipment: ['pull_up_bar'],
        order_index: 1,
        sets: 4,
        reps: [5, 8, 10],
        weight_suggestion: 'bodyweight',
        rest_seconds: 90,
        instructions: '1. Hang from pull-up bar with overhand grip\n2. Pull body up until chin clears bar\n3. Lower with control',
        tips: 'If too difficult, use assisted pull-up machine or resistance bands'
      },
      {
        exercise_name: 'Overhead Press',
        exercise_type: 'strength',
        muscle_groups: ['shoulders', 'triceps', 'core'],
        equipment: ['barbell'],
        order_index: 2,
        sets: 3,
        reps: [8, 10, 12],
        weight_suggestion: 'moderate',
        rest_seconds: 90,
        instructions: '1. Stand with feet shoulder-width apart\n2. Press bar overhead from shoulder level\n3. Lower with control',
        tips: 'Keep your core engaged and avoid arching your back excessively'
      },
      {
        exercise_name: 'Barbell Rows',
        exercise_type: 'strength',
        muscle_groups: ['lats', 'rhomboids', 'biceps'],
        equipment: ['barbell'],
        order_index: 3,
        sets: 3,
        reps: [8, 10, 12],
        weight_suggestion: 'moderate',
        rest_seconds: 90,
        instructions: '1. Hinge at hips with slight knee bend\n2. Pull bar to lower chest\n3. Lower with control',
        tips: 'Keep your back straight and squeeze shoulder blades together'
      },
      {
        exercise_name: 'Dips',
        exercise_type: 'strength',
        muscle_groups: ['triceps', 'chest', 'shoulders'],
        equipment: ['dip_bars'],
        order_index: 4,
        sets: 3,
        reps: [8, 12, 15],
        weight_suggestion: 'bodyweight',
        rest_seconds: 60,
        instructions: '1. Support body on dip bars\n2. Lower body until shoulders below elbows\n3. Push back up',
        tips: 'Lean slightly forward to target chest more, stay upright for triceps focus'
      }
    ]
  },
  {
    id: 'lower-body-power',
    name: 'Lower Body Power & Strength',
    description: 'Develop explosive lower body power and strength with squats, deadlifts, and plyometric movements.',
    goal: 'strength',
    difficulty: 'advanced',
    duration_minutes: 50,
    equipment_needed: ['barbell', 'dumbbells', 'squat_rack'],
    muscle_groups: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    image_url: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg',
    tags: ['strength', 'lower_body', 'power', 'explosive'],
    created_by: 'system',
    popularity_score: 88,
    estimated_calories: 320,
    exercises: [
      {
        exercise_name: 'Back Squats',
        exercise_type: 'strength',
        muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
        equipment: ['barbell', 'squat_rack'],
        order_index: 0,
        sets: 4,
        reps: [5, 6, 8],
        weight_suggestion: 'heavy',
        rest_seconds: 150,
        instructions: '1. Position bar on upper back\n2. Descend until thighs parallel to floor\n3. Drive through heels to stand',
        tips: 'Keep chest up and knees tracking over toes'
      },
      {
        exercise_name: 'Romanian Deadlifts',
        exercise_type: 'strength',
        muscle_groups: ['hamstrings', 'glutes', 'lower_back'],
        equipment: ['barbell'],
        order_index: 1,
        sets: 4,
        reps: [6, 8, 10],
        weight_suggestion: 'heavy',
        rest_seconds: 120,
        instructions: '1. Hold bar with overhand grip\n2. Hinge at hips, lowering bar along legs\n3. Return to standing',
        tips: 'Keep bar close to body and maintain neutral spine'
      },
      {
        exercise_name: 'Bulgarian Split Squats',
        exercise_type: 'strength',
        muscle_groups: ['quadriceps', 'glutes'],
        equipment: ['dumbbells', 'bench'],
        order_index: 2,
        sets: 3,
        reps: [10, 12, 15],
        weight_suggestion: 'moderate',
        rest_seconds: 90,
        instructions: '1. Place rear foot on bench\n2. Lower into lunge position\n3. Push through front heel to return',
        tips: 'Keep most weight on front leg and maintain upright torso'
      },
      {
        exercise_name: 'Jump Squats',
        exercise_type: 'strength',
        muscle_groups: ['quadriceps', 'glutes', 'calves'],
        equipment: [],
        order_index: 3,
        sets: 3,
        reps: [8, 10, 12],
        weight_suggestion: 'bodyweight',
        rest_seconds: 90,
        instructions: '1. Perform squat motion\n2. Explode up into jump\n3. Land softly and repeat',
        tips: 'Focus on soft landings and explosive takeoffs'
      },
      {
        exercise_name: 'Walking Lunges',
        exercise_type: 'strength',
        muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
        equipment: ['dumbbells'],
        order_index: 4,
        sets: 3,
        reps: [20, 24, 30],
        weight_suggestion: 'light',
        rest_seconds: 60,
        instructions: '1. Step forward into lunge\n2. Push off back foot to next lunge\n3. Continue walking pattern',
        tips: 'Keep torso upright and take controlled steps'
      }
    ]
  },

  // WEIGHT LOSS TEMPLATES
  {
    id: 'hiit-fat-burner',
    name: 'HIIT Fat Burner Circuit',
    description: 'High-intensity interval training designed to maximize calorie burn and boost metabolism.',
    goal: 'weight_loss',
    difficulty: 'intermediate',
    duration_minutes: 30,
    equipment_needed: ['dumbbells', 'kettlebell'],
    muscle_groups: ['full_body', 'cardiovascular'],
    image_url: 'https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg',
    tags: ['hiit', 'fat_loss', 'cardio', 'circuit', 'metabolic'],
    created_by: 'system',
    popularity_score: 92,
    estimated_calories: 350,
    exercises: [
      {
        exercise_name: 'Burpees',
        exercise_type: 'cardio',
        muscle_groups: ['full_body', 'cardiovascular'],
        equipment: [],
        order_index: 0,
        sets: 4,
        duration_seconds: 45,
        weight_suggestion: 'bodyweight',
        rest_seconds: 15,
        instructions: '1. Start standing\n2. Drop to push-up position\n3. Jump feet back to squat\n4. Jump up with arms overhead',
        tips: 'Maintain steady pace, modify by stepping instead of jumping'
      },
      {
        exercise_name: 'Kettlebell Swings',
        exercise_type: 'strength',
        muscle_groups: ['glutes', 'hamstrings', 'core'],
        equipment: ['kettlebell'],
        order_index: 1,
        sets: 4,
        duration_seconds: 45,
        weight_suggestion: 'moderate',
        rest_seconds: 15,
        instructions: '1. Stand with feet wide, kettlebell between legs\n2. Hinge at hips and swing kettlebell up\n3. Let momentum carry to shoulder height',
        tips: 'Drive with hips, not arms. Keep core tight throughout'
      },
      {
        exercise_name: 'Mountain Climbers',
        exercise_type: 'cardio',
        muscle_groups: ['core', 'shoulders', 'cardiovascular'],
        equipment: [],
        order_index: 2,
        sets: 4,
        duration_seconds: 45,
        weight_suggestion: 'bodyweight',
        rest_seconds: 15,
        instructions: '1. Start in plank position\n2. Alternate bringing knees to chest rapidly\n3. Maintain plank throughout',
        tips: 'Keep hips level and core engaged. Start slow and build speed'
      },
      {
        exercise_name: 'Dumbbell Thrusters',
        exercise_type: 'strength',
        muscle_groups: ['shoulders', 'quadriceps', 'core'],
        equipment: ['dumbbells'],
        order_index: 3,
        sets: 4,
        duration_seconds: 45,
        weight_suggestion: 'light',
        rest_seconds: 15,
        instructions: '1. Hold dumbbells at shoulder level\n2. Squat down\n3. Stand and press weights overhead',
        tips: 'Use leg drive to help press weights up. Keep core tight'
      },
      {
        exercise_name: 'High Knees',
        exercise_type: 'cardio',
        muscle_groups: ['quadriceps', 'cardiovascular'],
        equipment: [],
        order_index: 4,
        sets: 4,
        duration_seconds: 45,
        weight_suggestion: 'bodyweight',
        rest_seconds: 15,
        instructions: '1. Run in place\n2. Bring knees up to hip level\n3. Pump arms naturally',
        tips: 'Land on balls of feet and maintain quick cadence'
      }
    ]
  },
  {
    id: 'cardio-strength-combo',
    name: 'Cardio-Strength Fat Loss',
    description: 'Combination of cardio and strength training to maximize fat loss while preserving muscle.',
    goal: 'weight_loss',
    difficulty: 'beginner',
    duration_minutes: 40,
    equipment_needed: ['dumbbells', 'resistance_bands'],
    muscle_groups: ['full_body', 'cardiovascular'],
    image_url: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg',
    tags: ['fat_loss', 'cardio', 'strength', 'beginner_friendly'],
    created_by: 'system',
    popularity_score: 85,
    estimated_calories: 280,
    exercises: [
      {
        exercise_name: 'Marching in Place',
        exercise_type: 'cardio',
        muscle_groups: ['cardiovascular'],
        equipment: [],
        order_index: 0,
        sets: 1,
        duration_seconds: 300,
        weight_suggestion: 'bodyweight',
        rest_seconds: 60,
        instructions: '1. March in place lifting knees high\n2. Pump arms naturally\n3. Maintain steady rhythm',
        tips: 'Start at comfortable pace and gradually increase intensity'
      },
      {
        exercise_name: 'Bodyweight Squats',
        exercise_type: 'strength',
        muscle_groups: ['quadriceps', 'glutes'],
        equipment: [],
        order_index: 1,
        sets: 3,
        reps: [12, 15, 20],
        weight_suggestion: 'bodyweight',
        rest_seconds: 45,
        instructions: '1. Stand with feet shoulder-width apart\n2. Lower as if sitting in chair\n3. Return to standing',
        tips: 'Keep chest up and weight in heels'
      },
      {
        exercise_name: 'Step-ups',
        exercise_type: 'cardio',
        muscle_groups: ['quadriceps', 'glutes', 'cardiovascular'],
        equipment: ['step_platform'],
        order_index: 2,
        sets: 3,
        duration_seconds: 60,
        weight_suggestion: 'bodyweight',
        rest_seconds: 45,
        instructions: '1. Step up onto platform with one foot\n2. Bring other foot up\n3. Step down and repeat',
        tips: 'Use controlled movements and alternate leading leg'
      },
      {
        exercise_name: 'Modified Push-ups',
        exercise_type: 'strength',
        muscle_groups: ['chest', 'shoulders', 'triceps'],
        equipment: [],
        order_index: 3,
        sets: 3,
        reps: [8, 10, 12],
        weight_suggestion: 'bodyweight',
        rest_seconds: 45,
        instructions: '1. Start in plank or knee position\n2. Lower chest toward floor\n3. Push back up',
        tips: 'Modify on knees if needed. Keep body straight'
      },
      {
        exercise_name: 'Resistance Band Rows',
        exercise_type: 'strength',
        muscle_groups: ['back', 'biceps'],
        equipment: ['resistance_bands'],
        order_index: 4,
        sets: 3,
        reps: [12, 15, 20],
        weight_suggestion: 'light',
        rest_seconds: 45,
        instructions: '1. Anchor band at chest height\n2. Pull handles to chest\n3. Return with control',
        tips: 'Squeeze shoulder blades together and keep elbows close'
      }
    ]
  },

  // MUSCLE BUILDING TEMPLATES
  {
    id: 'push-pull-legs',
    name: 'Push-Pull-Legs Split',
    description: 'Classic muscle building split focusing on push muscles (chest, shoulders, triceps).',
    goal: 'muscle_building',
    difficulty: 'intermediate',
    duration_minutes: 60,
    equipment_needed: ['barbell', 'dumbbells', 'bench', 'cable_machine'],
    muscle_groups: ['chest', 'shoulders', 'triceps'],
    image_url: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg',
    tags: ['muscle_building', 'push_day', 'hypertrophy', 'split'],
    created_by: 'system',
    popularity_score: 90,
    estimated_calories: 300,
    exercises: [
      {
        exercise_name: 'Incline Barbell Press',
        exercise_type: 'strength',
        muscle_groups: ['chest', 'shoulders', 'triceps'],
        equipment: ['barbell', 'incline_bench'],
        order_index: 0,
        sets: 4,
        reps: [8, 10, 12],
        weight_suggestion: 'heavy',
        rest_seconds: 120,
        instructions: '1. Set bench to 30-45 degree incline\n2. Press bar from chest to arms extended\n3. Lower with control',
        tips: 'Focus on upper chest activation and controlled movement'
      },
      {
        exercise_name: 'Dumbbell Shoulder Press',
        exercise_type: 'strength',
        muscle_groups: ['shoulders', 'triceps'],
        equipment: ['dumbbells', 'bench'],
        order_index: 1,
        sets: 4,
        reps: [10, 12, 15],
        weight_suggestion: 'moderate',
        rest_seconds: 90,
        instructions: '1. Sit with back support\n2. Press dumbbells overhead\n3. Lower to shoulder level',
        tips: 'Keep core tight and avoid arching back excessively'
      },
      {
        exercise_name: 'Dumbbell Flyes',
        exercise_type: 'strength',
        muscle_groups: ['chest'],
        equipment: ['dumbbells', 'bench'],
        order_index: 2,
        sets: 3,
        reps: [12, 15, 18],
        weight_suggestion: 'light',
        rest_seconds: 75,
        instructions: '1. Lie on bench with arms extended\n2. Lower weights in arc motion\n3. Squeeze chest to return',
        tips: 'Keep slight bend in elbows and focus on chest stretch'
      },
      {
        exercise_name: 'Lateral Raises',
        exercise_type: 'strength',
        muscle_groups: ['shoulders'],
        equipment: ['dumbbells'],
        order_index: 3,
        sets: 4,
        reps: [12, 15, 20],
        weight_suggestion: 'light',
        rest_seconds: 60,
        instructions: '1. Stand with dumbbells at sides\n2. Raise arms to shoulder height\n3. Lower with control',
        tips: 'Lead with pinkies and avoid swinging weights'
      },
      {
        exercise_name: 'Tricep Dips',
        exercise_type: 'strength',
        muscle_groups: ['triceps'],
        equipment: ['bench'],
        order_index: 4,
        sets: 3,
        reps: [10, 12, 15],
        weight_suggestion: 'bodyweight',
        rest_seconds: 60,
        instructions: '1. Place hands on bench behind you\n2. Lower body by bending elbows\n3. Push back up',
        tips: 'Keep elbows close to body and shoulders down'
      },
      {
        exercise_name: 'Overhead Tricep Extension',
        exercise_type: 'strength',
        muscle_groups: ['triceps'],
        equipment: ['dumbbells'],
        order_index: 5,
        sets: 3,
        reps: [12, 15, 18],
        weight_suggestion: 'light',
        rest_seconds: 60,
        instructions: '1. Hold dumbbell overhead with both hands\n2. Lower behind head by bending elbows\n3. Extend back up',
        tips: 'Keep elbows stationary and close to head'
      }
    ]
  },

  // ENDURANCE TEMPLATES
  {
    id: 'cardio-endurance',
    name: 'Cardiovascular Endurance Builder',
    description: 'Progressive cardio workout to build aerobic capacity and endurance.',
    goal: 'endurance',
    difficulty: 'beginner',
    duration_minutes: 35,
    equipment_needed: [],
    muscle_groups: ['cardiovascular', 'legs'],
    image_url: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg',
    tags: ['cardio', 'endurance', 'aerobic', 'heart_health'],
    created_by: 'system',
    popularity_score: 78,
    estimated_calories: 250,
    exercises: [
      {
        exercise_name: 'Warm-up Walk',
        exercise_type: 'cardio',
        muscle_groups: ['cardiovascular', 'legs'],
        equipment: [],
        order_index: 0,
        sets: 1,
        duration_seconds: 300,
        weight_suggestion: 'bodyweight',
        rest_seconds: 0,
        instructions: '1. Walk at comfortable pace\n2. Gradually increase pace\n3. Prepare body for exercise',
        tips: 'Focus on breathing and warming up muscles'
      },
      {
        exercise_name: 'Interval Jogging',
        exercise_type: 'cardio',
        muscle_groups: ['cardiovascular', 'legs'],
        equipment: [],
        order_index: 1,
        sets: 6,
        duration_seconds: 120,
        weight_suggestion: 'bodyweight',
        rest_seconds: 60,
        instructions: '1. Jog at moderate pace for 2 minutes\n2. Walk for 1 minute recovery\n3. Repeat cycle',
        tips: 'Maintain conversational pace during jog intervals'
      },
      {
        exercise_name: 'Cool-down Walk',
        exercise_type: 'cardio',
        muscle_groups: ['cardiovascular'],
        equipment: [],
        order_index: 2,
        sets: 1,
        duration_seconds: 300,
        weight_suggestion: 'bodyweight',
        rest_seconds: 0,
        instructions: '1. Walk at slow, comfortable pace\n2. Focus on deep breathing\n3. Allow heart rate to return to normal',
        tips: 'Take time to stretch after cooling down'
      }
    ]
  },

  // FLEXIBILITY TEMPLATES
  {
    id: 'full-body-stretch',
    name: 'Full Body Flexibility Flow',
    description: 'Comprehensive stretching routine to improve flexibility and mobility.',
    goal: 'flexibility',
    difficulty: 'beginner',
    duration_minutes: 25,
    equipment_needed: ['yoga_mat'],
    muscle_groups: ['full_body'],
    image_url: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg',
    tags: ['flexibility', 'stretching', 'mobility', 'recovery'],
    created_by: 'system',
    popularity_score: 82,
    estimated_calories: 80,
    exercises: [
      {
        exercise_name: 'Cat-Cow Stretch',
        exercise_type: 'flexibility',
        muscle_groups: ['spine', 'core'],
        equipment: ['yoga_mat'],
        order_index: 0,
        sets: 1,
        duration_seconds: 60,
        weight_suggestion: 'bodyweight',
        rest_seconds: 10,
        instructions: '1. Start on hands and knees\n2. Arch back (cow), then round spine (cat)\n3. Move slowly and controlled',
        tips: 'Focus on spinal mobility and breathing'
      },
      {
        exercise_name: 'Downward Dog',
        exercise_type: 'flexibility',
        muscle_groups: ['hamstrings', 'calves', 'shoulders'],
        equipment: ['yoga_mat'],
        order_index: 1,
        sets: 3,
        duration_seconds: 30,
        weight_suggestion: 'bodyweight',
        rest_seconds: 15,
        instructions: '1. Start in plank position\n2. Lift hips up and back\n3. Form inverted V shape',
        tips: 'Pedal feet to stretch calves, bend knees if needed'
      },
      {
        exercise_name: 'Pigeon Pose',
        exercise_type: 'flexibility',
        muscle_groups: ['hips', 'glutes'],
        equipment: ['yoga_mat'],
        order_index: 2,
        sets: 2,
        duration_seconds: 45,
        weight_suggestion: 'bodyweight',
        rest_seconds: 15,
        instructions: '1. From downward dog, bring one knee forward\n2. Extend back leg straight\n3. Hold and breathe deeply',
        tips: 'Use props under hip if needed for support'
      },
      {
        exercise_name: 'Seated Forward Fold',
        exercise_type: 'flexibility',
        muscle_groups: ['hamstrings', 'lower_back'],
        equipment: ['yoga_mat'],
        order_index: 3,
        sets: 1,
        duration_seconds: 60,
        weight_suggestion: 'bodyweight',
        rest_seconds: 10,
        instructions: '1. Sit with legs extended\n2. Hinge at hips and reach forward\n3. Hold comfortable stretch',
        tips: 'Keep spine long, bend knees if needed'
      },
      {
        exercise_name: 'Spinal Twist',
        exercise_type: 'flexibility',
        muscle_groups: ['spine', 'obliques'],
        equipment: ['yoga_mat'],
        order_index: 4,
        sets: 2,
        duration_seconds: 30,
        weight_suggestion: 'bodyweight',
        rest_seconds: 10,
        instructions: '1. Sit with one leg crossed over\n2. Twist spine toward bent knee\n3. Hold and breathe',
        tips: 'Keep both sit bones grounded and spine tall'
      }
    ]
  },

  // GENERAL FITNESS TEMPLATES
  {
    id: 'beginner-total-body',
    name: 'Beginner Total Body Workout',
    description: 'Perfect introduction to fitness with basic movements targeting all major muscle groups.',
    goal: 'general_fitness',
    difficulty: 'beginner',
    duration_minutes: 30,
    equipment_needed: ['dumbbells'],
    muscle_groups: ['full_body'],
    image_url: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg',
    tags: ['beginner', 'full_body', 'basic_movements', 'fitness_intro'],
    created_by: 'system',
    popularity_score: 95,
    estimated_calories: 180,
    exercises: [
      {
        exercise_name: 'Bodyweight Squats',
        exercise_type: 'strength',
        muscle_groups: ['quadriceps', 'glutes'],
        equipment: [],
        order_index: 0,
        sets: 2,
        reps: [10, 12],
        weight_suggestion: 'bodyweight',
        rest_seconds: 60,
        instructions: '1. Stand with feet shoulder-width apart\n2. Lower as if sitting back into chair\n3. Return to standing',
        tips: 'Start with partial range of motion if needed'
      },
      {
        exercise_name: 'Wall Push-ups',
        exercise_type: 'strength',
        muscle_groups: ['chest', 'shoulders', 'triceps'],
        equipment: [],
        order_index: 1,
        sets: 2,
        reps: [8, 10],
        weight_suggestion: 'bodyweight',
        rest_seconds: 60,
        instructions: '1. Stand arms length from wall\n2. Place hands on wall at shoulder height\n3. Push away from wall',
        tips: 'Great modification for building up to regular push-ups'
      },
      {
        exercise_name: 'Seated Rows',
        exercise_type: 'strength',
        muscle_groups: ['back', 'biceps'],
        equipment: ['resistance_bands'],
        order_index: 2,
        sets: 2,
        reps: [10, 12],
        weight_suggestion: 'light',
        rest_seconds: 60,
        instructions: '1. Sit with legs extended, band around feet\n2. Pull handles to chest\n3. Return with control',
        tips: 'Sit tall and squeeze shoulder blades together'
      },
      {
        exercise_name: 'Modified Plank',
        exercise_type: 'strength',
        muscle_groups: ['core', 'shoulders'],
        equipment: [],
        order_index: 3,
        sets: 2,
        duration_seconds: 20,
        weight_suggestion: 'bodyweight',
        rest_seconds: 60,
        instructions: '1. Start on knees and forearms\n2. Keep body straight from knees to head\n3. Hold position',
        tips: 'Progress to full plank as you get stronger'
      },
      {
        exercise_name: 'Standing Marches',
        exercise_type: 'cardio',
        muscle_groups: ['core', 'legs'],
        equipment: [],
        order_index: 4,
        sets: 2,
        duration_seconds: 30,
        weight_suggestion: 'bodyweight',
        rest_seconds: 60,
        instructions: '1. Stand tall and march in place\n2. Lift knees to comfortable height\n3. Pump arms naturally',
        tips: 'Great low-impact cardio option'
      }
    ]
  }
];

export const getTemplatesByGoal = (goal: WorkoutTemplate['goal']): WorkoutTemplate[] => {
  return WORKOUT_TEMPLATES.filter(template => template.goal === goal);
};

export const getTemplatesByDifficulty = (difficulty: WorkoutTemplate['difficulty']): WorkoutTemplate[] => {
  return WORKOUT_TEMPLATES.filter(template => template.difficulty === difficulty);
};

export const getTemplatesByEquipment = (availableEquipment: string[]): WorkoutTemplate[] => {
  return WORKOUT_TEMPLATES.filter(template => 
    template.equipment_needed.every(equipment => 
      availableEquipment.includes(equipment) || equipment === ''
    )
  );
};

export const getPopularTemplates = (limit: number = 5): WorkoutTemplate[] => {
  return WORKOUT_TEMPLATES
    .sort((a, b) => b.popularity_score - a.popularity_score)
    .slice(0, limit);
};

export const searchTemplates = (query: string): WorkoutTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return WORKOUT_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};
