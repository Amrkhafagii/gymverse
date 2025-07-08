import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Brain,
  Zap,
  Target,
  Clock,
  TrendingUp,
  RefreshCw,
  Play,
  Star,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useAIWorkoutSuggestions } from '@/hooks/useAIWorkoutSuggestions';
import { Button } from '@/components/ui/Button';
import * as Haptics from 'expo-haptics';

interface AIWorkoutSuggestionsProps {
  onWorkoutSelect: (workoutId: string) => void;
  onCreateCustom: () => void;
  maxSuggestions?: number;
  showRefresh?: boolean;
}

export function AIWorkoutSuggestions({
  onWorkoutSelect,
  onCreateCustom,
  maxSuggestions = 3,
  showRefresh = true,
}: AIWorkoutSuggestionsProps) {
  const {
    suggestions,
    isGenerating,
    confidence,
    lastUpdated,
    generateSuggestions,
    refreshSuggestions,
    getReasoningExplanation,
  } = useAIWorkoutSuggestions();

  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  useEffect(() => {
    if (suggestions.length === 0) {
      generateSuggestions();
    }
  }, []);

  const handleSuggestionPress = async (suggestionId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedSuggestion(suggestionId);
    onWorkoutSelect(suggestionId);
  };

  const handleRefresh = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshSuggestions();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return DesignTokens.colors.success[500];
      case 'intermediate':
        return DesignTokens.colors.warning[500];
      case 'advanced':
        return DesignTokens.colors.error[500];
      default:
        return DesignTokens.colors.primary[500];
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return DesignTokens.colors.success[500];
    if (confidence >= 0.6) return DesignTokens.colors.warning[500];
    return DesignTokens.colors.error[500];
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  if (isGenerating && suggestions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#1a1a1a', '#2a2a2a']}
          style={styles.loadingGradient}
        >
          <View style={styles.loadingContent}>
            <View style={styles.aiIcon}>
              <Brain size={32} color={DesignTokens.colors.primary[500]} />
              <View style={styles.sparkleContainer}>
                <Sparkles size={16} color="#FFD700" style={styles.sparkle1} />
                <Sparkles size={12} color="#FFD700" style={styles.sparkle2} />
              </View>
            </View>
            <ActivityIndicator size="large" color={DesignTokens.colors.primary[500]} />
            <Text style={styles.loadingTitle}>AI Analyzing Your Progress</Text>
            <Text style={styles.loadingText}>
              Creating personalized workout recommendations based on your fitness data...
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiIconSmall}>
            <Brain size={20} color={DesignTokens.colors.primary[500]} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Recommendations</Text>
            <Text style={styles.headerSubtitle}>
              Confidence: {Math.round(confidence * 100)}%
            </Text>
          </View>
        </View>
        {showRefresh && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={isGenerating}
          >
            <RefreshCw 
              size={20} 
              color={DesignTokens.colors.text.secondary}
              style={isGenerating ? styles.spinning : undefined}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Confidence Indicator */}
      <View style={styles.confidenceBar}>
        <View style={styles.confidenceTrack}>
          <View 
            style={[
              styles.confidenceFill,
              { 
                width: `${confidence * 100}%`,
                backgroundColor: getConfidenceColor(confidence),
              }
            ]} 
          />
        </View>
        <Text style={styles.confidenceText}>
          {confidence >= 0.8 ? 'High' : confidence >= 0.6 ? 'Medium' : 'Low'} Confidence
        </Text>
      </View>

      {/* Suggestions */}
      <ScrollView 
        style={styles.suggestionsContainer}
        showsVerticalScrollIndicator={false}
      >
        {suggestions.slice(0, maxSuggestions).map((suggestion, index) => (
          <TouchableOpacity
            key={suggestion.id}
            style={[
              styles.suggestionCard,
              selectedSuggestion === suggestion.id && styles.suggestionCardSelected,
            ]}
            onPress={() => handleSuggestionPress(suggestion.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                selectedSuggestion === suggestion.id
                  ? [DesignTokens.colors.primary[600], DesignTokens.colors.primary[500]]
                  : ['#1a1a1a', '#2a2a2a']
              }
              style={styles.suggestionGradient}
            >
              {/* Priority Badge */}
              {index === 0 && (
                <View style={styles.priorityBadge}>
                  <Star size={12} color="#FFD700" />
                  <Text style={styles.priorityText}>Recommended</Text>
                </View>
              )}

              {/* Suggestion Header */}
              <View style={styles.suggestionHeader}>
                <View style={styles.suggestionInfo}>
                  <Text style={styles.suggestionTitle}>{suggestion.name}</Text>
                  <Text style={styles.suggestionType}>{suggestion.type}</Text>
                </View>
                <View style={styles.suggestionMeta}>
                  <View style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(suggestion.difficulty) + '20' }
                  ]}>
                    <Text style={[
                      styles.difficultyText,
                      { color: getDifficultyColor(suggestion.difficulty) }
                    ]}>
                      {suggestion.difficulty}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Workout Stats */}
              <View style={styles.suggestionStats}>
                <View style={styles.statItem}>
                  <Clock size={16} color={DesignTokens.colors.text.secondary} />
                  <Text style={styles.statText}>
                    {formatDuration(suggestion.estimatedDuration)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Target size={16} color={DesignTokens.colors.text.secondary} />
                  <Text style={styles.statText}>
                    {suggestion.targetMuscles.slice(0, 2).join(', ')}
                    {suggestion.targetMuscles.length > 2 && ` +${suggestion.targetMuscles.length - 2}`}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Zap size={16} color={DesignTokens.colors.text.secondary} />
                  <Text style={styles.statText}>
                    {suggestion.estimatedCalories} cal
                  </Text>
                </View>
              </View>

              {/* AI Reasoning */}
              <View style={styles.reasoningContainer}>
                <Text style={styles.reasoningTitle}>Why this workout?</Text>
                <Text style={styles.reasoningText}>
                  {getReasoningExplanation(suggestion.id)}
                </Text>
              </View>

              {/* Exercise Preview */}
              <View style={styles.exercisePreview}>
                <Text style={styles.exercisePreviewTitle}>
                  {suggestion.exercises.length} exercises:
                </Text>
                <View style={styles.exerciseList}>
                  {suggestion.exercises.slice(0, 3).map((exercise, idx) => (
                    <View key={idx} style={styles.exerciseItem}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseDetails}>
                        {exercise.sets}×{exercise.reps} {exercise.weight && `@ ${exercise.weight}lbs`}
                      </Text>
                    </View>
                  ))}
                  {suggestion.exercises.length > 3 && (
                    <Text style={styles.moreExercises}>
                      +{suggestion.exercises.length - 3} more exercises
                    </Text>
                  )}
                </View>
              </View>

              {/* Action Button */}
              <View style={styles.suggestionActions}>
                <Button
                  title="Start Workout"
                  variant={selectedSuggestion === suggestion.id ? "secondary" : "primary"}
                  size="small"
                  onPress={() => handleSuggestionPress(suggestion.id)}
                  style={styles.startButton}
                  leftIcon={<Play size={16} color={DesignTokens.colors.text.primary} />}
                />
                <TouchableOpacity style={styles.detailsButton}>
                  <ChevronRight size={16} color={DesignTokens.colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Custom Workout Option */}
        <TouchableOpacity
          style={styles.customWorkoutCard}
          onPress={onCreateCustom}
        >
          <View style={styles.customWorkoutContent}>
            <View style={styles.customWorkoutIcon}>
              <Target size={24} color={DesignTokens.colors.primary[500]} />
            </View>
            <View style={styles.customWorkoutInfo}>
              <Text style={styles.customWorkoutTitle}>Create Custom Workout</Text>
              <Text style={styles.customWorkoutText}>
                Build your own workout from scratch
              </Text>
            </View>
            <ChevronRight size={20} color={DesignTokens.colors.text.secondary} />
          </View>
        </TouchableOpacity>

        {/* Last Updated */}
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    margin: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignTokens.spacing[8],
  },
  loadingContent: {
    alignItems: 'center',
    gap: DesignTokens.spacing[4],
  },
  aiIcon: {
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  sparkleContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  sparkle1: {
    position: 'absolute',
  },
  sparkle2: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  loadingTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  aiIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  refreshButton: {
    padding: DesignTokens.spacing[2],
  },
  spinning: {
    // Add rotation animation if needed
  },
  confidenceBar: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingBottom: DesignTokens.spacing[4],
  },
  confidenceTrack: {
    height: 4,
    backgroundColor: DesignTokens.colors.neutral[700],
    borderRadius: 2,
    marginBottom: DesignTokens.spacing[2],
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    textAlign: 'center',
  },
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: DesignTokens.spacing[4],
  },
  suggestionCard: {
    borderRadius: DesignTokens.borderRadius.lg,
    marginBottom: DesignTokens.spacing[4],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionCardSelected: {
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  suggestionGradient: {
    padding: DesignTokens.spacing[4],
  },
  priorityBadge: {
    position: 'absolute',
    top: DesignTokens.spacing[3],
    right: DesignTokens.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    backgroundColor: '#FFD700' + '20',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  priorityText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#FFD700',
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[3],
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  suggestionType: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  suggestionMeta: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  difficultyText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  suggestionStats: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[4],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  statText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  reasoningContainer: {
    backgroundColor: DesignTokens.colors.surface.secondary + '50',
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[4],
  },
  reasoningTitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  reasoningText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  exercisePreview: {
    marginBottom: DesignTokens.spacing[4],
  },
  exercisePreviewTitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },
  exerciseList: {
    gap: DesignTokens.spacing[2],
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    flex: 1,
  },
  exerciseDetails: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  moreExercises: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontStyle: 'italic',
  },
  suggestionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  startButton: {
    flex: 1,
  },
  detailsButton: {
    padding: DesignTokens.spacing[2],
  },
  customWorkoutCard: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: DesignTokens.colors.primary[500] + '30',
    borderStyle: 'dashed',
  },
  customWorkoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  customWorkoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customWorkoutInfo: {
    flex: 1,
  },
  customWorkoutTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  customWorkoutText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  lastUpdated: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
});
