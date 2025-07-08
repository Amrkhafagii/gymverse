import { useState, useEffect, useMemo } from 'react';
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { ChartDataProcessor, ChartDataPoint, TrendData, AnalyticsInsight } from '@/lib/analytics/chartDataProcessing';

export type AnalyticsTimeframe = 'week' | 'month' | 'year';
export type AnalyticsMetric = 'volume' | 'frequency' | 'weight' | 'reps';

export interface AnalyticsData {
  volumeData: ChartDataPoint[];
  frequencyData: ChartDataPoint[];
  topExercises: Array<{
    name: string;
    frequency: number;
    totalVolume: number;
    averageWeight: number;
  }>;
  insights: AnalyticsInsight[];
  trends: {
    volume: TrendData;
    frequency: TrendData;
  };
}

export function useAnalytics(timeframe: AnalyticsTimeframe = 'month') {
  const { workouts, isLoading: workoutsLoading } = useWorkoutHistory();
  const { personalRecords, isLoading: prsLoading } = usePersonalRecords();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<AnalyticsMetric>('volume');

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

    return workouts.filter(workout => new Date(workout.date) >= cutoffDate);
  }, [workouts, timeframe]);

  // Main analytics data
  const analyticsData: AnalyticsData = useMemo(() => {
    if (filteredWorkouts.length === 0) {
      return {
        volumeData: [],
        frequencyData: [],
        topExercises: [],
        insights: [],
        trends: {
          volume: { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' },
          frequency: { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' }
        }
      };
    }

    const volumeData = ChartDataProcessor.processWorkoutVolume(filteredWorkouts, timeframe);
    const frequencyData = ChartDataProcessor.processWorkoutFrequency(filteredWorkouts, timeframe === 'year' ? 'month' : 'week');
    const topExercises = ChartDataProcessor.getTopExercises(filteredWorkouts, 10);
    const insights = ChartDataProcessor.generateInsights(filteredWorkouts, personalRecords);

    const volumeTrend = ChartDataProcessor.calculateTrend(volumeData);
    const frequencyTrend = ChartDataProcessor.calculateTrend(frequencyData);

    return {
      volumeData,
      frequencyData,
      topExercises,
      insights,
      trends: {
        volume: volumeTrend,
        frequency: frequencyTrend
      }
    };
  }, [filteredWorkouts, personalRecords, timeframe]);

  // Exercise-specific data
  const exerciseData = useMemo(() => {
    if (!selectedExercise) return [];
    
    const metric = selectedMetric === 'volume' ? 'volume' : 
                   selectedMetric === 'frequency' ? 'weight' : selectedMetric;
    
    return ChartDataProcessor.processExerciseProgress(
      filteredWorkouts, 
      selectedExercise, 
      metric as 'weight' | 'reps' | 'volume'
    );
  }, [filteredWorkouts, selectedExercise, selectedMetric]);

  // Exercise trend
  const exerciseTrend = useMemo(() => {
    if (exerciseData.length === 0) {
      return { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' as const };
    }
    return ChartDataProcessor.calculateTrend(exerciseData);
  }, [exerciseData]);

  // Available exercises for selection
  const availableExercises = useMemo(() => {
    return analyticsData.topExercises.map(ex => ex.name);
  }, [analyticsData.topExercises]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalWorkouts = filteredWorkouts.length;
    const totalVolume = analyticsData.volumeData.reduce((sum, point) => sum + point.value, 0);
    const averageWorkoutsPerWeek = timeframe === 'week' ? totalWorkouts : 
                                   timeframe === 'month' ? totalWorkouts / 4 : 
                                   totalWorkouts / 52;

    const uniqueExercises = new Set();
    filteredWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        uniqueExercises.add(exercise.name);
      });
    });

    return {
      totalWorkouts,
      totalVolume,
      averageWorkoutsPerWeek: Math.round(averageWorkoutsPerWeek * 10) / 10,
      uniqueExercises: uniqueExercises.size,
      averageWorkoutDuration: filteredWorkouts.length > 0 ? 
        filteredWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / filteredWorkouts.length : 0
    };
  }, [filteredWorkouts, analyticsData.volumeData, timeframe]);

  return {
    // Data
    analyticsData,
    exerciseData,
    summaryStats,
    
    // Trends
    volumeTrend: analyticsData.trends.volume,
    frequencyTrend: analyticsData.trends.frequency,
    exerciseTrend,
    
    // Selections
    selectedExercise,
    setSelectedExercise,
    selectedMetric,
    setSelectedMetric,
    availableExercises,
    
    // State
    isLoading: workoutsLoading || prsLoading,
    hasData: filteredWorkouts.length > 0,
    
    // Utilities
    refreshData: () => {
      // This will trigger re-computation through context updates
    }
  };
}
