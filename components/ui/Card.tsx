/**
 * Production-ready Card component with offline states
 * Integrates with sync system for intelligent state management
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '@/design-system/tokens';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  pressable?: boolean;
  syncStatus?: 'synced' | 'pending' | 'failed' | 'offline';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  style,
  pressable = false,
  syncStatus,
  onPress,
  ...touchableProps
}) => {
  const { isOnline } = useOfflineSync();
  
  const cardStyles = [
    styles.base,
    styles[variant],
    styles[`padding_${padding}`],
    syncStatus && styles[`sync_${syncStatus}`],
    !isOnline && styles.offline,
    style,
  ];

  const renderContent = () => (
    <View style={cardStyles}>
      {syncStatus && (
        <View style={[styles.syncIndicator, styles[`syncIndicator_${syncStatus}`]]} />
      )}
      {children}
    </View>
  );

  if (variant === 'gradient') {
    const GradientCard = pressable ? TouchableOpacity : View;
    return (
      <GradientCard
        style={[styles.base, styles[`padding_${padding}`], style]}
        onPress={pressable ? onPress : undefined}
        {...(pressable ? touchableProps : {})}
      >
        <LinearGradient
          colors={['#9E7FFF', '#7C3AED']}
          style={styles.gradient}
        >
          {syncStatus && (
            <View style={[styles.syncIndicator, styles[`syncIndicator_${syncStatus}`]]} />
          )}
          {children}
        </LinearGradient>
      </GradientCard>
    );
  }

  if (pressable) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.95}
        {...touchableProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  base: {
    borderRadius: DesignTokens.borderRadius.lg,
    backgroundColor: DesignTokens.colors.surface.primary,
    position: 'relative',
  },

  // Variants
  default: {
    backgroundColor: DesignTokens.colors.surface.primary,
  },
  elevated: {
    backgroundColor: DesignTokens.colors.surface.primary,
    ...DesignTokens.shadow.md,
  },
  outlined: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border.primary,
  },
  gradient: {
    backgroundColor: 'transparent',
  },

  // Padding variants
  padding_none: {
    padding: 0,
  },
  padding_small: {
    padding: DesignTokens.spacing[2],
  },
  padding_medium: {
    padding: DesignTokens.spacing[4],
  },
  padding_large: {
    padding: DesignTokens.spacing[6],
  },

  // Sync status indicators
  sync_synced: {
    borderLeftWidth: 3,
    borderLeftColor: DesignTokens.colors.success[500],
  },
  sync_pending: {
    borderLeftWidth: 3,
    borderLeftColor: DesignTokens.colors.warning[500],
  },
  sync_failed: {
    borderLeftWidth: 3,
    borderLeftColor: DesignTokens.colors.error[500],
  },
  sync_offline: {
    borderLeftWidth: 3,
    borderLeftColor: DesignTokens.colors.text.secondary,
  },

  // Offline state
  offline: {
    opacity: 0.8,
    backgroundColor: DesignTokens.colors.surface.secondary,
  },

  // Gradient overlay
  gradient: {
    flex: 1,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
  },

  // Sync indicators
  syncIndicator: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 1,
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
});
