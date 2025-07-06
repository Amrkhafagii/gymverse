import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  timeframe: string;
  color: string;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  trend,
  trendValue,
  timeframe,
  color,
  onPress,
  size = 'medium',
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} color={DesignTokens.colors.success[500]} />;
      case 'down':
        return <TrendingDown size={16} color={DesignTokens.colors.error[500]} />;
      default:
        return <Minus size={16} color={DesignTokens.colors.text.tertiary} />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return DesignTokens.colors.success[500];
      case 'down':
        return DesignTokens.colors.error[500];
      default:
        return DesignTokens.colors.text.tertiary;
    }
  };

  const cardStyle = size === 'small' ? styles.smallCard : 
                   size === 'large' ? styles.largeCard : styles.mediumCard;

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component style={cardStyle} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {trend && (
            <View style={styles.trendContainer}>
              {getTrendIcon()}
            </View>
          )}
        </View>

        {/* Value */}
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color }]}>
            {value}
          </Text>
          {unit && (
            <Text style={styles.unit}>{unit}</Text>
          )}
        </View>

        {/* Trend and Timeframe */}
        <View style={styles.footer}>
          {trendValue && (
            <Text style={[styles.trendValue, { color: getTrendColor() }]}>
              {trendValue}
            </Text>
          )}
          <Text style={styles.timeframe}>{timeframe}</Text>
        </View>

        {/* Accent Line */}
        <View style={[styles.accentLine, { backgroundColor: color }]} />
      </LinearGradient>
    </Component>
  );
};

const styles = StyleSheet.create({
  smallCard: {
    flex: 1,
    minHeight: 100,
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  mediumCard: {
    flex: 1,
    minHeight: 120,
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  largeCard: {
    width: '100%',
    minHeight: 140,
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  gradient: {
    flex: 1,
    padding: DesignTokens.spacing[4],
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[2],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    flex: 1,
  },
  trendContainer: {
    marginLeft: DesignTokens.spacing[2],
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: DesignTokens.spacing[2],
  },
  value: {
    fontSize: DesignTokens.typography.fontSize['3xl'],
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  unit: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  timeframe: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});
