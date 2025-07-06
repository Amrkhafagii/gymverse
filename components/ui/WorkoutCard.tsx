import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ChevronRight, Clock, Target, Repeat } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface WorkoutCardProps {
  workout: {
    id: number;
    name: string;
    date: string;
    duration: string;
    exercises: number;
    image: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    muscleGroups?: string[];
    lastPerformed?: string;
  };
  onPress: () => void;
  onQuickAction?: () => void;
  showInsights?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onPress,
  onQuickAction,
  showInsights = false,
  variant = 'default',
}) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner': return DesignTokens.colors.success[500];
      case 'Intermediate': return DesignTokens.colors.warning[500];
      case 'Advanced': return DesignTokens.colors.error[500];
      default: return DesignTokens.colors.text.secondary;
    }
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Image source={{ uri: workout.image }} style={styles.compactImage} />
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={1}>
            {workout.name}
          </Text>
          <Text style={styles.compactMeta}>
            {workout.duration} • {workout.exercises} exercises
          </Text>
        </View>
        <ChevronRight size={16} color={DesignTokens.colors.text.tertiary} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        variant === 'featured' && styles.featuredCard
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: workout.image }} style={styles.image} />
        {workout.difficulty && (
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(workout.difficulty) }
          ]}>
            <Text style={styles.difficultyText}>{workout.difficulty}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>
            {workout.name}
          </Text>
          {onQuickAction && (
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={onQuickAction}
            >
              <Repeat size={16} color={DesignTokens.colors.primary[500]} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Clock size={14} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.metaText}>{workout.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Target size={14} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.metaText}>{workout.exercises} exercises</Text>
          </View>
        </View>
        
        {workout.muscleGroups && (
          <View style={styles.muscleGroups}>
            {workout.muscleGroups.slice(0, 3).map((group, index) => (
              <View key={index} style={styles.muscleGroupTag}>
                <Text style={styles.muscleGroupText}>{group}</Text>
              </View>
            ))}
            {workout.muscleGroups.length > 3 && (
              <Text style={styles.moreText}>
                +{workout.muscleGroups.length - 3} more
              </Text>
            )}
          </View>
        )}
        
        {showInsights && workout.lastPerformed && (
          <View style={styles.insightContainer}>
            <Text style={styles.insightText}>
              Last performed {workout.lastPerformed}
            </Text>
          </View>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.dateText}>{workout.date}</Text>
          <ChevronRight size={20} color={DesignTokens.colors.text.tertiary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    marginBottom: DesignTokens.spacing[3],
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  featuredCard: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.primary[500],
    ...DesignTokens.shadow.lg,
  },
  compactCard: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  compactImage: {
    width: 50,
    height: 50,
    borderRadius: DesignTokens.borderRadius.md,
    marginRight: DesignTokens.spacing[3],
  },
  difficultyBadge: {
    position: 'absolute',
    top: DesignTokens.spacing[2],
    right: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  difficultyText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
  },
  content: {
    padding: DesignTokens.spacing[4],
  },
  compactContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[2],
  },
  name: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    flex: 1,
    marginRight: DesignTokens.spacing[2],
  },
  compactName: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  quickActionButton: {
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.sm,
    backgroundColor: `${DesignTokens.colors.primary[500]}20`,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[3],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  metaText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  compactMeta: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[3],
  },
  muscleGroupTag: {
    backgroundColor: DesignTokens.colors.neutral[800],
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  muscleGroupText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  moreText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    alignSelf: 'center',
  },
  insightContainer: {
    backgroundColor: `${DesignTokens.colors.primary[500]}10`,
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.sm,
    marginBottom: DesignTokens.spacing[3],
  },
  insightText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.primary[400],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
});
