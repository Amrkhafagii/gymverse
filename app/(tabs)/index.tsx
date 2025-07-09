/**
 * Enhanced Home Screen with Challenge System Integration
 * Chunk 5: Bringing challenge visibility and quick actions to home screen
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
  Trophy,
  Medal,
  Users,
  Plus,
  Fire,
  CheckCircle,
} from 'lucide-react-native';
import { router } from 'expo-router';

// Design System
import { DesignTokens } from '@/design-system/tokens';

// Context Integration
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { useStreakTracking } from '@/contexts/StreakContext';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useAnalytics } from '@/hooks/useAnalytics';

// Challenge System Components - Now Featured on Home
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { ChallengeProgress } from '@/components/challenges/ChallengeProgress';

// Achievement Components
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { AchievementBadge } from '@/components/ui/AchievementBadge';
import { AchievementProgress } from '@/components/achievements/AchievementProgress';
import { AchievementNotification } from '@/components/achievements/AchievementNotification';

// Previously Integrated Components
import { StreakCard } from '@/components/StreakCard';
import { QuickStatsCard } from '@/components/QuickStatsCard';
import { RecentWorkoutCard } from '@/components/RecentWorkoutCard';
import { MotivationalQuote } from '@/components/MotivationalQuote';
import { QuickStartCard } from '@/components/dashboard/QuickStartCard';
import { StatCard } from '@/components/ui/StatCard';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [showAllChallenges, setShowAllChallenges] = useState(false);
  const [recentUnlocks, setRecentUnlocks] = useState<any[]>([]);

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
    achievements,
    recentAchievements, 
    getUnlockedCount,
    getTotalAchievements,
    refreshAchievements,
    getAchievementProgress,
    getNearCompletionAchievements,
    checkForNewUnlocks,
  } = useAchievements();
  
  const { 
    currentStreak, 
    longestStreak, 
    getStreakStatus,
    refreshStreak 
  } = useStreakTracking();
  
  const { isOnline, syncStatus } = useOfflineSync();
  const { getWeeklyStats, getTrendData } = useAnalytics('week');

  // Challenge System Data - Mock for now, would come from ChallengeContext
  const [activeChallenges] = useState([
    {
      id: 'challenge_1',
      title: '30-Day Consistency Challenge',
      description: 'Complete a workout every day for 30 days',
      type: 'consistency' as const,
      duration: 30,
      participants: 156,
      progress: 12,
      target: 30,
      reward: 500,
      difficulty: 'intermediate' as const,
      category: 'endurance' as const,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      isParticipating: true,
      createdBy: 'system',
      rules: ['Complete at least 1 workout per day', 'Minimum 20 minutes duration'],
    },
    {
      id: 'challenge_2',
      title: 'Strength Builder',
      description: 'Increase your total volume by 25% this month',
      type: 'volume' as const,
      duration: 30,
      participants: 89,
      progress: 18.5,
      target: 25,
      reward: 750,
      difficulty: 'advanced' as const,
      category: 'strength' as const,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      isParticipating: true,
      createdBy: 'community',
      rules: ['Track all workout volumes', 'Minimum 3 workouts per week'],
    },
  ]);

  const [featuredChallenges] = useState([
    {
      id: 'featured_1',
      title: 'New Year, New You',
      description: 'Transform your fitness in 90 days',
      type: 'consistency' as const,
      duration: 90,
      participants: 1247,
      reward: 2000,
      difficulty: 'intermediate' as const,
      category: 'transformation' as const,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      isParticipating: false,
      createdBy: 'system',
      rules: ['Complete workouts consistently', 'Track progress weekly'],
      featured: true,
      trending: true,
    },
    {
      id: 'featured_2',
      title: 'Push-Up Master',
      description: 'Work up to 100 consecutive push-ups',
      type: 'strength' as const,
      duration: 60,
      participants: 567,
      reward: 1000,
      difficulty: 'advanced' as const,
      category: 'strength' as const,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      isParticipating: false,
      createdBy: 'community',
      rules: ['Progressive push-up training', 'Weekly assessments'],
      featured: true,
      trending: false,
    },
  ]);

  // Achievement-specific data
  const nearCompletionAchievements = getNearCompletionAchievements(3);
  const totalAchievements = getTotalAchievements();
  const unlockedCount = getUnlockedCount();
  const achievementProgress = (unlockedCount / totalAchievements) * 100;

  // Challenge-specific calculations
  const activeChallengeCount = activeChallenges.filter(c => c.isParticipating).length;
  const challengeProgress = activeChallenges
    .filter(c => c.isParticipating)
    .reduce((sum, c) => sum + (c.progress / c.target), 0) / Math.max(activeChallengeCount, 1) * 100;

  // Data Processing
  const weeklyStats = getWeeklyStats();
  const workoutStats = getWorkoutStats();
  const streakStatus = getStreakStatus();
  const totalWorkouts = getTotalWorkouts();

  // Check for new achievement unlocks on mount and data changes
  useEffect(() => {
    const checkUnlocks = async () => {
      const newUnlocks = await checkForNewUnlocks();
      if (newUnlocks.length > 0) {
        setRecentUnlocks(newUnlocks);
        setTimeout(() => setRecentUnlocks([]), 5000);
      }
    };

    checkUnlocks();
  }, [workoutStats, currentStreak, totalWorkouts]);

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

  // Navigation Handlers
  const handleViewAllAchievements = () => {
    router.push('/achievements');
  };

  const handleViewAllChallenges = () => {
    router.push('/social?tab=challenges');
  };

  const handleAchievementPress = (achievement: any) => {
    router.push(`/achievements/${achievement.id}`);
  };

  const handleChallengePress = (challengeId: string) => {
    router.push(`/challenges/${challengeId}`);
  };

  const handleJoinChallenge = (challengeId: string) => {
    Alert.alert(
      'Join Challenge',
      'Are you ready to take on this challenge?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join', 
          onPress: () => {
            Alert.alert('Success', 'You\'ve joined the challenge! Good luck!');
            router.push('/social?tab=challenges');
          }
        },
      ]
    );
  };

  const handleCreateChallenge = () => {
    router.push('/social?tab=challenges&action=create');
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

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Achievement Unlock Notifications */}
      {recentUnlocks.map((achievement, index) => (
        <AchievementNotification
          key={achievement.id}
          achievement={achievement}
          onPress={() => handleAchievementPress(achievement)}
          onDismiss={() => {
            setRecentUnlocks(prev => prev.filter(a => a.id !== achievement.id));
          }}
          style={[styles.notification, { top: 60 + (index * 80) }]}
        />
      ))}

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
        {/* Header with Dual Progress */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
            <Text style={styles.subtitle}>Ready to crush your goals?</Text>
          </View>
          
          {/* Dual Progress Rings */}
          <View style={styles.progressRings}>
            {/* Achievement Progress Ring */}
            <TouchableOpacity onPress={handleViewAllAchievements} style={styles.progressRing}>
              <View style={styles.ringContent}>
                <Trophy size={16} color={DesignTokens.colors.warning[500]} />
                <Text style={styles.ringValue}>{unlockedCount}</Text>
                <Text style={styles.ringLabel}>Achievements</Text>
              </View>
              <View style={[styles.progressCircle, { 
                transform: [{ rotate: `${(achievementProgress * 3.6)}deg` }],
                borderTopColor: DesignTokens.colors.warning[500],
                borderRightColor: DesignTokens.colors.warning[500],
              }]} />
            </TouchableOpacity>

            {/* Challenge Progress Ring */}
            <TouchableOpacity onPress={handleViewAllChallenges} style={styles.progressRing}>
              <View style={styles.ringContent}>
                <Target size={16} color={DesignTokens.colors.primary[500]} />
                <Text style={styles.ringValue}>{activeChallengeCount}</Text>
                <Text style={styles.ringLabel}>Challenges</Text>
              </View>
              <View style={[styles.progressCircle, { 
                transform: [{ rotate: `${(challengeProgress * 3.6)}deg` }],
                borderTopColor: DesignTokens.colors.primary[500],
                borderRightColor: DesignTokens.colors.primary[500],
              }]} />
            </TouchableOpacity>
          </View>
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

        {/* FEATURED: Active Challenges Section */}
        <View style={styles.activeChallengesSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Fire size={20} color={DesignTokens.colors.error[500]} />
              <Text style={styles.sectionTitle}>Active Challenges</Text>
              {activeChallengeCount > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{activeChallengeCount}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={handleViewAllChallenges}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {activeChallengeCount > 0 ? (
            <>
              {/* Active Challenges Scroll */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.challengeScroll}>
                {activeChallenges
                  .filter(challenge => challenge.isParticipating)
                  .map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onPress={() => handleChallengePress(challenge.id)}
                      variant="active"
                      style={styles.activeChallengeCard}
                    />
                  ))}
              </ScrollView>

              {/* Challenge Progress Summary */}
              <View style={styles.challengeProgressSummary}>
                <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.progressSummaryGradient}>
                  <View style={styles.progressSummaryContent}>
                    <View style={styles.progressSummaryLeft}>
                      <Text style={styles.progressSummaryTitle}>Overall Progress</Text>
                      <Text style={styles.progressSummarySubtitle}>
                        {activeChallengeCount} active challenge{activeChallengeCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    
                    <View style={styles.progressSummaryRight}>
                      <Text style={styles.progressSummaryPercentage}>
                        {Math.round(challengeProgress)}%
                      </Text>
                      <Text style={styles.progressSummaryLabel}>Complete</Text>
                    </View>
                  </View>

                  <View style={styles.progressSummaryBar}>
                    <View 
                      style={[
                        styles.progressSummaryFill,
                        { width: `${challengeProgress}%` }
                      ]} 
                    />
                  </View>

                  <View style={styles.progressSummaryStats}>
                    <View style={styles.progressStat}>
                      <Users size={14} color="rgba(255, 255, 255, 0.8)" />
                      <Text style={styles.progressStatText}>
                        {activeChallenges.reduce((sum, c) => sum + c.participants, 0)} total participants
                      </Text>
                    </View>
                    <View style={styles.progressStat}>
                      <Award size={14} color="rgba(255, 255, 255, 0.8)" />
                      <Text style={styles.progressStatText}>
                        {activeChallenges.reduce((sum, c) => sum + c.reward, 0)} pts potential
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </>
          ) : (
            <View style={styles.noChallengesContainer}>
              <Target size={48} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.noChallengesTitle}>No Active Challenges</Text>
              <Text style={styles.noChallengesDescription}>
                Join a challenge to stay motivated and compete with others!
              </Text>
              <TouchableOpacity style={styles.browseChallengesButton} onPress={handleViewAllChallenges}>
                <Text style={styles.browseChallengesText}>Browse Challenges</Text>
                <ChevronRight size={16} color={DesignTokens.colors.primary[500]} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* FEATURED: Challenge Discovery Section */}
        <View style={styles.challengeDiscoverySection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Star size={20} color={DesignTokens.colors.warning[500]} />
              <Text style={styles.sectionTitle}>Featured Challenges</Text>
            </View>
            <TouchableOpacity onPress={handleViewAllChallenges}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.challengeScroll}>
            {featuredChallenges.map((challenge) => (
              <View key={challenge.id} style={styles.featuredChallengeContainer}>
                <LinearGradient 
                  colors={challenge.trending ? ['#FF6B35', '#F7931E'] : ['#667EEA', '#764BA2']}
                  style={styles.featuredChallengeGradient}
                >
                  {challenge.trending && (
                    <View style={styles.trendingBadge}>
                      <TrendingUp size={12} color="#FFFFFF" />
                      <Text style={styles.trendingText}>TRENDING</Text>
                    </View>
                  )}
                  
                  <View style={styles.featuredChallengeContent}>
                    <Text style={styles.featuredChallengeTitle}>{challenge.title}</Text>
                    <Text style={styles.featuredChallengeDescription}>
                      {challenge.description}
                    </Text>
                    
                    <View style={styles.featuredChallengeStats}>
                      <View style={styles.challengeStat}>
                        <Users size={16} color="rgba(255, 255, 255, 0.8)" />
                        <Text style={styles.challengeStatText}>
                          {challenge.participants} participants
                        </Text>
                      </View>
                      <View style={styles.challengeStat}>
                        <Calendar size={16} color="rgba(255, 255, 255, 0.8)" />
                        <Text style={styles.challengeStatText}>
                          {challenge.duration} days
                        </Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.joinChallengeButton}
                      onPress={() => handleJoinChallenge(challenge.id)}
                    >
                      <Text style={styles.joinChallengeText}>Join Challenge</Text>
                      <Target size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            ))}

            {/* Create Challenge Card */}
            <TouchableOpacity 
              style={styles.createChallengeCard}
              onPress={handleCreateChallenge}
            >
              <LinearGradient colors={['#10B981', '#059669']} style={styles.createChallengeGradient}>
                <Plus size={32} color="#FFFFFF" />
                <Text style={styles.createChallengeTitle}>Create Challenge</Text>
                <Text style={styles.createChallengeDescription}>
                  Lead your own fitness challenge
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Achievement Spotlight - Enhanced with Challenge Context */}
        <View style={styles.achievementSpotlight}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Trophy size={20} color={DesignTokens.colors.primary[500]} />
              <Text style={styles.sectionTitle}>Achievement Progress</Text>
            </View>
            <TouchableOpacity onPress={handleViewAllAchievements}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Near Completion Achievements */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementScroll}>
            {nearCompletionAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                onPress={() => handleAchievementPress(achievement)}
                variant="compact"
                style={styles.achievementCardCompact}
              />
            ))}
            
            {/* View All Card */}
            <TouchableOpacity 
              style={styles.viewAllCard}
              onPress={handleViewAllAchievements}
            >
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.viewAllGradient}>
                <Medal size={24} color="#FFFFFF" />
                <Text style={styles.viewAllCardText}>View All</Text>
                <Text style={styles.viewAllCardSubtext}>{totalAchievements} total</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>

          {/* Overall Progress */}
          <AchievementProgress
            current={unlockedCount}
            total={totalAchievements}
            recentUnlocks={recentAchievements.slice(0, 3)}
            onViewAll={handleViewAllAchievements}
          />
        </View>

        {/* Daily Motivation with Challenge Context */}
        <View style={styles.dailySection}>
          <MotivationalQuote
            category="challenge"
            refreshOnMount={true}
            style={styles.motivationalQuote}
          />
        </View>

        {/* Quick Actions with Challenge Hints */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <View style={styles.quickActionGrid}>
            <QuickStartCard
              title="Quick Workout"
              subtitle="Progress your challenges"
              icon={<Zap size={24} color="#FFFFFF" />}
              gradient={['#9E7FFF', '#7C3AED']}
              onPress={handleQuickWorkout}
              badge={activeChallengeCount > 0 ? '🔥' : undefined}
            />
            <QuickStartCard
              title="Browse Challenges"
              subtitle="Find new goals"
              icon={<Target size={24} color="#FFFFFF" />}
              gradient={['#4ECDC4', '#44A08D']}
              onPress={handleViewAllChallenges}
              badge={featuredChallenges.length > 0 ? '⭐' : undefined}
            />
          </View>
        </View>

        {/* Stats with Challenge Context */}
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
              achievementsUnlocked: unlockedCount,
              activeChallenges: activeChallengeCount,
            }}
            trends={getTrendData()}
            onPress={() => router.push('/stats')}
            achievementHints={nearCompletionAchievements.slice(0, 2)}
            challengeHints={activeChallenges.slice(0, 2)}
          />
        </View>

        {/* Individual Stats Grid with Challenge Indicators */}
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
              achievementProgress={getAchievementProgress('weekly_5')}
              challengeProgress={activeChallenges.find(c => c.type === 'consistency')?.progress}
            />
            <StatCard
              label="Total Volume"
              value={formatVolume(workoutStats.totalVolume)}
              unit="lbs"
              icon={<Dumbbell size={20} color={DesignTokens.colors.success[500]} />}
              trend="up"
              trendValue="+15%"
              analyticsKey="total_volume"
              achievementProgress={getAchievementProgress('volume_10000')}
              challengeProgress={activeChallenges.find(c => c.type === 'volume')?.progress}
            />
            <StatCard
              label="Current Streak"
              value={currentStreak.toString()}
              unit="days"
              icon={<Clock size={20} color={DesignTokens.colors.warning[500]} />}
              trend={currentStreak > 0 ? 'up' : 'stable'}
              analyticsKey="current_streak"
              achievementProgress={getAchievementProgress('streak_30')}
              challengeProgress={activeChallenges.find(c => c.type === 'consistency')?.progress}
            />
            <StatCard
              label="Active Goals"
              value={(unlockedCount + activeChallengeCount).toString()}
              unit="total"
              icon={<Award size={20} color={DesignTokens.colors.error[500]} />}
              trend="up"
              trendValue={`${activeChallengeCount} challenges`}
              analyticsKey="active_goals"
              onPress={() => router.push('/social?tab=challenges')}
            />
          </View>
        </View>

        {/* Recent Achievement Unlocks */}
        <View style={styles.recentAchievements}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <TouchableOpacity onPress={handleViewAllAchievements}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.achievementBadgeGrid}>
            {recentAchievements.slice(0, 6).map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                size="medium"
                onPress={() => handleAchievementPress(achievement)}
                showProgress={false}
              />
            ))}
          </View>
        </View>

        {/* Recent Workouts with Challenge Context */}
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
              onPress={() => router.push(`/workouts/${workout.id}`)}
              onRepeat={() => {/* Repeat workout */}}
              achievementProgress={getWorkoutAchievementProgress(workout)}
              challengeProgress={getWorkoutChallengeProgress(workout)}
            />
          ))}
        </View>

        {/* Sync Status Footer */}
        {!isOnline && (
          <View style={styles.offlineFooter}>
            <Text style={styles.offlineText}>
              You're offline. Progress will sync when connected.
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

function getWorkoutAchievementProgress(workout: any): any {
  return {
    nearCompletion: Math.random() > 0.7,
    category: 'strength',
    progress: Math.floor(Math.random() * 100),
  };
}

function getWorkoutChallengeProgress(workout: any): any {
  return {
    relevantChallenges: Math.floor(Math.random() * 3),
    progressContribution: Math.floor(Math.random() * 10),
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background.primary,
  },
  
  scrollView: {
    flex: 1,
  },
  
  notification: {
    position: 'absolute',
    left: DesignTokens.spacing[4],
    right: DesignTokens.spacing[4],
    zIndex: 1000,
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
  
  progressRings: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },
  
  progressRing: {
    width: 70,
    height: 70,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  ringContent: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  
  ringValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[1],
  },
  
  ringLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  
  progressCircle: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 3,
    borderColor: 'transparent',
    borderBottomColor: DesignTokens.colors.surface.secondary,
    borderLeftColor: DesignTokens.colors.surface.secondary,
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
  
  activeChallengesSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  
  countBadge: {
    backgroundColor: DesignTokens.colors.error[500],
    borderRadius: 10,
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    minWidth: 20,
    alignItems: 'center',
  },
  
  countBadgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  
  viewAllText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  
  challengeScroll: {
    marginBottom: DesignTokens.spacing[4],
  },
  
  activeChallengeCard: {
    marginRight: DesignTokens.spacing[3],
    width: 280,
  },
  
  challengeProgressSummary: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.md,
  },
  
  progressSummaryGradient: {
    padding: DesignTokens.spacing[4],
  },
  
  progressSummaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  
  progressSummaryLeft: {
    flex: 1,
  },
  
  progressSummaryTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: DesignTokens.spacing[1],
  },
  
  progressSummarySubtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  progressSummaryRight: {
    alignItems: 'center',
  },
  
  progressSummaryPercentage: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  
  progressSummaryLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  progressSummaryBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: DesignTokens.spacing[3],
    overflow: 'hidden',
  },
  
  progressSummaryFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  
  progressSummaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  progressStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  
  progressStatText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  
  noChallengesContainer: {
    alignItems: 'center',
    padding: DesignTokens.spacing[6],
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
  },
  
  noChallengesTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[2],
  },
  
  noChallengesDescription: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: DesignTokens.spacing[4],
  },
  
  browseChallengesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.primary[100],
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing[2],
  },
  
  browseChallengesText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.primary[500],
  },
  
  challengeDiscoverySection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  
  featuredChallengeContainer: {
    width: 280,
    marginRight: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.md,
  },
  
  featuredChallengeGradient: {
    padding: DesignTokens.spacing[4],
    position: 'relative',
    minHeight: 160,
  },
  
  trendingBadge: {
    position: 'absolute',
    top: DesignTokens.spacing[3],
    right: DesignTokens.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
    gap: DesignTokens.spacing[1],
  },
  
  trendingText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  
  featuredChallengeContent: {
    paddingRight: DesignTokens.spacing[8],
  },
  
  featuredChallengeTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: DesignTokens.spacing[2],
  },
  
  featuredChallengeDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: DesignTokens.spacing[3],
    lineHeight: 20,
  },
  
  featuredChallengeStats: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[3],
  },
  
  challengeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  
  challengeStatText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  
  joinChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing[2],
    alignSelf: 'flex-start',
  },
  
  joinChallengeText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  
  createChallengeCard: {
    width: 200,
    marginRight: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.md,
  },
  
  createChallengeGradient: {
    padding: DesignTokens.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  
  createChallengeTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginTop: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[1],
  },
  
  createChallengeDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  
  achievementSpotlight: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  
  achievementScroll: {
    marginBottom: DesignTokens.spacing[4],
  },
  
  achievementCardCompact: {
    marginRight: DesignTokens.spacing[3],
    width: 200,
  },
  
  viewAllCard: {
    width: 120,
    height: 140,
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    marginRight: DesignTokens.spacing[3],
  },
  
  viewAllGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignTokens.spacing[3],
  },
  
  viewAllCardText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginTop: DesignTokens.spacing[2],
  },
  
  viewAllCardSubtext: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: DesignTokens.spacing[1],
  },
  
  dailySection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  
  motivationalQuote: {
    marginBottom: DesignTokens.spacing[2],
  },
  
  quickActions: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
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
  
  recentAchievements: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  
  achievementBadgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
