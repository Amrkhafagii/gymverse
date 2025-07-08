import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Dumbbell,
  Zap,
  Award,
  Activity,
  BarChart3,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';

const { width } = Dimensions.get('window');

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
  color: string;
}

function StatCard({ title, value, subtitle, icon, trend, color }: StatCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp size={14} color={DesignTokens.colors.success[500]} />;
      case 'down':
        return <TrendingDown size={14} color={DesignTokens.colors.error[500]} />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!trend) return DesignTokens.colors.text.secondary;
    
    switch (trend.direction) {
      case 'up':
        return DesignTokens.colors.success[500];
      case 'down':
        return DesignTokens.colors.error[500];
      default:
        return DesignTokens.colors.text.secondary;
    }
  };

  return (
    <View style={styles.statCard}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.statCardGradient}
      >
        <View style={styles.statCardHeader}>
          <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
            {icon}
          </View>
          {trend && (
            <View style={styles.trendContainer}>
              {getTrendIcon()}
              <Text style={[styles.trendText, { color: getTrendColor() }]}>
                {trend.percentage.toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        
        {subtitle && (
          <Text style={styles.statSubtitle}>{subtitle}</Text>
        )}
      </LinearGradient>
    </View>
  );
}

export function WorkoutStatsOverview() {
  const { stats, workouts, getWorkoutTrends, isLoading } = useWorkoutHistory();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading stats...</Text>
      </View>
    );
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatWeight = (kg: number): string => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)}k kg`;
    }
    return `${Math.round(kg)} kg`;
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return null;
    
    const percentage = ((current - previous) / previous) * 100;
    
    return {
      direction: percentage > 0 ? 'up' as const : percentage < 0 ? 'down' as const : 'stable' as const,
      percentage: Math.abs(percentage),
    };
  };

  // Calculate trends (simplified - comparing this month vs last month)
  const thisMonth = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const thisMonthWorkouts = workouts.filter(w => {
    if (!w.completed_at) return false;
    const date = new Date(w.completed_at);
    return date.getMonth() === thisMonth.getMonth() && date.getFullYear() === thisMonth.getFullYear();
  });
  
  const lastMonthWorkouts = workouts.filter(w => {
    if (!w.completed_at) return false;
    const date = new Date(w.completed_at);
    return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
  });

  const thisMonthCount = thisMonthWorkouts.length;
  const lastMonthCount = lastMonthWorkouts.length;
  const workoutTrend = calculateTrend(thisMonthCount, lastMonthCount);

  const thisMonthDuration = thisMonthWorkouts.reduce((sum, w) => sum + w.total_duration_seconds, 0);
  const lastMonthDuration = lastMonthWorkouts.reduce((sum, w) => sum + w.total_duration_seconds, 0);
  const durationTrend = calculateTrend(thisMonthDuration, lastMonthDuration);

  const trends = getWorkoutTrends(selectedTimeframe);

  const TimeframeButton = ({ timeframe, label }: { timeframe: 'week' | 'month' | 'year'; label: string }) => (
    <TouchableOpacity
      style={[
        styles.timeframeButton,
        selectedTimeframe === timeframe && styles.timeframeButtonActive
      ]}
      onPress={() => setSelectedTimeframe(timeframe)}
    >
      <Text style={[
        styles.timeframeText,
        selectedTimeframe === timeframe && styles.timeframeTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Workout Analytics</Text>
        <Text style={styles.subtitle}>Your fitness journey insights</Text>
      </View>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Workouts"
          value={stats.totalWorkouts.toString()}
          subtitle={`${stats.workoutsThisMonth} this month`}
          icon={<Calendar size={20} color="#4ECDC4" />}
          trend={workoutTrend}
          color="#4ECDC4"
        />
        
        <StatCard
          title="Total Duration"
          value={formatDuration(stats.totalDuration)}
          subtitle={`Avg: ${formatDuration(stats.averageWorkoutDuration)}`}
          icon={<Clock size={20} color="#9E7FFF" />}
          trend={durationTrend}
          color="#9E7FFF"
        />
        
        <StatCard
          title="Total Volume"
          value={formatWeight(stats.totalWeight)}
          subtitle={`${stats.totalSets} sets completed`}
          icon={<Dumbbell size={20} color="#FF6B35" />}
          color="#FF6B35"
        />
        
        <StatCard
          title="Total Reps"
          value={stats.totalReps.toLocaleString()}
          subtitle="All exercises"
          icon={<Target size={20} color="#10B981" />}
          color="#10B981"
        />
      </View>

      {/* Streak Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consistency</Text>
        <View style={styles.streakContainer}>
          <LinearGradient
            colors={['#1a1a1a', '#2a2a2a']}
            style={styles.streakCard}
          >
            <View style={styles.streakHeader}>
              <View style={styles.streakIcon}>
                <Zap size={24} color="#F59E0B" />
              </View>
              <View style={styles.streakInfo}>
                <Text style={styles.streakValue}>{stats.currentStreak}</Text>
                <Text style={styles.streakLabel}>Current Streak</Text>
              </View>
            </View>
            
            <View style={styles.streakStats}>
              <View style={styles.streakStat}>
                <Text style={styles.streakStatValue}>{stats.longestStreak}</Text>
                <Text style={styles.streakStatLabel}>Best Streak</Text>
              </View>
              <View style={styles.streakStat}>
                <Text style={styles.streakStatValue}>{stats.workoutsThisWeek}</Text>
                <Text style={styles.streakStatLabel}>This Week</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Trends Chart */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Workout Trends</Text>
          <View style={styles.timeframeSelector}>
            <TimeframeButton timeframe="week" label="Week" />
            <TimeframeButton timeframe="month" label="Month" />
            <TimeframeButton timeframe="year" label="Year" />
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          <LinearGradient
            colors={['#1a1a1a', '#2a2a2a']}
            style={styles.chartCard}
          >
            <View style={styles.chartHeader}>
              <BarChart3 size={20} color={DesignTokens.colors.primary[500]} />
              <Text style={styles.chartTitle}>Duration Trends</Text>
            </View>
            
            {/* Simple bar chart representation */}
            <View style={styles.barsContainer}>
              {trends.data.map((value, index) => {
                const maxValue = Math.max(...trends.data);
                const height = maxValue > 0 ? (value / maxValue) * 80 : 0;
                
                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      <View 
                        style={[
                          styles.bar,
                          { 
                            height: height,
                            backgroundColor: DesignTokens.colors.primary[500]
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>
                      {trends.labels[index]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Favorite Exercises */}
      {stats.favoriteExercises.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Exercises</Text>
          <View style={styles.exercisesContainer}>
            {stats.favoriteExercises.slice(0, 5).map((exercise, index) => (
              <LinearGradient
                key={exercise.name}
                colors={['#1a1a1a', '#2a2a2a']}
                style={styles.exerciseCard}
              >
                <View style={styles.exerciseRank}>
                  <Text style={styles.exerciseRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseCount}>{exercise.count} sessions</Text>
                </View>
                <Activity size={16} color={DesignTokens.colors.primary[500]} />
              </LinearGradient>
            ))}
          </View>
        </View>
      )}

      {/* Recent PRs */}
      {stats.recentPRs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Personal Records</Text>
          <View style={styles.prsContainer}>
            {stats.recentPRs.slice(0, 3).map((pr, index) => (
              <LinearGradient
                key={index}
                colors={['#1a1a1a', '#2a2a2a']}
                style={styles.prCard}
              >
                <View style={styles.prIcon}>
                  <Award size={20} color="#F59E0B" />
                </View>
                <View style={styles.prInfo}>
                  <Text style={styles.prExercise}>{pr.exercise}</Text>
                  <Text style={styles.prValue}>
                    {pr.value} {pr.type === 'weight' ? 'kg' : pr.type}
                  </Text>
                  <Text style={styles.prDate}>
                    {new Date(pr.date).toLocaleDateString()}
                  </Text>
                </View>
              </LinearGradient>
            ))}
          </View>
        </View>
      )}
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
  },
  loadingText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  header: {
    padding: DesignTokens.spacing[5],
    paddingBottom: DesignTokens.spacing[4],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  subtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: DesignTokens.spacing[5],
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[6],
  },
  statCard: {
    width: (width - 40 - 12) / 2,
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  statCardGradient: {
    padding: DesignTokens.spacing[4],
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  trendText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  statTitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  statSubtitle: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  section: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.colors.surface.tertiary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[1],
  },
  timeframeButton: {
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  timeframeButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  timeframeText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  timeframeTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  streakContainer: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  streakCard: {
    padding: DesignTokens.spacing[4],
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F59E0B20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignTokens.spacing[3],
  },
  streakInfo: {
    flex: 1,
  },
  streakValue: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  streakLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: DesignTokens.spacing[4],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
  },
  streakStat: {
    alignItems: 'center',
  },
  streakStatValue: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  streakStatLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  chartContainer: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  chartCard: {
    padding: DesignTokens.spacing[4],
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[4],
  },
  chartTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  bar: {
    width: 20,
    borderRadius: 2,
    minHeight: 2,
  },
  barLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  exercisesContainer: {
    gap: DesignTokens.spacing[3],
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    ...DesignTokens.shadow.base,
  },
  exerciseRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignTokens.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignTokens.spacing[3],
  },
  exerciseRankText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginBottom: DesignTokens.spacing[1],
  },
  exerciseCount: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  prsContainer: {
    gap: DesignTokens.spacing[3],
  },
  prCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    ...DesignTokens.shadow.base,
  },
  prIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignTokens.spacing[3],
  },
  prInfo: {
    flex: 1,
  },
  prExercise: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginBottom: DesignTokens.spacing[1],
  },
  prValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  prDate: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
});
