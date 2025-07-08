import { WorkoutSession } from '@/types/workout';
import { PersonalRecord } from '@/types/personalRecord';
import { WorkoutRecommendation, RecommendedExercise, UserProfile, RecommendationSource } from '@/types/aiRecommendation';
import { PatternAnalysis } from './patternAnalysis';

export class WorkoutRecommendationEngine {
  private static exerciseDatabase = {
    chest: [
      { name: 'Bench Press', difficulty: 'intermediate', equipment: 'barbell' },
      { name: 'Push-ups', difficulty: 'beginner', equipment: 'bodyweight' },
      { name: 'Dumbbell Flyes', difficulty: 'intermediate', equipment: 'dumbbells' },
      { name: 'Incline Bench Press', difficulty: 'advanced', equipment: 'barbell' },
      { name: 'Chest Dips', difficulty: 'intermediate', equipment: 'bodyweight' }
    ],
    back: [
      { name: 'Pull-ups', difficulty: 'intermediate', equipment: 'bodyweight' },
      { name: 'Bent-over Rows', difficulty: 'intermediate', equipment: 'barbell' },
      { name: 'Lat Pulldowns', difficulty: 'beginner', equipment: 'machine' },
      { name: 'Deadlifts', difficulty: 'advanced', equipment: 'barbell' },
      { name: 'T-Bar Rows', difficulty: 'intermediate', equipment: 'barbell' }
    ],
    legs: [
      { name: 'Squats', difficulty: 'intermediate', equipment: 'barbell' },
      { name: 'Lunges', difficulty: 'beginner', equipment: 'bodyweight' },
      { name: 'Leg Press', difficulty: 'beginner', equipment: 'machine' },
      { name: 'Romanian Deadlifts', difficulty: 'intermediate', equipment: 'barbell' },
      { name: 'Bulgarian Split Squats', difficulty: 'advanced', equipment: 'bodyweight' }
    ],
    shoulders: [
      { name: 'Overhead Press', difficulty: 'intermediate', equipment: 'barbell' },
      { name: 'Lateral Raises', difficulty: 'beginner', equipment: 'dumbbells' },
      { name: 'Face Pulls', difficulty: 'intermediate', equipment: 'cable' },
      { name: 'Handstand Push-ups', difficulty: 'advanced', equipment: 'bodyweight' },
      { name: 'Arnold Press', difficulty: 'intermediate', equipment: 'dumbbells' }
    ],
    arms: [
      { name: 'Bicep Curls', difficulty: 'beginner', equipment: 'dumbbells' },
      { name: 'Tricep Dips', difficulty: 'intermediate', equipment: 'bodyweight' },
      { name: 'Hammer Curls', difficulty: 'beginner', equipment: 'dumbbells' },
      { name: 'Close-grip Bench Press', difficulty: 'intermediate', equipment: 'barbell' },
      { name: 'Chin-ups', difficulty: 'intermediate', equipment: 'bodyweight' }
    ],
    core: [
      { name: 'Plank', difficulty: 'beginner', equipment: 'bodyweight' },
      { name: 'Russian Twists', difficulty: 'beginner', equipment: 'bodyweight' },
      { name: 'Dead Bug', difficulty: 'intermediate', equipment: 'bodyweight' },
      { name: 'Hanging Leg Raises', difficulty: 'advanced', equipment: 'bodyweight' },
      { name: 'Ab Wheel Rollouts', difficulty: 'advanced', equipment: 'equipment' }
    ]
  };

  // Generate workout recommendations based on user data
  static generateRecommendations(
    workouts: WorkoutSession[],
    personalRecords: PersonalRecord[],
    userProfile?: UserProfile
  ): WorkoutRecommendation[] {
    const profile = userProfile || PatternAnalysis.createUserProfile(workouts);
    const recommendations: WorkoutRecommendation[] = [];

    // Analyze current patterns
    const muscleAnalysis = PatternAnalysis.analyzeMuscleGroupPatterns(workouts);
    const frequencyAnalysis = PatternAnalysis.analyzeWorkoutFrequency(workouts);
    const intensityAnalysis = PatternAnalysis.analyzeIntensityPatterns(workouts);
    const progressAnalysis = PatternAnalysis.analyzeProgressTrends(personalRecords);

    // Generate different types of recommendations
    recommendations.push(...this.generateMuscleGroupRecommendations(muscleAnalysis, profile));
    recommendations.push(...this.generateRecoveryRecommendations(intensityAnalysis, profile));
    recommendations.push(...this.generateProgressRecommendations(progressAnalysis, profile));
    recommendations.push(...this.generateVarietyRecommendations(workouts, profile));

    // Sort by priority and confidence
    return recommendations
      .sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      })
      .slice(0, 5); // Return top 5 recommendations
  }

  // Generate recommendations for neglected muscle groups
  private static generateMuscleGroupRecommendations(
    muscleAnalysis: any,
    profile: UserProfile
  ): WorkoutRecommendation[] {
    const recommendations: WorkoutRecommendation[] = [];

    if (muscleAnalysis.needsAttention.length > 0) {
      const targetMuscleGroup = muscleAnalysis.needsAttention[0].toLowerCase();
      const exercises = this.selectExercisesForMuscleGroup(targetMuscleGroup, profile);

      if (exercises.length > 0) {
        recommendations.push({
          id: `muscle_focus_${targetMuscleGroup}_${Date.now()}`,
          title: `${muscleAnalysis.needsAttention[0]} Focus Workout`,
          description: `Target your neglected ${muscleAnalysis.needsAttention[0].toLowerCase()} muscles with this focused session`,
          confidence: 85,
          reasoning: [
            `${muscleAnalysis.needsAttention[0]} hasn't been trained recently`,
            'Balanced muscle development is important for overall strength',
            'Preventing muscle imbalances reduces injury risk'
          ],
          estimatedDuration: profile.availableTime,
          difficulty: profile.fitnessLevel,
          workoutType: 'strength',
          targetMuscleGroups: [muscleAnalysis.needsAttention[0]],
          exercises,
          tags: ['muscle_focus', 'balance', 'strength'],
          priority: 'high',
          createdAt: new Date().toISOString(),
          basedOn: [
            {
              type: 'workout_history',
              description: `${muscleAnalysis.needsAttention[0]} not trained in recent sessions`,
              weight: 0.8
            }
          ]
        });
      }
    }

    return recommendations;
  }

  // Generate recovery-focused recommendations
  private static generateRecoveryRecommendations(
    intensityAnalysis: any,
    profile: UserProfile
  ): WorkoutRecommendation[] {
    const recommendations: WorkoutRecommendation[] = [];

    if (intensityAnalysis.recoveryNeeded) {
      const recoveryExercises: RecommendedExercise[] = [
        {
          name: 'Light Walking',
          category: 'cardio',
          muscleGroups: ['Full Body'],
          sets: 1,
          reps: [],
          restSeconds: 0,
          duration: 20,
          notes: 'Keep pace comfortable and relaxed',
          confidence: 95
        },
        {
          name: 'Dynamic Stretching',
          category: 'flexibility',
          muscleGroups: ['Full Body'],
          sets: 1,
          reps: [10],
          restSeconds: 30,
          notes: 'Focus on major muscle groups',
          confidence: 90
        },
        {
          name: 'Foam Rolling',
          category: 'recovery',
          muscleGroups: ['Full Body'],
          sets: 1,
          reps: [],
          restSeconds: 0,
          duration: 15,
          notes: 'Target tight areas from recent workouts',
          confidence: 85
        }
      ];

      recommendations.push({
        id: `recovery_${Date.now()}`,
        title: 'Active Recovery Session',
        description: 'Low-intensity activities to promote recovery and reduce muscle tension',
        confidence: 90,
        reasoning: [
          'Recent workouts have been high intensity',
          'Active recovery promotes blood flow and healing',
          'Prevents overtraining and burnout'
        ],
        estimatedDuration: 45,
        difficulty: 'beginner',
        workoutType: 'flexibility',
        targetMuscleGroups: ['Full Body'],
        exercises: recoveryExercises,
        tags: ['recovery', 'low_intensity', 'flexibility'],
        priority: 'high',
        createdAt: new Date().toISOString(),
        basedOn: [
          {
            type: 'recovery_pattern',
            description: 'High intensity detected in recent sessions',
            weight: 0.9
          }
        ]
      });
    }

    return recommendations;
  }

  // Generate recommendations based on progress patterns
  private static generateProgressRecommendations(
    progressAnalysis: any,
    profile: UserProfile
  ): WorkoutRecommendation[] {
    const recommendations: WorkoutRecommendation[] = [];

    if (progressAnalysis.plateauExercises.length > 0) {
      const plateauExercise = progressAnalysis.plateauExercises[0];
      const muscleGroup = this.inferMuscleGroupFromExercise(plateauExercise);
      const exercises = this.selectVariationExercises(plateauExercise, muscleGroup, profile);

      recommendations.push({
        id: `plateau_breaker_${Date.now()}`,
        title: 'Plateau Breaker Workout',
        description: `Break through your ${plateauExercise} plateau with exercise variations and new stimuli`,
        confidence: 80,
        reasoning: [
          `No recent progress in ${plateauExercise}`,
          'Exercise variations can stimulate new adaptations',
          'Different rep ranges may unlock progress'
        ],
        estimatedDuration: profile.availableTime,
        difficulty: profile.fitnessLevel,
        workoutType: 'strength',
        targetMuscleGroups: [muscleGroup],
        exercises,
        tags: ['plateau_breaker', 'variation', 'progress'],
        priority: 'medium',
        createdAt: new Date().toISOString(),
        basedOn: [
          {
            type: 'progress_trend',
            description: `Plateau detected in ${plateauExercise}`,
            weight: 0.7
          }
        ]
      });
    }

    return recommendations;
  }

  // Generate variety-focused recommendations
  private static generateVarietyRecommendations(
    workouts: WorkoutSession[],
    profile: UserProfile
  ): WorkoutRecommendation[] {
    const recommendations: WorkoutRecommendation[] = [];

    // Check if user has been doing similar workouts
    const recentWorkouts = workouts.slice(0, 5);
    const exerciseNames = new Set();
    recentWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseNames.add(exercise.name);
      });
    });

    if (exerciseNames.size < 10 && workouts.length > 5) {
      const newExercises = this.selectNovelExercises(Array.from(exerciseNames), profile);

      recommendations.push({
        id: `variety_${Date.now()}`,
        title: 'Variety Challenge Workout',
        description: 'Try new exercises to challenge your body in different ways and prevent boredom',
        confidence: 70,
        reasoning: [
          'Recent workouts have used similar exercises',
          'Exercise variety prevents adaptation plateaus',
          'New movements challenge stabilizer muscles'
        ],
        estimatedDuration: profile.availableTime,
        difficulty: profile.fitnessLevel,
        workoutType: 'mixed',
        targetMuscleGroups: ['Full Body'],
        exercises: newExercises,
        tags: ['variety', 'challenge', 'new_exercises'],
        priority: 'low',
        createdAt: new Date().toISOString(),
        basedOn: [
          {
            type: 'variety_need',
            description: 'Limited exercise variety in recent sessions',
            weight: 0.6
          }
        ]
      });
    }

    return recommendations;
  }

  // Helper method to select exercises for a specific muscle group
  private static selectExercisesForMuscleGroup(
    muscleGroup: string,
    profile: UserProfile
  ): RecommendedExercise[] {
    const exercises = this.exerciseDatabase[muscleGroup as keyof typeof this.exerciseDatabase] || [];
    
    return exercises
      .filter(exercise => {
        // Filter by difficulty level
        const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
        const userLevel = difficultyOrder.indexOf(profile.fitnessLevel);
        const exerciseLevel = difficultyOrder.indexOf(exercise.difficulty);
        return exerciseLevel <= userLevel + 1; // Allow one level above user's level
      })
      .slice(0, 4) // Take first 4 exercises
      .map((exercise, index) => ({
        name: exercise.name,
        category: 'strength',
        muscleGroups: [muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1)],
        sets: profile.fitnessLevel === 'beginner' ? 3 : 4,
        reps: this.getRecommendedReps(exercise.difficulty, index),
        restSeconds: this.getRecommendedRest(exercise.difficulty),
        confidence: 85 - (index * 5) // Decrease confidence for later exercises
      }));
  }

  // Helper method to select variation exercises for plateau breaking
  private static selectVariationExercises(
    plateauExercise: string,
    muscleGroup: string,
    profile: UserProfile
  ): RecommendedExercise[] {
    const exercises = this.exerciseDatabase[muscleGroup.toLowerCase() as keyof typeof this.exerciseDatabase] || [];
    
    // Filter out the plateau exercise and select variations
    const variations = exercises
      .filter(exercise => exercise.name !== plateauExercise)
      .slice(0, 3);

    return variations.map((exercise, index) => ({
      name: exercise.name,
      category: 'strength',
      muscleGroups: [muscleGroup],
      sets: 4, // Higher volume for plateau breaking
      reps: this.getPlateauBreakerReps(index),
      restSeconds: this.getRecommendedRest(exercise.difficulty),
      notes: index === 0 ? 'Focus on perfect form with this variation' : undefined,
      confidence: 80 - (index * 5)
    }));
  }

  // Helper method to select novel exercises
  private static selectNovelExercises(
    recentExercises: string[],
    profile: UserProfile
  ): RecommendedExercise[] {
    const allExercises = Object.values(this.exerciseDatabase).flat();
    const novelExercises = allExercises
      .filter(exercise => !recentExercises.includes(exercise.name))
      .slice(0, 5);

    return novelExercises.map((exercise, index) => ({
      name: exercise.name,
      category: 'strength',
      muscleGroups: [this.inferMuscleGroupFromExercise(exercise.name)],
      sets: 3,
      reps: [8, 10, 12],
      restSeconds: 60,
      notes: index === 0 ? 'New exercise - start with lighter weight' : undefined,
      confidence: 70 - (index * 3)
    }));
  }

  // Helper method to infer muscle group from exercise name
  private static inferMuscleGroupFromExercise(exerciseName: string): string {
    const name = exerciseName.toLowerCase();
    if (name.includes('chest') || name.includes('bench') || name.includes('push')) return 'Chest';
    if (name.includes('back') || name.includes('row') || name.includes('pull')) return 'Back';
    if (name.includes('shoulder') || name.includes('press')) return 'Shoulders';
    if (name.includes('leg') || name.includes('squat')) return 'Legs';
    if (name.includes('arm') || name.includes('bicep') || name.includes('tricep')) return 'Arms';
    if (name.includes('core') || name.includes('ab')) return 'Core';
    return 'Full Body';
  }

  // Helper method to get recommended reps based on difficulty and position
  private static getRecommendedReps(difficulty: string, position: number): number[] {
    const repRanges = {
      beginner: [[8, 10, 12], [10, 12, 15], [12, 15, 20]],
      intermediate: [[6, 8, 10], [8, 10, 12], [10, 12, 15]],
      advanced: [[4, 6, 8], [6, 8, 10], [8, 10, 12]]
    };

    return repRanges[difficulty as keyof typeof repRanges][position] || [8, 10, 12];
  }

  // Helper method to get plateau breaker reps (varied rep ranges)
  private static getPlateauBreakerReps(position: number): number[] {
    const repVariations = [
      [3, 4, 5], // Heavy strength
      [6, 8, 10], // Moderate
      [12, 15, 20] // High volume
    ];

    return repVariations[position] || [8, 10, 12];
  }

  // Helper method to get recommended rest time
  private static getRecommendedRest(difficulty: string): number {
    const restTimes = {
      beginner: 60,
      intermediate: 90,
      advanced: 120
    };

    return restTimes[difficulty as keyof typeof restTimes] || 60;
  }
}
