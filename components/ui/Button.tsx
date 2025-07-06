import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '@/design-system/tokens';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const buttonStyles = [
    styles.base,
    styles[size],
    styles[variant],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        style={[styles.base, styles[size], style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={disabled ? ['#404040', '#262626'] : ['#9E7FFF', '#7C3AED']}
          style={styles.gradientContainer}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              {icon}
              <Text style={textStyles}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? '#FFFFFF' : '#9E7FFF'} 
          size="small" 
        />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: DesignTokens.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing[2],
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
    borderColor: DesignTokens.colors.neutral[700],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  gradient: {
    backgroundColor: 'transparent',
  },
  
  // States
  disabled: {
    backgroundColor: DesignTokens.colors.neutral[800],
    borderColor: DesignTokens.colors.neutral[700],
  },
  
  // Text styles
  text: {
    fontFamily: DesignTokens.typography.fontFamily.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  smallText: {
    fontSize: DesignTokens.typography.fontSize.sm,
  },
  mediumText: {
    fontSize: DesignTokens.typography.fontSize.base,
  },
  largeText: {
    fontSize: DesignTokens.typography.fontSize.lg,
  },
  
  // Text variants
  primaryText: {
    color: DesignTokens.colors.text.primary,
  },
  secondaryText: {
    color: DesignTokens.colors.text.primary,
  },
  ghostText: {
    color: DesignTokens.colors.primary[500],
  },
  gradientText: {
    color: DesignTokens.colors.text.primary,
  },
  disabledText: {
    color: DesignTokens.colors.text.disabled,
  },
  
  gradientContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
  },
});
