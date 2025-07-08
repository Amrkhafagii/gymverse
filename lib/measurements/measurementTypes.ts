import { MeasurementType } from '@/types/measurement';

export const MEASUREMENT_TYPES: MeasurementType[] = [
  // Weight Category
  {
    id: 'weight',
    name: 'Weight',
    unit: 'kg',
    category: 'weight',
    icon: '⚖️',
    description: 'Body weight',
    minValue: 30,
    maxValue: 300,
  },
  {
    id: 'body_fat',
    name: 'Body Fat',
    unit: '%',
    category: 'weight',
    icon: '📊',
    description: 'Body fat percentage',
    minValue: 3,
    maxValue: 50,
  },
  {
    id: 'muscle_mass',
    name: 'Muscle Mass',
    unit: 'kg',
    category: 'weight',
    icon: '💪',
    description: 'Muscle mass',
    minValue: 20,
    maxValue: 100,
  },

  // Body Measurements Category
  {
    id: 'chest',
    name: 'Chest',
    unit: 'cm',
    category: 'body',
    icon: '🫁',
    description: 'Chest circumference',
    minValue: 60,
    maxValue: 150,
  },
  {
    id: 'waist',
    name: 'Waist',
    unit: 'cm',
    category: 'body',
    icon: '⭕',
    description: 'Waist circumference',
    minValue: 50,
    maxValue: 150,
  },
  {
    id: 'hips',
    name: 'Hips',
    unit: 'cm',
    category: 'body',
    icon: '🍑',
    description: 'Hip circumference',
    minValue: 60,
    maxValue: 150,
  },
  {
    id: 'bicep_left',
    name: 'Left Bicep',
    unit: 'cm',
    category: 'body',
    icon: '💪',
    description: 'Left bicep circumference',
    minValue: 20,
    maxValue: 60,
  },
  {
    id: 'bicep_right',
    name: 'Right Bicep',
    unit: 'cm',
    category: 'body',
    icon: '💪',
    description: 'Right bicep circumference',
    minValue: 20,
    maxValue: 60,
  },
  {
    id: 'thigh_left',
    name: 'Left Thigh',
    unit: 'cm',
    category: 'body',
    icon: '🦵',
    description: 'Left thigh circumference',
    minValue: 30,
    maxValue: 80,
  },
  {
    id: 'thigh_right',
    name: 'Right Thigh',
    unit: 'cm',
    category: 'body',
    icon: '🦵',
    description: 'Right thigh circumference',
    minValue: 30,
    maxValue: 80,
  },
  {
    id: 'neck',
    name: 'Neck',
    unit: 'cm',
    category: 'body',
    icon: '🦒',
    description: 'Neck circumference',
    minValue: 25,
    maxValue: 50,
  },
  {
    id: 'forearm_left',
    name: 'Left Forearm',
    unit: 'cm',
    category: 'body',
    icon: '🤏',
    description: 'Left forearm circumference',
    minValue: 15,
    maxValue: 40,
  },
  {
    id: 'forearm_right',
    name: 'Right Forearm',
    unit: 'cm',
    category: 'body',
    icon: '🤏',
    description: 'Right forearm circumference',
    minValue: 15,
    maxValue: 40,
  },
  {
    id: 'calf_left',
    name: 'Left Calf',
    unit: 'cm',
    category: 'body',
    icon: '🦵',
    description: 'Left calf circumference',
    minValue: 20,
    maxValue: 50,
  },
  {
    id: 'calf_right',
    name: 'Right Calf',
    unit: 'cm',
    category: 'body',
    icon: '🦵',
    description: 'Right calf circumference',
    minValue: 20,
    maxValue: 50,
  },
];

export const getMeasurementTypeById = (id: string): MeasurementType | undefined => {
  return MEASUREMENT_TYPES.find(type => type.id === id);
};

export const getMeasurementTypesByCategory = (category: string): MeasurementType[] => {
  return MEASUREMENT_TYPES.filter(type => type.category === category);
};

export const getDefaultMeasurementTypes = (): MeasurementType[] => {
  return MEASUREMENT_TYPES.filter(type => 
    ['weight', 'body_fat', 'chest', 'waist', 'bicep_left', 'bicep_right'].includes(type.id)
  );
};
