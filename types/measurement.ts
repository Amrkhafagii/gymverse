export interface MeasurementType {
  id: string;
  name: string;
  unit: 'kg' | 'lbs' | 'cm' | 'in' | '%';
  category: 'weight' | 'body' | 'performance';
  icon: string;
  description: string;
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
}

export interface Measurement {
  id: string;
  type: string; // MeasurementType id
  value: number;
  unit: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementTrend {
  type: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  period: 'week' | 'month' | 'quarter' | 'year';
}

export interface MeasurementGoal {
  id: string;
  measurementType: string;
  targetValue: number;
  currentValue: number;
  deadline?: string;
  isActive: boolean;
  createdAt: string;
}

export interface MeasurementReminder {
  id: string;
  measurementTypes: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  isActive: boolean;
  lastReminded?: string;
  createdAt: string;
}

export interface MeasurementStats {
  totalMeasurements: number;
  measurementTypes: number;
  streakDays: number;
  lastMeasurement?: string;
  mostTrackedType: string;
  averageFrequency: number;
}
