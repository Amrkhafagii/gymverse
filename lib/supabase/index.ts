import { Database } from '@/types/supabase';

export { supabase } from './client';
export { handleSupabaseError, logSupabaseError } from './errors';
export { signIn, signUp, signOut } from './auth';
export { getProfile, updateProfile, type Profile } from './profile';
export {
  getExercises,
  getWorkoutTemplates,
  getUserWorkouts,
  createWorkout,
  createWorkoutExercise,
  createWorkoutSession,
  completeWorkoutSession,
  type Exercise,
  type Workout,
  type WorkoutInsert,
  type WorkoutExercise,
  type WorkoutExerciseInsert,
  type WorkoutSession,
  type WorkoutSessionInsert,
} from './workouts';
export { createSocialPost, type SocialPost, type SocialPostInsert } from './social';
export {
  getUserPersonalRecords,
  getWorkoutAnalytics,
  getExerciseProgress,
  getUserStreak,
  type PersonalRecord,
  type WorkoutStreak,
  type ExerciseSet,
} from './analytics';
export {
  createCoachingPath,
  getCoachNotesForSession,
  getCoachingPaths,
  getCoachingSessions,
  getLatestCoachingEvent,
  getCoachingAdherence,
  recalculateCoachingPath,
  updateCoachingPathStatus,
  logCoachingEvent,
  type CoachNotes,
  type CoachingBlock,
  type CoachingEvent,
  type CoachingPath,
  type CoachingPathStatus,
  type CoachingSession,
  type CreateCoachingPathInput,
} from './coaching';
export {
  getProducts,
  createPendingPayment,
  getUserPayments,
  approvePayment,
  type Product,
  type PaymentInsert,
  type Payment,
  uploadReceipt,
  getReceiptSignedUrl,
  getCoachPayments,
  getAdminPayments,
  rejectPayment,
  getUserEntitlements,
  type Entitlement,
  getPendingPaymentForFeatureKey,
} from './payments';

export type Achievement = Database['public']['Tables']['achievements']['Row'];
