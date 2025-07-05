export interface StreakType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  metric: string;
  resetCondition: 'daily' | 'weekly' | 'monthly';
}

export interface UserStreak {
  id: string;
  user_id: string;
  streak_type: string;
  current_count: number;
  best_count: number;
  last_activity_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const STREAK_TYPES: StreakType[] = [
  {
    id: 'workout_days',
    name: 'Workout Streak',
    description: 'Complete at least one workout per day',
    icon: '🔥',
    color: '#FF6B35',
    metric: 'daily_workout',
    resetCondition: 'daily'
  },
  {
    id: 'cardio_streak',
    name: 'Cardio Streak',
    description: 'Complete cardio exercise daily',
    icon: '❤️',
    color: '#E74C3C',
    metric: 'daily_cardio',
    resetCondition: 'daily'
  },
  {
    id: 'strength_streak',
    name: 'Strength Streak',
    description: 'Complete strength training daily',
    icon: '💪',
    color: '#8B5CF6',
    metric: 'daily_strength',
    resetCondition: 'daily'
  },
  {
    id: 'progress_log_streak',
    name: 'Progress Streak',
    description: 'Log your progress daily',
    icon: '📊',
    color: '#10B981',
    metric: 'daily_progress_log',
    resetCondition: 'daily'
  },
  {
    id: 'social_streak',
    name: 'Social Streak',
    description: 'Engage with community daily',
    icon: '👥',
    color: '#3B82F6',
    metric: 'daily_social_activity',
    resetCondition: 'daily'
  },
  {
    id: 'weekly_goals',
    name: 'Weekly Goals',
    description: 'Complete weekly fitness goals',
    icon: '🎯',
    color: '#F59E0B',
    metric: 'weekly_goal_completion',
    resetCondition: 'weekly'
  }
];

export interface StreakMilestone {
  days: number;
  title: string;
  description: string;
  reward: {
    type: 'points' | 'badge' | 'unlock';
    value: number | string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 3,
    title: 'Getting Started',
    description: 'Keep the momentum going!',
    reward: { type: 'points', value: 50 },
    rarity: 'common'
  },
  {
    days: 7,
    title: 'One Week Strong',
    description: 'You\'re building a habit!',
    reward: { type: 'points', value: 150 },
    rarity: 'common'
  },
  {
    days: 14,
    title: 'Two Week Warrior',
    description: 'Consistency is key!',
    reward: { type: 'points', value: 300 },
    rarity: 'rare'
  },
  {
    days: 30,
    title: 'Monthly Master',
    description: 'A full month of dedication!',
    reward: { type: 'badge', value: 'monthly_master' },
    rarity: 'epic'
  },
  {
    days: 50,
    title: 'Unstoppable Force',
    description: 'Nothing can break your streak!',
    reward: { type: 'points', value: 1000 },
    rarity: 'epic'
  },
  {
    days: 100,
    title: 'Century Club',
    description: 'You\'ve reached legendary status!',
    reward: { type: 'badge', value: 'century_club' },
    rarity: 'legendary'
  },
  {
    days: 365,
    title: 'Year Champion',
    description: 'A full year of commitment!',
    reward: { type: 'unlock', value: 'exclusive_workouts' },
    rarity: 'legendary'
  }
];

export function getStreakTypeInfo(streakTypeId: string): StreakType | undefined {
  return STREAK_TYPES.find(type => type.id === streakTypeId);
}

export function getStreakMilestone(days: number): StreakMilestone | undefined {
  return STREAK_MILESTONES.find(milestone => milestone.days === days);
}

export function getNextMilestone(currentDays: number): StreakMilestone | undefined {
  return STREAK_MILESTONES.find(milestone => milestone.days > currentDays);
}

export function calculateStreakMultiplier(days: number): number {
  if (days >= 100) return 3.0;
  if (days >= 50) return 2.5;
  if (days >= 30) return 2.0;
  if (days >= 14) return 1.5;
  if (days >= 7) return 1.2;
  return 1.0;
}
