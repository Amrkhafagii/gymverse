import { useState, useEffect } from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useProgress } from '@/contexts/ProgressContext';
import { useAchievements } from '@/contexts/AchievementContext';

interface WorkoutSuggestion {
  id: string;
  name: string;
  type: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  estimatedCalories: number;
  targetMuscles: string[];
  exercises: {
    name: string;
    sets: number;
    reps: string;
    weight?: number;
    duration?: number;
  }[];
  reasoning: string[];
  confidence: number;
}

export function useAIWorkoutSuggestions() {
  const { workoutHistory, currentWorkout } = useWorkout();
  const { progressData } = useProgress();
  const { achievements } = useAchievements();

  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [confidence, setConfidence] = useState(0.8);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const analyzeWorkoutPatterns = () => {
    const recentWorkouts = workoutHistory.slice(-10);
    const muscleGroupFrequency = new Map<string, number>();
    const workoutTypeFrequency = new Map<string, number>();
    const difficultyProgression = [];

    recentWorkouts.forEach(workout => {
      // Analyze muscle groups
      workout.exercises?.forEach(exercise => {
        const muscle = exercise.primaryMuscle || 'unknown';
        muscleGroupFrequency.set(muscle, (muscleGroupFrequency.get(muscle) || 0) + 1);
      });

      // Analyze workout types
      const type = workout.type || 'strength';
      workoutTypeFrequency.set(type, (workoutTypeFrequency.get(type) || 0) + 1);

      // Track difficulty progression
      difficultyProgression.push(workout.difficulty || 'intermediate');
    });

    return {
      muscleGroupFrequency,
      workoutTypeFrequency,
      difficultyProgression,
      recentWorkouts,
    };
  };

  const calculateUserFitnessLevel = () => {
    const totalWorkouts = workoutHistory.length;
    const recentConsistency = workoutHistory.slice(-7).length; // Last 7 days
    const achievementCount = achievements.filter(a => a.isUnlocked).length;

    let level: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    
    if (totalWorkouts > 50 && recentConsistency >= 4 && achievementCount > 10) {
      level = 'advanced';
    } else if (totalWorkouts > 20 && recentConsistency >= 3 && achievementCount > 5) {
      level = 'intermediate';
    }

    return {
      level,
      totalWorkouts,
      recentConsistency,
      achievementCount,
    };
  };

  const generateWorkoutSuggestions = async () => {
    setIsGenerating(true);
    
    try {
      const patterns = analyzeWorkoutPatterns();
      const fitnessLevel = calculateUserFitnessLevel();
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const suggestions: WorkoutSuggestion[] = [];

      // Suggestion 1: Address muscle imbalances
      const underworkedMuscles = ['chest', 'back', 'legs', 'shoulders', 'arms']
        .filter(muscle => (patterns.muscleGroupFrequency.get(muscle) || 0) < 2)
        .slice(0, 2);

      if (underworkedMuscles.length > 0) {
        suggestions.push({
          id: 'balance-workout',
          name: `${underworkedMuscles.join(' & ')} Focus`,
          type: 'strength',
          difficulty: fitnessLevel.level,
          estimatedDuration: 45,
          estimatedCalories: 280,
          targetMuscles: underworkedMuscles,
          exercises: generateExercisesForMuscles(underworkedMuscles, fitnessLevel.level),
          reasoning: [
            `You haven't trained ${underworkedMuscles.join(' and ')} much recently`,
            'Balanced muscle development prevents injuries',
            'This workout addresses your current imbalances',
          ],
          confidence: 0.85,
        });
      }

      // Suggestion 2: Progressive overload
      const lastSimilarWorkout = patterns.recentWorkouts.find(w => w.type === 'strength');
      if (lastSimilarWorkout) {
        suggestions.push({
          id: 'progressive-workout',
          name: 'Progressive Strength Training',
          type: 'strength',
          difficulty: fitnessLevel.level,
          estimatedDuration: 50,
          estimatedCalories: 320,
          targetMuscles: ['chest', 'back', 'legs'],
          exercises: generateProgressiveExercises(lastSimilarWorkout, fitnessLevel.level),
          reasoning: [
            'Based on your recent strength gains',
            'Gradually increasing intensity for continued progress',
            'Targets your strongest muscle groups for maximum gains',
          ],
          confidence: 0.9,
        });
      }

      // Suggestion 3: Recovery/Active rest
      const workoutFrequency = patterns.recentWorkouts.length;
      if (workoutFrequency >= 4) {
        suggestions.push({
          id: 'recovery-workout',
          name: 'Active Recovery Session',
          type: 'recovery',
          difficulty: 'beginner',
          estimatedDuration: 30,
          estimatedCalories: 150,
          targetMuscles: ['full-body'],
          exercises: generateRecoveryExercises(),
          reasoning: [
            'You\'ve been training consistently',
            'Active recovery promotes muscle repair',
            'Prevents overtraining and burnout',
          ],
          confidence: 0.75,
        });
      }

      // Suggestion 4: Cardio variation
      const cardioFrequency = patterns.workoutTypeFrequency.get('cardio') || 0;
      if (cardioFrequency < 2) {
        suggestions.push({
          id: 'cardio-workout',
          name: 'HIIT Cardio Blast',
          type: 'cardio',
          difficulty: fitnessLevel.level,
          estimatedDuration: 25,
          estimatedCalories: 300,
          targetMuscles: ['cardiovascular'],
          exercises: generateCardioExercises(fitnessLevel.level),
          reasoning: [
            'Cardiovascular health is important for overall fitness',
            'HIIT burns calories efficiently',
            'Complements your strength training routine',
          ],
          confidence: 0.8,
        });
      }

      setSuggestions(suggestions.slice(0, 3)); // Limit to top 3 suggestions
      setConfidence(suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length);
      setLastUpdated(new Date().toISOString());
      
    } catch (error) {
      console.error('Error generating workout suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateExercisesForMuscles = (muscles: string[], difficulty: string) => {
    const exerciseDatabase = {
      chest: [
        { name: 'Push-ups', sets: 3, reps: '8-12' },
        { name: 'Bench Press', sets: 3, reps: '8-10', weight: 135 },
        { name: 'Chest Flyes', sets: 3, reps: '10-12', weight: 25 },
      ],
      back: [
        { name: 'Pull-ups', sets: 3, reps: '5-8' },
        { name: 'Bent-over Rows', sets: 3, reps: '8-10', weight: 95 },
        { name: 'Lat Pulldowns', sets: 3, reps: '10-12', weight: 80 },
      ],
      legs: [
        { name: 'Squats', sets: 3, reps: '10-12', weight: 155 },
        { name: 'Lunges', sets: 3, reps: '8-10 each leg' },
        { name: 'Leg Press', sets: 3, reps: '12-15', weight: 200 },
      ],
      shoulders: [
        { name: 'Shoulder Press', sets: 3, reps: '8-10', weight: 65 },
        { name: 'Lateral Raises', sets: 3, reps: '10-12', weight: 15 },
        { name: 'Front Raises', sets: 3, reps: '10-12', weight: 15 },
      ],
      arms: [
        { name: 'Bicep Curls', sets: 3, reps: '10-12', weight: 25 },
        { name: 'Tricep Dips', sets: 3, reps: '8-10' },
        { name: 'Hammer Curls', sets: 3, reps: '10-12', weight: 20 },
      ],
    };

    const exercises = [];
    muscles.forEach(muscle => {
      const muscleExercises = exerciseDatabase[muscle] || [];
      exercises.push(...muscleExercises.slice(0, 2));
    });

    return exercises;
  };

  const generateProgressiveExercises = (lastWorkout: any, difficulty: string) => {
    // Mock progressive exercises based on last workout
    return [
      { name: 'Bench Press', sets: 4, reps: '6-8', weight: 145 },
      { name: 'Squats', sets: 4, reps: '8-10', weight: 165 },
      { name: 'Deadlifts', sets: 3, reps: '5-6', weight: 185 },
      { name: 'Pull-ups', sets: 3, reps: '6-8' },
    ];
  };

  const generateRecoveryExercises = () => {
    return [
      { name: 'Light Walking', sets: 1, reps: '15 minutes', duration: 15 },
      { name: 'Dynamic Stretching', sets: 1, reps: '10 minutes', duration: 10 },
      { name: 'Foam Rolling', sets: 1, reps: '5 minutes', duration: 5 },
    ];
  };

  const generateCardioExercises = (difficulty: string) => {
    return [
      { name: 'Burpees', sets: 4, reps: '30 seconds on, 30 seconds rest' },
      { name: 'Mountain Climbers', sets: 4, reps: '30 seconds on, 30 seconds rest' },
      { name: 'Jump Squats', sets: 4, reps: '30 seconds on, 30 seconds rest' },
      { name: 'High Knees', sets: 4, reps: '30 seconds on, 30 seconds rest' },
    ];
  };

  const refreshSuggestions = async () => {
    await generateWorkoutSuggestions();
  };

  const getReasoningExplanation = (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    return suggestion?.reasoning.join('. ') || 'AI analysis based on your workout history and progress.';
  };

  return {
    suggestions,
    isGenerating,
    confidence,
    lastUpdated,
    generateSuggestions: generateWorkoutSuggestions,
    refreshSuggestions,
    getReasoningExplanation,
  };
}
