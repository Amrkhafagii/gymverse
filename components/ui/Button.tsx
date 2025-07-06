/**
 * Production-ready Button component with offline states
 * Integrates with sync system for intelligent state management
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '@/design-system/tokens';

export interface ButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  syncStatus?: 'synced' | 'pending' | 'failed' | 'offline';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
  syncStatus,
}) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handlePress = async () => {
    if (disabled || loading || isProcessing) return;

    try {
      setIsProcessing(true);
      await onPress();
    } catch (error) {
      console.error('Button action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = loading || isProcessing;
  const isDisabled = disabled || isLoading;

  const buttonStyles = [
    styles.base,
    styles[size],
    styles[variant],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    isPressed && styles.pressed,
    syncStatus && styles[`sync_${syncStatus}`],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${size}`],
    styles[`text_${variant}`],
    isDisabled && styles.textDisabled,
    textStyle,
  ];

  const renderContent = () => (
    <View style={styles.content}>
      {isLoading && (
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'small'}
          color={variant === 'primary' || variant === 'gradient' ? '#FFFFFF' : DesignTokens.colors.primary[500]}
          style={styles.loader}
        />
      )}
      {!isLoading && icon && iconPosition === 'left' && (
        <View style={styles.iconLeft}>{icon}</View>
      )}
      <Text style={textStyles} numberOfLines={1}>
        {isLoading ? 'Processing...' : title}
      </Text>
      {!isLoading && icon && iconPosition === 'right' && (
        <View style={styles.iconRight}>{icon}</View>
      )}
      {syncStatus && !isLoading && (
        <View style={[styles.syncIndicator, styles[`syncIndicator_${syncStatus}`]]} />
      )}
    </View>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        style={[styles.base, styles[size], fullWidth && styles.fullWidth, style]}
        onPress={handlePress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            isDisabled
              ? ['#666666', '#555555']
              : isPressed
              ? ['#7C3AED', '#6D28D9']
              : ['#9E7FFF', '#7C3AED']
          }
          style={[styles.gradient, isPressed && styles.gradientPressed]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: DesignTokens.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...DesignTokens.shadow.sm,
  },
  
  // Sizes
  small: {
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    minHeight: 44,
  },
  large: {
    paddingHorizontal: DesignTokens.spacing[6],
    paddingVertical: DesignTokens.spacing[4],
    minHeight: 52,
  },

  // Variants
  primary: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  secondary: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: DesignTokens.colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  gradient: {
    backgroundColor: 'transparent',
  },

  // Text styles
  text: {
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  text_small: {
    fontSize: DesignTokens.typography.fontSize.sm,
  },
  text_medium: {
    fontSize: DesignTokens.typography.fontSize.base,
  },
  text_large: {
    fontSize: DesignTokens.typography.fontSize.lg,
  },
  text_primary: {
    color: DesignTokens.colors.text.primary,
  },
  text_secondary: {
    color: DesignTokens.colors.text.primary,
  },
  text_outline: {
    color: DesignTokens.colors.primary[500],
  },
  text_ghost: {
    color: DesignTokens.colors.primary[500],
  },
  text_gradient: {
    color: DesignTokens.colors.text.primary,
  },

  // States
  disabled: {
    opacity: 0.5,
    ...DesignTokens.shadow.none,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  textDisabled: {
    opacity: 0.7,
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

  // Layout
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
  // Icons
  iconLeft: {
    marginRight: DesignTokens.spacing[2],
  },
  iconRight: {
    marginLeft: DesignTokens.spacing[2],
  },
  loader: {
    marginRight: DesignTokens.spacing[2],
  },

  // Gradient
  gradient: {
    flex: 1,
    borderRadius: DesignTokens.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
  },
  gradientPressed: {
    opacity: 0.9,
  },

  // Sync indicators
  syncIndicator: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
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
