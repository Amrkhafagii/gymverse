import { useState, useEffect } from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useProgress } from '@/contexts/ProgressContext';

interface RestRecommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  duration?: string;
}

interface FatigueIndicator {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface RecoveryActivity {
  id: string;
  name: string;
  type: 'sleep' | 'hydration' | 'nutrition' | 'meditation' | 'stretching' | 'massage';
  description: string;
  duration: string;
  benefit: string;
}

export function useRestDayRecommendations() {
  const { workoutHistory } = useWorkout();
  const { progressData } = useProgress();

  const [recommendations, setRecommendations] = useState<RestRecommendation[]>([]);
  const [fatigueLevel, setFatigueLevel] = useState(0.3); // 0-1 scale
  const [recoveryScore, setRecoveryScore] = useState(0.8); // 0-1 scale
  const [restDayNeeded, setRestDayNeeded] = useState(false);
  const [nextRestDay, setNextRestDay] = useState<string | null>(null);
  const [recoveryActivities, setRecoveryActivities] = useState<RecoveryActivity[]>([]);
  const [fatigueIndicators, setFatigueIndicators] = useState<FatigueIndicator[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    analyzeRecoveryNeeds();
  }, [workoutHistory]);

  const analyzeRecoveryNeeds = async () => {
    setIsAnalyzing(true);

    try {
      // Analyze recent workout intensity and frequency
      const recentWorkouts = workoutHistory.slice(-7); // Last 7 days
      const workoutFrequency = recentWorkouts.length;
      const avgIntensity = recentWorkouts.reduce((sum, w) => sum + (w.intensity || 5), 0) / recentWorkouts.length || 5;
      const consecutiveDays = calculateConsecutiveWorkoutDays();

      // Calculate fatigue level based on multiple factors
      let calculatedFatigue = 0;
      
      // Workout frequency factor (0-0.4)
      calculatedFatigue += Math.min(workoutFrequency / 7, 1) * 0.4;
      
      // Intensity factor (0-0.3)
      calculatedFatigue += (avgIntensity / 10) * 0.3;
      
      // Consecutive days factor (0-0.3)
      calculatedFatigue += Math.min(consecutiveDays / 5, 1) * 0.3;

      setFatigueLevel(Math.min(calculatedFatigue, 1));

      // Calculate recovery score (inverse of fatigue with some randomness for realism)
      const baseRecovery = 1 - calculatedFatigue;
      const recoveryVariation = (Math.random() - 0.5) * 0.2; // ±10% variation
      setRecoveryScore(Math.max(0.1, Math.min(0.95, baseRecovery + recoveryVariation)));

      // Determine if rest day is needed
      const needsRest = calculatedFatigue > 0.6 || consecutiveDays >= 4;
      setRestDayNeeded(needsRest);

      // Generate recommendations
      generateRecommendations(calculatedFatigue, consecutiveDays, workoutFrequency);

      // Generate fatigue indicators
      generateFatigueIndicators(calculatedFatigue, consecutiveDays, avgIntensity);

      // Set next rest day
      if (needsRest) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setNextRestDay(tomorrow.toISOString());
      } else {
        // Schedule rest day based on pattern
        const nextRest = new Date();
        nextRest.setDate(nextRest.getDate() + (7 - workoutFrequency));
        setNextRestDay(nextRest.toISOString());
      }

      // Generate recovery activities
      generateRecoveryActivities(calculatedFatigue);

    } catch (error) {
      console.error('Error analyzing recovery needs:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateConsecutiveWorkoutDays = () => {
    let consecutive = 0;
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasWorkout = workoutHistory.some(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate.toDateString() === checkDate.toDateString();
      });
      
      if (hasWorkout) {
        consecutive++;
      } else {
        break;
      }
    }
    
    return consecutive;
  };

  const generateRecommendations = (fatigue: number, consecutive: number, frequency: number) => {
    const recs: RestRecommendation[] = [];

    if (fatigue > 0.7) {
      recs.push({
        title: 'Take a Complete Rest Day',
        description: 'Your fatigue levels are high. Take a full day off from intense exercise to allow your body to recover.',
        priority: 'high',
        duration: '24 hours',
      });
    }

    if (consecutive >= 4) {
      recs.push({
        title: 'Break the Consecutive Training Streak',
        description: 'You\'ve been training for several days in a row. Consider taking a rest day to prevent overtraining.',
        priority: 'high',
        duration: '1-2 days',
      });
    }

    if (frequency >= 6) {
      recs.push({
        title: 'Reduce Training Frequency',
        description: 'You\'ve been very active this week. Consider lighter activities or complete rest.',
        priority: 'medium',
        duration: '2-3 days',
      });
    }

    if (fatigue > 0.4 && fatigue <= 0.7) {
      recs.push({
        title: 'Consider Active Recovery',
        description: 'Light activities like walking, stretching, or yoga can help with recovery while staying active.',
        priority: 'medium',
        duration: '30-60 minutes',
      });
    }

    if (fatigue <= 0.4) {
      recs.push({
        title: 'Maintain Current Training',
        description: 'Your recovery levels look good. You can continue with your regular training schedule.',
        priority: 'low',
      });
    }

    // Always include sleep and hydration recommendations
    recs.push({
      title: 'Prioritize Quality Sleep',
      description: 'Aim for 7-9 hours of quality sleep to support muscle recovery and overall health.',
      priority: fatigue > 0.6 ? 'high' : 'medium',
      duration: '7-9 hours',
    });

    recs.push({
      title: 'Stay Hydrated',
      description: 'Proper hydration is crucial for recovery. Aim for at least 8 glasses of water daily.',
      priority: 'medium',
      duration: 'Throughout the day',
    });

    setRecommendations(recs);
  };

  const generateFatigueIndicators = (fatigue: number, consecutive: number, intensity: number) => {
    const indicators: FatigueIndicator[] = [];

    if (consecutive >= 5) {
      indicators.push({
        type: 'Consecutive Training Days',
        description: `You've trained for ${consecutive} consecutive days without rest`,
        severity: 'high',
      });
    }

    if (intensity > 7) {
      indicators.push({
        type: 'High Training Intensity',
        description: 'Your recent workouts have been at high intensity levels',
        severity: consecutive >= 3 ? 'high' : 'medium',
      });
    }

    if (fatigue > 0.6) {
      indicators.push({
        type: 'Elevated Fatigue Score',
        description: 'Your calculated fatigue level suggests you may need more recovery time',
        severity: 'high',
      });
    }

    // Simulated indicators based on patterns
    if (workoutHistory.length > 0) {
      const recentWorkout = workoutHistory[workoutHistory.length - 1];
      if (recentWorkout.duration && recentWorkout.duration > 90) {
        indicators.push({
          type: 'Extended Workout Duration',
          description: 'Your recent workout was longer than usual, which may increase recovery needs',
          severity: 'medium',
        });
      }
    }

    setFatigueIndicators(indicators);
  };

  const generateRecoveryActivities = (fatigue: number) => {
    const activities: RecoveryActivity[] = [
      {
        id: 'sleep',
        name: 'Quality Sleep',
        type: 'sleep',
        description: 'Get 7-9 hours of uninterrupted sleep for optimal recovery',
        duration: '7-9 hours',
        benefit: 'Muscle repair & growth',
      },
      {
        id: 'hydration',
        name: 'Proper Hydration',
        type: 'hydration',
        description: 'Drink plenty of water throughout the day',
        duration: 'All day',
        benefit: 'Nutrient transport',
      },
      {
        id: 'stretching',
        name: 'Gentle Stretching',
        type: 'stretching',
        description: 'Light stretching to improve flexibility and reduce tension',
        duration: '15-20 minutes',
        benefit: 'Improved flexibility',
      },
      {
        id: 'meditation',
        name: 'Meditation',
        type: 'meditation',
        description: 'Mindfulness practice to reduce stress and promote relaxation',
        duration: '10-15 minutes',
        benefit: 'Stress reduction',
      },
      {
        id: 'nutrition',
        name: 'Recovery Nutrition',
        type: 'nutrition',
        description: 'Focus on protein-rich foods and anti-inflammatory nutrients',
        duration: 'With meals',
        benefit: 'Muscle recovery',
      },
    ];

    if (fatigue > 0.6) {
      activities.push({
        id: 'massage',
        name: 'Self-Massage',
        type: 'massage',
        description: 'Use foam roller or massage tools to release muscle tension',
        duration: '10-15 minutes',
        benefit: 'Muscle tension relief',
      });
    }

    setRecoveryActivities(activities);
  };

  const refreshAnalysis = async () => {
    await analyzeRecoveryNeeds();
  };

  return {
    recommendations,
    fatigueLevel,
    recoveryScore,
    restDayNeeded,
    nextRestDay,
    recoveryActivities,
    fatigueIndicators,
    isAnalyzing,
    refreshAnalysis,
  };
}
