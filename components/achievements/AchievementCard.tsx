/**
 * Production-ready AchievementCard component with context integration
 * Integrates with achievement system and offline sync
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
import { Trophy, Lock, Star } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useAchievements } from '@/contexts/AchievementContext';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { ProgressBar } from '@/components/ui/ProgressBar';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  progress: number;
  target: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  icon?: string;
  reward?: {
    type: 'badge' | 'title' | 'feature';
    value: string;
  };
}

export interface AchievementCardProps {
  achievement: Achievement;
  onPress: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  style?: ViewStyle;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onPress,
  variant = 'default',
  style,
}) => {
  const { getAchievementProgress, isAchievementUnlocked } = useAchievements();
  const { isOnline, syncStatus } = useOfflineSync();

  const achievementProgress = getAchievementProgress(achievement.id);
  const isUnlocked = isAchievementUnlocked(achievement.id);
  const progressPercentage = (achievementProgress?.progress || achievement.progress) / achievement.target * 100;

  const getDifficultyColor = () => {
    switch (achievement.difficulty) {
      case 'Bronze':
        return ['#CD7F32', '#B8860B'];
      case 'Silver':
        return ['#C0C0C0', '#A8A8A8'];
      case 'Gold':
        return ['#FFD700', '#FFA500'];
      case 'Platinum':
        return ['#E5E4E2', '#B8B8B8'];
      default:
        return [DesignTokens.colors.primary[500], DesignTokens.colors.primary[600]];
    }
  };

  const getDifficultyIcon = () => {
    if (isUnlocked) {
      return <Trophy size={20} color="#FFFFFF" />;
    }
    if (progressPercentage > 0) {
      return <Star size={20} color="#FFFFFF" />;
    }
    return <Lock size={20} color="#FFFFFF" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const containerStyles = [
    styles.container,
    styles[`container_${variant}`],
    !isOnline && styles.offline,
    isUnlocked && styles.unlocked,
    style,
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={isUnlocked ? getDifficultyColor() : ['#4A4A4A', '#3A3A3A']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {getDifficultyIcon()}
          </View>
          
          <View style={styles.titleContainer}>
            <Text style={[styles.title, !isUnlocked && styles.lockedText]} numberOfLines={1}>
              {achievement.title}
            </Text>
            <Text style={[styles.category, !isUnlocked && styles.lockedText]}>
              {achievement.category} • {achievement.difficulty}
            </Text>
          </View>

          {syncStatus && (
            <View style={[styles.syncIndicator, styles[`syncIndicator_${syncStatus}`]]} />
          )}
        </View>

        <Text style={[styles.description, !isUnlocked && styles.lockedText]} numberOfLines={2}>
          {achievement.description}
        </Text>

        {variant !== 'compact' && (
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={progressPercentage}
              height={6}
              variant={isUnlocked ? 'success' : 'default'}
              animated={true}
              achievementId={achievement.id}
            />
            
            <View style={styles.progressText}>
              <Text style={[styles.progressLabel, !isUnlocked && styles.lockedText]}>
                {achievementProgress?.progress || achievement.progress} / {achievement.target}
              </Text>
              <Text style={[styles.progressPercentage, !isUnlocked && styles.lockedText]}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
          </View>
        )}

        {isUnlocked && achievement.unlockedAt && (
          <View style={styles.unlockedContainer}>
            <Text style={styles.unlockedText}>
              Unlocked {formatDate(achievement.unlockedAt)}
            </Text>
          </View>
        )}

        {achievement.reward && variant === 'detailed' && (
          <View style={styles.rewardContainer}>
            <Text style={styles.rewardLabel}>Reward:</Text>
            <Text style={styles.rewardText}>{achievement.reward.value}</Text>
          </View>
        )}

        {!isOnline && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>Cached</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.md,
    marginBottom: DesignTokens.spacing[3],
  },

  // Variants
  container_default: {
    minHeight: 140,
  },
  container_compact: {
    minHeight: 100,
    width: 200,
  },
  container_detailed: {
    minHeight: 180,
  },

  // States
  offline: {
    opacity: 0.8,
  },
  unlocked: {
    transform: [{ scale: 1.02 }],
  },

  gradient: {
    padding: DesignTokens.spacing[4],
    flex: 1,
    position: 'relative',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[3],
  },

  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    marginRight: DesignTokens.spacing[3],
  },

  titleContainer: {
    flex: 1,
  },

  title: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: DesignTokens.spacing[1],
  },

  category: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  description: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: DesignTokens.spacing[3],
  },

  lockedText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },

  progressContainer: {
    marginBottom: DesignTokens.spacing[2],
  },

  progressText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: DesignTokens.spacing[2],
  },

  progressLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  progressPercentage: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  unlockedContainer: {
    marginTop: DesignTokens.spacing[2],
  },

  unlockedText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
  },

  rewardContainer: {
    marginTop: DesignTokens.spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
  },

  rewardLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: DesignTokens.spacing[1],
  },

  rewardText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  syncIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  syncIndicator_synced: {
    backgroundColor: DesignTokens.colors.success[500],
  },
  syncIndicator_pending: {
    backgroundColor: DesignTokens.colors.warning[500],
  },
  syncIndicator_failed: {
    backgroundColor: DesignTokens.colors.error[500],
  },
  syncIndicator_offline: {
    backgroundColor: DesignTokens.colors.text.secondary,
  },

  offlineBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  offlineText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
