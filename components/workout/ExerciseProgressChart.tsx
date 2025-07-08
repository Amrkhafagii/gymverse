import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, Minus, Weight, Target, Zap } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface ExerciseProgressChartProps {
  exerciseName: string;
  data: DataPoint[];
  metric: 'weight' | 'volume' | 'reps' | 'duration';
  timeframe: 'week' | 'month' | 'year';
  onTimeframeChange: (timeframe: 'week' | 'month' | 'year') => void;
  height?: number;
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;
const CHART_PADDING = 20;

export function ExerciseProgressChart({
  exerciseName,
  data,
  metric,
  timeframe,
  onTimeframeChange,
  height = 200,
}: ExerciseProgressChartProps) {
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{exerciseName} Progress</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;

  const getMetricIcon = () => {
    switch (metric) {
      case 'weight': return <Weight size={16} color={DesignTokens.colors.primary[500]} />;
      case 'volume': return <Zap size={16} color={DesignTokens.colors.primary[500]} />;
      case 'reps': return <Target size={16} color={DesignTokens.colors.primary[500]} />;
      case 'duration': return <TrendingUp size={16} color={DesignTokens.colors.primary[500]} />;
    }
  };

  const getMetricUnit = () => {
    switch (metric) {
      case 'weight': return 'kg';
      case 'volume': return 'kg';
      case 'reps': return 'reps';
      case 'duration': return 'min';
    }
  };

  const getTrendDirection = () => {
    if (data.length < 2) return 'stable';
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const change = ((lastValue - firstValue) / firstValue) * 100;
    
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  };

  const getTrendIcon = () => {
    const trend = getTrendDirection();
    switch (trend) {
      case 'up': return <TrendingUp size={16} color={DesignTokens.colors.success[500]} />;
      case 'down': return <TrendingDown size={16} color={DesignTokens.colors.error[500]} />;
      case 'stable': return <Minus size={16} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const getTrendColor = () => {
    const trend = getTrendDirection();
    switch (trend) {
      case 'up': return DesignTokens.colors.success[500];
      case 'down': return DesignTokens.colors.error[500];
      case 'stable': return DesignTokens.colors.text.secondary;
    }
  };

  const calculateTrendPercentage = () => {
    if (data.length < 2) return 0;
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    return ((lastValue - firstValue) / firstValue) * 100;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (timeframe === 'week') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (timeframe === 'month') {
      return date.toLocaleDateString('en-US', { month: 'short' });
    } else {
      return date.getFullYear().toString();
    }
  };

  const renderChart = () => {
    const chartHeight = height - 60; // Account for labels
    const pointWidth = (CHART_WIDTH - CHART_PADDING * 2) / (data.length - 1 || 1);

    return (
      <View style={[styles.chartContainer, { height }]}>
        <svg width={CHART_WIDTH} height={height} style={styles.svg}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = CHART_PADDING + (1 - ratio) * chartHeight;
            return (
              <line
                key={index}
                x1={CHART_PADDING}
                y1={y}
                x2={CHART_WIDTH - CHART_PADDING}
                y2={y}
                stroke={DesignTokens.colors.neutral[800]}
                strokeWidth="1"
                opacity="0.3"
              />
            );
          })}

          {/* Chart line */}
          {data.length > 1 && (
            <path
              d={data.map((point, index) => {
                const x = CHART_PADDING + index * pointWidth;
                const y = CHART_PADDING + (1 - (point.value - minValue) / valueRange) * chartHeight;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke={DesignTokens.colors.primary[500]}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Gradient fill */}
          {data.length > 1 && (
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={DesignTokens.colors.primary[500]} stopOpacity="0.3" />
                <stop offset="100%" stopColor={DesignTokens.colors.primary[500]} stopOpacity="0" />
              </linearGradient>
            </defs>
          )}

          {data.length > 1 && (
            <path
              d={[
                ...data.map((point, index) => {
                  const x = CHART_PADDING + index * pointWidth;
                  const y = CHART_PADDING + (1 - (point.value - minValue) / valueRange) * chartHeight;
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                }),
                `L ${CHART_WIDTH - CHART_PADDING} ${CHART_PADDING + chartHeight}`,
                `L ${CHART_PADDING} ${CHART_PADDING + chartHeight}`,
                'Z'
              ].join(' ')}
              fill="url(#chartGradient)"
            />
          )}

          {/* Data points */}
          {data.map((point, index) => {
            const x = CHART_PADDING + index * pointWidth;
            const y = CHART_PADDING + (1 - (point.value - minValue) / valueRange) * chartHeight;
            const isSelected = selectedPoint?.date === point.date;

            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 8 : 6}
                  fill={DesignTokens.colors.primary[500]}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  onPress={() => setSelectedPoint(point)}
                />
                {point.label && (
                  <circle
                    cx={x}
                    cy={y}
                    r={12}
                    fill="none"
                    stroke={DesignTokens.colors.warning[500]}
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <View style={styles.xAxisLabels}>
          {data.map((point, index) => (
            <Text key={index} style={styles.xAxisLabel}>
              {formatDate(point.date)}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {getMetricIcon()}
          <Text style={styles.title}>{exerciseName}</Text>
        </View>
        
        <View style={styles.trendContainer}>
          {getTrendIcon()}
          <Text style={[styles.trendText, { color: getTrendColor() }]}>
            {Math.abs(calculateTrendPercentage()).toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Timeframe Selector */}
      <View style={styles.timeframeSelector}>
        {(['week', 'month', 'year'] as const).map((tf) => (
          <TouchableOpacity
            key={tf}
            style={[
              styles.timeframeButton,
              timeframe === tf && styles.timeframeButtonActive
            ]}
            onPress={() => onTimeframeChange(tf)}
          >
            <Text style={[
              styles.timeframeText,
              timeframe === tf && styles.timeframeTextActive
            ]}>
              {tf.charAt(0).toUpperCase() + tf.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      {renderChart()}

      {/* Selected Point Info */}
      {selectedPoint && (
        <View style={styles.selectedInfo}>
          <LinearGradient
            colors={['#1a1a1a', '#2a2a2a']}
            style={styles.selectedInfoGradient}
          >
            <Text style={styles.selectedDate}>
              {new Date(selectedPoint.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.selectedValue}>
              {selectedPoint.value.toFixed(1)} {getMetricUnit()}
            </Text>
            {selectedPoint.label && (
              <Text style={styles.selectedLabel}>{selectedPoint.label}</Text>
            )}
          </LinearGradient>
        </View>
      )}

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Current</Text>
          <Text style={styles.statValue}>
            {data[data.length - 1]?.value.toFixed(1)} {getMetricUnit()}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Best</Text>
          <Text style={styles.statValue}>
            {maxValue.toFixed(1)} {getMetricUnit()}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={styles.statValue}>
            {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)} {getMetricUnit()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[4],
    ...DesignTokens.shadow.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  trendText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.colors.surface.tertiary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[4],
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: DesignTokens.spacing[2],
    alignItems: 'center',
    borderRadius: DesignTokens.borderRadius.sm,
  },
  timeframeButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  timeframeText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  timeframeTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  chartContainer: {
    marginBottom: DesignTokens.spacing[4],
  },
  svg: {
    overflow: 'visible',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: CHART_PADDING,
    marginTop: DesignTokens.spacing[2],
  },
  xAxisLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  selectedInfo: {
    marginBottom: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.md,
    overflow: 'hidden',
  },
  selectedInfoGradient: {
    padding: DesignTokens.spacing[3],
    alignItems: 'center',
  },
  selectedDate: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  selectedValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  selectedLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    marginTop: DesignTokens.spacing[1],
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: DesignTokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: DesignTokens.spacing[1],
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[8],
  },
  emptyText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
});
