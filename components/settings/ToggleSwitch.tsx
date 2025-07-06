import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  activeColor?: string;
  inactiveColor?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  size = 'medium',
  activeColor = DesignTokens.colors.primary[500],
  inactiveColor = DesignTokens.colors.neutral[600],
}) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  const handlePress = async () => {
    if (disabled) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange(!value);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: 40,
          height: 24,
          thumbSize: 18,
          thumbMargin: 3,
        };
      case 'large':
        return {
          width: 60,
          height: 32,
          thumbSize: 26,
          thumbMargin: 3,
        };
      default:
        return {
          width: 50,
          height: 28,
          thumbSize: 22,
          thumbMargin: 3,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const trackColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, sizeStyles.width - sizeStyles.thumbSize - sizeStyles.thumbMargin * 2],
  });

  const thumbScale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: sizeStyles.width,
          height: sizeStyles.height,
        },
        disabled && styles.disabled,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: trackColor,
            width: sizeStyles.width,
            height: sizeStyles.height,
            borderRadius: sizeStyles.height / 2,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.thumb,
          {
            width: sizeStyles.thumbSize,
            height: sizeStyles.thumbSize,
            borderRadius: sizeStyles.thumbSize / 2,
            transform: [
              { translateX: thumbTranslateX },
              { scale: thumbScale },
            ],
            top: sizeStyles.thumbMargin,
            left: sizeStyles.thumbMargin,
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    ...DesignTokens.shadow.sm,
  },
  thumb: {
    position: 'absolute',
    backgroundColor: DesignTokens.colors.neutral[0],
    ...DesignTokens.shadow.base,
  },
  disabled: {
    opacity: 0.5,
  },
});
