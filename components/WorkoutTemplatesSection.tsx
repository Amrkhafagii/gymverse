import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Target } from 'lucide-react-native';
import { Workout } from '@/lib/supabase';

interface WorkoutTemplatesSectionProps {
  loading: boolean;
  workoutTemplates: Workout[];
  onWorkoutPress: (workout: Workout) => void;
  getDifficultyColor: (difficulty: string) => string;
  getWorkoutTypeColor: (type: string) => string;
}

export default function WorkoutTemplatesSection({ 
  loading, 
  workoutTemplates, 
  onWorkoutPress,
  getDifficultyColor,
  getWorkoutTypeColor
}: WorkoutTemplatesSectionProps) {
  return (
    <View style={styles.templatesContainer}>
      <Text style={styles.sectionTitle}>Workout Templates</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading workouts...</Text>
      ) : (
        workoutTemplates.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            style={styles.workoutCard}
            onPress={() => onWorkoutPress(workout)}
          >
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.workoutDescription}>{workout.description}</Text>
              <View style={styles.workoutStats}>
                <View style={styles.statItem}>
                  <Clock size={16} color="#999" />
                  <Text style={styles.statText}>{workout.estimated_duration_minutes} min</Text>
                </View>
                <View style={styles.statItem}>
                  <Target size={16} color={getDifficultyColor(workout.difficulty_level)} />
                  <Text style={[styles.statText, { color: getDifficultyColor(workout.difficulty_level) }]}>
                    {workout.difficulty_level}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.workoutTypeText, { color: getWorkoutTypeColor(workout.workout_type) }]}>
                    {workout.workout_type}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => onWorkoutPress(workout)}
            >
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  templatesContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  workoutCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  workoutTypeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  startButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
});