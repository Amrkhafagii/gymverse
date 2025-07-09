import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  Clock,
  Flame,
  Target,
  MoreVertical,
  Share2,
  Trash2,
  Eye,
  Trophy,
  TrendingUp,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface WorkoutHistoryCardProps {
  workout: {
    id: string;
    name: string;
    created_at: string;
    duration_minutes: number;
    calories_burned?: number;
    exercises?: Array<{
      id: string;
      exercise_name: string;
      sets?: Array<{
        actual_weight_kg?: number;
        actual_reps?: number;
      }>;
    }>;
    notes?: string;
  };
  onPress?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

export function WorkoutHistoryCard({
  workout,
  onPress,
  onDelete,
  onShare,
}: WorkoutHistoryCardProps) {
  const [showActions, setShowActions] = useState(false);

  // Calculate workout stats
  const stats = React.useMemo(() => {
    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;
    let maxWeight = 0;

    workout.exercises?.forEach(exercise => {
      exercise.sets?.forEach(set => {
        totalSets++;
        totalReps += set.actual_reps || 0;
        const weight = set.actual_weight_kg || 0;
        const reps = set.actual_reps || 0;
        totalVolume += weight * reps;
        maxWeight = Math.max(maxWeight, weight);
      });
    });

    return {
      totalSets,
      totalReps,
      totalVolume,
      maxWeight,
      exerciseCount: workout.exercises?.length || 0,
    };
  }, [workout]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleMorePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowActions(!showActions);
  };

  const handleActionPress = async (action: 'view' | 'share' | 'delete') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowActions(false);

    switch (action) {
      case 'view':
        onPress?.();
        break;
      case 'share':
        onShare?.();
        break;
      case 'delete':
        Alert.alert(
          'Delete Workout',
          'Are you sure you want to delete this workout? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete', 
              style: 'destructive',
              onPress: onDelete
            },
          ]
        );
        break;
    }
  };

  const getWorkoutTypeColor = () => {
    const exerciseNames = workout.exercises?.map(e => e.exercise_name.toLowerCase()) || [];
    
    if (exerciseNames.some(name => name.includes('squat') || name.includes('deadlift') || name.includes('bench'))) {
      return '#FF6B35'; // Strength - Orange
    }
    if (exerciseNames.some(name => name.includes('run') || name.includes('bike') || name.includes('cardio'))) {
      return '#00D4AA'; // Cardio - Green
    }
    if (exerciseNames.some(name => name.includes('yoga') || name.includes('stretch') || name.includes('mobility'))) {
      return '#9E7FFF'; // Flexibility - Purple
    }
    
    return '#4ECDC4'; // General - Teal
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.card}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={onPress}
          activeOpacity={0.7}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.workoutTypeIndicator, { backgroundColor: getWorkoutTypeColor() }]} />
              <View>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutDate}>{formatDate(workout.created_at)}</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.moreButton}
              onPress={handleMorePress}
            >
              <MoreVertical size={20} color={DesignTokens.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Clock size={16} color="#4ECDC4" />
              <Text style={styles.statValue}>{formatDuration(workout.duration_minutes)}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>

            <View style={styles.statItem}>
              <Target size={16} color="#9E7FFF" />
              <Text style={styles.statValue}>{stats.exerciseCount}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>

            <View style={styles.statItem}>
              <TrendingUp size={16} color="#FF6B35" />
              <Text style={styles.statValue}>{stats.totalSets}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>

            {workout.calories_burned && (
              <View style={styles.statItem}>
                <Flame size={16} color="#E74C3C" />
                <Text style={styles.statValue}>{workout.calories_burned}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
            )}
          </View>

          {/* Volume and Weight Info */}
          {stats.totalVolume > 0 && (
            <View style={styles.volumeInfo}>
              <View style={styles.volumeItem}>
                <Trophy size={14} color="#FFD700" />
                <Text style={styles.volumeText}>
                  {(stats.totalVolume / 1000).toFixed(1)}k kg total volume
                </Text>
              </View>
              {stats.maxWeight > 0 && (
                <View style={styles.volumeItem}>
                  <Target size={14} color="#00D4AA" />
                  <Text style={styles.volumeText}>
                    {stats.maxWeight}kg max weight
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Notes Preview */}
          {workout.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText} numberOfLines={2}>
                {workout.notes}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Action Menu */}
        {showActions && (
          <View style={styles.actionsMenu}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleActionPress('view')}
            >
              <Eye size={18} color={DesignTokens.colors.text.primary} />
              <Text style={styles.actionText}>View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleActionPress('share')}
            >
              <Share2 size={18} color={DesignTokens.colors.text.primary} />
              <Text style={styles.actionText}>Share Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionItem, styles.destructiveAction]}
              onPress={() => handleActionPress('delete')}
            >
              <Trash2 size={18} color={DesignTokens.colors.error[500]} />
              <Text style={[styles.actionText, styles.destructiveText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignTokens.spacing[3],
  },
  card: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  cardContent: {
    padding: DesignTokens.spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[4],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  workoutTypeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: DesignTokens.spacing[3],
  },
  workoutName: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  workoutDate: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  moreButton: {
    padding: DesignTokens.spacing[2],
    marginTop: -DesignTokens.spacing[2],
    marginRight: -DesignTokens.spacing[2],
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing[4],
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[1],
  },
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  volumeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing[3],
  },
  volumeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  volumeText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  notesContainer: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    marginTop: DesignTokens.spacing[2],
  },
  notesText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  actionsMenu: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing[4],
    gap: DesignTokens.spacing[3],
  },
  actionText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  destructiveAction: {
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
  },
  destructiveText: {
    color: DesignTokens.colors.error[500],
  },
});
