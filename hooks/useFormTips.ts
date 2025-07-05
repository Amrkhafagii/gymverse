import { useState, useCallback } from 'react';
import { aiWorkoutService, PersonalizedFormGuidance, WorkoutHistory } from '@/lib/services/aiService';
import { useData } from '@/contexts/DataContext';

export function useFormTips() {
  const [formGuidance, setFormGuidance] = useState<PersonalizedFormGuidance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useData();

  const generateFormGuidance = useCallback(async (
    exerciseId: string,
    workoutHistory?: WorkoutHistory[]
  ) => {
    try {
      setLoading(true);
      setError(null);

      const userLevel = profile?.fitness_level || 'beginner';
      
      const guidance = aiWorkoutService.generatePersonalizedFormGuidance(
        exerciseId,
        userLevel,
        workoutHistory
      );

      setFormGuidance(guidance);
      return guidance;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate form guidance');
      console.error('Error generating form guidance:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const clearFormGuidance = useCallback(() => {
    setFormGuidance(null);
    setError(null);
  }, []);

  return {
    formGuidance,
    loading,
    error,
    generateFormGuidance,
    clearFormGuidance
  };
}
