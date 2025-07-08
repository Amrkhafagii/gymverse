/**
 * Production-ready FilterChip component with context integration
 * Integrates with offline sync for intelligent filter behavior
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export interface FilterChipProps {
  label: string;
  count?: number;
  active?: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'default' | 'outlined' | 'filled';
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  count,
  active = false,
  onPress,
  disabled = false,
  style,
  variant = 'outlined',
}) => {
  const { isOnline, syncStatus } = useOfflineSync();

  const isDisabled = disabled || (!isOnline && !label.includes('Cached'));

  const containerStyles = [
    styles.container,
    styles[variant],
    active && styles.active,
    active && styles[`active_${variant}`],
    isDisabled && styles.disabled,
    !isOnline && styles.offline,
    syncStatus && styles[`sync_${syncStatus}`],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    active && styles.activeText,
    active && styles[`activeText_${variant}`],
    isDisabled && styles.disabledText,
  ];

  const countStyles = [
    styles.count,
    active && styles.activeCount,
    isDisabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <Text style={textStyles}>
        {label}
      </Text>
      
      {count !== undefined && (
        <Text style={countStyles}>
          {isOnline ? count : '--'}
        </Text>
      )}
      
      {syncStatus && (
        <div style={[styles.syncIndicator, styles[`syncIndicator_${syncStatus}`]]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.full,
    marginRight: DesignTokens.spacing[2],
    position: 'relative',
  },

  // Variants
  default: {
    backgroundColor: DesignTokens.colors.surface.secondary,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DesignTokens.colors.border.primary,
  },
  filled: {
    backgroundColor: DesignTokens.colors.surface.secondary,
  },

  // Active states
  active: {
    // Base active styles
  },
  active_default: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  active_outlined: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderColor: DesignTokens.colors.primary[500],
  },
  active_filled: {
    backgroundColor: DesignTokens.colors.primary[500],
  },

  // States
  disabled: {
    opacity: 0.5,
  },
  offline: {
    opacity: 0.7,
    backgroundColor: DesignTokens.colors.surface.tertiary,
  },

  // Sync status
  sync_synced: {
    borderBottomWidth: 2,
    borderBottomColor: DesignTokens.colors.success[500],
  },
  sync_pending: {
    borderBottomWidth: 2,
    borderBottomColor: DesignTokens.colors.warning[500],
  },
  sync_failed: {
    borderBottomWidth: 2,
    borderBottomColor: DesignTokens.colors.error[500],
  },
  sync_offline: {
    borderBottomWidth: 2,
    borderBottomColor: DesignTokens.colors.text.secondary,
  },

  text: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
  },

  text_default: {
    color: DesignTokens.colors.text.primary,
  },
  text_outlined: {
    color: DesignTokens.colors.text.primary,
  },
  text_filled: {
    color: DesignTokens.colors.text.primary,
  },

  activeText: {
    color: DesignTokens.colors.text.primary,
  },

  activeText_default: {
    color: '#FFFFFF',
  },
  activeText_outlined: {
    color: '#FFFFFF',
  },
  activeText_filled: {
    color: '#FFFFFF',
  },

  disabledText: {
    color: DesignTokens.colors.text.tertiary,
  },

  count: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
    backgroundColor: DesignTokens.colors.surface.tertiary,
    paddingHorizontal: DesignTokens.spacing[1],
    paddingVertical: 1,
    borderRadius: DesignTokens.borderRadius.sm,
    minWidth: 20,
    textAlign: 'center',
  },

  activeCount: {
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  syncIndicator: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
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
