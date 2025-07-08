/**
 * Measurement Types - Previously unused, now integrated into measurements system
 * Comprehensive measurement type definitions with categories and validation
 */

export interface MeasurementType {
  id: string;
  name: string;
  icon: string;
  unit: string;
  category: 'weight' | 'body' | 'performance';
  description: string;
  minValue?: number;
  maxValue?: number;
  step?: number;
  color?: string;
  defaultGoal?: {
    type: 'increase' | 'decrease' | 'maintain';
    target?: number;
  };
}

export const MEASUREMENT_TYPES: MeasurementType[] = [
  // Weight Category
  {
    id: 'body_weight',
    name: 'Body Weight',
    icon: '⚖️',
    unit: 'kg',
    category: 'weight',
    description: 'Overall body weight',
    minValue: 30,
    maxValue: 300,
    step: 0.1,
    color: '#3B82F6',
    defaultGoal: { type: 'maintain' },
  },
  {
    id: 'body_fat',
    name: 'Body Fat %',
    icon: '📊',
    unit: '%',
    category: 'weight',
    description: 'Body fat percentage',
    minValue: 3,
    maxValue: 50,
    step: 0.1,
    color: '#EF4444',
    defaultGoal: { type: 'decrease', target: 15 },
  },
  {
    id: 'muscle_mass',
    name: 'Muscle Mass',
    icon: '💪',
    unit: 'kg',
    category: 'weight',
    description: 'Total muscle mass',
    minValue: 10,
    maxValue: 100,
    step: 0.1,
    color: '#10B981',
    defaultGoal: { type: 'increase' },
  },

  // Body Category
  {
    id: 'chest',
    name: 'Chest',
    icon: '🫁',
    unit: 'cm',
    category: 'body',
    description: 'Chest circumference',
    minValue: 50,
    maxValue: 200,
    step: 0.5,
    color: '#F59E0B',
    defaultGoal: { type: 'increase' },
  },
  {
    id: 'waist',
    name: 'Waist',
    icon: '⭕',
    unit: 'cm',
    category: 'body',
    description: 'Waist circumference',
    minValue: 40,
    maxValue: 150,
    step: 0.5,
    color: '#EF4444',
    defaultGoal: { type: 'decrease' },
  },
  {
    id: 'hips',
    name: 'Hips',
    icon: '🍑',
    unit: 'cm',
    category: 'body',
    description: 'Hip circumference',
    minValue: 50,
    maxValue: 200,
    step: 0.5,
    color: '#8B5CF6',
    defaultGoal: { type: 'maintain' },
  },
  {
    id: 'bicep_left',
    name: 'Left Bicep',
    icon: '💪',
    unit: 'cm',
    category: 'body',
    description: 'Left bicep circumference',
    minValue: 15,
    maxValue: 60,
    step: 0.5,
    color: '#06B6D4',
    defaultGoal: { type: 'increase' },
  },
  {
    id: 'bicep_right',
    name: 'Right Bicep',
    icon: '💪',
    unit: 'cm',
    category: 'body',
    description: 'Right bicep circumference',
    minValue: 15,
    maxValue: 60,
    step: 0.5,
    color: '#06B6D4',
    defaultGoal: { type: 'increase' },
  },
  {
    id: 'thigh_left',
    name: 'Left Thigh',
    icon: '🦵',
    unit: 'cm',
    category: 'body',
    description: 'Left thigh circumference',
    minValue: 30,
    maxValue: 100,
    step: 0.5,
    color: '#84CC16',
    defaultGoal: { type: 'increase' },
  },
  {
    id: 'thigh_right',
    name: 'Right Thigh',
    icon: '🦵',
    unit: 'cm',
    category: 'body',
    description: 'Right thigh circumference',
    minValue: 30,
    maxValue: 100,
    step: 0.5,
    color: '#84CC16',
    defaultGoal: { type: 'increase' },
  },
  {
    id: 'neck',
    name: 'Neck',
    icon: '🦒',
    unit: 'cm',
    category: 'body',
    description: 'Neck circumference',
    minValue: 20,
    maxValue: 60,
    step: 0.5,
    color: '#F97316',
    defaultGoal: { type: 'maintain' },
  },
  {
    id: 'forearm_left',
    name: 'Left Forearm',
    icon: '🤏',
    unit: 'cm',
    category: 'body',
    description: 'Left forearm circumference',
    minValue: 15,
    maxValue: 50,
    step: 0.5,
    color: '#6366F1',
    defaultGoal: { type: 'increase' },
  },
  {
    id: 'forearm_right',
    name: 'Right Forearm',
    icon: '🤏',
    unit: 'cm',
    category: 'body',
    description: 'Right forearm circumference',
    minValue: 15,
    maxValue: 50,
    step: 0.5,
    color: '#6366F1',
    defaultGoal: { type: 'increase' },
  },

  // Performance Category
  {
    id: 'resting_heart_rate',
    name: 'Resting Heart Rate',
    icon: '❤️',
    unit: 'bpm',
    category: 'performance',
    description: 'Resting heart rate',
    minValue: 40,
    maxValue: 120,
    step: 1,
    color: '#DC2626',
    defaultGoal: { type: 'decrease', target: 60 },
  },
  {
    id: 'blood_pressure_systolic',
    name: 'Blood Pressure (Systolic)',
    icon: '🩸',
    unit: 'mmHg',
    category: 'performance',
    description: 'Systolic blood pressure',
    minValue: 80,
    maxValue: 200,
    step: 1,
    color: '#B91C1C',
    defaultGoal: { type: 'maintain', target: 120 },
  },
  {
    id: 'blood_pressure_diastolic',
    name: 'Blood Pressure (Diastolic)',
    icon: '🩸',
    unit: 'mmHg',
    category: 'performance',
    description: 'Diastolic blood pressure',
    minValue: 50,
    maxValue: 120,
    step: 1,
    color: '#B91C1C',
    defaultGoal: { type: 'maintain', target: 80 },
  },
  {
    id: 'vo2_max',
    name: 'VO2 Max',
    icon: '🫁',
    unit: 'ml/kg/min',
    category: 'performance',
    description: 'Maximum oxygen uptake',
    minValue: 20,
    maxValue: 80,
    step: 0.1,
    color: '#059669',
    defaultGoal: { type: 'increase' },
  },
  {
    id: 'flexibility_score',
    name: 'Flexibility Score',
    icon: '🤸',
    unit: 'points',
    category: 'performance',
    description: 'Overall flexibility assessment',
    minValue: 0,
    maxValue: 100,
    step: 1,
    color: '#7C3AED',
    defaultGoal: { type: 'increase', target: 80 },
  },
  {
    id: 'sleep_quality',
    name: 'Sleep Quality',
    icon: '😴',
    unit: '/10',
    category: 'performance',
    description: 'Subjective sleep quality rating',
    minValue: 1,
    maxValue: 10,
    step: 1,
    color: '#1E40AF',
    defaultGoal: { type: 'increase', target: 8 },
  },
  {
    id: 'energy_level',
    name: 'Energy Level',
    icon: '⚡',
    unit: '/10',
    category: 'performance',
    description: 'Daily energy level rating',
    minValue: 1,
    maxValue: 10,
    step: 1,
    color: '#FBBF24',
    defaultGoal: { type: 'increase', target: 8 },
  },
  {
    id: 'stress_level',
    name: 'Stress Level',
    icon: '😰',
    unit: '/10',
    category: 'performance',
    description: 'Daily stress level rating',
    minValue: 1,
    maxValue: 10,
    step: 1,
    color: '#F87171',
    defaultGoal: { type: 'decrease', target: 3 },
  },
];

/**
 * Get measurement type by ID
 */
export function getMeasurementTypeById(id: string): MeasurementType | undefined {
  return MEASUREMENT_TYPES.find(type => type.id === id);
}

/**
 * Get measurement types by category
 */
export function getMeasurementTypesByCategory(category: 'weight' | 'body' | 'performance'): MeasurementType[] {
  return MEASUREMENT_TYPES.filter(type => type.category === category);
}

/**
 * Get all measurement categories
 */
export function getMeasurementCategories(): Array<{ id: string; name: string; icon: string }> {
  return [
    { id: 'weight', name: 'Weight & Composition', icon: '⚖️' },
    { id: 'body', name: 'Body Measurements', icon: '📏' },
    { id: 'performance', name: 'Performance Metrics', icon: '🏃' },
  ];
}

/**
 * Validate measurement value
 */
export function validateMeasurementValue(typeId: string, value: number): {
  isValid: boolean;
  error?: string;
} {
  const type = getMeasurementTypeById(typeId);
  
  if (!type) {
    return { isValid: false, error: 'Invalid measurement type' };
  }

  if (isNaN(value) || value <= 0) {
    return { isValid: false, error: 'Value must be a positive number' };
  }

  if (type.minValue && value < type.minValue) {
    return { 
      isValid: false, 
      error: `Value must be at least ${type.minValue} ${type.unit}` 
    };
  }

  if (type.maxValue && value > type.maxValue) {
    return { 
      isValid: false, 
      error: `Value must not exceed ${type.maxValue} ${type.unit}` 
    };
  }

  return { isValid: true };
}

/**
 * Format measurement value for display
 */
export function formatMeasurementValue(value: number, unit: string): string {
  if (unit === '%' || unit === '/10') {
    return `${value.toFixed(1)}${unit}`;
  }
  
  if (unit === 'kg' || unit === 'cm') {
    return `${value.toFixed(1)} ${unit}`;
  }
  
  if (unit === 'bpm' || unit === 'mmHg' || unit === 'points') {
    return `${Math.round(value)} ${unit}`;
  }
  
  if (unit === 'ml/kg/min') {
    return `${value.toFixed(1)} ${unit}`;
  }
  
  return `${value} ${unit}`;
}

/**
 * Get measurement type color
 */
export function getMeasurementTypeColor(typeId: string): string {
  const type = getMeasurementTypeById(typeId);
  return type?.color || '#6B7280';
}

/**
 * Get suggested measurement frequency
 */
export function getSuggestedFrequency(typeId: string): {
  frequency: 'daily' | 'weekly' | 'monthly';
  description: string;
} {
  const type = getMeasurementTypeById(typeId);
  
  if (!type) {
    return { frequency: 'weekly', description: 'Weekly tracking recommended' };
  }

  switch (type.category) {
    case 'weight':
      if (type.id === 'body_weight') {
        return { frequency: 'daily', description: 'Daily morning weigh-ins for best accuracy' };
      }
      return { frequency: 'weekly', description: 'Weekly measurements for tracking changes' };
    
    case 'body':
      return { frequency: 'weekly', description: 'Weekly measurements to track progress' };
    
    case 'performance':
      if (['sleep_quality', 'energy_level', 'stress_level'].includes(type.id)) {
        return { frequency: 'daily', description: 'Daily tracking for lifestyle insights' };
      }
      if (type.id === 'resting_heart_rate') {
        return { frequency: 'daily', description: 'Daily morning measurements' };
      }
      return { frequency: 'monthly', description: 'Monthly assessments recommended' };
    
    default:
      return { frequency: 'weekly', description: 'Weekly tracking recommended' };
  }
}
