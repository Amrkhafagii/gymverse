import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryTheme, VictoryTooltip, VictoryScatter } from 'victory-native';
import { ChartDataPoint, TrendData } from '@/lib/analytics/chartDataProcessing';
import { DesignTokens } from '@/design-system/tokens';
import { TrendingUp, TrendingDown, Minus, BarChart3, LineChart, Activity } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - (DesignTokens.spacing[5] * 2);

export type ChartType = 'line' | 'area' | 'bar';

interface AnalyticsChartProps {
  data: ChartDataPoint[];
  title: string;
  subtitle?: string;
  trend?: TrendData;
  chartType?: ChartType;
  color?: string;
  height?: number;
  showTrend?: boolean;
  onDataPointPress?: (dataPoint: ChartDataPoint) => void;
}

export function AnalyticsChart({
  data,
  title,
  subtitle,
  trend,
  chartType = 'line',
  color = DesignTokens.colors.primary[500],
  height = 200,
  showTrend = true,
  onDataPointPress,
}: AnalyticsChartProps) {
  const [selectedPoint, setSelectedPoint] = useState<ChartDataPoint | null>(null);

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.emptyState}>
          <BarChart3 size={48} color={DesignTokens.colors.text.tertiary} />
          <Text style={styles.emptyStateText}>No data available</Text>
        </View>
      </View>
    );
  }

  // Prepare data for Victory charts
  const chartData = data.map((point, index) => ({
    x: index + 1,
    y: point.value,
    label: point.label || point.value.toString(),
    date: point.date,
    originalData: point,
  }));

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.trend) {
      case 'up':
        return <TrendingUp size={16} color={DesignTokens.colors.success[500]} />;
      case 'down':
        return <TrendingDown size={16} color={DesignTokens.colors.error[500]} />;
      default:
        return <Minus size={16} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return DesignTokens.colors.text.secondary;
    
    switch (trend.trend) {
      case 'up':
        return DesignTokens.colors.success[500];
      case 'down':
        return DesignTokens.colors.error[500];
      default:
        return DesignTokens.colors.text.secondary;
    }
  };

  const formatTrendValue = (value: number) => {
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(1);
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      width: chartWidth,
      height: height,
      theme: VictoryTheme.material,
      padding: { left: 60, top: 20, right: 40, bottom: 40 },
    };

    switch (chartType) {
      case 'area':
        return (
          <VictoryChart {...commonProps}>
            <VictoryAxis dependentAxis tickFormat={(t) => `${t}`} />
            <VictoryAxis tickFormat={() => ''} />
            <VictoryArea
              style={{
                data: { 
                  fill: color, 
                  fillOpacity: 0.3,
                  stroke: color,
                  strokeWidth: 2,
                },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
            />
            <VictoryScatter
              style={{ data: { fill: color } }}
              size={4}
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
                        onDataPointPress?.(point.originalData);
                        return null;
                      }
                    }];
                  }
                }
              }]}
            />
          </VictoryChart>
        );
      
      case 'line':
      default:
        return (
          <VictoryChart {...commonProps}>
            <VictoryAxis dependentAxis tickFormat={(t) => `${t}`} />
            <VictoryAxis tickFormat={() => ''} />
            <VictoryLine
              style={{
                data: { stroke: color, strokeWidth: 3 },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
            />
            <VictoryScatter
              style={{ data: { fill: color } }}
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
                        onDataPointPress?.(point.originalData);
                        return null;
                      }
                    }];
                  }
                }
              }]}
            />
          </VictoryChart>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        
        {showTrend && trend && (
          <View style={styles.trendContainer}>
            <View style={styles.trendIndicator}>
              {getTrendIcon()}
              <Text style={[styles.trendValue, { color: getTrendColor() }]}>
                {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
              </Text>
            </View>
            <Text style={styles.trendLabel}>
              {formatTrendValue(trend.current)} vs {formatTrendValue(trend.previous)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chartContainer}>
        {renderChart()}
      </View>

      {selectedPoint && (
        <View style={styles.selectedPointInfo}>
          <Text style={styles.selectedPointLabel}>
            {new Date(selectedPoint.date).toLocaleDateString()}
          </Text>
          <Text style={styles.selectedPointValue}>
            {selectedPoint.label || selectedPoint.value}
          </Text>
        </View>
      )}
    </View>
  );
}

interface ChartTypeToggleProps {
  chartType: ChartType;
  onTypeChange: (type: ChartType) => void;
}

export function ChartTypeToggle({ chartType, onTypeChange }: ChartTypeToggleProps) {
  const types: Array<{ type: ChartType; icon: React.ReactNode; label: string }> = [
    { type: 'line', icon: <LineChart size={16} />, label: 'Line' },
    { type: 'area', icon: <Activity size={16} />, label: 'Area' },
    { type: 'bar', icon: <BarChart3 size={16} />, label: 'Bar' },
  ];

  return (
    <View style={styles.toggleContainer}>
      {types.map(({ type, icon, label }) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.toggleButton,
            chartType === type && styles.toggleButtonActive
          ]}
          onPress={() => onTypeChange(type)}
        >
          {icon}
          <Text style={[
            styles.toggleButtonText,
            chartType === type && styles.toggleButtonTextActive
          ]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    marginBottom: DesignTokens.spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  chartContainer: {
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[2],
  },
  selectedPointInfo: {
    padding: DesignTokens.spacing[4],
    paddingTop: DesignTokens.spacing[2],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedPointLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  selectedPointValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[8],
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.tertiary,
    marginTop: DesignTokens.spacing[2],
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[4],
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing[1],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  toggleButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  toggleButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  toggleButtonTextActive: {
    color: DesignTokens.colors.text.primary,
  },
});
