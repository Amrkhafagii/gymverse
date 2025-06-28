import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Play,
  Clock,
  Target,
  TrendingUp,
  ArrowLeft,
  Dumbbell,
} from 'lucide-react-native';
import { supabase, Workout, Exercise } from '@/lib/supabase';

interface WorkoutExercise {
  id: number;
  exercise_id: number;
  order_index: number;
  target_sets: number;
  target_reps: number[] | null;
  target_duration_seconds: number | null;
  rest_seconds: number;
  exercise: Exercise;
}

export default function WorkoutDetailScreen() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkoutDetails();
  }, [workoutId]);

  const loadWorkoutDetails = async () => {
    if (!workoutId) return;

    try {
      // Load workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();

      if (workoutError) throw workoutError;
      setWorkout(workoutData);

      // Load workout exercises with exercise details
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('workout_id', workoutId)
        .order('order_index');

      if (exercisesError) throw exercisesError;
      setExercises(exercisesData);
    } catch (error) {
      console.error('Error loading workout details:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = () => {
    router.push({
      pathname: '/(tabs)/workout-session',
      params: {
        workoutId: workoutId,
        workoutName: workout?.name,
      },
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#27AE60';
      case 'intermediate':
        return '#F39C12';
      case 'advanced':
        return '#E74C3C';
      default:
        return '#999';
    }
  };

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return '#FF6B35';
      case 'cardio':
        return '#E74C3C';
      case 'hiit':
        return '#9B59B6';
      case 'flexibility':
        return '#27AE60';
      case 'mixed':
        return '#4A90E2';
      default:
        return '#999';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Workout not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.workoutTitle}>{workout.name}</Text>
        <Text style={styles.workoutDescription}>{workout.description}</Text>
        
        <View style={styles.workoutMeta}>
          <View style={styles.metaItem}>
            <Clock size={16} color="#FF6B35" />
            <Text style={styles.metaText}>{workout.estimated_duration_minutes} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Target size={16} color={getDifficultyColor(workout.difficulty_level)} />
            <Text style={[styles.metaText, { color: getDifficultyColor(workout.difficulty_level) }]}>
              {workout.difficulty_level}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <TrendingUp size={16} color={getWorkoutTypeColor(workout.workout_type)} />
            <Text style={[styles.metaText, { color: getWorkoutTypeColor(workout.workout_type) }]}>
              {workout.workout_type}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{exercises.length}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {exercises.reduce((total, ex) => total + ex.target_sets, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Sets</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.round(exercises.reduce((total, ex) => total + ex.rest_seconds, 0) / exercises.length)}s
            </Text>
            <Text style={styles.statLabel}>Avg Rest</Text>
          </View>
        </View>

        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {exercises.map((workoutExercise, index) => (
            <View key={workoutExercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{workoutExercise.exercise.name}</Text>
                  <Text style={styles.exerciseDescription}>
                    {workoutExercise.exercise.description}
                  </Text>
                </View>
              </View>

              {workoutExercise.exercise.demo_image_url && (
                <Image
                  source={{ uri: workoutExercise.exercise.demo_image_url }}
                  style={styles.exerciseImage}
                />
              )}

              <View style={styles.exerciseDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Sets</Text>
                  <Text style={styles.detailValue}>{workoutExercise.target_sets}</Text>
                </View>
                {workoutExercise.target_reps && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Reps</Text>
                    <Text style={styles.detailValue}>
                      {workoutExercise.target_reps.join('-')}
                    </Text>
                  </View>
                )}
                {workoutExercise.target_duration_seconds && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Duration</Text>
                    <Text style={styles.detailValue}>
                      {workoutExercise.target_duration_seconds}s
                    </Text>
                  </View>
                )}
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Rest</Text>
                  <Text style={styles.detailValue}>{workoutExercise.rest_seconds}s</Text>
                </View>
              </View>

              <View style={styles.muscleGroups}>
                {workoutExercise.exercise.muscle_groups.map((muscle, muscleIndex) => (
                  <View key={muscleIndex} style={styles.muscleTag}>
                    <Text style={styles.muscleTagText}>{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.startWorkoutButton} onPress={startWorkout}>
          <LinearGradient colors={['#FF6B35', '#FF8C42']} style={styles.startWorkoutGradient}>
            <Play size={24} color="#fff" />
            <Text style={styles.startWorkoutText}>Start Workout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    fontFamily: 'Inter-Regular',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  backButton: {
    marginBottom: 20,
  },
  workoutTitle: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  workoutDescription: {
    fontSize: 16,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 20,
  },
  workoutMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  content: {
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  statValue: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  exercisesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  exerciseNumber: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  exerciseNumberText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  exerciseImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleTag: {
    backgroundColor: '#333',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  muscleTagText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  startWorkoutButton: {
    marginBottom: 100,
    borderRadius: 16,
    overflow: 'hidden',
  },
  startWorkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  startWorkoutText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
});