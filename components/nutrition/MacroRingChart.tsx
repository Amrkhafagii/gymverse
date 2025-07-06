import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Svg, Circle, G } from 'react-native-svg';
import { DesignTokens } from '@/design-system/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface MacroRingChartProps {
  protein: { current: number; target: number; color: string };
  carbs: { current: number; target: number; color: string };
  fat: { current: number; target: number; color: string };
  size?: number;
  strokeWidth?: number;
}

export const MacroRingChart: React.FC<MacroRingChartProps> = ({
  protein,
  carbs,
  fat,
  size = 200,
  strokeWidth = 12,
}) => {
  const proteinAnim = useRef(new Animated.Value(0)).current;
  const carbsAnim = useRef(new Animated.Value(0)).current;
  const fatAnim = useRef(new Animated.Value(0)).current;

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const animateRings = () => {
      Animated.parallel([
        Animated.timing(proteinAnim, {
          toValue: Math.min(protein.current / protein.target, 1),
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(carbsAnim, {
          toValue: Math.min(carbs.current / carbs.target, 1),
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(fatAnim, {
          toValue: Math.min(fat.current / fat.target, 1),
          duration: 1400,
          useNativeDriver: false,
        }),
      ]).start();
    };

    animateRings();
  }, [protein.current, carbs.current, fat.current]);

  const getStrokeDasharray = (animatedValue: Animated.Value) => {
    return animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [`0, ${circumference}`, `${circumference}, ${circumference}`],
    });
  };

  const getPercentage = (current: number, target: number) => {
    return Math.round((current / target) * 100);
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Background circles */}
          <Circle
            cx={center}
            cy={center}
            r={radius - strokeWidth * 2}
            stroke={DesignTokens.colors.neutral[800]}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius - strokeWidth}
            stroke={DesignTokens.colors.neutral[800]}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={DesignTokens.colors.neutral[800]}
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated progress circles */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={protein.color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={getStrokeDasharray(proteinAnim)}
            strokeLinecap="round"
          />
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius - strokeWidth}
            stroke={carbs.color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={getStrokeDasharray(carbsAnim)}
            strokeLinecap="round"
          />
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius - strokeWidth * 2}
            stroke={fat.color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={getStrokeDasharray(fatAnim)}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        <Text style={styles.centerTitle}>Macros</Text>
        <Text style={styles.centerSubtitle}>Today</Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: protein.color }]} />
          <Text style={styles.legendLabel}>Protein</Text>
          <Text style={styles.legendValue}>
            {getPercentage(protein.current, protein.target)}%
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: carbs.color }]} />
          <Text style={styles.legendLabel}>Carbs</Text>
          <Text style={styles.legendValue}>
            {getPercentage(carbs.current, carbs.target)}%
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: fat.color }]} />
          <Text style={styles.legendLabel}>Fat</Text>
          <Text style={styles.legendValue}>
            {getPercentage(fat.current, fat.target)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  centerSubtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  legend: {
    position: 'absolute',
    bottom: -60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  legendItem: {
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: DesignTokens.spacing[1],
  },
  legendLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  legendValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
});
