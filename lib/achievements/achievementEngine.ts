import { Achievement, AchievementCategory, AchievementRarity, AchievementRequirement } from '@/types/achievement';
import { WorkoutSession } from '@/contexts/WorkoutSessionContext';

export class AchievementEngine {
  private static achievements: Achievement[] = [
    // Consistency Achievements
    {
      id: 'first_workout',
      name: 'First Steps',
      description: 'Complete your first workout',
      icon: '🎯',
      category: AchievementCategory.MILESTONE,
      rarity: AchievementRarity.COMMON,
      points: 10,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      requirements: [
        { type: 'workout_count', value: 1, timeframe: 'all_time' }
      ],
    },
    {
      id: 'streak_3',
      name: 'Getting Started',
      description: 'Work out 3 days in a row',
      icon: '🔥',
      category: AchievementCategory.CONSISTENCY,
      rarity: AchievementRarity.COMMON,
      points: 25,
      unlocked: false,
      progress: 0,
      maxProgress: 3,
      requirements: [
        { type: 'streak', value: 3, timeframe: 'all_time' }
      ],
    },
    {
      id: 'streak_7',
      name: 'Week Warrior',
      description: 'Maintain a 7-day workout streak',
      icon: '⚡',
      category: AchievementCategory.CONSISTENCY,
      rarity: AchievementRarity.RARE,
      points: 50,
      unlocked: false,
      progress: 0,
      maxProgress: 7,
      requirements: [
        { type: 'streak', value: 7, timeframe: 'all_time' }
      ],
    },
    {
      id: 'streak_30',
      name: 'Consistency King',
      description: 'Achieve a 30-day workout streak',
      icon: '👑',
      category: AchievementCategory.CONSISTENCY,
      rarity: AchievementRarity.EPIC,
      points: 150,
      unlocked: false,
      progress: 0,
      maxProgress: 30,
      requirements: [
        { type: 'streak', value: 30, timeframe: 'all_time' }
      ],
    },
    {
      id: 'streak_100',
      name: 'Unstoppable Force',
      description: 'Reach a legendary 100-day streak',
      icon: '🌟',
      category: AchievementCategory.CONSISTENCY,
      rarity: AchievementRarity.LEGENDARY,
      points: 500,
      unlocked: false,
      progress: 0,
      maxProgress: 100,
      requirements: [
        { type: 'streak', value: 100, timeframe: 'all_time' }
      ],
    },

    // Milestone Achievements
    {
      id: 'workouts_10',
      name: 'Double Digits',
      description: 'Complete 10 total workouts',
      icon: '🎖️',
      category: AchievementCategory.MILESTONE,
      rarity: AchievementRarity.COMMON,
      points: 30,
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      requirements: [
        { type: 'workout_count', value: 10, timeframe: 'all_time' }
      ],
    },
    {
      id: 'workouts_50',
      name: 'Half Century',
      description: 'Reach 50 completed workouts',
      icon: '🏅',
      category: AchievementCategory.MILESTONE,
      rarity: AchievementRarity.RARE,
      points: 75,
      unlocked: false,
      progress: 0,
      maxProgress: 50,
      requirements: [
        { type: 'workout_count', value: 50, timeframe: 'all_time' }
      ],
    },
    {
      id: 'workouts_100',
      name: 'Century Club',
      description: 'Complete 100 workouts',
      icon: '💯',
      category: AchievementCategory.MILESTONE,
      rarity: AchievementRarity.EPIC,
      points: 200,
      unlocked: false,
      progress: 0,
      maxProgress: 100,
      requirements: [
        { type: 'workout_count', value: 100, timeframe: 'all_time' }
      ],
    },

    // Strength Achievements
    {
      id: 'volume_1000',
      name: 'Ton Lifter',
      description: 'Lift 1,000kg total volume',
      icon: '💪',
      category: AchievementCategory.STRENGTH,
      rarity: AchievementRarity.COMMON,
      points: 40,
      unlocked: false,
      progress: 0,
      maxProgress: 1000,
      requirements: [
        { type: 'total_volume', value: 1000, timeframe: 'all_time' }
      ],
    },
    {
      id: 'volume_10000',
      name: 'Iron Mountain',
      description: 'Lift 10,000kg total volume',
      icon: '🏔️',
      category: AchievementCategory.STRENGTH,
      rarity: AchievementRarity.RARE,
      points: 100,
      unlocked: false,
      progress: 0,
      maxProgress: 10000,
      requirements: [
        { type: 'total_volume', value: 10000, timeframe: 'all_time' }
      ],
    },
    {
      id: 'volume_50000',
      name: 'Strength Titan',
      description: 'Achieve 50,000kg total volume',
      icon: '⚡',
      category: AchievementCategory.STRENGTH,
      rarity: AchievementRarity.EPIC,
      points: 250,
      unlocked: false,
      progress: 0,
      maxProgress: 50000,
      requirements: [
        { type: 'total_volume', value: 50000, timeframe: 'all_time' }
      ],
    },

    // Endurance Achievements
    {
      id: 'duration_60',
      name: 'Hour Power',
      description: 'Complete a 60-minute workout',
      icon: '⏰',
      category: AchievementCategory.ENDURANCE,
      rarity: AchievementRarity.COMMON,
      points: 35,
      unlocked: false,
      progress: 0,
      maxProgress: 3600, // 60 minutes in seconds
      requirements: [
        { type: 'duration', value: 3600, timeframe: 'all_time' }
      ],
    },
    {
      id: 'duration_120',
      name: 'Endurance Beast',
      description: 'Push through a 2-hour workout',
      icon: '🦁',
      category: AchievementCategory.ENDURANCE,
      rarity: AchievementRarity.RARE,
      points: 80,
      unlocked: false,
      progress: 0,
      maxProgress: 7200, // 120 minutes in seconds
      requirements: [
        { type: 'duration', value: 7200, timeframe: 'all_time' }
      ],
    },
    {
      id: 'total_duration_100h',
      name: 'Time Warrior',
      description: 'Accumulate 100 hours of total workout time',
      icon: '⚔️',
      category: AchievementCategory.ENDURANCE,
      rarity: AchievementRarity.EPIC,
      points: 300,
      unlocked: false,
      progress: 0,
      maxProgress: 360000, // 100 hours in seconds
      requirements: [
        { type: 'duration', value: 360000, timeframe: 'all_time' }
      ],
    },

    // Sets and Reps Achievements
    {
      id: 'sets_100',
      name: 'Set Master',
      description: 'Complete 100 total sets',
      icon: '🎯',
      category: AchievementCategory.STRENGTH,
      rarity: AchievementRarity.COMMON,
      points: 25,
      unlocked: false,
      progress: 0,
      maxProgress: 100,
      requirements: [
        { type: 'sets', value: 100, timeframe: 'all_time' }
      ],
    },
    {
      id: 'reps_1000',
      name: 'Rep Machine',
      description: 'Perform 1,000 total reps',
      icon: '🔄',
      category: AchievementCategory.STRENGTH,
      rarity: AchievementRarity.COMMON,
      points: 30,
      unlocked: false,
      progress: 0,
      maxProgress: 1000,
      requirements: [
        { type: 'reps', value: 1000, timeframe: 'all_time' }
      ],
    },

    // Frequency Achievements
    {
      id: 'weekly_5',
      name: 'Weekday Warrior',
      description: 'Work out 5 times in one week',
      icon: '📅',
      category: AchievementCategory.CONSISTENCY,
      rarity: AchievementRarity.RARE,
      points: 60,
      unlocked: false,
      progress: 0,
      maxProgress: 5,
      requirements: [
        { type: 'workout_frequency', value: 5, timeframe: 'week' }
      ],
    },
    {
      id: 'monthly_20',
      name: 'Monthly Grind',
      description: 'Complete 20 workouts in one month',
      icon: '🗓️',
      category: AchievementCategory.CONSISTENCY,
      rarity: AchievementRarity.EPIC,
      points: 120,
      unlocked: false,
      progress: 0,
      maxProgress: 20,
      requirements: [
        { type: 'workout_frequency', value: 20, timeframe: 'month' }
      ],
    },

    // Special Achievements
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Complete 10 workouts before 7 AM',
      icon: '🌅',
      category: AchievementCategory.SPECIAL,
      rarity: AchievementRarity.RARE,
      points: 70,
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      requirements: [
        { type: 'time_based', value: 10, timeframe: 'all_time' }
      ],
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Complete 10 workouts after 9 PM',
      icon: '🦉',
      category: AchievementCategory.SPECIAL,
      rarity: AchievementRarity.RARE,
      points: 70,
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      requirements: [
        { type: 'time_based', value: 10, timeframe: 'all_time' }
      ],
    },

    // Exercise-Specific Achievements
    {
      id: 'squat_specialist',
      name: 'Squat Specialist',
      description: 'Perform squats in 25 different workouts',
      icon: '🏋️',
      category: AchievementCategory.STRENGTH,
      rarity: AchievementRarity.RARE,
      points: 85,
      unlocked: false,
      progress: 0,
      maxProgress: 25,
      requirements: [
        { type: 'specific_exercise', value: 25, exerciseName: 'Squat', timeframe: 'all_time' }
      ],
    },
    {
      id: 'bench_master',
      name: 'Bench Master',
      description: 'Perform bench press in 25 different workouts',
      icon: '🏋️‍♂️',
      category: AchievementCategory.STRENGTH,
      rarity: AchievementRarity.RARE,
      points: 85,
      unlocked: false,
      progress: 0,
      maxProgress: 25,
      requirements: [
        { type: 'specific_exercise', value: 25, exerciseName: 'Bench Press', timeframe: 'all_time' }
      ],
    },
  ];

  static getAllAchievements(): Achievement[] {
    return [...this.achievements];
  }

  static getAchievementById(id: string): Achievement | undefined {
    return this.achievements.find(achievement => achievement.id === id);
  }

  static checkAchievements(
    currentAchievements: Achievement[],
    workoutHistory: WorkoutSession[],
    workoutStats: any
  ): Achievement[] {
    const newUnlocks: Achievement[] = [];

    for (const achievement of currentAchievements) {
      if (achievement.unlocked) continue;

      // Check prerequisites
      if (achievement.prerequisiteIds) {
        const prerequisitesMet = achievement.prerequisiteIds.every(prereqId =>
          currentAchievements.find(a => a.id === prereqId)?.unlocked
        );
        if (!prerequisitesMet) continue;
      }

      // Check if all requirements are met
      const requirementsMet = achievement.requirements.every(requirement =>
        this.checkRequirement(requirement, workoutHistory, workoutStats)
      );

      if (requirementsMet) {
        newUnlocks.push(achievement);
      }
    }

    return newUnlocks;
  }

  static calculateProgress(
    achievement: Achievement,
    workoutHistory: WorkoutSession[],
    workoutStats: any
  ): number {
    if (achievement.unlocked) return achievement.maxProgress;

    let totalProgress = 0;
    let requirementCount = achievement.requirements.length;

    for (const requirement of achievement.requirements) {
      const currentValue = this.getCurrentValue(requirement, workoutHistory, workoutStats);
      const progress = Math.min(currentValue, requirement.value);
      totalProgress += (progress / requirement.value) * achievement.maxProgress;
    }

    return Math.round(totalProgress / requirementCount);
  }

  private static checkRequirement(
    requirement: AchievementRequirement,
    workoutHistory: WorkoutSession[],
    workoutStats: any
  ): boolean {
    const currentValue = this.getCurrentValue(requirement, workoutHistory, workoutStats);
    const operator = requirement.operator || 'gte';

    switch (operator) {
      case 'gte':
        return currentValue >= requirement.value;
      case 'lte':
        return currentValue <= requirement.value;
      case 'eq':
        return currentValue === requirement.value;
      default:
        return false;
    }
  }

  private static getCurrentValue(
    requirement: AchievementRequirement,
    workoutHistory: WorkoutSession[],
    workoutStats: any
  ): number {
    const filteredWorkouts = this.filterWorkoutsByTimeframe(workoutHistory, requirement.timeframe);

    switch (requirement.type) {
      case 'workout_count':
        return filteredWorkouts.length;

      case 'streak':
        return workoutStats.currentStreak || 0;

      case 'total_volume':
        return workoutStats.totalWeight || 0;

      case 'duration':
        if (requirement.timeframe === 'all_time') {
          // Check for single workout duration
          const maxDuration = Math.max(...filteredWorkouts.map(w => w.total_duration_seconds), 0);
          return maxDuration;
        } else {
          // Total duration across timeframe
          return filteredWorkouts.reduce((sum, w) => sum + w.total_duration_seconds, 0);
        }

      case 'sets':
        return workoutStats.totalSets || 0;

      case 'reps':
        return workoutStats.totalReps || 0;

      case 'workout_frequency':
        return filteredWorkouts.length;

      case 'specific_exercise':
        if (!requirement.exerciseName) return 0;
        return filteredWorkouts.filter(workout =>
          workout.exercises.some(exercise =>
            exercise.exercise_name.toLowerCase().includes(requirement.exerciseName!.toLowerCase())
          )
        ).length;

      case 'time_based':
        // For early bird/night owl achievements
        if (requirement.value === 10) {
          return filteredWorkouts.filter(workout => {
            const hour = new Date(workout.started_at).getHours();
            // Early bird: before 7 AM, Night owl: after 9 PM
            return hour < 7 || hour >= 21;
          }).length;
        }
        return 0;

      case 'exercise_pr':
        // Personal record achievements would be implemented here
        return 0;

      default:
        return 0;
    }
  }

  private static filterWorkoutsByTimeframe(
    workouts: WorkoutSession[],
    timeframe?: string
  ): WorkoutSession[] {
    if (!timeframe || timeframe === 'all_time') {
      return workouts.filter(w => w.completed_at);
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
        return workouts.filter(w => w.completed_at);
    }

    return workouts.filter(workout => {
      if (!workout.completed_at) return false;
      const workoutDate = new Date(workout.completed_at);
      return workoutDate >= startDate;
    });
  }
}
