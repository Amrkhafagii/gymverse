import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Trophy,
  Target,
  X,
  ChevronRight,
  Sparkles,
  Activity,
  Calendar,
  Zap,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { SmartInsight } from '@/types/aiRecommendation';
import * as Haptics from 'expo-haptics';

interface SmartInsightsCardProps {
  insights: SmartInsight[];
  onInsightAction?: (insight: SmartInsight) => void;
  onDismissInsight?: (insightId: string) => void;
  maxVisible?: number;
  showHeader?: boolean;
}

export function SmartInsightsCard({
  insights,
  onInsightAction,
  onDismissInsight,
  maxVisible = 3,
  showHeader = true,
}: SmartInsightsCardProps) {
  const [visibleInsights, setVisibleInsights] = useState<SmartInsight[]>([]);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  useEffect(() => {
    // Filter out dismissed insights and sort by priority and date
    const activeInsights = insights
      .filter(insight => !insight.dismissed)
      .filter(insight => !insight.expiresAt || new Date(insight.expiresAt) > new Date())
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    setVisibleInsights(activeInsights.slice(0, maxVisible));
  }, [insights, maxVisible]);

  const getInsightIcon = (type: SmartInsight['type']) => {
    switch (type) {
      case 'achievement':
        return <Trophy size={20} color="#FFD700" />;
      case 'warning':
        return <AlertTriangle size={20} color="#FF6B35" />;
      case 'suggestion':
        return <Lightbulb size={20} color="#00D4AA" />;
      case 'milestone':
        return <Target size={20} color="#9E7FFF" />;
      case 'pattern':
        return <TrendingUp size={20} color="#4ECDC4" />;
      default:
        return <Brain size={20} color="#667EEA" />;
    }
  };

  const getInsightColor = (type: SmartInsight['type']) => {
    switch (type) {
      case 'achievement':
        return '#FFD700';
      case 'warning':
        return '#FF6B35';
      case 'suggestion':
        return '#00D4AA';
      case 'milestone':
        return '#9E7FFF';
      case 'pattern':
        return '#4ECDC4';
      default:
        return '#667EEA';
    }
  };

  const getPriorityColor = (priority: SmartInsight['priority']) => {
    switch (priority) {
      case 'high':
        return '#FF6B35';
      case 'medium':
        return '#FFD700';
      case 'low':
        return '#00D4AA';
      default:
        return '#667EEA';
    }
  };

  const handleInsightPress = async (insight: SmartInsight) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (expandedInsight === insight.id) {
      setExpandedInsight(null);
    } else {
      setExpandedInsight(insight.id);
    }
  };

  const handleActionPress = async (insight: SmartInsight) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onInsightAction?.(insight);
  };

  const handleDismiss = async (insight: SmartInsight) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      'Dismiss Insight',
      'Are you sure you want to dismiss this insight?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dismiss',
          onPress: () => onDismissInsight?.(insight.id),
        },
      ]
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (visibleInsights.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.emptyCard}>
          <Brain size={48} color={DesignTokens.colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No Insights Available</Text>
          <Text style={styles.emptyDescription}>
            Complete more workouts to receive personalized AI insights and recommendations.
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.aiIcon}>
              <Brain size={20} color={DesignTokens.colors.primary[500]} />
              <Sparkles size={12} color="#FFD700" style={styles.sparkle} />
            </View>
            <View>
              <Text style={styles.headerTitle}>AI Insights</Text>
              <Text style={styles.headerSubtitle}>
                {visibleInsights.length} active insight{visibleInsights.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          
          <View style={styles.confidenceIndicator}>
            <Activity size={16} color={DesignTokens.colors.success[500]} />
            <Text style={styles.confidenceText}>Active</Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.insightsContainer} showsVerticalScrollIndicator={false}>
        {visibleInsights.map((insight) => (
          <TouchableOpacity
            key={insight.id}
            style={[
              styles.insightCard,
              expandedInsight === insight.id && styles.insightCardExpanded,
            ]}
            onPress={() => handleInsightPress(insight)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                expandedInsight === insight.id
                  ? ['#2a2a2a', '#3a3a3a']
                  : ['#1a1a1a', '#2a2a2a']
              }
              style={styles.insightGradient}
            >
              {/* Priority Indicator */}
              <View style={[
                styles.priorityIndicator,
                { backgroundColor: getPriorityColor(insight.priority) }
              ]} />

              {/* Header */}
              <View style={styles.insightHeader}>
                <View style={styles.insightHeaderLeft}>
                  <View style={[
                    styles.insightIcon,
                    { backgroundColor: getInsightColor(insight.type) + '20' }
                  ]}>
                    {getInsightIcon(insight.type)}
                  </View>
                  
                  <View style={styles.insightInfo}>
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                    <View style={styles.insightMeta}>
                      <Text style={styles.insightType}>{insight.type}</Text>
                      <Text style={styles.insightDot}>•</Text>
                      <Text style={styles.insightTime}>{formatTimeAgo(insight.createdAt)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.insightHeaderRight}>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceBadgeText}>
                      {Math.round(insight.confidence)}%
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.dismissButton}
                    onPress={() => handleDismiss(insight)}
                  >
                    <X size={16} color={DesignTokens.colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Message */}
              <Text style={[
                styles.insightMessage,
                expandedInsight === insight.id && styles.insightMessageExpanded
              ]}>
                {insight.message}
              </Text>

              {/* Action Button */}
              {insight.actionable && insight.action && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { borderColor: getInsightColor(insight.type) }
                  ]}
                  onPress={() => handleActionPress(insight)}
                >
                  <View style={styles.actionButtonContent}>
                    {insight.action.type === 'workout' && <Zap size={16} color={getInsightColor(insight.type)} />}
                    {insight.action.type === 'exercise' && <Target size={16} color={getInsightColor(insight.type)} />}
                    {insight.action.type === 'rest' && <Calendar size={16} color={getInsightColor(insight.type)} />}
                    
                    <Text style={[
                      styles.actionButtonText,
                      { color: getInsightColor(insight.type) }
                    ]}>
                      {insight.action.label}
                    </Text>
                  </View>
                  
                  <ChevronRight size={16} color={getInsightColor(insight.type)} />
                </TouchableOpacity>
              )}

              {/* Expanded Content */}
              {expandedInsight === insight.id && (
                <View style={styles.expandedContent}>
                  <View style={styles.expandedStats}>
                    <View style={styles.expandedStat}>
                      <Text style={styles.expandedStatLabel}>Priority</Text>
                      <Text style={[
                        styles.expandedStatValue,
                        { color: getPriorityColor(insight.priority) }
                      ]}>
                        {insight.priority.toUpperCase()}
                      </Text>
                    </View>
                    
                    <View style={styles.expandedStat}>
                      <Text style={styles.expandedStatLabel}>Confidence</Text>
                      <Text style={styles.expandedStatValue}>
                        {Math.round(insight.confidence)}%
                      </Text>
                    </View>
                    
                    <View style={styles.expandedStat}>
                      <Text style={styles.expandedStatLabel}>Type</Text>
                      <Text style={styles.expandedStatValue}>
                        {insight.type.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>

                  {insight.expiresAt && (
                    <View style={styles.expiryInfo}>
                      <Calendar size={14} color={DesignTokens.colors.text.tertiary} />
                      <Text style={styles.expiryText}>
                        Expires {formatTimeAgo(insight.expiresAt)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {insights.length > maxVisible && (
        <TouchableOpacity style={styles.viewMoreButton}>
          <Text style={styles.viewMoreText}>
            View {insights.length - maxVisible} more insights
          </Text>
          <ChevronRight size={16} color={DesignTokens.colors.primary[500]} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  emptyContainer: {
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  emptyCard: {
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[8],
    alignItems: 'center',
    ...DesignTokens.shadow.base,
  },
  emptyTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[2],
  },
  emptyDescription: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  aiIcon: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  headerTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  confidenceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    backgroundColor: DesignTokens.colors.success[500] + '20',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  confidenceText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.success[500],
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  insightsContainer: {
    maxHeight: 400,
  },
  insightCard: {
    borderRadius: DesignTokens.borderRadius.lg,
    marginBottom: DesignTokens.spacing[3],
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  insightCardExpanded: {
    ...DesignTokens.shadow.lg,
  },
  insightGradient: {
    position: 'relative',
    padding: DesignTokens.spacing[4],
  },
  priorityIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[3],
  },
  insightHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: DesignTokens.spacing[3],
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightInfo: {
    flex: 1,
  },
  insightTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  insightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  insightType: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textTransform: 'capitalize',
  },
  insightDot: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  insightTime: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  insightHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  confidenceBadge: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  confidenceBadgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  dismissButton: {
    padding: DesignTokens.spacing[1],
  },
  insightMessage: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
    marginBottom: DesignTokens.spacing[3],
  },
  insightMessageExpanded: {
    marginBottom: DesignTokens.spacing[4],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[2],
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  actionButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
    paddingTop: DesignTokens.spacing[3],
    marginTop: DesignTokens.spacing[2],
  },
  expandedStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: DesignTokens.spacing[3],
  },
  expandedStat: {
    alignItems: 'center',
  },
  expandedStatLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    marginBottom: DesignTokens.spacing[1],
  },
  expandedStatValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    justifyContent: 'center',
  },
  expiryText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    marginTop: DesignTokens.spacing[2],
    gap: DesignTokens.spacing[2],
  },
  viewMoreText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
