import { WorkoutSession } from '@/types/workout';
import { PersonalRecord } from '@/types/personalRecord';

export interface UserProfile {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoals: string[];
  availableTime: number; // minutes
  preferredWorkoutTypes: string[];
  equipmentAccess: string[];
  injuryHistory: string[];
  workoutFrequency: number; // per week
}

export interface MuscleGroupAnalysis {
  muscleGroup: string;
  frequency: number;
  lastWorked: string;
  averageVolume: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  needsAttention: boolean;
}

export interface WorkoutPattern {
  type: string;
  frequency: number;
  averageDuration: number;
  preferredTime: string;
  consistency: number; // 0-1 scale
}

export interface ProgressTrend {
  exercise: string;
  trend: 'improving' | 'plateauing' | 'declining';
  changeRate: number; // percentage
  confidence: number; // 0-1 scale
  recommendation: string;
}

export class PatternAnalysis {
  // Analyze muscle group training patterns
  static analyzeMuscleGroupPatterns(workouts: WorkoutSession[]): {
    analysis: MuscleGroupAnalysis[];
    needsAttention: string[];
    balanced: boolean;
  } {
    const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];
    const analysis: MuscleGroupAnalysis[] = [];
    const now = new Date();

    muscleGroups.forEach(muscleGroup => {
      const relevantWorkouts = workouts.filter(workout =>
        workout.exercises.some(exercise =>
          exercise.primaryMuscleGroup === muscleGroup ||
          exercise.secondaryMuscleGroups?.includes(muscleGroup)
        )
      );

      let totalVolume = 0;
      let lastWorkedDate = new Date(0);

      relevantWorkouts.forEach(workout => {
        const workoutDate = new Date(workout.startedAt);
        if (workoutDate > lastWorkedDate) {
          lastWorkedDate = workoutDate;
        }

        workout.exercises.forEach(exercise => {
          if (exercise.primaryMuscleGroup === muscleGroup ||
              exercise.secondaryMuscleGroups?.includes(muscleGroup)) {
            exercise.sets.forEach(set => {
              if (set.isCompleted && set.actualWeight && set.actualReps) {
                totalVolume += set.actualWeight * set.actualReps;
              }
            });
          }
        });
      });

      const frequency = relevantWorkouts.length;
      const averageVolume = frequency > 0 ? totalVolume / frequency : 0;
      const daysSinceLastWorked = Math.floor((now.getTime() - lastWorkedDate.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate trend based on recent vs older workouts
      const recentWorkouts = relevantWorkouts.filter(w =>
        new Date(w.startedAt) > new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      );
      const olderWorkouts = relevantWorkouts.filter(w =>
        new Date(w.startedAt) <= new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) &&
        new Date(w.startedAt) > new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
      );

      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (recentWorkouts.length > olderWorkouts.length) trend = 'increasing';
      else if (recentWorkouts.length < olderWorkouts.length) trend = 'decreasing';

      analysis.push({
        muscleGroup,
        frequency,
        lastWorked: lastWorkedDate.toISOString(),
        averageVolume,
        trend,
        needsAttention: daysSinceLastWorked > 7 || frequency < 2,
      });
    });

    const needsAttention = analysis
      .filter(a => a.needsAttention)
      .map(a => a.muscleGroup);

    const balanced = needsAttention.length <= 1;

    return { analysis, needsAttention, balanced };
  }

  // Analyze workout frequency and timing patterns
  static analyzeWorkoutFrequency(workouts: WorkoutSession[]): {
    averageFrequency: number;
    preferredDays: string[];
    preferredTimes: string[];
    consistency: number;
    recommendation: string;
  } {
    if (workouts.length === 0) {
      return {
        averageFrequency: 0,
        preferredDays: [],
        preferredTimes: [],
        consistency: 0,
        recommendation: 'Start with 2-3 workouts per week for optimal results.',
      };
    }

    const dayCount: Record<string, number> = {};
    const timeCount: Record<string, number> = {};
    const weeklyWorkouts: Record<string, number> = {};

    workouts.forEach(workout => {
      const date = new Date(workout.startedAt);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();
      const timeSlot = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
      const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;

      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
      timeCount[timeSlot] = (timeCount[timeSlot] || 0) + 1;
      weeklyWorkouts[weekKey] = (weeklyWorkouts[weekKey] || 0) + 1;
    });

    const preferredDays = Object.entries(dayCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);

    const preferredTimes = Object.entries(timeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([time]) => time);

    const weeklyFrequencies = Object.values(weeklyWorkouts);
    const averageFrequency = weeklyFrequencies.reduce((sum, freq) => sum + freq, 0) / weeklyFrequencies.length;

    // Calculate consistency (how close to average each week is)
    const variance = weeklyFrequencies.reduce((sum, freq) => sum + Math.pow(freq - averageFrequency, 2), 0) / weeklyFrequencies.length;
    const consistency = Math.max(0, 1 - (variance / averageFrequency));

    let recommendation = '';
    if (averageFrequency < 2) {
      recommendation = 'Try to increase workout frequency to 2-3 times per week for better results.';
    } else if (averageFrequency > 6) {
      recommendation = 'Consider adding rest days to prevent overtraining and improve recovery.';
    } else if (consistency < 0.7) {
      recommendation = 'Try to maintain a more consistent workout schedule for optimal progress.';
    } else {
      recommendation = 'Great job maintaining a consistent workout routine!';
    }

    return {
      averageFrequency,
      preferredDays,
      preferredTimes,
      consistency,
      recommendation,
    };
  }

  // Analyze workout intensity patterns
  static analyzeIntensityPatterns(workouts: WorkoutSession[]): {
    averageIntensity: number;
    intensityTrend: 'increasing' | 'decreasing' | 'stable';
    recoveryNeeded: boolean;
    recommendation: string;
  } {
    if (workouts.length === 0) {
      return {
        averageIntensity: 0,
        intensityTrend: 'stable',
        recoveryNeeded: false,
        recommendation: 'Start with moderate intensity and gradually increase as you build strength.',
      };
    }

    // Calculate intensity based on volume, duration, and RPE
    const intensityScores = workouts.map(workout => {
      let totalVolume = 0;
      let totalSets = 0;

      workout.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.isCompleted) {
            totalSets++;
            if (set.actualWeight && set.actualReps) {
              totalVolume += set.actualWeight * set.actualReps;
            }
          }
        });
      });

      const duration = workout.totalDurationSeconds / 60; // minutes
      const volumePerMinute = duration > 0 ? totalVolume / duration : 0;
      const setsPerMinute = duration > 0 ? totalSets / duration : 0;

      // Normalize intensity score (0-10 scale)
      return Math.min(10, (volumePerMinute / 100) + (setsPerMinute * 2));
    });

    const averageIntensity = intensityScores.reduce((sum, score) => sum + score, 0) / intensityScores.length;

    // Calculate trend
    const recentScores = intensityScores.slice(-5);
    const olderScores = intensityScores.slice(-10, -5);

    let intensityTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentScores.length > 0 && olderScores.length > 0) {
      const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
      const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;

      if (recentAvg > olderAvg * 1.1) intensityTrend = 'increasing';
      else if (recentAvg < olderAvg * 0.9) intensityTrend = 'decreasing';
    }

    // Check if recovery is needed
    const recentHighIntensity = recentScores.filter(score => score > 7).length;
    const recoveryNeeded = recentHighIntensity >= 3 || averageIntensity > 8;

    let recommendation = '';
    if (recoveryNeeded) {
      recommendation = 'Consider incorporating rest days or lower intensity workouts for better recovery.';
    } else if (averageIntensity < 4) {
      recommendation = 'You can safely increase workout intensity to see better results.';
    } else if (intensityTrend === 'decreasing') {
      recommendation = 'Try to maintain or gradually increase workout intensity to continue progressing.';
    } else {
      recommendation = 'Your workout intensity is well-balanced. Keep up the great work!';
    }

    return {
      averageIntensity,
      intensityTrend,
      recoveryNeeded,
      recommendation,
    };
  }

  // Analyze progress trends from personal records
  static analyzeProgressTrends(personalRecords: PersonalRecord[]): {
    trends: ProgressTrend[];
    plateauExercises: string[];
    improvingExercises: string[];
    overallProgress: 'excellent' | 'good' | 'moderate' | 'needs_attention';
  } {
    const exerciseGroups: Record<string, PersonalRecord[]> = {};

    // Group records by exercise
    personalRecords.forEach(record => {
      if (!exerciseGroups[record.exerciseName]) {
        exerciseGroups[record.exerciseName] = [];
      }
      exerciseGroups[record.exerciseName].push(record);
    });

    const trends: ProgressTrend[] = [];
    const plateauExercises: string[] = [];
    const improvingExercises: string[] = [];

    Object.entries(exerciseGroups).forEach(([exercise, records]) => {
      if (records.length < 2) return;

      // Sort by date
      const sortedRecords = records.sort((a, b) => 
        new Date(a.achievedAt).getTime() - new Date(b.achievedAt).getTime()
      );

      const recent = sortedRecords.slice(-3);
      const older = sortedRecords.slice(-6, -3);

      if (recent.length === 0) return;

      let trend: 'improving' | 'plateauing' | 'declining' = 'plateauing';
      let changeRate = 0;
      let confidence = 0.5;

      if (older.length > 0) {
        const recentBest = Math.max(...recent.map(r => r.value));
        const olderBest = Math.max(...older.map(r => r.value));

        changeRate = ((recentBest - olderBest) / olderBest) * 100;

        if (changeRate > 5) {
          trend = 'improving';
          confidence = Math.min(0.9, 0.5 + (changeRate / 100));
        } else if (changeRate < -5) {
          trend = 'declining';
          confidence = Math.min(0.9, 0.5 + (Math.abs(changeRate) / 100));
        }
      }

      // Check for plateau (no improvement in last 4 weeks)
      const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
      const recentRecords = sortedRecords.filter(r => new Date(r.achievedAt) > fourWeeksAgo);
      
      if (recentRecords.length === 0 || Math.max(...recentRecords.map(r => r.value)) <= Math.max(...older.map(r => r.value))) {
        plateauExercises.push(exercise);
      }

      if (trend === 'improving') {
        improvingExercises.push(exercise);
      }

      let recommendation = '';
      switch (trend) {
        case 'improving':
          recommendation = 'Great progress! Continue with your current approach.';
          break;
        case 'plateauing':
          recommendation = 'Try varying rep ranges, adding volume, or changing exercise variations.';
          break;
        case 'declining':
          recommendation = 'Consider reducing intensity and focusing on form and recovery.';
          break;
      }

      trends.push({
        exercise,
        trend,
        changeRate,
        confidence,
        recommendation,
      });
    });

    // Determine overall progress
    let overallProgress: 'excellent' | 'good' | 'moderate' | 'needs_attention' = 'moderate';
    const improvingRatio = improvingExercises.length / trends.length;
    const plateauRatio = plateauExercises.length / trends.length;

    if (improvingRatio > 0.7) overallProgress = 'excellent';
    else if (improvingRatio > 0.4) overallProgress = 'good';
    else if (plateauRatio > 0.6) overallProgress = 'needs_attention';

    return {
      trends,
      plateauExercises,
      improvingExercises,
      overallProgress,
    };
  }

  // Create user profile from workout history
  static createUserProfile(workouts: WorkoutSession[]): UserProfile {
    if (workouts.length === 0) {
      return {
        fitnessLevel: 'beginner',
        primaryGoals: ['general_fitness'],
        availableTime: 45,
        preferredWorkoutTypes: ['strength'],
        equipmentAccess: ['bodyweight'],
        injuryHistory: [],
        workoutFrequency: 3,
      };
    }

    // Determine fitness level based on workout complexity and consistency
    const totalWorkouts = workouts.length;
    const averageExercises = workouts.reduce((sum, w) => sum + w.exercises.length, 0) / totalWorkouts;
    const averageDuration = workouts.reduce((sum, w) => sum + (w.totalDurationSeconds / 60), 0) / totalWorkouts;

    let fitnessLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (totalWorkouts > 50 && averageExercises > 6 && averageDuration > 60) {
      fitnessLevel = 'advanced';
    } else if (totalWorkouts > 20 && averageExercises > 4 && averageDuration > 45) {
      fitnessLevel = 'intermediate';
    }

    // Analyze workout types
    const workoutTypes: Record<string, number> = {};
    workouts.forEach(workout => {
      const type = workout.workoutType || 'strength';
      workoutTypes[type] = (workoutTypes[type] || 0) + 1;
    });

    const preferredWorkoutTypes = Object.entries(workoutTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([type]) => type);

    // Estimate available time
    const availableTime = Math.round(averageDuration);

    // Analyze equipment usage
    const equipmentUsed = new Set<string>();
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (exercise.equipment) {
          equipmentUsed.add(exercise.equipment);
        }
      });
    });

    const equipmentAccess = Array.from(equipmentUsed);

    // Calculate workout frequency
    const timeSpan = workouts.length > 1 ? 
      (new Date(workouts[0].startedAt).getTime() - new Date(workouts[workouts.length - 1].startedAt).getTime()) / (1000 * 60 * 60 * 24 * 7) : 1;
    const workoutFrequency = Math.round(totalWorkouts / timeSpan);

    return {
      fitnessLevel,
      primaryGoals: ['strength', 'muscle_gain'], // Default goals
      availableTime,
      preferredWorkoutTypes,
      equipmentAccess,
      injuryHistory: [], // Would need to be collected separately
      workoutFrequency: Math.max(1, Math.min(7, workoutFrequency)),
    };
  }

  // Generate workout recommendations based on patterns
  static generateWorkoutRecommendations(
    muscleAnalysis: ReturnType<typeof PatternAnalysis.analyzeMuscleGroupPatterns>,
    frequencyAnalysis: ReturnType<typeof PatternAnalysis.analyzeWorkoutFrequency>,
    intensityAnalysis: ReturnType<typeof PatternAnalysis.analyzeIntensityPatterns>,
    progressAnalysis: ReturnType<typeof PatternAnalysis.analyzeProgressTrends>
  ): string[] {
    const recommendations: string[] = [];

    // Muscle group recommendations
    if (muscleAnalysis.needsAttention.length > 0) {
      recommendations.push(
        `Focus on ${muscleAnalysis.needsAttention.join(' and ')} - these muscle groups need more attention.`
      );
    }

    // Frequency recommendations
    if (frequencyAnalysis.averageFrequency < 2) {
      recommendations.push('Increase workout frequency to 2-3 times per week for better results.');
    } else if (frequencyAnalysis.consistency < 0.7) {
      recommendations.push('Try to maintain a more consistent workout schedule.');
    }

    // Intensity recommendations
    if (intensityAnalysis.recoveryNeeded) {
      recommendations.push('Consider adding rest days or reducing intensity to improve recovery.');
    } else if (intensityAnalysis.averageIntensity < 4) {
      recommendations.push('You can safely increase workout intensity for better results.');
    }

    // Progress recommendations
    if (progressAnalysis.plateauExercises.length > 0) {
      recommendations.push(
        `Break through plateaus in ${progressAnalysis.plateauExercises.slice(0, 2).join(' and ')} by varying your approach.`
      );
    }

    // Overall progress recommendations
    switch (progressAnalysis.overallProgress) {
      case 'excellent':
        recommendations.push('Excellent progress! Keep up the great work and consider setting new challenges.');
        break;
      case 'needs_attention':
        recommendations.push('Consider reviewing your program and focusing on progressive overload.');
        break;
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }
}
