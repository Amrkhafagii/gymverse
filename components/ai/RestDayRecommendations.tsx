import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RestDayRecommendation } from '@/lib/services/aiService';

interface RestDayRecommendationsProps {
  visible: boolean;
  onClose: () => void;
  recommendation: RestDayRecommendation | null;
  loading: boolean;
  error: string | null;
}

export default function RestDayRecommendations({
  visible,
  onClose,
  recommendation,
  loading,
  error
}: RestDayRecommendationsProps) {
  const getPriorityColor = (priority: RestDayRecommendation['priority']) => {
    switch (priority) {
      case 'high': return ['#ef4444', '#dc2626'];
      case 'medium': return ['#f59e0b', '#d97706'];
      case 'low': return ['#10b981', '#059669'];
      default: return ['#6b7280', '#4b5563'];
    }
  };

  const getPriorityIcon = (priority: RestDayRecommendation['priority']) => {
    switch (priority) {
      case 'high': return 'warning';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'complete_rest': return 'bed';
      case 'active_recovery': return 'walk';
      case 'light_activity': return 'bicycle';
      default: return 'fitness';
    }
  };

  const renderRecoveryIndicators = () => {
    if (!recommendation) return null;

    const indicators = [
      { label: 'Muscle Fatigue', value: recommendation.recovery_indicators.muscle_fatigue, icon: 'body' },
      { label: 'Intensity Overload', value: recommendation.recovery_indicators.intensity_overload, icon: 'flash' },
      { label: 'Frequency Concern', value: recommendation.recovery_indicators.frequency_concern, icon: 'time' },
      { label: 'Overall Stress', value: recommendation.recovery_indicators.overall_stress, icon: 'pulse' }
    ];

    return (
      <View style={styles.indicatorsSection}>
        <Text style={styles.sectionTitle}>Recovery Indicators</Text>
        <View style={styles.indicatorsGrid}>
          {indicators.map((indicator, index) => (
            <View key={index} style={styles.indicatorCard}>
              <View style={styles.indicatorHeader}>
                <Ionicons name={indicator.icon as any} size={20} color="#9E7FFF" />
                <Text style={styles.indicatorLabel}>{indicator.label}</Text>
              </View>
              <View style={styles.indicatorBar}>
                <View style={styles.indicatorBarBackground}>
                  <LinearGradient
                    colors={indicator.value >= 7 ? ['#ef4444', '#dc2626'] : 
                           indicator.value >= 5 ? ['#f59e0b', '#d97706'] : 
                           ['#10b981', '#059669']}
                    style={[styles.indicatorBarFill, { width: `${indicator.value * 10}%` }]}
                  />
                </View>
                <Text style={styles.indicatorValue}>{indicator.value.toFixed(1)}/10</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderSuggestedActivities = () => {
    if (!recommendation) return null;

    return (
      <View style={styles.activitiesSection}>
        <Text style={styles.sectionTitle}>Suggested Activities</Text>
        {recommendation.suggested_activities.map((activityGroup, index) => (
          <View key={index} style={styles.activityGroup}>
            <View style={styles.activityHeader}>
              <Ionicons name={getActivityIcon(activityGroup.type) as any} size={20} color="#9E7FFF" />
              <Text style={styles.activityType}>
                {activityGroup.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              {activityGroup.duration_minutes && (
                <Text style={styles.activityDuration}>{activityGroup.duration_minutes} min</Text>
              )}
            </View>
            <View style={styles.activityList}>
              {activityGroup.activities.map((activity, actIndex) => (
                <Text key={actIndex} style={styles.activityItem}>• {activity}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderNextWorkoutSuggestions = () => {
    if (!recommendation) return null;

    const { next_workout_suggestions } = recommendation;

    return (
      <View style={styles.nextWorkoutSection}>
        <Text style={styles.sectionTitle}>Next Workout Guidance</Text>
        <View style={styles.nextWorkoutCard}>
          <LinearGradient
            colors={['#1f2937', '#111827']}
            style={styles.nextWorkoutGradient}
          >
            <View style={styles.nextWorkoutRow}>
              <Text style={styles.nextWorkoutLabel}>Recommended Intensity:</Text>
              <View style={[styles.intensityBadge, { 
                backgroundColor: next_workout_suggestions.recommended_intensity === 'high' ? '#ef4444' :
                                next_workout_suggestions.recommended_intensity === 'moderate' ? '#f59e0b' : '#10b981'
              }]}>
                <Text style={styles.intensityText}>
                  {next_workout_suggestions.recommended_intensity.toUpperCase()}
                </Text>
              </View>
            </View>

            {next_workout_suggestions.focus_areas.length > 0 && (
              <View style={styles.nextWorkoutRow}>
                <Text style={styles.nextWorkoutLabel}>Focus Areas:</Text>
                <View style={styles.focusTags}>
                  {next_workout_suggestions.focus_areas.map((area, index) => (
                    <View key={index} style={styles.focusTag}>
                      <Text style={styles.focusTagText}>{area}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {next_workout_suggestions.avoid_muscle_groups.length > 0 && (
              <View style={styles.nextWorkoutRow}>
                <Text style={styles.nextWorkoutLabel}>Avoid:</Text>
                <View style={styles.avoidTags}>
                  {next_workout_suggestions.avoid_muscle_groups.map((group, index) => (
                    <View key={index} style={styles.avoidTag}>
                      <Text style={styles.avoidTagText}>{group}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </LinearGradient>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Rest Day Analysis</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Analyzing your recovery needs...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : recommendation ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Main Recommendation */}
            <View style={styles.mainRecommendation}>
              <LinearGradient
                colors={getPriorityColor(recommendation.priority)}
                style={styles.recommendationGradient}
              >
                <View style={styles.recommendationHeader}>
                  <Ionicons 
                    name={getPriorityIcon(recommendation.priority) as any} 
                    size={32} 
                    color="#FFFFFF" 
                  />
                  <View style={styles.recommendationText}>
                    <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
                    <Text style={styles.recommendationType}>
                      {recommendation.recommendation_type.replace('_', ' ').toUpperCase()} • {recommendation.priority.toUpperCase()} PRIORITY
                    </Text>
                  </View>
                </View>
                <Text style={styles.recommendationDescription}>
                  {recommendation.description}
                </Text>
                <View style={styles.recoveryTime}>
                  <Ionicons name="time" size={16} color="#FFFFFF" />
                  <Text style={styles.recoveryTimeText}>
                    Estimated recovery: {recommendation.estimated_recovery_time} hours
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Reasoning */}
            <View style={styles.reasoningSection}>
              <Text style={styles.sectionTitle}>Why This Recommendation?</Text>
              <View style={styles.reasoningList}>
                {recommendation.reasoning.map((reason, index) => (
                  <View key={index} style={styles.reasoningItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#9E7FFF" />
                    <Text style={styles.reasoningText}>{reason}</Text>
                  </View>
                ))}
              </View>
            </View>

            {renderRecoveryIndicators()}
            {renderSuggestedActivities()}
            {renderNextWorkoutSuggestions()}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recommendation data available</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2F2F2F',
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2F2F2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  mainRecommendation: {
    marginBottom: 24,
  },
  recommendationGradient: {
    borderRadius: 16,
    padding: 20,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationText: {
    flex: 1,
    marginLeft: 16,
  },
  recommendationTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  recommendationType: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Medium',
  },
  recommendationDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
    marginBottom: 12,
  },
  recoveryTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recoveryTimeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  reasoningSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  reasoningList: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  reasoningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reasoningText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  indicatorsSection: {
    marginBottom: 24,
  },
  indicatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  indicatorCard: {
    width: '48%',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    margin: 6,
  },
  indicatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicatorLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
    flex: 1,
  },
  indicatorBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    marginRight: 8,
  },
  indicatorBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  indicatorValue: {
    fontSize: 10,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    minWidth: 30,
  },
  activitiesSection: {
    marginBottom: 24,
  },
  activityGroup: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityType: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
    flex: 1,
  },
  activityDuration: {
    fontSize: 12,
    color: '#9E7FFF',
    fontFamily: 'Inter-Medium',
  },
  activityList: {
    marginLeft: 28,
  },
  activityItem: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
    lineHeight: 20,
  },
  nextWorkoutSection: {
    marginBottom: 24,
  },
  nextWorkoutCard: {
    marginBottom: 8,
  },
  nextWorkoutGradient: {
    borderRadius: 12,
    padding: 16,
  },
  nextWorkoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextWorkoutLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    minWidth: 120,
  },
  intensityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  intensityText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  focusTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  focusTag: {
    backgroundColor: '#9E7FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  focusTagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  avoidTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  avoidTag: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  avoidTagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
});
