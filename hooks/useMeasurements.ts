import { useState, useEffect } from 'react';
import { Measurement, MeasurementTrend, MeasurementStats, MeasurementGoal, MeasurementReminder } from '@/types/measurement';
import { MeasurementCalculations } from '@/lib/measurements/measurementCalculations';

interface MeasurementState {
  measurements: Measurement[];
  goals: MeasurementGoal[];
  reminders: MeasurementReminder[];
  stats: MeasurementStats;
  isLoading: boolean;
  error: string | null;
}

export function useMeasurements() {
  const [state, setState] = useState<MeasurementState>({
    measurements: [],
    goals: [],
    reminders: [],
    stats: {
      totalMeasurements: 0,
      measurementTypes: 0,
      streakDays: 0,
      mostTrackedType: '',
      averageFrequency: 0,
    },
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      
      // Load measurements
      const measurementsData = await AsyncStorage.default.getItem('measurements_v1');
      const measurements: Measurement[] = measurementsData ? JSON.parse(measurementsData) : [];
      
      // Load goals
      const goalsData = await AsyncStorage.default.getItem('measurement_goals_v1');
      const goals: MeasurementGoal[] = goalsData ? JSON.parse(goalsData) : [];
      
      // Load reminders
      const remindersData = await AsyncStorage.default.getItem('measurement_reminders_v1');
      const reminders: MeasurementReminder[] = remindersData ? JSON.parse(remindersData) : [];
      
      // Calculate stats
      const stats = MeasurementCalculations.calculateStats(measurements);
      
      setState(prev => ({
        ...prev,
        measurements,
        goals,
        reminders,
        stats,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading measurements:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load measurements',
        isLoading: false,
      }));
    }
  };

  const saveMeasurements = async (measurements: Measurement[]) => {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.setItem('measurements_v1', JSON.stringify(measurements));
    } catch (error) {
      console.error('Error saving measurements:', error);
      throw new Error('Failed to save measurements');
    }
  };

  const saveGoals = async (goals: MeasurementGoal[]) => {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.setItem('measurement_goals_v1', JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving goals:', error);
      throw new Error('Failed to save goals');
    }
  };

  const saveReminders = async (reminders: MeasurementReminder[]) => {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.setItem('measurement_reminders_v1', JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving reminders:', error);
      throw new Error('Failed to save reminders');
    }
  };

  const addMeasurement = async (measurement: Omit<Measurement, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newMeasurement: Measurement = {
        ...measurement,
        id: `measurement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedMeasurements = [...state.measurements, newMeasurement];
      await saveMeasurements(updatedMeasurements);
      
      const stats = MeasurementCalculations.calculateStats(updatedMeasurements);
      
      setState(prev => ({
        ...prev,
        measurements: updatedMeasurements,
        stats,
      }));

      return newMeasurement;
    } catch (error) {
      console.error('Error adding measurement:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to add measurement',
      }));
      throw error;
    }
  };

  const updateMeasurement = async (id: string, updates: Partial<Measurement>) => {
    try {
      const updatedMeasurements = state.measurements.map(measurement =>
        measurement.id === id
          ? { ...measurement, ...updates, updatedAt: new Date().toISOString() }
          : measurement
      );

      await saveMeasurements(updatedMeasurements);
      
      const stats = MeasurementCalculations.calculateStats(updatedMeasurements);
      
      setState(prev => ({
        ...prev,
        measurements: updatedMeasurements,
        stats,
      }));
    } catch (error) {
      console.error('Error updating measurement:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to update measurement',
      }));
      throw error;
    }
  };

  const deleteMeasurement = async (id: string) => {
    try {
      const updatedMeasurements = state.measurements.filter(measurement => measurement.id !== id);
      await saveMeasurements(updatedMeasurements);
      
      const stats = MeasurementCalculations.calculateStats(updatedMeasurements);
      
      setState(prev => ({
        ...prev,
        measurements: updatedMeasurements,
        stats,
      }));
    } catch (error) {
      console.error('Error deleting measurement:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to delete measurement',
      }));
      throw error;
    }
  };

  const addGoal = async (goal: Omit<MeasurementGoal, 'id' | 'createdAt'>) => {
    try {
      const newGoal: MeasurementGoal = {
        ...goal,
        id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };

      const updatedGoals = [...state.goals, newGoal];
      await saveGoals(updatedGoals);
      
      setState(prev => ({
        ...prev,
        goals: updatedGoals,
      }));

      return newGoal;
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  };

  const updateGoal = async (id: string, updates: Partial<MeasurementGoal>) => {
    try {
      const updatedGoals = state.goals.map(goal =>
        goal.id === id ? { ...goal, ...updates } : goal
      );

      await saveGoals(updatedGoals);
      
      setState(prev => ({
        ...prev,
        goals: updatedGoals,
      }));
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const updatedGoals = state.goals.filter(goal => goal.id !== id);
      await saveGoals(updatedGoals);
      
      setState(prev => ({
        ...prev,
        goals: updatedGoals,
      }));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  };

  const addReminder = async (reminder: Omit<MeasurementReminder, 'id' | 'createdAt'>) => {
    try {
      const newReminder: MeasurementReminder = {
        ...reminder,
        id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };

      const updatedReminders = [...state.reminders, newReminder];
      await saveReminders(updatedReminders);
      
      setState(prev => ({
        ...prev,
        reminders: updatedReminders,
      }));

      return newReminder;
    } catch (error) {
      console.error('Error adding reminder:', error);
      throw error;
    }
  };

  const updateReminder = async (id: string, updates: Partial<MeasurementReminder>) => {
    try {
      const updatedReminders = state.reminders.map(reminder =>
        reminder.id === id ? { ...reminder, ...updates } : reminder
      );

      await saveReminders(updatedReminders);
      
      setState(prev => ({
        ...prev,
        reminders: updatedReminders,
      }));
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const updatedReminders = state.reminders.filter(reminder => reminder.id !== id);
      await saveReminders(updatedReminders);
      
      setState(prev => ({
        ...prev,
        reminders: updatedReminders,
      }));
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  };

  const getMeasurementsByType = (type: string): Measurement[] => {
    return state.measurements
      .filter(m => m.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getLatestMeasurement = (type: string): Measurement | undefined => {
    return getMeasurementsByType(type)[0];
  };

  const getTrend = (type: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month'): MeasurementTrend | null => {
    return MeasurementCalculations.calculateTrend(state.measurements, type, period);
  };

  const getAllTrends = (period: 'week' | 'month' | 'quarter' | 'year' = 'month'): MeasurementTrend[] => {
    return MeasurementCalculations.calculateAllTrends(state.measurements, period);
  };

  const getProgressData = (type: string, timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month') => {
    return MeasurementCalculations.getProgressData(state.measurements, type, timeframe);
  };

  const refreshMeasurements = async () => {
    await loadMeasurements();
  };

  return {
    // State
    measurements: state.measurements,
    goals: state.goals,
    reminders: state.reminders,
    stats: state.stats,
    isLoading: state.isLoading,
    error: state.error,

    // Measurement actions
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,

    // Goal actions
    addGoal,
    updateGoal,
    deleteGoal,

    // Reminder actions
    addReminder,
    updateReminder,
    deleteReminder,

    // Getters
    getMeasurementsByType,
    getLatestMeasurement,
    getTrend,
    getAllTrends,
    getProgressData,

    // Utils
    refreshMeasurements,
  };
}
