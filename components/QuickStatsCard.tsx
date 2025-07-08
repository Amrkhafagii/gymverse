/**
 * QuickStatsCard - Previously unused, now integrated into home screen
 * Displays comprehensive workout statistics with trends
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Dumbbell,
  Clock,
  Calendar,
  Award,
  Target,
  Zap,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

export interface WorkoutStats {
  totalWorkouts: number;
  weeklyWorkouts: number;
  currentStreak: number;
  totalVolume: number;
  averageDuration: number;
  personalRecords: number;
}

export interface TrendData {
  workouts: { direction: 'up' | 'down' | 'stable'; change: string };
  volume: { direction: 'up' | 'down' | 'stable'; change: string };
  duration: { direction: 'up' | 'down' | 'stable'; change: string };
}

export interface QuickStatsCardProps {
  stats: WorkoutStats;
  trends: TrendData;
  onPress: () => void;
  style?: ViewStyle;
}

export const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
  stats,
  trends,
  onPress,
  style,
}) => {
  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <TrendingUp size={12} color={DesignTokens.colors.success[500]} />;
      case 'down':
        return <TrendingDown size={12} color={DesignTokens.colors.error[500]} />;
      default:
        return <Minus size={12} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return DesignTokens.colors.success[500];
      case 'down':
        return DesignTokens.colors.error[500];
      default:
        return DesignTokens.colors.text.secondary;
    }
  };

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={['#1f2937', '#111827']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Target size={20} color={DesignTokens.colors.primary[500]} />
        </View>

        <View style={styles.statsGrid}>
          {/* Total Workouts */}
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Calendar size={16} color={DesignTokens.colors.primary[500]} />
              <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
            </View>
            <Text style={styles.statLabel}>Total Workouts</Text>
            <View style={styles.trendContainer}>
              {getTrendIcon(trends.workouts.direction)}
              <Text style={[styles.trendText, { color: getTrendColor(trends.workouts.direction) }]}>
                {trends.workouts.change}
              </Text>
            </View>
          </View>

          {/* Weekly Workouts */}
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Zap size={16} color={DesignTokens.colors.warning[500]} />
              <Text style={styles.statValue}>{stats.weeklyWorkouts}</Text>
            </View>
            <Text style={styles.statLabel}>This Week</Text>
            <View style={styles.trendContainer}>
              {getTrendIcon(trends.workouts.direction)}
              <Text style={[styles.trendText, { color: getTrendColor(trends.workouts.direction) }]}>
                {trends.workouts.change}
              </Text>
            </View>
          </View>

          {/* Total Volume */}
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Dumbbell size={16} color={DesignTokens.colors.success[500]} />
              <Text style={styles.statValue}>{formatVolume(stats.totalVolume)}</Text>
            </View>
            <Text style={styles.statLabel}>Total Volume</Text>
            <View style={styles.trendContainer}>
              {getTrendIcon(trends.volume.direction)}
              <Text style={[styles.trendText, { color: getTrendColor(trends.volume.direction) }]}>
                {trends.volume.change}
              </Text>
            </View>
          </View>

          {/* Average Duration */}
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Clock size={16} color={DesignTokens.colors.error[500]} />
              <Text style={styles.statValue}>{formatDuration(stats.averageDuration)}</Text>
            </View>
            <Text style={styles.statLabel}>Avg Duration</Text>
            <View style={styles.trendContainer}>
              {getTrendIcon(trends.duration.direction)}
              <Text style={[styles.trendText, { color: getTrendColor(trends.duration.direction) }]}>
                {trends.duration.change}
              </Text>
            </View>
          </View>

          {/* Personal Records */}
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Award size={16} color="#FFD700" />
              <Text style={styles.statValue}>{stats.personalRecords}</Text>
            </View>
            <Text style={styles.statLabel}>Personal Records</Text>
            <Text style={styles.prText}>This Month</Text>
          </View>

          {/* Current Streak */}
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <div style={styles.streakIcon}>🔥</div>
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
            </View>
            <Text style={styles.statLabel}>Day Streak</Text>
            <Text style={styles.streakText}>Keep it up!</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Tap to view detailed analytics</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    ...DesignTokens.shadow.lg,
  },

  gradient: {
    padding: DesignTokens.spacing[5],
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },

  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[4],
  },

  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing[2],
  },

  statValue: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },

  statLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
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

  prText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#FFD700',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  streakIcon: {
    fontSize: 16,
  },

  streakText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.success[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  footer: {
    alignItems: 'center',
    paddingTop: DesignTokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },

  footerText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    fontStyle: 'italic',
  },
});
