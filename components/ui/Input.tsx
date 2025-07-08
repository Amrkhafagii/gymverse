/**
 * Production-ready Input component with validation and offline states
 * Integrates with form validation and sync system
 */

import React, { useState, useRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DesignTokens } from '@/design-system/tokens';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  required?: boolean;
  containerStyle?: ViewStyle;
  syncStatus?: 'synced' | 'pending' | 'failed' | 'offline';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'outlined',
  size = 'medium',
  required = false,
  containerStyle,
  syncStatus,
  style,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(textInputProps.secureTextEntry);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { isOnline } = useOfflineSync();

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  };

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? DesignTokens.colors.error[500] : DesignTokens.colors.border.primary,
      error ? DesignTokens.colors.error[500] : DesignTokens.colors.primary[500],
    ],
  });

  const containerStyles = [
    styles.container,
    containerStyle,
  ];

  const inputContainerStyles = [
    styles.inputContainer,
    styles[variant],
    styles[`size_${size}`],
    error && styles.error,
    isFocused && styles.focused,
    !isOnline && styles.offline,
    syncStatus && styles[`sync_${syncStatus}`],
  ];

  const inputStyles = [
    styles.input,
    styles[`input_${size}`],
    leftIcon && styles.inputWithLeftIcon,
    (rightIcon || textInputProps.secureTextEntry) && styles.inputWithRightIcon,
    style,
  ];

  return (
    <View style={containerStyles}>
      {label && (
        <Text style={[styles.label, error && styles.labelError]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <Animated.View style={[inputContainerStyles, { borderColor }]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? DesignTokens.colors.error[500] : DesignTokens.colors.text.secondary}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={inputStyles}
          placeholderTextColor={DesignTokens.colors.text.secondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isSecure}
          editable={isOnline}
          {...textInputProps}
        />
        
        {textInputProps.secureTextEntry && (
          <TouchableOpacity onPress={toggleSecureEntry} style={styles.rightIcon}>
            <Ionicons
              name={isSecure ? 'eye-off' : 'eye'}
              size={20}
              color={DesignTokens.colors.text.secondary}
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !textInputProps.secureTextEntry && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons
              name={rightIcon}
              size={20}
              color={DesignTokens.colors.text.secondary}
            />
          </TouchableOpacity>
        )}
        
        {syncStatus && (
          <View style={[styles.syncIndicator, styles[`syncIndicator_${syncStatus}`]]} />
        )}
      </Animated.View>
      
      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignTokens.spacing[4],
  },
  
  label: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  
  labelError: {
    color: DesignTokens.colors.error[500],
  },
  
  required: {
    color: DesignTokens.colors.error[500],
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.primary,
    position: 'relative',
  },
  
  // Variants
  default: {
    backgroundColor: DesignTokens.colors.surface.secondary,
  },
  outlined: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.border.primary,
    backgroundColor: DesignTokens.colors.surface.primary,
  },
  filled: {
    backgroundColor: DesignTokens.colors.surface.secondary,
  },
  
  // Sizes
  size_small: {
    minHeight: 36,
    paddingHorizontal: DesignTokens.spacing[3],
  },
  size_medium: {
    minHeight: 44,
    paddingHorizontal: DesignTokens.spacing[4],
  },
  size_large: {
    minHeight: 52,
    paddingHorizontal: DesignTokens.spacing[5],
  },
  
  // States
  focused: {
    borderWidth: 2,
  },
  error: {
    borderColor: DesignTokens.colors.error[500],
  },
  offline: {
    opacity: 0.6,
    backgroundColor: DesignTokens.colors.surface.secondary,
  },
  
  // Sync status
  sync_synced: {
    borderRightWidth: 3,
    borderRightColor: DesignTokens.colors.success[500],
  },
  sync_pending: {
    borderRightWidth: 3,
    borderRightColor: DesignTokens.colors.warning[500],
  },
  sync_failed: {
    borderRightWidth: 3,
    borderRightColor: DesignTokens.colors.error[500],
  },
  sync_offline: {
    borderRightWidth: 3,
    borderRightColor: DesignTokens.colors.text.secondary,
  },
  
  input: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    paddingVertical: 0,
  },
  
  input_small: {
    fontSize: DesignTokens.typography.fontSize.sm,
  },
  input_medium: {
    fontSize: DesignTokens.typography.fontSize.base,
  },
  input_large: {
    fontSize: DesignTokens.typography.fontSize.lg,
  },
  
  inputWithLeftIcon: {
    marginLeft: DesignTokens.spacing[2],
  },
  
  inputWithRightIcon: {
    marginRight: DesignTokens.spacing[2],
  },
  
  leftIcon: {
    marginRight: DesignTokens.spacing[2],
  },
  
  rightIcon: {
    padding: DesignTokens.spacing[1],
    marginLeft: DesignTokens.spacing[2],
  },
  
  helperText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  
  errorText: {
    color: DesignTokens.colors.error[500],
  },
  
  syncIndicator: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
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
