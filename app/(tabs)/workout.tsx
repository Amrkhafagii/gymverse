import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Play,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Brain,
  Moon,
  Plus,
  Filter,
  Search,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useWorkout } from '@/contexts/WorkoutContext';
import { Button } from '@/components/ui/Button';
import { AIWorkoutSuggestions } from '@/components/ai/AIWorkoutSuggestions';
import { RestDayRecommendations } from '@/components/ai/RestDayRecommendations';
import { RestTimerModal } from '@/components/workout/RestTimerModal';
import { SetTimerCard } from '@/components/workout/SetTimerCard';
import { ExerciseProgressChart } from '@/components/workout/ExerciseProgressChart';
import { WorkoutStatsOverview } from '@/components/workout/WorkoutStatsOverview';
import { PersonalRecordModal } from '@/components/PersonalRecordModal';
import * as Haptics from 'expo-haptics';

export default function WorkoutScreen() {
  const { 
    workoutHistory, 
    currentWorkout, 
    startWorkout, 
    endWorkout,
    isWorkoutActive,
    refreshWorkouts,
  } = useWorkout();

  const [refreshing, setRefreshing] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [showRestRecommendations, setShowRestRecommendations] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshWorkouts();
    setRefreshing(false);
  };

  const handleStartWorkout = async (workoutId?: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (workoutId) {
      // Start AI suggested workout
      await startWorkout({
        id: workoutId,
        name: 'AI Suggested Workout',
        type: 'strength',
        exercises: [],
      });
    } else {
      // Start custom workout
      await startWorkout({
        id: Date.now().toString(),
        name: 'Custom Workout',
        type: 'strength',
        exercises: [],
      });
    }
  };

  const handleCreateCustom = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to workout builder or show workout creation modal
    handleStartWorkout();
  };

  const handleActivitySelect = async (activityId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Handle recovery activity selection
    console.log('Selected recovery activity:', activityId);
  };

  const handleScheduleRest = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Schedule rest day in calendar
    console.log('Scheduling rest day');
  };

  const handleExerciseSelect = (exerciseName: string) => {
    setSelectedExercise(exerciseName);
  };

  const handleRestTimerComplete = () => {
    setShowRestTimer(false);
  };

  const toggleView = (view: 'ai' | 'rest') => {
    if (view === 'ai') {
      setShowAISuggestions(true);
      setShowRestRecommendations(false);
    } else {
      setShowAISuggestions(false);
      setShowRestRecommendations(true);
    }
  };

  const recentWorkouts = workoutHistory.slice(0, 3);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Workouts</Text>
            <Text style={styles.headerSubtitle}>
              {isWorkoutActive ? 'Workout in progress' : 'Ready to train'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Search size={20} color={DesignTokens.colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Filter size={20} color={DesignTokens.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Current Workout Status */}
          {isWorkoutActive && currentWorkout && (
            <View style={styles.currentWorkoutContainer}>
              <LinearGradient
                colors={[DesignTokens.colors.primary[600], DesignTokens.colors.primary[500]]}
                style={styles.currentWorkoutGradient}
              >
                <View style={styles.currentWorkoutHeader}>
                  <View style={styles.currentWorkoutIcon}>
                    <Play size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.currentWorkoutInfo}>
                    <Text style={styles.currentWorkoutTitle}>
                      {currentWorkout.name}
                    </Text>
                    <Text style={styles.currentWorkoutTime}>
                      In progress • {currentWorkout.duration || 0} min
                    </Text>
                  </View>
                </View>
                
                <SetTimerCard
                  exerciseName={selectedExercise || 'Current Exercise'}
                  currentSet={1}
                  totalSets={3}
                  onSetComplete={() => {}}
                  onRestStart={() => setShowRestTimer(true)}
                />
                
                <View style={styles.currentWorkoutActions}>
                  <Button
                    title="End Workout"
                    variant="secondary"
                    size="small"
                    onPress={endWorkout}
                    style={styles.endWorkoutButton}
                  />
                </View>
              </LinearGradient>
            </View>
          )}

          {/* AI Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                showAISuggestions && styles.toggleButtonActive,
              ]}
              onPress={() => toggleView('ai')}
            >
              <Brain size={16} color={showAISuggestions ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />
              <Text style={[
                styles.toggleButtonText,
                showAISuggestions && styles.toggleButtonTextActive,
              ]}>
                AI Suggestions
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.toggleButton,
                showRestRecommendations && styles.toggleButtonActive,
              ]}
              onPress={() => toggleView('rest')}
            >
              <Moon size={16} color={showRestRecommendations ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />
              <Text style={[
                styles.toggleButtonText,
                showRestRecommendations && styles.toggleButtonTextActive,
              ]}>
                Recovery
              </Text>
            </TouchableOpacity>
          </View>

          {/* AI Workout Suggestions */}
          {showAISuggestions && (
            <AIWorkoutSuggestions
              onWorkoutSelect={handleStartWorkout}
              onCreateCustom={handleCreateCustom}
              maxSuggestions={3}
              showRefresh={true}
            />
          )}

          {/* Rest Day Recommendations */}
          {showRestRecommendations && (
            <RestDayRecommendations
              onActivitySelect={handleActivitySelect}
              onScheduleRest={handleScheduleRest}
              showDetailed={true}
            />
          )}

          {/* Quick Start Options */}
          {!isWorkoutActive && (
            <View style={styles.quickStartContainer}>
              <Text style={styles.sectionTitle}>Quick Start</Text>
              <View style={styles.quickStartGrid}>
                <TouchableOpacity
                  style={styles.quickStartCard}
                  onPress={() => handleStartWorkout()}
                >
                  <View style={styles.quickStartIcon}>
                    <Target size={24} color={DesignTokens.colors.primary[500]} />
                  </View>
                  <Text style={styles.quickStartTitle}>Strength</Text>
                  <Text style={styles.quickStartSubtitle}>45-60 min</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickStartCard}
                  onPress={() => handleStartWorkout()}
                >
                  <View style={styles.quickStartIcon}>
                    <TrendingUp size={24} color={DesignTokens.colors.success[500]} />
                  </View>
                  <Text style={styles.quickStartTitle}>Cardio</Text>
                  <Text style={styles.quickStartSubtitle}>20-30 min</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickStartCard}
                  onPress={handleCreateCustom}
                >
                  <View style={styles.quickStartIcon}>
                    <Plus size={24} color={DesignTokens.colors.warning[500]} />
                  </View>
                  <Text style={styles.quickStartTitle}>Custom</Text>
                  <Text style={styles.quickStartSubtitle}>Your choice</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Workout Stats Overview */}
          <WorkoutStatsOverview
            onStatsPress={() => {}}
            showTrends={true}
          />

          {/* Exercise Progress Chart */}
          <ExerciseProgressChart
            exerciseName="Bench Press"
            onExerciseSelect={handleExerciseSelect}
            showComparison={true}
          />

          {/* Recent Workouts */}
          <View style={styles.recentWorkoutsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Workouts</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.recentWorkoutsList}>
              {recentWorkouts.map((workout, index) => (
                <TouchableOpacity
                  key={workout.id}
                  style={styles.recentWorkoutCard}
                  onPress={() => setShowPRModal(true)}
                >
                  <View style={styles.recentWorkoutIcon}>
                    <Calendar size={20} color={DesignTokens.colors.primary[500]} />
                  </View>
                  <View style={styles.recentWorkoutInfo}>
                    <Text style={styles.recentWorkoutName}>{workout.name}</Text>
                    <Text style={styles.recentWorkoutDetails}>
                      {workout.duration} min • {workout.exercises?.length || 0} exercises
                    </Text>
                    <Text style={styles.recentWorkoutDate}>
                      {new Date(workout.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.recentWorkoutStats}>
                    <Text style={styles.recentWorkoutCalories}>
                      {workout.caloriesBurned || 0} cal
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Rest Timer Modal */}
        <RestTimerModal
          visible={showRestTimer}
          onClose={() => setShowRestTimer(false)}
          onComplete={handleRestTimerComplete}
          duration={90}
          exerciseName={selectedExercise || 'Exercise'}
        />

        {/* Personal Record Modal */}
        <PersonalRecordModal
          visible={showPRModal}
          onClose={() => setShowPRModal(false)}
          exerciseName="Bench Press"
          newRecord={{ weight: 185, reps: 8, date: new Date().toISOString() }}
          previousRecord={{ weight: 180, reps: 8, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingTop: DesignTokens.spacing[12],
    paddingBottom: DesignTokens.spacing[4],
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  headerActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  headerButton: {
    padding: DesignTokens.spacing[2],
  },
  content: {
    flex: 1,
    paddingHorizontal: DesignTokens.spacing[5],
  },
  currentWorkoutContainer: {
    marginBottom: DesignTokens.spacing[5],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  currentWorkoutGradient: {
    padding: DesignTokens.spacing[4],
  },
  currentWorkoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[4],
  },
  currentWorkoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentWorkoutInfo: {
    flex: 1,
  },
  currentWorkoutTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  currentWorkoutTime: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  currentWorkoutActions: {
    marginTop: DesignTokens.spacing[4],
  },
  endWorkoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[5],
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
  },
  toggleButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  toggleButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.secondary,
  },
  toggleButtonTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  quickStartContainer: {
    marginBottom: DesignTokens.spacing[5],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[3],
  },
  quickStartGrid: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },
  quickStartCard: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    alignItems: 'center',
  },
  quickStartIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DesignTokens.colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  quickStartTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  quickStartSubtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  recentWorkoutsContainer: {
    marginBottom: DesignTokens.spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  seeAllText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  recentWorkoutsList: {
    gap: DesignTokens.spacing[3],
  },
  recentWorkoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    gap: DesignTokens.spacing[3],
  },
  recentWorkoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentWorkoutInfo: {
    flex: 1,
  },
  recentWorkoutName: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  recentWorkoutDetails: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  recentWorkoutDate: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  recentWorkoutStats: {
    alignItems: 'flex-end',
  },
  recentWorkoutCalories: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.primary[500],
  },
});
