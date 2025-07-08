import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Achievement } from '@/lib/achievementEngine';
import { useAchievementUtils } from '@/hooks/useAchievements';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  onPress?: () => void;
}

export function AchievementBadge({ 
  achievement, 
  size = 'medium', 
  showProgress = false,
  onPress 
}: AchievementBadgeProps) {
  const { getRarityColor, formatProgress } = useAchievementUtils();
  
  const sizeStyles = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  };

  const iconSizes = {
    small: 20,
    medium: 28,
    large: 36,
  };

  const textSizes = {
    small: 10,
    medium: 12,
    large: 14,
  };

  const rarityColor = getRarityColor(achievement.rarity);
  const progressPercentage = achievement.maxProgress > 0 
    ? Math.round((achievement.progress / achievement.maxProgress) * 100)
    : 0;

  const BadgeContent = () => (
    <View style={[
      styles.container,
      sizeStyles[size],
      { borderColor: rarityColor },
      !achievement.unlocked && styles.locked
    ]}>
      <View style={[styles.iconContainer, { backgroundColor: rarityColor }]}>
        <Text style={[styles.icon, { fontSize: iconSizes[size] }]}>
          {achievement.unlocked ? achievement.icon : '🔒'}
        </Text>
      </View>
      
      <Text style={[
        styles.name,
        { fontSize: textSizes[size] },
        !achievement.unlocked && styles.lockedText
      ]}>
        {achievement.name}
      </Text>
      
      <Text style={[
        styles.points,
        { fontSize: textSizes[size] - 1 },
        !achievement.unlocked && styles.lockedText
      ]}>
        {achievement.points} pts
      </Text>

      {showProgress && !achievement.unlocked && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${progressPercentage}%`,
                  backgroundColor: rarityColor
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {formatProgress(achievement.progress, achievement.maxProgress)}
          </Text>
        </View>
      )}

      {achievement.unlocked && achievement.unlockedAt && (
        <Text style={styles.unlockedDate}>
          {new Date(achievement.unlockedAt).toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <BadgeContent />
      </TouchableOpacity>
    );
  }

  return <BadgeContent />;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    padding: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locked: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  small: {
    width: 80,
    minHeight: 90,
  },
  medium: {
    width: 100,
    minHeight: 110,
  },
  large: {
    width: 120,
    minHeight: 130,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    color: 'white',
  },
  name: {
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 2,
    lineHeight: 14,
  },
  points: {
    color: '#F59E0B',
    fontWeight: '500',
    marginBottom: 4,
  },
  lockedText: {
    color: '#9CA3AF',
  },
  progressContainer: {
    width: '100%',
    marginTop: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'center',
  },
  unlockedDate: {
    fontSize: 8,
    color: '#10B981',
    textAlign: 'center',
    marginTop: 2,
  },
});
