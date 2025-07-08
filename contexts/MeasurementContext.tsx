import React, { createContext, useContext } from 'react';
import { useMeasurements } from '@/hooks/useMeasurements';
import { Measurement, MeasurementTrend, MeasurementStats, MeasurementGoal, MeasurementReminder } from '@/types/measurement';

interface MeasurementContextType {
  // State
  measurements: Measurement[];
  goals: MeasurementGoal[];
  reminders: MeasurementReminder[];
  stats: MeasurementStats;
  isLoading: boolean;
  error: string | null;

  // Measurement actions
  addMeasurement: (measurement: Omit<Measurement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Measurement>;
  updateMeasurement: (id: string, updates: Partial<Measurement>) => Promise<void>;
  deleteMeasurement: (id: string) => Promise<void>;

  // Goal actions
  addGoal: (goal: Omit<MeasurementGoal, 'id' | 'createdAt'>) => Promise<MeasurementGoal>;
  updateGoal: (id: string, updates: Partial<MeasurementGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Reminder actions
  addReminder: (reminder: Omit<MeasurementReminder, 'id' | 'createdAt'>) => Promise<MeasurementReminder>;
  updateReminder: (id: string, updates: Partial<MeasurementReminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;

  // Getters
  getMeasurementsByType: (type: string) => Measurement[];
  getLatestMeasurement: (type: string) => Measurement | undefined;
  getTrend: (type: string, period?: 'week' | 'month' | 'quarter' | 'year') => MeasurementTrend | null;
  getAllTrends: (period?: 'week' | 'month' | 'quarter' | 'year') => MeasurementTrend[];
  getProgressData: (type: string, timeframe?: 'week' | 'month' | 'quarter' | 'year') => { date: string; value: number; label?: string }[];

  // Utils
  refreshMeasurements: () => Promise<void>;
}

const MeasurementContext = createContext<MeasurementContextType | undefined>(undefined);

export function MeasurementProvider({ children }: { children: React.ReactNode }) {
  const measurementHook = useMeasurements();

  return (
    <MeasurementContext.Provider value={measurementHook}>
      {children}
    </MeasurementContext.Provider>
  );
}

export function useMeasurementContext() {
  const context = useContext(MeasurementContext);
  if (context === undefined) {
    throw new Error('useMeasurementContext must be used within a MeasurementProvider');
  }
  return context;
}
