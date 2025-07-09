import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface Measurement {
  id: string;
  type: string;
  value: number;
  unit: string;
  date: string;
  notes?: string;
}

interface BodyCompositionCardProps {
  measurements: Measurement[];
  timeframe: 'week' | 'month' | '3months' | 'year';
  style?: ViewStyle;
}

interface CompositionMetric {
  type: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
  target?: number;
  icon: string;
  color: string;
  isGood: boolean;
}

export const BodyCompositionCard: React.FC<BodyCompositionCardProps> = ({
  measurements,
  timeframe,
  style,
}) => {
  // Get latest measurements for each type
  const getLatestMeasurement = (type: string): Measurement | null => {
    const filtered = measurements.filter(m => m.type === type);
    return filtered.length > 0 ? filtered[filtered.length - 1] : null;
  };

  // Calculate trend for a measurement type
  const calculateTrend = (type: string): { trend: 'up' | 'down' | 'stable'; change: number; changePercent: number } => {
    const filtered = measurements.filter(m => m.type === type).slice(-2);
    
    if (filtered.length < 2) {
      return { trend: 'stable', change: 0, changePercent: 0 };
    }

    const [previous, current] = filtered;
    const change = current.value - previous.value;
    const changePercent = (change / previous.value) * 100;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 1) { // Only consider significant changes
      trend = change > 0 ? 'up' : 'down';
    }

    return { trend, change, changePercent };
  };

  // Define composition metrics
  const compositionMetrics: CompositionMetric[] = [
    {
      type: 'weight',
      name: 'Weight',
      value: getLatestMeasurement('weight')?.value || 0,
      unit: 'lbs',
      ...calculateTrend('weight'),
      target: 180,
      icon: '⚖️',
      color: DesignTokens.colors.primary[500],
      isGood: calculateTrend('weight').trend === 'down',
    },
    {
      type: 'body_fat',
      name: 'Body Fat',
      value: getLatestMeasurement('body_fat')?.value || 0,
      unit: '%',
      ...calculateTrend('body_fat'),
      target: 12,
      icon: '📊',
      color: DesignTokens.colors.warning[500],
      isGood: calculateTrend('body_fat').trend === 'down',
    },
    {
      type: 'muscle_mass',
      name: 'Muscle Mass',
      value: getLatestMeasurement('muscle_mass')?.value || 0,
      unit: 'lbs',
      ...calculateTrend('muscle_mass'),
      target: 160,
      icon: '💪',
      color: DesignTokens.colors.success[500],
      isGood: calculateTrend('muscle_mass').trend === 'up',
    },
    {
      type: 'bmi',
      name: 'BMI',
      value: calculateBMI(),
      unit: '',
      ...calculateTrend('bmi'),
      target: 22,
      icon: '📏',
      color: DesignTokens.colors.info[500],
      isGood: calculateBMI() >= 18.5 && calculateBMI() <= 24.9,
    },
  ];

  function calculateBMI(): number {
    const weight = getLatestMeasurement('weight')?.value || 0;
    const height = getLatestMeasurement('height')?.value || 70; // Default height in inches
    
    if (weight === 0 || height === 0) return 0;
    
    // BMI = (weight in pounds / (height in inches)²) × 703
    return (weight / (height * height)) * 703;
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable', isGood: boolean) => {
    const color = isGood ? DesignTokens.colors.success[500] : DesignTokens.colors.error[500];
    
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} color={color} />;
      case 'down':
        return <TrendingDown size={16} color={color} />;
      case 'stable':
        return <Minus size={16} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const formatValue = (value: number, unit: string): string => {
    if (value === 0) return '--';
    return `${value.toFixed(1)}${unit}`;
  };

  const formatChange = (change: number, changePercent: number, unit: string): string => {
    if (change === 0) return 'No change';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}${unit} (${sign}${changePercent.toFixed(1)}%)`;
  };

  const getProgressPercentage = (current: number, target: number): number => {
    if (target === 0) return 0;
    return Math.min(100, (current / target) * 100);
  };

  const getBMICategory = (bmi: number): { category: string; color: string } => {
    if (bmi < 18.5) return { category: 'Underweight', color: DesignTokens.colors.warning[500] };
    if (bmi < 25) return { category: 'Normal', color: DesignTokens.colors.success[500] };
    if (bmi < 30) return { category: 'Overweight', color: DesignTokens.colors.warning[500] };
    return { category: 'Obese', color: DesignTokens.colors.error[500] };
  };

  const bmiCategory = getBMICategory(compositionMetrics[3].value);

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[DesignTokens.colors.surface.secondary, DesignTokens.colors.surface.tertiary]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Activity size={24} color={DesignTokens.colors.primary[500]} />
            <Text style={styles.title}>Body Composition</Text>
          </View>
          <Text style={styles.timeframe}>
            Last {timeframe === '3months' ? '3 months' : timeframe}
          </Text>
        </View>

        {/* Main Metrics Grid */}
        <View style={styles.metricsGrid}>
          {compositionMetrics.slice(0, 3).map((metric) => (
            <View key={metric.type} style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricIcon}>{metric.icon}</Text>
                <Text style={styles.metricName}>{metric.name}</Text>
              </View>
              
              <Text style={[styles.metricValue, { color: metric.color }]}>
                {formatValue(metric.value, metric.unit)}
              </Text>
              
              {metric.target && (
                <View style={styles.progressContainer}>
                  <ProgressBar
                    progress={getProgressPercentage(metric.value, metric.target)}
                    height={4}
                    color={metric.color}
                    backgroundColor={DesignTokens.colors.neutral[800]}
                    showPercentage={false}
                    animated={true}
                  />
                  <Text style={styles.targetText}>
                    Target: {formatValue(metric.target, metric.unit)}
                  </Text>
                </View>
              )}
              
              <View style={styles.trendContainer}>
                {getTrendIcon(metric.trend, metric.isGood)}
                <Text style={[
                  styles.trendText,
                  { color: metric.isGood ? DesignTokens.colors.success[500] : DesignTokens.colors.error[500] }
                ]}>
                  {formatChange(metric.change, metric.changePercent, metric.unit)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* BMI Section */}
        <View style={styles.bmiSection}>
          <View style={styles.bmiHeader}>
            <Text style={styles.bmiTitle}>Body Mass Index</Text>
            <View style={[styles.bmiCategory, { backgroundColor: bmiCategory.color + '20' }]}>
              <Text style={[styles.bmiCategoryText, { color: bmiCategory.color }]}>
                {bmiCategory.category}
              </Text>
            </View>
          </View>
          
          <View style={styles.bmiContent}>
            <CircularProgress
              progress={Math.min(100, (compositionMetrics[3].value / 30) * 100)}
              size={80}
              strokeWidth={8}
              color={bmiCategory.color}
              backgroundColor={DesignTokens.colors.neutral[800]}
              showPercentage={false}
              showLabel={true}
              label={compositionMetrics[3].value.toFixed(1)}
              animated={true}
            />
            
            <View style={styles.bmiDetails}>
              <Text style={styles.bmiValue}>
                {compositionMetrics[3].value.toFixed(1)}
              </Text>
              <Text style={styles.bmiDescription}>
                BMI is calculated from your height and weight
              </Text>
              
              <View style={styles.bmiTrend}>
                {getTrendIcon(compositionMetrics[3].trend, compositionMetrics[3].isGood)}
                <Text style={styles.bmiTrendText}>
                  {formatChange(compositionMetrics[3].change, compositionMetrics[3].changePercent, '')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryText}>
              {measurements.length > 0 
                ? `Based on ${measurements.length} measurements over the ${timeframe === '3months' ? 'last 3 months' : `last ${timeframe}`}`
                : 'No measurements available for this timeframe'
              }
            </Text>
            
            {measurements.length > 0 && (
              <View style={styles.summaryStats}>
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatLabel}>Latest Update</Text>
                  <Text style={styles.summaryStatValue}>
                    {new Date(measurements[measurements.length - 1]?.date || '').toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatLabel}>Measurements</Text>
                  <Text style={styles.summaryStatValue}>
                    {measurements.length}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  gradient: {
    padding: DesignTokens.spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  timeframe: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontStyle: 'italic',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[4],
  },
  metricCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: DesignTokens.colors.surface.primary,
    padding: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[2],
  },
  metricIcon: {
    fontSize: 16,
  },
  metricName: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  metricValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[2],
  },
  progressContainer: {
    marginBottom: DesignTokens.spacing[2],
  },
  targetText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    marginTop: DesignTokens.spacing[1],
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
  bmiSection: {
    backgroundColor: DesignTokens.colors.surface.primary,
    padding: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.md,
    marginBottom: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  bmiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  bmiTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  bmiCategory: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  bmiCategoryText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  bmiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[4],
  },
  bmiDetails: {
    flex: 1,
  },
  bmiValue: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  bmiDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[2],
  },
  bmiTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  bmiTrendText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  summary: {
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
    paddingTop: DesignTokens.spacing[4],
  },
  summaryTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },
  summaryContent: {
    gap: DesignTokens.spacing[3],
  },
  summaryText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    marginBottom: DesignTokens.spacing[1],
  },
  summaryStatValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
});
