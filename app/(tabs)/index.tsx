/**
 * Enhanced Home Screen with integrated unused components
 * Phase 2 Chunk 2.1: Systematic component integration
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Play, 
  TrendingUp, 
  Calendar, 
  Award,
  Zap,
  Target,
  Clock,
  Dumbbell,
  Star,
  ChevronRight,
} from 'lucide-react-native';

// Design System
import { DesignTokens } from '@/design-system/tokens';

// Context Integration
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { useStreakTracking } from '@/contexts/StreakContext';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useAnalytics } from '@/hooks/useAnalytics';

// Previously Unused Components - Now Integrated
import { StreakCard } from '@/components/StreakCard';
import { QuickStatsCard } from '@/components/QuickStatsCard';
import { RecentWorkoutCard } from '@/components/RecentWorkoutCard';
import { AchievementBadge } from '@/components/AchievementBadge';
import { MotivationalQuote } from '@/components/MotivationalQuote';

// Existing Components
import { QuickStartCard } from '@/components/dashboard/QuickStartCard';
import { StatCard } from '@/components/ui/StatCard';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  // Context Integration
  const { 
    currentSession, 
    isSessionActive, 
    startQuickWorkout,
    resumeSession 
  } = useWorkoutSession();
  
  const { 
    recentWorkouts, 
    getWorkoutStats,
    getTotalWorkouts,
    refreshHistory 
  } = useWorkoutHistory();
  
  const { 
    recentAchievements, 
    getUnlockedCount,
    getTotalAchievements,
    refreshAchievements 
  } = useAchievements();
  
  const { 
    currentStreak, 
    longestStreak, 
    getStreakStatus,
    refreshStreak 
  } = useStreakTracking();
  
  const { isOnline, syncStatus } = useOfflineSync();
  const { getWeeklyStats, getTrendData } = useAnalytics('week');

  // Data Processing
  const weeklyStats = getWeeklyStats();
  const workoutStats = getWorkoutStats();
  const streakStatus = getStreakStatus();
  const totalWorkouts = getTotalWorkouts();
  const achievementProgress = {
    unlocked: getUnlockedCount(),
    total: getTotalAchievements(),
  };

  // Refresh Handler
  const onRefresh = async () => {
    if (!isOnline) return;
    
    setRefreshing(true);
    try {
      await Promise.all([
        refreshHistory(),
        refreshAchievements(),
        refreshStreak(),
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Quick Action Handlers
  const handleQuickWorkout = () => {
    if (isSessionActive) {
      Alert.alert(
        'Resume Workout',
        'You have an active workout session. Would you like to resume it?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Resume', onPress: resumeSession },
          { text: 'New Workout', onPress: startQuickWorkout },
        ]
      );
    } else {
      startQuickWorkout();
    }
  };

  const handleViewAllAchievements = () => {
    setShowAllAchievements(!showAllAchievements);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={DesignTokens.colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Streak Integration */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
            <Text style={styles.subtitle}>Ready to crush your goals?</Text>
          </View>
          
          {/* INTEGRATED: StreakCard - Previously unused, now connected */}
          <StreakCard
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            streakStatus={streakStatus}
            onPress={() => {/* Navigate to streak details */}}
            variant="compact"
          />
        </View>

        {/* INTEGRATED: MotivationalQuote - Previously unused, now in daily section */}
        <View style={styles.dailySection}>
          <MotivationalQuote
            category="fitness"
            refreshOnMount={true}
            style={styles.motivationalQuote}
          />
        </View>

        {/* Active Session Banner */}
        {isSessionActive && currentSession && (
          <TouchableOpacity style={styles.activeSessionBanner} onPress={resumeSession}>
            <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.sessionGradient}>
              <View style={styles.sessionInfo}>
                <Play size={20} color="#FFFFFF" />
                <Text style={styles.sessionText}>Resume: {currentSession.workout_name}</Text>
              </View>
              <ChevronRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <View style={styles.quickActionGrid}>
            <QuickStartCard
              title="Quick Workout"
              subtitle="Start training now"
              icon={<Zap size={24} color="#FFFFFF" />}
              gradient={['#9E7FFF', '#7C3AED']}
              onPress={handleQuickWorkout}
            />
            <QuickStartCard
              title="Browse Templates"
              subtitle="Find your perfect workout"
              icon={<Target size={24} color="#FFFFFF" />}
              gradient={['#4ECDC4', '#44A08D']}
              onPress={() => {/* Navigate to templates */}}
            />
          </View>
        </View>

        {/* INTEGRATED: QuickStatsCard - Previously unused, now in stats section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <QuickStatsCard
            stats={{
              totalWorkouts: totalWorkouts,
              weeklyWorkouts: weeklyStats.workouts,
              currentStreak: currentStreak,
              totalVolume: workoutStats.totalVolume,
              averageDuration: workoutStats.averageDuration,
              personalRecords: workoutStats.personalRecords,
            }}
            trends={getTrendData()}
            onPress={() => {/* Navigate to detailed stats */}}
          />
        </View>

        {/* Individual Stats Grid */}
        <View style={styles.individualStats}>
          <View style={styles.statsGrid}>
            <StatCard
              label="This Week"
              value={weeklyStats.workouts.toString()}
              unit="workouts"
              icon={<Calendar size={20} color={DesignTokens.colors.primary[500]} />}
              trend="up"
              trendValue="+2 from last week"
              analyticsKey="weekly_workouts"
            />
            <StatCard
              label="Total Volume"
              value={formatVolume(workoutStats.totalVolume)}
              unit="lbs"
              icon={<Dumbbell size={20} color={DesignTokens.colors.success[500]} />}
              trend="up"
              trendValue="+15%"
              analyticsKey="total_volume"
            />
            <StatCard
              label="Avg Duration"
              value={formatDuration(workoutStats.averageDuration)}
              icon={<Clock size={20} color={DesignTokens.colors.warning[500]} />}
              trend="stable"
              analyticsKey="avg_duration"
            />
            <StatCard
              label="Personal Records"
              value={workoutStats.personalRecords.toString()}
              unit="PRs"
              icon={<Award size={20} color={DesignTokens.colors.error[500]} />}
              trend="up"
              trendValue="+3 this month"
              analyticsKey="personal_records"
            />
          </View>
        </View>

        {/* INTEGRATED: Recent Achievements with AchievementBadge */}
        <View style={styles.achievementsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <TouchableOpacity onPress={handleViewAllAchievements}>
              <Text style={styles.viewAllText}>
                {showAllAchievements ? 'Show Less' : 'View All'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.achievementsList}>
            {recentAchievements.slice(0, showAllAchievements ? undefined : 3).map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                onPress={() => {/* Navigate to achievement details */}}
                variant="notification"
                showProgress={true}
              />
            ))}
          </View>
          
          <View style={styles.achievementProgress}>
            <Text style={styles.progressText}>
              {achievementProgress.unlocked} of {achievementProgress.total} achievements unlocked
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(achievementProgress.unlocked / achievementProgress.total) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* INTEGRATED: RecentWorkoutCard - Previously unused, now connected to workout history */}
        <View style={styles.recentWorkoutsSection}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {recentWorkouts.slice(0, 3).map((workout) => (
            <RecentWorkoutCard
              key={workout.id}
              workout={{
                id: workout.id,
                name: workout.workout_name,
                date: workout.completed_at || workout.started_at,
                duration: Math.floor(workout.total_duration_seconds / 60),
                exercises: workout.exercises.length,
                totalVolume: calculateWorkoutVolume(workout),
                muscleGroups: extractMuscleGroups(workout),
                difficulty: determineDifficulty(workout),
              }}
              onPress={() => {/* Navigate to workout details */}}
              onRepeat={() => {/* Repeat workout */}}
            />
          ))}
        </View>

        {/* Sync Status Footer */}
        {!isOnline && (
          <View style={styles.offlineFooter}>
            <Text style={styles.offlineText}>
              You're offline. Some data may not be up to date.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Functions
function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

function formatVolume(volume: number): string {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k`;
  return volume.toString();
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function calculateWorkoutVolume(workout: any): number {
  return workout.exercises.reduce((total: number, exercise: any) => {
    return total + exercise.sets
      .filter((set: any) => set.is_completed)
      .reduce((setTotal: number, set: any) => {
        return setTotal + ((set.actual_weight_kg || 0) * (set.actual_reps || 0));
      }, 0);
  }, 0);
}

function extractMuscleGroups(workout: any): string[] {
  const muscleGroups = new Set<string>();
  workout.exercises.forEach((exercise: any) => {
    if (exercise.primary_muscle_group) {
      muscleGroups.add(exercise.primary_muscle_group);
    }
    if (exercise.secondary_muscle_groups) {
      exercise.secondary_muscle_groups.forEach((muscle: string) => {
        muscleGroups.add(muscle);
      });
    }
  });
  return Array.from(muscleGroups);
}

function determineDifficulty(workout: any): 'Beginner' | 'Intermediate' | 'Advanced' {
  const totalSets = workout.exercises.reduce((total: number, exercise: any) => {
    return total + exercise.sets.filter((set: any) => set.is_completed).length;
  }, 0);
  
  const duration = workout.total_duration_seconds / 60;
  
  if (totalSets >= 20 && duration >= 60) return 'Advanced';
  if (totalSets >= 12 && duration >= 45) return 'Intermediate';
  return 'Beginner';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background.primary,
  },
  
  scrollView: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
  },
  
  headerContent: {
    flex: 1,
  },
  
  greeting: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  
  subtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  
  dailySection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  
  motivationalQuote: {
    marginBottom: DesignTokens.spacing[2],
  },
  
  activeSessionBanner: {
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  
  sessionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: DesignTokens.spacing[4],
  },
  
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  
  sessionText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  
  quickActions: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[3],
  },
  
  quickActionGrid: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },
  
  statsSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  
  individualStats: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
  },
  
  achievementsSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  
  viewAllText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  
  achievementsList: {
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[3],
  },
  
  achievementProgress: {
    alignItems: 'center',
  },
  
  progressText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[2],
  },
  
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: DesignTokens.colors.primary[500],
  },
  
  recentWorkoutsSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  
  offlineFooter: {
    padding: DesignTokens.spacing[4],
    backgroundColor: DesignTokens.colors.surface.secondary,
    alignItems: 'center',
  },
  
  offlineText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
});
