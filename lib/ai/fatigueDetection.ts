import { WorkoutSession } from '@/types/workout';
import { RecoveryMetrics } from './recoveryAnalysis';

export interface FatigueIndicator {
  id: string;
  name: string;
  value: number; // 0-100 scale
  status: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

export interface FatiguePattern {
  type: 'overreaching' | 'overtraining' | 'normal' | 'deload_needed';
  confidence: number; // 0-100
  duration: number; // days
  severity: 'mild' | 'moderate' | 'severe';
  affectedMuscleGroups: string[];
}

export interface FatigueAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  timestamp: string;
  actionRequired: boolean;
  recommendations: string[];
}

export class FatigueDetectionEngine {
  private static instance: FatigueDetectionEngine;
  
  static getInstance(): FatigueDetectionEngine {
    if (!FatigueDetectionEngine.instance) {
      FatigueDetectionEngine.instance = new FatigueDetectionEngine();
    }
    return FatigueDetectionEngine.instance;
  }

  detectFatigueIndicators(
    workouts: WorkoutSession[],
    recoveryMetrics: RecoveryMetrics
  ): FatigueIndicator[] {
    const indicators: FatigueIndicator[] = [];
    
    // Performance decline indicator
    const performanceDecline = this.detectPerformanceDecline(workouts);
    indicators.push({
      id: 'performance-decline',
      name: 'Performance Decline',
      value: performanceDecline,
      status: this.getIndicatorStatus(performanceDecline),
      description: 'Measures decrease in workout performance over time',
      recommendation: performanceDecline > 60 
        ? 'Consider reducing workout intensity or taking rest days'
        : 'Performance is stable, continue current routine',
    });

    // Volume tolerance indicator
    const volumeTolerance = this.detectVolumeTolerance(workouts);
    indicators.push({
      id: 'volume-tolerance',
      name: 'Volume Tolerance',
      value: volumeTolerance,
      status: this.getIndicatorStatus(volumeTolerance),
      description: 'Ability to handle current training volume',
      recommendation: volumeTolerance > 70
        ? 'Reduce training volume by 20-30%'
        : 'Current volume is manageable',
    });

    // Recovery rate indicator
    const recoveryRate = this.detectRecoveryRate(workouts, recoveryMetrics);
    indicators.push({
      id: 'recovery-rate',
      name: 'Recovery Rate',
      value: recoveryRate,
      status: this.getIndicatorStatus(recoveryRate),
      description: 'How quickly you recover between sessions',
      recommendation: recoveryRate > 65
        ? 'Increase rest time between workouts'
        : 'Recovery rate is adequate',
    });

    // Motivation/completion indicator
    const motivationLevel = this.detectMotivationLevel(workouts);
    indicators.push({
      id: 'motivation-level',
      name: 'Motivation Level',
      value: motivationLevel,
      status: this.getIndicatorStatus(motivationLevel),
      description: 'Psychological readiness and workout completion rates',
      recommendation: motivationLevel > 60
        ? 'Consider varying your routine or taking a deload week'
        : 'Motivation levels are healthy',
    });

    // Sleep quality indicator (estimated from performance patterns)
    const sleepQuality = this.estimateSleepQuality(workouts);
    indicators.push({
      id: 'sleep-quality',
      name: 'Sleep Quality (Estimated)',
      value: sleepQuality,
      status: this.getIndicatorStatus(sleepQuality),
      description: 'Estimated sleep quality based on performance patterns',
      recommendation: sleepQuality > 50
        ? 'Focus on improving sleep hygiene and duration'
        : 'Sleep patterns appear adequate',
    });

    return indicators;
  }

  detectFatiguePatterns(
    workouts: WorkoutSession[],
    indicators: FatigueIndicator[]
  ): FatiguePattern[] {
    const patterns: FatiguePattern[] = [];
    
    // Overreaching pattern
    const overreachingPattern = this.detectOverreaching(workouts, indicators);
    if (overreachingPattern) {
      patterns.push(overreachingPattern);
    }

    // Overtraining pattern
    const overtrainingPattern = this.detectOvertraining(workouts, indicators);
    if (overtrainingPattern) {
      patterns.push(overtrainingPattern);
    }

    // Deload needed pattern
    const deloadPattern = this.detectDeloadNeeded(workouts, indicators);
    if (deloadPattern) {
      patterns.push(deloadPattern);
    }

    return patterns;
  }

  generateFatigueAlerts(
    indicators: FatigueIndicator[],
    patterns: FatiguePattern[]
  ): FatigueAlert[] {
    const alerts: FatigueAlert[] = [];
    
    // Critical fatigue alerts
    const criticalIndicators = indicators.filter(i => i.status === 'critical');
    if (criticalIndicators.length > 0) {
      alerts.push({
        id: 'critical-fatigue',
        type: 'critical',
        title: 'Critical Fatigue Detected',
        message: `${criticalIndicators.length} critical fatigue indicators detected. Immediate rest recommended.`,
        timestamp: new Date().toISOString(),
        actionRequired: true,
        recommendations: [
          'Take 2-3 complete rest days',
          'Focus on sleep and nutrition',
          'Consider light stretching or walking only',
          'Consult with a healthcare provider if symptoms persist',
        ],
      });
    }

    // Overtraining alerts
    const overtrainingPattern = patterns.find(p => p.type === 'overtraining');
    if (overtrainingPattern) {
      alerts.push({
        id: 'overtraining-warning',
        type: 'warning',
        title: 'Overtraining Syndrome Risk',
        message: `Signs of overtraining detected with ${overtrainingPattern.confidence}% confidence.`,
        timestamp: new Date().toISOString(),
        actionRequired: true,
        recommendations: [
          'Reduce training volume by 40-50%',
          'Increase rest days between sessions',
          'Focus on recovery activities',
          'Monitor symptoms closely',
        ],
      });
    }

    // Deload recommendations
    const deloadPattern = patterns.find(p => p.type === 'deload_needed');
    if (deloadPattern) {
      alerts.push({
        id: 'deload-recommendation',
        type: 'info',
        title: 'Deload Week Recommended',
        message: 'Your body would benefit from a planned deload week.',
        timestamp: new Date().toISOString(),
        actionRequired: false,
        recommendations: [
          'Reduce weights by 40-60% for one week',
          'Maintain movement patterns but lower intensity',
          'Focus on mobility and recovery work',
          'Return to normal intensity after deload week',
        ],
      });
    }

    // Performance decline alerts
    const performanceIndicator = indicators.find(i => i.id === 'performance-decline');
    if (performanceIndicator && performanceIndicator.value > 70) {
      alerts.push({
        id: 'performance-decline',
        type: 'warning',
        title: 'Performance Decline Detected',
        message: 'Your workout performance has been declining recently.',
        timestamp: new Date().toISOString(),
        actionRequired: true,
        recommendations: [
          'Review your current training program',
          'Ensure adequate nutrition and hydration',
          'Consider reducing training frequency',
          'Evaluate sleep quality and stress levels',
        ],
      });
    }

    return alerts.sort((a, b) => {
      const typeOrder = { critical: 3, warning: 2, info: 1 };
      return typeOrder[b.type] - typeOrder[a.type];
    });
  }

  private detectPerformanceDecline(workouts: WorkoutSession[]): number {
    if (workouts.length < 6) return 0;
    
    const recentWorkouts = workouts.slice(0, 3);
    const previousWorkouts = workouts.slice(3, 6);
    
    const recentPerformance = this.calculateAveragePerformance(recentWorkouts);
    const previousPerformance = this.calculateAveragePerformance(previousWorkouts);
    
    if (previousPerformance === 0) return 0;
    
    const decline = ((previousPerformance - recentPerformance) / previousPerformance) * 100;
    return Math.max(0, Math.min(100, decline));
  }

  private detectVolumeTolerance(workouts: WorkoutSession[]): number {
    if (workouts.length < 4) return 0;
    
    const recentWorkouts = workouts.slice(0, 4);
    let volumeStress = 0;
    
    recentWorkouts.forEach((workout, index) => {
      const volume = this.calculateWorkoutVolume(workout);
      const duration = workout.total_duration_seconds / 3600; // hours
      const completionRate = this.calculateCompletionRate(workout);
      
      // Higher volume with longer duration and lower completion = higher stress
      const workoutStress = (volume / 1000) * duration * (1 - completionRate / 100);
      volumeStress += workoutStress * (1 + index * 0.2); // Recent workouts weighted more
    });
    
    return Math.min(100, volumeStress * 10);
  }

  private detectRecoveryRate(workouts: WorkoutSession[], metrics: RecoveryMetrics): number {
    // Base recovery rate on fatigue level and recent workout frequency
    const recentWorkouts = workouts.slice(0, 7);
    const workoutFrequency = recentWorkouts.length / 7;
    
    // Higher fatigue + higher frequency = poor recovery rate
    const recoveryStress = (metrics.fatigueLevel / 100) * (workoutFrequency / 1) * 100;
    
    return Math.min(100, recoveryStress);
  }

  private detectMotivationLevel(workouts: WorkoutSession[]): number {
    if (workouts.length < 5) return 0;
    
    const recentWorkouts = workouts.slice(0, 5);
    let motivationScore = 0;
    
    recentWorkouts.forEach((workout, index) => {
      const completionRate = this.calculateCompletionRate(workout);
      const duration = workout.total_duration_seconds;
      const plannedDuration = workout.exercises.length * 45 * 60; // Estimated 45min per exercise
      
      const durationRatio = duration / plannedDuration;
      const workoutScore = (completionRate / 100) * Math.min(durationRatio, 1);
      
      motivationScore += workoutScore * (1 + index * 0.1); // Recent workouts weighted more
    });
    
    const avgMotivation = motivationScore / recentWorkouts.length;
    return Math.max(0, (1 - avgMotivation) * 100);
  }

  private estimateSleepQuality(workouts: WorkoutSession[]): number {
    if (workouts.length < 3) return 0;
    
    // Estimate sleep quality based on performance consistency
    const recentWorkouts = workouts.slice(0, 3);
    const performances = recentWorkouts.map(w => this.calculateWorkoutPerformance(w));
    
    // Calculate variance in performance (high variance = poor sleep)
    const avgPerformance = performances.reduce((sum, p) => sum + p, 0) / performances.length;
    const variance = performances.reduce((sum, p) => sum + Math.pow(p - avgPerformance, 2), 0) / performances.length;
    
    // Normalize variance to 0-100 scale
    return Math.min(100, variance * 50);
  }

  private detectOverreaching(workouts: WorkoutSession[], indicators: FatigueIndicator[]): FatiguePattern | null {
    const highIndicators = indicators.filter(i => i.status === 'high' || i.status === 'critical');
    
    if (highIndicators.length >= 2) {
      const affectedMuscleGroups = this.getAffectedMuscleGroups(workouts.slice(0, 7));
      
      return {
        type: 'overreaching',
        confidence: Math.min(100, highIndicators.length * 25),
        duration: 7, // Typically lasts about a week
        severity: highIndicators.length >= 3 ? 'severe' : 'moderate',
        affectedMuscleGroups,
      };
    }
    
    return null;
  }

  private detectOvertraining(workouts: WorkoutSession[], indicators: FatigueIndicator[]): FatiguePattern | null {
    const criticalIndicators = indicators.filter(i => i.status === 'critical');
    const highIndicators = indicators.filter(i => i.status === 'high');
    
    if (criticalIndicators.length >= 2 || (criticalIndicators.length >= 1 && highIndicators.length >= 2)) {
      const affectedMuscleGroups = this.getAffectedMuscleGroups(workouts.slice(0, 14));
      
      return {
        type: 'overtraining',
        confidence: Math.min(100, (criticalIndicators.length * 40) + (highIndicators.length * 20)),
        duration: 14, // Can last weeks
        severity: criticalIndicators.length >= 3 ? 'severe' : 'moderate',
        affectedMuscleGroups,
      };
    }
    
    return null;
  }

  private detectDeloadNeeded(workouts: WorkoutSession[], indicators: FatigueIndicator[]): FatiguePattern | null {
    const moderateToHighIndicators = indicators.filter(i => 
      i.status === 'moderate' || i.status === 'high'
    );
    
    // Check for consistent moderate fatigue over time
    if (moderateToHighIndicators.length >= 3) {
      const recentWorkouts = workouts.slice(0, 14);
      const avgVolume = recentWorkouts.reduce((sum, w) => sum + this.calculateWorkoutVolume(w), 0) / recentWorkouts.length;
      
      if (avgVolume > 1500) { // High volume threshold
        return {
          type: 'deload_needed',
          confidence: Math.min(100, moderateToHighIndicators.length * 20),
          duration: 7, // One week deload
          severity: 'mild',
          affectedMuscleGroups: this.getAffectedMuscleGroups(recentWorkouts),
        };
      }
    }
    
    return null;
  }

  private getIndicatorStatus(value: number): 'low' | 'moderate' | 'high' | 'critical' {
    if (value < 25) return 'low';
    if (value < 50) return 'moderate';
    if (value < 75) return 'high';
    return 'critical';
  }

  private calculateAveragePerformance(workouts: WorkoutSession[]): number {
    if (workouts.length === 0) return 0;
    
    const performances = workouts.map(w => this.calculateWorkoutPerformance(w));
    return performances.reduce((sum, p) => sum + p, 0) / performances.length;
  }

  private calculateWorkoutPerformance(workout: WorkoutSession): number {
    const volume = this.calculateWorkoutVolume(workout);
    const completionRate = this.calculateCompletionRate(workout);
    const duration = workout.total_duration_seconds / 3600; // hours
    
    // Performance = volume * completion rate / duration
    return duration > 0 ? (volume * completionRate / 100) / duration : 0;
  }

  private calculateWorkoutVolume(workout: WorkoutSession): number {
    return workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((setTotal, set) => {
        if (set.is_completed && set.actual_weight_kg && set.actual_reps) {
          return setTotal + (set.actual_weight_kg * set.actual_reps);
        }
        return setTotal;
      }, 0);
    }, 0);
  }

  private calculateCompletionRate(workout: WorkoutSession): number {
    const totalSets = workout.exercises.reduce((total, ex) => total + ex.sets.length, 0);
    const completedSets = workout.exercises.reduce((total, ex) => 
      total + ex.sets.filter(set => set.is_completed).length, 0
    );
    
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  }

  private getAffectedMuscleGroups(workouts: WorkoutSession[]): string[] {
    const muscleGroupFrequency: Record<string, number> = {};
    
    workouts.forEach(workout => {
      const muscleGroups = [...new Set(workout.exercises.flatMap(e => e.muscle_groups))];
      muscleGroups.forEach(group => {
        muscleGroupFrequency[group] = (muscleGroupFrequency[group] || 0) + 1;
      });
    });
    
    // Return muscle groups that appear in more than 50% of recent workouts
    const threshold = workouts.length * 0.5;
    return Object.entries(muscleGroupFrequency)
      .filter(([_, frequency]) => frequency > threshold)
      .map(([group, _]) => group);
  }
}

export const fatigueDetection = FatigueDetectionEngine.getInstance();
