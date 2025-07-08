/**
 * Production-ready QuickStartCard component with context integration
 * Integrates with workout and offline systems for intelligent quick actions
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '@/design-system/tokens';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';

export interface QuickStartCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
  gradient: string[];
  disabled?: boolean;
  style?: ViewStyle;
}

export const QuickStartCard: React.FC<QuickStartCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  gradient,
  disabled = false,
  style,
}) => {
  const { isOnline } = useOfflineSync();
  const { isSessionActive } = useWorkoutSession();

  const handlePress = () => {
    if (!disabled && (isOnline || title.includes('Offline'))) {
      onPress();
    }
  };

  const isDisabled = disabled || (!isOnline && !title.includes('Offline'));

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={isDisabled ? ['#4A4A4A', '#3A3A3A'] : gradient}
        style={[styles.gradient, isDisabled && styles.disabled]}
      >
        <div style={styles.iconContainer}>
          {icon}
        </div>
        
        <div style={styles.content}>
          <Text style={[styles.title, isDisabled && styles.disabledText]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, isDisabled && styles.disabledText]}>
            {isDisabled && !isOnline ? 'Requires internet connection' : subtitle}
          </Text>
        </div>

        {isSessionActive && title.includes('Workout') && (
          <div style={styles.activeIndicator} />
        )}
        
        {!isOnline && (
          <div style={styles.offlineIndicator} />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 150,
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.md,
  },
  
  gradient: {
    padding: DesignTokens.spacing[4],
    minHeight: 100,
    justifyContent: 'space-between',
    position: 'relative',
  },
  
  disabled: {
    opacity: 0.6,
  },
  
  iconContainer: {
    alignSelf: 'flex-start',
    marginBottom: DesignTokens.spacing[2],
  },
  
  content: {
    flex: 1,
  },
  
  title: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: DesignTokens.spacing[1],
  },
  
  subtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  
  disabledText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  
  activeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  
  offlineIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6B7280',
  },
});
