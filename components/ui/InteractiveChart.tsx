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
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { DesignTokens } from '@/design-system/tokens';

const { width: screenWidth } = Dimensions.get('window');

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface InteractiveChartProps {
  data: DataPoint[];
  metric: string;
  color?: string;
  height?: number;
  onDataPointPress?: (dataPoint: DataPoint) => void;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  data,
  metric,
  color = DesignTokens.colors.primary[500],
  height = 200,
  onDataPointPress,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  
  const chartWidth = screenWidth - (DesignTokens.spacing[5] * 2);
  const chartHeight = height - 60; // Leave space for labels
  
  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No data available</Text>
        </View>
      </View>
    );
  }

  // Calculate chart dimensions and scaling
  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;
  
  const pointSpacing = chartWidth / (data.length - 1 || 1);
  
  // Generate path for the line
  const generatePath = () => {
    return data.map((point, index) => {
      const x = index * pointSpacing;
      const y = chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Generate area path for gradient fill
  const generateAreaPath = () => {
    const linePath = generatePath();
    const firstPoint = `M 0 ${chartHeight}`;
    const lastPoint = `L ${(data.length - 1) * pointSpacing} ${chartHeight}`;
    return `${firstPoint} ${linePath.substring(1)} ${lastPoint} Z`;
  };

  const handlePointPress = (index: number) => {
    setSelectedPoint(index);
    if (onDataPointPress) {
      onDataPointPress(data[index]);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <Svg width={Math.max(chartWidth, data.length * 60)} height={chartHeight}>
            <Defs>
              <SvgLinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <Stop offset="100%" stopColor={color} stopOpacity="0.05" />
              </SvgLinearGradient>
              <SvgLinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={color} />
                <Stop offset="100%" stopColor={DesignTokens.colors.primary[600]} />
              </SvgLinearGradient>
            </Defs>
            
            {/* Area fill */}
            <Path
              d={generateAreaPath()}
              fill="url(#areaGradient)"
            />
            
            {/* Line */}
            <Path
              d={generatePath()}
              stroke="url(#lineGradient)"
              strokeWidth="3"
              fill="transparent"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {data.map((point, index) => {
              const x = index * pointSpacing;
              const y = chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
              const isSelected = selectedPoint === index;
              
              return (
                <Circle
                  key={index}
                  cx={x}
                  cy={y}
                  r={isSelected ? 8 : 5}
                  fill={isSelected ? DesignTokens.colors.text.primary : color}
                  stroke={DesignTokens.colors.surface.primary}
                  strokeWidth="2"
                  onPress={() => handlePointPress(index)}
                />
              );
            })}
          </Svg>
          
          {/* Data point labels */}
          <View style={styles.labelsContainer}>
            {data.map((point, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.labelContainer,
                  { left: index * pointSpacing - 30 }
                ]}
                onPress={() => handlePointPress(index)}
              >
                <Text style={styles.dateLabel}>
                  {new Date(point.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Selected point info */}
      {selectedPoint !== null && (
        <View style={styles.selectedInfo}>
          <LinearGradient
            colors={['#1a1a1a', '#2a2a2a']}
            style={styles.selectedInfoGradient}
          >
            <Text style={styles.selectedValue}>
              {data[selectedPoint].value} {metric}
            </Text>
            <Text style={styles.selectedDate}>
              {new Date(data[selectedPoint].date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            {data[selectedPoint].label && (
              <Text style={styles.selectedLabel}>
                {data[selectedPoint].label}
              </Text>
            )}
          </LinearGradient>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    ...DesignTokens.shadow.base,
  },
  chartContainer: {
    position: 'relative',
  },
  labelsContainer: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    height: 30,
  },
  labelContainer: {
    position: 'absolute',
    width: 60,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  selectedInfo: {
    marginTop: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.md,
    overflow: 'hidden',
  },
  selectedInfoGradient: {
    padding: DesignTokens.spacing[3],
    alignItems: 'center',
  },
  selectedValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  selectedDate: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  selectedLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.tertiary,
  },
});
