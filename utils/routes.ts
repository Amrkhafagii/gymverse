import { LinkProps } from 'expo-router';

export const routes = {
  home: '/(tabs)',
  workouts: '/(tabs)/workouts',
  workoutDetail: (workoutId: number | string) => ({
    pathname: '/(tabs)/workout-detail',
    params: { workoutId: workoutId.toString() },
  }),
  workoutSession: (workoutId: number | string, workoutName?: string) => ({
    pathname: '/(tabs)/workout-session',
    params: { workoutId: workoutId.toString(), workoutName },
  }),
  createWorkout: '/(tabs)/create-workout',
  progress: '/(tabs)/progress',
  social: '/(tabs)/social',
  profile: '/(tabs)/profile',
  editProfile: '/(tabs)/edit-profile',
} satisfies Record<string, string | LinkProps>;
