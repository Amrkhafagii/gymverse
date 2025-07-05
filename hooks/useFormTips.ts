import { useState, useCallback } from 'react';
import { getExerciseById } from '@/lib/data/exerciseDatabase';

interface FormTip {
  id: string;
  type: 'technique' | 'safety' | 'common_mistake' | 'progression';
  title: string;
  description: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  videoTimestamp?: number;
}

interface FormGuidance {
  exerciseId: string;
  exerciseName: string;
  tips: FormTip[];
  keyMuscles: string[];
  safetyNotes: string[];
  progressionTips: string[];
  commonMistakes: string[];
}

export function useFormTips() {
  const [formGuidance, setFormGuidance] = useState<FormGuidance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFormGuidance = useCallback(async (exerciseId: string): Promise<FormGuidance | null> => {
    setLoading(true);
    setError(null);

    try {
      const exercise = getExerciseById(exerciseId);
      if (!exercise) {
        throw new Error('Exercise not found');
      }

      // Simulate AI-generated form guidance based on exercise data
      const guidance: FormGuidance = {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        tips: generateTipsFromExercise(exercise),
        keyMuscles: exercise.muscle_groups,
        safetyNotes: generateSafetyNotes(exercise),
        progressionTips: generateProgressionTips(exercise),
        commonMistakes: exercise.common_mistakes || [],
      };

      setFormGuidance(guidance);
      return guidance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate form guidance';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateTipsFromExercise = (exercise: any): FormTip[] => {
    const tips: FormTip[] = [];

    // Generate technique tips based on exercise type
    if (exercise.exercise_type === 'strength') {
      tips.push({
        id: `${exercise.id}-technique-1`,
        type: 'technique',
        title: 'Proper Form Setup',
        description: `Start with proper positioning for ${exercise.name}. Ensure your body alignment is correct before beginning the movement.`,
        importance: 'high',
        videoTimestamp: 0,
      });

      tips.push({
        id: `${exercise.id}-technique-2`,
        type: 'technique',
        title: 'Controlled Movement',
        description: 'Focus on controlled, deliberate movements. Avoid using momentum to complete the exercise.',
        importance: 'high',
        videoTimestamp: 15,
      });

      if (exercise.is_compound) {
        tips.push({
          id: `${exercise.id}-technique-3`,
          type: 'technique',
          title: 'Multi-Joint Coordination',
          description: 'As a compound exercise, coordinate multiple muscle groups working together smoothly.',
          importance: 'medium',
          videoTimestamp: 30,
        });
      }
    }

    if (exercise.exercise_type === 'cardio') {
      tips.push({
        id: `${exercise.id}-technique-1`,
        type: 'technique',
        title: 'Breathing Pattern',
        description: 'Maintain steady, rhythmic breathing throughout the exercise to optimize oxygen delivery.',
        importance: 'high',
      });

      tips.push({
        id: `${exercise.id}-technique-2`,
        type: 'technique',
        title: 'Pace Management',
        description: 'Start at a sustainable pace and gradually increase intensity as your body warms up.',
        importance: 'medium',
      });
    }

    // Generate safety tips based on difficulty and equipment
    if (exercise.difficulty_level === 'advanced' || exercise.safety_rating < 4) {
      tips.push({
        id: `${exercise.id}-safety-1`,
        type: 'safety',
        title: 'Advanced Exercise Precautions',
        description: 'This is an advanced exercise. Ensure you have mastered the basic movement pattern before attempting.',
        importance: 'critical',
      });
    }

    if (exercise.equipment && exercise.equipment.length > 0) {
      tips.push({
        id: `${exercise.id}-safety-2`,
        type: 'safety',
        title: 'Equipment Safety Check',
        description: 'Always inspect your equipment before use and ensure proper setup for safety.',
        importance: 'high',
      });
    }

    // Generate common mistake tips
    if (exercise.common_mistakes && exercise.common_mistakes.length > 0) {
      exercise.common_mistakes.forEach((mistake: string, index: number) => {
        tips.push({
          id: `${exercise.id}-mistake-${index}`,
          type: 'common_mistake',
          title: `Avoid: ${mistake.split('.')[0]}`,
          description: mistake,
          importance: 'medium',
        });
      });
    }

    // Generate progression tips
    tips.push({
      id: `${exercise.id}-progression-1`,
      type: 'progression',
      title: 'Gradual Progression',
      description: 'Increase intensity gradually over time. Focus on form before adding weight or increasing duration.',
      importance: 'medium',
    });

    if (exercise.variations && exercise.variations.length > 0) {
      tips.push({
        id: `${exercise.id}-progression-2`,
        type: 'progression',
        title: 'Exercise Variations',
        description: `Try variations like ${exercise.variations.slice(0, 2).join(' or ')} to challenge yourself differently.`,
        importance: 'low',
      });
    }

    return tips;
  };

  const generateSafetyNotes = (exercise: any): string[] => {
    const notes: string[] = [];

    // General safety based on exercise type
    if (exercise.exercise_type === 'strength') {
      notes.push('Always warm up properly before performing strength exercises');
      notes.push('Use a spotter when lifting heavy weights');
      notes.push('Stop immediately if you feel sharp pain');
    }

    if (exercise.exercise_type === 'cardio') {
      notes.push('Monitor your heart rate and stay within your target zone');
      notes.push('Stay hydrated throughout the exercise');
      notes.push('Cool down gradually to prevent dizziness');
    }

    // Equipment-specific safety
    if (exercise.equipment?.includes('barbell')) {
      notes.push('Always use safety bars or pins when possible');
      notes.push('Check that weight plates are securely fastened');
    }

    if (exercise.equipment?.includes('dumbbells')) {
      notes.push('Ensure you have a clear path and adequate space');
      notes.push('Use proper lifting technique when picking up and putting down weights');
    }

    // Difficulty-specific safety
    if (exercise.difficulty_level === 'advanced') {
      notes.push('Consider working with a qualified trainer for advanced exercises');
      notes.push('Master the basic version before attempting advanced variations');
    }

    if (exercise.safety_rating < 3) {
      notes.push('This exercise has increased injury risk - proceed with extra caution');
      notes.push('Consider alternative exercises if you have any relevant injuries');
    }

    return notes;
  };

  const generateProgressionTips = (exercise: any): string[] => {
    const tips: string[] = [];

    if (exercise.exercise_type === 'strength') {
      tips.push('Start with bodyweight or light resistance to master the movement');
      tips.push('Increase weight by 2.5-5% when you can complete all sets with perfect form');
      tips.push('Focus on time under tension for muscle development');
    }

    if (exercise.exercise_type === 'cardio') {
      tips.push('Begin with shorter durations and gradually increase time');
      tips.push('Use the talk test - you should be able to speak in short sentences');
      tips.push('Incorporate interval training once you build a base fitness level');
    }

    if (exercise.is_compound) {
      tips.push('Master individual movement components before combining them');
      tips.push('Compound exercises allow for heavier loads as you progress');
    }

    if (exercise.difficulty_level === 'beginner') {
      tips.push('Focus on consistency - aim for 2-3 sessions per week');
      tips.push('Track your progress to stay motivated');
    }

    return tips;
  };

  return {
    formGuidance,
    loading,
    error,
    generateFormGuidance,
  };
}
