import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Play, 
  Pause, 
  Square, 
  Plus,
  Timer,
  Target,
  Dumbbell,
  Trophy,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { WorkoutTimer } from '@/components/workout/WorkoutTimer';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { RestTimer } from '@/components/workout/RestTimer';
import { WorkoutSummary } from '@/components/workout/WorkoutSummary';

export default function WorkoutScreen() {
  const {
    currentWorkout,
    isActive,
    isPaused,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    endWorkout,
    addExercise,
    updateExercise,
    deleteExercise,
  } = useWorkoutSession();

  const { triggerAchievementCheck } = useAchievements();
  const [showSummary, setShowSummary] = useState(false);

  // Check achievements when workout ends
  useEffect(() => {
    if (currentWorkout?.completed_at) {
      // Trigger achievement check after workout completion
      setTimeout(() => {
        triggerAchievementCheck();
      }, 1000);
    }
  }, [currentWorkout?.completed_at]);

  const handleStartWorkout = () => {
    startWorkout('My Workout');
  };

  const handleEndWorkout = () => {
    Alert.alert(
      'End Workout',
      'Are you sure you want to end this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Workout', 
          style: 'destructive',
          onPress: () => {
            endWorkout();
            setShowSummary(true);
          }
        },
      ]
    );
  };

  const handleAddExercise = () => {
    const exerciseNames = [
      'Bench Press',
      'Squat',
      'Deadlift',
      'Overhead Press',
      'Barbell Row',
      'Pull-ups',
      'Dips',
      'Bicep Curls',
      'Tricep Extensions',
      'Lateral Raises',
    ];
    
    const randomExercise = exerciseNames[Math.floor(Math.random() * exerciseNames.length)];
    addExercise(randomExercise);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (showSummary && currentWorkout?.completed_at) {
    return (
      <WorkoutSummary
        workout={currentWorkout}
        onClose={() => setShowSummary(false)}
        onStartNew={handleStartWorkout}
      />
    );
  }

  if (!currentWorkout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <View style={styles.emptyStateIcon}>
            <Dumbbell size={64} color={DesignTokens.colors.primary[500]} />
          </View>
          <Text style={styles.emptyStateTitle}>Ready to Work Out?</Text>
          <Text style={styles.emptyStateText}>
            Start your workout session and track your progress
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
            <LinearGradient
              colors={[DesignTokens.colors.primary[500], DesignTokens.colors.primary[600]]}
              style={styles.startButtonGradient}
            >
              <Play size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Start Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutName}>{currentWorkout.workout_name}</Text>
            <Text style={styles.workoutDate}>
              {new Date(currentWorkout.started_at).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Timer size={16} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.statText}>
                {formatDuration(currentWorkout.total_duration_seconds)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Target size={16} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.statText}>
                {currentWorkout.exercises.reduce((total, ex) => 
                  total + ex.sets.filter(s => s.is_completed).length, 0
                )} sets
              </Text>
            </View>
          </View>
        </View>
        
        {/* Workout Timer */}
        <WorkoutTimer />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {!isActive ? (
          <TouchableOpacity style={styles.controlButton} onPress={handleStartWorkout}>
            <Play size={20} color={DesignTokens.colors.primary[500]} />
            <Text style={styles.controlButtonText}>Start</Text>
          </TouchableOpacity>
        ) : isPaused ? (
          <TouchableOpacity style={styles.controlButton} onPress={resumeWorkout}>
            <Play size={20} color={DesignTokens.colors.success[500]} />
            <Text style={styles.controlButtonText}>Resume</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.controlButton} onPress={pauseWorkout}>
            <Pause size={20} color={DesignTokens.colors.warning[500]} />
            <Text style={styles.controlButtonText}>Pause</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.controlButton} onPress={handleAddExercise}>
          <Plus size={20} color={DesignTokens.colors.primary[500]} />
          <Text style={styles.controlButtonText}>Add Exercise</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={handleEndWorkout}>
          <Square size={20} color={DesignTokens.colors.error[500]} />
          <Text style={styles.controlButtonText}>End</Text>
        </TouchableOpacity>
      </View>

      {/* Exercises */}
      <ScrollView style={styles.exercisesList} showsVerticalScrollIndicator={false}>
        {currentWorkout.exercises.length === 0 ? (
          <View style={styles.noExercises}>
            <Text style={styles.noExercisesText}>No exercises added yet</Text>
            <Text style={styles.noExercisesSubtext}>
              Tap "Add Exercise" to get started
            </Text>
          </View>
        ) : (
          currentWorkout.exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              exerciseIndex={index}
              onUpdate={updateExercise}
              onDelete={deleteExercise}
              isActive={isActive && !isPaused}
            />
          ))
        )}
      </ScrollView>

      {/* Rest Timer */}
      <RestTimer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background.primary,
  },
  header: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  workoutDate: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  headerStats: {
    flexDirection: 'row',
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
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[3],
    gap: DesignTokens.spacing[3],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.tertiary,
  },
  controlButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  exercisesList: {
    flex: 1,
    paddingHorizontal: DesignTokens.spacing[5],
  },
  noExercises: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[12],
  },
  noExercisesText: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginBottom: DesignTokens.spacing[2],
  },
  noExercisesSubtext: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[8],
  },
  emptyStateIcon: {
    marginBottom: DesignTokens.spacing[6],
  },
  emptyStateTitle: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[3],
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: DesignTokens.spacing[8],
  },
  startButton: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[8],
    paddingVertical: DesignTokens.spacing[4],
  },
  startButtonText: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
});
