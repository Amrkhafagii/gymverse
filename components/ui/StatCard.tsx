/**
 * Enhanced Stat Card Component with Challenge Integration
 * Now supports both achievement and challenge progress indicators
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, Minus, Target, Trophy } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  analyticsKey?: string;
  achievementProgress?: number;
  challengeProgress?: number;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'compact' | 'featured';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  icon,
  trend = 'stable',
  trendValue,
  analyticsKey,
  achievementProgress,
  challengeProgress,
  onPress,
  style,
  variant = 'default',
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} color={DesignTokens.colors.success[500]} />;
      case 'down':
        return <TrendingDown size={14} color={DesignTokens.colors.error[500]} />;
      default:
        return <Minus size={14} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return DesignTokens.colors.success[500];
      case 'down':
        return DesignTokens.colors.error[500];
      default:
        return DesignTokens.colors.text.secondary;
    }
  };

  const hasProgress = achievementProgress !== undefined || challengeProgress !== undefined;

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={onPress}
        activeOpacity={onPress ? 0.8 : 1}
      >
        <View style={styles.compactHeader}>
          {icon && <View style={styles.compactIcon}>{icon}</View>}
          <View style={styles.compactInfo}>
            <Text style={styles.compactLabel}>{label}</Text>
            <View style={styles.compactValueContainer}>
              <Text style={styles.compactValue}>{value}</Text>
              {unit && <Text style={styles.compactUnit}>{unit}</Text>}
            </View>
          </View>
          {trend !== 'stable' && (
            <View style={styles.compactTrend}>
              {getTrendIcon()}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        style={[styles.featuredContainer, style]}
        onPress={onPress}
        activeOpacity={onPress ? 0.8 : 1}
      >
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredHeader}>
            {icon && <View style={styles.featuredIcon}>{icon}</View>}
            <Text style={styles.featuredLabel}>{label}</Text>
          </View>

          <View style={styles.featuredValueContainer}>
            <Text style={styles.featuredValue}>{value}</Text>
            {unit && <Text style={styles.featuredUnit}>{unit}</Text>}
          </View>

          {trendValue && (
            <View style={styles.featuredTrend}>
              {getTrendIcon()}
              <Text style={styles.featuredTrendText}>{trendValue}</Text>
            </View>
          )}

          {hasProgress && (
            <View style={styles.featuredProgress}>
              {achievementProgress !== undefined && (
                <View style={styles.progressItem}>
                  <Trophy size={12} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.progressText}>
                    {Math.round(achievementProgress)}% to achievement
                  </Text>
                </View>
              )}
              {challengeProgress !== undefined && (
                <View style={styles.progressItem}>
                  <Target size={12} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.progressText}>
                    {Math.round(challengeProgress)}% challenge progress
                  </Text>
                </View>
              )}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Default variant
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={styles.label}>{label}</Text>
        </View>
        
        {trend !== 'stable' && (
          <View style={styles.trendContainer}>
            {getTrendIcon()}
          </View>
        )}
      </View>

      {/* Value */}
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      {/* Trend Value */}
      {trendValue && (
        <View style={styles.trendValueContainer}>
          <Text style={[styles.trendValue, { color: getTrendColor() }]}>
            {trendValue}
          </Text>
        </View>
      )}

      {/* Progress Indicators */}
      {hasProgress && (
        <View style={styles.progressContainer}>
          {achievementProgress !== undefined && (
            <View style={styles.progressIndicator}>
              <View style={styles.progressHeader}>
                <Trophy size={12} color={DesignTokens.colors.warning[500]} />
                <Text style={styles.progressLabel}>Achievement</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${achievementProgress}%`,
                      backgroundColor: DesignTokens.colors.warning[500]
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressPercentage}>
                {Math.round(achievementProgress)}%
              </Text>
            </View>
          )}

          {challengeProgress !== undefined && (
            <View style={styles.progressIndicator}>
              <View style={styles.progressHeader}>
                <Target size={12} color={DesignTokens.colors.primary[500]} />
                <Text style={styles.progressLabel}>Challenge</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${challengeProgress}%`,
                      backgroundColor: DesignTokens.colors.primary[500]
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressPercentage}>
                {Math.round(challengeProgress)}%
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Default variant styles
  container: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    ...DesignTokens.shadow.sm,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border.primary,
    minWidth: 160,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    flex: 1,
  },

  iconContainer: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
  },

  label: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.secondary,
    flex: 1,
  },

  trendContainer: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    padding: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: DesignTokens.spacing[2],
  },

  value: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },

  unit: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
  },

  trendValueContainer: {
    marginBottom: DesignTokens.spacing[2],
  },

  trendValue: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  progressContainer: {
    gap: DesignTokens.spacing[2],
  },

  progressIndicator: {
    gap: DesignTokens.spacing[1],
  },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },

  progressLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  progressBar: {
    height: 4,
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  progressPercentage: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'right',
  },

  // Compact variant styles
  compactContainer: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    ...DesignTokens.shadow.sm,
    minWidth: 120,
  },

  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },

  compactIcon: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    padding: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  compactInfo: {
    flex: 1,
  },

  compactLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginBottom: DesignTokens.spacing[1],
  },

  compactValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  compactValue: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },

  compactUnit: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
  },

  compactTrend: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    padding: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  // Featured variant styles
  featuredContainer: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.md,
    minWidth: 200,
  },

  featuredGradient: {
    padding: DesignTokens.spacing[4],
  },

  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[3],
  },

  featuredIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
  },

  featuredLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },

  featuredValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: DesignTokens.spacing[2],
  },

  featuredValue: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  featuredUnit: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: DesignTokens.spacing[1],
  },

  featuredTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[3],
  },

  featuredTrendText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  featuredProgress: {
    gap: DesignTokens.spacing[2],
  },

  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },

  progressText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
