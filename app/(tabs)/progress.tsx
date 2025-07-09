/**
 * Enhanced Progress Screen with Advanced Progress Indicators
 * Chunk 14: Adding circular progress and progress bars throughout
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  Calendar,
  Target,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  Zap,
  Trophy,
  Star,
  ChevronRight,
  Filter,
  Download,
  Share,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { router } from 'expo-router';

// Design System
import { DesignTokens } from '@/design-system/tokens';

// Context Integration
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useAchievements } from '@/contexts/AchievementContext';
import { useStreakTracking } from '@/contexts/StreakContext';
import { useAnalytics } from '@/hooks/useAnalytics';

// Enhanced Progress Components - NEW
import { CircularProgress, CircularProgressDashboard, CircularProgressGradient } from '@/components/ui/CircularProgress';
import { ProgressBar, ProgressBarGradient, ProgressBarSegmented, ProgressBarWithLabel } from '@/components/ui/ProgressBar';

// Previously Integrated Components
import { InteractiveChart } from '@/components/InteractiveChart';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { WorkoutStatsOverview } from '@/components/analytics/WorkoutStatsOverview';
import { ExerciseProgressChart } from '@/components/analytics/ExerciseProgressChart';
import { WorkoutHistoryCard } from '@/components/analytics/WorkoutHistoryCard';

const { width: screenWidth } = Dimensions.get('window');

interface ProgressMetric {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  category: 'strength' | 'endurance' | 'consistency' | 'volume';
}

interface GoalProgress {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  unit: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  color: string;
}

export default function ProgressScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'strength' | 'endurance' | 'consistency' | 'volume'>('all');
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  // Context Integration
  const { workouts, refreshHistory } = useWorkoutHistory();
  const { personalRecords } = usePersonalRecords();
  const { achievements, getUnlockedCount, getTotalAchievements } = useAchievements();
  const { currentStreak, longestStreak } = useStreakTracking();
  const { getWeeklyStats, getMonthlyStats, getYearlyStats, getTrendData } = useAnalytics(selectedTimeframe);

  // Progress Metrics with Enhanced Calculations
  const [progressMetrics] = useState<ProgressMetric[]>([
    {
      id: 'total_workouts',
      label: 'Total Workouts',
      current: workouts.length,
      target: 100,
      unit: 'workouts',
      color: DesignTokens.colors.primary[500],
      trend: 'up',
      trendValue: '+12 this month',
      category: 'consistency',
    },
    {
      id: 'current_streak',
      label: 'Current Streak',
      current: currentStreak,
      target: 30,
      unit: 'days',
      color: DesignTokens.colors.warning[500],
      trend: currentStreak > 0 ? 'up' : 'stable',
      trendValue: `${currentStreak > 0 ? '+' : ''}${currentStreak} days`,
      category: 'consistency',
    },
    {
      id: 'personal_records',
      label: 'Personal Records',
      current: personalRecords.length,
      target: 50,
      unit: 'PRs',
      color: DesignTokens.colors.success[500],
      trend: 'up',
      trendValue: '+3 this week',
      category: 'strength',
    },
    {
      id: 'total_volume',
      label: 'Total Volume',
      current: calculateTotalVolume(),
      target: 50000,
      unit: 'lbs',
      color: DesignTokens.colors.info[500],
      trend: 'up',
      trendValue: '+2.5k this month',
      category: 'volume',
    },
    {
      id: 'achievements',
      label: 'Achievements',
      current: getUnlockedCount(),
      target: getTotalAchievements(),
      unit: 'unlocked',
      color: DesignTokens.colors.secondary[500],
      trend: 'up',
      trendValue: '+2 this week',
      category: 'consistency',
    },
    {
      id: 'workout_frequency',
      label: 'Weekly Frequency',
      current: calculateWeeklyFrequency(),
      target: 5,
      unit: 'per week',
      color: DesignTokens.colors.error[500],
      trend: 'up',
      trendValue: '+0.5 avg',
      category: 'consistency',
    },
  ]);

  // Goal Progress with Enhanced Tracking
  const [goalProgress] = useState<GoalProgress[]>([
    {
      id: 'strength_goal',
      title: 'Strength Building',
      description: 'Increase total 1RM by 20%',
      progress: 65,
      target: 100,
      unit: '%',
      deadline: '2024-06-01',
      priority: 'high',
      category: 'Strength',
      color: DesignTokens.colors.primary[500],
    },
    {
      id: 'consistency_goal',
      title: '90-Day Streak',
      description: 'Maintain workout consistency',
      progress: currentStreak,
      target: 90,
      unit: 'days',
      deadline: '2024-05-15',
      priority: 'high',
      category: 'Consistency',
      color: DesignTokens.colors.warning[500],
    },
    {
      id: 'volume_goal',
      title: 'Volume Milestone',
      description: 'Reach 100k total volume',
      progress: (calculateTotalVolume() / 100000) * 100,
      target: 100,
      unit: '%',
      deadline: '2024-12-31',
      priority: 'medium',
      category: 'Volume',
      color: DesignTokens.colors.info[500],
    },
    {
      id: 'endurance_goal',
      title: 'Endurance Challenge',
      description: 'Complete 50 cardio sessions',
      progress: 32,
      target: 50,
      unit: 'sessions',
      deadline: '2024-08-01',
      priority: 'medium',
      category: 'Endurance',
      color: DesignTokens.colors.success[500],
    },
  ]);

  // Data Processing
  const stats = selectedTimeframe === 'week' ? getWeeklyStats() : 
                selectedTimeframe === 'month' ? getMonthlyStats() : 
                getYearlyStats();

  const filteredMetrics = selectedCategory === 'all' 
    ? progressMetrics 
    : progressMetrics.filter(metric => metric.category === selectedCategory);

  const overallProgress = calculateOverallProgress();

  useEffect(() => {
    // Auto-refresh data periodically
    const interval = setInterval(() => {
      if (!refreshing) {
        onRefresh();
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Refresh Handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshHistory();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Navigation Handlers
  const handleMetricPress = (metricId: string) => {
    setExpandedMetric(expandedMetric === metricId ? null : metricId);
  };

  const handleGoalPress = (goalId: string) => {
    router.push(`/goals/${goalId}`);
  };

  const handleViewDetailedAnalytics = () => {
    router.push('/analytics');
  };

  const handleExportData = () => {
    // Export functionality
  };

  const handleShareProgress = () => {
    // Share functionality
  };

  // Helper Functions
  function calculateTotalVolume(): number {
    return workouts.reduce((total, workout) => {
      return total + workout.exercises.reduce((exerciseTotal, exercise) => {
        return exerciseTotal + exercise.sets
          .filter(set => set.is_completed)
          .reduce((setTotal, set) => {
            return setTotal + ((set.actual_weight_kg || 0) * (set.actual_reps || 0));
          }, 0);
      }, 0);
    }, 0);
  }

  function calculateWeeklyFrequency(): number {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentWorkouts = workouts.filter(workout => 
      new Date(workout.started_at) > oneWeekAgo
    );
    return recentWorkouts.length;
  }

  function calculateOverallProgress(): number {
    const totalProgress = progressMetrics.reduce((sum, metric) => {
      return sum + (metric.current / metric.target) * 100;
    }, 0);
    return Math.min(100, totalProgress / progressMetrics.length);
  }

  function getDaysUntilDeadline(deadline: string): number {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  function formatDeadline(deadline: string): string {
    const days = getDaysUntilDeadline(deadline);
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    if (days <= 7) return `${days} days left`;
    if (days <= 30) return `${Math.ceil(days / 7)} weeks left`;
    return `${Math.ceil(days / 30)} months left`;
  }

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
        {/* Header with Overall Progress */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Your Progress</Text>
            <Text style={styles.headerSubtitle}>Track your fitness journey</Text>
          </View>

          {/* Overall Progress Circle - NEW */}
          <CircularProgressGradient
            progress={overallProgress}
            size={80}
            strokeWidth={8}
            showPercentage={true}
            showLabel={true}
            label="Overall"
            gradientColors={[DesignTokens.colors.primary[400], DesignTokens.colors.primary[600]]}
            glowEffect={true}
            pulseAnimation={overallProgress > 80}
          />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.timeframeSelector}>
            {(['week', 'month', 'year'] as const).map((timeframe) => (
              <TouchableOpacity
                key={timeframe}
                style={[
                  styles.timeframeButton,
                  selectedTimeframe === timeframe && styles.timeframeButtonActive,
                ]}
                onPress={() => setSelectedTimeframe(timeframe)}
              >
                <Text
                  style={[
                    styles.timeframeButtonText,
                    selectedTimeframe === timeframe && styles.timeframeButtonTextActive,
                  ]}
                >
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowDetailedView(!showDetailedView)}>
              {showDetailedView ? <EyeOff size={20} color={DesignTokens.colors.text.secondary} /> : <Eye size={20} color={DesignTokens.colors.text.secondary} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
              <Download size={20} color={DesignTokens.colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShareProgress}>
              <Share size={20} color={DesignTokens.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categoryFilter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['all', 'strength', 'endurance', 'consistency', 'volume'] as const).map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.categoryButtonTextActive,
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Progress Metrics Grid with Enhanced Indicators - NEW */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Progress Metrics</Text>
          
          <View style={styles.metricsGrid}>
            {filteredMetrics.map((metric) => (
              <TouchableOpacity
                key={metric.id}
                style={[
                  styles.metricCard,
                  expandedMetric === metric.id && styles.metricCardExpanded,
                ]}
                onPress={() => handleMetricPress(metric.id)}
              >
                <LinearGradient
                  colors={['#1a1a1a', '#2a2a2a']}
                  style={styles.metricGradient}
                >
                  {/* Metric Header */}
                  <View style={styles.metricHeader}>
                    <View style={styles.metricInfo}>
                      <Text style={styles.metricLabel}>{metric.label}</Text>
                      <Text style={styles.metricValue}>
                        {metric.current.toLocaleString()} {metric.unit}
                      </Text>
                    </View>
                    
                    {/* Circular Progress for Metric - NEW */}
                    <CircularProgressDashboard
                      progress={(metric.current / metric.target) * 100}
                      size={60}
                      strokeWidth={6}
                      color={metric.color}
                      showPercentage={false}
                      showLabel={false}
                      gradient={true}
                      gradientColors={[metric.color + '80', metric.color]}
                    />
                  </View>

                  {/* Progress Bar - NEW */}
                  <ProgressBarGradient
                    progress={(metric.current / metric.target) * 100}
                    height={8}
                    gradientColors={[metric.color + '80', metric.color]}
                    showPercentage={false}
                    animated={true}
                    glowEffect={true}
                    style={styles.metricProgressBar}
                  />

                  {/* Metric Footer */}
                  <View style={styles.metricFooter}>
                    <View style={styles.metricTarget}>
                      <Text style={styles.metricTargetText}>
                        Target: {metric.target.toLocaleString()} {metric.unit}
                      </Text>
                    </View>
                    
                    <View style={[styles.trendIndicator, { backgroundColor: metric.color + '20' }]}>
                      <TrendingUp size={12} color={metric.color} />
                      <Text style={[styles.trendText, { color: metric.color }]}>
                        {metric.trendValue}
                      </Text>
                    </View>
                  </View>

                  {/* Expanded Details */}
                  {expandedMetric === metric.id && showDetailedView && (
                    <View style={styles.metricExpanded}>
                      <View style={styles.expandedStats}>
                        <View style={styles.expandedStat}>
                          <Text style={styles.expandedStatLabel}>Progress</Text>
                          <Text style={styles.expandedStatValue}>
                            {Math.round((metric.current / metric.target) * 100)}%
                          </Text>
                        </View>
                        <View style={styles.expandedStat}>
                          <Text style={styles.expandedStatLabel}>Remaining</Text>
                          <Text style={styles.expandedStatValue}>
                            {Math.max(0, metric.target - metric.current).toLocaleString()}
                          </Text>
                        </View>
                        <View style={styles.expandedStat}>
                          <Text style={styles.expandedStatLabel}>Category</Text>
                          <Text style={styles.expandedStatValue}>
                            {metric.category.charAt(0).toUpperCase() + metric.category.slice(1)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Goal Progress Section with Enhanced Indicators - NEW */}
        <View style={styles.goalsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Goals</Text>
            <TouchableOpacity onPress={() => router.push('/goals')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {goalProgress.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={styles.goalCard}
              onPress={() => handleGoalPress(goal.id)}
            >
              <LinearGradient
                colors={['#1a1a1a', '#2a2a2a']}
                style={styles.goalGradient}
              >
                {/* Goal Header */}
                <View style={styles.goalHeader}>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalDescription}>{goal.description}</Text>
                  </View>
                  
                  <View style={styles.goalProgress}>
                    <Text style={styles.goalProgressText}>
                      {Math.round((goal.progress / goal.target) * 100)}%
                    </Text>
                    <Text style={styles.goalProgressLabel}>Complete</Text>
                  </View>
                </View>

                {/* Segmented Progress Bar - NEW */}
                <ProgressBarSegmented
                  progress={(goal.progress / goal.target) * 100}
                  height={12}
                  segments={10}
                  segmentGap={2}
                  color={goal.color}
                  backgroundColor={DesignTokens.colors.neutral[800]}
                  showPercentage={false}
                  animated={true}
                  style={styles.goalProgressBar}
                />

                {/* Goal Footer */}
                <View style={styles.goalFooter}>
                  <View style={styles.goalStats}>
                    <Text style={styles.goalStatText}>
                      {goal.progress} / {goal.target} {goal.unit}
                    </Text>
                  </View>
                  
                  <View style={styles.goalDeadline}>
                    <Clock size={12} color={DesignTokens.colors.text.tertiary} />
                    <Text style={styles.goalDeadlineText}>
                      {formatDeadline(goal.deadline)}
                    </Text>
                  </View>
                </View>

                {/* Priority Indicator */}
                <View style={[
                  styles.priorityIndicator,
                  { backgroundColor: goal.priority === 'high' ? DesignTokens.colors.error[500] : 
                                   goal.priority === 'medium' ? DesignTokens.colors.warning[500] : 
                                   DesignTokens.colors.success[500] }
                ]} />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Analytics Charts Section */}
        <View style={styles.analyticsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Analytics Overview</Text>
            <TouchableOpacity onPress={handleViewDetailedAnalytics}>
              <Text style={styles.viewAllText}>View Details</Text>
            </TouchableOpacity>
          </View>

          {/* Workout Stats Overview */}
          <WorkoutStatsOverview
            timeframe={selectedTimeframe}
            style={styles.statsOverview}
          />

          {/* Interactive Charts */}
          <View style={styles.chartsContainer}>
            <InteractiveChart
              data={getTrendData()}
              type="line"
              title="Progress Trend"
              height={200}
              style={styles.chart}
            />
            
            <AnalyticsChart
              timeframe={selectedTimeframe}
              chartType="volume"
              style={styles.chart}
            />
          </View>

          {/* Exercise Progress Charts */}
          <ExerciseProgressChart
            exercises={['Bench Press', 'Squat', 'Deadlift']}
            timeframe={selectedTimeframe}
            style={styles.exerciseChart}
          />
        </View>

        {/* Recent Workout History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          
          {workouts.slice(0, 5).map((workout) => (
            <WorkoutHistoryCard
              key={workout.id}
              workout={workout}
              onPress={() => router.push(`/workouts/${workout.id}`)}
              showProgressIndicators={true}
              style={styles.historyCard}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/analytics')}>
            <BarChart3 size={24} color={DesignTokens.colors.primary[500]} />
            <Text style={styles.quickActionText}>Detailed Analytics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/goals')}>
            <Target size={24} color={DesignTokens.colors.success[500]} />
            <Text style={styles.quickActionText}>Manage Goals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/achievements')}>
            <Trophy size={24} color={DesignTokens.colors.warning[500]} />
            <Text style={styles.quickActionText}>Achievements</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  headerTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  headerSubtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[1],
  },
  timeframeButton: {
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  timeframeButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  timeframeButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  timeframeButtonTextActive: {
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  actionButton: {
    padding: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
  },
  categoryFilter: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  categoryButton: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    marginRight: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
  },
  categoryButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  categoryButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  metricsSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[3],
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
  metricsGrid: {
    gap: DesignTokens.spacing[3],
  },
  metricCard: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  metricCardExpanded: {
    ...DesignTokens.shadow.lg,
  },
  metricGradient: {
    padding: DesignTokens.spacing[4],
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  metricValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  metricProgressBar: {
    marginBottom: DesignTokens.spacing[3],
  },
  metricFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricTarget: {
    flex: 1,
  },
  metricTargetText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
    gap: DesignTokens.spacing[1],
  },
  trendText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  metricExpanded: {
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
    paddingTop: DesignTokens.spacing[3],
    marginTop: DesignTokens.spacing[3],
  },
  expandedStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  expandedStat: {
    alignItems: 'center',
  },
  expandedStatLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    marginBottom: DesignTokens.spacing[1],
  },
  expandedStatValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  goalsSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  goalCard: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[3],
    ...DesignTokens.shadow.base,
    position: 'relative',
  },
  goalGradient: {
    padding: DesignTokens.spacing[4],
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[3],
  },
  goalInfo: {
    flex: 1,
    marginRight: DesignTokens.spacing[3],
  },
  goalTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  goalDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  goalProgress: {
    alignItems: 'center',
  },
  goalProgressText: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  goalProgressLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  goalProgressBar: {
    marginBottom: DesignTokens.spacing[3],
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalStats: {
    flex: 1,
  },
  goalStatText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  goalDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  goalDeadlineText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  priorityIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  analyticsSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  statsOverview: {
    marginBottom: DesignTokens.spacing[4],
  },
  chartsContainer: {
    gap: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[4],
  },
  chart: {
    marginBottom: DesignTokens.spacing[3],
  },
  exerciseChart: {
    marginBottom: DesignTokens.spacing[4],
  },
  historySection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  historyCard: {
    marginBottom: DesignTokens.spacing[3],
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
    backgroundColor: DesignTokens.colors.surface.primary,
    marginHorizontal: DesignTokens.spacing[5],
    borderRadius: DesignTokens.borderRadius.lg,
    marginBottom: DesignTokens.spacing[6],
  },
  quickActionButton: {
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  quickActionText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
