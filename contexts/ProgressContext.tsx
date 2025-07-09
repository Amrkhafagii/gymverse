import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWorkout } from './WorkoutContext';
import { useDeviceAuth } from './DeviceAuthContext';

export interface ProgressData {
  totalWorkouts: number;
  totalDuration: number; // minutes
  totalCaloriesBurned: number;
  currentStreak: number;
  longestStreak: number;
  averageWorkoutDuration: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  strengthWorkouts: number;
  cardioWorkouts: number;
  flexibilityWorkouts: number;
  favoriteExercises: string[];
  muscleGroupFrequency: Record<string, number>;
  weeklyProgress: {
    week: string;
    workouts: number;
    duration: number;
    calories: number;
  }[];
  monthlyProgress: {
    month: string;
    workouts: number;
    duration: number;
    calories: number;
  }[];
  personalBests: {
    exerciseId: string;
    exerciseName: string;
    bestWeight: number;
    bestReps: number;
    bestVolume: number;
    achievedAt: string;
  }[];
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  consistencyScore: number; // 0-100
  improvementRate: number; // percentage
}

interface ProgressContextType {
  progressData: ProgressData;
  isLoading: boolean;
  error: string | null;
  refreshProgress: () => Promise<void>;
  getWeeklyStats: () => {
    workouts: number;
    duration: number;
    calories: number;
    streak: number;
  };
  getMonthlyStats: () => {
    workouts: number;
    duration: number;
    calories: number;
    averageDuration: number;
  };
  getProgressTrend: (metric: 'workouts' | 'duration' | 'calories', period: 'week' | 'month') => number;
  getFitnessInsights: () => {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const STORAGE_KEY = '@gymverse_progress_data';

const initialProgressData: ProgressData = {
  totalWorkouts: 0,
  totalDuration: 0,
  totalCaloriesBurned: 0,
  currentStreak: 0,
  longestStreak: 0,
  averageWorkoutDuration: 0,
  workoutsThisWeek: 0,
  workoutsThisMonth: 0,
  strengthWorkouts: 0,
  cardioWorkouts: 0,
  flexibilityWorkouts: 0,
  favoriteExercises: [],
  muscleGroupFrequency: {},
  weeklyProgress: [],
  monthlyProgress: [],
  personalBests: [],
  fitnessLevel: 'beginner',
  consistencyScore: 0,
  improvementRate: 0,
};

interface ProgressProviderProps {
  children: ReactNode;
}

export function ProgressProvider({ children }: ProgressProviderProps) {
  const [progressData, setProgressData] = useState<ProgressData>(initialProgressData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { workouts } = useWorkout();
  const { user } = useDeviceAuth();

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user]);

  useEffect(() => {
    if (workouts.length > 0) {
      calculateProgress();
    }
  }, [workouts]);

  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setProgressData(data);
      }
    } catch (err) {
      console.error('Error loading progress data:', err);
      setError('Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgressData = async (data: ProgressData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Error saving progress data:', err);
    }
  };

  const calculateProgress = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Basic stats
      const totalWorkouts = workouts.length;
      const totalDuration = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
      const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
      const averageWorkoutDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;

      // Time-based stats
      const workoutsThisWeek = workouts.filter(w => 
        new Date(w.created_at) >= oneWeekAgo
      ).length;
      
      const workoutsThisMonth = workouts.filter(w => 
        new Date(w.created_at) >= oneMonthAgo
      ).length;

      // Workout type distribution
      const workoutTypes = workouts.reduce((acc, workout) => {
        const type = getWorkoutType(workout);
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Muscle group frequency
      const muscleGroupFrequency: Record<string, number> = {};
      workouts.forEach(workout => {
        workout.exercises?.forEach(exercise => {
          exercise.exercise.muscle_groups.forEach(muscle => {
            muscleGroupFrequency[muscle] = (muscleGroupFrequency[muscle] || 0) + 1;
          });
        });
      });

      // Calculate streaks
      const { currentStreak, longestStreak } = calculateStreaks(workouts);

      // Weekly and monthly progress
      const weeklyProgress = calculateWeeklyProgress(workouts);
      const monthlyProgress = calculateMonthlyProgress(workouts);

      // Personal bests
      const personalBests = calculatePersonalBests(workouts);

      // Fitness level assessment
      const fitnessLevel = assessFitnessLevel(totalWorkouts, workoutsThisMonth, personalBests);

      // Consistency score
      const consistencyScore = calculateConsistencyScore(workouts);

      // Improvement rate
      const improvementRate = calculateImprovementRate(weeklyProgress);

      // Favorite exercises
      const exerciseFrequency: Record<string, number> = {};
      workouts.forEach(workout => {
        workout.exercises?.forEach(exercise => {
          const name = exercise.exercise.name;
          exerciseFrequency[name] = (exerciseFrequency[name] || 0) + 1;
        });
      });
      
      const favoriteExercises = Object.entries(exerciseFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name]) => name);

      const newProgressData: ProgressData = {
        totalWorkouts,
        totalDuration,
        totalCaloriesBurned,
        currentStreak,
        longestStreak,
        averageWorkoutDuration,
        workoutsThisWeek,
        workoutsThisMonth,
        strengthWorkouts: workoutTypes.strength || 0,
        cardioWorkouts: workoutTypes.cardio || 0,
        flexibilityWorkouts: workoutTypes.flexibility || 0,
        favoriteExercises,
        muscleGroupFrequency,
        weeklyProgress,
        monthlyProgress,
        personalBests,
        fitnessLevel,
        consistencyScore,
        improvementRate,
      };

      setProgressData(newProgressData);
      await saveProgressData(newProgressData);
    } catch (err) {
      console.error('Error calculating progress:', err);
      setError('Failed to calculate progress');
    } finally {
      setIsLoading(false);
    }
  };

  const getWorkoutType = (workout: any): string => {
    if (!workout.exercises || workout.exercises.length === 0) return 'other';
    
    const cardioTypes = ['cardio', 'running', 'cycling', 'swimming'];
    const strengthTypes = ['strength', 'weightlifting', 'powerlifting'];
    const flexibilityTypes = ['flexibility', 'yoga', 'stretching'];

    const exerciseTypes = workout.exercises.map((e: any) => e.exercise.type);
    
    if (exerciseTypes.some((type: string) => cardioTypes.includes(type))) return 'cardio';
    if (exerciseTypes.some((type: string) => strengthTypes.includes(type))) return 'strength';
    if (exerciseTypes.some((type: string) => flexibilityTypes.includes(type))) return 'flexibility';
    
    return 'strength'; // default
  };

  const calculateStreaks = (workouts: any[]) => {
    if (workouts.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const sortedWorkouts = workouts
      .map(w => new Date(w.created_at))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate current streak
    let checkDate = new Date(today);
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const hasWorkout = sortedWorkouts.some(workoutDate => {
        const workoutDay = new Date(workoutDate);
        workoutDay.setHours(0, 0, 0, 0);
        return workoutDay.getTime() === checkDate.getTime();
      });

      if (hasWorkout) {
        currentStreak++;
      } else if (currentStreak > 0) {
        break;
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate longest streak
    const workoutDays = Array.from(new Set(
      sortedWorkouts.map(date => {
        const day = new Date(date);
        day.setHours(0, 0, 0, 0);
        return day.getTime();
      })
    )).sort((a, b) => a - b);

    for (let i = 0; i < workoutDays.length; i++) {
      if (i === 0 || workoutDays[i] - workoutDays[i - 1] === 24 * 60 * 60 * 1000) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    return { currentStreak, longestStreak };
  };

  const calculateWeeklyProgress = (workouts: any[]) => {
    const weeks: Record<string, { workouts: number; duration: number; calories: number }> = {};
    
    workouts.forEach(workout => {
      const date = new Date(workout.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks[weekKey]) {
        weeks[weekKey] = { workouts: 0, duration: 0, calories: 0 };
      }

      weeks[weekKey].workouts++;
      weeks[weekKey].duration += workout.duration_minutes || 0;
      weeks[weekKey].calories += workout.calories_burned || 0;
    });

    return Object.entries(weeks)
      .map(([week, data]) => ({ week, ...data }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-12); // Last 12 weeks
  };

  const calculateMonthlyProgress = (workouts: any[]) => {
    const months: Record<string, { workouts: number; duration: number; calories: number }> = {};
    
    workouts.forEach(workout => {
      const date = new Date(workout.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!months[monthKey]) {
        months[monthKey] = { workouts: 0, duration: 0, calories: 0 };
      }

      months[monthKey].workouts++;
      months[monthKey].duration += workout.duration_minutes || 0;
      months[monthKey].calories += workout.calories_burned || 0;
    });

    return Object.entries(months)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  };

  const calculatePersonalBests = (workouts: any[]) => {
    const exerciseBests: Record<string, any> = {};

    workouts.forEach(workout => {
      workout.exercises?.forEach((exercise: any) => {
        const exerciseId = exercise.exercise.id;
        const exerciseName = exercise.exercise.name;

        exercise.sets?.forEach((set: any) => {
          if (!set.completed) return;

          const weight = set.actual_weight_kg || 0;
          const reps = set.actual_reps || 0;
          const volume = weight * reps;

          if (!exerciseBests[exerciseId]) {
            exerciseBests[exerciseId] = {
              exerciseId,
              exerciseName,
              bestWeight: weight,
              bestReps: reps,
              bestVolume: volume,
              achievedAt: workout.created_at,
            };
          } else {
            const current = exerciseBests[exerciseId];
            if (weight > current.bestWeight) {
              current.bestWeight = weight;
              current.achievedAt = workout.created_at;
            }
            if (reps > current.bestReps) {
              current.bestReps = reps;
            }
            if (volume > current.bestVolume) {
              current.bestVolume = volume;
            }
          }
        });
      });
    });

    return Object.values(exerciseBests);
  };

  const assessFitnessLevel = (totalWorkouts: number, monthlyWorkouts: number, personalBests: any[]): 'beginner' | 'intermediate' | 'advanced' => {
    if (totalWorkouts < 10 || monthlyWorkouts < 4) return 'beginner';
    if (totalWorkouts < 50 || monthlyWorkouts < 12 || personalBests.length < 5) return 'intermediate';
    return 'advanced';
  };

  const calculateConsistencyScore = (workouts: any[]): number => {
    if (workouts.length === 0) return 0;

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentWorkouts = workouts.filter(w => new Date(w.created_at) >= last30Days);
    const workoutDays = new Set(
      recentWorkouts.map(w => new Date(w.created_at).toDateString())
    );

    return Math.min(100, (workoutDays.size / 30) * 100);
  };

  const calculateImprovementRate = (weeklyProgress: any[]): number => {
    if (weeklyProgress.length < 2) return 0;

    const recent = weeklyProgress.slice(-4); // Last 4 weeks
    const older = weeklyProgress.slice(-8, -4); // Previous 4 weeks

    if (older.length === 0) return 0;

    const recentAvg = recent.reduce((sum, week) => sum + week.workouts, 0) / recent.length;
    const olderAvg = older.reduce((sum, week) => sum + week.workouts, 0) / older.length;

    if (olderAvg === 0) return 0;

    return ((recentAvg - olderAvg) / olderAvg) * 100;
  };

  const refreshProgress = async () => {
    await calculateProgress();
  };

  const getWeeklyStats = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyWorkouts = workouts.filter(w => new Date(w.created_at) >= oneWeekAgo);
    
    return {
      workouts: weeklyWorkouts.length,
      duration: weeklyWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0),
      calories: weeklyWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0),
      streak: progressData.currentStreak,
    };
  };

  const getMonthlyStats = () => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const monthlyWorkouts = workouts.filter(w => new Date(w.created_at) >= oneMonthAgo);
    
    return {
      workouts: monthlyWorkouts.length,
      duration: monthlyWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0),
      calories: monthlyWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0),
      averageDuration: monthlyWorkouts.length > 0 
        ? monthlyWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / monthlyWorkouts.length 
        : 0,
    };
  };

  const getProgressTrend = (metric: 'workouts' | 'duration' | 'calories', period: 'week' | 'month'): number => {
    const data = period === 'week' ? progressData.weeklyProgress : progressData.monthlyProgress;
    
    if (data.length < 2) return 0;

    const recent = data[data.length - 1][metric];
    const previous = data[data.length - 2][metric];

    if (previous === 0) return 0;

    return ((recent - previous) / previous) * 100;
  };

  const getFitnessInsights = () => {
    const insights = {
      strengths: [] as string[],
      improvements: [] as string[],
      recommendations: [] as string[],
    };

    // Analyze strengths
    if (progressData.consistencyScore > 70) {
      insights.strengths.push('Excellent workout consistency');
    }
    if (progressData.currentStreak > 7) {
      insights.strengths.push('Strong workout streak');
    }
    if (progressData.improvementRate > 10) {
      insights.strengths.push('Improving workout frequency');
    }

    // Analyze areas for improvement
    if (progressData.consistencyScore < 50) {
      insights.improvements.push('Workout consistency');
    }
    if (progressData.averageWorkoutDuration < 30) {
      insights.improvements.push('Workout duration');
    }
    if (progressData.workoutsThisWeek < 3) {
      insights.improvements.push('Weekly workout frequency');
    }

    // Generate recommendations
    if (progressData.strengthWorkouts > progressData.cardioWorkouts * 3) {
      insights.recommendations.push('Add more cardio workouts for balance');
    }
    if (progressData.cardioWorkouts > progressData.strengthWorkouts * 3) {
      insights.recommendations.push('Include strength training for muscle building');
    }
    if (progressData.currentStreak === 0) {
      insights.recommendations.push('Start a new workout streak today');
    }

    return insights;
  };

  const contextValue: ProgressContextType = {
    progressData,
    isLoading,
    error,
    refreshProgress,
    getWeeklyStats,
    getMonthlyStats,
    getProgressTrend,
    getFitnessInsights,
  };

  return (
    <ProgressContext.Provider value={contextValue}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
