import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryScatter, VictoryTooltip } from 'victory-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '@/design-system/tokens';
import { TrendingUp, TrendingDown, Minus, BarChart3, Target, Calendar } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - (DesignTokens.spacing[5] * 2);

interface ExerciseProgressData {
  date: string;
  weight: number;
  reps: number;
  volume: number;
  sets: number;
}

interface ExerciseProgressChartProps {
  exerciseName: string;
  data: ExerciseProgressData[];
  metric: 'weight' | 'reps' | 'volume' | 'sets';
  timeframe: 'week' | 'month' | 'year';
  onMetricChange?: (metric: 'weight' | 'reps' | 'volume' | 'sets') => void;
  onTimeframeChange?: (timeframe: 'week' | 'month' | 'year') => void;
}

export function ExerciseProgressChart({
  exerciseName,
  data,
  metric,
  timeframe,
  onMetricChange,
  onTimeframeChange,
}: ExerciseProgressChartProps) {
  const [selectedPoint, setSelectedPoint] = useState<ExerciseProgressData | null>(null);

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{exerciseName} Progress</Text>
        </View>
        <View style={styles.emptyState}>
          <BarChart3 size={48} color={DesignTokens.colors.text.tertiary} />
          <Text style={styles.emptyStateText}>No progress data available</Text>
          <Text style={styles.emptyStateSubtext}>
            Complete workouts with {exerciseName} to see your progress
          </Text>
        </View>
      </View>
    );
  }

  // Prepare chart data
  const chartData = data.map((point, index) => ({
    x: index + 1,
    y: point[metric],
    label: getMetricLabel(point[metric], metric),
    date: point.date,
    originalData: point,
  }));

  // Calculate trend
  const calculateTrend = () => {
    if (chartData.length < 2) return { trend: 'stable', change: 0 };
    
    const recent = chartData.slice(-3);
    const previous = chartData.slice(-6, -3);
    
    if (previous.length === 0) return { trend: 'stable', change: 0 };
    
    const recentAvg = recent.reduce((sum, p) => sum + p.y, 0) / recent.length;
    const previousAvg = previous.reduce((sum, p) => sum + p.y, 0) / previous.length;
    
    const change = previousAvg !== 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (change > 5) trend = 'up';
    else if (change < -5) trend = 'down';
    
    return { trend, change };
  };

  const trendData = calculateTrend();

  const getTrendIcon = () => {
    switch (trendData.trend) {
      case 'up':
        return <TrendingUp size={16} color={DesignTokens.colors.success[500]} />;
      case 'down':
        return <TrendingDown size={16} color={DesignTokens.colors.error[500]} />;
      default:
        return <Minus size={16} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const getTrendColor = () => {
    switch (trendData.trend) {
      case 'up':
        return DesignTokens.colors.success[500];
      case 'down':
        return DesignTokens.colors.error[500];
      default:
        return DesignTokens.colors.text.secondary;
    }
  };

  const getMetricColor = () => {
    switch (metric) {
      case 'weight':
        return DesignTokens.colors.primary[500];
      case 'reps':
        return DesignTokens.colors.success[500];
      case 'volume':
        return DesignTokens.colors.warning[500];
      case 'sets':
        return DesignTokens.colors.info[500];
      default:
        return DesignTokens.colors.primary[500];
    }
  };

  function getMetricLabel(value: number, metricType: string): string {
    switch (metricType) {
      case 'weight':
        return `${value}kg`;
      case 'reps':
        return `${value}`;
      case 'volume':
        return `${value}kg`;
      case 'sets':
        return `${value}`;
      default:
        return `${value}`;
    }
  }

  const MetricButton = ({ metricType, label }: { metricType: 'weight' | 'reps' | 'volume' | 'sets'; label: string }) => (
    <TouchableOpacity
      style={[
        styles.metricButton,
        metric === metricType && styles.metricButtonActive
      ]}
      onPress={() => onMetricChange?.(metricType)}
    >
      <Text style={[
        styles.metricButtonText,
        metric === metricType && styles.metricButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const TimeframeButton = ({ timeframeType, label }: { timeframeType: 'week' | 'month' | 'year'; label: string }) => (
    <TouchableOpacity
      style={[
        styles.timeframeButton,
        timeframe === timeframeType && styles.timeframeButtonActive
      ]}
      onPress={() => onTimeframeChange?.(timeframeType)}
    >
      <Text style={[
        styles.timeframeButtonText,
        timeframe === timeframeType && styles.timeframeButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{exerciseName}</Text>
          <Text style={styles.subtitle}>Progress Tracking</Text>
        </View>
        
        <View style={styles.trendContainer}>
          <View style={styles.trendIndicator}>
            {getTrendIcon()}
            <Text style={[styles.trendValue, { color: getTrendColor() }]}>
              {trendData.change > 0 ? '+' : ''}{trendData.change.toFixed(1)}%
            </Text>
          </View>
          <Text style={styles.trendLabel}>vs previous period</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Metric</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.metricContainer}>
              <MetricButton metricType="weight" label="Weight" />
              <MetricButton metricType="reps" label="Reps" />
              <MetricButton metricType="volume" label="Volume" />
              <MetricButton metricType="sets" label="Sets" />
            </View>
          </ScrollView>
        </View>

        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Timeframe</Text>
          <View style={styles.timeframeContainer}>
            <TimeframeButton timeframeType="week" label="Week" />
            <TimeframeButton timeframeType="month" label="Month" />
            <TimeframeButton timeframeType="year" label="Year" />
          </View>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <VictoryChart
          width={chartWidth}
          height={200}
          padding={{ left: 60, top: 20, right: 40, bottom: 40 }}
        >
          <VictoryAxis dependentAxis tickFormat={(t) => getMetricLabel(t, metric)} />
          <VictoryAxis tickFormat={() => ''} />
          
          <VictoryArea
            data={chartData}
            style={{
              data: { 
                fill: getMetricColor(), 
                fillOpacity: 0.2,
                stroke: getMetricColor(),
                strokeWidth: 3,
              },
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 }
            }}
          />
          
          <VictoryScatter
            data={chartData}
            style={{ data: { fill: getMetricColor() } }}
            size={5}
            labelComponent={<VictoryTooltip />}
            events={[{
              target: "data",
              eventHandlers: {
                onPress: () => {
                  return [{
                    target: "data",
                    mutation: (props) => {
                      const point = chartData[props.index];
                      setSelectedPoint(point.originalData);
                      return null;
                    }
                  }];
                }
              }
            }]}
          />
        </VictoryChart>
      </View>

      {/* Selected Point Info */}
      {selectedPoint && (
        <View style={styles.selectedPointContainer}>
          <View style={styles.selectedPointHeader}>
            <Text style={styles.selectedPointDate}>
              {new Date(selectedPoint.date).toLocaleDateString()}
            </Text>
            <TouchableOpacity onPress={() => setSelectedPoint(null)}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.selectedPointStats}>
            <View style={styles.selectedPointStat}>
              <Text style={styles.selectedPointStatLabel}>Weight</Text>
              <Text style={styles.selectedPointStatValue}>{selectedPoint.weight}kg</Text>
            </View>
            <View style={styles.selectedPointStat}>
              <Text style={styles.selectedPointStatLabel}>Reps</Text>
              <Text style={styles.selectedPointStatValue}>{selectedPoint.reps}</Text>
            </View>
            <View style={styles.selectedPointStat}>
              <Text style={styles.selectedPointStatLabel}>Volume</Text>
              <Text style={styles.selectedPointStatValue}>{selectedPoint.volume}kg</Text>
            </View>
            <View style={styles.selectedPointStat}>
              <Text style={styles.selectedPointStatLabel}>Sets</Text>
              <Text style={styles.selectedPointStatValue}>{selectedPoint.sets}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Target size={20} color={DesignTokens.colors.primary[500]} />
            <Text style={styles.summaryValue}>
              {Math.max(...data.map(d => d[metric]))}
            </Text>
            <Text style={styles.summaryLabel}>Best {metric}</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Calendar size={20} color={DesignTokens.colors.success[500]} />
            <Text style={styles.summaryValue}>{data.length}</Text>
            <Text style={styles.summaryLabel}>Sessions</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <BarChart3 size={20} color={DesignTokens.colors.warning[500]} />
            <Text style={styles.summaryValue}>
              {(data.reduce((sum, d) => sum + d[metric], 0) / data.length).toFixed(1)}
            </Text>
            <Text style={styles.summaryLabel}>Average</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.lg,
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: DesignTokens.spacing[4],
    paddingBottom: DesignTokens.spacing[2],
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  subtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  trendContainer: {
    alignItems: 'flex-end',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[1],
  },
  trendValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  trendLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  controlsContainer: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingBottom: DesignTokens.spacing[2],
  },
  controlGroup: {
    marginBottom: DesignTokens.spacing[3],
  },
  controlLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },
  metricContainer: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
    paddingRight: DesignTokens.spacing[4],
  },
  metricButton: {
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.secondary,
  },
  metricButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  metricButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  metricButtonTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  timeframeContainer: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  timeframeButton: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.secondary,
  },
  timeframeButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  timeframeButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  timeframeButtonTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  chartContainer: {
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[2],
  },
  selectedPointContainer: {
    margin: DesignTokens.spacing[4],
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
  },
  selectedPointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  selectedPointDate: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  closeButton: {
    fontSize: 24,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  selectedPointStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectedPointStat: {
    alignItems: 'center',
  },
  selectedPointStatLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  selectedPointStatValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  summaryContainer: {
    padding: DesignTokens.spacing[4],
    paddingTop: DesignTokens.spacing[2],
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[1],
  },
  summaryLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[12],
    paddingHorizontal: DesignTokens.spacing[5],
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginTop: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[2],
  },
  emptyStateSubtext: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
