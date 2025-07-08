import { Measurement, MeasurementTrend, MeasurementStats } from '@/types/measurement';
import { getMeasurementTypeById } from './measurementTypes';

export class MeasurementCalculations {
  static calculateTrend(
    measurements: Measurement[],
    measurementType: string,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): MeasurementTrend | null {
    const typeMeasurements = measurements
      .filter(m => m.type === measurementType)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (typeMeasurements.length < 2) {
      return null;
    }

    const current = typeMeasurements[0];
    const periodDays = this.getPeriodDays(period);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    const previousMeasurement = typeMeasurements.find(m => 
      new Date(m.date) <= cutoffDate
    );

    if (!previousMeasurement) {
      return null;
    }

    const change = current.value - previousMeasurement.value;
    const changePercent = (change / previousMeasurement.value) * 100;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    const threshold = 0.5; // 0.5% threshold for stability

    if (Math.abs(changePercent) > threshold) {
      trend = change > 0 ? 'up' : 'down';
    }

    return {
      type: measurementType,
      current: current.value,
      previous: previousMeasurement.value,
      change,
      changePercent,
      trend,
      period,
    };
  }

  static calculateAllTrends(
    measurements: Measurement[],
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): MeasurementTrend[] {
    const measurementTypes = [...new Set(measurements.map(m => m.type))];
    const trends: MeasurementTrend[] = [];

    measurementTypes.forEach(type => {
      const trend = this.calculateTrend(measurements, type, period);
      if (trend) {
        trends.push(trend);
      }
    });

    return trends;
  }

  static calculateStats(measurements: Measurement[]): MeasurementStats {
    const measurementTypes = new Set(measurements.map(m => m.type));
    const sortedMeasurements = measurements.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate streak
    const streakDays = this.calculateMeasurementStreak(measurements);

    // Find most tracked type
    const typeCounts: { [key: string]: number } = {};
    measurements.forEach(m => {
      typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
    });

    const mostTrackedType = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Calculate average frequency (measurements per week)
    const averageFrequency = this.calculateAverageFrequency(measurements);

    return {
      totalMeasurements: measurements.length,
      measurementTypes: measurementTypes.size,
      streakDays,
      lastMeasurement: sortedMeasurements[0]?.date,
      mostTrackedType,
      averageFrequency,
    };
  }

  static getProgressData(
    measurements: Measurement[],
    measurementType: string,
    timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): { date: string; value: number; label?: string }[] {
    const typeMeasurements = measurements
      .filter(m => m.type === measurementType)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const periodDays = this.getPeriodDays(timeframe);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    return typeMeasurements
      .filter(m => new Date(m.date) >= startDate)
      .map(m => ({
        date: m.date,
        value: m.value,
        label: new Date(m.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
      }));
  }

  static calculateBMI(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }

  static getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  static calculateBodyFatFromMeasurements(
    measurements: { [key: string]: number },
    gender: 'male' | 'female' = 'male'
  ): number | null {
    // Navy method for body fat calculation
    const { waist, neck, height, hips } = measurements;
    
    if (!waist || !neck || !height) return null;

    let bodyFat: number;

    if (gender === 'male') {
      bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
      if (!hips) return null;
      bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hips - neck) + 0.22100 * Math.log10(height)) - 450;
    }

    return Math.max(0, Math.min(50, bodyFat)); // Clamp between 0-50%
  }

  static getIdealWeightRange(heightCm: number): { min: number; max: number } {
    const heightM = heightCm / 100;
    const minBMI = 18.5;
    const maxBMI = 24.9;
    
    return {
      min: Math.round(minBMI * heightM * heightM),
      max: Math.round(maxBMI * heightM * heightM),
    };
  }

  static formatMeasurementValue(value: number, unit: string): string {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    if (unit === 'kg' || unit === 'lbs') {
      return `${value.toFixed(1)} ${unit}`;
    }
    if (unit === 'cm' || unit === 'in') {
      return `${value.toFixed(0)} ${unit}`;
    }
    return `${value} ${unit}`;
  }

  static convertUnit(value: number, fromUnit: string, toUnit: string): number {
    // Weight conversions
    if (fromUnit === 'kg' && toUnit === 'lbs') {
      return value * 2.20462;
    }
    if (fromUnit === 'lbs' && toUnit === 'kg') {
      return value / 2.20462;
    }
    
    // Length conversions
    if (fromUnit === 'cm' && toUnit === 'in') {
      return value / 2.54;
    }
    if (fromUnit === 'in' && toUnit === 'cm') {
      return value * 2.54;
    }
    
    return value; // No conversion needed
  }

  private static getPeriodDays(period: 'week' | 'month' | 'quarter' | 'year'): number {
    switch (period) {
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'year': return 365;
      default: return 30;
    }
  }

  private static calculateMeasurementStreak(measurements: Measurement[]): number {
    if (measurements.length === 0) return 0;

    const measurementDates = measurements
      .map(m => new Date(m.date).toDateString())
      .filter((date, index, array) => array.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toDateString();
    let currentDate = new Date();

    for (let i = 0; i < measurementDates.length; i++) {
      const measurementDate = measurementDates[i];
      const checkDate = currentDate.toDateString();

      if (measurementDate === checkDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  private static calculateAverageFrequency(measurements: Measurement[]): number {
    if (measurements.length === 0) return 0;

    const sortedMeasurements = measurements.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstDate = new Date(sortedMeasurements[0].date);
    const lastDate = new Date(sortedMeasurements[sortedMeasurements.length - 1].date);
    const daysDiff = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeksSpanned = daysDiff / 7;

    return measurements.length / weeksSpanned;
  }
}
