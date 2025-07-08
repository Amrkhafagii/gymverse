import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Clock,
  Target,
  Dumbbell,
  MoreVertical,
  Share2,
  Trash2,
  Calendar,
  TrendingUp,
  Award,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { WorkoutSession } from '@/contexts/WorkoutSessionContext';

interface WorkoutHistoryCardProps {
  workout: WorkoutSession;
  onPress: () => void;
  onDelete: () => void;
  onShare: () => void;
  showActions?: boolean;
}

export function WorkoutHistoryCard({
  workout,
  onPress,
  onDelete,
  onShare,
  showActions = true,
}: WorkoutHistoryCardProps) {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
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

  const calculateTotalVolume = (): number => {
    return workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets
        .filter(set => set.is_completed)
        .reduce((setTotal, set) => {
          return setTotal + ((set.actual_weight_kg || 0) * (set.actual_reps || 0));
        }, 0);
    }, 0);
  };

  const getTotalSets = (): number => {
    return workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.filter(set => set.is_completed).length;
    }, 0);
  };

  const getTotalReps = (): number => {
    return workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets
        .filter(set => set.is_completed)
        .reduce((setTotal, set) => setTotal + (set.actual_reps || 0), 0);
    }, 0);
  };

  const getWorkoutIntensity = (): 'low' | 'medium' | 'high' => {
    const totalSets = getTotalSets();
    const duration = workout.total_duration_seconds / 60; // in minutes
    const volume = calculateTotalVolume();

    // Simple intensity calculation based on sets per minute and volume
    const setsPerMinute = totalSets / duration;
    
    if (setsPerMinute > 0.5 && volume > 5000) return 'high';
    if (setsPerMinute > 0.3 && volume > 2000) return 'medium';
    return 'low';
  };

  const getIntensityColor = (intensity: 'low' | 'medium' | 'high'): string => {
    switch (intensity) {
      case 'high': return DesignTokens.colors.error[500];
      case 'medium': return DesignTokens.colors.warning[500];
      case 'low': return DesignTokens.colors.success[500];
    }
  };

  const handleMorePress = () => {
    Alert.alert(
      'Workout Actions',
      `Actions for "${workout.workout_name}"`,
      [
        { text: 'Share', onPress: onShare },
        { text: 'Delete', onPress: onDelete, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const totalVolume = calculateTotalVolume();
  const totalSets = getTotalSets();
  const totalReps = getTotalReps();
  const intensity = getWorkoutIntensity();
  const hasPersonalRecords = workout.exercises.some(exercise => 
    exercise.sets.some(set => set.is_personal_record)
  );

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.workoutName}>{workout.workout_name}</Text>
              <View style={styles.dateContainer}>
                <Calendar size={14} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.date}>
                  {formatDate(workout.completed_at || workout.started_at)}
                </Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              {hasPersonalRecords && (
                <View style={styles.prBadge}>
                  <Award size={12} color="#F59E0B" />
                  <Text style={styles.prText}>PR</Text>
                </View>
              )}
              
              <View style={[styles.intensityBadge, { backgroundColor: `${getIntensityColor(intensity)}20` }]}>
                <Text style={[styles.intensityText, { color: getIntensityColor(intensity) }]}>
                  {intensity.toUpperCase()}
                </Text>
              </View>

              {showActions && (
                <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
                  <MoreVertical size={16} color={DesignTokens.colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Clock size={16} color="#4ECDC4" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{formatDuration(workout.total_duration_seconds)}</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Target size={16} color="#9E7FFF" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{totalSets}</Text>
                <Text style={styles.statLabel}>Sets</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Dumbbell size={16} color="#FF6B35" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>
                  {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : Math.round(totalVolume)}
                </Text>
                <Text style={styles.statLabel}>Volume (kg)</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <TrendingUp size={16} color="#10B981" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{totalReps}</Text>
                <Text style={styles.statLabel}>Reps</Text>
              </View>
            </View>
          </View>

          {/* Exercises Preview */}
          <View style={styles.exercisesPreview}>
            <Text style={styles.exercisesTitle}>
              {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
            </Text>
            <View style={styles.exercisesList}>
              {workout.exercises.slice(0, 3).map((exercise, index) => (
                <Text key={index} style={styles.exerciseName}>
                  {exercise.exercise_name}
                  {index < Math.min(workout.exercises.length, 3) - 1 ? ' • ' : ''}
                </Text>
              ))}
              {workout.exercises.length > 3 && (
                <Text style={styles.exerciseName}>
                  {' '}+{workout.exercises.length - 3} more
                </Text>
              )}
            </View>
          </View>

          {/* Progress Indicators */}
          {workout.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notes} numberOfLines={2}>
                "{workout.notes}"
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  gradient: {
    padding: DesignTokens.spacing[4],
  },
  content: {
    gap: DesignTokens.spacing[3],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  workoutName: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
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
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    backgroundColor: '#F59E0B20',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.full,
  },
  prText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#F59E0B',
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  intensityBadge: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.full,
  },
  intensityText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  moreButton: {
    padding: DesignTokens.spacing[1],
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: DesignTokens.spacing[2],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    flex: 1,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  exercisesPreview: {
    gap: DesignTokens.spacing[1],
  },
  exercisesTitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  exercisesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  exerciseName: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
  },
  notesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: DesignTokens.colors.primary[500],
  },
  notes: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
