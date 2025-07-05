import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

interface AnalyticsChartProps {
  title: string;
  data: ChartDataPoint[];
  chartType: 'line' | 'bar' | 'area' | 'pie';
  color?: string;
  gradientColors?: string[];
  unit?: string;
  height?: number;
  showTrend?: boolean;
  trendDirection?: 'up' | 'down' | 'stable';
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const { width: screenWidth } = Dimensions.get('window');

export default function AnalyticsChart({
  title,
  data,
  chartType,
  color = '#9E7FFF',
  gradientColors = ['#9E7FFF', '#7C3AED'],
  unit = '',
  height = 200,
  showTrend = false,
  trendDirection = 'stable',
  subtitle,
  icon,
}: AnalyticsChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1f2937', '#111827']} style={styles.gradient}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              {icon && <Ionicons name={icon} size={20} color={color} style={styles.titleIcon} />}
              <Text style={styles.title}>{title}</Text>
            </View>
          </View>
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart" size={48} color="#666" />
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value));
  const chartWidth = screenWidth - 80;

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up':
        return '#10b981';
      case 'down':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(1);
  };

  const renderLineChart = () => {
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * (chartWidth - 40);
      const y = height - 60 - ((point.value - minValue) / (maxValue - minValue)) * (height - 80);
      return { x, y, value: point.value };
    });

    return (
      <View style={[styles.chartContainer, { height }]}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <View
            key={index}
            style={[
              styles.gridLine,
              {
                top: (height - 60) * ratio + 20,
                width: chartWidth - 40,
              },
            ]}
          />
        ))}

        {/* Area fill */}
        <LinearGradient
          colors={[`${color}40`, `${color}10`]}
          style={[
            styles.areaFill,
            {
              height: height - 60,
              width: chartWidth - 40,
            },
          ]}
        />

        {/* Data points and lines */}
        {points.map((point, index) => (
          <View key={index}>
            {/* Connection line */}
            {index < points.length - 1 && (
              <View
                style={[
                  styles.connectionLine,
                  {
                    left: point.x + 20,
                    top: point.y,
                    width: Math.sqrt(
                      Math.pow(points[index + 1].x - point.x, 2) +
                      Math.pow(points[index + 1].y - point.y, 2)
                    ),
                    transform: [
                      {
                        rotate: `${Math.atan2(
                          points[index + 1].y - point.y,
                          points[index + 1].x - point.x
                        ) * 180 / Math.PI}deg`,
                      },
                    ],
                    backgroundColor: color,
                  },
                ]}
              />
            )}
            
            {/* Data point */}
            <View
              style={[
                styles.dataPoint,
                {
                  left: point.x + 16,
                  top: point.y - 4,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
        ))}

        {/* Value labels */}
        {points.map((point, index) => (
          <Text
            key={`label-${index}`}
            style={[
              styles.valueLabel,
              {
                left: point.x + 8,
                top: point.y - 25,
              },
            ]}
          >
            {formatValue(point.value)}
          </Text>
        ))}
      </View>
    );
  };

  const renderBarChart = () => {
    const barWidth = Math.max(20, (chartWidth - 40 - (data.length - 1) * 8) / data.length);

    return (
      <View style={[styles.chartContainer, { height }]}>
        <View style={styles.barContainer}>
          {data.map((point, index) => {
            const barHeight = ((point.value - minValue) / (maxValue - minValue)) * (height - 80);
            return (
              <View key={index} style={styles.barWrapper}>
                <Text style={styles.barValue}>{formatValue(point.value)}</Text>
                <LinearGradient
                  colors={gradientColors}
                  style={[
                    styles.bar,
                    {
                      width: barWidth,
                      height: Math.max(4, barHeight),
                    },
                  ]}
                />
                <Text style={styles.barLabel} numberOfLines={1}>
                  {point.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, point) => sum + point.value, 0);
    const colors = [
      '#9E7FFF', '#f472b6', '#38bdf8', '#10b981', '#f59e0b',
      '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
    ];

    return (
      <View style={[styles.chartContainer, { height }]}>
        <View style={styles.pieContainer}>
          <View style={styles.pieChart}>
            {/* Simplified pie representation with segments */}
            {data.slice(0, 5).map((point, index) => {
              const percentage = (point.value / total) * 100;
              return (
                <View key={index} style={styles.pieSegment}>
                  <View
                    style={[
                      styles.pieSlice,
                      {
                        backgroundColor: colors[index % colors.length],
                        width: `${Math.max(10, percentage)}%`,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
          
          <View style={styles.pieLegend}>
            {data.slice(0, 5).map((point, index) => {
              const percentage = ((point.value / total) * 100).toFixed(1);
              return (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: colors[index % colors.length] },
                    ]}
                  />
                  <Text style={styles.legendText}>
                    {point.label} ({percentage}%)
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
      case 'area':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1f2937', '#111827']} style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {icon && <Ionicons name={icon} size={20} color={color} style={styles.titleIcon} />}
            <Text style={styles.title}>{title}</Text>
            {showTrend && (
              <Ionicons
                name={getTrendIcon()}
                size={16}
                color={getTrendColor()}
                style={styles.trendIcon}
              />
            )}
          </View>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        
        {renderChart()}
        
        {chartType !== 'pie' && (
          <View style={styles.xAxisLabels}>
            {data.map((point, index) => {
              const showLabel = data.length <= 6 || index % Math.ceil(data.length / 4) === 0;
              return (
                <Text
                  key={index}
                  style={[
                    styles.xAxisLabel,
                    { opacity: showLabel ? 1 : 0 },
                  ]}
                  numberOfLines={1}
                >
                  {point.label}
                </Text>
              );
            })}
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  gradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  trendIcon: {
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
  },
  chartContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#333',
    left: 20,
  },
  areaFill: {
    position: 'absolute',
    left: 20,
    top: 20,
    borderRadius: 4,
  },
  connectionLine: {
    position: 'absolute',
    height: 2,
    zIndex: 1,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 2,
  },
  valueLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: 10,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  bar: {
    borderRadius: 4,
    marginVertical: 8,
  },
  barValue: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 4,
  },
  pieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginRight: 20,
  },
  pieSegment: {
    flex: 1,
  },
  pieSlice: {
    height: '100%',
    borderRadius: 2,
    marginVertical: 1,
  },
  pieLegend: {
    flex: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    marginTop: 12,
  },
});
