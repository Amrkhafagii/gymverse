import { WorkoutSession } from '@/types/workout';
import { PersonalRecord } from '@/types/personalRecord';
import { WorkoutPattern, UserProfile, AIInsight } from '@/types/aiRecommendation';

export class PatternAnalysis {
  // Analyze workout frequency patterns
  static analyzeWorkoutFrequency(workouts: WorkoutSession[]): {
    weeklyAverage: number;
    consistency: number;
    preferredDays: string[];
    trend: 'increasing' | 'decreasing' | 'stable';
  } {
    if (workouts.length === 0) {
      return {
        weeklyAverage: 0,
        consistency: 0,
        preferredDays: [],
        trend: 'stable'
      };
    }

    // Calculate weekly frequency
    const sortedWorkouts = workouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstDate = new Date(sortedWorkouts[0].date);
    const lastDate = new Date(sortedWorkouts[sortedWorkouts.length - 1].date);
    const weeksDiff = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const weeklyAverage = workouts.length / weeksDiff;

    // Calculate consistency (how evenly distributed workouts are)
    const dayOfWeekCounts = new Array(7).fill(0);
    workouts.forEach(workout => {
      const dayOfWeek = new Date(workout.date).getDay();
      dayOfWeekCounts[dayOfWeek]++;
    });

    const maxCount = Math.max(...dayOfWeekCounts);
    const minCount = Math.min(...dayOfWeekCounts);
    const consistency = maxCount > 0 ? (1 - (maxCount - minCount) / maxCount) * 100 : 0;

    // Find preferred days
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const preferredDays = dayOfWeekCounts
      .map((count, index) => ({ day: dayNames[index], count }))
      .filter(item => item.count > weeklyAverage * 0.5)
      .sort((a, b) => b.count - a.count)
      .map(item => item.day);

    // Analyze trend (last 4 weeks vs previous 4 weeks)
    const recentWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.date);
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      return workoutDate >= fourWeeksAgo;
    });

    const olderWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.date);
      const eightWeeksAgo = new Date();
      eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      return workoutDate >= eightWeeksAgo && workoutDate < fourWeeksAgo;
    });

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentWorkouts.length > olderWorkouts.length * 1.2) {
      trend = 'increasing';
    } else if (recentWorkouts.length < olderWorkouts.length * 0.8) {
      trend = 'decreasing';
    }

    return {
      weeklyAverage,
      consistency,
      preferredDays,
      trend
    };
  }

  // Analyze muscle group patterns
  static analyzeMuscleGroupPatterns(workouts: WorkoutSession[]): {
    frequency: Record<string, number>;
    lastWorked: Record<string, string>;
    needsAttention: string[];
    balanced: boolean;
  } {
    const muscleGroupFreq: Record<string, number> = {};
    const muscleGroupLastWorked: Record<string, string> = {};

    workouts.forEach(workout => {
      const muscleGroups = new Set<string>();
      
      workout.exercises.forEach(exercise => {
        // Extract muscle groups from exercise (simplified)
        const exerciseName = exercise.name.toLowerCase();
        if (exerciseName.includes('chest') || exerciseName.includes('bench')) {
          muscleGroups.add('Chest');
        }
        if (exerciseName.includes('back') || exerciseName.includes('row') || exerciseName.includes('pull')) {
          muscleGroups.add('Back');
        }
        if (exerciseName.includes('shoulder') || exerciseName.includes('press')) {
          muscleGroups.add('Shoulders');
        }
        if (exerciseName.includes('leg') || exerciseName.includes('squat') || exerciseName.includes('quad')) {
          muscleGroups.add('Legs');
        }
        if (exerciseName.includes('arm') || exerciseName.includes('bicep') || exerciseName.includes('tricep')) {
          muscleGroups.add('Arms');
        }
        if (exerciseName.includes('core') || exerciseName.includes('ab')) {
          muscleGroups.add('Core');
        }
      });

      muscleGroups.forEach(group => {
        muscleGroupFreq[group] = (muscleGroupFreq[group] || 0) + 1;
        if (!muscleGroupLastWorked[group] || workout.date > muscleGroupLastWorked[group]) {
          muscleGroupLastWorked[group] = workout.date;
        }
      });
    });

    // Find muscle groups that need attention (not worked in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const needsAttention = Object.entries(muscleGroupLastWorked)
      .filter(([_, lastDate]) => new Date(lastDate) < sevenDaysAgo)
      .map(([group, _]) => group);

    // Check if training is balanced
    const frequencies = Object.values(muscleGroupFreq);
    const avgFreq = frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length;
    const balanced = frequencies.every(freq => Math.abs(freq - avgFreq) <= avgFreq * 0.3);

    return {
      frequency: muscleGroupFreq,
      lastWorked: muscleGroupLastWorked,
      needsAttention,
      balanced
    };
  }

  // Analyze workout intensity patterns
  static analyzeIntensityPatterns(workouts: WorkoutSession[]): {
    averageIntensity: number;
    intensityTrend: 'increasing' | 'decreasing' | 'stable';
    recoveryNeeded: boolean;
    optimalRestDays: number;
  } {
    if (workouts.length === 0) {
      return {
        averageIntensity: 0,
        intensityTrend: 'stable',
        recoveryNeeded: false,
        optimalRestDays: 1
      };
    }

    // Calculate intensity based on volume and duration
    const intensities = workouts.map(workout => {
      const totalVolume = workout.exercises.reduce((sum, exercise) => {
        return sum + exercise.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0);
      }, 0);
      
      const duration = workout.duration || 60;
      return totalVolume / duration; // Volume per minute as intensity metric
    });

    const averageIntensity = intensities.reduce((sum, intensity) => sum + intensity, 0) / intensities.length;

    // Analyze trend (last 5 workouts vs previous 5)
    const recentIntensities = intensities.slice(-5);
    const previousIntensities = intensities.slice(-10, -5);
    
    let intensityTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentIntensities.length > 0 && previousIntensities.length > 0) {
      const recentAvg = recentIntensities.reduce((sum, i) => sum + i, 0) / recentIntensities.length;
      const previousAvg = previousIntensities.reduce((sum, i) => sum + i, 0) / previousIntensities.length;
      
      if (recentAvg > previousAvg * 1.1) {
        intensityTrend = 'increasing';
      } else if (recentAvg < previousAvg * 0.9) {
        intensityTrend = 'decreasing';
      }
    }

    // Check if recovery is needed (high intensity for 3+ consecutive workouts)
    const lastThreeIntensities = intensities.slice(-3);
    const recoveryNeeded = lastThreeIntensities.length >= 3 && 
      lastThreeIntensities.every(intensity => intensity > averageIntensity * 1.2);

    // Calculate optimal rest days based on intensity
    const optimalRestDays = averageIntensity > 100 ? 2 : 1;

    return {
      averageIntensity,
      intensityTrend,
      recoveryNeeded,
      optimalRestDays
    };
  }

  // Analyze progress trends
  static analyzeProgressTrends(personalRecords: PersonalRecord[]): {
    recentPRs: PersonalRecord[];
    plateauExercises: string[];
    improvingExercises: string[];
    progressRate: number;
  } {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPRs = personalRecords.filter(pr => new Date(pr.date) >= thirtyDaysAgo);

    // Group PRs by exercise
    const exercisePRs: Record<string, PersonalRecord[]> = {};
    personalRecords.forEach(pr => {
      if (!exercisePRs[pr.exerciseName]) {
        exercisePRs[pr.exerciseName] = [];
      }
      exercisePRs[pr.exerciseName].push(pr);
    });

    const plateauExercises: string[] = [];
    const improvingExercises: string[] = [];

    Object.entries(exercisePRs).forEach(([exercise, prs]) => {
      const sortedPRs = prs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      if (sortedPRs.length >= 2) {
        const lastPR = sortedPRs[sortedPRs.length - 1];
        const secondLastPR = sortedPRs[sortedPRs.length - 2];
        
        const daysBetween = (new Date(lastPR.date).getTime() - new Date(secondLastPR.date).getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysBetween > 30) {
          plateauExercises.push(exercise);
        } else if (lastPR.value > secondLastPR.value) {
          improvingExercises.push(exercise);
        }
      }
    });

    const progressRate = personalRecords.length > 0 ? (recentPRs.length / 30) * 100 : 0;

    return {
      recentPRs,
      plateauExercises,
      improvingExercises,
      progressRate
    };
  }

  // Generate AI insights based on patterns
  static generateInsights(
    workouts: WorkoutSession[],
    personalRecords: PersonalRecord[]
  ): AIInsight[] {
    const insights: AIInsight[] = [];

    const frequencyAnalysis = this.analyzeWorkoutFrequency(workouts);
    const muscleAnalysis = this.analyzeMuscleGroupPatterns(workouts);
    const intensityAnalysis = this.analyzeIntensityPatterns(workouts);
    const progressAnalysis = this.analyzeProgressTrends(personalRecords);

    // Frequency insights
    if (frequencyAnalysis.weeklyAverage < 2) {
      insights.push({
        type: 'warning',
        title: 'Low Workout Frequency',
        description: `You're averaging ${frequencyAnalysis.weeklyAverage.toFixed(1)} workouts per week. Consider increasing to 3-4 for optimal progress.`,
        actionable: true,
        recommendation: 'Schedule 2-3 additional workout sessions this week'
      });
    } else if (frequencyAnalysis.weeklyAverage > 6) {
      insights.push({
        type: 'warning',
        title: 'High Workout Frequency',
        description: `You're averaging ${frequencyAnalysis.weeklyAverage.toFixed(1)} workouts per week. Consider adding rest days for recovery.`,
        actionable: true,
        recommendation: 'Include 1-2 complete rest days per week'
      });
    }

    // Muscle group balance insights
    if (!muscleAnalysis.balanced) {
      insights.push({
        type: 'suggestion',
        title: 'Muscle Group Imbalance',
        description: 'Your training isn\'t evenly distributed across muscle groups.',
        data: muscleAnalysis.frequency,
        actionable: true,
        recommendation: `Focus more on: ${muscleAnalysis.needsAttention.join(', ')}`
      });
    }

    // Recovery insights
    if (intensityAnalysis.recoveryNeeded) {
      insights.push({
        type: 'warning',
        title: 'Recovery Needed',
        description: 'Your recent workouts have been high intensity. Consider a deload or rest day.',
        actionable: true,
        recommendation: 'Take 1-2 rest days or do light cardio/stretching'
      });
    }

    // Progress insights
    if (progressAnalysis.plateauExercises.length > 0) {
      insights.push({
        type: 'suggestion',
        title: 'Plateau Detected',
        description: `No recent progress in: ${progressAnalysis.plateauExercises.slice(0, 3).join(', ')}`,
        data: progressAnalysis.plateauExercises,
        actionable: true,
        recommendation: 'Try changing rep ranges, adding volume, or switching exercise variations'
      });
    }

    if (progressAnalysis.improvingExercises.length > 0) {
      insights.push({
        type: 'improvement',
        title: 'Great Progress!',
        description: `You're improving in: ${progressAnalysis.improvingExercises.slice(0, 3).join(', ')}`,
        data: progressAnalysis.improvingExercises,
        actionable: false
      });
    }

    return insights;
  }

  // Create user profile from workout history
  static createUserProfile(workouts: WorkoutSession[]): UserProfile {
    if (workouts.length === 0) {
      return {
        fitnessLevel: 'beginner',
        primaryGoals: ['general_fitness'],
        availableTime: 60,
        preferredWorkoutTypes: ['strength'],
        equipment: ['bodyweight'],
        limitations: [],
        weeklyFrequency: 3
      };
    }

    const frequencyAnalysis = this.analyzeWorkoutFrequency(workouts);
    const intensityAnalysis = this.analyzeIntensityPatterns(workouts);

    // Determine fitness level based on workout complexity and consistency
    let fitnessLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (workouts.length > 20 && frequencyAnalysis.weeklyAverage >= 3) {
      fitnessLevel = 'intermediate';
    }
    if (workouts.length > 50 && frequencyAnalysis.weeklyAverage >= 4 && intensityAnalysis.averageIntensity > 100) {
      fitnessLevel = 'advanced';
    }

    // Calculate average workout duration
    const avgDuration = workouts.reduce((sum, w) => sum + (w.duration || 60), 0) / workouts.length;

    // Determine preferred workout types
    const workoutTypes = workouts.map(w => w.workoutType || 'strength');
    const typeFreq: Record<string, number> = {};
    workoutTypes.forEach(type => {
      typeFreq[type] = (typeFreq[type] || 0) + 1;
    });
    const preferredWorkoutTypes = Object.entries(typeFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([type]) => type);

    return {
      fitnessLevel,
      primaryGoals: ['strength', 'muscle_building'], // Could be inferred from workout patterns
      availableTime: Math.round(avgDuration),
      preferredWorkoutTypes,
      equipment: ['gym'], // Could be inferred from exercises
      limitations: [],
      lastWorkoutDate: workouts[0]?.date,
      weeklyFrequency: Math.round(frequencyAnalysis.weeklyAverage)
    };
  }
}
