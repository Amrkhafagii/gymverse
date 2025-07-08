/**
 * Production-ready RecentWorkoutCard component with context integration
 * Integrates with workout history and offline systems
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Clock, Repeat, TrendingUp } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';
import { Button } from '@/components/ui/Button';

export interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number;
  exercises: number;
  totalVolume?: number;
  muscleGroups: string[];
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface RecentWorkoutCardProps {
  workout: Workout;
  onPress: () => void;
  onRepeat: () => void;
  style?: ViewStyle;
}

export const RecentWorkoutCard: React.FC<RecentWorkoutCardProps> = ({
  workout,
  onPress,
  onRepeat,
  style,
}) => {
  const { isOnline, syncStatus } = useOfflineSync();
  const { getWorkoutStats } = useWorkoutHistory();

  const workoutStats = getWorkoutStats(workout.id);
  const formattedDate = new Date(workout.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !isOnline && styles.offline,
        syncStatus && styles[`sync_${syncStatus}`],
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.workoutName} numberOfLines={1}>
            {workout.name}
          </Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        
        {workout.difficulty && (
          <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor()}20` }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
              {workout.difficulty}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Clock size={16} color={DesignTokens.colors.text.secondary} />
          <Text style={styles.statText}>{formatDuration(workout.duration)}</Text>
        </View>
        
        <View style={styles.statItem}>
          <TrendingUp size={16} color={DesignTokens.colors.text.secondary} />
          <Text style={styles.statText}>{workout.exercises} exercises</Text>
        </View>
        
        {workout.totalVolume && (
          <View style={styles.statItem}>
            <Text style={styles.volumeText}>
              {Math.round(workout.totalVolume).toLocaleString()} lbs
            </Text>
          </View>
        )}
      </View>

      <View style={styles.muscleGroups}>
        {workout.muscleGroups.slice(0, 3).map((group, index) => (
          <View key={index} style={styles.muscleGroupTag}>
            <Text style={styles.muscleGroupText}>{group}</Text>
          </View>
        ))}
        {workout.muscleGroups.length > 3 && (
          <Text style={styles.moreText}>+{workout.muscleGroups.length - 3}</Text>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          title="Repeat"
          variant="secondary"
          size="small"
          onPress={onRepeat}
          icon={<Repeat size={16} color={DesignTokens.colors.primary[500]} />}
          disabled={!isOnline}
          style={styles.repeatButton}
        />
        
        {workoutStats && (
          <View style={styles.statsPreview}>
            <Text style={styles.statsText}>
              PR: {workoutStats.personalRecords || 0}
            </Text>
          </View>
        )}
      </View>

      {syncStatus && (
        <View style={[styles.syncIndicator, styles[`syncIndicator_${syncStatus}`]]} />
      )}

      {!isOnline && (
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineText}>Cached</Text>
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
    position: 'relative',
  },

  // States
  offline: {
    opacity: 0.8,
    backgroundColor: DesignTokens.colors.surface.secondary,
  },

  // Sync status
  sync_synced: {
    borderLeftWidth: 3,
    borderLeftColor: DesignTokens.colors.success[500],
  },
  sync_pending: {
    borderLeftWidth: 3,
    borderLeftColor: DesignTokens.colors.warning[500],
  },
  sync_failed: {
    borderLeftWidth: 3,
    borderLeftColor: DesignTokens.colors.error[500],
  },
  sync_offline: {
    borderLeftWidth: 3,
    borderLeftColor: DesignTokens.colors.text.secondary,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[3],
  },

  titleContainer: {
    flex: 1,
    marginRight: DesignTokens.spacing[2],
  },

  workoutName: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },

  date: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },

  difficultyBadge: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  difficultyText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
    gap: DesignTokens.spacing[4],
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

  volumeText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  muscleGroups: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
    gap: DesignTokens.spacing[2],
  },

  muscleGroupTag: {
    backgroundColor: DesignTokens.colors.surface.secondary,
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
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  repeatButton: {
    flex: 0,
    minWidth: 100,
  },

  statsPreview: {
    alignItems: 'flex-end',
  },

  statsText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },

  syncIndicator: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  syncIndicator_synced: {
    backgroundColor: DesignTokens.colors.success[500],
  },
  syncIndicator_pending: {
    backgroundColor: DesignTokens.colors.warning[500],
  },
  syncIndicator_failed: {
    backgroundColor: DesignTokens.colors.error[500],
  },
  syncIndicator_offline: {
    backgroundColor: DesignTokens.colors.text.secondary,
  },

  offlineBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: DesignTokens.colors.text.secondary,
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  offlineText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
