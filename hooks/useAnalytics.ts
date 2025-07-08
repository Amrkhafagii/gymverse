/**
 * useAnalytics - Previously unused, now integrated into progress analytics
 * Comprehensive analytics hook with data processing and trend analysis
 */

import { useState, useEffect, useMemo } from 'react';
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';
import { ChartDataPoint, TrendData, AnalyticsInsight } from '@/lib/analytics/chartDataProcessing';

export type AnalyticsTimeframe = 'week' | 'month' | 'year';
export type AnalyticsMetric = 'weight' | 'reps' | 'volume';

interface AnalyticsSummaryStats {
  totalWorkouts: number;
  averageWorkoutsPerWeek: number;
  uniqueExercises: number;
  averageWorkoutDuration: number;
  totalVolume: number;
  totalSets: number;
}

interface AnalyticsData {
  volumeData: ChartDataPoint[];
  frequencyData: ChartDataPoint[];
  insights: AnalyticsInsight[];
}

export function useAnalytics(timeframe: AnalyticsTimeframe) {
  const { workouts } = useWorkoutHistory();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<AnalyticsMetric>('weight');
  const [isLoading, setIsLoading] = useState(false);

  // Filter workouts by timeframe
  const filteredWorkouts = useMemo(() => {
    const now = new Date();
    const timeframeDays = {
      week: 7,
      month: 30,
      year: 365,
    }[timeframe];
    
    const cutoffDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);
    
    return workouts.filter(workout => 
      new Date(workout.created_at) >= cutoffDate
    );
  }, [workouts, timeframe]);

  // Calculate summary statistics
  const summaryStats: AnalyticsSummaryStats = useMemo(() => {
    if (filteredWorkouts.length === 0) {
      return {
        totalWorkouts: 0,
        averageWorkoutsPerWeek: 0,
        uniqueExercises: 0,
        averageWorkoutDuration: 0,
        totalVolume: 0,
        totalSets: 0,
      };
    }

    const uniqueExercises = new Set();
    let totalVolume = 0;
    let totalSets = 0;
    let totalDuration = 0;

    filteredWorkouts.forEach(workout => {
      if (workout.duration_minutes) {
        totalDuration += workout.duration_minutes;
      }

      workout.exercises?.forEach(exercise => {
        uniqueExercises.add(exercise.exercise_name);
        
        exercise.sets?.forEach(set => {
          totalSets++;
          if (set.actual_weight_kg && set.actual_reps) {
            totalVolume += set.actual_weight_kg * set.actual_reps;
          }
        });
      });
    });

    const timeframeDays = {
      week: 7,
      month: 30,
      year: 365,
    }[timeframe];

    const averageWorkoutsPerWeek = (filteredWorkouts.length / timeframeDays) * 7;

    return {
      totalWorkouts: filteredWorkouts.length,
      averageWorkoutsPerWeek: Math.round(averageWorkoutsPerWeek * 10) / 10,
      uniqueExercises: uniqueExercises.size,
      averageWorkoutDuration: totalDuration / filteredWorkouts.length || 0,
      totalVolume,
      totalSets,
    };
  }, [filteredWorkouts, timeframe]);

  // Generate analytics data
  const analyticsData: AnalyticsData = useMemo(() => {
    if (filteredWorkouts.length === 0) {
      return {
        volumeData: [],
        frequencyData: [],
        insights: [],
      };
    }

    // Group workouts by time period
    const groupedData = new Map<string, { volume: number; count: number }>();
    
    filteredWorkouts.forEach(workout => {
      const date = new Date(workout.created_at);
      let key: string;
      
      if (timeframe === 'week') {
        key = date.toISOString().split('T')[0]; // Daily
      } else if (timeframe === 'month') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0]; // Weekly
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Monthly
      }

      if (!groupedData.has(key)) {
        groupedData.set(key, { volume: 0, count: 0 });
      }

      const data = groupedData.get(key)!;
      data.count++;

      // Calculate volume for this workout
      let workoutVolume = 0;
      workout.exercises?.forEach(exercise => {
        exercise.sets?.forEach(set => {
          if (set.actual_weight_kg && set.actual_reps) {
            workoutVolume += set.actual_weight_kg * set.actual_reps;
          }
        });
      });
      data.volume += workoutVolume;
    });

    // Convert to chart data
    const sortedEntries = Array.from(groupedData.entries()).sort(([a], [b]) => a.localeCompare(b));
    
    const volumeData: ChartDataPoint[] = sortedEntries.map(([date, data]) => ({
      date,
      value: data.volume,
      label: `${data.volume.toFixed(0)}kg`,
    }));

    const frequencyData: ChartDataPoint[] = sortedEntries.map(([date, data]) => ({
      date,
      value: data.count,
      label: `${data.count} workout${data.count !== 1 ? 's' : ''}`,
    }));

    // Generate insights
    const insights: AnalyticsInsight[] = [];
    
    if (volumeData.length >= 2) {
      const recentVolume = volumeData.slice(-3).reduce((sum, point) => sum + point.value, 0) / 3;
      const previousVolume = volumeData.slice(-6, -3).reduce((sum, point) => sum + point.value, 0) / 3;
      
      if (recentVolume > previousVolume * 1.1) {
        insights.push({
          type: 'improvement',
          title: 'Volume Increasing',
          description: 'Your training volume has increased significantly in recent sessions.',
          value: ((recentVolume - previousVolume) / previousVolume * 100).toFixed(1) + '%',
          recommendation: 'Great progress! Consider adding more rest days to support recovery.',
        });
      } else if (recentVolume < previousVolume * 0.9) {
        insights.push({
          type: 'decline',
          title: 'Volume Declining',
          description: 'Your training volume has decreased recently.',
          recommendation: 'Consider reviewing your program or addressing any recovery issues.',
        });
      }
    }

    if (summaryStats.averageWorkoutsPerWeek >= 4) {
      insights.push({
        type: 'milestone',
        title: 'Consistency Champion',
        description: 'You\'re maintaining excellent workout consistency!',
        value: summaryStats.averageWorkoutsPerWeek.toFixed(1),
        recommendation: 'Keep up the great work! Consider tracking sleep and nutrition for optimal results.',
      });
    }

    return {
      volumeData,
      frequencyData,
      insights,
    };
  }, [filteredWorkouts, timeframe, summaryStats]);

  // Calculate trends
  const volumeTrend: TrendData = useMemo(() => {
    if (analyticsData.volumeData.length < 2) {
      return { trend: 'stable', current: 0, previous: 0, changePercent: 0 };
    }

    const data = analyticsData.volumeData;
    const current = data.slice(-3).reduce((sum, point) => sum + point.value, 0) / 3;
    const previous = data.slice(-6, -3).reduce((sum, point) => sum + point.value, 0) / 3;
    
    const changePercent = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
    const trend = changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable';

    return { trend, current, previous, changePercent };
  }, [analyticsData.volumeData]);

  const frequencyTrend: TrendData = useMemo(() => {
    if (analyticsData.frequencyData.length < 2) {
      return { trend: 'stable', current: 0, previous: 0, changePercent: 0 };
    }

    const data = analyticsData.frequencyData;
    const current = data.slice(-3).reduce((sum, point) => sum + point.value, 0) / 3;
    const previous = data.slice(-6, -3).reduce((sum, point) => sum + point.value, 0) / 3;
    
    const changePercent = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
    const trend = changePercent > 10 ? 'up' : changePercent < -10 ? 'down' : 'stable';

    return { trend, current, previous, changePercent };
  }, [analyticsData.frequencyData]);

  // Get available exercises
  const availableExercises = useMemo(() => {
    const exercises = new Set<string>();
    filteredWorkouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        exercises.add(exercise.exercise_name);
      });
    });
    return Array.from(exercises).sort();
  }, [filteredWorkouts]);

  // Generate exercise-specific data
  const exerciseData: ChartDataPoint[] = useMemo(() => {
    if (!selectedExercise) return [];

    const exerciseWorkouts = filteredWorkouts.filter(workout =>
      workout.exercises?.some(ex => ex.exercise_name === selectedExercise)
    );

    return exerciseWorkouts.map(workout => {
      const exercise = workout.exercises?.find(ex => ex.exercise_name === selectedExercise);
      if (!exercise) return null;

      let value = 0;
      switch (selectedMetric) {
        case 'weight':
          value = Math.max(...(exercise.sets?.map(set => set.actual_weight_kg || 0) || [0]));
          break;
        case 'reps':
          value = Math.max(...(exercise.sets?.map(set => set.actual_reps || 0) || [0]));
          break;
        case 'volume':
          value = exercise.sets?.reduce((sum, set) => 
            sum + ((set.actual_weight_kg || 0) * (set.actual_reps || 0)), 0
          ) || 0;
          break;
      }

      return {
        date: workout.created_at,
        value,
        label: selectedMetric === 'volume' ? `${value.toFixed(0)}kg` : `${value}${selectedMetric === 'weight' ? 'kg' : ''}`,
      };
    }).filter(Boolean) as ChartDataPoint[];
  }, [filteredWorkouts, selectedExercise, selectedMetric]);

  // Calculate exercise trend
  const exerciseTrend: TrendData = useMemo(() => {
    if (exerciseData.length < 2) {
      return { trend: 'stable', current: 0, previous: 0, changePercent: 0 };
    }

    const current = exerciseData[exerciseData.length - 1].value;
    const previous = exerciseData[exerciseData.length - 2].value;
    
    const changePercent = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
    const trend = changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable';

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
