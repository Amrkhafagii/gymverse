export interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface AchievementTier {
  id: string;
  name: string;
  multiplier: number;
  color: string;
}

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  {
    id: 'workout',
    name: 'Workout',
    description: 'Complete workouts and training sessions',
    color: '#FF6B35',
    icon: '💪'
  },
  {
    id: 'strength',
    name: 'Strength',
    description: 'Achieve strength milestones and PRs',
    color: '#E74C3C',
    icon: '🏋️'
  },
  {
    id: 'consistency',
    name: 'Consistency',
    description: 'Maintain regular workout habits',
    color: '#27AE60',
    icon: '🔥'
  },
  {
    id: 'endurance',
    name: 'Endurance',
    description: 'Build cardiovascular fitness',
    color: '#4A90E2',
    icon: '🏃'
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Engage with the fitness community',
    color: '#9B59B6',
    icon: '👥'
  },
  {
    id: 'milestone',
    name: 'Milestone',
    description: 'Reach significant fitness goals',
    color: '#F39C12',
    icon: '🎯'
  },
  {
    id: 'exploration',
    name: 'Exploration',
    description: 'Try new exercises and workouts',
    color: '#1ABC9C',
    icon: '🌟'
  }
];

export const ACHIEVEMENT_TIERS: AchievementTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    multiplier: 1,
    color: '#CD7F32'
  },
  {
    id: 'silver',
    name: 'Silver',
    multiplier: 2,
    color: '#C0C0C0'
  },
  {
    id: 'gold',
    name: 'Gold',
    multiplier: 3,
    color: '#FFD700'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    multiplier: 5,
    color: '#E5E4E2'
  },
  {
    id: 'diamond',
    name: 'Diamond',
    multiplier: 10,
    color: '#B9F2FF'
  }
];

export interface AchievementTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  icon: string;
  points: number;
  requirement: {
    type: 'count' | 'streak' | 'total' | 'single' | 'percentage';
    target: number;
    metric: string;
    timeframe?: 'day' | 'week' | 'month' | 'all_time';
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
  // Workout Achievements
  {
    id: 'first_workout',
    name: 'First Steps',
    description: 'Complete your first workout',
    category: 'workout',
    tier: 'bronze',
    icon: '🎯',
    points: 50,
    requirement: {
      type: 'count',
      target: 1,
      metric: 'workouts_completed'
    },
    rarity: 'common'
  },
  {
    id: 'workout_warrior_bronze',
    name: 'Workout Warrior',
    description: 'Complete 10 workouts',
    category: 'workout',
    tier: 'bronze',
    icon: '⚔️',
    points: 100,
    requirement: {
      type: 'count',
      target: 10,
      metric: 'workouts_completed'
    },
    rarity: 'common'
  },
  {
    id: 'workout_warrior_silver',
    name: 'Workout Champion',
    description: 'Complete 50 workouts',
    category: 'workout',
    tier: 'silver',
    icon: '⚔️',
    points: 300,
    requirement: {
      type: 'count',
      target: 50,
      metric: 'workouts_completed'
    },
    rarity: 'uncommon'
  },
  {
    id: 'workout_warrior_gold',
    name: 'Workout Legend',
    description: 'Complete 100 workouts',
    category: 'workout',
    tier: 'gold',
    icon: '⚔️',
    points: 750,
    requirement: {
      type: 'count',
      target: 100,
      metric: 'workouts_completed'
    },
    rarity: 'rare'
  },
  {
    id: 'marathon_session',
    name: 'Marathon Session',
    description: 'Complete a workout lasting over 2 hours',
    category: 'workout',
    tier: 'gold',
    icon: '⏰',
    points: 500,
    requirement: {
      type: 'single',
      target: 120,
      metric: 'workout_duration_minutes'
    },
    rarity: 'rare'
  },

  // Strength Achievements
  {
    id: 'first_pr',
    name: 'Personal Best',
    description: 'Set your first personal record',
    category: 'strength',
    tier: 'bronze',
    icon: '📈',
    points: 100,
    requirement: {
      type: 'count',
      target: 1,
      metric: 'personal_records'
    },
    rarity: 'common'
  },
  {
    id: 'strength_master',
    name: 'Strength Master',
    description: 'Set 10 personal records',
    category: 'strength',
    tier: 'silver',
    icon: '💎',
    points: 400,
    requirement: {
      type: 'count',
      target: 10,
      metric: 'personal_records'
    },
    rarity: 'uncommon'
  },
  {
    id: 'heavy_lifter',
    name: 'Heavy Lifter',
    description: 'Lift over 200kg in a single exercise',
    category: 'strength',
    tier: 'gold',
    icon: '🏋️‍♂️',
    points: 600,
    requirement: {
      type: 'single',
      target: 200,
      metric: 'max_weight_kg'
    },
    rarity: 'rare'
  },
  {
    id: 'powerlifter',
    name: 'Powerlifter',
    description: 'Achieve 500kg total in squat, bench, and deadlift',
    category: 'strength',
    tier: 'platinum',
    icon: '👑',
    points: 1000,
    requirement: {
      type: 'total',
      target: 500,
      metric: 'powerlifting_total_kg'
    },
    rarity: 'epic'
  },

  // Consistency Achievements
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: 'Maintain a 3-day workout streak',
    category: 'consistency',
    tier: 'bronze',
    icon: '🔥',
    points: 75,
    requirement: {
      type: 'streak',
      target: 3,
      metric: 'workout_days'
    },
    rarity: 'common'
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day workout streak',
    category: 'consistency',
    tier: 'silver',
    icon: '🔥',
    points: 200,
    requirement: {
      type: 'streak',
      target: 7,
      metric: 'workout_days'
    },
    rarity: 'uncommon'
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Maintain a 30-day workout streak',
    category: 'consistency',
    tier: 'gold',
    icon: '🔥',
    points: 800,
    requirement: {
      type: 'streak',
      target: 30,
      metric: 'workout_days'
    },
    rarity: 'rare'
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Maintain a 100-day workout streak',
    category: 'consistency',
    tier: 'diamond',
    icon: '🔥',
    points: 2000,
    requirement: {
      type: 'streak',
      target: 100,
      metric: 'workout_days'
    },
    rarity: 'legendary'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 10 workouts before 7 AM',
    category: 'consistency',
    tier: 'silver',
    icon: '🌅',
    points: 250,
    requirement: {
      type: 'count',
      target: 10,
      metric: 'early_morning_workouts'
    },
    rarity: 'uncommon'
  },

  // Endurance Achievements
  {
    id: 'cardio_starter',
    name: 'Cardio Starter',
    description: 'Complete 30 minutes of cardio',
    category: 'endurance',
    tier: 'bronze',
    icon: '❤️',
    points: 50,
    requirement: {
      type: 'single',
      target: 30,
      metric: 'cardio_minutes'
    },
    rarity: 'common'
  },
  {
    id: 'endurance_athlete',
    name: 'Endurance Athlete',
    description: 'Complete 10 hours of cardio total',
    category: 'endurance',
    tier: 'silver',
    icon: '🏃‍♂️',
    points: 300,
    requirement: {
      type: 'total',
      target: 600,
      metric: 'cardio_minutes'
    },
    rarity: 'uncommon'
  },
  {
    id: 'marathon_runner',
    name: 'Marathon Runner',
    description: 'Run 42.2km in a single session',
    category: 'endurance',
    tier: 'platinum',
    icon: '🏃‍♀️',
    points: 1200,
    requirement: {
      type: 'single',
      target: 42.2,
      metric: 'distance_km'
    },
    rarity: 'epic'
  },

  // Social Achievements
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Like 50 posts from other users',
    category: 'social',
    tier: 'bronze',
    icon: '👍',
    points: 75,
    requirement: {
      type: 'count',
      target: 50,
      metric: 'likes_given'
    },
    rarity: 'common'
  },
  {
    id: 'motivator',
    name: 'Motivator',
    description: 'Comment on 25 posts',
    category: 'social',
    tier: 'silver',
    icon: '💬',
    points: 150,
    requirement: {
      type: 'count',
      target: 25,
      metric: 'comments_made'
    },
    rarity: 'uncommon'
  },
  {
    id: 'influencer',
    name: 'Fitness Influencer',
    description: 'Get 100 likes on your posts',
    category: 'social',
    tier: 'gold',
    icon: '⭐',
    points: 400,
    requirement: {
      type: 'count',
      target: 100,
      metric: 'likes_received'
    },
    rarity: 'rare'
  },
  {
    id: 'community_leader',
    name: 'Community Leader',
    description: 'Help 10 users by sharing workouts',
    category: 'social',
    tier: 'platinum',
    icon: '👑',
    points: 800,
    requirement: {
      type: 'count',
      target: 10,
      metric: 'workouts_shared'
    },
    rarity: 'epic'
  },

  // Milestone Achievements
  {
    id: 'goal_crusher',
    name: 'Goal Crusher',
    description: 'Complete your first fitness goal',
    category: 'milestone',
    tier: 'bronze',
    icon: '🎯',
    points: 200,
    requirement: {
      type: 'count',
      target: 1,
      metric: 'goals_completed'
    },
    rarity: 'common'
  },
  {
    id: 'transformation',
    name: 'Transformation',
    description: 'Log progress for 30 consecutive days',
    category: 'milestone',
    tier: 'gold',
    icon: '📊',
    points: 600,
    requirement: {
      type: 'streak',
      target: 30,
      metric: 'progress_logged_days'
    },
    rarity: 'rare'
  },
  {
    id: 'year_veteran',
    name: 'Year Veteran',
    description: 'Stay active for 365 days',
    category: 'milestone',
    tier: 'diamond',
    icon: '🏆',
    points: 3000,
    requirement: {
      type: 'count',
      target: 365,
      metric: 'active_days'
    },
    rarity: 'legendary'
  },

  // Exploration Achievements
  {
    id: 'exercise_explorer',
    name: 'Exercise Explorer',
    description: 'Try 10 different exercises',
    category: 'exploration',
    tier: 'bronze',
    icon: '🗺️',
    points: 100,
    requirement: {
      type: 'count',
      target: 10,
      metric: 'unique_exercises'
    },
    rarity: 'common'
  },
  {
    id: 'workout_variety',
    name: 'Workout Variety',
    description: 'Complete 5 different workout types',
    category: 'exploration',
    tier: 'silver',
    icon: '🎨',
    points: 200,
    requirement: {
      type: 'count',
      target: 5,
      metric: 'workout_types'
    },
    rarity: 'uncommon'
  },
  {
    id: 'fitness_scholar',
    name: 'Fitness Scholar',
    description: 'Try 50 different exercises',
    category: 'exploration',
    tier: 'gold',
    icon: '📚',
    points: 500,
    requirement: {
      type: 'count',
      target: 50,
      metric: 'unique_exercises'
    },
    rarity: 'rare'
  },
  {
    id: 'master_of_all',
    name: 'Master of All',
    description: 'Complete workouts in all available categories',
    category: 'exploration',
    tier: 'platinum',
    icon: '🌟',
    points: 1000,
    requirement: {
      type: 'percentage',
      target: 100,
      metric: 'workout_categories_completed'
    },
    rarity: 'epic'
  }
];

export function getAchievementsByCategory(category: string): AchievementTemplate[] {
  return ACHIEVEMENT_TEMPLATES.filter(achievement => achievement.category === category);
}

export function getAchievementsByTier(tier: string): AchievementTemplate[] {
  return ACHIEVEMENT_TEMPLATES.filter(achievement => achievement.tier === tier);
}

export function getAchievementsByRarity(rarity: string): AchievementTemplate[] {
  return ACHIEVEMENT_TEMPLATES.filter(achievement => achievement.rarity === rarity);
}

export function getCategoryInfo(categoryId: string): AchievementCategory | undefined {
  return ACHIEVEMENT_CATEGORIES.find(cat => cat.id === categoryId);
}

export function getTierInfo(tierId: string): AchievementTier | undefined {
  return ACHIEVEMENT_TIERS.find(tier => tier.id === tierId);
}
