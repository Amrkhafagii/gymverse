import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface SegmentedControlProps<T extends string> {
  options: readonly T[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  labels?: Record<T, string>;
  disabled?: boolean;
}

export default function SegmentedControl<T extends string>({
  options,
  selectedValue,
  onValueChange,
  labels,
  disabled = false,
}: SegmentedControlProps<T>) {
  const handleValueChange = async (value: T) => {
    if (disabled || value === selectedValue) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange(value);
  };

  const getLabel = (option: T) => {
    return labels?.[option] || option.charAt(0).toUpperCase() + option.slice(1);
  };

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      <LinearGradient
        colors={['#1f2937', '#111827']}
        style={styles.background}
      >
        {options.map((option, index) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.segment,
              index === 0 && styles.segmentFirst,
              index === options.length - 1 && styles.segmentLast,
              selectedValue === option && styles.segmentSelected,
            ]}
            onPress={() => handleValueChange(option)}
            disabled={disabled}
            activeOpacity={0.8}
          >
            {selectedValue === option && (
              <LinearGradient
                colors={[DesignTokens.colors.primary[500], DesignTokens.colors.primary[600]]}
                style={[
                  styles.selectedBackground,
                  index === 0 && styles.selectedBackgroundFirst,
                  index === options.length - 1 && styles.selectedBackgroundLast,
                ]}
              />
            )}
            
            <Text
              style={[
                styles.segmentText,
                selectedValue === option && styles.segmentTextSelected,
                disabled && styles.segmentTextDisabled,
              ]}
            >
              {getLabel(option)}
            </Text>
          </TouchableOpacity>
        ))}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  containerDisabled: {
    opacity: 0.5,
  },
  background: {
    flexDirection: 'row',
    padding: DesignTokens.spacing[1],
  },
  segment: {
    flex: 1,
    paddingVertical: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: DesignTokens.borderRadius.md,
  },
  segmentFirst: {
    borderTopLeftRadius: DesignTokens.borderRadius.lg - 2,
    borderBottomLeftRadius: DesignTokens.borderRadius.lg - 2,
  },
  segmentLast: {
    borderTopRightRadius: DesignTokens.borderRadius.lg - 2,
    borderBottomRightRadius: DesignTokens.borderRadius.lg - 2,
  },
  segmentSelected: {
    // Selected styling handled by gradient overlay
  },
  selectedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: DesignTokens.borderRadius.md,
  },
  selectedBackgroundFirst: {
    borderTopLeftRadius: DesignTokens.borderRadius.lg - 2,
    borderBottomLeftRadius: DesignTokens.borderRadius.lg - 2,
  },
  selectedBackgroundLast: {
    borderTopRightRadius: DesignTokens.borderRadius.lg - 2,
    borderBottomRightRadius: DesignTokens.borderRadius.lg - 2,
  },
  segmentText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textAlign: 'center',
    zIndex: 1,
  },
  segmentTextSelected: {
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  segmentTextDisabled: {
    color: DesignTokens.colors.text.tertiary,
  },
});
