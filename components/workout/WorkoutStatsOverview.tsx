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
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Flame,
  Target,
  Trophy,
  Zap,
  BarChart3,
  Activity,
  Award,
  Star,
} from 'lucide-react-native';
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { DesignTokens } from '@/design-system/tokens';
import { ProfileStatCard } from '@/components/ui/ProfileStatCard';

export function WorkoutStatsOverview() {
  const { workouts, isLoading } = useWorkoutHistory();
  const { personalRecords, prStats } = usePersonalRecords();
  const [refreshing, setRefreshing] = useState(false);

  // Calculate comprehensive stats
  const stats = React.useMemo(() => {
    if (workouts.length === 0) {
      return {
        totalWorkouts: 0,
        totalMinutes: 0,
        totalVolume: 0,
        averageWorkoutDuration: 0,
        workoutsThisWeek: 0,
        workoutsThisMonth: 0,
        currentStreak: 0,
        longestStreak: 0,
        favoriteExercise: 'None',
        totalCalories: 0,
        averageRestTime: 0,
        totalSets: 0,
        totalReps: 0,
        uniqueExercises: 0,
        weeklyTrend: 0,
        monthlyTrend: 0,
      };
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    let totalMinutes = 0;
    let totalVolume = 0;
    let totalCalories = 0;
    let totalSets = 0;
    let totalReps = 0;
    let workoutsThisWeek = 0;
    let workoutsThisMonth = 0;
    let workoutsLastWeek = 0;
    let workoutsLastMonth = 0;
    
    const exerciseCount: Record<string, number> = {};
    const uniqueExercises = new Set<string>();

    workouts.forEach(workout => {
      const workoutDate = new Date(workout.created_at);
      totalMinutes += workout.duration_minutes || 0;
      totalCalories += workout.calories_burned || 0;

      // Weekly and monthly counts
      if (workoutDate >= oneWeekAgo) workoutsThisWeek++;
      if (workoutDate >= oneMonthAgo) workoutsThisMonth++;
      if (workoutDate >= twoWeeksAgo && workoutDate < oneWeekAgo) workoutsLastWeek++;
      if (workoutDate >= twoMonthsAgo && workoutDate < oneMonthAgo) workoutsLastMonth++;

      workout.exercises?.forEach((exercise: any) => {
        const exerciseName = exercise.exercise_name;
        uniqueExercises.add(exerciseName);
        exerciseCount[exerciseName] = (exerciseCount[exerciseName] || 0) + 1;

        exercise.sets?.forEach((set: any) => {
          totalSets++;
          totalReps += set.actual_reps || 0;
          if (set.actual_weight_kg && set.actual_reps) {
            totalVolume += set.actual_weight_kg * set.actual_reps;
          }
        });
      });
    });

    // Calculate streaks
    const sortedWorkouts = [...workouts].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastWorkoutDate: Date | null = null;

    sortedWorkouts.forEach(workout => {
      const workoutDate = new Date(workout.created_at);
      workoutDate.setHours(0, 0, 0, 0);

      if (!lastWorkoutDate) {
        currentStreak = 1;
        tempStreak = 1;
        lastWorkoutDate = workoutDate;
      } else {
        const daysDiff = Math.floor((lastWorkoutDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          tempStreak++;
          if (currentStreak === tempStreak - 1) currentStreak = tempStreak;
        } else if (daysDiff > 1) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
        
        lastWorkoutDate = workoutDate;
      }
    });

    longestStreak = Math.max(longestStreak, tempStreak);

    // Find favorite exercise
    const favoriteExercise = Object.keys(exerciseCount).reduce((a, b) => 
      exerciseCount[a] > exerciseCount[b] ? a : b, 'None'
    );

    // Calculate trends
    const weeklyTrend = workoutsLastWeek > 0 ? 
      ((workoutsThisWeek - workoutsLastWeek) / workoutsLastWeek) * 100 : 0;
    const monthlyTrend = workoutsLastMonth > 0 ? 
      ((workoutsThisMonth - workoutsLastMonth) / workoutsLastMonth) * 100 : 0;

    return {
      totalWorkouts: workouts.length,
      totalMinutes,
      totalVolume,
      averageWorkoutDuration: totalMinutes / workouts.length,
      workoutsThisWeek,
      workoutsThisMonth,
      currentStreak,
      longestStreak,
      favoriteExercise,
      totalCalories,
      averageRestTime: 90, // Mock data
      totalSets,
      totalReps,
      uniqueExercises: uniqueExercises.size,
      weeklyTrend,
      monthlyTrend,
    };
  }, [workouts]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh data here
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading workout stats...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Stats */}
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.headerStatLabel}>Total Workouts</Text>
          </View>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{Math.round(stats.totalMinutes / 60)}h</Text>
            <Text style={styles.headerStatLabel}>Total Hours</Text>
          </View>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{stats.currentStreak}</Text>
            <Text style={styles.headerStatLabel}>Current Streak</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main Stats Grid */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Workout Overview</Text>
        
        <View style={styles.statsGrid}>
          <ProfileStatCard
            title="This Week"
            value={stats.workoutsThisWeek}
            subtitle="Workouts completed"
            icon={<Calendar size={20} color="#00D4AA" />}
            color="#00D4AA"
            trend={{ 
              value: Math.abs(stats.weeklyTrend), 
              isPositive: stats.weeklyTrend >= 0 
            }}
          />
          <ProfileStatCard
            title="This Month"
            value={stats.workoutsThisMonth}
            subtitle="Total sessions"
            icon={<BarChart3 size={20} color="#9E7FFF" />}
            color="#9E7FFF"
            trend={{ 
              value: Math.abs(stats.monthlyTrend), 
              isPositive: stats.monthlyTrend >= 0 
            }}
          />
        </View>

        <View style={styles.statsGrid}>
          <ProfileStatCard
            title="Avg Duration"
            value={`${Math.round(stats.averageWorkoutDuration)}m`}
            subtitle="Per workout"
            icon={<Clock size={20} color="#FF6B35" />}
            color="#FF6B35"
          />
          <ProfileStatCard
            title="Total Volume"
            value={`${(stats.totalVolume / 1000).toFixed(1)}k`}
            subtitle="kg lifted"
            icon={<Trophy size={20} color="#FFD700" />}
            color="#FFD700"
          />
        </View>
      </View>

      {/* Performance Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        
        <View style={styles.statsGrid}>
          <ProfileStatCard
            title="Total Sets"
            value={stats.totalSets}
            subtitle="Completed"
            icon={<Target size={20} color="#4ECDC4" />}
            color="#4ECDC4"
          />
          <ProfileStatCard
            title="Total Reps"
            value={stats.totalReps}
            subtitle="Performed"
            icon={<Activity size={20} color="#45B7D1" />}
            color="#45B7D1"
          />
        </View>

        <View style={styles.statsGrid}>
          <ProfileStatCard
            title="Calories Burned"
            value={stats.totalCalories}
            subtitle="Total energy"
            icon={<Flame size={20} color="#E74C3C" />}
            color="#E74C3C"
          />
          <ProfileStatCard
            title="Exercises"
            value={stats.uniqueExercises}
            subtitle="Unique movements"
            icon={<Zap size={20} color="#F39C12" />}
            color="#F39C12"
          />
        </View>
      </View>

      {/* Achievement Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Achievements & Records</Text>
        
        <View style={styles.statsGrid}>
          <ProfileStatCard
            title="Personal Records"
            value={prStats.totalPRs}
            subtitle="All time"
            icon={<Award size={20} color="#9B59B6" />}
            color="#9B59B6"
          />
          <ProfileStatCard
            title="Recent PRs"
            value={prStats.recentPRs}
            subtitle="This month"
            icon={<Star size={20} color="#E67E22" />}
            color="#E67E22"
          />
        </View>

        <View style={styles.statsGrid}>
          <ProfileStatCard
            title="Longest Streak"
            value={stats.longestStreak}
            subtitle="Days in a row"
            icon={<TrendingUp size={20} color="#27AE60" />}
            color="#27AE60"
          />
          <ProfileStatCard
            title="Favorite Exercise"
            value={stats.favoriteExercise.length > 12 ? 
              stats.favoriteExercise.substring(0, 12) + '...' : 
              stats.favoriteExercise
            }
            subtitle="Most performed"
            icon={<Trophy size={20} color="#8E44AD" />}
            color="#8E44AD"
          />
        </View>
      </View>

      {/* Quick Insights */}
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.insightsCard}>
        <Text style={styles.insightsTitle}>Quick Insights</Text>
        
        <View style={styles.insightsList}>
          {stats.weeklyTrend > 0 && (
            <View style={styles.insightItem}>
              <TrendingUp size={16} color="#00D4AA" />
              <Text style={styles.insightText}>
                You're {stats.weeklyTrend.toFixed(0)}% more active this week!
              </Text>
            </View>
          )}
          
          {stats.currentStreak >= 3 && (
            <View style={styles.insightItem}>
              <Flame size={16} color="#FF6B35" />
              <Text style={styles.insightText}>
                Great streak! You're on fire with {stats.currentStreak} days!
              </Text>
            </View>
          )}
          
          {prStats.recentPRs > 0 && (
            <View style={styles.insightItem}>
              <Trophy size={16} color="#FFD700" />
              <Text style={styles.insightText}>
                You've set {prStats.recentPRs} personal record{prStats.recentPRs !== 1 ? 's' : ''} this month!
              </Text>
            </View>
          )}
          
          {stats.totalWorkouts === 0 && (
            <View style={styles.insightItem}>
              <Target size={16} color="#9E7FFF" />
              <Text style={styles.insightText}>
                Start your fitness journey by completing your first workout!
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.background.primary,
  },
  loadingText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  headerCard: {
    marginHorizontal: DesignTokens.spacing[5],
    marginTop: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[6],
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[5],
    ...DesignTokens.shadow.base,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: DesignTokens.typography.fontSize['3xl'],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  headerStatLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: DesignTokens.spacing[6],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[4],
    paddingHorizontal: DesignTokens.spacing[5],
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[3],
  },
  insightsCard: {
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[5],
    ...DesignTokens.shadow.base,
  },
  insightsTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[4],
  },
  insightsList: {
    gap: DesignTokens.spacing[3],
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  insightText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
});
