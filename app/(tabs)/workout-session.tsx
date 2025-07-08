import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft,
  Pause,
  Play,
  Square,
  MoreVertical,
  Save,
  Share2,
  Camera,
  MessageSquare,
} from 'lucide-react-native';
import { useDeviceAuth } from '@/contexts/DeviceAuthContext';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';
import WorkoutSessionTimer from '@/components/workout/WorkoutSessionTimer';
import ExerciseSetTracker from '@/components/workout/ExerciseSetTracker';
import WorkoutSessionStats from '@/components/workout/WorkoutSessionStats';
import { RestTimerModal } from '@/components/workout/RestTimerModal';
import { SetTimerCard } from '@/components/workout/SetTimerCard';
import * as Haptics from 'expo-haptics';

export default function WorkoutSessionScreen() {
  const { user, isAuthenticated } = useDeviceAuth();
  const {
    currentSession,
    isLoading,
    pauseSession,
    resumeSession,
    completeSession,
    updateSet,
    updateExercise,
    startRestTimer,
    stopRestTimer,
    activeRestTimer,
  } = useWorkoutSession();
  
  const params = useLocalSearchParams();
  const workoutId = params.workoutId as string;
  
  // Session state
  const [totalDuration, setTotalDuration] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restTimerData, setRestTimerData] = useState<{
    exerciseId: string;
    setId: string;
    duration: number;
    exerciseName: string;
    setNumber: number;
  } | null>(null);
  
  // Timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (currentSession) {
      setTotalDuration(currentSession.total_duration_seconds);
      setIsActive(currentSession.is_active && !currentSession.is_paused);
    }
  }, [currentSession]);

  useEffect(() => {
    // Handle app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isActive && currentSession) {
      timerRef.current = setInterval(() => {
        setTotalDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, currentSession]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground - could sync session state
      console.log('App has come to the foreground');
    }
    appStateRef.current = nextAppState;
  };

  const handleToggleTimer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isActive) {
      await pauseSession();
      setIsActive(false);
    } else {
      await resumeSession();
      setIsActive(true);
    }
  };

  const handleResetTimer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      'Reset Timer',
      'Are you sure you want to reset the workout timer? This will not affect your completed sets.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setTotalDuration(0);
            setIsActive(false);
          },
        },
      ]
    );
  };

  const handleStartRest = (exerciseId: string, setId: string, duration: number) => {
    const exercise = currentSession?.exercises.find(e => e.id === exerciseId);
    const set = exercise?.sets.find(s => s.id === setId);
    
    if (exercise && set) {
      setRestTimerData({
        exerciseId,
        setId,
        duration,
        exerciseName: exercise.exercise_name,
        setNumber: set.set_number,
      });
      setShowRestTimer(true);
      startRestTimer(exerciseId, setId, duration);
    }
  };

  const handleRestComplete = () => {
    setShowRestTimer(false);
    setRestTimerData(null);
    stopRestTimer();
  };

  const handleUpdateSet = (exerciseId: string, setId: string, updates: any) => {
    updateSet(exerciseId, setId, updates);
  };

  const handleFinishWorkout = async () => {
    if (!currentSession) return;

    const completedSets = currentSession.exercises.reduce(
      (total, exercise) => total + exercise.sets.filter(set => set.is_completed).length,
      0
    );

    if (completedSets === 0) {
      Alert.alert(
        'No Sets Completed',
        'You haven\'t completed any sets yet. Are you sure you want to finish this workout?',
        [
          { text: 'Continue Workout', style: 'cancel' },
          { text: 'Finish Anyway', style: 'destructive', onPress: finishWorkout },
        ]
      );
    } else {
      Alert.alert(
        'Finish Workout',
        `You've completed ${completedSets} sets. Finish this workout and save your progress?`,
        [
          { text: 'Continue Workout', style: 'cancel' },
          { text: 'Finish & Save', onPress: finishWorkout },
        ]
      );
    }
  };

  const finishWorkout = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await completeSession();
      
      Alert.alert(
        'Workout Completed!',
        'Your workout has been saved successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    }
  };

  const handleBack = () => {
    if (isActive || totalDuration > 0) {
      Alert.alert(
        'Leave Workout',
        'Your workout is in progress. What would you like to do?',
        [
          { text: 'Continue Workout', style: 'cancel' },
          { text: 'Pause & Leave', onPress: () => router.back() },
          { text: 'Finish Workout', onPress: handleFinishWorkout },
        ]
      );
    } else {
      router.back();
    }
  };

  if (isLoading || !currentSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate stats
  const completedSets = currentSession.exercises.reduce(
    (total, exercise) => total + exercise.sets.filter(set => set.is_completed).length,
    0
  );
  const totalSets = currentSession.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  const completedExercises = currentSession.exercises.filter(exercise => 
    exercise.sets.every(set => set.is_completed)
  ).length;
  const personalBests = currentSession.exercises.reduce(
    (total, exercise) => total + exercise.sets.filter(set => 
      set.actual_weight_kg && set.target_weight_kg && set.actual_weight_kg > set.target_weight_kg
    ).length,
    0
  );
  const estimatedCalories = Math.round(totalDuration * 0.15); // Rough estimate
  const averageRestTime = 90; // Mock average

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{currentSession.workout_name}</Text>
            <Text style={styles.headerSubtitle}>
              {isActive ? 'Active' : 'Paused'} • {user?.platform} Device
            </Text>
          </View>
          
          <TouchableOpacity style={styles.headerButton}>
            <MoreVertical size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Session Timer */}
        <WorkoutSessionTimer
          isActive={isActive}
          onToggle={handleToggleTimer}
          onReset={handleResetTimer}
          totalDuration={totalDuration}
          restDuration={0}
          isResting={showRestTimer}
          onRestComplete={handleRestComplete}
        />

        {/* Session Stats */}
        <WorkoutSessionStats
          totalDuration={totalDuration}
          completedSets={completedSets}
          totalSets={totalSets}
          completedExercises={completedExercises}
          totalExercises={currentSession.exercises.length}
          personalBests={personalBests}
          estimatedCalories={estimatedCalories}
          averageRestTime={averageRestTime}
        />

        {/* Exercise Trackers */}
        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          
          {currentSession.exercises.map((exercise, exerciseIndex) => (
            <View key={exercise.id} style={styles.exerciseContainer}>
              <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
              <Text style={styles.exerciseInfo}>
                {exercise.muscle_groups.join(', ')} • {exercise.target_sets} sets
              </Text>
              
              {exercise.sets.map((set, setIndex) => (
                <SetTimerCard
                  key={set.id}
                  set={set}
                  exerciseName={exercise.exercise_name}
                  exerciseType={exercise.exercise_type}
                  onUpdateSet={(updates) => handleUpdateSet(exercise.id, set.id, updates)}
                  onStartRest={(duration) => handleStartRest(exercise.id, set.id, duration)}
                  restSeconds={exercise.rest_seconds}
                  previousBest={{
                    weight: exercise.target_weight_kg ? exercise.target_weight_kg - 5 : undefined,
                    reps: Math.max(...exercise.target_reps) - 2,
                  }}
                  isActive={exerciseIndex === currentExerciseIndex && !set.is_completed}
                />
              ))}
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.actionButtonGradient}>
              <Camera size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient colors={['#10b981', '#059669']} style={styles.actionButtonGradient}>
              <MessageSquare size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Add Note</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Finish Workout Button */}
        <TouchableOpacity style={styles.finishButton} onPress={handleFinishWorkout}>
          <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.finishButtonGradient}>
            <Square size={20} color="#fff" />
            <Text style={styles.finishButtonText}>Finish Workout</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Rest Timer Modal */}
      {restTimerData && (
        <RestTimerModal
          visible={showRestTimer}
          onClose={handleRestComplete}
          initialDuration={restTimerData.duration}
          exerciseName={restTimerData.exerciseName}
          setNumber={restTimerData.setNumber}
          onComplete={handleRestComplete}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Medium',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exercisesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  exerciseContainer: {
    marginBottom: 24,
  },
  exerciseName: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  exerciseInfo: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  finishButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  finishButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  finishButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 100,
  },
});
