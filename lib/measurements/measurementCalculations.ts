/**
 * Measurement Calculations - Previously unused, now integrated into measurements system
 * Statistical analysis and trend calculations for body measurements
 */

import { Measurement, MeasurementTrend, MeasurementStats } from '@/types/measurement';

export class MeasurementCalculations {
  /**
   * Calculate trend for a specific measurement type
   */
  static calculateTrend(
    measurements: Measurement[],
    measurementType: string,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): MeasurementTrend | null {
    const typeMeasurements = measurements
      .filter(m => m.type === measurementType)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (typeMeasurements.length < 2) {
      return null;
    }

    const now = new Date();
    const periodDays = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365,
    }[period];

    const cutoffDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const recentMeasurements = typeMeasurements.filter(m => new Date(m.date) >= cutoffDate);

    if (recentMeasurements.length < 2) {
      return null;
    }

    const current = recentMeasurements[recentMeasurements.length - 1].value;
    const previous = recentMeasurements[0].value;
    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 2) {
      trend = changePercent > 0 ? 'up' : 'down';
    }

    return {
      measurementType,
      period,
      trend,
      current,
      previous,
      change,
      changePercent,
      dataPoints: recentMeasurements.length,
    };
  }

  /**
   * Calculate all trends for measurements
   */
  static calculateAllTrends(
    measurements: Measurement[],
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): MeasurementTrend[] {
    const measurementTypes = [...new Set(measurements.map(m => m.type))];
    
    return measurementTypes
      .map(type => this.calculateTrend(measurements, type, period))
      .filter(Boolean) as MeasurementTrend[];
  }

  /**
   * Get progress data for charting
   */
  static getProgressData(
    measurements: Measurement[],
    measurementType: string,
    timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Array<{ date: string; value: number; label?: string }> {
    const typeMeasurements = measurements
      .filter(m => m.type === measurementType)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const now = new Date();
    const timeframeDays = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365,
    }[timeframe];

    const cutoffDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);
    const filteredMeasurements = typeMeasurements.filter(m => new Date(m.date) >= cutoffDate);

    return filteredMeasurements.map(measurement => ({
      date: measurement.date,
      value: measurement.value,
      label: this.formatMeasurementValue(measurement.value, measurement.unit),
    }));
  }

  /**
   * Calculate statistics for all measurements
   */
  static calculateStats(measurements: Measurement[]): MeasurementStats {
    if (measurements.length === 0) {
      return {
        totalMeasurements: 0,
        measurementTypes: 0,
        streakDays: 0,
        mostTrackedType: '',
        averageFrequency: 0,
      };
    }

    const measurementTypes = new Set(measurements.map(m => m.type));
    const typeFrequency = new Map<string, number>();

    measurements.forEach(m => {
      typeFrequency.set(m.type, (typeFrequency.get(m.type) || 0) + 1);
    });

    const mostTrackedType = Array.from(typeFrequency.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Calculate streak days
    const streakDays = this.calculateStreakDays(measurements);

    // Calculate average frequency (measurements per week)
    const oldestDate = new Date(Math.min(...measurements.map(m => new Date(m.date).getTime())));
    const daysSinceStart = Math.max(1, (Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
    const averageFrequency = (measurements.length / daysSinceStart) * 7;

    return {
      totalMeasurements: measurements.length,
      measurementTypes: measurementTypes.size,
      streakDays,
      mostTrackedType,
      averageFrequency,
    };
  }

  /**
   * Calculate measurement streak days
   */
  private static calculateStreakDays(measurements: Measurement[]): number {
    if (measurements.length === 0) return 0;

    const sortedDates = [...new Set(measurements.map(m => m.date.split('T')[0]))]
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const dateStr of sortedDates) {
      const measurementDate = new Date(dateStr);
      measurementDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate.getTime() - measurementDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate = measurementDate;
      } else if (daysDiff === streak + 1) {
        // Allow for one day gap
        streak += 2;
        currentDate = measurementDate;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calculate BMI if height and weight are available
   */
  static calculateBMI(measurements: Measurement[]): number | null {
    const weightMeasurement = measurements
      .filter(m => m.type === 'body_weight')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const heightMeasurement = measurements
      .filter(m => m.type === 'height')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!weightMeasurement || !heightMeasurement) {
      return null;
    }

    const weightKg = weightMeasurement.value;
    const heightM = heightMeasurement.value / 100; // Convert cm to m

    return weightKg / (heightM * heightM);
  }

  /**
   * Calculate body fat percentage using Navy method (if measurements available)
   */
  static calculateBodyFatNavy(
    measurements: Measurement[],
    gender: 'male' | 'female'
  ): number | null {
    const getLatestMeasurement = (type: string) => 
      measurements
        .filter(m => m.type === type)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const height = getLatestMeasurement('height')?.value;
    const waist = getLatestMeasurement('waist')?.value;
    const neck = getLatestMeasurement('neck')?.value;

    if (!height || !waist || !neck) {
      return null;
    }

    if (gender === 'male') {
      return 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
      const hips = getLatestMeasurement('hips')?.value;
      if (!hips) return null;
      
      return 495 / (1.29579 - 0.35004 * Math.log10(waist + hips - neck) + 0.22100 * Math.log10(height)) - 450;
    }
  }

  /**
   * Detect measurement anomalies
   */
  static detectAnomalies(
    measurements: Measurement[],
    measurementType: string,
    threshold: number = 2
  ): Measurement[] {
    const typeMeasurements = measurements
      .filter(m => m.type === measurementType)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (typeMeasurements.length < 3) {
      return [];
    }

    const values = typeMeasurements.map(m => m.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    return typeMeasurements.filter(measurement => 
      Math.abs(measurement.value - mean) > threshold * standardDeviation
    );
  }

  /**
   * Smooth measurement data using moving average
   */
  static smoothMeasurements(
    measurements: Measurement[],
    measurementType: string,
    windowSize: number = 3
  ): Array<{ date: string; value: number; originalValue: number }> {
    const typeMeasurements = measurements
      .filter(m => m.type === measurementType)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (typeMeasurements.length < windowSize) {
      return typeMeasurements.map(m => ({
        date: m.date,
        value: m.value,
        originalValue: m.value,
      }));
    }

    const smoothed: Array<{ date: string; value: number; originalValue: number }> = [];

    for (let i = 0; i < typeMeasurements.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(typeMeasurements.length, start + windowSize);
      const window = typeMeasurements.slice(start, end);
      
      const averageValue = window.reduce((sum, m) => sum + m.value, 0) / window.length;
      
      smoothed.push({
        date: typeMeasurements[i].date,
        value: averageValue,
        originalValue: typeMeasurements[i].value,
      });
    }

    return smoothed;
  }

  /**
   * Calculate correlation between two measurement types
   */
  static calculateCorrelation(
    measurements: Measurement[],
    type1: string,
    type2: string
  ): number | null {
    const measurements1 = measurements.filter(m => m.type === type1);
    const measurements2 = measurements.filter(m => m.type === type2);

    if (measurements1.length < 3 || measurements2.length < 3) {
      return null;
    }

    // Find overlapping dates
    const dates1 = new Set(measurements1.map(m => m.date.split('T')[0]));
    const dates2 = new Set(measurements2.map(m => m.date.split('T')[0]));
    const commonDates = [...dates1].filter(date => dates2.has(date));

    if (commonDates.length < 3) {
      return null;
    }

    const pairs: Array<[number, number]> = [];
    
    commonDates.forEach(date => {
      const m1 = measurements1.find(m => m.date.split('T')[0] === date);
      const m2 = measurements2.find(m => m.date.split('T')[0] === date);
      
      if (m1 && m2) {
        pairs.push([m1.value, m2.value]);
      }
    });

    if (pairs.length < 3) {
      return null;
    }

    // Calculate Pearson correlation coefficient
    const n = pairs.length;
    const sum1 = pairs.reduce((sum, [x]) => sum + x, 0);
    const sum2 = pairs.reduce((sum, [, y]) => sum + y, 0);
    const sum1Sq = pairs.reduce((sum, [x]) => sum + x * x, 0);
    const sum2Sq = pairs.reduce((sum, [, y]) => sum + y * y, 0);
    const sumProducts = pairs.reduce((sum, [x, y]) => sum + x * y, 0);

    const numerator = n * sumProducts - sum1 * sum2;
    const denominator = Math.sqrt((n * sum1Sq - sum1 * sum1) * (n * sum2Sq - sum2 * sum2));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Format measurement value for display
   */
  static formatMeasurementValue(value: number, unit: string): string {
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
   * Generate measurement insights
   */
  static generateInsights(measurements: Measurement[]): Array<{
    type: 'trend' | 'milestone' | 'correlation' | 'anomaly';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const insights: Array<{
      type: 'trend' | 'milestone' | 'correlation' | 'anomaly';
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
    }> = [];

    if (measurements.length < 5) {
      return insights;
    }

    // Analyze trends
    const trends = this.calculateAllTrends(measurements, 'month');
    
    trends.forEach(trend => {
      if (Math.abs(trend.changePercent) > 10) {
        const direction = trend.trend === 'up' ? 'increased' : 'decreased';
        insights.push({
          type: 'trend',
          title: `${trend.measurementType} ${direction}`,
          description: `Your ${trend.measurementType} has ${direction} by ${Math.abs(trend.changePercent).toFixed(1)}% this month.`,
          priority: Math.abs(trend.changePercent) > 20 ? 'high' : 'medium',
        });
      }
    });

    // Check for milestones
    const measurementTypes = [...new Set(measurements.map(m => m.type))];
    
    measurementTypes.forEach(type => {
      const typeMeasurements = measurements
        .filter(m => m.type === type)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      if (typeMeasurements.length >= 10) {
        insights.push({
          type: 'milestone',
          title: `${type} milestone reached`,
          description: `You've recorded ${typeMeasurements.length} ${type} measurements!`,
          priority: 'low',
        });
      }
    });

    // Detect anomalies
    measurementTypes.forEach(type => {
      const anomalies = this.detectAnomalies(measurements, type);
      if (anomalies.length > 0) {
        insights.push({
          type: 'anomaly',
          title: `Unusual ${type} readings`,
          description: `${anomalies.length} unusual ${type} measurement(s) detected.`,
          priority: 'medium',
        });
      }
    });

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
}
