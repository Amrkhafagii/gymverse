import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Play, 
  Clock, 
  Target, 
  Repeat,
  Timer,
  Info,
  ChevronRight,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface ExercisePreviewCardProps {
  exercise: {
    id: number;
    name: string;
    description?: string;
    demo_image_url?: string;
    muscle_groups: string[];
    equipment?: string[];
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  };
  workoutExercise: {
    order_index: number;
    target_sets: number;
    target_reps: number[] | null;
    target_duration_seconds: number | null;
    rest_seconds: number;
  };
  onPress?: () => void;
  onPreview?: () => void;
}

export const ExercisePreviewCard: React.FC<ExercisePreviewCardProps> = ({
  exercise,
  workoutExercise,
  onPress,
  onPreview,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#10B981';
      case 'intermediate':
        return '#F59E0B';
      case 'advanced':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatReps = (reps: number[] | null) => {
    if (!reps || reps.length === 0) return 'N/A';
    if (reps.length === 1) return `${reps[0]} reps`;
    return `${Math.min(...reps)}-${Math.max(...reps)} reps`;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.gradient}
      >
        {/* Exercise Number Badge */}
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{workoutExercise.order_index + 1}</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Exercise Image */}
          {exercise.demo_image_url ? (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: exercise.demo_image_url }} 
                style={styles.exerciseImage}
              />
              <TouchableOpacity 
                style={styles.previewButton}
                onPress={onPreview}
              >
                <Play size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(exercise.difficulty_level) }
              ]}>
                <Text style={styles.difficultyText}>
                  {exercise.difficulty_level.toUpperCase()}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.placeholderImage}>
              <Target size={32} color={DesignTokens.colors.text.tertiary} />
            </View>
          )}

          {/* Exercise Info */}
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName} numberOfLines={2}>
              {exercise.name}
            </Text>
            
            {exercise.description && (
              <Text style={styles.exerciseDescription} numberOfLines={2}>
                {exercise.description}
              </Text>
            )}

            {/* Muscle Groups */}
            <View style={styles.muscleGroups}>
              {exercise.muscle_groups.slice(0, 3).map((muscle, index) => (
                <View key={index} style={styles.muscleTag}>
                  <Text style={styles.muscleTagText}>{muscle}</Text>
                </View>
              ))}
              {exercise.muscle_groups.length > 3 && (
                <View style={styles.muscleTag}>
                  <Text style={styles.muscleTagText}>
                    +{exercise.muscle_groups.length - 3}
                  </Text>
                </View>
              )}
            </View>

            {/* Equipment */}
            {exercise.equipment && exercise.equipment.length > 0 && (
              <View style={styles.equipmentContainer}>
                <Text style={styles.equipmentLabel}>Equipment:</Text>
                <Text style={styles.equipmentText}>
                  {exercise.equipment.slice(0, 2).join(', ')}
                  {exercise.equipment.length > 2 && ` +${exercise.equipment.length - 2}`}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Workout Parameters */}
        <View style={styles.parameters}>
          <View style={styles.parameterRow}>
            <View style={styles.parameter}>
              <Repeat size={16} color={DesignTokens.colors.primary[500]} />
              <Text style={styles.parameterLabel}>Sets</Text>
              <Text style={styles.parameterValue}>{workoutExercise.target_sets}</Text>
            </View>

            {workoutExercise.target_reps && (
              <View style={styles.parameter}>
                <Target size={16} color={DesignTokens.colors.success[500]} />
                <Text style={styles.parameterLabel}>Reps</Text>
                <Text style={styles.parameterValue}>
                  {formatReps(workoutExercise.target_reps)}
                </Text>
              </View>
            )}

            {workoutExercise.target_duration_seconds && (
              <View style={styles.parameter}>
                <Timer size={16} color={DesignTokens.colors.warning[500]} />
                <Text style={styles.parameterLabel}>Duration</Text>
                <Text style={styles.parameterValue}>
                  {formatDuration(workoutExercise.target_duration_seconds)}
                </Text>
              </View>
            )}

            <View style={styles.parameter}>
              <Clock size={16} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.parameterLabel}>Rest</Text>
              <Text style={styles.parameterValue}>
                {formatDuration(workoutExercise.rest_seconds) || '0s'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => {/* Navigate to exercise detail */}}
          >
            <Info size={16} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.infoButtonText}>Details</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={onPress}>
            <Text style={styles.nextButtonText}>View Exercise</Text>
            <ChevronRight size={16} color={DesignTokens.colors.primary[500]} />
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressIndicator} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    ...DesignTokens.shadow.lg,
  },
  gradient: {
    position: 'relative',
  },
  numberBadge: {
    position: 'absolute',
    top: DesignTokens.spacing[4],
    left: DesignTokens.spacing[4],
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    ...DesignTokens.shadow.base,
  },
  numberText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  content: {
    flexDirection: 'row',
    padding: DesignTokens.spacing[4],
    paddingTop: DesignTokens.spacing[6],
  },
  imageContainer: {
    position: 'relative',
    marginRight: DesignTokens.spacing[4],
  },
  exerciseImage: {
    width: 100,
    height: 100,
    borderRadius: DesignTokens.borderRadius.lg,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: DesignTokens.borderRadius.lg,
    backgroundColor: DesignTokens.colors.neutral[800],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing[4],
  },
  previewButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyBadge: {
    position: 'absolute',
    bottom: DesignTokens.spacing[1],
    right: DesignTokens.spacing[1],
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  difficultyText: {
    fontSize: 8,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[2],
    lineHeight: 22,
  },
  exerciseDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
    marginBottom: DesignTokens.spacing[3],
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: DesignTokens.spacing[2],
  },
  muscleTag: {
    backgroundColor: `${DesignTokens.colors.primary[500]}20`,
    borderRadius: DesignTokens.borderRadius.sm,
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    marginRight: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[1],
  },
  muscleTagText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  equipmentLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    marginRight: DesignTokens.spacing[1],
  },
  equipmentText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textTransform: 'capitalize',
  },
  parameters: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingBottom: DesignTokens.spacing[4],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
  },
  parameterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: DesignTokens.spacing[3],
  },
  parameter: {
    alignItems: 'center',
    flex: 1,
  },
  parameterLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    marginTop: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[1],
  },
  parameterValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[4],
    paddingBottom: DesignTokens.spacing[4],
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: DesignTokens.borderRadius.md,
  },
  infoButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    backgroundColor: `${DesignTokens.colors.primary[500]}20`,
    borderRadius: DesignTokens.borderRadius.md,
  },
  nextButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginRight: DesignTokens.spacing[1],
  },
  progressIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: DesignTokens.colors.primary[500],
  },
});
