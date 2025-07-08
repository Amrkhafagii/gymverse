export interface WorkoutRecommendation {
  id: string;
  title: string;
  description: string;
  confidence: number; // 0-100
  reasoning: string[];
  estimatedDuration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  workoutType: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed';
  targetMuscleGroups: string[];
  exercises: RecommendedExercise[];
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  basedOn: RecommendationSource[];
}

export interface RecommendedExercise {
  name: string;
  category: string;
  muscleGroups: string[];
  sets: number;
  reps: number[];
  restSeconds: number;
  weight?: number;
  duration?: number;
  notes?: string;
  confidence: number;
}

export interface RecommendationSource {
  type: 'workout_history' | 'progress_trend' | 'recovery_pattern' | 'goal_alignment' | 'variety_need';
  description: string;
  weight: number; // influence on recommendation
}

export interface AIInsight {
  type: 'pattern' | 'improvement' | 'warning' | 'suggestion';
  title: string;
  description: string;
  data?: any;
  actionable: boolean;
  recommendation?: string;
}

export interface UserProfile {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoals: string[];
  availableTime: number; // minutes per session
  preferredWorkoutTypes: string[];
  equipment: string[];
  limitations: string[];
  lastWorkoutDate?: string;
  weeklyFrequency: number;
}

export interface WorkoutPattern {
  type: string;
  frequency: number;
  averageDuration: number;
  preferredDays: string[];
  muscleGroupRotation: string[];
  intensityTrend: 'increasing' | 'decreasing' | 'stable';
  recoveryTime: number;
}
