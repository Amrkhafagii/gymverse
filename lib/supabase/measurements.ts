import { supabase } from './index';

export interface BodyMeasurement {
  id: string;
  user_id: string;
  measurement_date: string;
  weight?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  bicep_left?: number;
  bicep_right?: number;
  thigh_left?: number;
  thigh_right?: number;
  neck?: number;
  forearm_left?: number;
  forearm_right?: number;
  calf_left?: number;
  calf_right?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MeasurementStats {
  measurement_type: string;
  current_value: number;
  previous_value?: number;
  change: number;
  change_percentage: number;
  trend: 'up' | 'down' | 'stable';
  best_value: number;
  worst_value: number;
  average_value: number;
  measurement_count: number;
}

export async function addBodyMeasurement(measurement: Omit<BodyMeasurement, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('body_measurements')
    .insert({
      ...measurement,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as BodyMeasurement;
}

export async function getBodyMeasurements(limit?: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  let query = supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', user.id)
    .order('measurement_date', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as BodyMeasurement[];
}

export async function updateBodyMeasurement(id: string, updates: Partial<BodyMeasurement>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('body_measurements')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as BodyMeasurement;
}

export async function deleteBodyMeasurement(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('body_measurements')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function getLatestMeasurement() {
  const measurements = await getBodyMeasurements(1);
  return measurements[0] || null;
}

export async function getMeasurementStats(): Promise<MeasurementStats[]> {
  const measurements = await getBodyMeasurements();
  if (measurements.length === 0) return [];

  const stats: MeasurementStats[] = [];
  const measurementFields = [
    'weight',
    'body_fat_percentage',
    'muscle_mass',
    'chest',
    'waist',
    'hips',
    'bicep_left',
    'bicep_right',
    'thigh_left',
    'thigh_right',
    'neck',
    'forearm_left',
    'forearm_right',
    'calf_left',
    'calf_right',
  ];

  for (const field of measurementFields) {
    const values = measurements
      .map(m => m[field as keyof BodyMeasurement] as number)
      .filter(v => v !== null && v !== undefined && !isNaN(v));

    if (values.length === 0) continue;

    const currentValue = values[0];
    const previousValue = values.length > 1 ? values[1] : undefined;
    const change = previousValue ? currentValue - previousValue : 0;
    const changePercentage = previousValue ? (change / previousValue) * 100 : 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercentage) > 1) {
      trend = changePercentage > 0 ? 'up' : 'down';
    }

    const bestValue = Math.max(...values);
    const worstValue = Math.min(...values);
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;

    stats.push({
      measurement_type: field,
      current_value: currentValue,
      previous_value: previousValue,
      change,
      change_percentage: changePercentage,
      trend,
      best_value: bestValue,
      worst_value: worstValue,
      average_value: averageValue,
      measurement_count: values.length,
    });
  }

  return stats;
}

export async function getMeasurementHistory(measurementType: string, days: number = 90) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('body_measurements')
    .select(`measurement_date, ${measurementType}`)
    .eq('user_id', user.id)
    .gte('measurement_date', startDate.toISOString())
    .not(measurementType, 'is', null)
    .order('measurement_date', { ascending: true });

  if (error) throw error;
  
  return data.map(item => ({
    date: item.measurement_date,
    value: item[measurementType as keyof typeof item] as number,
  }));
}
