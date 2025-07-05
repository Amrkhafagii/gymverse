import { ExerciseData, EXERCISE_DATABASE } from '@/lib/data/exerciseDatabase';

export interface WorkoutGoal {
  type: 'strength' | 'endurance' | 'weight_loss' | 'muscle_gain' | 'general_fitness';
  target_muscle_groups?: string[];
  duration_minutes?: number;
  difficulty_preference?: 'beginner' | 'intermediate' | 'advanced';
  equipment_available?: string[];
}

export interface WorkoutHistory {
  date: string;
  exercises: string[];
  muscle_groups: string[];
  duration_minutes: number;
  intensity: number; // 1-10 scale
  workout_type: string;
}

export interface AIWorkoutSuggestion {
  id: string;
  name: string;
  description: string;
  estimated_duration: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  exercises: {
    exercise_id: string;
    sets: number;
    reps: number[];
    rest_seconds: number;
    notes?: string;
  }[];
  reasoning: string;
  focus_areas: string[];
  calories_estimate: number;
}

export interface RestDayRecommendation {
  id: string;
  recommendation_type: 'mandatory' | 'suggested' | 'optional';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning: string[];
  suggested_activities: {
    type: 'active_recovery' | 'complete_rest' | 'light_activity';
    activities: string[];
    duration_minutes?: number;
  }[];
  recovery_indicators: {
    muscle_fatigue: number; // 1-10 scale
    intensity_overload: number; // 1-10 scale
    frequency_concern: number; // 1-10 scale
    overall_stress: number; // 1-10 scale
  };
  next_workout_suggestions: {
    recommended_intensity: 'light' | 'moderate' | 'high';
    focus_areas: string[];
    avoid_muscle_groups: string[];
  };
  estimated_recovery_time: number; // hours
}

export interface FormTip {
  id: string;
  exercise_id: string;
  tip_type: 'setup' | 'execution' | 'breathing' | 'common_mistake' | 'progression' | 'safety';
  priority: 'critical' | 'important' | 'helpful';
  title: string;
  description: string;
  visual_cue?: string;
  body_part_focus?: string[];
}

export interface PersonalizedFormGuidance {
  id: string;
  exercise_id: string;
  user_level: 'beginner' | 'intermediate' | 'advanced';
  primary_tips: FormTip[];
  common_mistakes: FormTip[];
  progression_tips: FormTip[];
  safety_reminders: FormTip[];
  breathing_pattern: {
    inhale_phase: string;
    exhale_phase: string;
    hold_points?: string[];
  };
  tempo_guidance: {
    eccentric_seconds: number; // lowering phase
    pause_seconds: number; // bottom position
    concentric_seconds: number; // lifting phase
    rest_seconds: number; // top position
  };
  muscle_activation_cues: {
    primary_muscles: string[];
    activation_tips: string[];
    mind_muscle_connection: string[];
  };
  form_checkpoints: {
    setup: string[];
    during_movement: string[];
    completion: string[];
  };
}

class AIWorkoutService {
  private analyzeWorkoutHistory(history: WorkoutHistory[]): {
    frequent_muscle_groups: string[];
    neglected_muscle_groups: string[];
    average_intensity: number;
    workout_frequency: number;
    preferred_duration: number;
    recovery_patterns: string[];
  } {
    if (history.length === 0) {
      return {
        frequent_muscle_groups: [],
        neglected_muscle_groups: [],
        average_intensity: 5,
        workout_frequency: 0,
        preferred_duration: 45,
        recovery_patterns: []
      };
    }

    // Analyze muscle group frequency
    const muscleGroupCount: Record<string, number> = {};
    let totalIntensity = 0;
    let totalDuration = 0;

    history.forEach(workout => {
      workout.muscle_groups.forEach(group => {
        muscleGroupCount[group] = (muscleGroupCount[group] || 0) + 1;
      });
      totalIntensity += workout.intensity;
      totalDuration += workout.duration_minutes;
    });

    const allMuscleGroups = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'glutes', 'core'];
    const frequent_muscle_groups = Object.entries(muscleGroupCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([group]) => group);

    const neglected_muscle_groups = allMuscleGroups.filter(
      group => !muscleGroupCount[group] || muscleGroupCount[group] < history.length * 0.3
    );

    // Calculate workout frequency (workouts per week)
    const dateRange = new Date(history[0].date).getTime() - new Date(history[history.length - 1].date).getTime();
    const weeks = Math.max(1, dateRange / (7 * 24 * 60 * 60 * 1000));
    const workout_frequency = history.length / weeks;

    return {
      frequent_muscle_groups,
      neglected_muscle_groups,
      average_intensity: totalIntensity / history.length,
      workout_frequency,
      preferred_duration: totalDuration / history.length,
      recovery_patterns: this.analyzeRecoveryPatterns(history)
    };
  }

  private analyzeRecoveryPatterns(history: WorkoutHistory[]): string[] {
    const patterns: string[] = [];
    
    // Check for consecutive high-intensity days
    let consecutiveHighIntensity = 0;
    for (let i = 0; i < history.length - 1; i++) {
      if (history[i].intensity >= 7) {
        consecutiveHighIntensity++;
      } else {
        if (consecutiveHighIntensity >= 3) {
          patterns.push('frequent_high_intensity');
        }
        consecutiveHighIntensity = 0;
      }
    }

    // Check for muscle group overuse
    const recentWorkouts = history.slice(0, 7); // Last 7 workouts
    const muscleGroupFreq: Record<string, number> = {};
    recentWorkouts.forEach(workout => {
      workout.muscle_groups.forEach(group => {
        muscleGroupFreq[group] = (muscleGroupFreq[group] || 0) + 1;
      });
    });

    Object.entries(muscleGroupFreq).forEach(([group, count]) => {
      if (count >= 4) {
        patterns.push(`overuse_${group}`);
      }
    });

    return patterns;
  }

  private analyzeRecoveryNeeds(history: WorkoutHistory[]): {
    muscle_fatigue_score: number;
    intensity_overload_score: number;
    frequency_concern_score: number;
    recent_intensity_trend: 'increasing' | 'decreasing' | 'stable';
    consecutive_high_intensity_days: number;
    days_since_rest: number;
    overused_muscle_groups: string[];
  } {
    if (history.length === 0) {
      return {
        muscle_fatigue_score: 0,
        intensity_overload_score: 0,
        frequency_concern_score: 0,
        recent_intensity_trend: 'stable',
        consecutive_high_intensity_days: 0,
        days_since_rest: 0,
        overused_muscle_groups: []
      };
    }

    const recentWorkouts = history.slice(0, 7); // Last 7 workouts
    const veryRecentWorkouts = history.slice(0, 3); // Last 3 workouts

    // Calculate muscle fatigue score based on recent workout intensity and frequency
    const avgRecentIntensity = recentWorkouts.reduce((sum, w) => sum + w.intensity, 0) / recentWorkouts.length;
    const muscle_fatigue_score = Math.min(10, (avgRecentIntensity * recentWorkouts.length) / 7);

    // Calculate intensity overload score
    const highIntensityWorkouts = recentWorkouts.filter(w => w.intensity >= 8).length;
    const intensity_overload_score = Math.min(10, (highIntensityWorkouts / recentWorkouts.length) * 10);

    // Calculate frequency concern score
    const workoutsPerWeek = recentWorkouts.length;
    const frequency_concern_score = workoutsPerWeek > 6 ? 10 : workoutsPerWeek > 5 ? 7 : workoutsPerWeek > 4 ? 4 : 0;

    // Analyze intensity trend
    let recent_intensity_trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (veryRecentWorkouts.length >= 3) {
      const firstHalf = veryRecentWorkouts.slice(0, 2).reduce((sum, w) => sum + w.intensity, 0) / 2;
      const secondHalf = veryRecentWorkouts.slice(1, 3).reduce((sum, w) => sum + w.intensity, 0) / 2;
      
      if (secondHalf > firstHalf + 1) recent_intensity_trend = 'increasing';
      else if (firstHalf > secondHalf + 1) recent_intensity_trend = 'decreasing';
    }

    // Count consecutive high-intensity days
    let consecutive_high_intensity_days = 0;
    for (const workout of history) {
      if (workout.intensity >= 7) {
        consecutive_high_intensity_days++;
      } else {
        break;
      }
    }

    // Calculate days since last rest (assuming daily workouts in history)
    const days_since_rest = consecutive_high_intensity_days;

    // Find overused muscle groups
    const muscleGroupFreq: Record<string, number> = {};
    recentWorkouts.forEach(workout => {
      workout.muscle_groups.forEach(group => {
        muscleGroupFreq[group] = (muscleGroupFreq[group] || 0) + 1;
      });
    });

    const overused_muscle_groups = Object.entries(muscleGroupFreq)
      .filter(([, count]) => count >= 4)
      .map(([group]) => group);

    return {
      muscle_fatigue_score,
      intensity_overload_score,
      frequency_concern_score,
      recent_intensity_trend,
      consecutive_high_intensity_days,
      days_since_rest,
      overused_muscle_groups
    };
  }

  private generateFormTipsForExercise(exercise: ExerciseData, userLevel: 'beginner' | 'intermediate' | 'advanced'): FormTip[] {
    const tips: FormTip[] = [];
    const baseId = `${exercise.id}_${userLevel}`;

    // Generate setup tips
    if (exercise.exercise_type === 'strength') {
      tips.push({
        id: `${baseId}_setup_1`,
        exercise_id: exercise.id,
        tip_type: 'setup',
        priority: 'critical',
        title: 'Proper Starting Position',
        description: `Position yourself correctly before beginning the ${exercise.name}. Ensure proper alignment and stable base.`,
        body_part_focus: exercise.muscle_groups
      });
    }

    // Generate execution tips based on exercise type
    if (exercise.is_compound) {
      tips.push({
        id: `${baseId}_execution_1`,
        exercise_id: exercise.id,
        tip_type: 'execution',
        priority: 'critical',
        title: 'Compound Movement Control',
        description: 'Focus on coordinating multiple muscle groups. Move with control through the full range of motion.',
        body_part_focus: exercise.muscle_groups
      });
    }

    // Generate breathing tips
    tips.push({
      id: `${baseId}_breathing_1`,
      exercise_id: exercise.id,
      tip_type: 'breathing',
      priority: 'important',
      title: 'Breathing Pattern',
      description: exercise.exercise_type === 'cardio' 
        ? 'Maintain steady, rhythmic breathing throughout the movement'
        : 'Exhale during the exertion phase, inhale during the return phase',
      visual_cue: exercise.exercise_type === 'cardio' ? 'Keep breathing steady' : 'Breathe out on effort'
    });

    // Generate common mistakes based on exercise complexity
    const commonMistakes = this.getCommonMistakes(exercise, userLevel);
    tips.push(...commonMistakes);

    // Generate progression tips for beginners and intermediates
    if (userLevel !== 'advanced') {
      tips.push({
        id: `${baseId}_progression_1`,
        exercise_id: exercise.id,
        tip_type: 'progression',
        priority: 'helpful',
        title: 'Progression Strategy',
        description: userLevel === 'beginner' 
          ? 'Master the basic movement pattern before adding weight or complexity'
          : 'Focus on progressive overload while maintaining perfect form',
        body_part_focus: exercise.muscle_groups
      });
    }

    // Generate safety tips
    tips.push({
      id: `${baseId}_safety_1`,
      exercise_id: exercise.id,
      tip_type: 'safety',
      priority: 'critical',
      title: 'Safety First',
      description: 'Stop immediately if you feel sharp pain. Maintain control throughout the entire movement.',
      visual_cue: 'Listen to your body'
    });

    return tips;
  }

  private getCommonMistakes(exercise: ExerciseData, userLevel: 'beginner' | 'intermediate' | 'advanced'): FormTip[] {
    const mistakes: FormTip[] = [];
    const baseId = `${exercise.id}_${userLevel}`;

    // Common mistakes based on exercise type
    if (exercise.exercise_type === 'strength') {
      if (exercise.muscle_groups.includes('back')) {
        mistakes.push({
          id: `${baseId}_mistake_1`,
          exercise_id: exercise.id,
          tip_type: 'common_mistake',
          priority: 'important',
          title: 'Avoid Rounded Back',
          description: 'Keep your back straight and core engaged. Rounding the back can lead to injury.',
          body_part_focus: ['back', 'core'],
          visual_cue: 'Chest up, shoulders back'
        });
      }

      if (exercise.muscle_groups.includes('shoulders')) {
        mistakes.push({
          id: `${baseId}_mistake_2`,
          exercise_id: exercise.id,
          tip_type: 'common_mistake',
          priority: 'important',
          title: 'Shoulder Impingement Prevention',
          description: 'Avoid lifting shoulders too high or rolling them forward. Keep them down and back.',
          body_part_focus: ['shoulders'],
          visual_cue: 'Shoulders away from ears'
        });
      }

      if (exercise.muscle_groups.includes('quadriceps') || exercise.muscle_groups.includes('glutes')) {
        mistakes.push({
          id: `${baseId}_mistake_3`,
          exercise_id: exercise.id,
          tip_type: 'common_mistake',
          priority: 'critical',
          title: 'Knee Alignment',
          description: 'Keep knees aligned with toes. Avoid letting knees cave inward or drift outward.',
          body_part_focus: ['quadriceps', 'glutes'],
          visual_cue: 'Knees track over toes'
        });
      }
    }

    if (exercise.exercise_type === 'cardio') {
      mistakes.push({
        id: `${baseId}_mistake_cardio_1`,
        exercise_id: exercise.id,
        tip_type: 'common_mistake',
        priority: 'important',
        title: 'Pace Management',
        description: 'Avoid starting too fast. Build intensity gradually to maintain form throughout.',
        visual_cue: 'Start controlled, build intensity'
      });
    }

    return mistakes;
  }

  generatePersonalizedFormGuidance(
    exerciseId: string,
    userLevel: 'beginner' | 'intermediate' | 'advanced',
    userHistory?: WorkoutHistory[]
  ): PersonalizedFormGuidance {
    const exercise = EXERCISE_DATABASE.find(ex => ex.id === exerciseId);
    if (!exercise) {
      throw new Error(`Exercise with id ${exerciseId} not found`);
    }

    const allTips = this.generateFormTipsForExercise(exercise, userLevel);
    
    // Categorize tips
    const primary_tips = allTips.filter(tip => 
      tip.priority === 'critical' && (tip.tip_type === 'setup' || tip.tip_type === 'execution')
    );
    
    const common_mistakes = allTips.filter(tip => tip.tip_type === 'common_mistake');
    const progression_tips = allTips.filter(tip => tip.tip_type === 'progression');
    const safety_reminders = allTips.filter(tip => tip.tip_type === 'safety');

    // Generate breathing pattern
    const breathing_pattern = this.generateBreathingPattern(exercise);
    
    // Generate tempo guidance
    const tempo_guidance = this.generateTempoGuidance(exercise, userLevel);
    
    // Generate muscle activation cues
    const muscle_activation_cues = this.generateMuscleActivationCues(exercise);
    
    // Generate form checkpoints
    const form_checkpoints = this.generateFormCheckpoints(exercise, userLevel);

    return {
      id: `form_guidance_${exerciseId}_${userLevel}_${Date.now()}`,
      exercise_id: exerciseId,
      user_level: userLevel,
      primary_tips,
      common_mistakes,
      progression_tips,
      safety_reminders,
      breathing_pattern,
      tempo_guidance,
      muscle_activation_cues,
      form_checkpoints
    };
  }

  private generateBreathingPattern(exercise: ExerciseData): PersonalizedFormGuidance['breathing_pattern'] {
    if (exercise.exercise_type === 'cardio') {
      return {
        inhale_phase: 'Continuous rhythmic breathing',
        exhale_phase: 'Maintain steady exhale pattern',
        hold_points: ['Avoid holding breath during high intensity']
      };
    }

    if (exercise.exercise_type === 'strength') {
      return {
        inhale_phase: 'Inhale during the lowering/eccentric phase',
        exhale_phase: 'Exhale during the lifting/concentric phase',
        hold_points: ['Brief hold at top of movement', 'Maintain core tension throughout']
      };
    }

    return {
      inhale_phase: 'Inhale during preparation phase',
      exhale_phase: 'Exhale during active phase',
      hold_points: ['Hold briefly at peak stretch']
    };
  }

  private generateTempoGuidance(exercise: ExerciseData, userLevel: 'beginner' | 'intermediate' | 'advanced'): PersonalizedFormGuidance['tempo_guidance'] {
    const baseTempos = {
      beginner: { eccentric: 3, pause: 1, concentric: 2, rest: 1 },
      intermediate: { eccentric: 2, pause: 1, concentric: 1, rest: 1 },
      advanced: { eccentric: 2, pause: 0, concentric: 1, rest: 0 }
    };

    const tempo = baseTempos[userLevel];

    if (exercise.exercise_type === 'cardio') {
      return {
        eccentric_seconds: 0,
        pause_seconds: 0,
        concentric_seconds: 0,
        rest_seconds: 0
      };
    }

    return {
      eccentric_seconds: tempo.eccentric,
      pause_seconds: tempo.pause,
      concentric_seconds: tempo.concentric,
      rest_seconds: tempo.rest
    };
  }

  private generateMuscleActivationCues(exercise: ExerciseData): PersonalizedFormGuidance['muscle_activation_cues'] {
    const activationTips: string[] = [];
    const mindMuscleTips: string[] = [];

    exercise.muscle_groups.forEach(muscle => {
      switch (muscle) {
        case 'chest':
          activationTips.push('Squeeze chest muscles at the top of the movement');
          mindMuscleTips.push('Visualize pushing the weight with your chest, not just your arms');
          break;
        case 'back':
          activationTips.push('Pull shoulder blades together and down');
          mindMuscleTips.push('Think about pulling with your back muscles, not just your arms');
          break;
        case 'shoulders':
          activationTips.push('Keep shoulders stable and engaged');
          mindMuscleTips.push('Focus on controlled shoulder movement');
          break;
        case 'core':
          activationTips.push('Brace your core as if someone is about to punch your stomach');
          mindMuscleTips.push('Maintain constant core tension throughout the movement');
          break;
        case 'glutes':
          activationTips.push('Squeeze glutes at the top of the movement');
          mindMuscleTips.push('Drive through your heels and think about pushing the floor away');
          break;
        case 'quadriceps':
          activationTips.push('Feel the tension in your front thigh muscles');
          mindMuscleTips.push('Focus on controlled knee extension');
          break;
        case 'hamstrings':
          activationTips.push('Feel the stretch and contraction in your back thigh muscles');
          mindMuscleTips.push('Think about pulling your heel toward your glutes');
          break;
      }
    });

    return {
      primary_muscles: exercise.muscle_groups,
      activation_tips: [...new Set(activationTips)],
      mind_muscle_connection: [...new Set(mindMuscleTips)]
    };
  }

  private generateFormCheckpoints(exercise: ExerciseData, userLevel: 'beginner' | 'intermediate' | 'advanced'): PersonalizedFormGuidance['form_checkpoints'] {
    const setup: string[] = [
      'Check starting position and alignment',
      'Ensure proper grip/stance width',
      'Engage core and stabilizing muscles'
    ];

    const during_movement: string[] = [
      'Maintain controlled tempo',
      'Keep proper breathing pattern',
      'Monitor joint alignment'
    ];

    const completion: string[] = [
      'Return to starting position with control',
      'Maintain tension until set completion',
      'Reset form between reps if needed'
    ];

    // Add exercise-specific checkpoints
    if (exercise.is_compound) {
      during_movement.push('Coordinate multiple muscle groups');
      during_movement.push('Maintain balance and stability');
    }

    if (exercise.muscle_groups.includes('back')) {
      setup.push('Retract and depress shoulder blades');
      during_movement.push('Keep chest up and back straight');
    }

    if (exercise.muscle_groups.includes('core')) {
      setup.push('Brace core before movement');
      during_movement.push('Maintain core tension throughout');
    }

    return {
      setup,
      during_movement,
      completion
    };
  }

  generateRestDayRecommendation(
    history: WorkoutHistory[],
    userProfile?: {
      fitness_level?: 'beginner' | 'intermediate' | 'advanced';
      recovery_preference?: 'active' | 'passive';
    }
  ): RestDayRecommendation {
    const recoveryAnalysis = this.analyzeRecoveryNeeds(history);
    const workoutAnalysis = this.analyzeWorkoutHistory(history);

    // Determine recommendation type and priority
    let recommendation_type: RestDayRecommendation['recommendation_type'] = 'optional';
    let priority: RestDayRecommendation['priority'] = 'low';

    const overallStress = Math.max(
      recoveryAnalysis.muscle_fatigue_score,
      recoveryAnalysis.intensity_overload_score,
      recoveryAnalysis.frequency_concern_score
    );

    if (overallStress >= 8 || recoveryAnalysis.consecutive_high_intensity_days >= 4) {
      recommendation_type = 'mandatory';
      priority = 'high';
    } else if (overallStress >= 6 || recoveryAnalysis.consecutive_high_intensity_days >= 3) {
      recommendation_type = 'suggested';
      priority = 'medium';
    }

    // Generate reasoning
    const reasoning: string[] = [];
    
    if (recoveryAnalysis.muscle_fatigue_score >= 7) {
      reasoning.push(`High muscle fatigue detected (${recoveryAnalysis.muscle_fatigue_score.toFixed(1)}/10)`);
    }
    
    if (recoveryAnalysis.intensity_overload_score >= 7) {
      reasoning.push(`Intensity overload risk identified from recent high-intensity sessions`);
    }
    
    if (recoveryAnalysis.consecutive_high_intensity_days >= 3) {
      reasoning.push(`${recoveryAnalysis.consecutive_high_intensity_days} consecutive high-intensity days detected`);
    }
    
    if (recoveryAnalysis.overused_muscle_groups.length > 0) {
      reasoning.push(`Overuse detected in: ${recoveryAnalysis.overused_muscle_groups.join(', ')}`);
    }
    
    if (recoveryAnalysis.recent_intensity_trend === 'increasing') {
      reasoning.push('Intensity trend is increasing, recovery break recommended');
    }

    if (reasoning.length === 0) {
      reasoning.push('Preventive rest to maintain optimal performance and reduce injury risk');
    }

    // Generate suggested activities
    const suggested_activities: RestDayRecommendation['suggested_activities'] = [];

    if (recommendation_type === 'mandatory' || priority === 'high') {
      suggested_activities.push({
        type: 'complete_rest',
        activities: [
          'Complete rest and sleep optimization',
          'Gentle stretching (5-10 minutes)',
          'Meditation or relaxation techniques',
          'Hydration focus and nutrition recovery'
        ]
      });
    }

    if (recommendation_type !== 'mandatory') {
      suggested_activities.push({
        type: 'active_recovery',
        activities: [
          'Light walking (20-30 minutes)',
          'Gentle yoga or stretching routine',
          'Foam rolling and mobility work',
          'Swimming at easy pace'
        ],
        duration_minutes: 30
      });
    }

    suggested_activities.push({
      type: 'light_activity',
      activities: [
        'Leisurely bike ride',
        'Easy hiking or nature walk',
        'Recreational sports at low intensity',
        'Dancing or movement for fun'
      ],
      duration_minutes: 45
    });

    // Generate next workout suggestions
    const avoid_muscle_groups = recoveryAnalysis.overused_muscle_groups;
    const recommended_intensity = priority === 'high' ? 'light' : priority === 'medium' ? 'moderate' : 'high';
    const focus_areas = workoutAnalysis.neglected_muscle_groups.slice(0, 2);

    // Calculate estimated recovery time
    const estimated_recovery_time = priority === 'high' ? 48 : priority === 'medium' ? 24 : 12;

    // Generate title and description
    const titles = {
      mandatory: 'Rest Day Required',
      suggested: 'Rest Day Recommended',
      optional: 'Consider a Rest Day'
    };

    const descriptions = {
      mandatory: 'Your body needs recovery time. High stress indicators suggest taking a complete rest day.',
      suggested: 'Your workout intensity suggests a rest day would be beneficial for optimal recovery.',
      optional: 'While not critical, a rest day could help maintain your performance and prevent overtraining.'
    };

    return {
      id: `rest_recommendation_${Date.now()}`,
      recommendation_type,
      priority,
      title: titles[recommendation_type],
      description: descriptions[recommendation_type],
      reasoning,
      suggested_activities,
      recovery_indicators: {
        muscle_fatigue: recoveryAnalysis.muscle_fatigue_score,
        intensity_overload: recoveryAnalysis.intensity_overload_score,
        frequency_concern: recoveryAnalysis.frequency_concern_score,
        overall_stress: overallStress
      },
      next_workout_suggestions: {
        recommended_intensity,
        focus_areas,
        avoid_muscle_groups
      },
      estimated_recovery_time
    };
  }

  private selectExercisesForGoal(
    goal: WorkoutGoal,
    analysis: ReturnType<typeof this.analyzeWorkoutHistory>,
    availableExercises: ExerciseData[]
  ): ExerciseData[] {
    let targetExercises = availableExercises;

    // Filter by equipment availability
    if (goal.equipment_available && goal.equipment_available.length > 0) {
      targetExercises = targetExercises.filter(exercise =>
        exercise.equipment.length === 0 || 
        exercise.equipment.every(eq => goal.equipment_available!.includes(eq))
      );
    }

    // Filter by difficulty
    if (goal.difficulty_preference) {
      targetExercises = targetExercises.filter(exercise =>
        exercise.difficulty_level === goal.difficulty_preference
      );
    }

    // Prioritize neglected muscle groups
    const prioritizedExercises = targetExercises.filter(exercise =>
      exercise.muscle_groups.some(group => analysis.neglected_muscle_groups.includes(group))
    );

    // Select exercises based on goal type
    let selectedExercises: ExerciseData[] = [];

    switch (goal.type) {
      case 'strength':
        selectedExercises = [...prioritizedExercises, ...targetExercises]
          .filter(exercise => exercise.is_compound || exercise.exercise_type === 'strength')
          .slice(0, 6);
        break;

      case 'endurance':
        selectedExercises = [...prioritizedExercises, ...targetExercises]
          .filter(exercise => exercise.exercise_type === 'cardio' || exercise.calories_per_minute >= 8)
          .slice(0, 8);
        break;

      case 'weight_loss':
        selectedExercises = [...prioritizedExercises, ...targetExercises]
          .filter(exercise => exercise.calories_per_minute >= 10 || exercise.is_compound)
          .slice(0, 7);
        break;

      case 'muscle_gain':
        selectedExercises = [...prioritizedExercises, ...targetExercises]
          .filter(exercise => exercise.exercise_type === 'strength' && exercise.is_compound)
          .slice(0, 5);
        break;

      case 'general_fitness':
        const strengthExercises = targetExercises.filter(ex => ex.exercise_type === 'strength').slice(0, 3);
        const cardioExercises = targetExercises.filter(ex => ex.exercise_type === 'cardio').slice(0, 2);
        const flexibilityExercises = targetExercises.filter(ex => ex.exercise_type === 'flexibility').slice(0, 1);
        selectedExercises = [...strengthExercises, ...cardioExercises, ...flexibilityExercises];
        break;
    }

    // Ensure we have target muscle groups if specified
    if (goal.target_muscle_groups && goal.target_muscle_groups.length > 0) {
      const muscleGroupExercises = targetExercises.filter(exercise =>
        exercise.muscle_groups.some(group => goal.target_muscle_groups!.includes(group))
      );
      selectedExercises = [...new Set([...selectedExercises, ...muscleGroupExercises])].slice(0, 8);
    }

    return selectedExercises.slice(0, 8);
  }

  private generateWorkoutStructure(
    exercises: ExerciseData[],
    goal: WorkoutGoal,
    analysis: ReturnType<typeof this.analyzeWorkoutHistory>
  ): AIWorkoutSuggestion['exercises'] {
    return exercises.map(exercise => {
      let sets = 3;
      let reps = [12, 10, 8];
      let rest_seconds = 60;

      // Adjust based on goal type
      switch (goal.type) {
        case 'strength':
          sets = 4;
          reps = [6, 5, 4, 3];
          rest_seconds = 120;
          break;

        case 'endurance':
          sets = 3;
          reps = [20, 18, 15];
          rest_seconds = 45;
          break;

        case 'weight_loss':
          sets = 4;
          reps = [15, 15, 12, 10];
          rest_seconds = 30;
          break;

        case 'muscle_gain':
          sets = 4;
          reps = [10, 8, 6, 6];
          rest_seconds = 90;
          break;

        case 'general_fitness':
          sets = 3;
          reps = [12, 10, 8];
          rest_seconds = 60;
          break;
      }

      // Adjust for cardio exercises
      if (exercise.exercise_type === 'cardio') {
        sets = 3;
        reps = [30, 45, 60]; // seconds instead of reps
        rest_seconds = 60;
      }

      // Adjust for flexibility exercises
      if (exercise.exercise_type === 'flexibility') {
        sets = 2;
        reps = [30, 45]; // hold time in seconds
        rest_seconds = 30;
      }

      return {
        exercise_id: exercise.id,
        sets,
        reps,
        rest_seconds,
        notes: this.generateExerciseNotes(exercise, goal)
      };
    });
  }

  private generateExerciseNotes(exercise: ExerciseData, goal: WorkoutGoal): string {
    const notes: string[] = [];

    // Add goal-specific notes
    if (goal.type === 'strength' && exercise.is_compound) {
      notes.push('Focus on progressive overload');
    }

    if (goal.type === 'weight_loss' && exercise.calories_per_minute >= 10) {
      notes.push('Maintain high intensity for maximum calorie burn');
    }

    // Add exercise-specific tips
    if (exercise.tips.length > 0) {
      notes.push(exercise.tips[0]);
    }

    return notes.join('. ');
  }

  private calculateCaloriesEstimate(exercises: AIWorkoutSuggestion['exercises'], duration: number): number {
    const totalCaloriesPerMinute = exercises.reduce((total, exerciseData) => {
      const exercise = EXERCISE_DATABASE.find(ex => ex.id === exerciseData.exercise_id);
      return total + (exercise?.calories_per_minute || 5);
    }, 0);

    return Math.round((totalCaloriesPerMinute / exercises.length) * duration);
  }

  generateWorkoutSuggestion(
    goal: WorkoutGoal,
    history: WorkoutHistory[],
    userProfile?: {
      fitness_level?: 'beginner' | 'intermediate' | 'advanced';
      preferred_duration?: number;
    }
  ): AIWorkoutSuggestion {
    const analysis = this.analyzeWorkoutHistory(history);
    
    // Determine difficulty level
    const difficulty_level = goal.difficulty_preference || 
                           userProfile?.fitness_level || 
                           (analysis.average_intensity >= 7 ? 'advanced' : 
                            analysis.average_intensity >= 5 ? 'intermediate' : 'beginner');

    // Determine duration
    const estimated_duration = goal.duration_minutes || 
                              userProfile?.preferred_duration || 
                              analysis.preferred_duration || 
                              45;

    // Select appropriate exercises
    const availableExercises = EXERCISE_DATABASE.filter(exercise => 
      exercise.difficulty_level === difficulty_level || 
      (difficulty_level === 'intermediate' && exercise.difficulty_level === 'beginner') ||
      (difficulty_level === 'advanced' && exercise.difficulty_level !== 'advanced')
    );

    const selectedExercises = this.selectExercisesForGoal(goal, analysis, availableExercises);
    const workoutStructure = this.generateWorkoutStructure(selectedExercises, goal, analysis);

    // Generate reasoning
    const reasoning = this.generateReasoning(goal, analysis, selectedExercises);

    // Determine focus areas
    const focus_areas = [...new Set(selectedExercises.flatMap(ex => ex.muscle_groups))];

    // Calculate calories estimate
    const calories_estimate = this.calculateCaloriesEstimate(workoutStructure, estimated_duration);

    return {
      id: `ai_workout_${Date.now()}`,
      name: this.generateWorkoutName(goal, focus_areas),
      description: this.generateWorkoutDescription(goal, analysis),
      estimated_duration,
      difficulty_level,
      exercises: workoutStructure,
      reasoning,
      focus_areas,
      calories_estimate
    };
  }

  private generateReasoning(
    goal: WorkoutGoal,
    analysis: ReturnType<typeof this.analyzeWorkoutHistory>,
    exercises: ExerciseData[]
  ): string {
    const reasons: string[] = [];

    if (analysis.neglected_muscle_groups.length > 0) {
      reasons.push(`Focusing on neglected muscle groups: ${analysis.neglected_muscle_groups.join(', ')}`);
    }

    if (analysis.recovery_patterns.includes('frequent_high_intensity')) {
      reasons.push('Incorporating moderate intensity to allow for recovery');
    }

    const compoundCount = exercises.filter(ex => ex.is_compound).length;
    if (compoundCount >= 3) {
      reasons.push('Emphasizing compound movements for maximum efficiency');
    }

    switch (goal.type) {
      case 'strength':
        reasons.push('Lower rep ranges with longer rest periods for strength development');
        break;
      case 'endurance':
        reasons.push('Higher rep ranges with shorter rest for endurance building');
        break;
      case 'weight_loss':
        reasons.push('High-intensity exercises selected for maximum calorie burn');
        break;
      case 'muscle_gain':
        reasons.push('Moderate rep ranges in the hypertrophy zone for muscle growth');
        break;
    }

    return reasons.join('. ');
  }

  private generateWorkoutName(goal: WorkoutGoal, focus_areas: string[]): string {
    const goalNames = {
      strength: 'Power',
      endurance: 'Endurance',
      weight_loss: 'Fat Burn',
      muscle_gain: 'Hypertrophy',
      general_fitness: 'Total Body'
    };

    const primaryFocus = focus_areas[0] || 'Full Body';
    return `AI ${goalNames[goal.type]} - ${primaryFocus.charAt(0).toUpperCase() + primaryFocus.slice(1)}`;
  }

  private generateWorkoutDescription(
    goal: WorkoutGoal,
    analysis: ReturnType<typeof this.analyzeWorkoutHistory>
  ): string {
    const descriptions = {
      strength: 'AI-optimized strength workout focusing on progressive overload and compound movements',
      endurance: 'Endurance-focused session designed to improve cardiovascular fitness and muscular endurance',
      weight_loss: 'High-intensity workout optimized for maximum calorie burn and fat loss',
      muscle_gain: 'Hypertrophy-focused routine targeting optimal rep ranges for muscle growth',
      general_fitness: 'Balanced workout combining strength, cardio, and flexibility for overall fitness'
    };

    let description = descriptions[goal.type];

    if (analysis.neglected_muscle_groups.length > 0) {
      description += `, with emphasis on previously neglected areas`;
    }

    return description;
  }

  generateMultipleWorkoutSuggestions(
    goal: WorkoutGoal,
    history: WorkoutHistory[],
    count: number = 3,
    userProfile?: {
      fitness_level?: 'beginner' | 'intermediate' | 'advanced';
      preferred_duration?: number;
    }
  ): AIWorkoutSuggestion[] {
    const suggestions: AIWorkoutSuggestion[] = [];
    
    for (let i = 0; i < count; i++) {
      // Vary the suggestions by adjusting parameters
      const modifiedGoal = { ...goal };
      
      if (i === 1) {
        // Second suggestion: focus on different muscle groups
        const analysis = this.analyzeWorkoutHistory(history);
        if (analysis.neglected_muscle_groups.length > 0) {
          modifiedGoal.target_muscle_groups = analysis.neglected_muscle_groups.slice(0, 2);
        }
      } else if (i === 2) {
        // Third suggestion: different duration
        modifiedGoal.duration_minutes = (goal.duration_minutes || 45) + (i * 15);
      }

      const suggestion = this.generateWorkoutSuggestion(modifiedGoal, history, userProfile);
      suggestion.id = `${suggestion.id}_${i}`;
      suggestions.push(suggestion);
    }

    return suggestions;
  }
}

export const aiWorkoutService = new AIWorkoutService();
