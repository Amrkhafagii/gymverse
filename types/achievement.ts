export enum AchievementCategory {
  STRENGTH = 'strength',
  ENDURANCE = 'endurance',
  CONSISTENCY = 'consistency',
  MILESTONE = 'milestone',
  SOCIAL = 'social',
  SPECIAL = 'special',
}

export enum AchievementRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  lastSeen?: string;
  requirements: AchievementRequirement[];
  hidden?: boolean;
  prerequisiteIds?: string[];
}

export interface AchievementRequirement {
  type: 'workout_count' | 'streak' | 'total_volume' | 'exercise_pr' | 'duration' | 'sets' | 'reps' | 'specific_exercise' | 'workout_frequency' | 'time_based';
  value: number;
  timeframe?: 'day' | 'week' | 'month' | 'year' | 'all_time';
  exerciseName?: string;
  operator?: 'gte' | 'lte' | 'eq';
}

export interface AchievementUnlock {
  achievement: Achievement;
  unlockedAt: string;
  isNew: boolean;
}

export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  targetValue: number;
  percentage: number;
  isComplete: boolean;
}
