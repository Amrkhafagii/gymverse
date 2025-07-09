/**
 * Enhanced Quick Stats Card Component with Challenge Integration
 * Now displays both achievement and challenge progress hints
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
  Calendar, 
  Dumbbell, 
  Clock, 
  Award,
  Target,
  Trophy,
  Users,
  ChevronRight,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface QuickStatsCardProps {
  stats: {
    totalWorkouts: number;
    weeklyWorkouts: number;
    currentStreak: number;
    totalVolume: number;
    averageDuration: number;
    personalRecords: number;
    achievementsUnlocked: number;
    activeChallenges?: number;
  };
  trends: {
    workouts: 'up' | 'down' | 'stable';
    volume: 'up' | 'down' | 'stable';
    duration: 'up' | 'down' | 'stable';
  };
  onPress: () => void;
  achievementHints?: Array<{
    id: string;
    title: string;
    progress: number;
    category: string;
  }>;
  challengeHints?: Array<{
    id: string;
    title: string;
    progress: number;
    target: number;
    type: string;
  }>;
  style?: ViewStyle;
}

export const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
  stats,
  trends,
  onPress,
  achievementHints = [],
  challengeHints = [],
  style,
}) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} color={DesignTokens.colors.success[500]} />;
      case 'down':
        return <TrendingDown size={14} color={DesignTokens.colors.error[500]} />;
      default:
        return null;
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k`;
    return volume.toString();
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <TrendingUp size={24} color="#FFFFFF" />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.title}>Your Progress</Text>
              <Text style={styles.subtitle}>Weekly overview</Text>
            </View>
          </View>
          
          <ChevronRight size={20} color="rgba(255, 255, 255, 0.8)" />
        </View>

        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Calendar size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.statLabel}>This Week</Text>
              {getTrendIcon(trends.workouts)}
            </View>
            <Text style={styles.statValue}>{stats.weeklyWorkouts}</Text>
            <Text style={styles.statUnit}>workouts</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Dumbbell size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.statLabel}>Volume</Text>
              {getTrendIcon(trends.volume)}
            </View>
            <Text style={styles.statValue}>{formatVolume(stats.totalVolume)}</Text>
            <Text style={styles.statUnit}>lbs</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Clock size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.statLabel}>Avg Time</Text>
              {getTrendIcon(trends.duration)}
            </View>
            <Text style={styles.statValue}>{formatDuration(stats.averageDuration)}</Text>
            <Text style={styles.statUnit}>per workout</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Award size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.statLabel}>Goals</Text>
            </View>
            <Text style={styles.statValue}>
              {stats.achievementsUnlocked + (stats.activeChallenges || 0)}
            </Text>
            <Text style={styles.statUnit}>active</Text>
          </View>
        </View>

        {/* Progress Hints Section */}
        {(achievementHints.length > 0 || challengeHints.length > 0) && (
          <View style={styles.hintsSection}>
            <Text style={styles.hintsTitle}>Progress Highlights</Text>
            
            <View style={styles.hintsContainer}>
              {/* Achievement Hints */}
              {achievementHints.slice(0, 2).map((hint) => (
                <View key={hint.id} style={styles.hintItem}>
                  <View style={styles.hintHeader}>
                    <Trophy size={12} color={DesignTokens.colors.warning[300]} />
                    <Text style={styles.hintLabel} numberOfLines={1}>
                      {hint.title}
                    </Text>
                  </View>
                  <View style={styles.hintProgressBar}>
                    <View 
                      style={[
                        styles.hintProgressFill,
                        { 
                          width: `${hint.progress}%`,
                          backgroundColor: DesignTokens.colors.warning[300]
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.hintProgress}>
                    {Math.round(hint.progress)}% complete
                  </Text>
                </View>
              ))}

              {/* Challenge Hints */}
              {challengeHints.slice(0, 2).map((hint) => (
                <View key={hint.id} style={styles.hintItem}>
                  <View style={styles.hintHeader}>
                    <Target size={12} color={DesignTokens.colors.primary[300]} />
                    <Text style={styles.hintLabel} numberOfLines={1}>
                      {hint.title}
                    </Text>
                  </View>
                  <View style={styles.hintProgressBar}>
                    <View 
                      style={[
                        styles.hintProgressFill,
                        { 
                          width: `${(hint.progress / hint.target) * 100}%`,
                          backgroundColor: DesignTokens.colors.primary[300]
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.hintProgress}>
                    {hint.progress}/{hint.target} ({Math.round((hint.progress / hint.target) * 100)}%)
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Summary Stats */}
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.summaryLabel}>Total Workouts</Text>
          </View>
          
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{stats.currentStreak}</Text>
            <Text style={styles.summaryLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{stats.personalRecords}</Text>
            <Text style={styles.summaryLabel}>Personal Records</Text>
          </View>

          {stats.activeChallenges !== undefined && (
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValue}>{stats.activeChallenges}</Text>
              <Text style={styles.summaryLabel}>Active Challenges</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.md,
  },

  gradient: {
    padding: DesignTokens.spacing[4],
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },

  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
  },

  headerInfo: {
    flex: 1,
  },

  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: DesignTokens.spacing[1],
  },

  subtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[4],
  },

  statItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    flex: 1,
    minWidth: '45%',
  },

  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[2],
  },

  statLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
    flex: 1,
  },

  statValue: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: DesignTokens.spacing[1],
  },

  statUnit: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  hintsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[4],
  },

  hintsTitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: DesignTokens.spacing[3],
  },

  hintsContainer: {
    gap: DesignTokens.spacing[3],
  },

  hintItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: DesignTokens.borderRadius.sm,
    padding: DesignTokens.spacing[2],
  },

  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[2],
  },

  hintLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
    flex: 1,
  },

  hintProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: DesignTokens.spacing[1],
    overflow: 'hidden',
  },

  hintProgressFill: {
    height: '100%',
    borderRadius: 2,
  },

  hintProgress: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },

  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: DesignTokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },

  summaryStat: {
    alignItems: 'center',
  },

  summaryValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: DesignTokens.spacing[1],
  },

  summaryLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
