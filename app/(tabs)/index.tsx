import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { DesignTokens } from '@/design-system/tokens';
import { 
  Dumbbell, 
  TrendingUp, 
  Calendar, 
  Target, 
  Zap,
  Plus,
  Brain,
  Award,
  Camera
} from 'lucide-react-native';

// Import components
import { QuickStartCard } from '@/components/dashboard/QuickStartCard';
import { StatCard } from '@/components/ui/StatCard';
import { RecentWorkoutCard } from '@/components/dashboard/RecentWorkoutCard';
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { AIWorkoutSuggestions } from '@/components/ai/AIWorkoutSuggestions';

// Import hooks and contexts
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useProgressPhotoContext } from '@/contexts/ProgressPhotoContext';

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(true);

  const { workouts, refreshHistory } = useWorkoutHistory();
  const { achievements, unlockedAchievements } = useAchievements();
  const { personalRecords } = usePersonalRecords();
  const { photos } = useProgressPhotoContext();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshHistory();
    setRefreshing(false);
  };

  // Calculate stats
  const thisWeekWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return workoutDate >= weekAgo;
  }).length;

  const currentStreak = (() => {
    if (workouts.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    const sortedWorkouts = workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (let i = 0; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i].date);
      const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= i + 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  })();

  const recentPRs = personalRecords.filter(pr => {
    const prDate = new Date(pr.date);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return prDate >= monthAgo;
  }).length;

  const recentPhotos = photos.filter(photo => {
    const photoDate = new Date(photo.date);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return photoDate >= monthAgo;
  }).length;

  const recentWorkouts = workouts.slice(0, 3);
  const recentAchievements = unlockedAchievements.slice(0, 2);

  const handleStartQuickWorkout = () => {
    router.push('/(tabs)/workouts');
  };

  const handleViewProgress = () => {
    router.push('/(tabs)/progress');
  };

  const handleCreateWorkout = () => {
    router.push('/(tabs)/create-workout');
  };

  const handleTakeProgressPhoto = () => {
    router.push('/(tabs)/measurements');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['#1a1a1a', '#2a2a2a']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
              <Text style={styles.welcomeText}>Ready to crush your goals?</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/profile')}
            >
              <View style={styles.profileAvatar}>
                <Text style={styles.profileInitial}>U</Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statsGrid}>
            <StatCard
              label="Workouts"
              value={thisWeekWorkouts.toString()}
              unit="completed"
              icon={<Dumbbell size={20} color="#4ECDC4" />}
              color="#4ECDC4"
              trend="up"
              trendValue="+1"
              onPress={handleViewProgress}
            />
            <StatCard
              label="Streak"
              value={currentStreak.toString()}
              unit="days"
              icon={<Target size={20} color="#45B7D1" />}
              color="#45B7D1"
              trend={currentStreak > 0 ? "up" : "stable"}
              trendValue={currentStreak > 0 ? `+${currentStreak}` : "0"}
              onPress={handleViewProgress}
            />
            <StatCard
              label="New PRs"
              value={recentPRs.toString()}
              unit="this month"
              icon={<Award size={20} color="#96CEB4" />}
              color="#96CEB4"
              trend={recentPRs > 0 ? "up" : "stable"}
              trendValue={recentPRs > 0 ? `+${recentPRs}` : "0"}
              onPress={handleViewProgress}
            />
            <StatCard
              label="Photos"
              value={recentPhotos.toString()}
              unit="this month"
              icon={<Camera size={20} color="#FECA57" />}
              color="#FECA57"
              trend={recentPhotos > 0 ? "up" : "stable"}
              trendValue={recentPhotos > 0 ? `+${recentPhotos}` : "0"}
              onPress={handleTakeProgressPhoto}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickStartCard
              title="Start Workout"
              subtitle="Begin your training session"
              icon={<Zap size={24} color="#FF6B35" />}
              onPress={handleStartQuickWorkout}
              gradient={['#FF6B35', '#FF8C42']}
            />
            <QuickStartCard
              title="Create Workout"
              subtitle="Design a custom routine"
              icon={<Plus size={24} color="#4ECDC4" />}
              onPress={handleCreateWorkout}
              gradient={['#4ECDC4', '#44A08D']}
            />
            <QuickStartCard
              title="Progress Photo"
              subtitle="Document your journey"
              icon={<Camera size={24} color="#45B7D1" />}
              onPress={handleTakeProgressPhoto}
              gradient={['#45B7D1', '#2196F3']}
            />
            <QuickStartCard
              title="View Progress"
              subtitle="Check your analytics"
              icon={<TrendingUp size={24} color="#96CEB4" />}
              onPress={handleViewProgress}
              gradient={['#96CEB4', '#8BC34A']}
            />
          </View>
        </View>

        {/* AI Recommendations */}
        {showAISuggestions && workouts.length > 0 && (
          <View style={styles.aiSection}>
            <View style={styles.aiSectionHeader}>
              <View style={styles.aiTitleContainer}>
                <Brain size={20} color={DesignTokens.colors.primary[500]} />
                <Text style={styles.sectionTitle}>AI Recommendations</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAISuggestions(false)}>
                <Text style={styles.dismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
            <AIWorkoutSuggestions 
              compactMode={true}
              showInsights={true}
              onSelectRecommendation={(recommendation) => {
                console.log('Selected recommendation:', recommendation.title);
                router.push('/(tabs)/workouts');
              }}
            />
          </View>
        )}

        {/* Recent Workouts */}
        {recentWorkouts.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Workouts</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/progress')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {recentWorkouts.map((workout) => (
              <RecentWorkoutCard
                key={workout.id}
                workout={workout}
                onPress={() => console.log('View workout details:', workout.id)}
                onRepeat={() => console.log('Repeat workout:', workout.id)}
              />
            ))}
          </View>
        )}

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Achievements</Text>
              <TouchableOpacity onPress={() => router.push('/achievements')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.achievementsScroll}>
                {recentAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    onPress={() => console.log('View achievement:', achievement.id)}
                    variant="compact"
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Empty State for New Users */}
        {workouts.length === 0 && (
          <View style={styles.emptyState}>
            <Dumbbell size={64} color={DesignTokens.colors.text.tertiary} />
            <Text style={styles.emptyStateTitle}>Welcome to GymVerse!</Text>
            <Text style={styles.emptyStateText}>
              Start your fitness journey by logging your first workout or creating a custom routine.
            </Text>
            <TouchableOpacity 
              style={styles.getStartedButton}
              onPress={handleStartQuickWorkout}
            >
              <LinearGradient
                colors={['#FF6B35', '#FF8C42']}
                style={styles.getStartedGradient}
              >
                <Zap size={20} color="#FFFFFF" />
                <Text style={styles.getStartedText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
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
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[6],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  welcomeText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  profileButton: {
    padding: DesignTokens.spacing[2],
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  statsSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginTop: DesignTokens.spacing[6],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[4],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
  },
  quickActionsSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginTop: DesignTokens.spacing[8],
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
  },
  aiSection: {
    marginTop: DesignTokens.spacing[8],
  },
  aiSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  aiTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  dismissText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  recentSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginTop: DesignTokens.spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  viewAllText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  achievementsSection: {
    marginTop: DesignTokens.spacing[8],
  },
  achievementsScroll: {
    flexDirection: 'row',
    paddingHorizontal: DesignTokens.spacing[5],
    gap: DesignTokens.spacing[3],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[12],
    paddingHorizontal: DesignTokens.spacing[5],
    marginTop: DesignTokens.spacing[8],
  },
  emptyStateTitle: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[2],
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: DesignTokens.spacing[6],
  },
  getStartedButton: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  getStartedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[6],
    paddingVertical: DesignTokens.spacing[4],
  },
  getStartedText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  bottomSpacer: {
    height: DesignTokens.spacing[8],
  },
});
