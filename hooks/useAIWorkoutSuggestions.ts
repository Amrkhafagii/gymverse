import { useState, useCallback } from 'react';
import { aiWorkoutService, WorkoutGoal, WorkoutHistory, AIWorkoutSuggestion } from '@/lib/services/aiService';
import { useData } from '@/contexts/DataContext';

export function useAIWorkoutSuggestions() {
  const [suggestions, setSuggestions] = useState<AIWorkoutSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useData();

  const generateSuggestions = useCallback(async (
    goal: WorkoutGoal,
    workoutHistory: WorkoutHistory[],
    count: number = 3
  ) => {
    try {
      setLoading(true);
      setError(null);

      const userProfile = profile ? {
        fitness_level: profile.fitness_level,
        preferred_duration: 45 // Default duration, could be stored in profile
      } : undefined;

      const newSuggestions = aiWorkoutService.generateMultipleWorkoutSuggestions(
        goal,
        workoutHistory,
        count,
        userProfile
      );

      setSuggestions(newSuggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate workout suggestions');
      console.error('Error generating workout suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const generateSingleSuggestion = useCallback(async (
    goal: WorkoutGoal,
    workoutHistory: WorkoutHistory[]
  ) => {
    try {
      setLoading(true);
      setError(null);

      const userProfile = profile ? {
        fitness_level: profile.fitness_level,
        preferred_duration: 45
      } : undefined;

      const suggestion = aiWorkoutService.generateWorkoutSuggestion(
        goal,
        workoutHistory,
        userProfile
      );

      setSuggestions([suggestion]);
      return suggestion;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate workout suggestion');
      console.error('Error generating workout suggestion:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    loading,
    error,
    generateSuggestions,
    generateSingleSuggestion,
    clearSuggestions
  };
}
