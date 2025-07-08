/**
 * Measurement Types - Previously unused, now integrated into measurements system
 * TypeScript definitions for comprehensive body measurement tracking
 */

export interface Measurement {
  id: string;
  type: string; // References MeasurementType.id
  value: number;
  unit: string;
  date: string; // ISO date string
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementTrend {
  measurementType: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  trend: 'up' | 'down' | 'stable';
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  dataPoints: number;
}

export interface MeasurementStats {
  totalMeasurements: number;
  measurementTypes: number;
  streakDays: number;
  mostTrackedType: string;
  averageFrequency: number; // measurements per week
}

export interface MeasurementGoal {
  id: string;
  measurementType: string;
  targetValue: number;
  unit: string;
  deadline: string; // ISO date string
  type: 'increase' | 'decrease' | 'maintain';
  progress?: number; // percentage
  isActive: boolean;
  createdAt: string;
}

export interface MeasurementReminder {
  id: string;
  measurementTypes: string[]; // Array of measurement type IDs
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  days?: number[]; // 0-6, Sunday = 0
  isActive: boolean;
  lastTriggered?: string;
  createdAt: string;
}

export interface MeasurementSession {
  id: string;
  date: string;
  measurements: Measurement[];
  notes?: string;
  duration?: number; // minutes
  createdAt: string;
}

export interface MeasurementInsight {
  id: string;
  type: 'trend' | 'milestone' | 'correlation' | 'anomaly' | 'goal_progress';
  title: string;
  description: string;
  measurementTypes: string[];
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendation?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface MeasurementExport {
  measurements: Measurement[];
  goals: MeasurementGoal[];
  stats: MeasurementStats;
  exportDate: string;
  format: 'json' | 'csv' | 'pdf';
}

// Chart data interfaces
export interface MeasurementChartData {
  date: string;
  value: number;
  label?: string;
  trend?: 'up' | 'down' | 'stable';
  isAnomaly?: boolean;
}

export interface MeasurementComparison {
  measurementType: string;
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  current: {
    value: number;
    date: string;
  };
  previous: {
    value: number;
    date: string;
  };
  change: {
    absolute: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
}

// Body composition specific interfaces
export interface BodyComposition {
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  visceralFat?: number;
  waterPercentage?: number;
  boneMass?: number;
  bmr?: number; // Basal Metabolic Rate
  bmi?: number;
}

export interface CircumferenceMeasurements {
  date: string;
  chest?: number;
  waist?: number;
  hips?: number;
  bicepLeft?: number;
  bicepRight?: number;
  thighLeft?: number;
  thighRight?: number;
  neck?: number;
  forearmLeft?: number;
  forearmRight?: number;
}

export interface PerformanceMetrics {
  date: string;
  restingHeartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  vo2Max?: number;
  flexibilityScore?: number;
  sleepQuality?: number;
  energyLevel?: number;
  stressLevel?: number;
}

// Validation interfaces
export interface MeasurementValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MeasurementRange {
  min: number;
  max: number;
  optimal?: {
    min: number;
    max: number;
  };
}

// Analytics interfaces
export interface MeasurementAnalytics {
  measurementType: string;
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  summary: {
    count: number;
    average: number;
    min: number;
    max: number;
    standardDeviation: number;
  };
  trend: MeasurementTrend;
  predictions?: {
    nextValue: number;
    confidence: number;
    date: string;
  };
  correlations?: Array<{
    measurementType: string;
    correlation: number;
    significance: 'high' | 'medium' | 'low';
  }>;
}

// Progress tracking interfaces
export interface MeasurementProgress {
  measurementType: string;
  startDate: string;
  endDate: string;
  startValue: number;
  endValue: number;
  change: {
    absolute: number;
    percentage: number;
  };
  milestones: Array<{
    date: string;
    value: number;
    description: string;
  }>;
  goalProgress?: {
    goalId: string;
    targetValue: number;
    currentProgress: number;
    estimatedCompletion?: string;
  };
}
