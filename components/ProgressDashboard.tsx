import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnalyticsChart from './AnalyticsChart';
import { 
  getWorkoutAnalytics, 
  getProgressAnalytics, 
  getTopExercises,
  WorkoutAnalytics,
  ProgressAnalytics 
} from '@/lib/supabase/analytics';

interface ProgressDashboardProps {
  onNavigateToDetail?: (screen: string, params?: any) => void;
}

export default function ProgressDashboard({ onNavigateToDetail }: ProgressDashboardProps) {
  const [workoutAnalytics, setWorkoutAnalytics] = useState<WorkoutAnalytics | null>(null);
  const [progressAnalytics, setProgressAnalytics] = useState<ProgressAnalytics | null>(null);
  const [topExercises, setTopExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<30 | 90 | 180>(90);

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const [workoutData, progressData, exerciseData] = await Promise.all([
        getWorkoutAnalytics(selectedPeriod),
        getProgressAnalytics(),
        getTopExercises(8),
      ]);

      setWorkoutAnalytics(workoutData);
      setProgressAnalytics(progressData);
      setTopExercises(exerciseData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return '#10b981'; // Green
    if (streak >= 7) return '#f59e0b';  // Orange
    return '#6b7280'; // Gray
  };

  if (loading && !workoutAnalytics) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#1f2937', '#111827']} style={styles.loadingGradient}>
          <Ionicons name="analytics" size={48} color="#9E7FFF" />
          <Text style={styles.loadingText}>Loading Analytics...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9E7FFF" />
      }
    >
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {[30, 90, 180].map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period as 30 | 90 | 180)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
              ]}
            >
              {period}d
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Key Metrics */}
      {workoutAnalytics && (
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <LinearGradient colors={['#9E7FFF', '#7C3AED']} style={styles.metricGradient}>
              <Ionicons name="barbell" size={24} color="#FFFFFF" />
              <Text style={styles.metricValue}>{workoutAnalytics.total_workouts}</Text>
              <Text style={styles.metricLabel}>Total Workouts</Text>
            </LinearGradient>
          </View>

          <View style={styles.metricCard}>
            <LinearGradient colors={['#f472b6', '#ec4899']} style={styles.metricGradient}>
              <Ionicons name="time" size={24} color="#FFFFFF" />
              <Text style={styles.metricValue}>
                {formatDuration(workoutAnalytics.total_duration_minutes)}
              </Text>
              <Text style={styles.metricLabel}>Total Time</Text>
            </LinearGradient>
          </View>

          <View style={styles.metricCard}>
            <LinearGradient colors={['#38bdf8', '#0ea5e9']} style={styles.metricGradient}>
              <Ionicons name="flame" size={24} color="#FFFFFF" />
              <Text style={styles.metricValue}>
                {workoutAnalytics.total_calories_burned.toLocaleString()}
              </Text>
              <Text style={styles.metricLabel}>Calories</Text>
            </LinearGradient>
          </View>

          <View style={styles.metricCard}>
            <LinearGradient 
              colors={[getStreakColor(workoutAnalytics.current_streak), getStreakColor(workoutAnalytics.current_streak) + '80']} 
              style={styles.metricGradient}
            >
              <Ionicons name="flash" size={24} color="#FFFFFF" />
              <Text style={styles.metricValue}>{workoutAnalytics.current_streak}</Text>
              <Text style={styles.metricLabel}>Day Streak</Text>
            </LinearGradient>
          </View>
        </View>
      )}

      {/* Workout Frequency Chart */}
      {workoutAnalytics && workoutAnalytics.workout_frequency_by_day.length > 0 && (
        <AnalyticsChart
          title="Workout Frequency by Day"
          subtitle="Which days you train most"
          data={workoutAnalytics.workout_frequency_by_day.map(item => ({
            label: item.day.slice(0, 3),
            value: item.count,
          }))}
          chartType="bar"
          color="#9E7FFF"
          gradientColors={['#9E7FFF', '#7C3AED']}
          icon="calendar"
          height={180}
        />
      )}

      {/* Monthly Progress Chart */}
      {workoutAnalytics && workoutAnalytics.monthly_progress.length > 0 && (
        <AnalyticsChart
          title="Monthly Workout Progress"
          subtitle="Workouts completed each month"
          data={workoutAnalytics.monthly_progress.map(item => ({
            label: item.month.split('-')[1],
            value: item.workouts,
          }))}
          chartType="line"
          color="#f472b6"
          gradientColors={['#f472b6', '#ec4899']}
          icon="trending-up"
          height={200}
          showTrend={true}
          trendDirection={
            workoutAnalytics.monthly_progress.length >= 2 &&
            workoutAnalytics.monthly_progress[workoutAnalytics.monthly_progress.length - 1].workouts >
            workoutAnalytics.monthly_progress[workoutAnalytics.monthly_progress.length - 2].workouts
              ? 'up' : 'stable'
          }
        />
      )}

      {/* Favorite Muscle Groups */}
      {workoutAnalytics && workoutAnalytics.favorite_muscle_groups.length > 0 && (
        <AnalyticsChart
          title="Favorite Muscle Groups"
          subtitle="Most trained muscle groups"
          data={workoutAnalytics.favorite_muscle_groups.map(item => ({
            label: item.muscle_group.replace('_', ' '),
            value: item.count,
          }))}
          chartType="pie"
          color="#38bdf8"
          icon="body"
          height={200}
        />
      )}

      {/* Body Measurements Trends */}
      {progressAnalytics && progressAnalytics.measurement_trends.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Measurement Trends</Text>
          {progressAnalytics.measurement_trends.map((trend, index) => (
            <View key={index} style={styles.trendCard}>
              <LinearGradient colors={['#1f2937', '#111827']} style={styles.trendGradient}>
                <View style={styles.trendHeader}>
                  <Text style={styles.trendTitle}>
                    {trend.measurement_type.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Ionicons
                    name={
                      trend.trend_direction === 'up' ? 'trending-up' :
                      trend.trend_direction === 'down' ? 'trending-down' : 'remove'
                    }
                    size={20}
                    color={
                      trend.trend_direction === 'up' ? '#10b981' :
                      trend.trend_direction === 'down' ? '#ef4444' : '#6b7280'
                    }
                  />
                </View>
                <View style={styles.trendStats}>
                  <View style={styles.trendStat}>
                    <Text style={styles.trendStatLabel}>Current</Text>
                    <Text style={styles.trendStatValue}>
                      {trend.current_value.toFixed(1)}
                      {trend.measurement_type === 'weight' ? ' kg' : 
                       trend.measurement_type.includes('percentage') ? '%' : ' kg'}
                    </Text>
                  </View>
                  <View style={styles.trendStat}>
                    <Text style={styles.trendStatLabel}>30d Change</Text>
                    <Text style={[
                      styles.trendStatValue,
                      { color: trend.change_30_days > 0 ? '#10b981' : trend.change_30_days < 0 ? '#ef4444' : '#6b7280' }
                    ]}>
                      {trend.change_30_days > 0 ? '+' : ''}{trend.change_30_days.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>
      )}

      {/* Top Exercises */}
      {topExercises.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Exercises</Text>
            <TouchableOpacity onPress={() => onNavigateToDetail?.('exercises')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.exerciseGrid}>
            {topExercises.slice(0, 6).map((exercise, index) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => onNavigateToDetail?.('exercise-detail', { exerciseId: exercise.id })}
              >
                <LinearGradient colors={['#1f2937', '#111827']} style={styles.exerciseGradient}>
                  <Text style={styles.exerciseName} numberOfLines={2}>
                    {exercise.name}
                  </Text>
                  <Text style={styles.exerciseStats}>
                    {exercise.session_count} sessions
                  </Text>
                  <Text style={styles.exerciseVolume}>
                    {exercise.total_volume.toLocaleString()} kg total
                  </Text>
                  <View style={styles.exerciseMuscles}>
                    {exercise.muscle_groups.slice(0, 2).map((muscle: string, idx: number) => (
                      <Text key={idx} style={styles.muscleTag}>
                        {muscle.replace('_', ' ')}
                      </Text>
                    ))}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Progress Photos Summary */}
      {progressAnalytics && progressAnalytics.photo_progress.total_photos > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Progress Photos</Text>
            <TouchableOpacity onPress={() => onNavigateToDetail?.('progress-photos')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.photoSummaryCard}>
            <LinearGradient colors={['#1f2937', '#111827']} style={styles.photoSummaryGradient}>
              <View style={styles.photoSummaryStats}>
                <View style={styles.photoStat}>
                  <Ionicons name="camera" size={24} color="#9E7FFF" />
                  <Text style={styles.photoStatValue}>
                    {progressAnalytics.photo_progress.total_photos}
                  </Text>
                  <Text style={styles.photoStatLabel}>Total Photos</Text>
                </View>
                <View style={styles.photoStat}>
                  <Ionicons name="calendar" size={24} color="#f472b6" />
                  <Text style={styles.photoStatValue}>
                    {progressAnalytics.photo_progress.photos_this_month}
                  </Text>
                  <Text style={styles.photoStatLabel}>This Month</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      )}
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
    padding: 40,
  },
  loadingGradient: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    marginTop: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 10,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#262626',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#9E7FFF',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    marginBottom: 12,
    marginHorizontal: '1%',
  },
  metricGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    marginTop: 4,
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  seeAllText: {
    fontSize: 14,
    color: '#9E7FFF',
    fontFamily: 'Inter-Medium',
  },
  trendCard: {
    marginBottom: 12,
  },
  trendGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  trendStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendStat: {
    alignItems: 'center',
  },
  trendStatLabel: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
  },
  trendStatValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 4,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  exerciseCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
  },
  exerciseGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F2F2F',
    minHeight: 120,
  },
  exerciseName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  exerciseStats: {
    fontSize: 12,
    color: '#9E7FFF',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  exerciseVolume: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  exerciseMuscles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleTag: {
    fontSize: 10,
    color: '#f472b6',
    fontFamily: 'Inter-Medium',
    backgroundColor: '#f472b620',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  photoSummaryCard: {
    marginBottom: 8,
  },
  photoSummaryGradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  photoSummaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  photoStat: {
    alignItems: 'center',
  },
  photoStatValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  photoStatLabel: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
});
