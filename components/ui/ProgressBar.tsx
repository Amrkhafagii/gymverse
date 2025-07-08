/**
 * Production-ready ProgressBar component with context integration
 * Integrates with achievement and workout systems for dynamic progress tracking
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '@/design-system/tokens';
import { useAchievements } from '@/contexts/AchievementContext';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showLabel?: boolean;
  label?: string;
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'error';
  animated?: boolean;
  style?: ViewStyle;
  achievementId?: string;
  syncStatus?: 'synced' | 'pending' | 'failed' | 'offline';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  showLabel = false,
  label,
  variant = 'default',
  animated = true,
  style,
  achievementId,
  syncStatus,
}) => {
  const { getAchievementProgress } = useAchievements();
  const { isOnline } = useOfflineSync();
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Get achievement progress if achievementId is provided
  const achievementProgress = achievementId ? getAchievementProgress(achievementId) : null;
  const currentProgress = achievementProgress?.progress ?? progress;
  const displayLabel = label || achievementProgress?.title || `${Math.round(currentProgress)}%`;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: currentProgress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(currentProgress);
    }
  }, [currentProgress, animated]);

  useEffect(() => {
    if (currentProgress >= 100) {
      // Pulse animation for completed progress
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [currentProgress]);

  const getProgressColor = () => {
    switch (variant) {
      case 'success':
        return DesignTokens.colors.success[500];
      case 'warning':
        return DesignTokens.colors.warning[500];
      case 'error':
        return DesignTokens.colors.error[500];
      case 'gradient':
        return null; // Will use gradient
      default:
        return DesignTokens.colors.primary[500];
    }
  };

  const getBackgroundColor = () => {
    if (!isOnline) return DesignTokens.colors.surface.secondary;
    return DesignTokens.colors.surface.tertiary;
  };

  const containerStyles = [
    styles.container,
    !isOnline && styles.offline,
    syncStatus && styles[`sync_${syncStatus}`],
    style,
  ];

  const trackStyles = [
    styles.track,
    {
      height,
      backgroundColor: getBackgroundColor(),
    },
  ];

  const progressStyles = [
    styles.progress,
    {
      height,
      backgroundColor: variant !== 'gradient' ? getProgressColor() : 'transparent',
    },
  ];

  const animatedProgressWidth = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const renderProgressFill = () => {
    if (variant === 'gradient') {
      return (
        <Animated.View style={[progressStyles, { width: animatedProgressWidth }]}>
          <LinearGradient
            colors={
              currentProgress >= 100
                ? ['#10B981', '#059669'] // Success gradient for completion
                : ['#9E7FFF', '#7C3AED']
            }
            style={styles.gradientFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      );
    }

    return (
      <Animated.View style={[progressStyles, { width: animatedProgressWidth }]} />
    );
  };

  return (
    <Animated.View style={[containerStyles, { transform: [{ scale: pulseAnim }] }]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{displayLabel}</Text>
          <Text style={styles.percentage}>{Math.round(currentProgress)}%</Text>
        </View>
      )}
      
      <View style={trackStyles}>
        {renderProgressFill()}
        
        {syncStatus && (
          <View style={[styles.syncIndicator, styles[`syncIndicator_${syncStatus}`]]} />
        )}
        
        {achievementProgress?.isCompleted && (
          <View style={styles.completionIndicator}>
            <Text style={styles.completionText}>✓</Text>
          </View>
        )}
      </View>
      
      {achievementProgress && (
        <Text style={styles.achievementDescription}>
          {achievementProgress.description}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  
  // States
  offline: {
    opacity: 0.7,
  },
  
  // Sync status
  sync_synced: {
    borderLeftWidth: 2,
    borderLeftColor: DesignTokens.colors.success[500],
    paddingLeft: DesignTokens.spacing[2],
  },
  sync_pending: {
    borderLeftWidth: 2,
    borderLeftColor: DesignTokens.colors.warning[500],
    paddingLeft: DesignTokens.spacing[2],
  },
  sync_failed: {
    borderLeftWidth: 2,
    borderLeftColor: DesignTokens.colors.error[500],
    paddingLeft: DesignTokens.spacing[2],
  },
  sync_offline: {
    borderLeftWidth: 2,
    borderLeftColor: DesignTokens.colors.text.secondary,
    paddingLeft: DesignTokens.spacing[2],
  },
  
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  
  label: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    flex: 1,
  },
  
  percentage: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.secondary,
  },
  
  track: {
    borderRadius: DesignTokens.borderRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  
  progress: {
    borderRadius: DesignTokens.borderRadius.full,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  
  gradientFill: {
    flex: 1,
    borderRadius: DesignTokens.borderRadius.full,
  },
  
  syncIndicator: {
    position: 'absolute',
    right: 2,
    top: '50%',
    width: 4,
    height: 4,
    borderRadius: 2,
    transform: [{ translateY: -2 }],
  },
  
  syncIndicator_synced: {
    backgroundColor: DesignTokens.colors.success[500],
  },
  syncIndicator_pending: {
    backgroundColor: DesignTokens.colors.warning[500],
  },
  syncIndicator_failed: {
    backgroundColor: DesignTokens.colors.error[500],
  },
  syncIndicator_offline: {
    backgroundColor: DesignTokens.colors.text.secondary,
  },
  
  completionIndicator: {
    position: 'absolute',
    right: 4,
    top: '50%',
    transform: [{ translateY: -8 }],
    backgroundColor: DesignTokens.colors.success[500],
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  completionText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  achievementDescription: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
});
