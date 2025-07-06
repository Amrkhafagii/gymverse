import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Lock, Share, CheckCircle } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'strength' | 'endurance' | 'consistency' | 'milestone';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementCardProps {
  achievement: Achievement;
  onPress?: () => void;
  onShare?: () => void;
  variant?: 'grid' | 'list' | 'featured';
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onPress,
  onShare,
  variant = 'grid',
}) => {
  const getRarityColors = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return ['#6B7280', '#4B5563'];
      case 'rare':
        return ['#3B82F6', '#1D4ED8'];
      case 'epic':
        return ['#8B5CF6', '#7C3AED'];
      case 'legendary':
        return ['#F59E0B', '#D97706'];
      default:
        return ['#6B7280', '#4B5563'];
    }
  };

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'strength':
        return '💪';
      case 'endurance':
        return '🏃';
      case 'consistency':
        return '🔥';
      case 'milestone':
        return '🎯';
      default:
        return '🏆';
    }
  };

  const progressPercentage = achievement.progress && achievement.maxProgress 
    ? (achievement.progress / achievement.maxProgress) * 100 
    : 0;

  if (variant === 'featured') {
    return (
      <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={getRarityColors(achievement.rarity)}
          style={styles.featuredGradient}
        >
          {/* Celebration Effect */}
          <View style={styles.celebrationOverlay}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationEmoji}>✨</Text>
            <Text style={styles.celebrationEmoji}>🎊</Text>
          </View>

          {/* Content */}
          <View style={styles.featuredContent}>
            <View style={styles.featuredIcon}>
              <Text style={styles.categoryEmoji}>{getCategoryIcon(achievement.category)}</Text>
            </View>
            
            <Text style={styles.featuredTitle}>Achievement Unlocked!</Text>
            <Text style={styles.featuredName}>{achievement.name}</Text>
            <Text style={styles.featuredDescription}>{achievement.description}</Text>
            
            {onShare && (
              <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                <Share size={16} color="#FFFFFF" />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'list') {
    return (
      <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.8}>
        <View style={[styles.listIcon, { opacity: achievement.unlocked ? 1 : 0.5 }]}>
          <Text style={styles.categoryEmoji}>{getCategoryIcon(achievement.category)}</Text>
          {!achievement.unlocked && (
            <View style={styles.lockOverlay}>
              <Lock size={12} color={DesignTokens.colors.text.tertiary} />
            </View>
          )}
        </View>
        
        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <Text style={[styles.listName, { opacity: achievement.unlocked ? 1 : 0.7 }]}>
              {achievement.name}
            </Text>
            {achievement.unlocked && (
              <CheckCircle size={16} color={DesignTokens.colors.success[500]} />
            )}
          </View>
          
          <Text style={[styles.listDescription, { opacity: achievement.unlocked ? 0.8 : 0.5 }]}>
            {achievement.description}
          </Text>
          
          {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${progressPercentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {achievement.progress}/{achievement.maxProgress}
              </Text>
            </View>
          )}
          
          {achievement.unlocked && achievement.unlockedAt && (
            <Text style={styles.unlockedDate}>
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
        
        <View style={[styles.rarityIndicator, { backgroundColor: getRarityColors(achievement.rarity)[0] }]} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={achievement.unlocked ? getRarityColors(achievement.rarity) : ['#2a2a2a', '#1a1a1a']}
        style={styles.gridGradient}
      >
        <View style={[styles.gridIcon, { opacity: achievement.unlocked ? 1 : 0.5 }]}>
          <Text style={styles.categoryEmoji}>{getCategoryIcon(achievement.category)}</Text>
          {!achievement.unlocked && (
            <View style={styles.lockOverlay}>
              <Lock size={16} color={DesignTokens.colors.text.tertiary} />
            </View>
          )}
        </View>
        
        <Text style={[styles.gridName, { opacity: achievement.unlocked ? 1 : 0.7 }]} numberOfLines={2}>
          {achievement.name}
        </Text>
        
        {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress && (
          <View style={styles.gridProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.gridProgressText}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
        )}
        
        {achievement.unlocked && (
          <View style={styles.unlockedBadge}>
            <CheckCircle size={12} color={DesignTokens.colors.success[500]} />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Featured Card (for newly unlocked achievements)
  featuredCard: {
    width: '100%',
    minHeight: 200,
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[4],
    ...DesignTokens.shadow.xl,
  },
  featuredGradient: {
    flex: 1,
    position: 'relative',
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    opacity: 0.3,
  },
  celebrationEmoji: {
    fontSize: 40,
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignTokens.spacing[6],
  },
  featuredIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  featuredTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[2],
  },
  featuredName: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  featuredDescription: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: DesignTokens.spacing[4],
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing[2],
  },
  shareButtonText: {
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  // List Card
  listCard: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[3],
    position: 'relative',
    ...DesignTokens.shadow.base,
  },
  listIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: DesignTokens.colors.surface.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing[3],
    position: 'relative',
  },
  listContent: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[1],
  },
  listName: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    flex: 1,
  },
  listDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[2],
  },
  unlockedDate: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.success[500],
  },
  rarityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: DesignTokens.borderRadius.lg,
    borderBottomLeftRadius: DesignTokens.borderRadius.lg,
  },

  // Grid Card
  gridCard: {
    flex: 1,
    margin: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  gridGradient: {
    flex: 1,
    padding: DesignTokens.spacing[4],
    alignItems: 'center',
    minHeight: 120,
    position: 'relative',
  },
  gridIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
    position: 'relative',
  },
  gridName: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  gridProgress: {
    width: '100%',
    alignItems: 'center',
  },
  gridProgressText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  unlockedBadge: {
    position: 'absolute',
    top: DesignTokens.spacing[2],
    right: DesignTokens.spacing[2],
  },

  // Common Elements
  categoryEmoji: {
    fontSize: 24,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: DesignTokens.spacing[2],
  },
  progressBar: {
    height: 6,
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: 3,
    marginBottom: DesignTokens.spacing[1],
  },
  progressFill: {
    height: '100%',
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 3,
  },
  progressText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
});
