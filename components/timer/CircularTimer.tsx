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

interface CircularTimerProps {
  duration: number; // in seconds
  elapsed: number; // in seconds
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showTime?: boolean;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  duration,
  elapsed,
  size = 280,
  strokeWidth = 12,
  color = '#9E7FFF',
  backgroundColor = '#262626',
  showTime = true,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const progress = Math.min(elapsed / duration, 1);
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Pulse animation when timer is near completion
    if (progress > 0.9) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [elapsed, duration]);

  const getStrokeDasharray = () => {
    return progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [`0, ${circumference}`, `${circumference}, ${circumference}`],
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const remaining = Math.max(duration - elapsed, 0);

  return (
    <Animated.View 
      style={[
        styles.container, 
        { width: size, height: size },
        { transform: [{ scale: pulseAnim }] }
      ]}
    >
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={getStrokeDasharray()}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {showTime && (
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(remaining)}</Text>
          <Text style={styles.timeLabel}>remaining</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  timeContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: DesignTokens.typography.fontSize['4xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: 'SF Mono',
  },
  timeLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
});
