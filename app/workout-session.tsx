import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Flame,
  CheckCircle,
  Circle,
  Smartphone,
  Save
} from 'lucide-react-native';
import { WORKOUT_TEMPLATES, TemplateExercise } from '@/lib/data/workoutTemplates';
import { useDeviceAuth } from '@/contexts/DeviceAuthContext';

interface ExerciseProgress {
  exercise: TemplateExercise;
  completed: boolean;
  currentSet: number;
  sets: Array<{
    reps?: number;
    weight?: number;
    duration?: number;
    completed: boolean;
  }>;
}

interface WorkoutSession {
  deviceId: string;
  templateId: string;
  workoutName: string;
  startTime: string;
  endTime?: string;
  totalDuration: number;
  exerciseProgress: ExerciseProgress[];
  estimatedCalories: number;
  completedExercises: number;
  totalExercises: number;
}

export default function WorkoutSessionScreen() {
  const { templateId, workoutName } = useLocalSearchParams<{ 
    templateId: string; 
    workoutName: string; 
  }>();
  const { user, isAuthenticated, updateLastActive } = useDeviceAuth();
  
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);

  const template = WORKOUT_TEMPLATES.find(t => t.id === templateId);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      Alert.alert(
        'Device Authentication Required',
        'Your device needs to be authenticated to track workout sessions.',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
      return;
    }

    if (template) {
      // Initialize exercise progress
      const initialProgress: ExerciseProgress[] = template.exercises.map(exercise => ({
        exercise,
        completed: false,
        currentSet: 0,
        sets: Array.from({ length: exercise.sets }, () => ({
          completed: false,
        })),
      }));
      setExerciseProgress(initialProgress);
    }
  }, [template, isAuthenticated, user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(time => time + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  // Update last active when session is active
  useEffect(() => {
    if (isActive && user) {
      const updateInterval = setInterval(async () => {
        await updateLastActive();
      }, 30000); // Update every 30 seconds during active workout

      return () => clearInterval(updateInterval);
    }
  }, [isActive, user, updateLastActive]);

  if (!template) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Workout not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Smartphone size={48} color="#666" />
          <Text style={styles.errorText}>Device Authentication Required</Text>
          <Text style={styles.errorSubtext}>
            Your device needs to be authenticated to track workout sessions and save progress.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = async () => {
    try {
      await updateLastActive();
      
      if (!isActive) {
        setIsActive(true);
        setIsPaused(false);
        setSessionStartTime(new Date().toISOString());
      } else {
        setIsPaused(!isPaused);
      }
    } catch (error) {
      console.error('Error updating session state:', error);
    }
  };

  const handleStop = () => {
    Alert.alert(
      'End Workout',
      'Are you sure you want to end this workout? Your progress will be saved to your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Workout', 
          style: 'destructive',
          onPress: async () => {
            await saveWorkoutSession();
            setIsActive(false);
            setIsPaused(false);
            router.back();
          }
        }
      ]
    );
  };

  const saveWorkoutSession = async () => {
    if (!user || !sessionStartTime) return;

    try {
      await updateLastActive();

      const completedExercises = exerciseProgress.filter(ep => ep.completed).length;
      const totalExercises = exerciseProgress.length;
      const estimatedCalories = Math.round((elapsedTime / 60) * (template.estimated_calories / template.duration_minutes));

      const session: WorkoutSession = {
        deviceId: user.deviceId,
        templateId: template.id,
        workoutName: workoutName || template.name,
        startTime: sessionStartTime,
        endTime: new Date().toISOString(),
        totalDuration: elapsedTime,
        exerciseProgress,
        estimatedCalories,
        completedExercises,
        totalExercises,
      };

      // TODO: Save to database with device association
      console.log('Saving workout session for device:', user.deviceId, session);
      
      // For now, save to local storage as backup
      const existingSessions = JSON.parse(await AsyncStorage.getItem('workout_sessions') || '[]');
      existingSessions.push(session);
      await AsyncStorage.setItem('workout_sessions', JSON.stringify(existingSessions));

    } catch (error) {
      console.error('Error saving workout session:', error);
    }
  };

  const handleCompleteSet = async (exerciseIndex: number, setIndex: number) => {
    try {
      await updateLastActive();
      
      const updatedProgress = [...exerciseProgress];
      updatedProgress[exerciseIndex].sets[setIndex].completed = true;
      
      // Check if all sets for this exercise are completed
      const allSetsCompleted = updatedProgress[exerciseIndex].sets.every(set => set.completed);
      if (allSetsCompleted) {
        updatedProgress[exerciseIndex].completed = true;
        
        // Move to next exercise if available
        if (exerciseIndex < exerciseProgress.length - 1) {
          setCurrentExerciseIndex(exerciseIndex + 1);
        }
      }
      
      setExerciseProgress(updatedProgress);
    } catch (error) {
      console.error('Error completing set:', error);
    }
  };

  const handleCompleteWorkout = async () => {
    const completedCount = exerciseProgress.filter(ep => ep.completed).length;
    const totalCount = exerciseProgress.length;
    
    Alert.alert(
      'Workout Complete!',
      `Great job! You completed ${completedCount}/${totalCount} exercises in ${formatTime(elapsedTime)} on your ${user.platform} device.`,
      [
        { 
          text: 'Finish', 
          onPress: async () => {
            await saveWorkoutSession();
            router.back();
          }
        }
      ]
    );
  };

  const completedExercises = exerciseProgress.filter(ep => ep.completed).length;
  const totalExercises = exerciseProgress.length;
  const progressPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  const currentExercise = exerciseProgress[currentExerciseIndex];
  const estimatedCalories = Math.round((elapsedTime / 60) * (template.estimated_calories / template.duration_minutes));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.workoutTitle} numberOfLines={1}>{workoutName}</Text>
          <Text style={styles.progressText}>
            {completedExercises}/{totalExercises} exercises
          </Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={handleStop}>
          <Square size={24} color="#E74C3C" />
        </TouchableOpacity>
      </View>

      {/* Device Status */}
      <View style={styles.deviceStatus}>
        <LinearGradient colors={['#1f2937', '#111827']} style={styles.deviceStatusGradient}>
          <Smartphone size={16} color="#FF6B35" />
          <Text style={styles.deviceStatusText}>
            Tracking on {user.platform} Device • Session Active: {isActive ? 'Yes' : 'No'}
          </Text>
          {isActive && (
            <View style={styles.activeIndicator}>
              <View style={styles.activeIndicatorDot} />
            </View>
          )}
        </LinearGradient>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#FF6B35', '#FF8C42']}
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>
        <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
      </View>

      {/* Timer and Stats */}
      <View style={styles.statsContainer}>
        <LinearGradient colors={['#1f2937', '#111827']} style={styles.statsGradient}>
          <View style={styles.statItem}>
            <Clock size={24} color="#FF6B35" />
            <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Flame size={24} color="#E74C3C" />
            <Text style={styles.statValue}>{estimatedCalories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <CheckCircle size={24} color="#2ECC71" />
            <Text style={styles.statValue}>{completedExercises}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlButtons}>
        <TouchableOpacity style={styles.controlButton} onPress={handleStartPause}>
          <LinearGradient
            colors={isActive && !isPaused ? ['#E74C3C', '#C0392B'] : ['#2ECC71', '#27AE60']}
            style={styles.controlButtonGradient}
          >
            {isActive && !isPaused ? (
              <Pause size={24} color="#fff" />
            ) : (
              <Play size={24} color="#fff" />
            )}
            <Text style={styles.controlButtonText}>
              {isActive && !isPaused ? 'Pause' : 'Start'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Current Exercise */}
      {currentExercise && (
        <View style={styles.currentExerciseContainer}>
          <Text style={styles.currentExerciseTitle}>Current Exercise</Text>
          <LinearGradient colors={['#1f2937', '#111827']} style={styles.currentExerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{currentExercise.exercise.exercise_name}</Text>
              <Text style={styles.exerciseNumber}>
                {currentExerciseIndex + 1}/{totalExercises}
              </Text>
            </View>
            
            <Text style={styles.exerciseInstructions} numberOfLines={3}>
              {currentExercise.exercise.instructions}
            </Text>

            <View style={styles.setsContainer}>
              <Text style={styles.setsTitle}>Sets ({currentExercise.exercise.sets})</Text>
              <View style={styles.setsList}>
                {currentExercise.sets.map((set, setIndex) => (
                  <TouchableOpacity
                    key={setIndex}
                    style={[
                      styles.setItem,
                      set.completed && styles.setItemCompleted
                    ]}
                    onPress={() => handleCompleteSet(currentExerciseIndex, setIndex)}
                  >
                    {set.completed ? (
                      <CheckCircle size={20} color="#2ECC71" />
                    ) : (
                      <Circle size={20} color="#666" />
                    )}
                    <Text style={[
                      styles.setNumber,
                      set.completed && styles.setNumberCompleted
                    ]}>
                      Set {setIndex + 1}
                    </Text>
                    <View style={styles.setDetails}>
                      {currentExercise.exercise.reps && currentExercise.exercise.reps.length > 0 && (
                        <Text style={styles.setDetailText}>
                          {currentExercise.exercise.reps[0]}-{currentExercise.exercise.reps[currentExercise.exercise.reps.length - 1]} reps
                        </Text>
                      )}
                      {currentExercise.exercise.duration_seconds && (
                        <Text style={styles.setDetailText}>
                          {currentExercise.exercise.duration_seconds}s
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Exercise List */}
      <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
        <Text style={styles.exerciseListTitle}>All Exercises</Text>
        {exerciseProgress.map((exerciseProgress, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.exerciseListItem,
              index === currentExerciseIndex && styles.exerciseListItemActive,
              exerciseProgress.completed && styles.exerciseListItemCompleted
            ]}
            onPress={() => setCurrentExerciseIndex(index)}
          >
            <View style={styles.exerciseListIcon}>
              {exerciseProgress.completed ? (
                <CheckCircle size={20} color="#2ECC71" />
              ) : index === currentExerciseIndex ? (
                <Play size={20} color="#FF6B35" />
              ) : (
                <Circle size={20} color="#666" />
              )}
            </View>
            <View style={styles.exerciseListContent}>
              <Text style={[
                styles.exerciseListName,
                exerciseProgress.completed && styles.exerciseListNameCompleted
              ]}>
                {exerciseProgress.exercise.exercise_name}
              </Text>
              <Text style={styles.exerciseListDetails}>
                {exerciseProgress.exercise.sets} sets • {exerciseProgress.exercise.rest_seconds}s rest
              </Text>
            </View>
            <Text style={styles.exerciseListProgress}>
              {exerciseProgress.sets.filter(s => s.completed).length}/{exerciseProgress.sets.length}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Complete Workout Button */}
      {completedExercises === totalExercises && totalExercises > 0 && (
        <View style={styles.completeContainer}>
          <TouchableOpacity style={styles.completeButton} onPress={handleCompleteWorkout}>
            <LinearGradient colors={['#2ECC71', '#27AE60']} style={styles.completeButtonGradient}>
              <Save size={24} color="#fff" />
              <Text style={styles.completeButtonText}>Complete & Save Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  workoutTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  progressText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  deviceStatus: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  deviceStatusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  deviceStatusText: {
    fontSize: 12,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  activeIndicator: {
    marginLeft: 8,
  },
  activeIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ECC71',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
    minWidth: 40,
    textAlign: 'right',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsGradient: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
    marginHorizontal: 20,
  },
  statValue: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  controlButtons: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  controlButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  controlButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  controlButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  currentExerciseContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  currentExerciseTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  currentExerciseCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  exerciseNumber: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
  },
  exerciseInstructions: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  setsContainer: {
    marginTop: 8,
  },
  setsTitle: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  setsList: {
    gap: 8,
  },
  setItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  setItemCompleted: {
    backgroundColor: '#2ECC7120',
    borderColor: '#2ECC71',
  },
  setNumber: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
    flex: 1,
  },
  setNumberCompleted: {
    color: '#2ECC71',
  },
  setDetails: {
    alignItems: 'flex-end',
  },
  setDetailText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  exerciseList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseListTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  exerciseListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  exerciseListItemActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FF6B3510',
  },
  exerciseListItemCompleted: {
    backgroundColor: '#2ECC7110',
    borderColor: '#2ECC71',
  },
  exerciseListIcon: {
    marginRight: 12,
  },
  exerciseListContent: {
    flex: 1,
  },
  exerciseListName: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  exerciseListNameCompleted: {
    color: '#2ECC71',
  },
  exerciseListDetails: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  exerciseListProgress: {
    fontSize: 12,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
  },
  completeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  completeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  completeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
});
