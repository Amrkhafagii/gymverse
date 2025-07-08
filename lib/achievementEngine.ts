import { WorkoutSession } from '@/contexts/WorkoutSessionContext';
import achievementRules from './achievements/achievementRules.json';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  points: number;
  hidden: boolean;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  rules: AchievementRule[];
}

export interface AchievementRule {
  type: string;
  operator: 'gte' | 'lte' | 'eq';
  value: number;
  timeframe: 'day' | 'week' | 'month' | 'year' | 'all_time';
  condition?: string;
  exercise_name?: string;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalSets: number;
  totalReps: number;
  totalWeight: number;
  totalDuration: number;
  currentStreak: number;
  longestStreak: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
}

export class AchievementEngine {
  private static achievements: Achievement[] = [];
  private static initialized = false;

  static initialize(): Achievement[] {
    if (this.initialized) {
      return this.achievements;
    }

    this.achievements = achievementRules.achievements.map(rule => ({
      ...rule,
      unlocked: false,
      progress: 0,
      maxProgress: rule.rules[0]?.value || 100,
    }));

    this.initialized = true;
    return this.achievements;
  }

  static getAllAchievements(): Achievement[] {
    if (!this.initialized) {
      this.initialize();
    }
    return [...this.achievements];
  }

  static getAchievementById(id: string): Achievement | undefined {
    return this.achievements.find(achievement => achievement.id === id);
  }

  static checkAchievements(
    workouts: WorkoutSession[],
    stats: WorkoutStats,
    currentAchievements: Achievement[]
  ): Achievement[] {
    const newUnlocks: Achievement[] = [];

    for (const achievement of currentAchievements) {
      if (achievement.unlocked) continue;

      const isUnlocked = this.evaluateAchievement(achievement, workouts, stats);
      
      if (isUnlocked) {
        newUnlocks.push({
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
          progress: achievement.maxProgress,
        });
      }
    }

    return newUnlocks;
  }

  static calculateProgress(
    achievement: Achievement,
    workouts: WorkoutSession[],
    stats: WorkoutStats
  ): number {
    if (achievement.unlocked) {
      return achievement.maxProgress;
    }

    let totalProgress = 0;
    const ruleCount = achievement.rules.length;

    for (const rule of achievement.rules) {
      const currentValue = this.getCurrentValue(rule, workouts, stats);
      const progress = Math.min(currentValue, rule.value);
      totalProgress += (progress / rule.value) * achievement.maxProgress;
    }

    return Math.round(totalProgress / ruleCount);
  }

  private static evaluateAchievement(
    achievement: Achievement,
    workouts: WorkoutSession[],
    stats: WorkoutStats
  ): boolean {
    return achievement.rules.every(rule => 
      this.evaluateRule(rule, workouts, stats)
    );
  }

  private static evaluateRule(
    rule: AchievementRule,
    workouts: WorkoutSession[],
    stats: WorkoutStats
  ): boolean {
    const currentValue = this.getCurrentValue(rule, workouts, stats);
    
    switch (rule.operator) {
      case 'gte':
        return currentValue >= rule.value;
      case 'lte':
        return currentValue <= rule.value;
      case 'eq':
        return currentValue === rule.value;
      default:
        return false;
    }
  }

  private static getCurrentValue(
    rule: AchievementRule,
    workouts: WorkoutSession[],
    stats: WorkoutStats
  ): number {
    const filteredWorkouts = this.filterWorkoutsByTimeframe(workouts, rule.timeframe);

    switch (rule.type) {
      case 'workout_count':
        return filteredWorkouts.length;

      case 'streak':
        return stats.currentStreak;

      case 'total_volume':
        return stats.totalWeight;

      case 'single_workout_duration':
        return Math.max(...filteredWorkouts.map(w => w.total_duration_seconds), 0);

      case 'total_duration':
        return stats.totalDuration;

      case 'total_sets':
        return stats.totalSets;

      case 'total_reps':
        return stats.totalReps;

      case 'workout_frequency':
        return filteredWorkouts.length;

      case 'time_based_workouts':
        return this.countTimeBasedWorkouts(filteredWorkouts, rule.condition);

      case 'exercise_frequency':
        return this.countExerciseFrequency(filteredWorkouts, rule.exercise_name);

      default:
        return 0;
    }
  }

  private static filterWorkoutsByTimeframe(
    workouts: WorkoutSession[],
    timeframe: string
  ): WorkoutSession[] {
    const completedWorkouts = workouts.filter(w => w.completed_at);
    
    if (timeframe === 'all_time') {
      return completedWorkouts;
    }

    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        return completedWorkouts;
    }

    return completedWorkouts.filter(workout => {
      const workoutDate = new Date(workout.completed_at!);
      return workoutDate >= startDate;
    });
  }

  private static countTimeBasedWorkouts(
    workouts: WorkoutSession[],
    condition?: string
  ): number {
    if (!condition) return 0;

    return workouts.filter(workout => {
      const hour = new Date(workout.started_at).getHours();
      
      switch (condition) {
        case 'before_7am':
          return hour < 7;
        case 'after_9pm':
          return hour >= 21;
        default:
          return false;
      }
    }).length;
  }

  private static countExerciseFrequency(
    workouts: WorkoutSession[],
    exerciseName?: string
  ): number {
    if (!exerciseName) return 0;

    return workouts.filter(workout =>
      workout.exercises.some(exercise =>
        exercise.exercise_name.toLowerCase().includes(exerciseName.toLowerCase())
      )
    ).length;
  }

  static getCategories() {
    return achievementRules.categories;
  }

  static getRarities() {
    return achievementRules.rarities;
  }

  static getAchievementsByCategory(category: string): Achievement[] {
    return this.achievements.filter(achievement => achievement.category === category);
  }

  static getAchievementsByRarity(rarity: string): Achievement[] {
    return this.achievements.filter(achievement => achievement.rarity === rarity);
  }
}
