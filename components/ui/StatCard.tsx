/**
 * Production-ready StatCard component with context integration
 * Integrates with analytics and offline systems for intelligent stat display
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useAnalytics } from '@/hooks/useAnalytics';

export interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  onPress?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  style?: ViewStyle;
  analyticsKey?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  icon,
  color = DesignTokens.colors.primary[500],
  trend,
  trendValue,
  onPress,
  variant = 'default',
  style,
  analyticsKey,
}) => {
  const { isOnline, syncStatus } = useOfflineSync();
  const { getMetricTrend } = useAnalytics('week');

  // Get analytics trend if analyticsKey is provided
  const analyticsTrend = analyticsKey ? getMetricTrend(analyticsKey) : null;
  const displayTrend = analyticsTrend?.direction || trend;
  const displayTrendValue = analyticsTrend?.change || trendValue;

  const getTrendIcon = () => {
    switch (displayTrend) {
      case 'up':
        return <TrendingUp size={12} color={DesignTokens.colors.success[500]} />;
      case 'down':
        return <TrendingDown size={12} color={DesignTokens.colors.error[500]} />;
      default:
        return <Minus size={12} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const getTrendColor = () => {
    switch (displayTrend) {
      case 'up':
        return DesignTokens.colors.success[500];
      case 'down':
        return DesignTokens.colors.error[500];
      default:
        return DesignTokens.colors.text.secondary;
    }
  };

  const containerStyles = [
    styles.container,
    styles[`container_${variant}`],
    !isOnline && styles.offline,
    syncStatus && styles[`sync_${syncStatus}`],
    style,
  ];

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={containerStyles}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={styles.header}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            {icon}
          </View>
        )}
        
        {syncStatus && (
          <View style={[styles.syncIndicator, styles[`syncIndicator_${syncStatus}`]]} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color }]}>
            {isOnline ? value : '--'}
          </Text>
          {unit && (
            <Text style={styles.unit}>{unit}</Text>
          )}
        </View>

        <Text style={styles.label}>{label}</Text>

        {(displayTrend && displayTrendValue) && (
          <View style={styles.trendContainer}>
            {getTrendIcon()}
            <Text style={[styles.trendValue, { color: getTrendColor() }]}>
              {displayTrendValue}
            </Text>
          </View>
        )}
      </View>

      {!isOnline && (
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineText}>Offline</Text>
        </View>
      )}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    ...DesignTokens.shadow.sm,
    position: 'relative',
  },

  // Variants
  container_default: {
    minWidth: 120,
    minHeight: 100,
  },
  container_compact: {
    minWidth: 100,
    minHeight: 80,
    padding: DesignTokens.spacing[3],
  },
  container_detailed: {
    minWidth: 140,
    minHeight: 120,
    padding: DesignTokens.spacing[5],
  },

  // States
  offline: {
    opacity: 0.7,
    backgroundColor: DesignTokens.colors.surface.secondary,
  },

  // Sync status
  sync_synced: {
    borderTopWidth: 2,
    borderTopColor: DesignTokens.colors.success[500],
  },
  sync_pending: {
    borderTopWidth: 2,
    borderTopColor: DesignTokens.colors.warning[500],
  },
  sync_failed: {
    borderTopWidth: 2,
    borderTopColor: DesignTokens.colors.error[500],
  },
  sync_offline: {
    borderTopWidth: 2,
    borderTopColor: DesignTokens.colors.text.secondary,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[2],
  },

  iconContainer: {
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
  },

  content: {
    flex: 1,
  },

  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: DesignTokens.spacing[1],
  },

  value: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },

  unit: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
  },

  label: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginBottom: DesignTokens.spacing[2],
  },

  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },

  trendValue: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  syncIndicator: {
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

  offlineBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: DesignTokens.colors.text.secondary,
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  offlineText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
