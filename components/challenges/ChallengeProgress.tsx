/**
 * Challenge Progress Component
 * Shows overall progress across all active challenges
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, TrendingUp, Calendar, Award, ChevronRight } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface Challenge {
  id: string;
  title: string;
  progress: number;
  target: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  endDate: string;
  reward: number;
}

interface ChallengeProgressProps {
  activeChallenges: Challenge[];
  onViewDetails: (challengeId: string) => void;
}

export const ChallengeProgress: React.FC<ChallengeProgressProps> = ({
  activeChallenges,
  onViewDetails,
}) => {
  const getTotalProgress = () => {
    if (activeChallenges.length === 0) return 0;
    const totalProgress = activeChallenges.reduce((sum, challenge) => 
      sum + (challenge.progress / challenge.target), 0
    );
    return (totalProgress / activeChallenges.length) * 100;
  };

  const getTotalRewards = () => {
    return activeChallenges.reduce((sum, challenge) => sum + challenge.reward, 0);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return DesignTokens.colors.success[500];
      case 'intermediate':
        return DesignTokens.colors.warning[500];
      case 'advanced':
        return DesignTokens.colors.error[500];
      default:
        return DesignTokens.colors.text.secondary;
    }
  };

  const getProgressColor = (progress: number, target: number) => {
    const percentage = (progress / target) * 100;
    if (percentage >= 80) return ['#10B981', '#059669'];
    if (percentage >= 60) return ['#F59E0B', '#D97706'];
    if (percentage >= 40) return ['#3B82F6', '#1D4ED8'];
    return ['#6B7280', '#4B5563'];
  };

  if (activeChallenges.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Target size={48} color={DesignTokens.colors.text.secondary} />
        <Text style={styles.emptyTitle}>No Active Challenges</Text>
        <Text style={styles.emptyDescription}>
          Join a challenge to start tracking your progress and earn rewards!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Overall Progress Header */}
      <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Target size={24} color="#FFFFFF" />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Challenge Progress</Text>
              <Text style={styles.headerSubtitle}>
                {activeChallenges.length} active challenge{activeChallenges.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <Text style={styles.progressPercentage}>
              {Math.round(getTotalProgress())}%
            </Text>
            <Text style={styles.progressLabel}>Complete</Text>
          </View>
        </View>

        {/* Overall Progress Bar */}
        <View style={styles.overallProgressBar}>
          <View 
            style={[
              styles.overallProgressFill,
              { width: `${getTotalProgress()}%` }
            ]} 
          />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Award size={16} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.statText}>{getTotalRewards()} pts</Text>
            <Text style={styles.statLabel}>Total Rewards</Text>
          </View>
          
          <View style={styles.stat}>
            <TrendingUp size={16} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.statText}>
              {activeChallenges.filter(c => (c.progress / c.target) > 0.5).length}
            </Text>
            <Text style={styles.statLabel}>On Track</Text>
          </View>
          
          <View style={styles.stat}>
            <Calendar size={16} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.statText}>
              {Math.min(...activeChallenges.map(c => getDaysRemaining(c.endDate)))}
            </Text>
            <Text style={styles.statLabel}>Days Left</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Individual Challenge Progress */}
      <View style={styles.challengesList}>
        <Text style={styles.listTitle}>Individual Progress</Text>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {activeChallenges.map((challenge) => {
            const progressPercentage = (challenge.progress / challenge.target) * 100;
            const daysRemaining = getDaysRemaining(challenge.endDate);
            
            return (
              <TouchableOpacity
                key={challenge.id}
                style={styles.challengeItem}
                onPress={() => onViewDetails(challenge.id)}
                activeOpacity={0.8}
              >
                <View style={styles.challengeHeader}>
                  <View style={styles.challengeInfo}>
                    <Text style={styles.challengeTitle} numberOfLines={1}>
                      {challenge.title}
                    </Text>
                    <View style={styles.challengeMeta}>
                      <View style={[
                        styles.difficultyBadge,
                        { backgroundColor: getDifficultyColor(challenge.difficulty) }
                      ]}>
                        <Text style={styles.difficultyText}>
                          {challenge.difficulty.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.categoryText}>{challenge.category}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.challengeStats}>
                    <Text style={styles.progressText}>
                      {challenge.progress}/{challenge.target}
                    </Text>
                    <Text style={styles.daysText}>
                      {daysRemaining} days left
                    </Text>
                  </View>
                  
                  <ChevronRight size={20} color={DesignTokens.colors.text.secondary} />
                </View>

                {/* Progress Bar */}
                <View style={styles.challengeProgressContainer}>
                  <LinearGradient
                    colors={getProgressColor(challenge.progress, challenge.target)}
                    style={styles.challengeProgressBar}
                  >
                    <View 
                      style={[
                        styles.challengeProgressFill,
                        { width: `${Math.min(progressPercentage, 100)}%` }
                      ]} 
                    />
                  </LinearGradient>
                  
                  <Text style={styles.challengeProgressPercentage}>
                    {Math.round(progressPercentage)}%
                  </Text>
                </View>

                {/* Reward Info */}
                <View style={styles.rewardInfo}>
                  <Award size={14} color={DesignTokens.colors.warning[500]} />
                  <Text style={styles.rewardText}>
                    {challenge.reward} points reward
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.md,
  },

  headerGradient: {
    padding: DesignTokens.spacing[4],
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    marginRight: DesignTokens.spacing[3],
  },

  headerInfo: {
    flex: 1,
  },

  headerTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: DesignTokens.spacing[1],
  },

  headerSubtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  headerRight: {
    alignItems: 'center',
  },

  progressPercentage: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  progressLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  overallProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: DesignTokens.spacing[4],
    overflow: 'hidden',
  },

  overallProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  stat: {
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },

  statText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  statLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  challengesList: {
    padding: DesignTokens.spacing[4],
  },

  listTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[3],
  },

  challengeItem: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[3],
  },

  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },

  challengeInfo: {
    flex: 1,
    marginRight: DesignTokens.spacing[3],
  },

  challengeTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },

  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },

  difficultyBadge: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  difficultyText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  categoryText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textTransform: 'capitalize',
  },

  challengeStats: {
    alignItems: 'flex-end',
    marginRight: DesignTokens.spacing[2],
  },

  progressText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },

  daysText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },

  challengeProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[2],
  },

  challengeProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: 3,
    overflow: 'hidden',
  },

  challengeProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },

  challengeProgressPercentage: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    minWidth: 35,
    textAlign: 'right',
  },

  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },

  rewardText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  emptyContainer: {
    alignItems: 'center',
    padding: DesignTokens.spacing[6],
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
  },

  emptyTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[2],
  },

  emptyDescription: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
