/**
 * Enhanced RecentWorkoutCard with Achievement Integration
 * Now shows achievement progress related to workouts
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { 
  Calendar, 
  Clock, 
  Dumbbell, 
  Target,
  MoreHorizontal,
  Award,
  TrendingUp 
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number; // in minutes
  exercises: number;
  totalVolume: number; // in kg
  muscleGroups: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface AchievementProgress {
  nearCompletion: boolean;
  category: string;
  progress: number;
}

interface RecentWorkoutCardProps {
  workout: Workout;
  onPress: () => void;
  onRepeat: () => void;
  style?: ViewStyle;
  achievementProgress?: AchievementProgress;
}

export const RecentWorkoutCard: React.FC<RecentWorkoutCardProps> = ({
  workout,
  onPress,
  onRepeat,
  style,
  achievementProgress,
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k kg`;
    return `${volume} kg`;
  };

  const getDifficultyColor = () => {
    switch (workout.difficulty) {
      case 'Beginner':
        return DesignTokens.colors.success[500];
      case 'Intermediate':
        return DesignTokens.colors.warning[500];
      case 'Advanced':
        return DesignTokens.colors.error[500];
      default:
        return DesignTokens.colors.text.secondary;
    }
  };

  const getAchievementColor = () => {
    if (!achievementProgress) return DesignTokens.colors.text.secondary;
    
    switch (achievementProgress.category) {
      case 'strength':
        return DesignTokens.colors.error[500];
      case 'endurance':
        return DesignTokens.colors.primary[500];
      case 'consistency':
        return DesignTokens.colors.success[500];
      default:
        return DesignTokens.colors.warning[500];
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.workoutName} numberOfLines={1}>
            {workout.name}
          </Text>
          <View style={styles.dateContainer}>
            <Calendar size={12} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.date}>{formatDate(workout.date)}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
            <Text style={styles.difficultyText}>{workout.difficulty}</Text>
          </View>
          
          <TouchableOpacity style={styles.moreButton} onPress={onRepeat}>
            <MoreHorizontal size={16} color={DesignTokens.colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Clock size={14} color={DesignTokens.colors.text.secondary} />
          <Text style={styles.statText}>{workout.duration}m</Text>
        </View>

        <View style={styles.statItem}>
          <Target size={14} color={DesignTokens.colors.text.secondary} />
          <Text style={styles.statText}>{workout.exercises} exercises</Text>
        </View>

        <View style={styles.statItem}>
          <Dumbbell size={14} color={DesignTokens.colors.text.secondary} />
          <Text style={styles.statText}>{formatVolume(workout.totalVolume)}</Text>
        </View>
      </View>

      {/* Muscle Groups */}
      <View style={styles.muscleGroups}>
        {workout.muscleGroups.slice(0, 3).map((muscle, index) => (
          <View key={index} style={styles.muscleTag}>
            <Text style={styles.muscleText}>{muscle}</Text>
          </View>
        ))}
        {workout.muscleGroups.length > 3 && (
          <View style={styles.muscleTag}>
            <Text style={styles.muscleText}>+{workout.muscleGroups.length - 3}</Text>
          </View>
        )}
      </View>

      {/* Achievement Progress */}
      {achievementProgress && achievementProgress.nearCompletion && (
        <View style={styles.achievementContainer}>
          <View style={styles.achievementHeader}>
            <Award size={14} color={getAchievementColor()} />
            <Text style={[styles.achievementText, { color: getAchievementColor() }]}>
              Achievement Progress
            </Text>
            <TrendingUp size={12} color={getAchievementColor()} />
          </View>
          
          <View style={styles.achievementProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${achievementProgress.progress}%`,
                    backgroundColor: getAchievementColor()
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: getAchievementColor() }]}>
              {achievementProgress.progress}%
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[3],
    ...DesignTokens.shadow.sm,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border.primary,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[3],
  },

  headerLeft: {
    flex: 1,
    marginRight: DesignTokens.spacing[3],
  },

  workoutName: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },

  date: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },

  difficultyBadge: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  difficultyText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  moreButton: {
    padding: DesignTokens.spacing[1],
  },

  stats: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[3],
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },

  statText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[2],
  },

  muscleTag: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  muscleText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  achievementContainer: {
    marginTop: DesignTokens.spacing[2],
    paddingTop: DesignTokens.spacing[2],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.border.secondary,
  },

  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[2],
  },

  achievementText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    flex: 1,
  },

  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },

  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  progressText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    minWidth: 30,
    textAlign: 'right',
  },
});
