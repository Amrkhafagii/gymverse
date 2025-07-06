import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Save, Plus, X, Clock, Target, Smartphone, User } from 'lucide-react-native';
import { useDeviceAuth } from '@/contexts/DeviceAuthContext';
import { supabase, Exercise } from '@/lib/supabase';
import ExerciseSelector from '@/components/workout/ExerciseSelector';
import WorkoutExerciseCard from '@/components/workout/WorkoutExerciseCard';
import SegmentedControl from '@/components/ui/SegmentedControl';

interface WorkoutExercise {
  exercise: Exercise;
  order_index: number;
  target_sets: number;
  target_reps: number[];
  target_weight_kg?: number;
  target_duration_seconds?: number;
  rest_seconds: number;
  notes?: string;
}

export default function CreateWorkoutScreen() {
  const { user, isAuthenticated, updateLastActive } = useDeviceAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  // Workout form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [workoutType, setWorkoutType] = useState<'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed'>('strength');
  const [isTemplate, setIsTemplate] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  const validateForm = () => {
    if (!name.trim()) {
      setError('Workout name is required');
      return false;
    }
    if (name.trim().length > 100) {
      setError('Workout name must be less than 100 characters');
      return false;
    }
    if (description.length > 500) {
      setError('Description must be less than 500 characters');
      return false;
    }
    if (exercises.length === 0) {
      setError('At least one exercise is required');
      return false;
    }
    if (estimatedDuration && (isNaN(Number(estimatedDuration)) || Number(estimatedDuration) <= 0)) {
      setError('Estimated duration must be a valid positive number');
      return false;
    }
    return true;
  };

  const handleAddExercise = (exercise: Exercise) => {
    const newWorkoutExercise: WorkoutExercise = {
      exercise,
      order_index: exercises.length,
      target_sets: 3,
      target_reps: [8, 10, 12],
      rest_seconds: 60,
    };

    // Set defaults based on exercise type
    if (exercise.exercise_type === 'cardio') {
      newWorkoutExercise.target_duration_seconds = 300; // 5 minutes
      newWorkoutExercise.target_reps = [];
    }

    setExercises([...exercises, newWorkoutExercise]);
    setShowExerciseSelector(false);
    setError(null); // Clear any existing errors
  };

  const handleUpdateExercise = (index: number, updates: Partial<WorkoutExercise>) => {
    const updatedExercises = [...exercises];
    updatedExercises[index] = { ...updatedExercises[index], ...updates };
    setExercises(updatedExercises);
  };

  const handleRemoveExercise = (index: number) => {
    const updatedExercises = exercises.filter((_, i) => i !== index);
    // Update order indices
    const reorderedExercises = updatedExercises.map((ex, i) => ({
      ...ex,
      order_index: i,
    }));
    setExercises(reorderedExercises);
  };

  const handleMoveExercise = (fromIndex: number, toIndex: number) => {
    const updatedExercises = [...exercises];
    const [movedExercise] = updatedExercises.splice(fromIndex, 1);
    updatedExercises.splice(toIndex, 0, movedExercise);
    
    // Update order indices
    const reorderedExercises = updatedExercises.map((ex, i) => ({
      ...ex,
      order_index: i,
    }));
    setExercises(reorderedExercises);
  };

  const calculateEstimatedDuration = () => {
    let totalMinutes = 0;
    
    exercises.forEach(exercise => {
      const sets = exercise.target_sets;
      const restTime = (exercise.rest_seconds * (sets - 1)) / 60; // Rest between sets
      
      if (exercise.target_duration_seconds) {
        // Cardio exercise
        totalMinutes += (exercise.target_duration_seconds * sets) / 60;
      } else {
        // Strength exercise - estimate 30 seconds per set
        totalMinutes += (sets * 0.5);
      }
      
      totalMinutes += restTime;
    });
    
    return Math.round(totalMinutes);
  };

  const handleSave = async () => {
    if (!isAuthenticated || !user) {
      setError('Device authentication required to create workouts');
      return;
    }

    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Update last active timestamp
      await updateLastActive();

      // Create the workout with device association
      const workoutData = {
        device_id: user.deviceId, // Associate with device instead of user
        creator_device_platform: user.platform,
        creator_device_name: user.deviceName,
        name: name.trim(),
        description: description.trim() || null,
        estimated_duration_minutes: estimatedDuration ? Number(estimatedDuration) : calculateEstimatedDuration(),
        difficulty_level: difficultyLevel,
        workout_type: workoutType,
        is_template: isTemplate,
        is_public: isPublic,
        created_at: new Date().toISOString(),
      };

      // TODO: Save to database with device association
      console.log('Creating workout for device:', user.deviceId, workoutData);

      // Create workout exercises with device tracking
      const workoutExercises = exercises.map(ex => ({
        device_id: user.deviceId,
        exercise_id: ex.exercise.id,
        order_index: ex.order_index,
        target_sets: ex.target_sets,
        target_reps: ex.target_reps.length > 0 ? ex.target_reps : null,
        target_weight_kg: ex.target_weight_kg || null,
        target_duration_seconds: ex.target_duration_seconds || null,
        rest_seconds: ex.rest_seconds,
        notes: ex.notes || null,
        created_at: new Date().toISOString(),
      }));

      console.log('Creating workout exercises for device:', user.deviceId, workoutExercises);

      Alert.alert(
        'Success',
        `Your workout has been created successfully and saved to your ${user.platform} device!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      console.error('Error creating workout:', err);
      setError(err.message || 'Failed to create workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (name.trim() || description.trim() || exercises.length > 0) {
      Alert.alert(
        'Discard Workout',
        'Are you sure you want to discard this workout?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const hasUnsavedChanges = name.trim() || description.trim() || exercises.length > 0;

  // Show authentication requirement if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Workout</Text>
            <View style={styles.headerButton} />
          </View>
        </LinearGradient>

        <View style={styles.authRequiredContainer}>
          <Smartphone size={64} color="#666" />
          <Text style={styles.authRequiredTitle}>Device Authentication Required</Text>
          <Text style={styles.authRequiredText}>
            Your device needs to be authenticated to create and save workouts. This ensures your workouts are properly tracked and saved to your device.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Create Workout</Text>
            <View style={styles.deviceInfo}>
              <Smartphone size={12} color="#999" />
              <Text style={styles.deviceInfoText}>{user.platform} Device</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.headerButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Save size={24} color={loading ? "#666" : "#FF6B35"} />
          </TouchableOpacity>
        </View>
        {hasUnsavedChanges && (
          <Text style={styles.unsavedIndicator}>You have unsaved changes</Text>
        )}
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <X size={20} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        )}

        {/* Device Status */}
        <View style={styles.deviceStatus}>
          <LinearGradient colors={['#1f2937', '#111827']} style={styles.deviceStatusGradient}>
            <User size={16} color="#FF6B35" />
            <Text style={styles.deviceStatusText}>
              Creating workout on {user.platform} • Device: {user.deviceName}
            </Text>
          </LinearGradient>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Workout Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter workout name"
              placeholderTextColor="#999"
              autoCapitalize="words"
              maxLength={100}
            />
            <Text style={styles.characterCount}>{name.length}/100</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your workout..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.characterCount}>{description.length}/500</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <View style={styles.labelWithIcon}>
                <Clock size={16} color="#4A90E2" />
                <Text style={styles.inputLabel}>Duration (min)</Text>
              </View>
              <TextInput
                style={styles.input}
                value={estimatedDuration}
                onChangeText={setEstimatedDuration}
                placeholder={calculateEstimatedDuration().toString()}
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <View style={styles.labelWithIcon}>
                <Target size={16} color="#27AE60" />
                <Text style={styles.inputLabel}>Difficulty</Text>
              </View>
              <SegmentedControl
                options={['beginner', 'intermediate', 'advanced'] as const}
                selectedValue={difficultyLevel}
                onValueChange={setDifficultyLevel}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Workout Type</Text>
            <SegmentedControl
              options={['strength', 'cardio', 'hiit', 'flexibility', 'mixed'] as const}
              selectedValue={workoutType}
              onValueChange={setWorkoutType}
              labels={{
                strength: 'Strength',
                cardio: 'Cardio',
                hiit: 'HIIT',
                flexibility: 'Flexibility',
                mixed: 'Mixed'
              }}
            />
          </View>
        </View>

        {/* Exercises Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercises ({exercises.length})</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowExerciseSelector(true)}
            >
              <Plus size={20} color="#FF6B35" />
              <Text style={styles.addButtonText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {exercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No exercises added yet</Text>
              <Text style={styles.emptyText}>
                Tap &ldquo;Add Exercise&rdquo; to start building your workout
              </Text>
              <Text style={styles.emptyDeviceText}>
                Exercises will be saved to your {user.platform} device
              </Text>
            </View>
          ) : (
            <View>
              {/* Workout Summary */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Workout Summary</Text>
                <View style={styles.summaryStats}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{exercises.length}</Text>
                    <Text style={styles.summaryLabel}>Exercises</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {exercises.reduce((total, ex) => total + ex.target_sets, 0)}
                    </Text>
                    <Text style={styles.summaryLabel}>Total Sets</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{calculateEstimatedDuration()}</Text>
                    <Text style={styles.summaryLabel}>Est. Minutes</Text>
                  </View>
                </View>
              </View>

              {exercises.map((exercise, index) => (
                <WorkoutExerciseCard
                  key={`${exercise.exercise.id}-${index}`}
                  exercise={exercise}
                  index={index}
                  onUpdate={(updates) => handleUpdateExercise(index, updates)}
                  onRemove={() => handleRemoveExercise(index)}
                  onMoveUp={index > 0 ? () => handleMoveExercise(index, index - 1) : undefined}
                  onMoveDown={index < exercises.length - 1 ? () => handleMoveExercise(index, index + 1) : undefined}
                />
              ))}
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Save as Template</Text>
              <Text style={styles.switchDescription}>
                Make this workout reusable for future sessions on this device
              </Text>
            </View>
            <Switch
              value={isTemplate}
              onValueChange={setIsTemplate}
              trackColor={{ false: '#333', true: '#FF6B35' }}
              thumbColor={isTemplate ? '#fff' : '#999'}
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Public Workout</Text>
              <Text style={styles.switchDescription}>
                Allow others to view and use this workout (associated with your device)
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: '#333', true: '#FF6B35' }}
              thumbColor={isPublic ? '#fff' : '#999'}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#333', '#333'] : ['#FF6B35', '#FF8C42']}
            style={styles.saveButtonGradient}
          >
            <Save size={20} color="#fff" />
            <Text style={styles.saveButtonText}>
              {loading ? 'Creating...' : 'Create Workout'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Exercise Selector Modal */}
      <ExerciseSelector
        visible={showExerciseSelector}
        onClose={() => setShowExerciseSelector(false)}
        onSelectExercise={handleAddExercise}
        excludeExerciseIds={exercises.map(ex => ex.exercise.id)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
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
  disabledButton: {
    opacity: 0.5,
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
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  deviceInfoText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  unsavedIndicator: {
    fontSize: 12,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  authRequiredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  authRequiredTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  authRequiredText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  deviceStatus: {
    marginTop: 20,
    marginBottom: 10,
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
  errorContainer: {
    backgroundColor: '#E74C3C20',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
    marginLeft: 6,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'right',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  addButtonText: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDeviceText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  summaryTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    color: '#FF6B35',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  saveButton: {
    marginTop: 40,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 100,
  },
});
