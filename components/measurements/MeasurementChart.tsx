import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import Svg, { 
  Path, 
  Circle, 
  Line, 
  Text as SvgText,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { DesignTokens } from '@/design-system/tokens';

const { width: screenWidth } = Dimensions.get('window');

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface MeasurementChartProps {
  data: DataPoint[];
  title: string;
  unit: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showPoints?: boolean;
  animated?: boolean;
}

export function MeasurementChart({
  data,
  title,
  unit,
  color = DesignTokens.colors.primary[500],
  height = 200,
  showGrid = true,
  showPoints = true,
  animated = false,
}: MeasurementChartProps) {
  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  const chartWidth = Math.max(screenWidth - 40, data.length * 60);
  const chartHeight = height - 60; // Account for title and labels
  const padding = 40;

  // Calculate min/max values with some padding
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;
  const paddedMin = minValue - valueRange * 0.1;
  const paddedMax = maxValue + valueRange * 0.1;
  const paddedRange = paddedMax - paddedMin;

  // Generate path for the line
  const generatePath = (): string => {
    if (data.length < 2) return '';

    const points = data.map((point, index) => {
      const x = padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
      const y = chartHeight - padding - ((point.value - paddedMin) / paddedRange) * (chartHeight - 2 * padding);
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    
    // Create smooth curves using quadratic bezier curves
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      
      if (i === 1) {
        // First curve
        const controlX = prevPoint.x + (currentPoint.x - prevPoint.x) / 2;
        const controlY = prevPoint.y;
        path += ` Q ${controlX} ${controlY} ${currentPoint.x} ${currentPoint.y}`;
      } else {
        // Subsequent curves
        const controlX = prevPoint.x + (currentPoint.x - prevPoint.x) / 2;
        const controlY = prevPoint.y;
        path += ` Q ${controlX} ${controlY} ${currentPoint.x} ${currentPoint.y}`;
      }
    }

    return path;
  };

  // Generate area path for gradient fill
  const generateAreaPath = (): string => {
    const linePath = generatePath();
    if (!linePath) return '';

    const lastPoint = data[data.length - 1];
    const lastX = padding + ((data.length - 1) * (chartWidth - 2 * padding)) / (data.length - 1);
    const bottomY = chartHeight - padding;

    return `${linePath} L ${lastX} ${bottomY} L ${padding} ${bottomY} Z`;
  };

  // Generate grid lines
  const generateGridLines = () => {
    const lines = [];
    const gridCount = 5;

    // Horizontal grid lines
    for (let i = 0; i <= gridCount; i++) {
      const y = padding + (i * (chartHeight - 2 * padding)) / gridCount;
      lines.push(
        <Line
          key={`h-${i}`}
          x1={padding}
          y1={y}
          x2={chartWidth - padding}
          y2={y}
          stroke={DesignTokens.colors.neutral[700]}
          strokeWidth={0.5}
          opacity={0.5}
        />
      );
    }

    // Vertical grid lines
    const verticalCount = Math.min(data.length - 1, 6);
    for (let i = 0; i <= verticalCount; i++) {
      const x = padding + (i * (chartWidth - 2 * padding)) / verticalCount;
      lines.push(
        <Line
          key={`v-${i}`}
          x1={x}
          y1={padding}
          x2={x}
          y2={chartHeight - padding}
          stroke={DesignTokens.colors.neutral[700]}
          strokeWidth={0.5}
          opacity={0.3}
        />
      );
    }

    return lines;
  };

  // Generate data points
  const generatePoints = () => {
    return data.map((point, index) => {
      const x = padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
      const y = chartHeight - padding - ((point.value - paddedMin) / paddedRange) * (chartHeight - 2 * padding);
      
      return (
        <Circle
          key={index}
          cx={x}
          cy={y}
          r={4}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth={2}
        />
      );
    });
  };

  // Generate Y-axis labels
  const generateYLabels = () => {
    const labels = [];
    const labelCount = 5;

    for (let i = 0; i <= labelCount; i++) {
      const value = paddedMin + (i * paddedRange) / labelCount;
      const y = chartHeight - padding - (i * (chartHeight - 2 * padding)) / labelCount;
      
      labels.push(
        <SvgText
          key={i}
          x={padding - 10}
          y={y + 4}
          fontSize={12}
          fill={DesignTokens.colors.text.secondary}
          textAnchor="end"
        >
          {value.toFixed(1)}
        </SvgText>
      );
    }

    return labels;
  };

  // Generate X-axis labels
  const generateXLabels = () => {
    const labels = [];
    const maxLabels = Math.min(data.length, 6);
    const step = Math.ceil(data.length / maxLabels);

    for (let i = 0; i < data.length; i += step) {
      const point = data[i];
      const x = padding + (i * (chartWidth - 2 * padding)) / (data.length - 1);
      
      labels.push(
        <SvgText
          key={i}
          x={x}
          y={chartHeight - padding + 20}
          fontSize={10}
          fill={DesignTokens.colors.text.secondary}
          textAnchor="middle"
        >
          {point.label || new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </SvgText>
      );
    }

    return labels;
  };

  const linePath = generatePath();
  const areaPath = generateAreaPath();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: chartWidth, height: chartHeight + 40 }}>
          <Svg width={chartWidth} height={chartHeight + 40}>
            <Defs>
              <SvgLinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <Stop offset="100%" stopColor={color} stopOpacity={0.05} />
              </SvgLinearGradient>
            </Defs>
            
            {/* Grid */}
            {showGrid && generateGridLines()}
            
            {/* Area fill */}
            {areaPath && (
              <Path
                d={areaPath}
                fill="url(#areaGradient)"
              />
            )}
            
            {/* Line */}
            {linePath && (
              <Path
                d={linePath}
                stroke={color}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            
            {/* Data points */}
            {showPoints && generatePoints()}
            
            {/* Y-axis labels */}
            {generateYLabels()}
            
            {/* X-axis labels */}
            {generateXLabels()}
          </Svg>
        </View>
      </ScrollView>
      
      {/* Current value indicator */}
      {data.length > 0 && (
        <View style={styles.currentValue}>
          <Text style={styles.currentValueLabel}>Current</Text>
          <Text style={[styles.currentValueText, { color }]}>
            {data[data.length - 1].value.toFixed(1)} {unit}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[3],
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  currentValue: {
    alignItems: 'center',
    marginTop: DesignTokens.spacing[3],
    paddingTop: DesignTokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
  },
  currentValueLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  currentValueText: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
});
