import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Target, TrendingUp, Award } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { CircularProgress } from '@/components/ui/CircularProgress';

interface AchievementStatsProps {
  totalAchievements: number;
  unlockedCount: number;
  totalPoints: number;
  categories: string[];
  progressStats: {
    completionRate: number;
    averageProgress: number;
    recentUnlocks: number;
  };
}

export const AchievementStats: React.FC<AchievementStatsProps> = ({
  totalAchievements,
  unlockedCount,
  totalPoints,
  categories,
  progressStats,
}) => {
  const completionRate = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[DesignTokens.colors.surface.secondary, DesignTokens.colors.surface.tertiary]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Achievement Statistics</Text>
          <Text style={styles.subtitle}>Your progress overview</Text>
        </View>

        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Completion Rate */}
          <View style={styles.statCard}>
            <CircularProgress
              progress={completionRate}
              size={60}
              strokeWidth={6}
              color={DesignTokens.colors.success[500]}
              showPercentage={true}
              showLabel={false}
            />
            <Text style={styles.statLabel}>Completion</Text>
            <Text style={styles.statValue}>{Math.round(completionRate)}%</Text>
          </View>

          {/* Total Points */}
          <View style={styles.statCard}>
            <View style={styles.iconContainer}>
              <Award size={24} color={DesignTokens.colors.warning[500]} />
            </View>
            <Text style={styles.statLabel}>Total Points</Text>
            <Text style={styles.statValue}>{totalPoints.toLocaleString()}</Text>
          </View>

          {/* Unlocked Count */}
          <View style={styles.statCard}>
            <View style={styles.iconContainer}>
              <Trophy size={24} color={DesignTokens.colors.primary[500]} />
            </View>
            <Text style={styles.statLabel}>Unlocked</Text>
            <Text style={styles.statValue}>{unlockedCount}/{totalAchievements}</Text>
          </View>

          {/* Recent Activity */}
          <View style={styles.statCard}>
            <View style={styles.iconContainer}>
              <TrendingUp size={24} color={DesignTokens.colors.success[500]} />
            </View>
            <Text style={styles.statLabel}>Recent</Text>
            <Text style={styles.statValue}>{progressStats.recentUnlocks}</Text>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoryList}>
            {categories.map((category, index) => (
              <View key={category} style={styles.categoryItem}>
                <Text style={styles.categoryName}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                <View style={styles.categoryProgress}>
                  <View 
                    style={[
                      styles.categoryProgressBar,
                      { 
                        width: `${Math.random() * 100}%`,
                        backgroundColor: DesignTokens.colors.primary[500]
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Progress Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <Target size={16} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.insightText}>
                Average progress: {progressStats.averageProgress.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.insightItem}>
              <TrendingUp size={16} color={DesignTokens.colors.success[500]} />
              <Text style={styles.insightText}>
                {progressStats.recentUnlocks} achievements unlocked recently
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[4],
    ...DesignTokens.shadow.base,
  },
  gradient: {
    padding: DesignTokens.spacing[4],
  },
  header: {
    marginBottom: DesignTokens.spacing[4],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  subtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[4],
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.primary,
    padding: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  iconContainer: {
    marginBottom: DesignTokens.spacing[2],
  },
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
    textAlign: 'center',
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: DesignTokens.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[3],
  },
  categoryList: {
    gap: DesignTokens.spacing[2],
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryName: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    flex: 1,
  },
  categoryProgress: {
    flex: 2,
    height: 6,
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: DesignTokens.borderRadius.full,
    overflow: 'hidden',
    marginLeft: DesignTokens.spacing[3],
  },
  categoryProgressBar: {
    height: '100%',
    borderRadius: DesignTokens.borderRadius.full,
  },
  insightsSection: {
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
    paddingTop: DesignTokens.spacing[4],
  },
  insightsList: {
    gap: DesignTokens.spacing[2],
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  insightText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
});
