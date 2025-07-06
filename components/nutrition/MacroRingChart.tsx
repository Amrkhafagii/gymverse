import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, G } from 'react-native-svg';
import { DesignTokens } from '@/design-system/tokens';

interface MacroData {
  protein: { current: number; target: number; color: string };
  carbs: { current: number; target: number; color: string };
  fat: { current: number; target: number; color: string };
}

interface MacroRingChartProps {
  data: MacroData;
  size?: number;
  strokeWidth?: number;
}

export default function MacroRingChart({
  data,
  size = 200,
  strokeWidth = 12,
}: MacroRingChartProps) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const calculateProgress = (current: number, target: number) => {
    return Math.min(current / target, 1);
  };

  const calculateStrokeDasharray = (progress: number) => {
    const progressLength = circumference * progress;
    return `${progressLength} ${circumference - progressLength}`;
  };

  const proteinProgress = calculateProgress(data.protein.current, data.protein.target);
  const carbsProgress = calculateProgress(data.carbs.current, data.carbs.target);
  const fatProgress = calculateProgress(data.fat.current, data.fat.target);

  const totalCalories = (data.protein.current * 4) + (data.carbs.current * 4) + (data.fat.current * 9);
  const targetCalories = (data.protein.target * 4) + (data.carbs.target * 4) + (data.fat.target * 9);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1f2937', '#111827']} style={styles.gradient}>
        <View style={styles.chartContainer}>
          <Svg width={size} height={size} style={styles.svg}>
            <G rotation="-90" origin={`${center}, ${center}`}>
              {/* Background circles */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={center}
                cy={center}
                r={radius - strokeWidth - 4}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={center}
                cy={center}
                r={radius - (strokeWidth + 4) * 2}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* Progress circles */}
              {/* Protein (outer ring) */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={data.protein.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={calculateStrokeDasharray(proteinProgress)}
                strokeLinecap="round"
              />

              {/* Carbs (middle ring) */}
              <Circle
                cx={center}
                cy={center}
                r={radius - strokeWidth - 4}
                stroke={data.carbs.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={calculateStrokeDasharray(carbsProgress)}
                strokeLinecap="round"
              />

              {/* Fat (inner ring) */}
              <Circle
                cx={center}
                cy={center}
                r={radius - (strokeWidth + 4) * 2}
                stroke={data.fat.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={calculateStrokeDasharray(fatProgress)}
                strokeLinecap="round"
              />
            </G>
          </Svg>

          {/* Center content */}
          <View style={styles.centerContent}>
            <Text style={styles.centerValue}>{Math.round(totalCalories)}</Text>
            <Text style={styles.centerLabel}>calories</Text>
            <Text style={styles.centerTarget}>of {Math.round(targetCalories)}</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: data.protein.color }]} />
            <View style={styles.legendText}>
              <Text style={styles.legendLabel}>Protein</Text>
              <Text style={styles.legendValue}>
                {data.protein.current}g / {data.protein.target}g
              </Text>
            </View>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: data.carbs.color }]} />
            <View style={styles.legendText}>
              <Text style={styles.legendLabel}>Carbs</Text>
              <Text style={styles.legendValue}>
                {data.carbs.current}g / {data.carbs.target}g
              </Text>
            </View>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: data.fat.color }]} />
            <View style={styles.legendText}>
              <Text style={styles.legendLabel}>Fat</Text>
              <Text style={styles.legendValue}>
                {data.fat.current}g / {data.fat.target}g
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[4],
  },
  gradient: {
    padding: DesignTokens.spacing[5],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignTokens.spacing[5],
  },
  svg: {
    transform: [{ rotate: '90deg' }],
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValue: {
    fontSize: DesignTokens.typography.fontSize['3xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: 'SF Mono',
  },
  centerLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  centerTarget: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    marginTop: DesignTokens.spacing[1],
  },
  legend: {
    width: '100%',
    gap: DesignTokens.spacing[3],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.neutral[850],
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[3],
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: DesignTokens.spacing[3],
  },
  legendText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  legendValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontFamily: 'SF Mono',
  },
});
