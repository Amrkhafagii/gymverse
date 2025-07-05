import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AIWorkoutSuggestions from '@/components/ai/AIWorkoutSuggestions';
import RestDayRecommendations from '@/components/ai/RestDayRecommendations';
import { AIWorkoutSuggestion, WorkoutHistory } from '@/lib/services/aiService';
import { useRestDayRecommendations } from '@/hooks/useRestDayRecommendations';

export default function WorkoutsScreen() {
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showRestRecommendations, setShowRestRecommendations] = useState(false);
  const { recommendation, loading, error, generateRecommendation } = useRestDayRecommendations();

  // Mock workout history - in real app, this would come from your data context
  const mockWorkoutHistory: WorkoutHistory[] = [
    {
      date: '2024-01-15',
      exercises: ['push-ups', 'bench-press', 'squats'],
      muscle_groups: ['chest', 'shoulders', 'quadriceps'],
      duration_minutes: 45,
      intensity: 8,
      workout_type: 'strength'
    },
    {
      date: '2024-01-14',
      exercises: ['pull-ups', 'deadlifts', 'lunges'],
      muscle_groups: ['back', 'hamstrings', 'glutes'],
      duration_minutes: 50,
      intensity: 9,
      workout_type: 'strength'
    },
    {
      date: '2024-01-13',
      exercises: ['burpees', 'mountain-climbers', 'plank'],
      muscle_groups: ['full_body', 'core', 'cardiovascular'],
      duration_minutes: 30,
      intensity: 8,
      workout_type: 'cardio'
    },
    {
      date: '2024-01-12',
      exercises: ['squats', 'lunges', 'calf-raises'],
      muscle_groups: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
      duration_minutes: 40,
      intensity: 7,
      workout_type: 'strength'
    },
    {
      date: '2024-01-11',
      exercises: ['bench-press', 'shoulder-press', 'tricep-dips'],
      muscle_groups: ['chest', 'shoulders', 'triceps'],
      duration_minutes: 35,
      intensity: 8,
      workout_type: 'strength'
    }
  ];

  const workoutTemplates = [
    {
      id: 1,
      name: 'Push Day',
      description: 'Chest, shoulders, and triceps',
      duration: '45 min',
      exercises: 6,
      difficulty: 'Intermediate',
      image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
    },
    {
      id: 2,
      name: 'Pull Day',
      description: 'Back and biceps workout',
      duration: '40 min',
      exercises: 5,
      difficulty: 'Intermediate',
      image: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg',
    },
    {
      id: 3,
      name: 'Leg Day',
      description: 'Lower body strength',
      duration: '50 min',
      exercises: 7,
      difficulty: 'Advanced',
      image: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg',
    },
    {
      id: 4,
      name: 'Full Body',
      description: 'Complete body workout',
      duration: '60 min',
      exercises: 8,
      difficulty: 'Beginner',
      image: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg',
    },
  ];

  const handleAIWorkoutSelect = (workout: AIWorkoutSuggestion) => {
    // Handle the selected AI workout - could navigate to workout screen
    console.log('Selected AI workout:', workout);
    // In a real app, you might navigate to a workout execution screen
    // or save the workout to the user's library
  };

  const handleRestDayAnalysis = async () => {
    await generateRecommendation(mockWorkoutHistory);
    setShowRestRecommendations(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Workouts</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <LinearGradient
                colors={['#9E7FFF', '#7C3AED']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="play" size={24} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Quick Start</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => setShowAISuggestions(true)}
            >
              <LinearGradient
                colors={['#f472b6', '#ec4899']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="sparkles" size={24} color="#FFFFFF" />
                <Text style={styles.quickActionText}>AI Suggest</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={handleRestDayAnalysis}
            >
              <LinearGradient
                colors={['#38bdf8', '#0ea5e9']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="bed" size={24} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Rest Analysis</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Workout Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Templates</Text>
          {workoutTemplates.map((workout) => (
            <TouchableOpacity key={workout.id} style={styles.workoutCard}>
              <LinearGradient
                colors={['#1f2937', '#111827']}
                style={styles.workoutGradient}
              >
                <Image source={{ uri: workout.image }} style={styles.workoutImage} />
                <View style={styles.workoutContent}>
                  <View style={styles.workoutHeader}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <View style={styles.difficultyBadge}>
                      <Text style={styles.difficultyText}>{workout.difficulty}</Text>
                    </View>
                  </View>
                  <Text style={styles.workoutDescription}>{workout.description}</Text>
                  <View style={styles.workoutStats}>
                    <View style={styles.workoutStat}>
                      <Ionicons name="time" size={16} color="#A3A3A3" />
                      <Text style={styles.workoutStatText}>{workout.duration}</Text>
                    </View>
                    <View style={styles.workoutStat}>
                      <Ionicons name="fitness" size={16} color="#A3A3A3" />
                      <Text style={styles.workoutStatText}>{workout.exercises} exercises</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.startButton}>
                  <Ionicons name="play" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Workouts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['#1f2937', '#111827']}
              style={styles.emptyStateGradient}
            >
              <Ionicons name="barbell" size={48} color="#A3A3A3" />
              <Text style={styles.emptyStateTitle}>No workouts yet</Text>
              <Text style={styles.emptyStateText}>
                Start your first workout to see your history here
              </Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>

      <AIWorkoutSuggestions
        visible={showAISuggestions}
        onClose={() => setShowAISuggestions(false)}
        onSelectWorkout={handleAIWorkoutSelect}
        workoutHistory={mockWorkoutHistory}
      />

      <RestDayRecommendations
        visible={showRestRecommendations}
        onClose={() => setShowRestRecommendations(false)}
        recommendation={recommendation}
        loading={loading}
        error={error}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  addButton: {
    backgroundColor: '#9E7FFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  workoutCard: {
    marginBottom: 16,
  },
  workoutGradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F2F2F',
    overflow: 'hidden',
  },
  workoutImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  workoutContent: {
    padding: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
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
    marginBottom: 12,
  },
  workoutStats: {
    flexDirection: 'row',
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
  startButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    marginBottom: 8,
  },
  emptyStateGradient: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});
