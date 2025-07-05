export interface ChallengeType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  category: 'workout' | 'strength' | 'cardio' | 'social' | 'consistency';
}

export interface Challenge {
  id: string;
  type: string;
  title: string;
  description: string;
  requirements: {
    metric: string;
    target: number;
    timeframe: 'daily' | 'weekly' | 'monthly';
  };
  rewards: {
    points: number;
    bonus_multiplier?: number;
    special_reward?: string;
  };
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  duration_days: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  is_completed: boolean;
  completed_at?: string;
  rewards_claimed: boolean;
  created_at: string;
  updated_at: string;
}

export const CHALLENGE_TYPES: ChallengeType[] = [
  {
    id: 'daily_workout',
    name: 'Daily Grind',
    description: 'Complete daily workout challenges',
    icon: '💪',
    color: '#FF6B35',
    difficulty: 'easy',
    category: 'workout'
  },
  {
    id: 'strength_focus',
    name: 'Strength Builder',
    description: 'Focus on building strength',
    icon: '🏋️',
    color: '#E74C3C',
    difficulty: 'medium',
    category: 'strength'
  },
  {
    id: 'cardio_blast',
    name: 'Cardio Crusher',
    description: 'High-intensity cardio challenges',
    icon: '🏃',
    color: '#4A90E2',
    difficulty: 'hard',
    category: 'cardio'
  },
  {
    id: 'social_warrior',
    name: 'Community Champion',
    description: 'Engage with the fitness community',
    icon: '👥',
    color: '#9B59B6',
    difficulty: 'easy',
    category: 'social'
  },
  {
    id: 'consistency_master',
    name: 'Habit Former',
    description: 'Build lasting fitness habits',
    icon: '🔥',
    color: '#27AE60',
    difficulty: 'medium',
    category: 'consistency'
  }
];

export const DAILY_CHALLENGES: Omit<Challenge, 'id' | 'start_date' | 'end_date' | 'is_active'>[] = [
  {
    type: 'daily_workout',
    title: 'Morning Warrior',
    description: 'Complete a workout before 9 AM',
    requirements: {
      metric: 'morning_workouts',
      target: 1,
      timeframe: 'daily'
    },
    rewards: {
      points: 100,
      bonus_multiplier: 1.2
    },
    difficulty: 'easy',
    duration_days: 1
  },
  {
    type: 'strength_focus',
    title: 'Iron Will',
    description: 'Complete 3 strength exercises with 8+ reps each',
    requirements: {
      metric: 'strength_exercises_completed',
      target: 3,
      timeframe: 'daily'
    },
    rewards: {
      points: 150
    },
    difficulty: 'medium',
    duration_days: 1
  },
  {
    type: 'cardio_blast',
    title: 'Heart Pumper',
    description: 'Complete 30 minutes of cardio',
    requirements: {
      metric: 'cardio_minutes',
      target: 30,
      timeframe: 'daily'
    },
    rewards: {
      points: 120
    },
    difficulty: 'medium',
    duration_days: 1
  },
  {
    type: 'social_warrior',
    title: 'Motivator',
    description: 'Like and comment on 5 posts',
    requirements: {
      metric: 'social_interactions',
      target: 5,
      timeframe: 'daily'
    },
    rewards: {
      points: 75
    },
    difficulty: 'easy',
    duration_days: 1
  },
  {
    type: 'consistency_master',
    title: 'Progress Logger',
    description: 'Log your workout progress and measurements',
    requirements: {
      metric: 'progress_logs',
      target: 1,
      timeframe: 'daily'
    },
    rewards: {
      points: 80
    },
    difficulty: 'easy',
    duration_days: 1
  }
];

export const WEEKLY_CHALLENGES: Omit<Challenge, 'id' | 'start_date' | 'end_date' | 'is_active'>[] = [
  {
    type: 'daily_workout',
    title: 'Seven Day Warrior',
    description: 'Complete a workout every day this week',
    requirements: {
      metric: 'daily_workouts',
      target: 7,
      timeframe: 'weekly'
    },
    rewards: {
      points: 500,
      bonus_multiplier: 1.5,
      special_reward: 'week_warrior_badge'
    },
    difficulty: 'hard',
    duration_days: 7
  },
  {
    type: 'strength_focus',
    title: 'Strength Surge',
    description: 'Increase your max weight in any exercise by 5%',
    requirements: {
      metric: 'strength_improvement',
      target: 5,
      timeframe: 'weekly'
    },
    rewards: {
      points: 400,
      special_reward: 'strength_surge_badge'
    },
    difficulty: 'hard',
    duration_days: 7
  },
  {
    type: 'cardio_blast',
    title: 'Endurance Explorer',
    description: 'Complete 3 hours of cardio this week',
    requirements: {
      metric: 'weekly_cardio_minutes',
      target: 180,
      timeframe: 'weekly'
    },
    rewards: {
      points: 350
    },
    difficulty: 'medium',
    duration_days: 7
  },
  {
    type: 'social_warrior',
    title: 'Community Builder',
    description: 'Help 3 people by sharing workouts or advice',
    requirements: {
      metric: 'community_helps',
      target: 3,
      timeframe: 'weekly'
    },
    rewards: {
      points: 300,
      special_reward: 'community_builder_badge'
    },
    difficulty: 'medium',
    duration_days: 7
  },
  {
    type: 'consistency_master',
    title: 'Habit Master',
    description: 'Maintain all your streaks for the entire week',
    requirements: {
      metric: 'streak_maintenance',
      target: 7,
      timeframe: 'weekly'
    },
    rewards: {
      points: 600,
      bonus_multiplier: 2.0
    },
    difficulty: 'extreme',
    duration_days: 7
  }
];

export function getChallengeTypeInfo(typeId: string): ChallengeType | undefined {
  return CHALLENGE_TYPES.find(type => type.id === typeId);
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return '#10B981';
    case 'medium': return '#F59E0B';
    case 'hard': return '#EF4444';
    case 'extreme': return '#8B5CF6';
    default: return '#6B7280';
  }
}

export function getDifficultyMultiplier(difficulty: string): number {
  switch (difficulty) {
    case 'easy': return 1.0;
    case 'medium': return 1.3;
    case 'hard': return 1.6;
    case 'extreme': return 2.0;
    default: return 1.0;
  }
}

export function generateDailyChallenge(): Challenge {
  const template = DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return {
    ...template,
    id: `daily_${today.getTime()}_${template.type}`,
    start_date: today.toISOString(),
    end_date: tomorrow.toISOString(),
    is_active: true
  };
}

export function generateWeeklyChallenge(): Challenge {
  const template = WEEKLY_CHALLENGES[Math.floor(Math.random() * WEEKLY_CHALLENGES.length)];
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  return {
    ...template,
    id: `weekly_${today.getTime()}_${template.type}`,
    start_date: today.toISOString(),
    end_date: nextWeek.toISOString(),
    is_active: true
  };
}
