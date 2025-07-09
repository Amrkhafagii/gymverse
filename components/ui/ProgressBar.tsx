import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '@/design-system/tokens';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  width?: number | string;
  backgroundColor?: string;
  color?: string;
  borderRadius?: number;
  animated?: boolean;
  duration?: number;
  showPercentage?: boolean;
  showLabel?: boolean;
  label?: string;
  labelPosition?: 'top' | 'bottom' | 'inside' | 'overlay';
  gradient?: boolean;
  gradientColors?: string[];
  gradientDirection?: 'horizontal' | 'vertical';
  striped?: boolean;
  glowEffect?: boolean;
  pulseAnimation?: boolean;
  segments?: number;
  segmentGap?: number;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  textColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  min?: number;
  max?: number;
  value?: number;
  formatValue?: (value: number) => string;
  showMinMax?: boolean;
  trackStyle?: ViewStyle;
  fillStyle?: ViewStyle;
  children?: React.ReactNode;
}

export function ProgressBar({
  progress,
  height = 8,
  width = '100%',
  backgroundColor = DesignTokens.colors.neutral[200],
  color = DesignTokens.colors.primary[500],
  borderRadius,
  animated = true,
  duration = 1000,
  showPercentage = false,
  showLabel = false,
  label,
  labelPosition = 'top',
  gradient = false,
  gradientColors = [DesignTokens.colors.primary[400], DesignTokens.colors.primary[600]],
  gradientDirection = 'horizontal',
  striped = false,
  glowEffect = false,
  pulseAnimation = false,
  segments,
  segmentGap = 2,
  style,
  containerStyle,
  labelStyle,
  textColor = DesignTokens.colors.text.primary,
  fontSize = 12,
  fontWeight = '500',
  min = 0,
  max = 100,
  value,
  formatValue,
  showMinMax = false,
  trackStyle,
  fillStyle,
  children,
}: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  const actualProgress = value !== undefined ? ((value - min) / (max - min)) * 100 : progress;
  const clampedProgress = Math.max(0, Math.min(100, actualProgress));

  const calculatedBorderRadius = borderRadius !== undefined ? borderRadius : height / 2;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: clampedProgress,
        duration,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, duration]);

  useEffect(() => {
    if (pulseAnimation) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.05,
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

  const animatedWidthStyle = {
    width: animatedWidth.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    }),
  };

  const renderLabel = () => {
    if (!showLabel && !showPercentage && !children) return null;

    const displayText = children || (
      <View style={styles.labelContainer}>
        {showLabel && label && (
          <Text style={[styles.labelText, { color: textColor, fontSize, fontWeight }, labelStyle]}>
            {label}
          </Text>
        )}
        {showPercentage && (
          <Text style={[styles.percentageText, { color: textColor, fontSize, fontWeight }, labelStyle]}>
            {formatValue ? formatValue(value || clampedProgress) : `${Math.round(clampedProgress)}%`}
          </Text>
        )}
      </View>
    );

    if (labelPosition === 'inside' || labelPosition === 'overlay') {
      return null; // Rendered inside the progress bar
    }

    return (
      <View style={[
        styles.labelWrapper,
        labelPosition === 'bottom' && styles.labelBottom,
      ]}>
        {displayText}
      </View>
    );
  };

  const renderMinMaxLabels = () => {
    if (!showMinMax) return null;

    return (
      <View style={styles.minMaxContainer}>
        <Text style={[styles.minMaxText, { color: textColor, fontSize: fontSize * 0.8 }]}>
          {formatValue ? formatValue(min) : min}
        </Text>
        <Text style={[styles.minMaxText, { color: textColor, fontSize: fontSize * 0.8 }]}>
          {formatValue ? formatValue(max) : max}
        </Text>
      </View>
    );
  };

  const renderSegmentedBar = () => {
    if (!segments) return null;

    const segmentWidth = 100 / segments;
    const segmentElements = [];

    for (let i = 0; i < segments; i++) {
      const segmentProgress = Math.max(0, Math.min(segmentWidth, clampedProgress - i * segmentWidth));
      const isActive = segmentProgress > 0;

      segmentElements.push(
        <View
          key={i}
          style={[
            styles.segment,
            {
              width: `${segmentWidth}%`,
              height,
              backgroundColor: isActive ? color : backgroundColor,
              marginRight: i < segments - 1 ? segmentGap : 0,
              borderRadius: calculatedBorderRadius,
            },
          ]}
        />
      );
    }

    return <View style={styles.segmentContainer}>{segmentElements}</View>;
  };

  const renderProgressFill = () => {
    if (segments) return null;

    const fillComponent = gradient ? (
      <LinearGradient
        colors={gradientColors}
        start={gradientDirection === 'horizontal' ? { x: 0, y: 0 } : { x: 0, y: 0 }}
        end={gradientDirection === 'horizontal' ? { x: 1, y: 0 } : { x: 0, y: 1 }}
        style={[
          styles.progressFill,
          {
            height,
            borderRadius: calculatedBorderRadius,
          },
          fillStyle,
        ]}
      />
    ) : (
      <View
        style={[
          styles.progressFill,
          {
            height,
            backgroundColor: color,
            borderRadius: calculatedBorderRadius,
          },
          striped && styles.stripedFill,
          fillStyle,
        ]}
      />
    );

    return (
      <Animated.View style={[animatedWidthStyle, styles.fillContainer]}>
        {fillComponent}
        {glowEffect && (
          <View
            style={[
              styles.glowEffect,
              {
                height: height + 4,
                backgroundColor: color,
                borderRadius: calculatedBorderRadius,
                shadowColor: color,
              },
            ]}
          />
        )}
      </Animated.View>
    );
  };

  const renderInsideLabel = () => {
    if (labelPosition !== 'inside' && labelPosition !== 'overlay') return null;

    const displayText = children || (
      <View style={styles.insideLabelContainer}>
        {showLabel && label && (
          <Text style={[
            styles.insideLabelText,
            {
              color: labelPosition === 'overlay' ? textColor : '#FFFFFF',
              fontSize: fontSize * 0.9,
              fontWeight,
            },
            labelStyle,
          ]}>
            {label}
          </Text>
        )}
        {showPercentage && (
          <Text style={[
            styles.insidePercentageText,
            {
              color: labelPosition === 'overlay' ? textColor : '#FFFFFF',
              fontSize: fontSize * 0.9,
              fontWeight,
            },
            labelStyle,
          ]}>
            {formatValue ? formatValue(value || clampedProgress) : `${Math.round(clampedProgress)}%`}
          </Text>
        )}
      </View>
    );

    return (
      <View style={[
        styles.insideLabelWrapper,
        {
          height,
          paddingHorizontal: 8,
        },
        labelPosition === 'overlay' && styles.overlayLabel,
      ]}>
        {displayText}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: pulseValue }] },
        containerStyle,
      ]}
    >
      {renderLabel()}
      
      <View style={[styles.progressContainer, { width }, style]}>
        <View
          style={[
            styles.progressTrack,
            {
              height,
              backgroundColor,
              borderRadius: calculatedBorderRadius,
            },
            trackStyle,
          ]}
        >
          {renderSegmentedBar()}
          {renderProgressFill()}
          {renderInsideLabel()}
        </View>
      </View>

      {renderMinMaxLabels()}
    </Animated.View>
  );
}

// Preset variants for common use cases
export function ProgressBarThin(props: Partial<ProgressBarProps>) {
  return <ProgressBar height={4} {...props} />;
}

export function ProgressBarThick(props: Partial<ProgressBarProps>) {
  return <ProgressBar height={16} {...props} />;
}

export function ProgressBarGradient(props: Partial<ProgressBarProps>) {
  return (
    <ProgressBar
      gradient={true}
      glowEffect={true}
      gradientColors={[DesignTokens.colors.primary[400], DesignTokens.colors.primary[600]]}
      {...props}
    />
  );
}

export function ProgressBarSegmented(props: Partial<ProgressBarProps>) {
  return (
    <ProgressBar
      segments={10}
      segmentGap={2}
      height={12}
      {...props}
    />
  );
}

export function ProgressBarWithLabel(props: Partial<ProgressBarProps>) {
  return (
    <ProgressBar
      showLabel={true}
      showPercentage={true}
      labelPosition="top"
      height={12}
      {...props}
    />
  );
}

export function ProgressBarMinimal(props: Partial<ProgressBarProps>) {
  return (
    <ProgressBar
      height={2}
      backgroundColor="transparent"
      borderRadius={0}
      {...props}
    />
  );
}

export function ProgressBarSuccess(props: Partial<ProgressBarProps>) {
  return (
    <ProgressBar
      color={DesignTokens.colors.success[500]}
      gradient={true}
      gradientColors={[DesignTokens.colors.success[400], DesignTokens.colors.success[600]]}
      {...props}
    />
  );
}

export function ProgressBarWarning(props: Partial<ProgressBarProps>) {
  return (
    <ProgressBar
      color={DesignTokens.colors.warning[500]}
      gradient={true}
      gradientColors={[DesignTokens.colors.warning[400], DesignTokens.colors.warning[600]]}
      {...props}
    />
  );
}

export function ProgressBarError(props: Partial<ProgressBarProps>) {
  return (
    <ProgressBar
      color={DesignTokens.colors.error[500]}
      gradient={true}
      gradientColors={[DesignTokens.colors.error[400], DesignTokens.colors.error[600]]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressContainer: {
    position: 'relative',
  },
  progressTrack: {
    overflow: 'hidden',
    position: 'relative',
  },
  fillContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  progressFill: {
    flex: 1,
  },
  stripedFill: {
    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
  },
  glowEffect: {
    position: 'absolute',
    top: -2,
    left: 0,
    right: 0,
    opacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  segmentContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  segment: {
    borderRadius: 2,
  },
  labelWrapper: {
    marginBottom: 4,
  },
  labelBottom: {
    marginBottom: 0,
    marginTop: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: {
    flex: 1,
  },
  percentageText: {
    textAlign: 'right',
  },
  insideLabelWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  overlayLabel: {
    backgroundColor: 'transparent',
  },
  insideLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insideLabelText: {
    marginRight: 4,
    fontSize: 10,
    fontWeight: '600',
  },
  insidePercentageText: {
    fontSize: 10,
    fontWeight: '600',
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  minMaxText: {
    opacity: 0.7,
  },
});
