/**
 * AchievementBadge - Previously unused, now integrated into home screen
 * Displays achievement notifications and progress indicators
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Star, Lock, CheckCircle } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

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
}

export interface AchievementBadgeProps {
  achievement: Achievement;
  onPress: () => void;
  variant?: 'notification' | 'compact' | 'detailed';
  showProgress?: boolean;
  animated?: boolean;
  style?: ViewStyle;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  onPress,
  variant = 'notification',
  showProgress = false,
  animated = false,
  style,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated && achievement.isUnlocked) {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [achievement.isUnlocked, animated]);

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

  const getIcon = () => {
    if (achievement.isUnlocked) {
      return <Trophy size={variant === 'compact' ? 16 : 20} color="#FFFFFF" />;
    }
    if (achievement.progress > 0) {
      return <Star size={variant === 'compact' ? 16 : 20} color="#FFFFFF" />;
    }
    return <Lock size={variant === 'compact' ? 16 : 20} color="#FFFFFF" />;
  };

  const progressPercentage = (achievement.progress / achievement.target) * 100;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (variant === 'compact') {
    return (
      <Animated.View style={[{ transform: [{ scale: animatedValue }] }, style]}>
        <TouchableOpacity style={styles.compactContainer} onPress={onPress}>
          <LinearGradient
            colors={achievement.isUnlocked ? getDifficultyColor() : ['#4A4A4A', '#3A3A3A']}
            style={styles.compactGradient}
          >
            {getIcon()}
            <Text style={styles.compactTitle} numberOfLines={1}>
              {achievement.title}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale: animatedValue }] }, style]}>
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={achievement.isUnlocked ? getDifficultyColor() : ['#374151', '#1F2937']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              {getIcon()}
            </View>
            
            <View style={styles.content}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, !achievement.isUnlocked && styles.lockedText]}>
                  {achievement.title}
                </Text>
                {achievement.isUnlocked && (
                  <CheckCircle size={16} color="#FFFFFF" />
                )}
              </View>
              
              <Text style={[styles.category, !achievement.isUnlocked && styles.lockedText]}>
                {achievement.category} • {achievement.difficulty}
              </Text>
              
              {variant === 'detailed' && (
                <Text style={[styles.description, !achievement.isUnlocked && styles.lockedText]} numberOfLines={2}>
                  {achievement.description}
                </Text>
              )}
            </View>

            <View style={styles.statusContainer}>
              {achievement.isUnlocked && achievement.unlockedAt && (
                <Text style={styles.unlockedDate}>
                  {formatDate(achievement.unlockedAt)}
                </Text>
              )}
              
              {!achievement.isUnlocked && showProgress && (
                <Text style={styles.progressText}>
                  {Math.round(progressPercentage)}%
                </Text>
              )}
            </View>
          </View>

          {showProgress && !achievement.isUnlocked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progressPercentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressLabel}>
                {achievement.progress} / {achievement.target}
              </Text>
            </View>
          )}

          {achievement.isUnlocked && (
            <View style={styles.unlockedBanner}>
              <Text style={styles.unlockedText}>Achievement Unlocked!</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.md,
    marginBottom: DesignTokens.spacing[2],
  },

  compactContainer: {
    width: 120,
    height: 60,
    borderRadius: DesignTokens.borderRadius.md,
    overflow: 'hidden',
    ...DesignTokens.shadow.sm,
  },

  gradient: {
    padding: DesignTokens.spacing[4],
  },

  compactGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing[2],
    padding: DesignTokens.spacing[2],
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    marginRight: DesignTokens.spacing[3],
  },

  content: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing[1],
  },

  title: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    flex: 1,
    marginRight: DesignTokens.spacing[2],
  },

  compactTitle: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: '#FFFFFF',
    flex: 1,
  },

  category: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: DesignTokens.spacing[1],
  },

  description: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },

  lockedText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },

  statusContainer: {
    alignItems: 'flex-end',
  },

  unlockedDate: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  progressText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  progressContainer: {
    marginTop: DesignTokens.spacing[3],
  },

  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[1],
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },

  progressLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  unlockedBanner: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderBottomLeftRadius: DesignTokens.borderRadius.md,
  },

  unlockedText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
});
