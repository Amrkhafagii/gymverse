/**
 * Achievement Progress Component
 * Shows overall achievement completion with visual progress
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Star, Target } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface Achievement {
  id: string;
  name: string;
  icon: string;
  rarity: string;
  unlockedAt: string;
}

interface AchievementProgressProps {
  current: number;
  total: number;
  recentUnlocks: Achievement[];
  onViewAll: () => void;
}

export const AchievementProgress: React.FC<AchievementProgressProps> = ({
  current,
  total,
  recentUnlocks,
  onViewAll,
}) => {
  const progressPercentage = (current / total) * 100;
  
  const getProgressColor = () => {
    if (progressPercentage >= 80) return ['#10B981', '#059669'];
    if (progressPercentage >= 60) return ['#F59E0B', '#D97706'];
    if (progressPercentage >= 40) return ['#3B82F6', '#1D4ED8'];
    return ['#6B7280', '#4B5563'];
  };

  const getProgressMessage = () => {
    if (progressPercentage >= 90) return 'Achievement Master!';
    if (progressPercentage >= 75) return 'Almost there!';
    if (progressPercentage >= 50) return 'Great progress!';
    if (progressPercentage >= 25) return 'Keep going!';
    return 'Just getting started!';
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={getProgressColor()} style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Trophy size={24} color="#FFFFFF" />
          </View>
          
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {current} of {total} Unlocked
            </Text>
            <Text style={styles.progressMessage}>
              {getProgressMessage()}
            </Text>
          </View>
          
          <View style={styles.percentageContainer}>
            <Text style={styles.percentageText}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
        </View>

        {/* Recent Unlocks */}
        {recentUnlocks.length > 0 && (
          <View style={styles.recentUnlocks}>
            <Text style={styles.recentTitle}>Recently Unlocked:</Text>
            <View style={styles.recentList}>
              {recentUnlocks.map((achievement, index) => (
                <View key={achievement.id} style={styles.recentItem}>
                  <Text style={styles.recentIcon}>{achievement.icon}</Text>
                  <Text style={styles.recentName} numberOfLines={1}>
                    {achievement.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton} onPress={onViewAll}>
          <Text style={styles.actionText}>View All Achievements</Text>
          <Target size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
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
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },

  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    marginRight: DesignTokens.spacing[3],
  },

  progressInfo: {
    flex: 1,
  },

  progressText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: DesignTokens.spacing[1],
  },

  progressMessage: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  percentageContainer: {
    alignItems: 'center',
  },

  percentageText: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  progressBarContainer: {
    marginBottom: DesignTokens.spacing[3],
  },

  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },

  recentUnlocks: {
    marginBottom: DesignTokens.spacing[3],
  },

  recentTitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: DesignTokens.spacing[2],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  recentList: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },

  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
    maxWidth: 100,
  },

  recentIcon: {
    fontSize: 14,
    marginRight: DesignTokens.spacing[1],
  },

  recentName: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.medium,
    flex: 1,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing[2],
  },

  actionText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
});
