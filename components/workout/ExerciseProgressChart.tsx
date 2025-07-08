/**
 * ExerciseProgressChart - Previously unused, now integrated into workout progress views
 * Visual chart showing exercise performance over time with trend analysis
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  Calendar,
  Target,
  Award,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

const { width: screenWidth } = Dimensions.get('window');

export interface ExerciseDataPoint {
  date: string;
  weight: number;
  reps: number;
  volume: number; // weight * reps
  oneRepMax?: number;
  sets: number;
}

export interface ExerciseProgressChartProps {
  exerciseName: string;
  data: ExerciseDataPoint[];
  timeRange: '1W' | '1M' | '3M' | '6M' | '1Y';
  onTimeRangeChange: (range: '1W' | '1M' | '3M' | '6M' | '1Y') => void;
  metric: 'weight' | 'volume' | 'oneRepMax';
  onMetricChange: (metric: 'weight' | 'volume' | 'oneRepMax') => void;
  showPersonalRecords?: boolean;
}

export const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({
  exerciseName,
  data,
  timeRange,
  onTimeRangeChange,
  metric,
  onMetricChange,
  showPersonalRecords = true,
}) => {
  const chartWidth = screenWidth - (DesignTokens.spacing[5] * 2);
  const chartHeight = 200;

  // Calculate chart data and statistics
  const chartData = useMemo(() => {
    if (data.length === 0) return { points: [], stats: null };

    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Get values based on selected metric
    const values = sortedData.map(point => {
      switch (metric) {
        case 'weight':
          return point.weight;
        case 'volume':
          return point.volume;
        case 'oneRepMax':
          return point.oneRepMax || 0;
        default:
          return point.weight;
      }
    });

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    // Calculate chart points
    const points = sortedData.map((point, index) => {
      const value = values[index];
      const x = (index / (sortedData.length - 1)) * chartWidth;
      const y = chartHeight - ((value - minValue) / range) * chartHeight;
      
      return {
        x,
        y,
        value,
        date: point.date,
        isPersonalRecord: value === maxValue,
      };
    });

    // Calculate statistics
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const change = lastValue - firstValue;
    const changePercentage = firstValue !== 0 ? (change / firstValue) * 100 : 0;
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';

    const stats = {
      current: lastValue,
      change,
      changePercentage,
      trend,
      min: minValue,
      max: maxValue,
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      personalRecords: sortedData.filter(point => values[sortedData.indexOf(point)] === maxValue).length,
    };

    return { points, stats };
  }, [data, metric, chartWidth, chartHeight]);

  const getMetricLabel = () => {
    switch (metric) {
      case 'weight':
        return 'Max Weight (kg)';
      case 'volume':
        return 'Total Volume (kg)';
      case 'oneRepMax':
        return '1RM Estimate (kg)';
      default:
        return 'Weight (kg)';
    }
  };

  const getMetricUnit = () => {
    switch (metric) {
      case 'weight':
      case 'oneRepMax':
        return 'kg';
      case 'volume':
        return 'kg';
      default:
        return 'kg';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} color={DesignTokens.colors.success[500]} />;
      case 'down':
        return <TrendingDown size={16} color={DesignTokens.colors.error[500]} />;
      default:
        return <Minus size={16} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return DesignTokens.colors.success[500];
      case 'down':
        return DesignTokens.colors.error[500];
      default:
        return DesignTokens.colors.text.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const createSVGPath = (points: typeof chartData.points) => {
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      
      // Create smooth curve using quadratic bezier
      const cpx = (prevPoint.x + currentPoint.x) / 2;
      const cpy = (prevPoint.y + currentPoint.y) / 2;
      
      path += ` Q ${cpx} ${prevPoint.y} ${currentPoint.x} ${currentPoint.y}`;
    }
    
    return path;
  };

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{exerciseName} Progress</Text>
          <BarChart3 size={20} color={DesignTokens.colors.primary[500]} />
        </View>
        
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No data available</Text>
          <Text style={styles.emptyStateSubtext}>
            Complete some workouts to see your progress
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{exerciseName}</Text>
          <Text style={styles.subtitle}>{getMetricLabel()}</Text>
        </View>
        <BarChart3 size={20} color={DesignTokens.colors.primary[500]} />
      </View>

      {/* Statistics */}
      {chartData.stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {chartData.stats.current.toFixed(1)} {getMetricUnit()}
            </Text>
            <Text style={styles.statLabel}>Current</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.trendContainer}>
              {getTrendIcon(chartData.stats.trend)}
              <Text style={[styles.statValue, { color: getTrendColor(chartData.stats.trend) }]}>
                {chartData.stats.changePercentage > 0 ? '+' : ''}{chartData.stats.changePercentage.toFixed(1)}%
              </Text>
            </View>
            <Text style={styles.statLabel}>Change</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {chartData.stats.max.toFixed(1)} {getMetricUnit()}
            </Text>
            <Text style={styles.statLabel}>Best</Text>
          </View>
          
          {showPersonalRecords && (
            <View style={styles.statItem}>
              <View style={styles.prContainer}>
                <Award size={14} color="#FFD700" />
                <Text style={styles.statValue}>{chartData.stats.personalRecords}</Text>
              </View>
              <Text style={styles.statLabel}>PRs</Text>
            </View>
          )}
        </View>
      )}

      {/* Time Range Selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.timeRangeContainer}
      >
        {(['1W', '1M', '3M', '6M', '1Y'] as const).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.activeTimeRangeButton,
            ]}
            onPress={() => onTimeRangeChange(range)}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === range && styles.activeTimeRangeText,
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Metric Selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.metricContainer}
      >
        {(['weight', 'volume', 'oneRepMax'] as const).map((metricOption) => (
          <TouchableOpacity
            key={metricOption}
            style={[
              styles.metricButton,
              metric === metricOption && styles.activeMetricButton,
            ]}
            onPress={() => onMetricChange(metricOption)}
          >
            <Text
              style={[
                styles.metricText,
                metric === metricOption && styles.activeMetricText,
              ]}
            >
              {metricOption === 'weight' ? 'Weight' : 
               metricOption === 'volume' ? 'Volume' : '1RM'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <LinearGradient colors={['#1F2937', '#111827']} style={styles.chartGradient}>
          {/* SVG would go here in a real implementation */}
          <View style={styles.chartPlaceholder}>
            {chartData.points.map((point, index) => (
              <View
                key={index}
                style={[
                  styles.dataPoint,
                  {
                    left: point.x - 4,
                    top: point.y - 4,
                  },
                  point.isPersonalRecord && styles.prDataPoint,
                ]}
              />
            ))}
            
            {/* Connect points with lines */}
            {chartData.points.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = chartData.points[index - 1];
              
              return (
                <View
                  key={`line-${index}`}
                  style={[
                    styles.connectionLine,
                    {
                      left: prevPoint.x,
                      top: prevPoint.y,
                      width: Math.sqrt(
                        Math.pow(point.x - prevPoint.x, 2) + 
                        Math.pow(point.y - prevPoint.y, 2)
                      ),
                      transform: [
                        {
                          rotate: `${Math.atan2(
                            point.y - prevPoint.y,
                            point.x - prevPoint.x
                          )}rad`,
                        },
                      ],
                    },
                  ]}
                />
              );
            })}
          </View>
          
          {/* Y-axis labels */}
          <View style={styles.yAxisLabels}>
            <Text style={styles.axisLabel}>
              {chartData.stats?.max.toFixed(0)}
            </Text>
            <Text style={styles.axisLabel}>
              {chartData.stats?.min.toFixed(0)}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Recent Data Points */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.recentDataContainer}
      >
        {data.slice(-5).map((point, index) => (
          <View key={index} style={styles.recentDataPoint}>
            <Text style={styles.recentDataValue}>
              {point[metric as keyof ExerciseDataPoint] || 0} {getMetricUnit()}
            </Text>
            <Text style={styles.recentDataDate}>
              {formatDate(point.date)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.xl,
    padding: DesignTokens.spacing[5],
    ...DesignTokens.shadow.md,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },

  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },

  subtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing[4],
  },

  statItem: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },

  statLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },

  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },

  prContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },

  timeRangeContainer: {
    marginBottom: DesignTokens.spacing[3],
  },

  timeRangeButton: {
    backgroundColor: DesignTokens.colors.surface.tertiary,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    marginRight: DesignTokens.spacing[2],
  },

  activeTimeRangeButton: {
    backgroundColor: DesignTokens.colors.primary[500],
  },

  timeRangeText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  activeTimeRangeText: {
    color: '#FFFFFF',
  },

  metricContainer: {
    marginBottom: DesignTokens.spacing[4],
  },

  metricButton: {
    backgroundColor: DesignTokens.colors.surface.tertiary,
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    marginRight: DesignTokens.spacing[2],
  },

  activeMetricButton: {
    backgroundColor: DesignTokens.colors.primary[500],
  },

  metricText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  activeMetricText: {
    color: '#FFFFFF',
  },

  chartContainer: {
    height: 200,
    marginBottom: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },

  chartGradient: {
    flex: 1,
    position: 'relative',
  },

  chartPlaceholder: {
    flex: 1,
    position: 'relative',
  },

  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DesignTokens.colors.primary[500],
  },

  prDataPoint: {
    backgroundColor: '#FFD700',
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  connectionLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: DesignTokens.colors.primary[500],
    transformOrigin: '0 50%',
  },

  yAxisLabels: {
    position: 'absolute',
    left: DesignTokens.spacing[2],
    top: DesignTokens.spacing[2],
    bottom: DesignTokens.spacing[2],
    justifyContent: 'space-between',
  },

  axisLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },

  recentDataContainer: {
    marginTop: DesignTokens.spacing[2],
  },

  recentDataPoint: {
    backgroundColor: DesignTokens.colors.surface.tertiary,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    marginRight: DesignTokens.spacing[2],
    alignItems: 'center',
  },

  recentDataValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },

  recentDataDate: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[8],
  },

  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginBottom: DesignTokens.spacing[2],
  },

  emptyStateSubtext: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
});
