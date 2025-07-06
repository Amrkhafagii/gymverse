import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Target, Sparkles, Play } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface SmartSuggestion {
  id: string;
  name: string;
  reason: string;
  duration: string;
  exercises: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  image: string;
  confidence: number;
  muscleGroups: string[];
}

interface SmartSuggestionCardProps {
  suggestion: SmartSuggestion;
  onStart: () => void;
  onCustomize: () => void;
}

export const SmartSuggestionCard: React.FC<SmartSuggestionCardProps> = ({
  suggestion,
  onStart,
  onCustomize,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return DesignTokens.colors.success[500];
      case 'Intermediate': return DesignTokens.colors.warning[500];
      case 'Advanced': return DesignTokens.colors.error[500];
      default: return DesignTokens.colors.text.secondary;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onStart} activeOpacity={0.8}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.aiIndicator}>
            <Sparkles size={14} color={DesignTokens.colors.primary[400]} />
            <Text style={styles.aiText}>AI Recommended</Text>
          </View>
          <View style={styles.confidenceIndicator}>
            <Text style={styles.confidenceText}>{suggestion.confidence}% match</Text>
          </View>
        </View>

        {/* Image */}
        <Image source={{ uri: suggestion.image }} style={styles.image} />

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>
            {suggestion.name}
          </Text>
          <Text style={styles.reason} numberOfLines={2}>
            {suggestion.reason}
          </Text>

          {/* Meta Info */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Clock size={14} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.metaText}>{suggestion.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Target size={14} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.metaText}>{suggestion.exercises} exercises</Text>
            </View>
          </View>

          {/* Difficulty Badge */}
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(suggestion.difficulty) }
          ]}>
            <Text style={styles.difficultyText}>{suggestion.difficulty}</Text>
          </View>

          {/* Muscle Groups */}
          <View style={styles.muscleGroups}>
            {suggestion.muscleGroups.slice(0, 2).map((group, index) => (
              <View key={index} style={styles.muscleTag}>
                <Text style={styles.muscleTagText}>{group}</Text>
              </View>
            ))}
            {suggestion.muscleGroups.length > 2 && (
              <Text style={styles.moreText}>+{suggestion.muscleGroups.length - 2}</Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.startButton} onPress={onStart}>
              <Play size={16} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.customizeButton} onPress={onCustomize}>
              <Text style={styles.customizeButtonText}>Customize</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    marginRight: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    ...DesignTokens.shadow.lg,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DesignTokens.spacing[3],
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${DesignTokens.colors.primary[500]}20`,
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  aiText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.primary[400],
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginLeft: DesignTokens.spacing[1],
  },
  confidenceIndicator: {
    backgroundColor: DesignTokens.colors.success[500],
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  confidenceText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  image: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  content: {
    padding: DesignTokens.spacing[4],
  },
  name: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },
  reason: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[3],
    lineHeight: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[3],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  metaText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
    marginBottom: DesignTokens.spacing[3],
  },
  difficultyText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
  },
  muscleGroups: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[4],
  },
  muscleTag: {
    backgroundColor: DesignTokens.colors.neutral[800],
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  muscleTagText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  moreText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  actions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  startButton: {
    flex: 1,
    backgroundColor: DesignTokens.colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing[1],
  },
  startButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
  },
  customizeButton: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
  },
  customizeButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
  },
});
