import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAIWorkoutSuggestions } from '@/hooks/useAIWorkoutSuggestions';
import { WorkoutGoal, WorkoutHistory, AIWorkoutSuggestion } from '@/lib/services/aiService';
import { EXERCISE_DATABASE } from '@/lib/data/exerciseDatabase';

interface AIWorkoutSuggestionsProps {
  visible: boolean;
  onClose: () => void;
  onSelectWorkout: (workout: AIWorkoutSuggestion) => void;
  workoutHistory: WorkoutHistory[];
}

export default function AIWorkoutSuggestions({
  visible,
  onClose,
  onSelectWorkout,
  workoutHistory
}: AIWorkoutSuggestionsProps) {
  const { suggestions, loading, error, generateSuggestions } = useAIWorkoutSuggestions();
  const [selectedGoal, setSelectedGoal] = useState<WorkoutGoal | null>(null);
  const [showGoalSelector, setShowGoalSelector] = useState(true);

  const workoutGoals: { key: WorkoutGoal['type']; label: string; description: string; icon: string; color: string[] }[] = [
    {
      key: 'strength',
      label: 'Build Strength',
      description: 'Focus on progressive overload and compound movements',
      icon: 'barbell',
      color: ['#ef4444', '#dc2626']
    },
    {
      key: 'muscle_gain',
      label: 'Muscle Growth',
      description: 'Hypertrophy-focused training for muscle development',
      icon: 'fitness',
      color: ['#8b5cf6', '#7c3aed']
    },
    {
      key: 'weight_loss',
      label: 'Weight Loss',
      description: 'High-intensity workouts for maximum calorie burn',
      icon: 'flame',
      color: ['#f59e0b', '#d97706']
    },
    {
      key: 'endurance',
      label: 'Endurance',
      description: 'Improve cardiovascular fitness and stamina',
      icon: 'heart',
      color: ['#10b981', '#059669']
    },
    {
      key: 'general_fitness',
      label: 'General Fitness',
      description: 'Balanced approach to overall health and wellness',
      icon: 'body',
      color: ['#06b6d4', '#0891b2']
    }
  ];

  const handleGoalSelect = async (goalType: WorkoutGoal['type']) => {
    const goal: WorkoutGoal = {
      type: goalType,
      duration_minutes: 45,
      difficulty_preference: 'intermediate'
    };

    setSelectedGoal(goal);
    setShowGoalSelector(false);
    
    await generateSuggestions(goal, workoutHistory, 3);
  };

  const handleWorkoutSelect = (workout: AIWorkoutSuggestion) => {
    Alert.alert(
      'Start Workout',
      `Would you like to start "${workout.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Workout',
          onPress: () => {
            onSelectWorkout(workout);
            onClose();
          }
        }
      ]
    );
  };

  const renderGoalSelector = () => (
    <View style={styles.goalSelector}>
      <Text style={styles.sectionTitle}>What's your goal today?</Text>
      <Text style={styles.sectionSubtitle}>
        AI will create personalized workouts based on your history and preferences
      </Text>
      
      {workoutGoals.map((goal) => (
        <TouchableOpacity
          key={goal.key}
          style={styles.goalCard}
          onPress={() => handleGoalSelect(goal.key)}
        >
          <LinearGradient
            colors={goal.color}
            style={styles.goalGradient}
          >
            <View style={styles.goalContent}>
              <View style={styles.goalIcon}>
                <Ionicons name={goal.icon as any} size={24} color="#FFFFFF" />
              </View>
              <View style={styles.goalText}>
                <Text style={styles.goalLabel}>{goal.label}</Text>
                <Text style={styles.goalDescription}>{goal.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderWorkoutCard = (workout: AIWorkoutSuggestion) => (
    <TouchableOpacity
      key={workout.id}
      style={styles.workoutCard}
      onPress={() => handleWorkoutSelect(workout)}
    >
      <LinearGradient
        colors={['#1f2937', '#111827']}
        style={styles.workoutGradient}
      >
        <View style={styles.workoutHeader}>
          <View style={styles.workoutTitleContainer}>
            <Text style={styles.workoutName}>{workout.name}</Text>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{workout.difficulty_level}</Text>
            </View>
          </View>
          <Text style={styles.workoutDescription}>{workout.description}</Text>
        </View>

        <View style={styles.workoutStats}>
          <View style={styles.workoutStat}>
            <Ionicons name="time" size={16} color="#A3A3A3" />
            <Text style={styles.workoutStatText}>{workout.estimated_duration} min</Text>
          </View>
          <View style={styles.workoutStat}>
            <Ionicons name="fitness" size={16} color="#A3A3A3" />
            <Text style={styles.workoutStatText}>{workout.exercises.length} exercises</Text>
          </View>
          <View style={styles.workoutStat}>
            <Ionicons name="flame" size={16} color="#A3A3A3" />
            <Text style={styles.workoutStatText}>{workout.calories_estimate} cal</Text>
          </View>
        </View>

        <View style={styles.focusAreas}>
          <Text style={styles.focusLabel}>Focus Areas:</Text>
          <View style={styles.focusTags}>
            {workout.focus_areas.slice(0, 3).map((area, index) => (
              <View key={index} style={styles.focusTag}>
                <Text style={styles.focusTagText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.reasoning}>
          <Text style={styles.reasoningLabel}>AI Reasoning:</Text>
          <Text style={styles.reasoningText}>{workout.reasoning}</Text>
        </View>

        <View style={styles.exercisePreview}>
          <Text style={styles.exercisePreviewLabel}>Exercises:</Text>
          {workout.exercises.slice(0, 3).map((exercise, index) => {
            const exerciseData = EXERCISE_DATABASE.find(ex => ex.id === exercise.exercise_id);
            return (
              <Text key={index} style={styles.exercisePreviewText}>
                • {exerciseData?.name} - {exercise.sets} sets × {exercise.reps.join('-')} reps
              </Text>
            );
          })}
          {workout.exercises.length > 3 && (
            <Text style={styles.exercisePreviewMore}>
              +{workout.exercises.length - 3} more exercises
            </Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSuggestions = () => (
    <View style={styles.suggestions}>
      <View style={styles.suggestionsHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowGoalSelector(true)}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>AI Workout Suggestions</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Generating personalized workouts...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => selectedGoal && generateSuggestions(selectedGoal, workoutHistory, 3)}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.suggestionsScroll} showsVerticalScrollIndicator={false}>
          {suggestions.map(renderWorkoutCard)}
        </ScrollView>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Workout Assistant</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {showGoalSelector ? renderGoalSelector() : renderSuggestions()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2F2F2F',
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2F2F2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalSelector: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    marginBottom: 24,
    lineHeight: 20,
  },
  goalCard: {
    marginBottom: 16,
  },
  goalGradient: {
    borderRadius: 16,
    padding: 20,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalText: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
  },
  suggestions: {
    flex: 1,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2F2F2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#9E7FFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  suggestionsScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  workoutCard: {
    marginBottom: 20,
  },
  workoutGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  workoutHeader: {
    marginBottom: 16,
  },
  workoutTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    flex: 1,
  },
  difficultyBadge: {
    backgroundColor: '#9E7FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  workoutDescription: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  workoutStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  workoutStatText: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  focusAreas: {
    marginBottom: 16,
  },
  focusLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  focusTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  focusTag: {
    backgroundColor: '#2F2F2F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  focusTagText: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
  },
  reasoning: {
    marginBottom: 16,
  },
  reasoningLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  reasoningText: {
    fontSize: 13,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  exercisePreview: {
    marginTop: 8,
  },
  exercisePreviewLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  exercisePreviewText: {
    fontSize: 13,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  exercisePreviewMore: {
    fontSize: 13,
    color: '#9E7FFF',
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
});
