import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  Activity,
  Heart,
  Zap,
  Shield,
  X,
  RefreshCw,
  Calendar,
  Target,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useRestDayRecommendations, RestDayRecommendation } from '@/hooks/useRestDayRecommendations';
import { FatigueIndicator, FatigueAlert } from '@/lib/ai/fatigueDetection';
import { RecoveryInsight } from '@/lib/ai/recoveryAnalysis';

interface RestDayRecommendationsProps {
  compactMode?: boolean;
  showTrends?: boolean;
  onRecommendationFollowed?: (recommendationId: string) => void;
}

export function RestDayRecommendations({
  compactMode = false,
  showTrends = true,
  onRecommendationFollowed,
}: RestDayRecommendationsProps) {
  const {
    recoveryMetrics,
    fatigueIndicators,
    fatigueAlerts,
    recoveryInsights,
    restDayRecommendations,
    recoveryPlan,
    isLoading,
    lastUpdated,
    refreshAnalysis,
    dismissAlert,
    markRecommendationFollowed,
    shouldTakeRestDay,
    fatigueLevel,
    recoveryTrendData,
  } = useRestDayRecommendations();

  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);
  const [expandedIndicators, setExpandedIndicators] = useState(false);

  const handleFollowRecommendation = (recommendation: RestDayRecommendation) => {
    Alert.alert(
      'Follow Recommendation',
      `Are you planning to follow this recommendation: "${recommendation.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Following',
          onPress: () => {
            markRecommendationFollowed(recommendation.id);
            onRecommendationFollowed?.(recommendation.id);
          },
        },
      ]
    );
  };

  const getFatigueLevelColor = (level: string) => {
    switch (level) {
      case 'low': return DesignTokens.colors.success[500];
      case 'moderate': return DesignTokens.colors.warning[500];
      case 'high': return DesignTokens.colors.error[400];
      case 'critical': return DesignTokens.colors.error[600];
      default: return DesignTokens.colors.text.secondary;
    }
  };

  const getRecommendationIcon = (type: RestDayRecommendation['type']) => {
    switch (type) {
      case 'immediate': return <AlertTriangle size={20} color="#ef4444" />;
      case 'planned': return <Calendar size={20} color="#f59e0b" />;
      case 'optional': return <CheckCircle size={20} color="#10b981" />;
      default: return <Clock size={20} color="#6b7280" />;
    }
  };

  const getIndicatorIcon = (status: FatigueIndicator['status']) => {
    switch (status) {
      case 'low': return <CheckCircle size={16} color={DesignTokens.colors.success[500]} />;
      case 'moderate': return <Clock size={16} color={DesignTokens.colors.warning[500]} />;
      case 'high': return <AlertTriangle size={16} color={DesignTokens.colors.error[400]} />;
      case 'critical': return <AlertTriangle size={16} color={DesignTokens.colors.error[600]} />;
      default: return <Activity size={16} color={DesignTokens.colors.text.secondary} />;
    }
  };

  if (!recoveryMetrics) {
    return (
      <View style={styles.emptyContainer}>
        <Brain size={48} color={DesignTokens.colors.text.tertiary} />
        <Text style={styles.emptyTitle}>No Recovery Data</Text>
        <Text style={styles.emptyText}>
          Complete some workouts to get AI-powered recovery insights
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, compactMode && styles.compactContainer]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refreshAnalysis} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Brain size={24} color={DesignTokens.colors.primary[500]} />
          <View>
            <Text style={styles.headerTitle}>Recovery Insights</Text>
            {lastUpdated && (
              <Text style={styles.headerSubtitle}>
                Updated {new Date(lastUpdated).toLocaleTimeString()}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={refreshAnalysis} style={styles.refreshButton}>
          <RefreshCw size={20} color={DesignTokens.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Recovery Status Overview */}
      <View style={styles.statusCard}>
        <LinearGradient
          colors={['#1a1a1a', '#2a2a2a']}
          style={styles.statusGradient}
        >
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Recovery Status</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getFatigueLevelColor(fatigueLevel) }
            ]}>
              <Text style={styles.statusBadgeText}>
                {fatigueLevel.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusMetrics}>
            <View style={styles.statusMetric}>
              <Text style={styles.statusMetricValue}>
                {recoveryMetrics.fatigueLevel}%
              </Text>
              <Text style={styles.statusMetricLabel}>Fatigue</Text>
            </View>
            <View style={styles.statusMetric}>
              <Text style={styles.statusMetricValue}>
                {recoveryMetrics.recoveryScore}%
              </Text>
              <Text style={styles.statusMetricLabel}>Recovery</Text>
            </View>
            <View style={styles.statusMetric}>
              <Text style={styles.statusMetricValue}>
                {recoveryMetrics.recommendedRestDays}
              </Text>
              <Text style={styles.statusMetricLabel}>Rest Days</Text>
            </View>
          </View>

          {shouldTakeRestDay && (
            <View style={styles.restDayAlert}>
              <Shield size={16} color="#ef4444" />
              <Text style={styles.restDayAlertText}>
                Rest day recommended
              </Text>
            </View>
          )}
        </LinearGradient>
      </View>

      {/* Critical Alerts */}
      {fatigueAlerts.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>Alerts</Text>
          {fatigueAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onDismiss={() => dismissAlert(alert.id)}
            />
          ))}
        </View>
      )}

      {/* Rest Day Recommendations */}
      {restDayRecommendations.length > 0 && (
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {restDayRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              isExpanded={expandedRecommendation === recommendation.id}
              onToggleExpand={() => 
                setExpandedRecommendation(
                  expandedRecommendation === recommendation.id 
                    ? null 
                    : recommendation.id
                )
              }
              onFollow={() => handleFollowRecommendation(recommendation)}
            />
          ))}
        </View>
      )}

      {/* Recovery Plan */}
      {recoveryPlan && (
        <View style={styles.planSection}>
          <Text style={styles.sectionTitle}>Recovery Plan</Text>
          <RecoveryPlanCard plan={recoveryPlan} />
        </View>
      )}

      {/* Fatigue Indicators */}
      {!compactMode && fatigueIndicators.length > 0 && (
        <View style={styles.indicatorsSection}>
          <TouchableOpacity
            style={styles.indicatorsHeader}
            onPress={() => setExpandedIndicators(!expandedIndicators)}
          >
            <Text style={styles.sectionTitle}>Fatigue Indicators</Text>
            <Text style={styles.expandText}>
              {expandedIndicators ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
          
          {expandedIndicators && (
            <View style={styles.indicatorsList}>
              {fatigueIndicators.map((indicator) => (
                <IndicatorCard key={indicator.id} indicator={indicator} />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Recovery Insights */}
      {!compactMode && recoveryInsights.length > 0 && (
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Insights</Text>
          {recoveryInsights.slice(0, 3).map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// Alert Card Component
function AlertCard({ 
  alert, 
  onDismiss 
}: { 
  alert: FatigueAlert; 
  onDismiss: () => void;
}) {
  const getAlertColor = (type: FatigueAlert['type']) => {
    switch (type) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <View style={[styles.alertCard, { borderLeftColor: getAlertColor(alert.type) }]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertTitleContainer}>
          <AlertTriangle size={16} color={getAlertColor(alert.type)} />
          <Text style={styles.alertTitle}>{alert.title}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <X size={16} color={DesignTokens.colors.text.secondary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.alertMessage}>{alert.message}</Text>
      {alert.recommendations.length > 0 && (
        <View style={styles.alertRecommendations}>
          {alert.recommendations.slice(0, 2).map((rec, index) => (
            <Text key={index} style={styles.alertRecommendation}>
              • {rec}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

// Recommendation Card Component
function RecommendationCard({
  recommendation,
  isExpanded,
  onToggleExpand,
  onFollow,
}: {
  recommendation: RestDayRecommendation;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onFollow: () => void;
}) {
  const getPriorityColor = (priority: RestDayRecommendation['priority']) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.recommendationCard,
        { borderLeftColor: getPriorityColor(recommendation.priority) }
      ]}
      onPress={onToggleExpand}
    >
      <View style={styles.recommendationHeader}>
        {getRecommendationIcon(recommendation.type)}
        <View style={styles.recommendationTitleContainer}>
          <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
          <Text style={styles.recommendationDays}>
            {recommendation.daysRecommended} day{recommendation.daysRecommended !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
      
      <Text style={styles.recommendationDescription}>
        {recommendation.description}
      </Text>

      {isExpanded && (
        <View style={styles.recommendationDetails}>
          {recommendation.reasoning.length > 0 && (
            <View style={styles.reasoningSection}>
              <Text style={styles.detailsTitle}>Why this recommendation:</Text>
              {recommendation.reasoning.map((reason, index) => (
                <Text key={index} style={styles.reasoningItem}>
                  • {reason}
                </Text>
              ))}
            </View>
          )}

          {recommendation.alternatives.length > 0 && (
            <View style={styles.alternativesSection}>
              <Text style={styles.detailsTitle}>Alternatives:</Text>
              {recommendation.alternatives.map((alt, index) => (
                <Text key={index} style={styles.alternativeItem}>
                  • {alt}
                </Text>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.followButton} onPress={onFollow}>
            <CheckCircle size={16} color="#10b981" />
            <Text style={styles.followButtonText}>Mark as Following</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Recovery Plan Card Component
function RecoveryPlanCard({ plan }: { plan: any }) {
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'recovery': return '#ef4444';
      case 'deload': return '#f59e0b';
      case 'maintenance': return '#3b82f6';
      case 'active': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.planCard}>
      <View style={styles.planHeader}>
        <View style={[
          styles.phaseBadge,
          { backgroundColor: getPhaseColor(plan.currentPhase) }
        ]}>
          <Text style={styles.phaseBadgeText}>
            {plan.currentPhase.toUpperCase()}
          </Text>
        </View>
        {plan.recommendedDuration > 0 && (
          <Text style={styles.planDuration}>
            {plan.recommendedDuration} days
          </Text>
        )}
      </View>

      {plan.activities.length > 0 && (
        <View style={styles.planSection}>
          <Text style={styles.planSectionTitle}>Recommended Activities:</Text>
          {plan.activities.map((activity: string, index: number) => (
            <Text key={index} style={styles.planItem}>
              • {activity}
            </Text>
          ))}
        </View>
      )}

      {plan.restrictions.length > 0 && (
        <View style={styles.planSection}>
          <Text style={styles.planSectionTitle}>Restrictions:</Text>
          {plan.restrictions.map((restriction: string, index: number) => (
            <Text key={index} style={styles.planItem}>
              • {restriction}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

// Indicator Card Component
function IndicatorCard({ indicator }: { indicator: FatigueIndicator }) {
  return (
    <View style={styles.indicatorCard}>
      <View style={styles.indicatorHeader}>
        {getIndicatorIcon(indicator.status)}
        <Text style={styles.indicatorName}>{indicator.name}</Text>
        <Text style={styles.indicatorValue}>{indicator.value}%</Text>
      </View>
      <Text style={styles.indicatorDescription}>{indicator.description}</Text>
    </View>
  );
}

// Insight Card Component
function InsightCard({ insight }: { insight: RecoveryInsight }) {
  const getInsightIcon = (type: RecoveryInsight['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={16} color="#f59e0b" />;
      case 'positive': return <CheckCircle size={16} color="#10b981" />;
      case 'suggestion': return <Target size={16} color="#3b82f6" />;
      default: return <Activity size={16} color="#6b7280" />;
    }
  };

  return (
    <View style={styles.insightCard}>
      <View style={styles.insightHeader}>
        {getInsightIcon(insight.type)}
        <Text style={styles.insightTitle}>{insight.title}</Text>
      </View>
      <Text style={styles.insightDescription}>{insight.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background.primary,
  },
  compactContainer: {
    paddingHorizontal: DesignTokens.spacing[4],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing[12],
    paddingHorizontal: DesignTokens.spacing[5],
  },
  emptyTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[2],
  },
  emptyText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  headerTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  refreshButton: {
    padding: DesignTokens.spacing[2],
  },
  statusCard: {
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  statusGradient: {
    padding: DesignTokens.spacing[4],
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  statusTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  statusMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusMetric: {
    alignItems: 'center',
  },
  statusMetricValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  statusMetricLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  restDayAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginTop: DesignTokens.spacing[4],
    paddingTop: DesignTokens.spacing[4],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
  },
  restDayAlertText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: '#ef4444',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[3],
    paddingHorizontal: DesignTokens.spacing[5],
  },
  alertsSection: {
    marginBottom: DesignTokens.spacing[6],
  },
  alertCard: {
    backgroundColor: DesignTokens.colors.surface.primary,
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[3],
    padding: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    borderLeftWidth: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  alertTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    flex: 1,
  },
  alertTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  dismissButton: {
    padding: DesignTokens.spacing[1],
  },
  alertMessage: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[2],
    lineHeight: 20,
  },
  alertRecommendations: {
    marginTop: DesignTokens.spacing[2],
  },
  alertRecommendation: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  recommendationsSection: {
    marginBottom: DesignTokens.spacing[6],
  },
  recommendationCard: {
    backgroundColor: DesignTokens.colors.surface.primary,
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[3],
    padding: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    borderLeftWidth: 4,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[2],
  },
  recommendationTitleContainer: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  recommendationDays: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  recommendationDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
  },
  recommendationDetails: {
    marginTop: DesignTokens.spacing[4],
    paddingTop: DesignTokens.spacing[4],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
  },
  reasoningSection: {
    marginBottom: DesignTokens.spacing[4],
  },
  alternativesSection: {
    marginBottom: DesignTokens.spacing[4],
  },
  detailsTitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },
  reasoningItem: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  alternativeItem: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[2],
  },
  followButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: '#10b981',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  planSection: {
    marginBottom: DesignTokens.spacing[6],
  },
  planCard: {
    backgroundColor: DesignTokens.colors.surface.primary,
    marginHorizontal: DesignTokens.spacing[5],
    padding: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  phaseBadge: {
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  phaseBadgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  planDuration: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  planSectionTitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },
  planItem: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  indicatorsSection: {
    marginBottom: DesignTokens.spacing[6],
  },
  indicatorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[3],
  },
  expandText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  indicatorsList: {
    paddingHorizontal: DesignTokens.spacing[5],
  },
  indicatorCard: {
    backgroundColor: DesignTokens.colors.surface.primary,
    padding: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    marginBottom: DesignTokens.spacing[2],
  },
  indicatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[1],
  },
  indicatorName: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    flex: 1,
  },
  indicatorValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  indicatorDescription: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 16,
  },
  insightsSection: {
    marginBottom: DesignTokens.spacing[6],
  },
  insightCard: {
    backgroundColor: DesignTokens.colors.surface.primary,
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[3],
    padding: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[2],
  },
  insightTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  insightDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
  },
});
