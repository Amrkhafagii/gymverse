/**
 * Chart Data Processing - Previously unused, now integrated into analytics
 * Data transformation and trend analysis utilities for charts and insights
 */

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface TrendData {
  trend: 'up' | 'down' | 'stable';
  current: number;
  previous: number;
  changePercent: number;
}

export interface AnalyticsInsight {
  type: 'improvement' | 'decline' | 'milestone' | 'plateau' | 'recommendation';
  title: string;
  description: string;
  value?: string | number;
  recommendation?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface ProcessedChartData {
  points: ChartDataPoint[];
  trend: TrendData;
  insights: AnalyticsInsight[];
  summary: {
    min: number;
    max: number;
    average: number;
    total: number;
  };
}

/**
 * Process raw workout data into chart-ready format
 */
export function processWorkoutDataForChart(
  workouts: any[],
  metric: 'volume' | 'frequency' | 'duration',
  timeframe: 'week' | 'month' | 'year'
): ProcessedChartData {
  if (workouts.length === 0) {
    return {
      points: [],
      trend: { trend: 'stable', current: 0, previous: 0, changePercent: 0 },
      insights: [],
      summary: { min: 0, max: 0, average: 0, total: 0 },
    };
  }

  // Group workouts by time period
  const groupedData = groupWorkoutsByTimeframe(workouts, timeframe);
  
  // Convert to chart points
  const points = convertToChartPoints(groupedData, metric);
  
  // Calculate trend
  const trend = calculateTrend(points);
  
  // Generate insights
  const insights = generateInsights(points, trend, metric);
  
  // Calculate summary statistics
  const values = points.map(p => p.value);
  const summary = {
    min: Math.min(...values),
    max: Math.max(...values),
    average: values.reduce((sum, val) => sum + val, 0) / values.length,
    total: values.reduce((sum, val) => sum + val, 0),
  };

  return { points, trend, insights, summary };
}

/**
 * Group workouts by timeframe
 */
function groupWorkoutsByTimeframe(
  workouts: any[],
  timeframe: 'week' | 'month' | 'year'
): Map<string, any[]> {
  const grouped = new Map<string, any[]>();

  workouts.forEach(workout => {
    const date = new Date(workout.created_at);
    let key: string;

    switch (timeframe) {
      case 'week':
        // Group by day
        key = date.toISOString().split('T')[0];
        break;
      case 'month':
        // Group by week
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'year':
        // Group by month
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(workout);
  });

  return grouped;
}

/**
 * Convert grouped data to chart points
 */
function convertToChartPoints(
  groupedData: Map<string, any[]>,
  metric: 'volume' | 'frequency' | 'duration'
): ChartDataPoint[] {
  const points: ChartDataPoint[] = [];

  for (const [date, workouts] of groupedData.entries()) {
    let value = 0;
    let label = '';

    switch (metric) {
      case 'volume':
        value = calculateTotalVolume(workouts);
        label = `${value.toFixed(0)}kg`;
        break;
      case 'frequency':
        value = workouts.length;
        label = `${value} workout${value !== 1 ? 's' : ''}`;
        break;
      case 'duration':
        value = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / workouts.length;
        label = `${Math.round(value)}min`;
        break;
    }

    points.push({
      date,
      value,
      label,
      metadata: { workoutCount: workouts.length },
    });
  }

  return points.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate total volume for workouts
 */
function calculateTotalVolume(workouts: any[]): number {
  let totalVolume = 0;

  workouts.forEach(workout => {
    workout.exercises?.forEach((exercise: any) => {
      exercise.sets?.forEach((set: any) => {
        if (set.actual_weight_kg && set.actual_reps) {
          totalVolume += set.actual_weight_kg * set.actual_reps;
        }
      });
    });
  });

  return totalVolume;
}

/**
 * Calculate trend from chart points
 */
function calculateTrend(points: ChartDataPoint[]): TrendData {
  if (points.length < 2) {
    return { trend: 'stable', current: 0, previous: 0, changePercent: 0 };
  }

  // Use last 3 points for current, previous 3 for comparison
  const recentPoints = points.slice(-3);
  const previousPoints = points.slice(-6, -3);

  if (previousPoints.length === 0) {
    return { trend: 'stable', current: 0, previous: 0, changePercent: 0 };
  }

  const current = recentPoints.reduce((sum, p) => sum + p.value, 0) / recentPoints.length;
  const previous = previousPoints.reduce((sum, p) => sum + p.value, 0) / previousPoints.length;

  const changePercent = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (changePercent > 5) trend = 'up';
  else if (changePercent < -5) trend = 'down';

  return { trend, current, previous, changePercent };
}

/**
 * Generate insights from data and trends
 */
function generateInsights(
  points: ChartDataPoint[],
  trend: TrendData,
  metric: 'volume' | 'frequency' | 'duration'
): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];

  if (points.length < 3) {
    insights.push({
      type: 'recommendation',
      title: 'Need More Data',
      description: 'Complete more workouts to unlock detailed insights and trends.',
      recommendation: 'Aim for at least 3 workouts to see meaningful analytics.',
      priority: 'medium',
    });
    return insights;
  }

  // Trend-based insights
  if (trend.trend === 'up' && Math.abs(trend.changePercent) > 15) {
    insights.push({
      type: 'improvement',
      title: `${metric.charAt(0).toUpperCase() + metric.slice(1)} Increasing`,
      description: `Your ${metric} has increased by ${trend.changePercent.toFixed(1)}% recently.`,
      value: `+${trend.changePercent.toFixed(1)}%`,
      recommendation: getImprovementRecommendation(metric),
      priority: 'high',
    });
  } else if (trend.trend === 'down' && Math.abs(trend.changePercent) > 15) {
    insights.push({
      type: 'decline',
      title: `${metric.charAt(0).toUpperCase() + metric.slice(1)} Declining`,
      description: `Your ${metric} has decreased by ${Math.abs(trend.changePercent).toFixed(1)}% recently.`,
      recommendation: getDeclineRecommendation(metric),
      priority: 'high',
    });
  }

  // Consistency insights
  const values = points.map(p => p.value);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = (standardDeviation / average) * 100;

  if (coefficientOfVariation < 20) {
    insights.push({
      type: 'milestone',
      title: 'Excellent Consistency',
      description: `Your ${metric} shows great consistency with low variation.`,
      value: `${coefficientOfVariation.toFixed(1)}% variation`,
      recommendation: 'Keep up the consistent training pattern!',
      priority: 'medium',
    });
  } else if (coefficientOfVariation > 50) {
    insights.push({
      type: 'plateau',
      title: 'High Variation',
      description: `Your ${metric} varies significantly between sessions.`,
      recommendation: 'Consider establishing a more structured routine.',
      priority: 'medium',
    });
  }

  // Milestone insights
  const maxValue = Math.max(...values);
  const recentMax = Math.max(...points.slice(-5).map(p => p.value));
  
  if (recentMax === maxValue && points.length > 5) {
    insights.push({
      type: 'milestone',
      title: 'New Personal Best!',
      description: `You've achieved a new high in ${metric}!`,
      value: maxValue.toString(),
      recommendation: 'Celebrate this achievement and maintain the momentum!',
      priority: 'high',
    });
  }

  return insights;
}

/**
 * Get improvement recommendations based on metric
 */
function getImprovementRecommendation(metric: 'volume' | 'frequency' | 'duration'): string {
  switch (metric) {
    case 'volume':
      return 'Great progress! Ensure adequate rest and nutrition to support recovery.';
    case 'frequency':
      return 'Excellent consistency! Monitor recovery and consider periodization.';
    case 'duration':
      return 'Good endurance improvement! Balance with intensity for optimal results.';
    default:
      return 'Keep up the great work!';
  }
}

/**
 * Get decline recommendations based on metric
 */
function getDeclineRecommendation(metric: 'volume' | 'frequency' | 'duration'): string {
  switch (metric) {
    case 'volume':
      return 'Consider reviewing your program or addressing any recovery issues.';
    case 'frequency':
      return 'Try to maintain consistency. Consider scheduling workouts in advance.';
    case 'duration':
      return 'Focus on workout efficiency or address any time constraints.';
    default:
      return 'Review your training approach and make necessary adjustments.';
  }
}

/**
 * Smooth data points using moving average
 */
export function smoothDataPoints(points: ChartDataPoint[], windowSize: number = 3): ChartDataPoint[] {
  if (points.length < windowSize) return points;

  const smoothed: ChartDataPoint[] = [];

  for (let i = 0; i < points.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(points.length, start + windowSize);
    const window = points.slice(start, end);
    
    const averageValue = window.reduce((sum, p) => sum + p.value, 0) / window.length;
    
    smoothed.push({
      ...points[i],
      value: averageValue,
    });
  }

  return smoothed;
}

/**
 * Detect anomalies in data points
 */
export function detectAnomalies(points: ChartDataPoint[], threshold: number = 2): ChartDataPoint[] {
  if (points.length < 3) return [];

  const values = points.map(p => p.value);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);

  return points.filter(point => 
    Math.abs(point.value - mean) > threshold * standardDeviation
  );
}
