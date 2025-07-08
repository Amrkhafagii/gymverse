import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DesignTokens } from '@/design-system/tokens';

interface SocialNotificationBadgeProps {
  count: number;
  variant?: 'small' | 'medium' | 'large';
  color?: string;
  showZero?: boolean;
}

export function SocialNotificationBadge({
  count,
  variant = 'medium',
  color = DesignTokens.colors.error[500],
  showZero = false,
}: SocialNotificationBadgeProps) {
  if (count === 0 && !showZero) {
    return null;
  }

  const getSize = () => {
    switch (variant) {
      case 'small':
        return { width: 16, height: 16, borderRadius: 8 };
      case 'large':
        return { width: 28, height: 28, borderRadius: 14 };
      default:
        return { width: 20, height: 20, borderRadius: 10 };
    }
  };

  const getFontSize = () => {
    switch (variant) {
      case 'small':
        return 10;
      case 'large':
        return 14;
      default:
        return 12;
    }
  };

  const displayCount = count > 99 ? '99+' : count.toString();
  const size = getSize();

  return (
    <View style={[
      styles.badge,
      size,
      { backgroundColor: color },
      count > 9 && variant !== 'small' && styles.badgeWide,
    ]}>
      <Text style={[
        styles.badgeText,
        { fontSize: getFontSize() },
      ]}>
        {displayCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 20,
    paddingHorizontal: 2,
  },
  badgeWide: {
    paddingHorizontal: 4,
  },
  badgeText: {
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
  },
});
