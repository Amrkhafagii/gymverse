import { useState, useEffect, useMemo } from 'react';
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';
import { processWorkoutDataForChart, ChartDataPoint, TrendData, AnalyticsInsight } from '@/lib/analytics/chartDataProcessing';

export type AnalyticsTimeframe = 'week' | 'month' | 'year';
export type AnalyticsMetric = 'weight' | 'reps' | 'volume';

interface AnalyticsData {
  volumeData: ChartDataPoint[];
  frequencyData: ChartDataPoint[];
  durationData: ChartDataPoint[];
  insights: AnalyticsInsight[];
}

interface SummaryStats {
  totalWorkouts: number;
  averageWorkoutsPerWeek: number;
  uniqueExercises: number;
  averageWorkoutDuration: number;
  totalVolume: number;
  averageVolume: number;
}

export function useAnalytics(timeframe: AnalyticsTimeframe = 'month') {
  const { workouts } = useWorkoutHistory();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<AnalyticsMetric>('weight');
  const [isLoading, setIsLoading] = useState(false);

  // Filter workouts based on timeframe
  const filteredWorkouts = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (timeframe) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return workouts.filter(workout => 
      new Date(workout.created_at) >= cutoffDate
    );
  }, [workouts, timeframe]);

  // Process analytics data
  const analyticsData = useMemo((): AnalyticsData => {
    const volumeAnalysis = processWorkoutDataForChart(filteredWorkouts, 'volume', timeframe);
    const frequencyAnalysis = processWorkoutDataForChart(filteredWorkouts, 'frequency', timeframe);
    const durationAnalysis = processWorkoutDataForChart(filteredWorkouts, 'duration', timeframe);

    // Combine insights from all analyses
    const allInsights = [
      ...volumeAnalysis.insights,
      ...frequencyAnalysis.insights,
      ...durationAnalysis.insights,
    ];

    // Remove duplicates and sort by priority
    const uniqueInsights = allInsights.filter((insight, index, self) => 
      index === self.findIndex(i => i.title === insight.title)
    ).sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority || 'low'] - priorityOrder[a.priority || 'low']);
    });

    return {
      volumeData: volumeAnalysis.points,
      frequencyData: frequencyAnalysis.points,
      durationData: durationAnalysis.points,
      insights: uniqueInsights.slice(0, 8), // Limit to 8 most important insights
    };
  }, [filteredWorkouts, timeframe]);

  // Calculate summary statistics
  const summaryStats = useMemo((): SummaryStats => {
    if (filteredWorkouts.length === 0) {
      return {
        totalWorkouts: 0,
        averageWorkoutsPerWeek: 0,
        uniqueExercises: 0,
        averageWorkoutDuration: 0,
        totalVolume: 0,
        averageVolume: 0,
      };
    }

    const uniqueExercises = new Set();
    let totalVolume = 0;
    let totalDuration = 0;

    filteredWorkouts.forEach(workout => {
      totalDuration += workout.duration_minutes || 0;
      
      workout.exercises?.forEach((exercise: any) => {
        uniqueExercises.add(exercise.exercise_name);
        
        exercise.sets?.forEach((set: any) => {
          if (set.actual_weight_kg && set.actual_reps) {
            totalVolume += set.actual_weight_kg * set.actual_reps;
          }
        });
      });
    });

    // Calculate average workouts per week
    const timeframeDays = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365;
    const averageWorkoutsPerWeek = (filteredWorkouts.length / timeframeDays) * 7;

    return {
      totalWorkouts: filteredWorkouts.length,
      averageWorkoutsPerWeek: Math.round(averageWorkoutsPerWeek * 10) / 10,
      uniqueExercises: uniqueExercises.size,
      averageWorkoutDuration: totalDuration / filteredWorkouts.length,
      totalVolume,
      averageVolume: totalVolume / filteredWorkouts.length,
    };
  }, [filteredWorkouts, timeframe]);

  // Calculate trends
  const volumeTrend = useMemo((): TrendData => {
    const volumeAnalysis = processWorkoutDataForChart(filteredWorkouts, 'volume', timeframe);
    return volumeAnalysis.trend;
  }, [filteredWorkouts, timeframe]);

  const frequencyTrend = useMemo((): TrendData => {
    const frequencyAnalysis = processWorkoutDataForChart(filteredWorkouts, 'frequency', timeframe);
    return frequencyAnalysis.trend;
  }, [filteredWorkouts, timeframe]);

  // Get available exercises for selection
  const availableExercises = useMemo(() => {
    const exercises = new Set<string>();
    
    filteredWorkouts.forEach(workout => {
      workout.exercises?.forEach((exercise: any) => {
        exercises.add(exercise.exercise_name);
      });
    });

    return Array.from(exercises).sort();
  }, [filteredWorkouts]);

  // Process exercise-specific data
  const exerciseData = useMemo((): ChartDataPoint[] => {
    if (!selectedExercise) return [];

    const exerciseWorkouts = filteredWorkouts.filter(workout =>
      workout.exercises?.some((ex: any) => ex.exercise_name === selectedExercise)
    );

    return exerciseWorkouts.map(workout => {
      const exercise = workout.exercises?.find((ex: any) => ex.exercise_name === selectedExercise);
      if (!exercise) return null;

      let value = 0;
      let label = '';

      switch (selectedMetric) {
        case 'weight':
          const maxWeight = Math.max(...(exercise.sets?.map((set: any) => set.actual_weight_kg || 0) || [0]));
          value = maxWeight;
          label = `${maxWeight}kg`;
          break;
        case 'reps':
          const maxReps = Math.max(...(exercise.sets?.map((set: any) => set.actual_reps || 0) || [0]));
          value = maxReps;
          label = `${maxReps} reps`;
          break;
        case 'volume':
          const totalVolume = exercise.sets?.reduce((sum: number, set: any) => 
            sum + ((set.actual_weight_kg || 0) * (set.actual_reps || 0)), 0) || 0;
          value = totalVolume;
          label = `${totalVolume}kg`;
          break;
      }

      return {
        date: workout.created_at,
        value,
        label,
        metadata: { workoutId: workout.id, exerciseId: exercise.id },
      };
    }).filter(Boolean) as ChartDataPoint[];
  }, [filteredWorkouts, selectedExercise, selectedMetric]);

  // Calculate exercise trend
  const exerciseTrend = useMemo((): TrendData => {
    if (exerciseData.length < 2) {
      return { trend: 'stable', current: 0, previous: 0, changePercent: 0 };
    }

    const recentPoints = exerciseData.slice(-3);
    const previousPoints = exerciseData.slice(-6, -3);

    if (previousPoints.length === 0) {
      return { trend: 'stable', current: 0, previous: 0, changePercent: 0 };
    }

    const current = recentPoints.reduce((sum, p) => sum + p.value, 0) / recentPoints.length;
    const previous = previousPoints.reduce((sum, p) => sum + p.value, 0) / previousPoints.length;

    const changePercent = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (changePercent > 5) trend = 'up';
    else if (changePercent < -5) trend = 'down';

    return { trend, current, previous, changePercent };
  }, [exerciseData]);

  const hasData = filteredWorkouts.length > 0;

  return {
    analyticsData,
    exerciseData,
    summaryStats,
    volumeTrend,
    frequencyTrend,
    exerciseTrend,
    selectedExercise,
    setSelectedExercise,
    selectedMetric,
    setSelectedMetric,
    availableExercises,
    isLoading,
    hasData,
  };
}
