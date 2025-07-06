import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Svg, Circle, G } from 'react-native-svg';
import { DesignTokens } from '@/design-system/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface SleepRingChartProps {
  sleepData: {
    deep: number;
    light: number;
    rem: number;
    awake: number;
  };
  totalSleep: number;
  size?: number;
  strokeWidth?: number;
}

export const SleepRingChart: React.FC<SleepRingChartProps> = ({
  sleepData,
  totalSleep,
  size = 200,
  strokeWidth = 16,
}) => {
  const animatedValues = {
    deep: useRef(new Animated.Value(0)).current,
    light: useRef(new Animated.Value(0)).current,
    rem: useRef(new Animated.Value(0)).current,
    awake: useRef(new Animated.Value(0)).current,
  };

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const animations = Object.keys(sleepData).map((stage) => {
      const percentage = sleepData[stage as keyof typeof sleepData] / totalSleep;
      return Animated.timing(animatedValues[stage as keyof typeof animatedValues], {
        toValue: percentage,
        duration: 1500,
        delay: 300,
        useNativeDriver: false,
      });
    });

    Animated.stagger(200, animations).start();
  }, [sleepData, totalSleep]);

  const getStrokeDasharray = (stage: keyof typeof sleepData) => {
    return animatedValues[stage].interpolate({
      inputRange: [0, 1],
      outputRange: [`0, ${circumference}`, `${circumference}, ${circumference}`],
    });
  };

  const getStrokeDashoffset = (previousStages: number) => {
    const offset = (previousStages / totalSleep) * circumference;
    return -offset;
  };

  const sleepColors = {
    deep: '#4C1D95',    // Deep purple
    light: '#7C3AED',   // Medium purple
    rem: '#A855F7',     // Light purple
    awake: '#EF4444',   // Red for awake time
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={DesignTokens.colors.neutral[800]}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Deep Sleep */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={sleepColors.deep}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={getStrokeDasharray('deep')}
            strokeDashoffset={getStrokeDashoffset(0)}
            strokeLinecap="round"
          />
          
          {/* Light Sleep */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={sleepColors.light}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={getStrokeDasharray('light')}
            strokeDashoffset={getStrokeDashoffset(sleepData.deep)}
            strokeLinecap="round"
          />
          
          {/* REM Sleep */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={sleepColors.rem}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={getStrokeDasharray('rem')}
            strokeDashoffset={getStrokeDashoffset(sleepData.deep + sleepData.light)}
            strokeLinecap="round"
          />
          
          {/* Awake Time */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={sleepColors.awake}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={getStrokeDasharray('awake')}
            strokeDashoffset={getStrokeDashoffset(sleepData.deep + sleepData.light + sleepData.rem)}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        <Text style={styles.totalSleepText}>{formatTime(totalSleep)}</Text>
        <Text style={styles.totalSleepLabel}>Total Sleep</Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(sleepData).map(([stage, minutes]) => (
          <View key={stage} style={styles.legendItem}>
            <View 
              style={[
                styles.legendDot, 
                { backgroundColor: sleepColors[stage as keyof typeof sleepColors] }
              ]} 
            />
            <Text style={styles.legendText}>
              {stage.charAt(0).toUpperCase() + stage.slice(1)}: {formatTime(minutes)}
            </Text>
          </View>
        ))}
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
  totalSleepText: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: 'SF Mono',
  },
  totalSleepLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  legend: {
    position: 'absolute',
    bottom: -80,
    left: 0,
    right: 0,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[1],
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: DesignTokens.spacing[2],
  },
  legendText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
});
