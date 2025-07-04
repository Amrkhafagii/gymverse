export interface ExerciseData {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  muscle_groups: string[];
  equipment: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  exercise_type: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'plyometric';
  demo_video_url?: string;
  demo_image_url: string;
  alternative_names: string[];
  tips: string[];
  common_mistakes: string[];
  variations: string[];
  calories_per_minute: number;
  is_compound: boolean;
  is_unilateral: boolean;
  created_by: 'system' | 'user';
  popularity_score: number;
  safety_rating: number; // 1-5 scale
  tags: string[];
}

export const EXERCISE_DATABASE: ExerciseData[] = [
  // CHEST EXERCISES
  {
    id: 'push-ups',
    name: 'Push-ups',
    description: 'Classic bodyweight exercise targeting chest, shoulders, and triceps with core stabilization.',
    instructions: [
      'Start in a plank position with hands slightly wider than shoulders',
      'Keep your body in a straight line from head to heels',
      'Lower your chest toward the floor by bending your elbows',
      'Push back up to the starting position',
      'Maintain core engagement throughout the movement'
    ],
    muscle_groups: ['chest', 'shoulders', 'triceps', 'core'],
    equipment: [],
    difficulty_level: 'beginner',
    exercise_type: 'strength',
    demo_image_url: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg',
    alternative_names: ['press-ups', 'floor press'],
    tips: [
      'Keep your core tight to maintain proper form',
      'Focus on controlled movement rather than speed',
      'Breathe in on the way down, out on the way up'
    ],
    common_mistakes: [
      'Letting hips sag or pike up',
      'Not going through full range of motion',
      'Placing hands too wide or too narrow'
    ],
    variations: [
      'Incline push-ups (easier)',
      'Decline push-ups (harder)',
      'Diamond push-ups',
      'Wide-grip push-ups',
      'Single-arm push-ups'
    ],
    calories_per_minute: 8,
    is_compound: true,
    is_unilateral: false,
    created_by: 'system',
    popularity_score: 95,
    safety_rating: 5,
    tags: ['bodyweight', 'upper_body', 'beginner_friendly', 'no_equipment']
  },
  {
    id: 'bench-press',
    name: 'Bench Press',
    description: 'Fundamental compound movement for building chest, shoulder, and tricep strength.',
    instructions: [
      'Lie on bench with feet flat on floor',
      'Grip barbell slightly wider than shoulder-width',
      'Unrack the bar and position it over your chest',
      'Lower the bar to your chest with control',
      'Press the bar back up to starting position'
    ],
    muscle_groups: ['chest', 'shoulders', 'triceps'],
    equipment: ['barbell', 'bench'],
    difficulty_level: 'intermediate',
    exercise_type: 'strength',
    demo_image_url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
    alternative_names: ['barbell bench press', 'flat bench press'],
    tips: [
      'Keep shoulder blades retracted and down',
      'Maintain slight arch in lower back',
      'Use a spotter for heavy weights'
    ],
    common_mistakes: [
      'Bouncing the bar off chest',
      'Lifting feet off the ground',
      'Gripping too wide or too narrow'
    ],
    variations: [
      'Incline bench press',
      'Decline bench press',
      'Dumbbell bench press',
      'Close-grip bench press'
    ],
    calories_per_minute: 6,
    is_compound: true,
    is_unilateral: false,
    created_by: 'system',
    popularity_score: 92,
    safety_rating: 3,
    tags: ['compound', 'strength', 'chest', 'powerlifting']
  },

  // BACK EXERCISES
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    description: 'Upper body pulling exercise that builds lat, bicep, and grip strength.',
    instructions: [
      'Hang from pull-up bar with overhand grip',
      'Hands should be slightly wider than shoulders',
      'Pull your body up until chin clears the bar',
      'Lower yourself with control to full arm extension',
      'Maintain core engagement throughout'
    ],
    muscle_groups: ['lats', 'biceps', 'rhomboids', 'rear_delts'],
    equipment: ['pull_up_bar'],
    difficulty_level: 'intermediate',
    exercise_type: 'strength',
    demo_image_url: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg',
    alternative_names: ['chin-ups', 'lat pulldowns'],
    tips: [
      'Start with assisted pull-ups if needed',
      'Focus on pulling with your back, not just arms',
      'Avoid swinging or kipping'
    ],
    common_mistakes: [
      'Not achieving full range of motion',
      'Using momentum to swing up',
      'Neglecting the negative portion'
    ],
    variations: [
      'Chin-ups (underhand grip)',
      'Wide-grip pull-ups',
      'Neutral-grip pull-ups',
      'Weighted pull-ups',
      'Assisted pull-ups'
    ],
    calories_per_minute: 10,
    is_compound: true,
    is_unilateral: false,
    created_by: 'system',
    popularity_score: 88,
    safety_rating: 4,
    tags: ['bodyweight', 'upper_body', 'back', 'functional']
  },
  {
    id: 'deadlifts',
    name: 'Deadlifts',
    description: 'King of compound movements targeting the entire posterior chain.',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Hinge at hips and knees to grip the bar',
      'Keep chest up and back straight',
      'Drive through heels to lift the bar',
      'Stand tall, then lower with control'
    ],
    muscle_groups: ['hamstrings', 'glutes', 'lower_back', 'traps', 'lats'],
    equipment: ['barbell'],
    difficulty_level: 'advanced',
    exercise_type: 'strength',
    demo_image_url: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg',
    alternative_names: ['conventional deadlift', 'barbell deadlift'],
    tips: [
      'Keep the bar close to your body throughout',
      'Engage your lats to protect your back',
      'Start with lighter weight to master form'
    ],
    common_mistakes: [
      'Rounding the back',
      'Bar drifting away from body',
      'Not engaging the lats'
    ],
    variations: [
      'Sumo deadlifts',
      'Romanian deadlifts',
      'Trap bar deadlifts',
      'Single-leg deadlifts',
      'Deficit deadlifts'
    ],
    calories_per_minute: 12,
    is_compound: true,
    is_unilateral: false,
    created_by: 'system',
    popularity_score: 90,
    safety_rating: 2,
    tags: ['compound', 'powerlifting', 'posterior_chain', 'strength']
  },

  // LEG EXERCISES
  {
    id: 'squats',
    name: 'Squats',
    description: 'Fundamental lower body exercise targeting quads, glutes, and core.',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Keep chest up and core engaged',
      'Lower by pushing hips back and bending knees',
      'Descend until thighs are parallel to floor',
      'Drive through heels to return to standing'
    ],
    muscle_groups: ['quadriceps', 'glutes', 'hamstrings', 'core'],
    equipment: [],
    difficulty_level: 'beginner',
    exercise_type: 'strength',
    demo_image_url: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg',
    alternative_names: ['bodyweight squats', 'air squats'],
    tips: [
      'Keep knees tracking over toes',
      'Maintain neutral spine throughout',
      'Focus on sitting back rather than down'
    ],
    common_mistakes: [
      'Knees caving inward',
      'Not reaching proper depth',
      'Leaning too far forward'
    ],
    variations: [
      'Goblet squats',
      'Jump squats',
      'Single-leg squats',
      'Sumo squats',
      'Wall sits'
    ],
    calories_per_minute: 8,
    is_compound: true,
    is_unilateral: false,
    created_by: 'system',
    popularity_score: 94,
    safety_rating: 5,
    tags: ['bodyweight', 'lower_body', 'functional', 'beginner_friendly']
  },
  {
    id: 'lunges',
    name: 'Lunges',
    description: 'Unilateral lower body exercise improving balance, strength, and stability.',
    instructions: [
      'Stand tall with feet hip-width apart',
      'Step forward with one leg',
      'Lower hips until both knees are at 90 degrees',
      'Push through front heel to return to start',
      'Alternate legs or complete all reps on one side'
    ],
    muscle_groups: ['quadriceps', 'glutes', 'hamstrings', 'calves'],
    equipment: [],
    difficulty_level: 'beginner',
    exercise_type: 'strength',
    demo_image_url: 'https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg',
    alternative_names: ['forward lunges', 'stationary lunges'],
    tips: [
      'Keep torso upright throughout movement',
      'Ensure front knee stays over ankle',
      'Take a large enough step forward'
    ],
    common_mistakes: [
      'Knee extending past toes',
      'Leaning forward excessively',
      'Not lowering deep enough'
    ],
    variations: [
      'Reverse lunges',
      'Walking lunges',
      'Lateral lunges',
      'Curtsy lunges',
      'Jump lunges'
    ],
    calories_per_minute: 7,
    is_compound: true,
    is_unilateral: true,
    created_by: 'system',
    popularity_score: 85,
    safety_rating: 4,
    tags: ['bodyweight', 'unilateral', 'balance', 'functional']
  },

  // SHOULDER EXERCISES
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    description: 'Vertical pressing movement building shoulder and core strength.',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Hold barbell at shoulder level with overhand grip',
      'Brace core and press bar straight overhead',
      'Lock out arms at the top',
      'Lower with control to starting position'
    ],
    muscle_groups: ['shoulders', 'triceps', 'core'],
    equipment: ['barbell'],
    difficulty_level: 'intermediate',
    exercise_type: 'strength',
    demo_image_url: 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg',
    alternative_names: ['military press', 'standing press', 'shoulder press'],
    tips: [
      'Keep core tight throughout movement',
      'Press in straight line over shoulders',
      'Avoid arching back excessively'
    ],
    common_mistakes: [
      'Pressing forward instead of up',
      'Using too much back arch',
      'Not achieving full lockout'
    ],
    variations: [
      'Dumbbell shoulder press',
      'Seated overhead press',
      'Push press',
      'Single-arm press'
    ],
    calories_per_minute: 6,
    is_compound: true,
    is_unilateral: false,
    created_by: 'system',
    popularity_score: 78,
    safety_rating: 3,
    tags: ['compound', 'shoulders', 'core', 'functional']
  },

  // CARDIO EXERCISES
  {
    id: 'burpees',
    name: 'Burpees',
    description: 'Full-body explosive exercise combining squat, plank, and jump movements.',
    instructions: [
      'Start standing with feet shoulder-width apart',
      'Drop into squat position and place hands on floor',
      'Jump feet back into plank position',
      'Perform push-up (optional)',
      'Jump feet back to squat, then jump up with arms overhead'
    ],
    muscle_groups: ['full_body', 'cardiovascular'],
    equipment: [],
    difficulty_level: 'intermediate',
    exercise_type: 'plyometric',
    demo_image_url: 'https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg',
    alternative_names: ['squat thrusts'],
    tips: [
      'Maintain steady rhythm',
      'Land softly on jumps',
      'Modify by stepping instead of jumping'
    ],
    common_mistakes: [
      'Rushing through movements',
      'Poor plank position',
      'Landing hard on jumps'
    ],
    variations: [
      'Half burpees (no push-up)',
      'Burpee box jumps',
      'Single-leg burpees',
      'Burpee pull-ups'
    ],
    calories_per_minute: 15,
    is_compound: true,
    is_unilateral: false,
    created_by: 'system',
    popularity_score: 82,
    safety_rating: 3,
    tags: ['hiit', 'cardio', 'full_body', 'metabolic']
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    description: 'Dynamic cardio exercise targeting core while elevating heart rate.',
    instructions: [
      'Start in plank position with hands under shoulders',
      'Keep core engaged and body straight',
      'Alternate bringing knees toward chest rapidly',
      'Maintain plank position throughout',
      'Keep hips level and avoid bouncing'
    ],
    muscle_groups: ['core', 'shoulders', 'cardiovascular'],
    equipment: [],
    difficulty_level: 'beginner',
    exercise_type: 'cardio',
    demo_image_url: 'https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg',
    alternative_names: ['running planks'],
    tips: [
      'Start slow and build up speed',
      'Keep shoulders over wrists',
      'Breathe steadily throughout'
    ],
    common_mistakes: [
      'Letting hips pike up',
      'Moving too fast without control',
      'Not bringing knees high enough'
    ],
    variations: [
      'Cross-body mountain climbers',
      'Slow mountain climbers',
      'Mountain climber twists'
    ],
    calories_per_minute: 12,
    is_compound: true,
    is_unilateral: false,
    created_by: 'system',
    popularity_score: 80,
    safety_rating: 4,
    tags: ['cardio', 'core', 'hiit', 'bodyweight']
  },

  // CORE EXERCISES
  {
    id: 'plank',
    name: 'Plank',
    description: 'Isometric core exercise building stability and endurance.',
    instructions: [
      'Start in push-up position',
      'Lower to forearms with elbows under shoulders',
      'Keep body straight from head to heels',
      'Engage core and glutes',
      'Hold position while breathing normally'
    ],
    muscle_groups: ['core', 'shoulders', 'glutes'],
    equipment: [],
    difficulty_level: 'beginner',
    exercise_type: 'strength',
    demo_image_url: 'https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg',
    alternative_names: ['forearm plank', 'front plank'],
    tips: [
      'Keep hips level - no sagging or piking',
      'Breathe normally throughout hold',
      'Start with shorter holds and build up'
    ],
    common_mistakes: [
      'Letting hips sag',
      'Holding breath',
      'Looking up instead of down'
    ],
    variations: [
      'Side planks',
      'Plank up-downs',
      'Plank with leg lifts',
      'Single-arm planks'
    ],
    calories_per_minute: 4,
    is_compound: true,
    is_unilateral: false,
    created_by: 'system',
    popularity_score: 88,
    safety_rating: 5,
    tags: ['core', 'isometric', 'stability', 'beginner_friendly']
  },

  // FLEXIBILITY EXERCISES
  {
    id: 'downward-dog',
    name: 'Downward Facing Dog',
    description: 'Yoga pose stretching hamstrings, calves, and shoulders while building strength.',
    instructions: [
      'Start on hands and knees',
      'Tuck toes under and lift hips up and back',
      'Straighten legs and arms to form inverted V',
      'Press hands firmly into ground',
      'Pedal feet to deepen calf stretch'
    ],
    muscle_groups: ['hamstrings', 'calves', 'shoulders', 'back'],
    equipment: ['yoga_mat'],
    difficulty_level: 'beginner',
    exercise_type: 'flexibility',
    demo_image_url: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg',
    alternative_names: ['adho mukha svanasana'],
    tips: [
      'Bend knees if hamstrings are tight',
      'Focus on lengthening spine',
      'Distribute weight evenly between hands and feet'
    ],
    common_mistakes: [
      'Placing too much weight on hands',
      'Rounding the back',
      'Holding breath'
    ],
    variations: [
      'Three-legged dog',
      'Twisted downward dog',
      'Puppy pose (easier)'
    ],
    calories_per_minute: 3,
    is_compound: true,
    is_unilateral: false,
    created_by: 'system',
    popularity_score: 75,
    safety_rating: 5,
    tags: ['yoga', 'flexibility', 'stretching', 'recovery']
  }
];

// Utility functions for exercise database
export const getExercisesByMuscleGroup = (muscleGroup: string): ExerciseData[] => {
  return EXERCISE_DATABASE.filter(exercise => 
    exercise.muscle_groups.includes(muscleGroup.toLowerCase())
  );
};

export const getExercisesByEquipment = (equipment: string[]): ExerciseData[] => {
  if (equipment.length === 0) {
    return EXERCISE_DATABASE.filter(exercise => exercise.equipment.length === 0);
  }
  
  return EXERCISE_DATABASE.filter(exercise => 
    exercise.equipment.every(eq => equipment.includes(eq)) ||
    exercise.equipment.length === 0
  );
};

export const getExercisesByDifficulty = (difficulty: string): ExerciseData[] => {
  return EXERCISE_DATABASE.filter(exercise => exercise.difficulty_level === difficulty);
};

export const getExercisesByType = (type: string): ExerciseData[] => {
  return EXERCISE_DATABASE.filter(exercise => exercise.exercise_type === type);
};

export const searchExercises = (query: string): ExerciseData[] => {
  const lowercaseQuery = query.toLowerCase();
  return EXERCISE_DATABASE.filter(exercise =>
    exercise.name.toLowerCase().includes(lowercaseQuery) ||
    exercise.description.toLowerCase().includes(lowercaseQuery) ||
    exercise.alternative_names.some(name => name.toLowerCase().includes(lowercaseQuery)) ||
    exercise.muscle_groups.some(muscle => muscle.toLowerCase().includes(lowercaseQuery)) ||
    exercise.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getPopularExercises = (limit: number = 10): ExerciseData[] => {
  return EXERCISE_DATABASE
    .sort((a, b) => b.popularity_score - a.popularity_score)
    .slice(0, limit);
};

export const getCompoundExercises = (): ExerciseData[] => {
  return EXERCISE_DATABASE.filter(exercise => exercise.is_compound);
};

export const getUnilateralExercises = (): ExerciseData[] => {
  return EXERCISE_DATABASE.filter(exercise => exercise.is_unilateral);
};

export const getExerciseById = (id: string): ExerciseData | undefined => {
  return EXERCISE_DATABASE.find(exercise => exercise.id === id);
};

export const getRandomExercises = (count: number = 5): ExerciseData[] => {
  const shuffled = [...EXERCISE_DATABASE].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'core', 'abs', 'obliques', 'lower_back',
  'quadriceps', 'hamstrings', 'glutes', 'calves',
  'full_body', 'cardiovascular'
];

export const EQUIPMENT_LIST = [
  'barbell', 'dumbbells', 'kettlebell', 'resistance_bands',
  'pull_up_bar', 'bench', 'yoga_mat', 'medicine_ball',
  'cable_machine', 'smith_machine', 'squat_rack',
  'step_platform', 'stability_ball', 'foam_roller'
];

export const EXERCISE_TYPES = [
  'strength', 'cardio', 'flexibility', 'balance', 'plyometric'
];
