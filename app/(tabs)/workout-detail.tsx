import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  Target,
  TrendingUp,
  Users,
  Star,
  Play,
  Share2,
  MoreVertical,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import { supabase, Workout, Exercise } from '@/lib/supabase';
import { DesignTokens } from '@/design-system/tokens';
import { ExercisePreviewCard } from '@/components/ui/ExercisePreviewCard';
import { WorkoutStatsCard } from '@/components/ui/WorkoutStatsCard';
import { WorkoutActionBar } from '@/components/ui/WorkoutActionBar';
import * as Haptics from 'expo-haptics';

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
  const params = useLocalSearchParams();
  const workoutId = params?.workoutId as string;
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));

  useEffect(() => {
    if (workoutId) {
      loadWorkoutDetails();
    } else {
      setError('No workout ID provided');
      setLoading(false);
    }
  }, [workoutId]);

  const loadWorkoutDetails = async () => {
    if (!workoutId) {
      setError('Invalid workout ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();

      if (workoutError) {
        throw new Error(workoutError.message);
      }

      if (!workoutData) {
        throw new Error('Workout not found');
      }

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

      if (exercisesError) {
        throw new Error(exercisesError.message);
      }

      setExercises(exercisesData || []);
    } catch (err: any) {
      console.error('Error loading workout details:', err);
      setError(err.message || 'Failed to load workout details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadWorkoutDetails();
    setRefreshing(false);
  };

  const startWorkout = async () => {
    if (!workout || exercises.length === 0) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    router.push({
      pathname: '/(tabs)/workout-session',
      params: {
        workoutId: workoutId,
        workoutName: workout.name || 'Workout',
      },
    });
  };

  const handleToggleFavorite = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFavorited(!isFavorited);
    // TODO: Implement favorite functionality
  };

  const handleSave = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSaved(!isSaved);
    // TODO: Implement save functionality
  };

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Share Workout', 'Share this workout with friends!');
  };

  const handleExercisePress = (exerciseId: number) => {
    router.push({
      pathname: '/exercise-detail',
      params: { exerciseId: exerciseId.toString() }
    });
  };

  const handleExercisePreview = (exerciseId: number) => {
    // TODO: Show exercise preview modal
    Alert.alert('Exercise Preview', 'Show exercise demonstration video');
  };

  // Calculate workout stats
  const workoutStats = React.useMemo(() => {
    if (!exercises.length) return null;

    const totalSets = exercises.reduce((sum, ex) => sum + ex.target_sets, 0);
    const averageRest = Math.round(
      exercises.reduce((sum, ex) => sum + ex.rest_seconds, 0) / exercises.length
    );
    
    const allMuscleGroups = exercises.flatMap(ex => ex.exercise?.muscle_groups || []);
    const uniqueMuscleGroups = [...new Set(allMuscleGroups)];
    
    const allEquipment = exercises.flatMap(ex => ex.exercise?.equipment || []);
    const uniqueEquipment = [...new Set(allEquipment)];

    // Estimate calories (rough calculation)
    const estimatedCalories = Math.round(
      (workout?.estimated_duration_minutes || 0) * 8 // ~8 calories per minute
    );

    return {
      totalExercises: exercises.length,
      totalSets,
      estimatedDuration: workout?.estimated_duration_minutes || 0,
      averageRest,
      muscleGroups: uniqueMuscleGroups,
      equipment: uniqueEquipment,
      difficulty: workout?.difficulty_level || 'beginner',
      calories: estimatedCalories,
    };
  }, [exercises, workout]);

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

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return '#FF6B35';
      case 'cardio':
        return '#EF4444';
      case 'hiit':
        return '#9B59B6';
      case 'flexibility':
        return '#10B981';
      case 'mixed':
        return '#4A90E2';
      default:
        return '#6B7280';
    }
  };

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <AlertCircle size={64} color={DesignTokens.colors.error[500]} />
            <Text style={styles.errorTitle}>Workout Not Found</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Target size={48} color={DesignTokens.colors.primary[500]} />
            <Text style={styles.loadingText}>Loading workout...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // No workout found
  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <AlertCircle size={64} color={DesignTokens.colors.error[500]} />
            <Text style={styles.errorTitle}>Workout Not Found</Text>
            <Text style={styles.errorText}>The requested workout could not be found.</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.gradient}>
        {/* Animated Header */}
        <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
          <LinearGradient
            colors={['rgba(10, 10, 10, 0.95)', 'rgba(26, 26, 26, 0.95)']}
            style={styles.headerGradient}
          >
            <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color={DesignTokens.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {workout.name}
            </Text>
            <TouchableOpacity style={styles.headerMenuButton}>
              <MoreVertical size={24} color={DesignTokens.colors.text.primary} />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['#1a1a1a', '#2a2a2a']}
              style={styles.heroCard}
            >
              {/* Back Button */}
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={24} color={DesignTokens.colors.text.primary} />
              </TouchableOpacity>

              {/* Workout Title & Meta */}
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutTitle}>{workout.name}</Text>
                {workout.description && (
                  <Text style={styles.workoutDescription}>{workout.description}</Text>
                )}
                
                <View style={styles.workoutMeta}>
                  <View style={styles.metaItem}>
                    <Clock size={16} color={DesignTokens.colors.primary[500]} />
                    <Text style={styles.metaText}>
                      {workout.estimated_duration_minutes || 0} min
                    </Text>
                  </View>
                  
                  <View style={styles.metaItem}>
                    <Target size={16} color={getDifficultyColor(workout.difficulty_level || 'beginner')} />
                    <Text style={[
                      styles.metaText,
                      { color: getDifficultyColor(workout.difficulty_level || 'beginner') }
                    ]}>
                      {workout.difficulty_level || 'beginner'}
                    </Text>
                  </View>
                  
                  <View style={styles.metaItem}>
                    <TrendingUp size={16} color={getWorkoutTypeColor(workout.workout_type || 'strength')} />
                    <Text style={[
                      styles.metaText,
                      { color: getWorkoutTypeColor(workout.workout_type || 'strength') }
                    ]}>
                      {workout.workout_type || 'strength'}
                    </Text>
                  </View>
                </View>

                {/* Rating & Users */}
                <View style={styles.socialMeta}>
                  <View style={styles.rating}>
                    <Star size={16} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.ratingText}>4.8</Text>
                    <Text style={styles.ratingCount}>(247 reviews)</Text>
                  </View>
                  
                  <View style={styles.users}>
                    <Users size={16} color={DesignTokens.colors.text.secondary} />
                    <Text style={styles.usersText}>1.2k completed</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Workout Stats */}
          {workoutStats && (
            <WorkoutStatsCard stats={workoutStats} />
          )}

          {/* Exercises Section */}
          <View style={styles.exercisesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exercises ({exercises.length})</Text>
              {exercises.length > 0 && (
                <View style={styles.readyIndicator}>
                  <CheckCircle size={16} color={DesignTokens.colors.success[500]} />
                  <Text style={styles.readyText}>Ready to start</Text>
                </View>
              )}
            </View>

            {exercises.length > 0 ? (
              exercises.map((workoutExercise, index) => (
                <ExercisePreviewCard
                  key={workoutExercise.id}
                  exercise={workoutExercise.exercise}
                  workoutExercise={workoutExercise}
                  onPress={() => handleExercisePress(workoutExercise.exercise.id)}
                  onPreview={() => handleExercisePreview(workoutExercise.exercise.id)}
                />
              ))
            ) : (
              <View style={styles.noExercisesContainer}>
                <AlertCircle size={48} color={DesignTokens.colors.text.tertiary} />
                <Text style={styles.noExercisesTitle}>No Exercises</Text>
                <Text style={styles.noExercisesText}>
                  This workout doesn't have any exercises yet.
                </Text>
              </View>
            )}
          </View>

          {/* Bottom Spacing for Action Bar */}
          <View style={styles.bottomSpacing} />
        </Animated.ScrollView>

        {/* Action Bar */}
        <WorkoutActionBar
          onStartWorkout={startWorkout}
          onToggleFavorite={handleToggleFavorite}
          onShare={handleShare}
          onSave={handleSave}
          isFavorited={isFavorited}
          isSaved={isSaved}
          disabled={exercises.length === 0}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingTop: DesignTokens.spacing[12],
    paddingBottom: DesignTokens.spacing[4],
  },
  headerBackButton: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginHorizontal: DesignTokens.spacing[4],
  },
  headerMenuButton: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[4],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
  },
  errorTitle: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.error[500],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginTop: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[2],
  },
  errorText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: DesignTokens.spacing[6],
  },
  heroSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingTop: DesignTokens.spacing[16],
    marginBottom: DesignTokens.spacing[6],
  },
  heroCard: {
    borderRadius: DesignTokens.borderRadius.xl,
    padding: DesignTokens.spacing[5],
    ...DesignTokens.shadow.lg,
  },
  backButton: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  workoutHeader: {
    marginBottom: DesignTokens.spacing[4],
  },
  workoutTitle: {
    fontSize: DesignTokens.typography.fontSize['4xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[2],
    lineHeight: 36,
  },
  workoutDescription: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 24,
    marginBottom: DesignTokens.spacing[4],
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
    gap: DesignTokens.spacing[4],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  metaText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  socialMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  ratingText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  ratingCount: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  users: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  usersText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  exercisesSection: {
    marginBottom: DesignTokens.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  readyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  readyText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.success[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  noExercisesContainer: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[12],
    paddingHorizontal: DesignTokens.spacing[5],
  },
  noExercisesTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginTop: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[2],
  },
  noExercisesText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 120,
  },
});
