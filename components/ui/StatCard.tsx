import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: string;
  onPress?: () => void;
  variant?: 'default' | 'primary' | 'compact';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  trend,
  trendValue,
  icon,
  color = DesignTokens.colors.primary[500],
  onPress,
  variant = 'default',
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return DesignTokens.colors.success[500];
      case 'down': return DesignTokens.colors.error[500];
      default: return DesignTokens.colors.text.secondary;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp size={14} color={getTrendColor()} />;
      case 'down': return <TrendingDown size={14} color={getTrendColor()} />;
      default: return null;
    }
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        style={styles.primaryCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[`${color}20`, `${color}10`]}
          style={styles.primaryGradient}
        >
          <View style={styles.primaryHeader}>
            {icon && (
              <View style={[styles.primaryIcon, { backgroundColor: `${color}30` }]}>
                {icon}
              </View>
            )}
            <Text style={styles.primaryLabel}>{label}</Text>
          </View>
          
          <View style={styles.primaryContent}>
            <View style={styles.primaryValueContainer}>
              <Text style={styles.primaryValue}>{value}</Text>
              {unit && <Text style={styles.primaryUnit}>{unit}</Text>}
            </View>
            
            {trend && trendValue && (
              <View style={styles.trendContainer}>
                {getTrendIcon()}
                <Text style={[styles.trendText, { color: getTrendColor() }]}>
                  {trendValue}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        variant === 'compact' && styles.compactCard
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          {icon}
        </View>
      )}
      
      <View style={styles.content}>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </View>
        
        <Text style={styles.label}>{label}</Text>
        
        {trend && trendValue && (
          <View style={styles.trendContainer}>
            {getTrendIcon()}
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    alignItems: 'center',
    minHeight: 120,
    ...DesignTokens.shadow.base,
  },
  compactCard: {
    minHeight: 100,
    padding: DesignTokens.spacing[3],
  },
  primaryCard: {
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[4],
  },
  primaryGradient: {
    padding: DesignTokens.spacing[5],
  },
  primaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  primaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing[3],
  },
  primaryLabel: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    flex: 1,
  },
  primaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  primaryValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  primaryValue: {
    fontSize: 36,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    lineHeight: 40,
  },
  primaryUnit: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  content: {
    alignItems: 'center',
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: DesignTokens.spacing[1],
  },
  value: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  unit: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
  },
  label: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  trendText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
