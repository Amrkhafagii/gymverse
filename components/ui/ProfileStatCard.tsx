import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '@/design-system/tokens';

interface ProfileStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  onPress?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const ProfileStatCard: React.FC<ProfileStatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = DesignTokens.colors.primary[500],
  onPress,
  trend,
}) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <LinearGradient
        colors={[`${color}20`, `${color}10`]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: `${color}30` }]}>
              {icon}
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>

        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color }]}>{value}</Text>
          {trend && (
            <View style={[
              styles.trendContainer,
              { backgroundColor: trend.isPositive ? '#10B98120' : '#EF444420' }
            ]}>
              <Text style={[
                styles.trendText,
                { color: trend.isPositive ? '#10B981' : '#EF4444' }
              ]}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.accentLine, { backgroundColor: color }]} />
      </LinearGradient>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    marginHorizontal: DesignTokens.spacing[2],
    ...DesignTokens.shadow.base,
  },
  gradient: {
    padding: DesignTokens.spacing[4],
    position: 'relative',
    minHeight: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing[2],
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  subtitle: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    marginTop: DesignTokens.spacing[1],
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  value: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  trendContainer: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  trendText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});
