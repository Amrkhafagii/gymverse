import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession } from '@/types/workout';

export interface RecoveryMetrics {
  fatigueLevel: number; // 0-100 (0 = fully recovered, 100 = extremely fatigued)
  recoveryScore: number; // 0-100 (0 = needs rest, 100 = fully recovered)
  muscleGroupFatigue: Record<string, number>; // muscle group -> fatigue level
  recommendedRestDays: number;
  nextWorkoutIntensity: 'light' | 'moderate' | 'high';
  recoveryTrend: 'improving' | 'stable' | 'declining';
}

export interface RecoveryInsight {
  id: string;
  type: 'warning' | 'suggestion' | 'positive';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  muscleGroups?: string[];
}

export interface WorkoutIntensityData {
  date: string;
  totalVolume: number;
  duration: number;
  exerciseCount: number;
  muscleGroups: string[];
  perceivedExertion: number; // 1-10 scale
  completionRate: number; // percentage of planned sets completed
}

const STORAGE_KEYS = {
  RECOVERY_HISTORY: '@recovery_history',
  FATIGUE_TRACKING: '@fatigue_tracking',
  RECOVERY_PREFERENCES: '@recovery_preferences',
};

export class RecoveryAnalysisEngine {
  private static instance: RecoveryAnalysisEngine;
  
  static getInstance(): RecoveryAnalysisEngine {
    if (!RecoveryAnalysisEngine.instance) {
      RecoveryAnalysisEngine.instance = new RecoveryAnalysisEngine();
    }
    return RecoveryAnalysisEngine.instance;
  }

  async analyzeRecoveryStatus(workouts: WorkoutSession[]): Promise<RecoveryMetrics> {
    const recentWorkouts = this.getRecentWorkouts(workouts, 14); // Last 2 weeks
    const intensityData = await this.calculateWorkoutIntensity(recentWorkouts);
    
    const fatigueLevel = this.calculateFatigueLevel(intensityData);
    const muscleGroupFatigue = this.calculateMuscleGroupFatigue(intensityData);
    const recoveryScore = this.calculateRecoveryScore(fatigueLevel, intensityData);
    const recommendedRestDays = this.calculateRecommendedRestDays(fatigueLevel, intensityData);
    const nextWorkoutIntensity = this.determineNextWorkoutIntensity(fatigueLevel, recoveryScore);
    const recoveryTrend = await this.calculateRecoveryTrend(intensityData);

    const metrics: RecoveryMetrics = {
      fatigueLevel,
      recoveryScore,
      muscleGroupFatigue,
      recommendedRestDays,
      nextWorkoutIntensity,
      recoveryTrend,
    };

    await this.saveRecoveryMetrics(metrics);
    return metrics;
  }

  async generateRecoveryInsights(
    metrics: RecoveryMetrics,
    workouts: WorkoutSession[]
  ): Promise<RecoveryInsight[]> {
    const insights: RecoveryInsight[] = [];
    const recentWorkouts = this.getRecentWorkouts(workouts, 7);

    // High fatigue warning
    if (metrics.fatigueLevel > 75) {
      insights.push({
        id: 'high-fatigue-warning',
        type: 'warning',
        title: 'High Fatigue Detected',
        description: 'Your body is showing signs of high fatigue. Consider taking 1-2 rest days.',
        actionable: true,
        priority: 'high',
      });
    }

    // Overtraining specific muscle groups
    Object.entries(metrics.muscleGroupFatigue).forEach(([muscleGroup, fatigue]) => {
      if (fatigue > 80) {
        insights.push({
          id: `muscle-fatigue-${muscleGroup}`,
          type: 'warning',
          title: `${muscleGroup} Overtraining`,
          description: `Your ${muscleGroup.toLowerCase()} muscles need extra recovery time.`,
          actionable: true,
          priority: 'medium',
          muscleGroups: [muscleGroup],
        });
      }
    });

    // Consecutive workout days warning
    const consecutiveDays = this.calculateConsecutiveWorkoutDays(recentWorkouts);
    if (consecutiveDays >= 5) {
      insights.push({
        id: 'consecutive-days-warning',
        type: 'warning',
        title: 'Too Many Consecutive Days',
        description: `You've worked out ${consecutiveDays} days in a row. Consider a rest day.`,
        actionable: true,
        priority: 'medium',
      });
    }

    // Recovery trend insights
    if (metrics.recoveryTrend === 'declining') {
      insights.push({
        id: 'declining-recovery',
        type: 'suggestion',
        title: 'Recovery Trend Declining',
        description: 'Your recovery is getting worse. Focus on sleep, nutrition, and lighter workouts.',
        actionable: true,
        priority: 'medium',
      });
    }

    // Positive recovery insights
    if (metrics.recoveryScore > 80 && metrics.fatigueLevel < 30) {
      insights.push({
        id: 'excellent-recovery',
        type: 'positive',
        title: 'Excellent Recovery Status',
        description: 'You\'re well-recovered and ready for an intense workout!',
        actionable: false,
        priority: 'low',
      });
    }

    // Sleep and recovery suggestions
    if (metrics.fatigueLevel > 60) {
      insights.push({
        id: 'sleep-suggestion',
        type: 'suggestion',
        title: 'Prioritize Sleep',
        description: 'Aim for 7-9 hours of quality sleep to improve recovery.',
        actionable: true,
        priority: 'medium',
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private getRecentWorkouts(workouts: WorkoutSession[], days: number): WorkoutSession[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return workouts
      .filter(workout => new Date(workout.date) >= cutoffDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private async calculateWorkoutIntensity(workouts: WorkoutSession[]): Promise<WorkoutIntensityData[]> {
    return workouts.map(workout => {
      const totalVolume = workout.exercises.reduce((total, exercise) => {
        return total + exercise.sets.reduce((setTotal, set) => {
          if (set.is_completed && set.actual_weight_kg && set.actual_reps) {
            return setTotal + (set.actual_weight_kg * set.actual_reps);
          }
          return setTotal;
        }, 0);
      }, 0);

      const exerciseCount = workout.exercises.length;
      const muscleGroups = [...new Set(workout.exercises.flatMap(e => e.muscle_groups))];
      
      // Calculate completion rate
      const totalSets = workout.exercises.reduce((total, ex) => total + ex.sets.length, 0);
      const completedSets = workout.exercises.reduce((total, ex) => 
        total + ex.sets.filter(set => set.is_completed).length, 0
      );
      const completionRate = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

      // Estimate perceived exertion based on volume and duration
      const volumeIntensity = Math.min(totalVolume / 1000, 10); // Normalize to 1-10 scale
      const durationFactor = Math.min(workout.total_duration_seconds / 3600, 2); // Hours factor
      const perceivedExertion = Math.min(
        Math.round((volumeIntensity * durationFactor * (completionRate / 100)) + 1),
        10
      );

      return {
        date: workout.date,
        totalVolume,
        duration: workout.total_duration_seconds,
        exerciseCount,
        muscleGroups,
        perceivedExertion,
        completionRate,
      };
    });
  }

  private calculateFatigueLevel(intensityData: WorkoutIntensityData[]): number {
    if (intensityData.length === 0) return 0;

    const recentIntensity = intensityData.slice(0, 7); // Last week
    const avgExertion = recentIntensity.reduce((sum, data) => sum + data.perceivedExertion, 0) / recentIntensity.length;
    const avgVolume = recentIntensity.reduce((sum, data) => sum + data.totalVolume, 0) / recentIntensity.length;
    
    // Calculate workout frequency
    const workoutFrequency = recentIntensity.length / 7;
    
    // Fatigue factors
    const exertionFactor = (avgExertion / 10) * 40; // 0-40 points
    const volumeFactor = Math.min((avgVolume / 2000) * 30, 30); // 0-30 points
    const frequencyFactor = Math.min(workoutFrequency * 20, 30); // 0-30 points
    
    return Math.min(Math.round(exertionFactor + volumeFactor + frequencyFactor), 100);
  }

  private calculateMuscleGroupFatigue(intensityData: WorkoutIntensityData[]): Record<string, number> {
    const muscleGroupWorkload: Record<string, number[]> = {};
    
    // Track workload per muscle group over recent workouts
    intensityData.slice(0, 7).forEach(workout => {
      workout.muscleGroups.forEach(muscleGroup => {
        if (!muscleGroupWorkload[muscleGroup]) {
          muscleGroupWorkload[muscleGroup] = [];
        }
        muscleGroupWorkload[muscleGroup].push(workout.perceivedExertion);
      });
    });

    const fatigue: Record<string, number> = {};
    Object.entries(muscleGroupWorkload).forEach(([muscleGroup, workloads]) => {
      const avgWorkload = workloads.reduce((sum, w) => sum + w, 0) / workloads.length;
      const frequency = workloads.length;
      
      // Calculate fatigue based on average workload and frequency
      fatigue[muscleGroup] = Math.min(
        Math.round((avgWorkload / 10) * 60 + (frequency / 7) * 40),
        100
      );
    });

    return fatigue;
  }

  private calculateRecoveryScore(fatigueLevel: number, intensityData: WorkoutIntensityData[]): number {
    const baseFatigueScore = 100 - fatigueLevel;
    
    // Check for rest days in recent history
    const recentDays = intensityData.slice(0, 3);
    const restDayBonus = (3 - recentDays.length) * 10; // Bonus for rest days
    
    // Check completion rates (good completion = better recovery)
    const avgCompletion = recentDays.length > 0 
      ? recentDays.reduce((sum, data) => sum + data.completionRate, 0) / recentDays.length
      : 100;
    const completionFactor = (avgCompletion / 100) * 10;
    
    return Math.min(Math.round(baseFatigueScore + restDayBonus + completionFactor), 100);
  }

  private calculateRecommendedRestDays(fatigueLevel: number, intensityData: WorkoutIntensityData[]): number {
    if (fatigueLevel < 30) return 0;
    if (fatigueLevel < 50) return 1;
    if (fatigueLevel < 75) return 2;
    return 3;
  }

  private determineNextWorkoutIntensity(
    fatigueLevel: number, 
    recoveryScore: number
  ): 'light' | 'moderate' | 'high' {
    if (fatigueLevel > 70 || recoveryScore < 40) return 'light';
    if (fatigueLevel > 50 || recoveryScore < 70) return 'moderate';
    return 'high';
  }

  private async calculateRecoveryTrend(intensityData: WorkoutIntensityData[]): Promise<'improving' | 'stable' | 'declining'> {
    if (intensityData.length < 6) return 'stable';
    
    const recent = intensityData.slice(0, 3);
    const previous = intensityData.slice(3, 6);
    
    const recentAvgExertion = recent.reduce((sum, data) => sum + data.perceivedExertion, 0) / recent.length;
    const previousAvgExertion = previous.reduce((sum, data) => sum + data.perceivedExertion, 0) / previous.length;
    
    const recentAvgCompletion = recent.reduce((sum, data) => sum + data.completionRate, 0) / recent.length;
    const previousAvgCompletion = previous.reduce((sum, data) => sum + data.completionRate, 0) / previous.length;
    
    // Improving if exertion is decreasing and completion is increasing
    if (recentAvgExertion < previousAvgExertion && recentAvgCompletion > previousAvgCompletion) {
      return 'improving';
    }
    
    // Declining if exertion is increasing and completion is decreasing
    if (recentAvgExertion > previousAvgExertion && recentAvgCompletion < previousAvgCompletion) {
      return 'declining';
    }
    
    return 'stable';
  }

  private calculateConsecutiveWorkoutDays(workouts: WorkoutSession[]): number {
    if (workouts.length === 0) return 0;
    
    const sortedWorkouts = workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let consecutive = 0;
    let currentDate = new Date();
    
    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      const daysDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === consecutive) {
        consecutive++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }
    
    return consecutive;
  }

  private async saveRecoveryMetrics(metrics: RecoveryMetrics): Promise<void> {
    try {
      const history = await this.getRecoveryHistory();
      const newEntry = {
        date: new Date().toISOString(),
        metrics,
      };
      
      history.push(newEntry);
      
      // Keep only last 30 days of history
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const filteredHistory = history.filter(entry => 
        new Date(entry.date) >= thirtyDaysAgo
      );
      
      await AsyncStorage.setItem(STORAGE_KEYS.RECOVERY_HISTORY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Error saving recovery metrics:', error);
    }
  }

  private async getRecoveryHistory(): Promise<Array<{ date: string; metrics: RecoveryMetrics }>> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.RECOVERY_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading recovery history:', error);
      return [];
    }
  }

  async getRecoveryTrendData(days: number = 14): Promise<Array<{ date: string; fatigueLevel: number; recoveryScore: number }>> {
    const history = await this.getRecoveryHistory();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return history
      .filter(entry => new Date(entry.date) >= cutoffDate)
      .map(entry => ({
        date: entry.date,
        fatigueLevel: entry.metrics.fatigueLevel,
        recoveryScore: entry.metrics.recoveryScore,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async clearRecoveryData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.RECOVERY_HISTORY,
        STORAGE_KEYS.FATIGUE_TRACKING,
        STORAGE_KEYS.RECOVERY_PREFERENCES,
      ]);
    } catch (error) {
      console.error('Error clearing recovery data:', error);
    }
  }
}

export const recoveryAnalysis = RecoveryAnalysisEngine.getInstance();
