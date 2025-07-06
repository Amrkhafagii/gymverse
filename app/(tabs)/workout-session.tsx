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
import WorkoutSessionTimer from '@/components/workout/WorkoutSessionTimer';
import ExerciseSetTracker from '@/components/workout/ExerciseSetTracker';
import WorkoutSessionStats from '@/components/workout/WorkoutSessionStats';
import * as Haptics from 'expo-haptics';

interface Exercise {
  id: string;
  name: string;
  description: string;
  exercise_type: 'strength' | 'cardio' | 'flexibility' | 'plyometric';
  muscle_groups: string[];
  equipment: string[];
}

interface ExerciseSet {
  set_number: number;
  target_reps: number;
  actual_reps?: number;
  target_weight_kg?: number;
  actual_weight_kg?: number;
  target_duration_seconds?: number;
  actual_duration_seconds?: number;
  is_completed: boolean;
  is_warmup?: boolean;
  notes?: string;
}

interface WorkoutExercise {
  exercise: Exercise;
  order_index: number;
  target_sets: number;
  target_reps: number[];
  target_weight_kg?: number;
  target_duration_seconds?: number;
  rest_seconds: number;
  notes?: string;
  sets: ExerciseSet[];
}

interface WorkoutSession {
  id: string;
  workout_name: string;
  started_at: string;
  is_active: boolean;
  is_paused: boolean;
  total_duration_seconds: number;
  exercises: WorkoutExercise[];
}

export default function WorkoutSessionScreen() {
  const { user, isAuthenticated } = useDeviceAuth();
  const params = useLocalSearchParams();
  const workoutId = params.workoutId as string;
  
  // Session state
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restDuration, setRestDuration] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  
  // Timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Mock workout data - in real app, this would come from API/database
  const mockWorkout: WorkoutSession = {
    id: workoutId || '1',
    workout_name: 'Upper Body Strength',
    started_at: new Date().toISOString(),
    is_active: false,
    is_paused: false,
    total_duration_seconds: 0,
    exercises: [
      {
        exercise: {
          id: '1',
          name: 'Barbell Bench Press',
          description: 'Classic compound chest exercise',
          exercise_type: 'strength',
          muscle_groups: ['chest', 'shoulders', 'triceps'],
          equipment: ['barbell', 'bench'],
        },
        order_index: 0,
        target_sets: 4,
        target_reps: [8, 8, 6, 6],
        target_weight_kg: 80,
        rest_seconds: 120,
        sets: [
          { set_number: 1, target_reps: 8, is_completed: false },
          { set_number: 2, target_reps: 8, is_completed: false },
          { set_number: 3, target_reps: 6, is_completed: false },
          { set_number: 4, target_reps: 6, is_completed: false },
        ],
      },
      {
        exercise: {
          id: '2',
          name: 'Pull-ups',
          description: 'Bodyweight back exercise',
          exercise_type: 'strength',
          muscle_groups: ['back', 'biceps'],
          equipment: [],
        },
        order_index: 1,
        target_sets: 3,
        target_reps: [10, 8, 6],
        rest_seconds: 90,
        sets: [
          { set_number: 1, target_reps: 10, is_completed: false },
          { set_number: 2, target_reps: 8, is_completed: false },
          { set_number: 3, target_reps: 6, is_completed: false },
        ],
      },
      {
        exercise: {
          id: '3',
          name: 'Overhead Press',
          description: 'Shoulder strength exercise',
          exercise_type: 'strength',
          muscle_groups: ['shoulders', 'triceps', 'core'],
          equipment: ['barbell'],
        },
        order_index: 2,
        target_sets: 3,
        target_reps: [8, 8, 8],
        target_weight_kg: 60,
        rest_seconds: 90,
        sets: [
          { set_number: 1, target_reps: 8, is_completed: false },
          { set_number: 2, target_reps: 8, is_completed: false },
          { set_number: 3, target_reps: 8, is_completed: false },
        ],
      },
    ],
  };

  useEffect(() => {
    loadWorkoutSession();
    
    // Handle app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
      if (timerRef.current) clearInterval(timerRef.current);
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isActive && !isResting) {
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
  }, [isActive, isResting]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground - could sync session state
      console.log('App has come to the foreground');
    }
    appStateRef.current = nextAppState;
  };

  const loadWorkoutSession = async () => {
    try {
      setLoading(true);
      // In real app, load from API/database
      setSession(mockWorkout);
      setTotalDuration(mockWorkout.total_duration_seconds);
      setIsActive(mockWorkout.is_active && !mockWorkout.is_paused);
    } catch (error) {
      console.error('Error loading workout session:', error);
      Alert.alert('Error', 'Failed to load workout session');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTimer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(!isActive);
    
    if (session) {
      const updatedSession = {
        ...session,
        is_active: !isActive,
        is_paused: isActive,
      };
      setSession(updatedSession);
      // TODO: Save to database
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
            setIsResting(false);
          },
        },
      ]
    );
  };

  const handleStartRest = (restSeconds: number) => {
    setIsResting(true);
    setRestDuration(restSeconds);
    setIsActive(false); // Pause main timer during rest
  };

  const handleRestComplete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsResting(false);
    setRestDuration(0);
    // Optionally auto-resume main timer
    // setIsActive(true);
  };

  const handleUpdateSet = (exerciseIndex: number, setIndex: number, updates: Partial<ExerciseSet>) => {
    if (!session) return;

    const updatedExercises = [...session.exercises];
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      ...updates,
    };

    const updatedSession = {
      ...session,
      exercises: updatedExercises,
    };

    setSession(updatedSession);
    // TODO: Save to database
  };

  const handleFinishWorkout = async () => {
    if (!session) return;

    const completedSets = session.exercises.reduce(
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
      
      // TODO: Save workout session to database
      console.log('Saving workout session:', session);
      
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

  if (loading || !session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate stats
  const completedSets = session.exercises.reduce(
    (total, exercise) => total + exercise.sets.filter(set => set.is_completed).length,
    0
  );
  const totalSets = session.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  const completedExercises = session.exercises.filter(exercise => 
    exercise.sets.every(set => set.is_completed)
  ).length;
  const personalBests = session.exercises.reduce(
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
            <Text style={styles.headerTitle}>{session.workout_name}</Text>
            <Text style={styles.headerSubtitle}>
              {isActive ? 'Active' : isResting ? 'Resting' : 'Paused'} • {user?.platform} Device
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
          restDuration={restDuration}
          isResting={isResting}
          onRestComplete={handleRestComplete}
        />

        {/* Session Stats */}
        <WorkoutSessionStats
          totalDuration={totalDuration}
          completedSets={completedSets}
          totalSets={totalSets}
          completedExercises={completedExercises}
          totalExercises={session.exercises.length}
          personalBests={personalBests}
          estimatedCalories={estimatedCalories}
          averageRestTime={averageRestTime}
        />

        {/* Exercise Trackers */}
        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          
          {session.exercises.map((exercise, index) => (
            <ExerciseSetTracker
              key={exercise.exercise.id}
              sets={exercise.sets}
              exerciseName={exercise.exercise.name}
              exerciseType={exercise.exercise.exercise_type}
              onUpdateSet={(setIndex, updates) => handleUpdateSet(index, setIndex, updates)}
              onStartRest={handleStartRest}
              restSeconds={exercise.rest_seconds}
              previousBest={{
                weight: exercise.target_weight_kg ? exercise.target_weight_kg - 5 : undefined,
                reps: Math.max(...exercise.target_reps) - 2,
              }}
            />
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
