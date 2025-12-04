export const queryKeys = {
  workouts: {
    root: ['workouts'] as const,
    templates: ['workouts', 'templates'] as const,
    user: (userId?: string | null) => ['workouts', 'user', userId ?? 'anon'] as const,
  },
  exercises: ['exercises'] as const,
  social: {
    feed: (userId?: string) => ['social-feed', userId ?? 'public'] as const,
  },
  analytics: {
    stats: (userId?: string | null) => ['analytics', 'stats', userId ?? 'anon'] as const,
    streak: (userId?: string | null) => ['analytics', 'streak', userId ?? 'anon'] as const,
    personalRecords: (userId?: string | null) => ['analytics', 'pr', userId ?? 'anon'] as const,
    exerciseProgress: (userId?: string | null, exerciseId?: number | null) =>
      ['analytics', 'exercise-progress', userId ?? 'anon', exerciseId ?? 'none'] as const,
  },
  auth: {
    session: ['auth', 'session'] as const,
    profile: (userId?: string | null) => ['profile', userId ?? 'anon'] as const,
  },
  coaching: {
    paths: (userId?: string | null) => ['coaching', 'paths', userId ?? 'anon'] as const,
    notes: (sessionId?: string | null) => ['coaching', 'notes', sessionId ?? 'none'] as const,
  },
};
