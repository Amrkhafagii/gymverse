import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { DesignTokens } from '@/design-system/tokens';

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  duration?: number;
  gradient?: boolean;
  gradientColors?: string[];
  children?: React.ReactNode;
  style?: ViewStyle;
  textColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  clockwise?: boolean;
  startAngle?: number; // in degrees
  endAngle?: number; // in degrees
  lineCap?: 'butt' | 'round' | 'square';
  shadowColor?: string;
  shadowOffset?: { x: number; y: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  glowEffect?: boolean;
  pulseAnimation?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 8,
  color = DesignTokens.colors.primary[500],
  backgroundColor = DesignTokens.colors.neutral[200],
  showPercentage = true,
  showLabel = false,
  label,
  animated = true,
  duration = 1000,
  gradient = false,
  gradientColors = [DesignTokens.colors.primary[400], DesignTokens.colors.primary[600]],
  children,
  style,
  textColor = DesignTokens.colors.text.primary,
  fontSize,
  fontWeight = '600',
  clockwise = true,
  startAngle = -90,
  endAngle = 270,
  lineCap = 'round',
  shadowColor,
  shadowOffset,
  shadowOpacity,
  shadowRadius,
  glowEffect = false,
  pulseAnimation = false,
}: CircularProgressProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate angle range
  const totalAngle = endAngle - startAngle;
  const progressAngle = (progress / 100) * totalAngle;

  // Convert angles to radians for calculations
  const startAngleRad = (startAngle * Math.PI) / 180;
  const progressAngleRad = (progressAngle * Math.PI) / 180;

  // Calculate stroke dash array and offset
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(progress);
    }
  }, [progress, animated, duration]);

  useEffect(() => {
    if (pulseAnimation) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => pulse());
      };
      pulse();
    }
  }, [pulseAnimation]);

  const animatedStrokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const containerStyle = [
    styles.container,
    {
      width: size,
      height: size,
      transform: [{ scale: pulseValue }],
    },
    shadowColor && {
      shadowColor,
      shadowOffset: shadowOffset || { x: 0, y: 2 },
      shadowOpacity: shadowOpacity || 0.25,
      shadowRadius: shadowRadius || 4,
      elevation: 4,
    },
    style,
  ];

  const textSize = fontSize || Math.max(12, size * 0.15);
  const labelSize = Math.max(10, size * 0.1);

  return (
    <Animated.View style={containerStyle}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          {gradient && (
            <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradientColors[0]} />
              <Stop offset="100%" stopColor={gradientColors[1]} />
            </SvgLinearGradient>
          )}
          {glowEffect && (
            <SvgLinearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <Stop offset="50%" stopColor={color} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </SvgLinearGradient>
          )}
        </Defs>

        {/* Background Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap={lineCap}
        />

        {/* Glow Effect */}
        {glowEffect && (
          <Circle
            cx={center}
            cy={center}
            r={radius + strokeWidth}
            stroke="url(#glow)"
            strokeWidth={strokeWidth * 2}
            fill="transparent"
            strokeLinecap={lineCap}
            opacity={0.3}
          />
        )}

        {/* Progress Circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={gradient ? 'url(#gradient)' : color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={animated ? animatedStrokeDashoffset : strokeDashoffset}
          strokeLinecap={lineCap}
          transform={`rotate(${startAngle} ${center} ${center})`}
          style={{
            transform: [
              { rotate: `${startAngle}deg` },
              { scaleX: clockwise ? 1 : -1 },
            ],
          }}
        />
      </Svg>

      {/* Content */}
      <View style={styles.content}>
        {children || (
          <View style={styles.textContainer}>
            {showPercentage && (
              <Text
                style={[
                  styles.percentageText,
                  {
                    color: textColor,
                    fontSize: textSize,
                    fontWeight,
                  },
                ]}
              >
                {Math.round(progress)}%
              </Text>
            )}
            {showLabel && label && (
              <Text
                style={[
                  styles.labelText,
                  {
                    color: textColor,
                    fontSize: labelSize,
                  },
                ]}
              >
                {label}
              </Text>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// Preset variants for common use cases
export function CircularProgressSmall(props: Partial<CircularProgressProps>) {
  return (
    <CircularProgress
      size={60}
      strokeWidth={6}
      fontSize={12}
      {...props}
    />
  );
}

export function CircularProgressMedium(props: Partial<CircularProgressProps>) {
  return (
    <CircularProgress
      size={100}
      strokeWidth={8}
      fontSize={16}
      {...props}
    />
  );
}

export function CircularProgressLarge(props: Partial<CircularProgressProps>) {
  return (
    <CircularProgress
      size={160}
      strokeWidth={12}
      fontSize={24}
      {...props}
    />
  );
}

// Specialized variants
export function CircularProgressGradient(props: Partial<CircularProgressProps>) {
  return (
    <CircularProgress
      gradient={true}
      glowEffect={true}
      pulseAnimation={true}
      {...props}
    />
  );
}

export function CircularProgressMinimal(props: Partial<CircularProgressProps>) {
  return (
    <CircularProgress
      strokeWidth={4}
      backgroundColor="transparent"
      showPercentage={false}
      lineCap="butt"
      {...props}
    />
  );
}

export function CircularProgressDashboard(props: Partial<CircularProgressProps>) {
  return (
    <CircularProgress
      size={80}
      strokeWidth={6}
      gradient={true}
      showLabel={true}
      fontSize={14}
      fontWeight="bold"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  labelText: {
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.8,
  },
});
