/**
 * Production-ready LoadingSpinner component with context integration
 * Integrates with offline sync system for intelligent loading states
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '@/design-system/tokens';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
  variant?: 'default' | 'gradient' | 'pulse';
  style?: ViewStyle;
  syncAware?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color,
  message,
  overlay = false,
  variant = 'default',
  style,
  syncAware = true,
}) => {
  const { isOnline, syncStatus } = useOfflineSync();
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (variant === 'pulse') {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }

    if (variant === 'gradient') {
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();
      return () => rotateAnimation.stop();
    }
  }, [variant]);

  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 32;
      case 'large':
        return 48;
      default:
        return 32;
    }
  };

  const getSpinnerColor = () => {
    if (color) return color;
    if (!isOnline && syncAware) return DesignTokens.colors.text.secondary;
    return DesignTokens.colors.primary[500];
  };

  const getMessage = () => {
    if (message) return message;
    if (!isOnline && syncAware) return 'Working offline...';
    if (syncStatus === 'syncing' && syncAware) return 'Syncing data...';
    return 'Loading...';
  };

  const containerStyles = [
    overlay ? styles.overlay : styles.container,
    styles[`container_${size}`],
    !isOnline && syncAware && styles.offline,
    style,
  ];

  const renderSpinner = () => {
    if (variant === 'pulse') {
      const scale = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1.2],
      });

      const opacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1],
      });

      return (
        <Animated.View
          style={[
            styles.pulseSpinner,
            {
              width: getSpinnerSize(),
              height: getSpinnerSize(),
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          <View
            style={[
              styles.pulseCircle,
              {
                backgroundColor: getSpinnerColor(),
                borderRadius: getSpinnerSize() / 2,
              },
            ]}
          />
        </Animated.View>
      );
    }

    if (variant === 'gradient') {
      const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      });

      return (
        <Animated.View
          style={[
            styles.gradientSpinner,
            {
              width: getSpinnerSize(),
              height: getSpinnerSize(),
              transform: [{ rotate: rotation }],
            },
          ]}
        >
          <LinearGradient
            colors={['#9E7FFF', '#7C3AED', 'transparent']}
            style={[
              styles.gradientCircle,
              {
                borderRadius: getSpinnerSize() / 2,
              },
            ]}
          />
        </Animated.View>
      );
    }

    return (
      <ActivityIndicator
        size={size === 'small' ? 'small' : 'large'}
        color={getSpinnerColor()}
      />
    );
  };

  return (
    <View style={containerStyles}>
      <View style={styles.spinnerContainer}>
        {renderSpinner()}
        {syncAware && syncStatus && (
          <View style={[styles.syncIndicator, styles[`syncIndicator_${syncStatus}`]]} />
        )}
      </View>
      
      {(message || syncAware) && (
        <Text style={[styles.message, styles[`message_${size}`]]}>
          {getMessage()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: DesignTokens.spacing[4],
  },
  
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  
  // Size variants
  container_small: {
    padding: DesignTokens.spacing[2],
  },
  container_medium: {
    padding: DesignTokens.spacing[4],
  },
  container_large: {
    padding: DesignTokens.spacing[6],
  },
  
  // States
  offline: {
    opacity: 0.7,
  },
  
  spinnerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Pulse variant
  pulseSpinner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  pulseCircle: {
    width: '100%',
    height: '100%',
  },
  
  // Gradient variant
  gradientSpinner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  gradientCircle: {
    width: '100%',
    height: '100%',
  },
  
  message: {
    marginTop: DesignTokens.spacing[3],
    textAlign: 'center',
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  
  message_small: {
    fontSize: DesignTokens.typography.fontSize.xs,
    marginTop: DesignTokens.spacing[2],
  },
  message_medium: {
    fontSize: DesignTokens.typography.fontSize.sm,
    marginTop: DesignTokens.spacing[3],
  },
  message_large: {
    fontSize: DesignTokens.typography.fontSize.base,
    marginTop: DesignTokens.spacing[4],
  },
  
  // Sync indicators
  syncIndicator: {
    position: 'absolute',
    right: -8,
    top: -8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  syncIndicator_syncing: {
    backgroundColor: DesignTokens.colors.warning[500],
  },
  syncIndicator_synced: {
    backgroundColor: DesignTokens.colors.success[500],
  },
  syncIndicator_failed: {
    backgroundColor: DesignTokens.colors.error[500],
  },
  syncIndicator_offline: {
    backgroundColor: DesignTokens.colors.text.secondary,
  },
});
