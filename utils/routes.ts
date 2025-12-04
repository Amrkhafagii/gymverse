export const routes = {
  home: '/(tabs)',
  workouts: '/(tabs)/workouts',
  workoutDetail: (workoutId: number | string) => ({
    pathname: '/(tabs)/workout-detail',
    params: { workoutId: workoutId.toString() },
  }),
  workoutSession: (workoutId: number | string, workoutName?: string, coachingSessionId?: string) => ({
    pathname: '/(tabs)/workout-session',
    params: { workoutId: workoutId.toString(), workoutName, coachingSessionId },
  }),
  coachingPaths: '/(tabs)/coaching-paths',
  createCoachingPath: '/coaching/create-path',
  createWorkout: '/(tabs)/create-workout',
  progress: '/(tabs)/progress',
  social: '/(tabs)/social',
  profile: '/(tabs)/profile',
  editProfile: '/(tabs)/edit-profile',
  adminPayments: '/payments/admin',
  coachPayments: '/payments/coach',
  coachProducts: '/coach/products',
  marketplace: '/(tabs)/marketplace',
};
