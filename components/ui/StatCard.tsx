/**
 * StatCard component with offline-first data display
 * Shows sync status and handles offline states gracefully
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, Minus, Wifi, WifiOff } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: string;
  variant?: 'default' | 'primary' | 'compact';
  onPress?: () => void;
  style?: ViewStyle;
  isLoading?: boolean;
  syncStatus?: 'synced' | 'pending' | 'failed' | 'offline';
  lastUpdated?: Date;
  showSyncIndicator?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  trend,
  trendValue,
  icon,
  color = DesignTokens.colors.primary[500],
  variant = 'default',
  onPress,
  style,
  isLoading = false,
  syncStatus = 'synced',
  lastUpdated,
  showSyncIndicator = true,
}) => {
  const isPrimary = variant === 'primary';
  const isCompact = variant === 'compact';

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} color={DesignTokens.colors.success[500]} />;
      case 'down':
        return <TrendingDown size={16} color={DesignTokens.colors.error[500]} />;
      case 'neutral':
        return <Minus size={16} color={DesignTokens.colors.text.secondary} />;
      default:
        return null;
    }
  };

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'offline':
        return <WifiOff size={12} color={DesignTokens.colors.text.secondary} />;
      case 'failed':
        return <WifiOff size={12} color={DesignTokens.colors.error[500]} />;
      default:
        return <Wifi size={12} color={DesignTokens.colors.success[500]} />;
    }
  };

  const getLastUpdatedText = () => {
    if (!lastUpdated) return null;
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const cardStyles = [
    styles.card,
    isPrimary && styles.primaryCard,
    isCompact && styles.compactCard,
    style,
  ];

  const renderContent = () => (
    <View style={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
              {icon}
            </View>
          )}
          <Text style={[styles.label, isPrimary && styles.primaryLabel]}>
            {label}
          </Text>
        </View>
        
        {showSyncIndicator && (
          <View style={styles.syncContainer}>
            {getSyncIcon()}
            <View style={[styles.syncDot, styles[`sync_${syncStatus}`]]} />
          </View>
        )}
      </View>

      {/* Value */}
      <View style={styles.valueContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={[styles.loadingBar, { backgroundColor: color }]} />
            <Text style={[styles.loadingText, isPrimary && styles.primaryText]}>
              Loading...
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.value, isPrimary && styles.primaryValue]}>
              {value}
            </Text>
            {unit && (
              <Text style={[styles.unit, isPrimary && styles.primaryUnit]}>
                {unit}
              </Text>
            )}
          </>
        )}
      </View>

      {/* Trend and Last Updated */}
      <View style={styles.footer}>
        {trend && trendValue && !isLoading && (
          <View style={styles.trendContainer}>
            {getTrendIcon()}
            <Text style={[styles.trendText, isPrimary && styles.primaryTrendText]}>
              {trendValue}
            </Text>
          </View>
        )}
        
        {lastUpdated && (
          <Text style={[styles.lastUpdated, isPrimary && styles.primaryLastUpdated]}>
            {getLastUpdatedText()}
          </Text>
        )}
      </View>

      {/* Offline indicator */}
      {syncStatus === 'offline' && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>Offline Data</Text>
        </View>
      )}
    </View>
  );

  if (isPrimary) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.8 : 1}
      >
        <LinearGradient
          colors={[color, `${color}CC`]}
          style={styles.primaryGradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={cardStyles}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: DesignTokens.borderRadius.xl,
    backgroundColor: DesignTokens.colors.surface.secondary,
    ...DesignTokens.shadow.md,
    overflow: 'hidden',
  },
  primaryCard: {
    backgroundColor: 'transparent',
  },
  compactCard: {
    flex: 1,
    minWidth: 0,
  },
  
  primaryGradient: {
    flex: 1,
    padding: DesignTokens.spacing[4],
  },
  
  content: {
    padding: DesignTokens.spacing[4],
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[3],
  },
  
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignTokens.spacing[2],
  },
  
  label: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    flex: 1,
  },
  primaryLabel: {
    color: DesignTokens.colors.text.primary,
    opacity: 0.9,
  },
  
  syncContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sync_synced: {
    backgroundColor: DesignTokens.colors.success[500],
  },
  sync_pending: {
    backgroundColor: DesignTokens.colors.warning[500],
  },
  sync_failed: {
    backgroundColor: DesignTokens.colors.error[500],
  },
  sync_offline: {
    backgroundColor: DesignTokens.colors.text.secondary,
  },
  
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: DesignTokens.spacing[2],
  },
  
  value: {
    fontSize: DesignTokens.typography.fontSize['3xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  primaryValue: {
    color: DesignTokens.colors.text.primary,
  },
  
  unit: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginLeft: DesignTokens.spacing[1],
  },
  primaryUnit: {
    color: DesignTokens.colors.text.primary,
    opacity: 0.8,
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  
  trendText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  primaryTrendText: {
    color: DesignTokens.colors.text.primary,
    opacity: 0.9,
  },
  
  lastUpdated: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    opacity: 0.7,
  },
  primaryLastUpdated: {
    color: DesignTokens.colors.text.primary,
    opacity: 0.7,
  },
  
  loadingContainer: {
    flex: 1,
  },
  
  loadingBar: {
    height: 32,
    borderRadius: DesignTokens.borderRadius.md,
    opacity: 0.3,
    marginBottom: DesignTokens.spacing[2],
  },
  
  loadingText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  primaryText: {
    color: DesignTokens.colors.text.primary,
    opacity: 0.8,
  },
  
  offlineIndicator: {
    position: 'absolute',
    top: DesignTokens.spacing[2],
    right: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.warning[500],
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  
  offlineText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
});
