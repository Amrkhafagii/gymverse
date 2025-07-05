import { useState, useCallback } from 'react';
import { aiWorkoutService, WorkoutHistory, RestDayRecommendation } from '@/lib/services/aiService';
import { useData } from '@/contexts/DataContext';

export function useRestDayRecommendations() {
  const [recommendation, setRecommendation] = useState<RestDayRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useData();

  const generateRecommendation = useCallback(async (workoutHistory: WorkoutHistory[]) => {
    try {
      setLoading(true);
      setError(null);

      const userProfile = profile ? {
        fitness_level: profile.fitness_level,
        recovery_preference: 'active' as const // Could be stored in profile
      } : undefined;

      const newRecommendation = aiWorkoutService.generateRestDayRecommendation(
        workoutHistory,
        userProfile
      );

      setRecommendation(newRecommendation);
      return newRecommendation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate rest day recommendation');
      console.error('Error generating rest day recommendation:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const clearRecommendation = useCallback(() => {
    setRecommendation(null);
    setError(null);
  }, []);

  return {
    recommendation,
    loading,
    error,
    generateRecommendation,
    clearRecommendation
  };
}
