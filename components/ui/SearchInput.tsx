/**
 * Production-ready SearchInput component with context integration
 * Integrates with offline sync and provides intelligent search capabilities
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Animated,
} from 'react-native';
import { Search, X, Wifi, WifiOff } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export interface SearchInputProps extends Omit<TextInputProps, 'style'> {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  showClearButton?: boolean;
  debounceMs?: number;
  style?: ViewStyle;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  onClear,
  showClearButton = true,
  debounceMs = 300,
  style,
  variant = 'outlined',
  size = 'medium',
  value,
  onChangeText,
  placeholder = 'Search...',
  ...textInputProps
}) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const { isOnline, syncStatus } = useOfflineSync();
  const debounceRef = useRef<NodeJS.Timeout>();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (isFocused) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused]);

  const handleChangeText = (text: string) => {
    setInternalValue(text);
    onChangeText?.(text);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearch?.(text);
    }, debounceMs);
  };

  const handleClear = () => {
    setInternalValue('');
    onChangeText?.('');
    onClear?.();
    onSearch?.('');
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    textInputProps.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    textInputProps.onBlur?.(e);
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      DesignTokens.colors.border.primary,
      DesignTokens.colors.primary[500],
    ],
  });

  const containerStyles = [
    styles.container,
    styles[variant],
    styles[`size_${size}`],
    !isOnline && styles.offline,
    syncStatus && styles[`sync_${syncStatus}`],
    style,
  ];

  const inputStyles = [
    styles.input,
    styles[`input_${size}`],
  ];

  return (
    <Animated.View style={[containerStyles, { borderColor }]}>
      <Search 
        size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
        color={DesignTokens.colors.text.secondary} 
        style={styles.searchIcon}
      />
      
      <TextInput
        style={inputStyles}
        value={internalValue}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={isOnline ? placeholder : `${placeholder} (offline)`}
        placeholderTextColor={DesignTokens.colors.text.secondary}
        editable={isOnline}
        {...textInputProps}
      />
      
      {showClearButton && internalValue.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <X 
            size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
            color={DesignTokens.colors.text.secondary} 
          />
        </TouchableOpacity>
      )}
      
      {/* Connection status indicator */}
      <View style={styles.statusIndicator}>
        {isOnline ? (
          <Wifi size={12} color={DesignTokens.colors.success[500]} />
        ) : (
          <WifiOff size={12} color={DesignTokens.colors.text.secondary} />
        )}
      </View>
      
      {syncStatus && (
        <View style={[styles.syncIndicator, styles[`syncIndicator_${syncStatus}`]]} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  offline: {
    opacity: 0.7,
    backgroundColor: DesignTokens.colors.surface.secondary,
  },

  // Sync status
  sync_synced: {
    borderRightWidth: 2,
    borderRightColor: DesignTokens.colors.success[500],
  },
  sync_pending: {
    borderRightWidth: 2,
    borderRightColor: DesignTokens.colors.warning[500],
  },
  sync_failed: {
    borderRightWidth: 2,
    borderRightColor: DesignTokens.colors.error[500],
  },
  sync_offline: {
    borderRightWidth: 2,
    borderRightColor: DesignTokens.colors.text.secondary,
  },

  searchIcon: {
    marginRight: DesignTokens.spacing[2],
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

  clearButton: {
    padding: DesignTokens.spacing[1],
    marginLeft: DesignTokens.spacing[2],
  },

  statusIndicator: {
    position: 'absolute',
    right: 8,
    top: 8,
  },

  syncIndicator: {
    position: 'absolute',
    right: 4,
    bottom: 4,
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
