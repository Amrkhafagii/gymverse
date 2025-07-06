import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Trophy,
  Users,
  Calendar,
  Target,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'community';
  category: 'strength' | 'cardio' | 'consistency' | 'distance' | 'time';
  participants: number;
  maxParticipants?: number;
  duration: {
    start: string;
    end: string;
    daysLeft: number;
  };
  progress?: {
    current: number;
    target: number;
    unit: string;
  };
  reward: {
    points: number;
    badge?: string;
    title?: string;
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isJoined?: boolean;
  isCompleted?: boolean;
  image?: string;
  color: string;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onPress?: () => void;
  onJoin?: () => void;
  variant?: 'featured' | 'compact' | 'detailed';
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onPress,
  onJoin,
  variant = 'detailed',
}) => {
  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return '#10B981';
      case 'intermediate':
        return '#F59E0B';
      case 'advanced':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getCategoryIcon = (category: Challenge['category']) => {
    switch (category) {
      case 'strength':
        return <Target size={20} color="#FFFFFF" />;
      case 'cardio':
        return <Flame size={20} color="#FFFFFF" />;
      case 'consistency':
        return <Calendar size={20} color="#FFFFFF" />;
      case 'distance':
        return <Trophy size={20} color="#FFFFFF" />;
      case 'time':
        return <Award size={20} color="#FFFFFF" />;
      default:
        return <Target size={20} color="#FFFFFF" />;
    }
  };

  const getProgressPercentage = () => {
    if (!challenge.progress) return 0;
    return Math.min((challenge.progress.current / challenge.progress.target) * 100, 100);
  };

  if (variant === 'featured') {
    return (
      <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.9}>
        <LinearGradient
          colors={[challenge.color, `${challenge.color}CC`]}
          style={styles.featuredGradient}
        >
          {challenge.image && (
            <Image source={{ uri: challenge.image }} style={styles.featuredImage} />
          )}
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.featuredOverlay}
          >
            <View style={styles.featuredContent}>
              <View style={styles.featuredHeader}>
                <View style={styles.categoryBadge}>
                  {getCategoryIcon(challenge.category)}
                  <Text style={styles.categoryText}>{challenge.category}</Text>
                </View>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
                  <Text style={styles.difficultyText}>{challenge.difficulty}</Text>
                </View>
              </View>
              
              <Text style={styles.featuredTitle}>{challenge.title}</Text>
              <Text style={styles.featuredDescription}>{challenge.description}</Text>
              
              <View style={styles.featuredStats}>
                <View style={styles.featuredStat}>
                  <Users size={16} color="#FFFFFF" />
                  <Text style={styles.featuredStatText}>
                    {challenge.participants.toLocaleString()} joined
                  </Text>
                </View>
                <View style={styles.featuredStat}>
                  <Calendar size={16} color="#FFFFFF" />
                  <Text style={styles.featuredStatText}>
                    {challenge.duration.daysLeft} days left
                  </Text>
                </View>
              </View>
              
              {!challenge.isJoined && (
                <TouchableOpacity style={styles.joinButton} onPress={onJoin}>
                  <Text style={styles.joinButtonText}>Join Challenge</Text>
                  <ChevronRight size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={[`${challenge.color}20`, `${challenge.color}10`]}
          style={styles.compactGradient}
        >
          <View style={styles.compactHeader}>
            <View style={[styles.compactIcon, { backgroundColor: challenge.color }]}>
              {getCategoryIcon(challenge.category)}
            </View>
            <View style={styles.compactInfo}>
              <Text style={styles.compactTitle} numberOfLines={1}>
                {challenge.title}
              </Text>
              <Text style={styles.compactParticipants}>
                {challenge.participants.toLocaleString()} participants
              </Text>
            </View>
            <Text style={styles.compactDays}>
              {challenge.duration.daysLeft}d
            </Text>
          </View>
          
          {challenge.progress && (
            <View style={styles.compactProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${getProgressPercentage()}%`, backgroundColor: challenge.color }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {challenge.progress.current}/{challenge.progress.target} {challenge.progress.unit}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.detailedCard} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.detailedGradient}
      >
        {/* Header */}
        <View style={styles.detailedHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.categoryIcon, { backgroundColor: challenge.color }]}>
              {getCategoryIcon(challenge.category)}
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.detailedTitle}>{challenge.title}</Text>
              <Text style={styles.detailedCategory}>
                {challenge.category} • {challenge.type}
              </Text>
            </View>
          </View>
          
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
            <Text style={styles.difficultyText}>{challenge.difficulty}</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.detailedDescription}>{challenge.description}</Text>

        {/* Progress */}
        {challenge.progress && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Your Progress</Text>
              <Text style={styles.progressPercentage}>
                {Math.round(getProgressPercentage())}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${getProgressPercentage()}%`, backgroundColor: challenge.color }
                ]} 
              />
            </View>
            <Text style={styles.progressDetails}>
              {challenge.progress.current} / {challenge.progress.target} {challenge.progress.unit}
            </Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Users size={16} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.statText}>
              {challenge.participants.toLocaleString()}
              {challenge.maxParticipants && ` / ${challenge.maxParticipants.toLocaleString()}`}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Calendar size={16} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.statText}>
              {challenge.duration.daysLeft} days left
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Award size={16} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.statText}>
              {challenge.reward.points} XP
            </Text>
          </View>
        </View>

        {/* Action */}
        <View style={styles.actionSection}>
          {challenge.isJoined ? (
            challenge.isCompleted ? (
              <View style={styles.completedBadge}>
                <Trophy size={16} color="#10B981" />
                <Text style={styles.completedText}>Completed</Text>
              </View>
            ) : (
              <View style={styles.joinedBadge}>
                <Text style={styles.joinedText}>Joined</Text>
              </View>
            )
          ) : (
            <TouchableOpacity 
              style={[styles.joinActionButton, { backgroundColor: challenge.color }]}
              onPress={onJoin}
            >
              <Text style={styles.joinActionText}>Join Challenge</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Accent Line */}
        <View style={[styles.accentLine, { backgroundColor: challenge.color }]} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Featured Card
  featuredCard: {
    height: 280,
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[4],
    ...DesignTokens.shadow.xl,
  },
  featuredGradient: {
    flex: 1,
    position: 'relative',
  },
  featuredImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: DesignTokens.spacing[5],
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing[2],
  },
  categoryText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  difficultyBadge: {
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  difficultyText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  featuredTitle: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[2],
  },
  featuredDescription: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    opacity: 0.9,
    marginBottom: DesignTokens.spacing[4],
    lineHeight: 22,
  },
  featuredStats: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[4],
  },
  featuredStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  featuredStatText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: DesignTokens.spacing[3],
    paddingHorizontal: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing[2],
  },
  joinButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },

  // Compact Card
  compactCard: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[3],
    ...DesignTokens.shadow.base,
  },
  compactGradient: {
    padding: DesignTokens.spacing[4],
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  compactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing[3],
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  compactParticipants: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  compactDays: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  compactProgress: {
    marginTop: DesignTokens.spacing[2],
  },

  // Detailed Card
  detailedCard: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[4],
    position: 'relative',
    ...DesignTokens.shadow.base,
  },
  detailedGradient: {
    padding: DesignTokens.spacing[5],
  },
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[3],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing[3],
  },
  headerInfo: {
    flex: 1,
  },
  detailedTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  detailedCategory: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textTransform: 'capitalize',
  },
  detailedDescription: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 22,
    marginBottom: DesignTokens.spacing[4],
  },
  progressSection: {
    marginBottom: DesignTokens.spacing[4],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
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
  progressBar: {
    height: 8,
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: 4,
    marginBottom: DesignTokens.spacing[2],
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressDetails: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  progressText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing[4],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  statText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  actionSection: {
    alignItems: 'flex-end',
  },
  joinActionButton: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
  },
  joinActionText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  joinedBadge: {
    backgroundColor: DesignTokens.colors.success[500],
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
  },
  joinedText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.success[500],
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing[1],
  },
  completedText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});
