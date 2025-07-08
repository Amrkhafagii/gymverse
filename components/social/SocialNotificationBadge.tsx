import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { DesignTokens } from '@/design-system/tokens';

interface SocialNotificationBadgeProps {
  count: number;
  variant?: 'default' | 'small' | 'large';
  color?: string;
  showZero?: boolean;
  maxCount?: number;
  animated?: boolean;
}

export function SocialNotificationBadge({
  count,
  variant = 'default',
  color = DesignTokens.colors.error[500],
  showZero = false,
  maxCount = 99,
  animated = true,
}: SocialNotificationBadgeProps) {
  const [scaleAnim] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    if (animated && count > 0) {
      // Bounce animation when count changes
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
      ]).start();
    }
  }, [count, animated]);

  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  
  const getBadgeSize = () => {
    switch (variant) {
      case 'small':
        return {
          minWidth: 16,
          height: 16,
          borderRadius: 8,
          paddingHorizontal: 4,
        };
      case 'large':
        return {
          minWidth: 24,
          height: 24,
          borderRadius: 12,
          paddingHorizontal: 8,
        };
      default:
        return {
          minWidth: 20,
          height: 20,
          borderRadius: 10,
          paddingHorizontal: 6,
        };
    }
  };

  const getTextSize = () => {
    switch (variant) {
      case 'small':
        return DesignTokens.typography.fontSize.xs;
      case 'large':
        return DesignTokens.typography.fontSize.sm;
      default:
        return 11;
    }
  };

  const badgeSize = getBadgeSize();
  const textSize = getTextSize();

  return (
    <Animated.View
      style={[
        styles.badge,
        badgeSize,
        { backgroundColor: color },
        animated && { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { fontSize: textSize },
        ]}
        numberOfLines={1}
      >
        {displayCount}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -8,
    right: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  badgeText: {
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
  },
});
