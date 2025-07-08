import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanGestureHandler,
  State,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import Svg, { Path, Circle, Line, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface InteractiveChartProps {
  data: DataPoint[];
  metric: string;
  color: string;
  height?: number;
  onDataPointPress?: (point: DataPoint) => void;
  showTrend?: boolean;
  chartType?: 'line' | 'bar' | 'area';
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;
const CHART_PADDING = 20;

export function InteractiveChart({
  data,
  metric,
  color,
  height = 200,
  onDataPointPress,
  showTrend = true,
  chartType = 'line',
}: InteractiveChartProps) {
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;
  const chartHeight = height - 60; // Account for labels and padding

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

  const getTrendPercentage = () => {
    if (data.length < 2) return 0;
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    return ((lastValue - firstValue) / firstValue) * 100;
  };

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPointX = (index: number) => {
    return CHART_PADDING + (index / (data.length - 1 || 1)) * (CHART_WIDTH - CHART_PADDING * 2);
  };

  const getPointY = (value: number) => {
    return CHART_PADDING + (1 - (value - minValue) / valueRange) * chartHeight;
  };

  const handlePointPress = (point: DataPoint, index: number) => {
    setSelectedPoint(point);
    setHoveredIndex(index);
    onDataPointPress?.(point);
  };

  const renderLineChart = () => {
    if (data.length < 2) return null;

    const pathData = data.map((point, index) => {
      const x = getPointX(index);
      const y = getPointY(point.value);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const areaPathData = [
      pathData,
      `L ${getPointX(data.length - 1)} ${CHART_PADDING + chartHeight}`,
      `L ${CHART_PADDING} ${CHART_PADDING + chartHeight}`,
      'Z'
    ].join(' ');

    return (
      <Svg width={CHART_WIDTH} height={height} style={styles.svg}>
        <Defs>
          <SvgLinearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = CHART_PADDING + (1 - ratio) * chartHeight;
          return (
            <Line
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

        {/* Area fill */}
        {chartType === 'area' && (
          <Path
            d={areaPathData}
            fill="url(#chartGradient)"
          />
        )}

        {/* Chart line */}
        <Path
          d={pathData}
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((point, index) => {
          const x = getPointX(index);
          const y = getPointY(point.value);
          const isSelected = hoveredIndex === index;
          const isHighlighted = point.label;

          return (
            <Circle
              key={index}
              cx={x}
              cy={y}
              r={isSelected ? 8 : isHighlighted ? 6 : 4}
              fill={color}
              stroke="#FFFFFF"
              strokeWidth="2"
              onPress={() => handlePointPress(point, index)}
            />
          );
        })}
      </Svg>
    );
  };

  const renderBarChart = () => {
    const barWidth = (CHART_WIDTH - CHART_PADDING * 2) / data.length * 0.8;
    const barSpacing = (CHART_WIDTH - CHART_PADDING * 2) / data.length * 0.2;

    return (
      <Svg width={CHART_WIDTH} height={height} style={styles.svg}>
        <Defs>
          <SvgLinearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </SvgLinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = CHART_PADDING + (1 - ratio) * chartHeight;
          return (
            <Line
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

        {/* Bars */}
        {data.map((point, index) => {
          const x = CHART_PADDING + index * (barWidth + barSpacing) + barSpacing / 2;
          const y = getPointY(point.value);
          const barHeight = (CHART_PADDING + chartHeight) - y;
          const isSelected = hoveredIndex === index;

          return (
            <React.Fragment key={index}>
              <Path
                d={`M ${x} ${y} L ${x + barWidth} ${y} L ${x + barWidth} ${CHART_PADDING + chartHeight} L ${x} ${CHART_PADDING + chartHeight} Z`}
                fill={isSelected ? color : "url(#barGradient)"}
                stroke={isSelected ? "#FFFFFF" : "none"}
                strokeWidth={isSelected ? "2" : "0"}
                onPress={() => handlePointPress(point, index)}
              />
            </React.Fragment>
          );
        })}
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chart Header */}
      {showTrend && (
        <View style={styles.header}>
          <View style={styles.trendContainer}>
            {getTrendIcon()}
            <Text style={styles.trendText}>
              {Math.abs(getTrendPercentage()).toFixed(1)}% 
              {getTrendDirection() === 'up' ? ' increase' : getTrendDirection() === 'down' ? ' decrease' : ' stable'}
            </Text>
          </View>
          <Text style={styles.metricLabel}>{metric}</Text>
        </View>
      )}

      {/* Chart */}
      <View style={styles.chartContainer}>
        {chartType === 'bar' ? renderBarChart() : renderLineChart()}
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxisLabels}>
        {data.map((point, index) => {
          // Show labels for first, last, and every few points
          const shouldShowLabel = index === 0 || index === data.length - 1 || index % Math.ceil(data.length / 4) === 0;
          
          return (
            <Text 
              key={index} 
              style={[
                styles.xAxisLabel,
                !shouldShowLabel && styles.hiddenLabel
              ]}
            >
              {shouldShowLabel ? formatDate(point.date) : ''}
            </Text>
          );
        })}
      </View>

      {/* Selected Point Info */}
      {selectedPoint && (
        <View style={styles.selectedInfo}>
          <LinearGradient
            colors={['#1a1a1a', '#2a2a2a']}
            style={styles.selectedInfoGradient}
          >
            <View style={styles.selectedInfoContent}>
              <Text style={styles.selectedDate}>
                {new Date(selectedPoint.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              <Text style={styles.selectedValue}>
                {formatValue(selectedPoint.value)} {metric}
              </Text>
              {selectedPoint.label && (
                <Text style={styles.selectedLabel}>{selectedPoint.label}</Text>
              )}
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Chart Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Min</Text>
          <Text style={styles.statValue}>{formatValue(minValue)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Max</Text>
          <Text style={styles.statValue}>{formatValue(maxValue)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Avg</Text>
          <Text style={styles.statValue}>
            {formatValue(data.reduce((sum, d) => sum + d.value, 0) / data.length)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Latest</Text>
          <Text style={styles.statValue}>{formatValue(data[data.length - 1]?.value || 0)}</Text>
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
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  trendText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  metricLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.tertiary,
    textTransform: 'uppercase',
  },
  chartContainer: {
    marginBottom: DesignTokens.spacing[3],
  },
  svg: {
    overflow: 'visible',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: CHART_PADDING,
    marginBottom: DesignTokens.spacing[3],
  },
  xAxisLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    flex: 1,
  },
  hiddenLabel: {
    opacity: 0,
  },
  selectedInfo: {
    marginBottom: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    overflow: 'hidden',
  },
  selectedInfoGradient: {
    padding: DesignTokens.spacing[3],
  },
  selectedInfoContent: {
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
    justifyContent: 'center',
    height: '100%',
  },
  emptyText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
});
