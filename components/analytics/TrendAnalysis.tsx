import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { AnalyticsInsight, TrendData } from '@/lib/analytics/chartDataProcessing';
import { DesignTokens } from '@/design-system/tokens';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Trophy,
  Lightbulb
} from 'lucide-react-native';

interface TrendAnalysisProps {
  insights: AnalyticsInsight[];
  trends: {
    volume: TrendData;
    frequency: TrendData;
  };
  onInsightPress?: (insight: AnalyticsInsight) => void;
}

export function TrendAnalysis({ insights, trends, onInsightPress }: TrendAnalysisProps) {
  const getInsightIcon = (type: AnalyticsInsight['type']) => {
    const iconProps = { size: 20 };
    
    switch (type) {
      case 'improvement':
        return <CheckCircle {...iconProps} color={DesignTokens.colors.success[500]} />;
      case 'milestone':
        return <Trophy {...iconProps} color={DesignTokens.colors.warning[500]} />;
      case 'decline':
        return <AlertTriangle {...iconProps} color={DesignTokens.colors.error[500]} />;
      case 'plateau':
        return <Target {...iconProps} color={DesignTokens.colors.info[500]} />;
      default:
        return <Lightbulb {...iconProps} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const getInsightColor = (type: AnalyticsInsight['type']) => {
    switch (type) {
      case 'improvement':
        return DesignTokens.colors.success[500];
      case 'milestone':
        return DesignTokens.colors.warning[500];
      case 'decline':
        return DesignTokens.colors.error[500];
      case 'plateau':
        return DesignTokens.colors.info[500];
      default:
        return DesignTokens.colors.text.secondary;
    }
  };

  const getTrendIcon = (trend: TrendData) => {
    const iconProps = { size: 16 };
    
    switch (trend.trend) {
      case 'up':
        return <TrendingUp {...iconProps} color={DesignTokens.colors.success[500]} />;
      case 'down':
        return <TrendingDown {...iconProps} color={DesignTokens.colors.error[500]} />;
      default:
        return <Minus {...iconProps} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const getTrendColor = (trend: TrendData) => {
    switch (trend.trend) {
      case 'up':
        return DesignTokens.colors.success[500];
      case 'down':
        return DesignTokens.colors.error[500];
      default:
        return DesignTokens.colors.text.secondary;
    }
  };

  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(1);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Trend Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trend Summary</Text>
        
        <View style={styles.trendsGrid}>
          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendLabel}>Training Volume</Text>
              {getTrendIcon(trends.volume)}
            </View>
            <Text style={[styles.trendValue, { color: getTrendColor(trends.volume) }]}>
              {trends.volume.changePercent > 0 ? '+' : ''}{trends.volume.changePercent.toFixed(1)}%
            </Text>
            <Text style={styles.trendSubtext}>
              {formatValue(trends.volume.current)} vs {formatValue(trends.volume.previous)}
            </Text>
          </View>

          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendLabel}>Workout Frequency</Text>
              {getTrendIcon(trends.frequency)}
            </View>
            <Text style={[styles.trendValue, { color: getTrendColor(trends.frequency) }]}>
              {trends.frequency.changePercent > 0 ? '+' : ''}{trends.frequency.changePercent.toFixed(1)}%
            </Text>
            <Text style={styles.trendSubtext}>
              {formatValue(trends.frequency.current)} vs {formatValue(trends.frequency.previous)}
            </Text>
          </View>
        </View>
      </View>

      {/* Insights */}
      {insights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights & Recommendations</Text>
          
          <View style={styles.insightsList}>
            {insights.map((insight, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.insightCard,
                  { borderLeftColor: getInsightColor(insight.type) }
                ]}
                onPress={() => onInsightPress?.(insight)}
                activeOpacity={0.7}
              >
                <View style={styles.insightHeader}>
                  <View style={styles.insightTitleContainer}>
                    {getInsightIcon(insight.type)}
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                  </View>
                  {insight.value && (
                    <View style={[
                      styles.insightBadge,
                      { backgroundColor: getInsightColor(insight.type) + '20' }
                    ]}>
                      <Text style={[
                        styles.insightBadgeText,
                        { color: getInsightColor(insight.type) }
                      ]}>
                        {typeof insight.value === 'number' ? 
                          (insight.value % 1 === 0 ? insight.value : insight.value.toFixed(1)) : 
                          insight.value
                        }
                      </Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.insightDescription}>
                  {insight.description}
                </Text>
                
                {insight.recommendation && (
                  <View style={styles.recommendationContainer}>
                    <Lightbulb size={14} color={DesignTokens.colors.warning[500]} />
                    <Text style={styles.recommendationText}>
                      {insight.recommendation}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Performance Indicators */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Indicators</Text>
        
        <View style={styles.indicatorsGrid}>
          <View style={styles.indicatorCard}>
            <View style={styles.indicatorIcon}>
              <TrendingUp size={24} color={DesignTokens.colors.primary[500]} />
            </View>
            <Text style={styles.indicatorLabel}>Consistency</Text>
            <Text style={styles.indicatorValue}>
              {trends.frequency.trend === 'up' ? 'Improving' : 
               trends.frequency.trend === 'down' ? 'Declining' : 'Stable'}
            </Text>
          </View>

          <View style={styles.indicatorCard}>
            <View style={styles.indicatorIcon}>
              <Target size={24} color={DesignTokens.colors.success[500]} />
            </View>
            <Text style={styles.indicatorLabel}>Intensity</Text>
            <Text style={styles.indicatorValue}>
              {trends.volume.trend === 'up' ? 'Increasing' : 
               trends.volume.trend === 'down' ? 'Decreasing' : 'Maintained'}
            </Text>
          </View>
        </View>
      </View>

      {/* Empty State */}
      {insights.length === 0 && (
        <View style={styles.emptyState}>
          <Lightbulb size={48} color={DesignTokens.colors.text.tertiary} />
          <Text style={styles.emptyStateTitle}>Keep Training!</Text>
          <Text style={styles.emptyStateText}>
            Complete more workouts to unlock personalized insights and recommendations.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: DesignTokens.spacing[6],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[4],
  },
  trendsGrid: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },
  trendCard: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  trendLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  trendValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  trendSubtext: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  insightsList: {
    gap: DesignTokens.spacing[3],
  },
  insightCard: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[2],
  },
  insightTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    flex: 1,
  },
  insightTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    flex: 1,
  },
  insightBadge: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  insightBadgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  insightDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
    marginBottom: DesignTokens.spacing[2],
  },
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.warning[500] + '10',
    padding: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
  },
  recommendationText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    lineHeight: 18,
    flex: 1,
  },
  indicatorsGrid: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },
  indicatorCard: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  indicatorIcon: {
    marginBottom: DesignTokens.spacing[2],
  },
  indicatorLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  indicatorValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[12],
    paddingHorizontal: DesignTokens.spacing[5],
  },
  emptyStateTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[2],
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
