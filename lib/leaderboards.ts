export interface LeaderboardType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  metric: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time';
  resetSchedule?: 'daily' | 'weekly' | 'monthly';
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  leaderboard_type: string;
  score: number;
  rank: number;
  previous_rank?: number;
  timeframe_start: string;
  timeframe_end: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface UserLeaderboardStats {
  user_id: string;
  total_points: number;
  workouts_completed: number;
  streak_days: number;
  achievements_earned: number;
  challenges_completed: number;
  social_score: number;
  consistency_score: number;
  strength_score: number;
  cardio_score: number;
  weekly_rank?: number;
  monthly_rank?: number;
  all_time_rank?: number;
}

export const LEADERBOARD_TYPES: LeaderboardType[] = [
  {
    id: 'weekly_points',
    name: 'Weekly Champions',
    description: 'Top point earners this week',
    icon: '🏆',
    color: '#FFD700',
    metric: 'weekly_points',
    timeframe: 'weekly',
    resetSchedule: 'weekly'
  },
  {
    id: 'monthly_points',
    name: 'Monthly Masters',
    description: 'Top performers this month',
    icon: '👑',
    color: '#FF6B35',
    metric: 'monthly_points',
    timeframe: 'monthly',
    resetSchedule: 'monthly'
  },
  {
    id: 'all_time_points',
    name: 'Hall of Fame',
    description: 'All-time point leaders',
    icon: '⭐',
    color: '#8B5CF6',
    metric: 'total_points',
    timeframe: 'all_time'
  },
  {
    id: 'workout_streak',
    name: 'Streak Masters',
    description: 'Longest current workout streaks',
    icon: '🔥',
    color: '#E74C3C',
    metric: 'current_streak',
    timeframe: 'all_time'
  },
  {
    id: 'weekly_workouts',
    name: 'Workout Warriors',
    description: 'Most workouts completed this week',
    icon: '💪',
    color: '#27AE60',
    metric: 'weekly_workouts',
    timeframe: 'weekly',
    resetSchedule: 'weekly'
  },
  {
    id: 'social_engagement',
    name: 'Community Leaders',
    description: 'Most active community members',
    icon: '👥',
    color: '#3B82F6',
    metric: 'social_score',
    timeframe: 'weekly',
    resetSchedule: 'weekly'
  },
  {
    id: 'consistency_champions',
    name: 'Consistency Champions',
    description: 'Most consistent performers',
    icon: '📈',
    color: '#10B981',
    metric: 'consistency_score',
    timeframe: 'monthly',
    resetSchedule: 'monthly'
  },
  {
    id: 'strength_leaders',
    name: 'Strength Elite',
    description: 'Top strength performers',
    icon: '🏋️',
    color: '#F59E0B',
    metric: 'strength_score',
    timeframe: 'all_time'
  }
];

export interface LeaderboardReward {
  rank_range: [number, number]; // [min_rank, max_rank]
  reward_type: 'points' | 'badge' | 'title' | 'unlock';
  reward_value: number | string;
  title: string;
  description: string;
}

export const LEADERBOARD_REWARDS: Record<string, LeaderboardReward[]> = {
  weekly_points: [
    {
      rank_range: [1, 1],
      reward_type: 'badge',
      reward_value: 'weekly_champion',
      title: 'Weekly Champion',
      description: 'Dominated the weekly leaderboard!'
    },
    {
      rank_range: [2, 3],
      reward_type: 'points',
      reward_value: 500,
      title: 'Weekly Elite',
      description: 'Top 3 weekly performer'
    },
    {
      rank_range: [4, 10],
      reward_type: 'points',
      reward_value: 250,
      title: 'Weekly Top 10',
      description: 'Excellent weekly performance'
    }
  ],
  monthly_points: [
    {
      rank_range: [1, 1],
      reward_type: 'title',
      reward_value: 'Monthly Master',
      title: 'Monthly Master',
      description: 'Conquered the monthly leaderboard!'
    },
    {
      rank_range: [2, 5],
      reward_type: 'points',
      reward_value: 1000,
      title: 'Monthly Elite',
      description: 'Top 5 monthly performer'
    }
  ],
  all_time_points: [
    {
      rank_range: [1, 1],
      reward_type: 'title',
      reward_value: 'Legend',
      title: 'Hall of Fame Legend',
      description: 'All-time points leader!'
    },
    {
      rank_range: [2, 10],
      reward_type: 'badge',
      reward_value: 'hall_of_fame',
      title: 'Hall of Fame',
      description: 'Top 10 all-time performer'
    }
  ]
};

export function getLeaderboardTypeInfo(typeId: string): LeaderboardType | undefined {
  return LEADERBOARD_TYPES.find(type => type.id === typeId);
}

export function getLeaderboardRewards(leaderboardType: string): LeaderboardReward[] {
  return LEADERBOARD_REWARDS[leaderboardType] || [];
}

export function getRankTier(rank: number): {
  tier: string;
  color: string;
  icon: string;
} {
  if (rank === 1) {
    return { tier: 'Champion', color: '#FFD700', icon: '👑' };
  } else if (rank <= 3) {
    return { tier: 'Elite', color: '#C0C0C0', icon: '🥈' };
  } else if (rank <= 10) {
    return { tier: 'Top 10', color: '#CD7F32', icon: '🥉' };
  } else if (rank <= 25) {
    return { tier: 'Top 25', color: '#4A90E2', icon: '⭐' };
  } else if (rank <= 50) {
    return { tier: 'Top 50', color: '#27AE60', icon: '🌟' };
  } else if (rank <= 100) {
    return { tier: 'Top 100', color: '#9B59B6', icon: '💫' };
  } else {
    return { tier: 'Participant', color: '#6B7280', icon: '🎯' };
  }
}

export function calculateRankChange(currentRank: number, previousRank?: number): {
  change: number;
  direction: 'up' | 'down' | 'same' | 'new';
  color: string;
} {
  if (!previousRank) {
    return { change: 0, direction: 'new', color: '#3B82F6' };
  }
  
  const change = previousRank - currentRank;
  
  if (change > 0) {
    return { change, direction: 'up', color: '#10B981' };
  } else if (change < 0) {
    return { change: Math.abs(change), direction: 'down', color: '#EF4444' };
  } else {
    return { change: 0, direction: 'same', color: '#6B7280' };
  }
}

export function getTimeframeLabel(timeframe: string): string {
  switch (timeframe) {
    case 'daily': return 'Today';
    case 'weekly': return 'This Week';
    case 'monthly': return 'This Month';
    case 'all_time': return 'All Time';
    default: return timeframe;
  }
}

export function getNextResetTime(resetSchedule?: string): Date | null {
  if (!resetSchedule) return null;
  
  const now = new Date();
  const nextReset = new Date();
  
  switch (resetSchedule) {
    case 'daily':
      nextReset.setDate(now.getDate() + 1);
      nextReset.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      const daysUntilMonday = (7 - now.getDay() + 1) % 7 || 7;
      nextReset.setDate(now.getDate() + daysUntilMonday);
      nextReset.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      nextReset.setMonth(now.getMonth() + 1, 1);
      nextReset.setHours(0, 0, 0, 0);
      break;
    default:
      return null;
  }
  
  return nextReset;
}
