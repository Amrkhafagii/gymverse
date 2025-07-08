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
import { useAIWorkoutSuggestions } from '@/hooks/useAIWorkoutSuggestions';
import { WorkoutRecommendation, AIInsight } from '@/types/aiRecommendation';
import { DesignTokens } from '@/design-system/tokens';
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Dumbbell,
  X,
  RefreshCw,
  ChevronRight,
  Star,
  Activity,
  BarChart3
} from 'lucide-react-native';

interface AIWorkoutSuggestionsProps {
  onSelectRecommendation?: (recommendation: WorkoutRecommendation) => void;
  showInsights?: boolean;
  compactMode?: boolean;
}

export function AIWorkoutSuggestions({ 
  onSelectRecommendation, 
  showInsights = true,
  compactMode = false 
}: AIWorkoutSuggestionsProps) {
  const {
    recommendations,
    insights,
    userProfile,
    summaryStats,
    frequencyAnalysis,
    muscleGroupAnalysis,
    isGenerating,
    isLoading,
    lastGenerated,
    needsRefresh,
    error,
    refreshRecommendations,
    dismissRecommendation,
    markInsightAsRead,
    getRecommendationsByPriority,
    getInsightsByType,
    clearError,
  } = useAIWorkoutSuggestions();

  const [refreshing, setRefreshing] = useState(false);
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRecommendations();
    setRefreshing(false);
  };

  const handleSelectRecommendation = (recommendation: WorkoutRecommendation) => {
    if (onSelectRecommendation) {
      onSelectRecommendation(recommendation);
    } else {
      Alert.alert(
        'Start Workout',
        `Would you like to start "${recommendation.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start', onPress: () => console.log('Starting workout:', recommendation.id) },
        ]
      );
    }
  };

  const handleDismissRecommendation = (recommendation: WorkoutRecommendation) => {
    Alert.alert(
      'Dismiss Recommendation',
      'Are you sure you want to dismiss this recommendation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Dismiss', onPress: () => dismissRecommendation(recommendation.id) },
      ]
    );
  };

  const formatLastGenerated = () => {
    if (!lastGenerated) return 'Never';
    const date = new Date(lastGenerated);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return DesignTokens.colors.error[500];
      case 'medium': return DesignTokens.colors.warning[500];
      case 'low': return DesignTokens.colors.success[500];
      default: return DesignTokens.colors.text.secondary;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={20} color={DesignTokens.colors.warning[500]} />;
      case 'improvement': return <TrendingUp size={20} color={DesignTokens.colors.success[500]} />;
      case 'suggestion': return <Target size={20} color={DesignTokens.colors.primary[500]} />;
      case 'pattern': return <BarChart3 size={20} color={DesignTokens.colors.text.secondary} />;
      default: return <Brain size={20} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const RecommendationCard = ({ recommendation }: { recommendation: WorkoutRecommendation }) => {
    const isExpanded = expandedRecommendation === recommendation.id;

    return (
      <View style={styles.recommendationCard}>
        <TouchableOpacity
          style={styles.recommendationHeader}
          onPress={() => setExpandedRecommendation(isExpanded ? null : recommendation.id)}
        >
          <View style={styles.recommendationTitleRow}>
            <View style={styles.recommendationTitleContainer}>
              <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
              <View style={styles.recommendationMeta}>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(recommendation.priority) + '20' }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(recommendation.priority) }]}>
                    {recommendation.priority.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.confidenceBadge}>
                  <Star size={12} color={DesignTokens.colors.warning[500]} />
                  <Text style={styles.confidenceText}>{recommendation.confidence}%</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => handleDismissRecommendation(recommendation)}
            >
              <X size={16} color={DesignTokens.colors.text.tertiary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
          
          <View style={styles.recommendationStats}>
            <View style={styles.statItem}>
              <Clock size={14} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.statText}>{recommendation.estimatedDuration} min</Text>
            </View>
            <View style={styles.statItem}>
              <Dumbbell size={14} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.statText}>{recommendation.exercises.length} exercises</Text>
            </View>
            <View style={styles.statItem}>
              <Activity size={14} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.statText}>{recommendation.difficulty}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.recommendationDetails}>
            {/* Reasoning */}
            <View style={styles.reasoningSection}>
              <Text style={styles.sectionTitle}>Why this workout?</Text>
              {recommendation.reasoning.map((reason, index) => (
                <View key={index} style={styles.reasonItem}>
                  <CheckCircle size={14} color={DesignTokens.colors.success[500]} />
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </View>

            {/* Target Muscle Groups */}
            <View style={styles.muscleGroupsSection}>
              <Text style={styles.sectionTitle}>Target Areas</Text>
              <View style={styles.muscleGroupTags}>
                {recommendation.targetMuscleGroups.map((group, index) => (
                  <View key={index} style={styles.muscleGroupTag}>
                    <Text style={styles.muscleGroupTagText}>{group}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Exercises Preview */}
            <View style={styles.exercisesSection}>
              <Text style={styles.sectionTitle}>Exercises ({recommendation.exercises.length})</Text>
              {recommendation.exercises.slice(0, 3).map((exercise, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDetails}>
                    {exercise.sets} sets × {exercise.reps.join('-')} reps
                  </Text>
                </View>
              ))}
              {recommendation.exercises.length > 3 && (
                <Text style={styles.moreExercises}>
                  +{recommendation.exercises.length - 3} more exercises
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => handleSelectRecommendation(recommendation)}
              >
                <Zap size={16} color={DesignTokens.colors.text.primary} />
                <Text style={styles.startButtonText}>Start Workout</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.customizeButton}>
                <Text style={styles.customizeButtonText}>Customize</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const InsightCard = ({ insight, index }: { insight: AIInsight; index: number }) => (
    <View style={styles.insightCard}>
      <View style={styles.insightHeader}>
        {getInsightIcon(insight.type)}
        <View style={styles.insightTitleContainer}>
          <Text style={styles.insightTitle}>{insight.title}</Text>
          <Text style={styles.insightDescription}>{insight.description}</Text>
        </View>
        <TouchableOpacity
          style={styles.insightDismiss}
          onPress={() => markInsightAsRead(index)}
        >
          <X size={14} color={DesignTokens.colors.text.tertiary} />
        </TouchableOpacity>
      </View>
      
      {insight.recommendation && (
        <View style={styles.insightRecommendation}>
          <Text style={styles.insightRecommendationText}>💡 {insight.recommendation}</Text>
        </View>
      )}
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle size={48} color={DesignTokens.colors.error[500]} />
        <Text style={styles.errorTitle}>AI Recommendations Unavailable</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={clearError}>
          <RefreshCw size={16} color={DesignTokens.colors.text.primary} />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Brain size={48} color={DesignTokens.colors.primary[500]} />
        <Text style={styles.loadingText}>Analyzing your workout patterns...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Brain size={24} color={DesignTokens.colors.primary[500]} />
          <Text style={styles.headerTitle}>AI Recommendations</Text>
        </View>
        
        <View style={styles.headerActions}>
          {needsRefresh && (
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={refreshRecommendations}
              disabled={isGenerating}
            >
              <RefreshCw size={16} color={DesignTokens.colors.primary[500]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Summary Stats */}
      {!compactMode && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summaryStats.totalRecommendations}</Text>
            <Text style={styles.summaryLabel}>Recommendations</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summaryStats.averageConfidence}%</Text>
            <Text style={styles.summaryLabel}>Confidence</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summaryStats.totalInsights}</Text>
            <Text style={styles.summaryLabel}>Insights</Text>
          </View>
        </View>
      )}

      {/* Last Generated */}
      <View style={styles.lastGeneratedContainer}>
        <Text style={styles.lastGeneratedText}>
          Last updated: {formatLastGenerated()}
        </Text>
        {isGenerating && <Text style={styles.generatingText}>Generating new recommendations...</Text>}
      </View>

      {/* High Priority Recommendations */}
      {getRecommendationsByPriority('high').length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>🔥 Priority Recommendations</Text>
          {getRecommendationsByPriority('high').map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </View>
      )}

      {/* AI Insights */}
      {showInsights && insights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>🧠 AI Insights</Text>
          {insights.slice(0, compactMode ? 2 : 5).map((insight, index) => (
            <InsightCard key={index} insight={insight} index={index} />
          ))}
        </View>
      )}

      {/* Other Recommendations */}
      {(getRecommendationsByPriority('medium').length > 0 || getRecommendationsByPriority('low').length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>💡 More Suggestions</Text>
          {[...getRecommendationsByPriority('medium'), ...getRecommendationsByPriority('low')]
            .slice(0, compactMode ? 2 : 10)
            .map((recommendation) => (
              <RecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
        </View>
      )}

      {/* Empty State */}
      {recommendations.length === 0 && (
        <View style={styles.emptyState}>
          <Brain size={48} color={DesignTokens.colors.text.tertiary} />
          <Text style={styles.emptyStateTitle}>No Recommendations Yet</Text>
          <Text style={styles.emptyStateText}>
            Complete a few workouts to unlock personalized AI recommendations
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  headerTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  refreshButton: {
    padding: DesignTokens.spacing[2],
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
    gap: DesignTokens.spacing[3],
  },
  summaryCard: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[3],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  summaryLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  lastGeneratedContainer: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  lastGeneratedText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  generatingText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    marginTop: DesignTokens.spacing[1],
  },
  section: {
    marginBottom: DesignTokens.spacing[6],
  },
  sectionHeader: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[3],
  },
  recommendationCard: {
    backgroundColor: DesignTokens.colors.surface.primary,
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recommendationHeader: {
    padding: DesignTokens.spacing[4],
  },
  recommendationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[2],
  },
  recommendationTitleContainer: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },
  recommendationMeta: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  priorityBadge: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  priorityText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    backgroundColor: DesignTokens.colors.warning[500] + '20',
    borderRadius: DesignTokens.borderRadius.sm,
  },
  confidenceText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.warning[500],
  },
  dismissButton: {
    padding: DesignTokens.spacing[1],
  },
  recommendationDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
    marginBottom: DesignTokens.spacing[3],
  },
  recommendationStats: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[4],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  statText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  recommendationDetails: {
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
    padding: DesignTokens.spacing[4],
  },
  reasoningSection: {
    marginBottom: DesignTokens.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[1],
  },
  reasonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    flex: 1,
  },
  muscleGroupsSection: {
    marginBottom: DesignTokens.spacing[4],
  },
  muscleGroupTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[1],
  },
  muscleGroupTag: {
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  muscleGroupTagText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  exercisesSection: {
    marginBottom: DesignTokens.spacing[4],
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[1],
  },
  exerciseName: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  exerciseDetails: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  moreExercises: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: DesignTokens.spacing[1],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.primary[500],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
  },
  startButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  customizeButton: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[700],
  },
  customizeButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.secondary,
  },
  insightCard: {
    backgroundColor: DesignTokens.colors.surface.primary,
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: DesignTokens.spacing[3],
  },
  insightTitleContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  insightDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
  },
  insightDismiss: {
    padding: DesignTokens.spacing[1],
  },
  insightRecommendation: {
    marginTop: DesignTokens.spacing[3],
    paddingTop: DesignTokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
  },
  insightRecommendationText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.warning[500],
    fontStyle: 'italic',
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[12],
    paddingHorizontal: DesignTokens.spacing[5],
  },
  loadingText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[4],
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[12],
    paddingHorizontal: DesignTokens.spacing[5],
  },
  errorTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[2],
  },
  errorText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: DesignTokens.spacing[4],
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.primary[500],
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
  },
  retryButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
  },
});
