import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Lock,
  Share2,
  Trophy,
  Star,
  Crown,
  Sparkles,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { Achievement, AchievementRarity } from '@/types/achievement';
import { CircularProgress } from '@/components/ui/CircularProgress';

interface AchievementCardProps {
  achievement: Achievement;
  variant?: 'default' | 'compact' | 'featured';
  showProgress?: boolean;
  onPress?: () => void;
  onShare?: () => void;
  animated?: boolean;
}

export function AchievementCard({
  achievement,
  variant = 'default',
  showProgress = true,
  onPress,
  onShare,
  animated = false,
}: AchievementCardProps) {
  const getRarityColors = (rarity: AchievementRarity): string[] => {
    switch (rarity) {
      case 'common':
        return ['#6b7280', '#4b5563'];
      case 'rare':
        return ['#3b82f6', '#2563eb'];
      case 'epic':
        return ['#8b5cf6', '#7c3aed'];
      case 'legendary':
        return ['#f59e0b', '#d97706'];
      default:
        return ['#6b7280', '#4b5563'];
    }
  };

  const getRarityIcon = (rarity: AchievementRarity) => {
    switch (rarity) {
      case 'common':
        return <Star size={16} color="#FFFFFF" />;
      case 'rare':
        return <Trophy size={16} color="#FFFFFF" />;
      case 'epic':
        return <Crown size={16} color="#FFFFFF" />;
      case 'legendary':
        return <Sparkles size={16} color="#FFFFFF" />;
      default:
        return <Star size={16} color="#FFFFFF" />;
    }
  };

  const getRarityLabel = (rarity: AchievementRarity): string => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const progressPercentage = achievement.maxProgress > 0 
    ? Math.round((achievement.progress / achievement.maxProgress) * 100)
    : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity 
        style={styles.compactContainer} 
        onPress={onPress}
        disabled={!onPress}
      >
        <LinearGradient
          colors={achievement.unlocked ? getRarityColors(achievement.rarity) : ['#2a2a2a', '#1a1a1a']}
          style={styles.compactGradient}
        >
          <View style={styles.compactContent}>
            <View style={[
              styles.compactIcon,
              !achievement.unlocked && styles.lockedIcon
            ]}>
              <Text style={[
                styles.compactEmoji,
                !achievement.unlocked && styles.lockedEmoji
              ]}>
                {achievement.unlocked ? achievement.icon : '🔒'}
              </Text>
            </View>
            
            <View style={styles.compactInfo}>
              <Text style={[
                styles.compactName,
                !achievement.unlocked && styles.lockedText
              ]}>
                {achievement.name}
              </Text>
              <Text style={[
                styles.compactPoints,
                !achievement.unlocked && styles.lockedText
              ]}>
                {achievement.points} pts
              </Text>
            </View>

            {!achievement.unlocked && showProgress && (
              <View style={styles.compactProgress}>
                <Text style={styles.compactProgressText}>
                  {progressPercentage}%
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'featured') {
    return (
      <TouchableOpacity 
        style={styles.featuredContainer} 
        onPress={onPress}
        disabled={!onPress}
      >
        <LinearGradient
          colors={getRarityColors(achievement.rarity)}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredContent}>
            <View style={styles.featuredHeader}>
              <View style={styles.featuredIconContainer}>
                <Text style={styles.featuredEmoji}>{achievement.icon}</Text>
              </View>
              
              <View style={styles.featuredInfo}>
                <View style={styles.featuredTitleRow}>
                  <Text style={styles.featuredName}>{achievement.name}</Text>
                  <View style={styles.rarityBadge}>
                    {getRarityIcon(achievement.rarity)}
                    <Text style={styles.rarityText}>
                      {getRarityLabel(achievement.rarity)}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.featuredDescription}>
                  {achievement.description}
                </Text>
                
                {achievement.unlockedAt && (
                  <Text style={styles.featuredDate}>
                    Unlocked {formatDate(achievement.unlockedAt)}
                  </Text>
                )}
              </View>

              {onShare && (
                <TouchableOpacity 
                  style={styles.shareButton}
                  onPress={onShare}
                >
                  <Share2 size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.featuredFooter}>
              <Text style={styles.featuredPoints}>
                +{achievement.points} points
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Default variant
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      disabled={!onPress}
    >
      <LinearGradient
        colors={achievement.unlocked ? getRarityColors(achievement.rarity) : ['#1a1a1a', '#2a2a2a']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[
              styles.iconContainer,
              !achievement.unlocked && styles.lockedIconContainer
            ]}>
              {achievement.unlocked ? (
                <Text style={styles.emoji}>{achievement.icon}</Text>
              ) : (
                <Lock size={24} color={DesignTokens.colors.text.tertiary} />
              )}
            </View>

            <View style={styles.info}>
              <View style={styles.titleRow}>
                <Text style={[
                  styles.name,
                  !achievement.unlocked && styles.lockedText
                ]}>
                  {achievement.name}
                </Text>
                
                <View style={[
                  styles.rarityBadge,
                  !achievement.unlocked && styles.lockedBadge
                ]}>
                  {getRarityIcon(achievement.rarity)}
                  <Text style={[
                    styles.rarityText,
                    !achievement.unlocked && styles.lockedText
                  ]}>
                    {getRarityLabel(achievement.rarity)}
                  </Text>
                </View>
              </View>

              <Text style={[
                styles.description,
                !achievement.unlocked && styles.lockedText
              ]}>
                {achievement.description}
              </Text>

              {achievement.unlocked && achievement.unlockedAt && (
                <Text style={styles.unlockedDate}>
                  Unlocked {formatDate(achievement.unlockedAt)}
                </Text>
              )}
            </View>
          </View>

          {!achievement.unlocked && showProgress && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressPercentage}>
                  {progressPercentage}%
                </Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${progressPercentage}%` }
                    ]} 
                  />
                </View>
                
                <CircularProgress
                  percentage={progressPercentage}
                  size={32}
                  strokeWidth={3}
                  showPercentage={false}
                  color={getRarityColors(achievement.rarity)[0]}
                />
              </View>

              <Text style={styles.progressText}>
                {achievement.progress} / {achievement.maxProgress}
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={[
              styles.points,
              !achievement.unlocked && styles.lockedText
            ]}>
              {achievement.points} points
            </Text>

            {onShare && achievement.unlocked && (
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={onShare}
              >
                <Share2 size={16} color={DesignTokens.colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Default variant styles
  container: {
    marginBottom: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  gradient: {
    padding: DesignTokens.spacing[4],
  },
  content: {
    gap: DesignTokens.spacing[3],
  },
  header: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  emoji: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    gap: DesignTokens.spacing[1],
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    flex: 1,
  },
  description: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
  },
  unlockedDate: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.success[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.full,
  },
  lockedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  rarityText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textTransform: 'uppercase',
  },
  progressSection: {
    gap: DesignTokens.spacing[2],
    paddingTop: DesignTokens.spacing[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  progressPercentage: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 3,
  },
  progressText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  points: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.warning[500],
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  shareButton: {
    padding: DesignTokens.spacing[2],
  },
  lockedText: {
    opacity: 0.6,
  },
  lockedEmoji: {
    opacity: 0.3,
  },

  // Compact variant styles
  compactContainer: {
    marginBottom: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    overflow: 'hidden',
  },
  compactGradient: {
    padding: DesignTokens.spacing[3],
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  compactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  compactEmoji: {
    fontSize: 20,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  compactPoints: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.warning[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  compactProgress: {
    alignItems: 'center',
  },
  compactProgressText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  // Featured variant styles
  featuredContainer: {
    marginBottom: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    ...DesignTokens.shadow.lg,
  },
  featuredGradient: {
    padding: DesignTokens.spacing[5],
  },
  featuredContent: {
    gap: DesignTokens.spacing[4],
  },
  featuredHeader: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[4],
  },
  featuredIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredEmoji: {
    fontSize: 32,
  },
  featuredInfo: {
    flex: 1,
    gap: DesignTokens.spacing[2],
  },
  featuredTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: DesignTokens.spacing[2],
  },
  featuredName: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    flex: 1,
  },
  featuredDescription: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  featuredDate: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  featuredFooter: {
    alignItems: 'center',
  },
  featuredPoints: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
});
