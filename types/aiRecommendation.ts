export interface RecommendedExercise {
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'recovery';
  muscleGroups: string[];
  sets: number;
  reps: number[];
  restSeconds: number;
  duration?: number; // for cardio/flexibility exercises
  notes?: string;
  confidence: number; // 0-100
}

export interface WorkoutRecommendation {
  id: string;
  title: string;
  description: string;
  confidence: number; // 0-100
  reasoning: string[];
  estimatedDuration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  workoutType: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  targetMuscleGroups: string[];
  exercises: RecommendedExercise[];
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  basedOn: RecommendationSource[];
}

export interface RecommendationSource {
  type: 'workout_history' | 'personal_records' | 'user_preferences' | 'recovery_pattern' | 'progress_trend' | 'variety_need';
  description: string;
  weight: number; // 0-1, how much this source influenced the recommendation
}

export interface UserProfile {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoals: ('strength' | 'muscle_gain' | 'weight_loss' | 'endurance' | 'general_fitness')[];
  availableTime: number; // minutes per workout
  workoutFrequency: number; // per week
  preferredWorkoutTypes: string[];
  equipmentAccess: string[];
  injuryHistory: string[];
  preferences: {
    intensityPreference: 'low' | 'moderate' | 'high';
    varietyPreference: 'routine' | 'mixed' | 'varied';
    challengeLevel: 'conservative' | 'moderate' | 'aggressive';
  };
}

export interface SmartInsight {
  id: string;
  type: 'achievement' | 'warning' | 'suggestion' | 'milestone' | 'pattern';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  action?: {
    label: string;
    type: 'workout' | 'exercise' | 'rest' | 'nutrition' | 'recovery';
    data?: any;
  };
  confidence: number;
  createdAt: string;
  expiresAt?: string;
  dismissed?: boolean;
}

export interface ProgressPrediction {
  exercise: string;
  currentBest: number;
  predictedImprovement: {
    timeframe: '1_week' | '1_month' | '3_months';
    predictedValue: number;
    confidence: number;
    factors: string[];
  }[];
  recommendations: string[];
}

export interface RecoveryRecommendation {
  type: 'rest_day' | 'active_recovery' | 'deload_week' | 'sleep_focus' | 'nutrition_focus';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning: string[];
  duration: number; // days
  activities?: string[];
  expectedBenefits: string[];
}

export interface WorkoutOptimization {
  currentWorkout: string;
  optimizations: {
    type: 'exercise_order' | 'rest_periods' | 'rep_ranges' | 'exercise_selection' | 'volume_adjustment';
    suggestion: string;
    reasoning: string;
    expectedImprovement: string;
    confidence: number;
  }[];
  alternativeWorkouts?: WorkoutRecommendation[];
}
