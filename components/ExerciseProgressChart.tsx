import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, Minus, Target, Weight, Zap, Clock } from 'lucide-react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

interface DataPoint {
  date: string;
  value: number;
}

interface ExerciseProgressChartProps {
  data: DataPoint[];
  title: string;
  subtitle?: string;
  color: string;
  unit: string;
  chartType?: 'line' | 'bar';
  height?: number;
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;
const CHART_PADDING = 20;

export default function ExerciseProgressChart({
  data,
  title,
  subtitle,
  color,
  unit,
  chartType = 'line',
  height = 200,
}: ExerciseProgressChartProps) {
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;
  const chartHeight = height - 80; // Account for title and labels

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
      case 'up': return <TrendingUp size={16} color="#10b981" />;
      case 'down': return <TrendingDown size={16} color="#ef4444" />;
      case 'stable': return <Minus size={16} color="#6b7280" />;
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

  const handlePointPress = (point: DataPoint) => {
    setSelectedPoint(point);
  };

  const renderChart = () => {
    if (chartType === 'bar') {
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
                stroke="#333"
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

            return (
              <Path
                key={index}
                d={`M ${x} ${y} L ${x + barWidth} ${y} L ${x + barWidth} ${CHART_PADDING + chartHeight} L ${x} ${CHART_PADDING + chartHeight} Z`}
                fill="url(#barGradient)"
                onPress={() => handlePointPress(point)}
              />
            );
          })}
        </Svg>
      );
    }

    // Line chart
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
              stroke="#333"
              strokeWidth="1"
              opacity="0.3"
            />
          );
        })}

        {/* Area fill */}
        <Path
          d={areaPathData}
          fill="url(#chartGradient)"
        />

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
          const isSelected = selectedPoint?.date === point.date;

          return (
            <Circle
              key={index}
              cx={x}
              cy={y}
              r={isSelected ? 8 : 6}
              fill={color}
              stroke="#FFFFFF"
              strokeWidth="2"
              onPress={() => handlePointPress(point)}
            />
          );
        })}
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        
        <View style={styles.trendContainer}>
          {getTrendIcon()}
          <Text style={styles.trendText}>
            {Math.abs(getTrendPercentage()).toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        {renderChart()}
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
            <Text style={styles.selectedDate}>
              {new Date(selectedPoint.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.selectedValue}>
              {formatValue(selectedPoint.value)} {unit}
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Current</Text>
          <Text style={styles.statValue}>
            {formatValue(data[data.length - 1]?.value || 0)} {unit}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Best</Text>
          <Text style={styles.statValue}>
            {formatValue(maxValue)} {unit}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={styles.statValue}>
            {formatValue(data.reduce((sum, d) => sum + d.value, 0) / data.length)} {unit}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  chartContainer: {
    marginBottom: 12,
  },
  svg: {
    overflow: 'visible',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: CHART_PADDING,
    marginBottom: 16,
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    flex: 1,
  },
  hiddenLabel: {
    opacity: 0,
  },
  selectedInfo: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedInfoGradient: {
    padding: 12,
    alignItems: 'center',
  },
  selectedDate: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  selectedValue: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
});
