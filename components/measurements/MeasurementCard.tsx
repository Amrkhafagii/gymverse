import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Edit3,
  Trash2,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { Measurement, MeasurementTrend } from '@/types/measurement';
import { getMeasurementTypeById } from '@/lib/measurements/measurementTypes';
import { MeasurementCalculations } from '@/lib/measurements/measurementCalculations';

interface MeasurementCardProps {
  measurement: Measurement;
  trend?: MeasurementTrend | null;
  showTrend?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

export function MeasurementCard({
  measurement,
  trend,
  showTrend = true,
  onPress,
  onEdit,
  onDelete,
  compact = false,
}: MeasurementCardProps) {
  const measurementType = getMeasurementTypeById(measurement.type);
  
  if (!measurementType) {
    return null;
  }

  const formatValue = (value: number, unit: string): string => {
    return MeasurementCalculations.formatMeasurementValue(value, unit);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTrendIcon = (trendDirection: 'up' | 'down' | 'stable') => {
    switch (trendDirection) {
      case 'up':
        return <TrendingUp size={16} color={DesignTokens.colors.success[500]} />;
      case 'down':
        return <TrendingDown size={16} color={DesignTokens.colors.error[500]} />;
      case 'stable':
        return <Minus size={16} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const getTrendColor = (trendDirection: 'up' | 'down' | 'stable') => {
    switch (trendDirection) {
      case 'up':
        return DesignTokens.colors.success[500];
      case 'down':
        return DesignTokens.colors.error[500];
      case 'stable':
        return DesignTokens.colors.text.secondary;
    }
  };

  const getTrendText = (trend: MeasurementTrend): string => {
    const changeText = trend.change > 0 ? '+' : '';
    const formattedChange = formatValue(Math.abs(trend.change), measurement.unit);
    const percentText = `${trend.changePercent > 0 ? '+' : ''}${trend.changePercent.toFixed(1)}%`;
    
    return `${changeText}${formattedChange} (${percentText})`;
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactIcon}>{measurementType.icon}</Text>
          <View style={styles.compactInfo}>
            <Text style={styles.compactName}>{measurementType.name}</Text>
            <Text style={styles.compactValue}>
              {formatValue(measurement.value, measurement.unit)}
            </Text>
          </View>
          {trend && showTrend && (
            <View style={styles.compactTrend}>
              {getTrendIcon(trend.trend)}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <LinearGradient
        colors={[DesignTokens.colors.surface.secondary, DesignTokens.colors.surface.tertiary]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.icon}>{measurementType.icon}</Text>
            <View>
              <Text style={styles.name}>{measurementType.name}</Text>
              <Text style={styles.unit}>{measurementType.unit}</Text>
            </View>
          </View>
          
          {(onEdit || onDelete) && (
            <View style={styles.actions}>
              {onEdit && (
                <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                  <Edit3 size={16} color={DesignTokens.colors.text.secondary} />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
                  <Trash2 size={16} color={DesignTokens.colors.error[500]} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Value */}
        <View style={styles.valueContainer}>
          <Text style={styles.value}>
            {formatValue(measurement.value, measurement.unit)}
          </Text>
          
          {trend && showTrend && (
            <View style={styles.trendContainer}>
              {getTrendIcon(trend.trend)}
              <Text style={[styles.trendText, { color: getTrendColor(trend.trend) }]}>
                {getTrendText(trend)}
              </Text>
            </View>
          )}
        </View>

        {/* Date and Notes */}
        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Calendar size={14} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.date}>{formatDate(measurement.date)}</Text>
          </View>
          
          {measurement.notes && (
            <Text style={styles.notes} numberOfLines={2}>
              {measurement.notes}
            </Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[3],
    ...DesignTokens.shadow.base,
  },
  gradient: {
    padding: DesignTokens.spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing[3],
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  icon: {
    fontSize: 24,
  },
  name: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  unit: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  actionButton: {
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.primary,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  value: {
    fontSize: DesignTokens.typography.fontSize['3xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[2],
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.full,
    backgroundColor: DesignTokens.colors.surface.primary,
  },
  trendText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  footer: {
    gap: DesignTokens.spacing[2],
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  date: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  notes: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  
  // Compact styles
  compactCard: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[2],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  compactIcon: {
    fontSize: 20,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  compactValue: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  compactTrend: {
    padding: DesignTokens.spacing[1],
  },
});
