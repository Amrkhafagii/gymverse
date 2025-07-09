import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from 'react-native';
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryScatter, VictoryTooltip, VictoryZoomContainer } from 'victory-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '@/design-system/tokens';
import { LineChart, BarChart3, Activity, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - (DesignTokens.spacing[5] * 2);

export interface ChartDataPoint {
  x: number;
  y: number;
  label?: string;
  date?: string;
  metadata?: any;
}

export type ChartType = 'line' | 'area' | 'scatter';

interface InteractiveChartProps {
  data: ChartDataPoint[];
  title: string;
  subtitle?: string;
  chartType?: ChartType;
  color?: string;
  height?: number;
  showControls?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  onDataPointPress?: (dataPoint: ChartDataPoint) => void;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatYAxis?: (value: number) => string;
  formatTooltip?: (dataPoint: ChartDataPoint) => string;
}

export function InteractiveChart({
  data,
  title,
  subtitle,
  chartType = 'line',
  color = DesignTokens.colors.primary[500],
  height = 250,
  showControls = true,
  enableZoom = true,
  enablePan = true,
  onDataPointPress,
  xAxisLabel,
  yAxisLabel,
  formatYAxis = (value) => value.toString(),
  formatTooltip,
}: InteractiveChartProps) {
  const [currentChartType, setCurrentChartType] = useState<ChartType>(chartType);
  const [selectedPoint, setSelectedPoint] = useState<ChartDataPoint | null>(null);
  const [zoomDomain, setZoomDomain] = useState<{ x: [number, number]; y: [number, number] } | undefined>();

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.gradient}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          <View style={styles.emptyState}>
            <BarChart3 size={48} color={DesignTokens.colors.text.tertiary} />
            <Text style={styles.emptyStateText}>No data available</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const handleDataPointPress = (dataPoint: ChartDataPoint) => {
    setSelectedPoint(dataPoint);
    onDataPointPress?.(dataPoint);
  };

  const resetZoom = () => {
    setZoomDomain(undefined);
  };

  const renderChart = () => {
    const commonProps = {
      data: data,
      width: chartWidth,
      height: height,
      padding: { left: 60, top: 20, right: 40, bottom: 60 },
      containerComponent: enableZoom ? (
        <VictoryZoomContainer
          zoomDimension="x"
          zoomDomain={zoomDomain}
          onZoomDomainChange={(domain) => setZoomDomain(domain)}
        />
      ) : undefined,
    };

    const axisProps = {
      dependentAxis: true,
      tickFormat: formatYAxis,
      style: {
        axis: { stroke: DesignTokens.colors.neutral[600] },
        tickLabels: { 
          fill: DesignTokens.colors.text.secondary,
          fontSize: 12,
        },
        grid: { 
          stroke: DesignTokens.colors.neutral[800],
          strokeDasharray: '3,3',
        },
      },
    };

    const independentAxisProps = {
      style: {
        axis: { stroke: DesignTokens.colors.neutral[600] },
        tickLabels: { 
          fill: DesignTokens.colors.text.secondary,
          fontSize: 12,
        },
        grid: { 
          stroke: DesignTokens.colors.neutral[800],
          strokeDasharray: '3,3',
        },
      },
    };

    switch (currentChartType) {
      case 'area':
        return (
          <VictoryChart {...commonProps}>
            <VictoryAxis {...axisProps} />
            <VictoryAxis {...independentAxisProps} />
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
                        const point = data[props.index];
                        handleDataPointPress(point);
                        return null;
                      }
                    }];
                  }
                }
              }]}
            />
          </VictoryChart>
        );

      case 'scatter':
        return (
          <VictoryChart {...commonProps}>
            <VictoryAxis {...axisProps} />
            <VictoryAxis {...independentAxisProps} />
            <VictoryScatter
              style={{ data: { fill: color } }}
              size={6}
              labelComponent={<VictoryTooltip />}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
              events={[{
                target: "data",
                eventHandlers: {
                  onPress: () => {
                    return [{
                      target: "data",
                      mutation: (props) => {
                        const point = data[props.index];
                        handleDataPointPress(point);
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
            <VictoryAxis {...axisProps} />
            <VictoryAxis {...independentAxisProps} />
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
                        const point = data[props.index];
                        handleDataPointPress(point);
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
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>

        {/* Controls */}
        {showControls && (
          <View style={styles.controls}>
            <View style={styles.chartTypeControls}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  currentChartType === 'line' && styles.controlButtonActive
                ]}
                onPress={() => setCurrentChartType('line')}
              >
                <LineChart size={16} color={
                  currentChartType === 'line' 
                    ? DesignTokens.colors.text.primary 
                    : DesignTokens.colors.text.secondary
                } />
                <Text style={[
                  styles.controlButtonText,
                  currentChartType === 'line' && styles.controlButtonTextActive
                ]}>
                  Line
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.controlButton,
                  currentChartType === 'area' && styles.controlButtonActive
                ]}
                onPress={() => setCurrentChartType('area')}
              >
                <Activity size={16} color={
                  currentChartType === 'area' 
                    ? DesignTokens.colors.text.primary 
                    : DesignTokens.colors.text.secondary
                } />
                <Text style={[
                  styles.controlButtonText,
                  currentChartType === 'area' && styles.controlButtonTextActive
                ]}>
                  Area
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.controlButton,
                  currentChartType === 'scatter' && styles.controlButtonActive
                ]}
                onPress={() => setCurrentChartType('scatter')}
              >
                <BarChart3 size={16} color={
                  currentChartType === 'scatter' 
                    ? DesignTokens.colors.text.primary 
                    : DesignTokens.colors.text.secondary
                } />
                <Text style={[
                  styles.controlButtonText,
                  currentChartType === 'scatter' && styles.controlButtonTextActive
                ]}>
                  Scatter
                </Text>
              </TouchableOpacity>
            </View>

            {enableZoom && (
              <View style={styles.zoomControls}>
                <TouchableOpacity
                  style={styles.zoomButton}
                  onPress={resetZoom}
                >
                  <RotateCcw size={16} color={DesignTokens.colors.text.secondary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Chart */}
        <View style={styles.chartContainer}>
          {renderChart()}
        </View>

        {/* Axis Labels */}
        {(xAxisLabel || yAxisLabel) && (
          <View style={styles.axisLabels}>
            {yAxisLabel && (
              <Text style={styles.yAxisLabel}>{yAxisLabel}</Text>
            )}
            {xAxisLabel && (
              <Text style={styles.xAxisLabel}>{xAxisLabel}</Text>
            )}
          </View>
        )}

        {/* Selected Point Info */}
        {selectedPoint && (
          <View style={styles.selectedPointInfo}>
            <View style={styles.selectedPointHeader}>
              <Text style={styles.selectedPointTitle}>Data Point</Text>
              <TouchableOpacity onPress={() => setSelectedPoint(null)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.selectedPointContent}>
              <Text style={styles.selectedPointValue}>
                Value: {selectedPoint.y}
              </Text>
              {selectedPoint.date && (
                <Text style={styles.selectedPointDate}>
                  Date: {new Date(selectedPoint.date).toLocaleDateString()}
                </Text>
              )}
              {selectedPoint.label && (
                <Text style={styles.selectedPointLabel}>
                  {selectedPoint.label}
                </Text>
              )}
              {formatTooltip && (
                <Text style={styles.selectedPointCustom}>
                  {formatTooltip(selectedPoint)}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Chart Stats */}
        <View style={styles.chartStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Data Points</Text>
            <Text style={styles.statValue}>{data.length}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Min Value</Text>
            <Text style={styles.statValue}>
              {formatYAxis(Math.min(...data.map(d => d.y)))}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Max Value</Text>
            <Text style={styles.statValue}>
              {formatYAxis(Math.max(...data.map(d => d.y)))}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>
              {formatYAxis(data.reduce((sum, d) => sum + d.y, 0) / data.length)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[4],
    ...DesignTokens.shadow.base,
  },
  gradient: {
    padding: DesignTokens.spacing[4],
  },
  header: {
    marginBottom: DesignTokens.spacing[4],
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[1],
  },
  subtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  chartTypeControls: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[1],
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  controlButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  controlButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  controlButtonTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  zoomControls: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  zoomButton: {
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.sm,
    backgroundColor: DesignTokens.colors.surface.secondary,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  axisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  xAxisLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    flex: 1,
  },
  yAxisLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    transform: [{ rotate: '-90deg' }],
    position: 'absolute',
    left: -20,
  },
  selectedPointInfo: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  selectedPointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  selectedPointTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  closeButton: {
    fontSize: 24,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  selectedPointContent: {
    gap: DesignTokens.spacing[1],
  },
  selectedPointValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  selectedPointDate: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  selectedPointLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  selectedPointCustom: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontStyle: 'italic',
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
    paddingTop: DesignTokens.spacing[3],
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[12],
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.tertiary,
    marginTop: DesignTokens.spacing[2],
  },
});
