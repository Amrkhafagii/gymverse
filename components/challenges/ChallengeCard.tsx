/**
 * Challenge Card Component
 * Displays challenge information in various formats
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
  Target, 
  Users, 
  Calendar, 
  Award, 
  TrendingUp,
  Clock,
  CheckCircle,
  Play,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'consistency' | 'volume' | 'frequency' | 'duration' | 'strength';
  duration: number; // in days
  participants: number;
  progress?: number;
  target?: number;
  reward: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isParticipating?: boolean;
  createdBy: string;
  rules: string[];
}

interface ChallengeCardProps {
  challenge: Challenge;
  onPress: () => void;
  variant?: 'default' | 'compact' | 'active' | 'featured';
  style?: ViewStyle;
  showJoinButton?: boolean;
  onJoinPress?: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onPress,
  variant = 'default',
  style,
  showJoinButton = false,
  onJoinPress,
}) => {
  const getDifficultyColor = () => {
    switch (challenge.difficulty) {
      case 'beginner':
        return ['#10B981', '#059669'];
      case 'intermediate':
        return ['#F59E0B', '#D97706'];
      case 'advanced':
        return ['#EF4444', '#DC2626'];
      default:
        return ['#6B7280', '#4B5563'];
    }
  };

  const getTypeIcon = () => {
    switch (challenge.type) {
      case 'consistency':
        return <Calendar size={20} color="#FFFFFF" />;
      case 'volume':
        return <TrendingUp size={20} color="#FFFFFF" />;
      case 'frequency':
        return <Target size={20} color="#FFFFFF" />;
      case 'duration':
        return <Clock size={20} color="#FFFFFF" />;
      case 'strength':
        return <Award size={20} color="#FFFFFF" />;
      default:
        return <Target size={20} color="#FFFFFF" />;
    }
  };

  const getDaysRemaining = () => {
    const end = new Date(challenge.endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getProgressPercentage = () => {
    if (!challenge.progress || !challenge.target) return 0;
    return (challenge.progress / challenge.target) * 100;
  };

  const formatParticipants = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.compactHeader}>
          <View style={styles.compactIcon}>
            {getTypeIcon()}
          </View>
          <View style={styles.compactInfo}>
            <Text style={styles.compactTitle} numberOfLines={1}>
              {challenge.title}
            </Text>
            <Text style={styles.compactParticipants}>
              {formatParticipants(challenge.participants)} participants
            </Text>
          </View>
          <View style={[styles.compactDifficulty, { backgroundColor: getDifficultyColor()[0] }]}>
            <Text style={styles.compactDifficultyText}>
              {challenge.difficulty[0].toUpperCase()}
            </Text>
          </View>
        </View>
        
        {challenge.progress !== undefined && challenge.target !== undefined && (
          <View style={styles.compactProgress}>
            <View style={styles.compactProgressBar}>
              <View 
                style={[
                  styles.compactProgressFill,
                  { 
                    width: `${getProgressPercentage()}%`,
                    backgroundColor: getDifficultyColor()[0]
                  }
                ]} 
              />
            </View>
            <Text style={styles.compactProgressText}>
              {Math.round(getProgressPercentage())}%
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'active') {
    return (
      <TouchableOpacity
        style={[styles.activeContainer, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient colors={getDifficultyColor()} style={styles.activeGradient}>
          {/* Header */}
          <View style={styles.activeHeader}>
            <View style={styles.activeIconContainer}>
              {getTypeIcon()}
            </View>
            <View style={styles.activeHeaderInfo}>
              <Text style={styles.activeTitle} numberOfLines={1}>
                {challenge.title}
              </Text>
              <Text style={styles.activeCategory}>
                {challenge.category} • {getDaysRemaining()} days left
              </Text>
            </View>
            {challenge.isParticipating && (
              <View style={styles.participatingBadge}>
                <CheckCircle size={16} color="#FFFFFF" />
              </View>
            )}
          </View>

          {/* Progress */}
          {challenge.progress !== undefined && challenge.target !== undefined && (
            <View style={styles.activeProgressSection}>
              <View style={styles.activeProgressHeader}>
                <Text style={styles.activeProgressLabel}>Progress</Text>
                <Text style={styles.activeProgressValue}>
                  {challenge.progress}/{challenge.target}
                </Text>
              </View>
              
              <View style={styles.activeProgressBar}>
                <View 
                  style={[
                    styles.activeProgressFill,
                    { width: `${Math.min(getProgressPercentage(), 100)}%` }
                  ]} 
                />
              </View>
              
              <Text style={styles.activeProgressPercentage}>
                {Math.round(getProgressPercentage())}% complete
              </Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.activeStats}>
            <View style={styles.activeStat}>
              <Users size={14} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.activeStatText}>
                {formatParticipants(challenge.participants)}
              </Text>
            </View>
            <View style={styles.activeStat}>
              <Award size={14} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.activeStatText}>
                {challenge.reward} pts
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
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: getDifficultyColor()[0] }]}>
            {getTypeIcon()}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.title} numberOfLines={1}>
              {challenge.title}
            </Text>
            <View style={styles.metaRow}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor()[0] }]}>
                <Text style={styles.difficultyText}>
                  {challenge.difficulty.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.categoryText}>{challenge.category}</Text>
            </View>
          </View>
        </View>
        
        {challenge.isParticipating && (
          <View style={styles.participatingIndicator}>
            <CheckCircle size={16} color={DesignTokens.colors.success[500]} />
          </View>
        )}
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {challenge.description}
      </Text>

      {/* Progress (if participating) */}
      {challenge.isParticipating && challenge.progress !== undefined && challenge.target !== undefined && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Your Progress</Text>
            <Text style={styles.progressValue}>
              {challenge.progress}/{challenge.target}
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <LinearGradient
              colors={getDifficultyColor()}
              style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]}
            />
          </View>
        </View>
      )}

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Users size={16} color={DesignTokens.colors.text.secondary} />
          <Text style={styles.statText}>
            {formatParticipants(challenge.participants)} participants
          </Text>
        </View>
        
        <View style={styles.stat}>
          <Calendar size={16} color={DesignTokens.colors.text.secondary} />
          <Text style={styles.statText}>
            {getDaysRemaining()} days left
          </Text>
        </View>
        
        <View style={styles.stat}>
          <Award size={16} color={DesignTokens.colors.text.secondary} />
          <Text style={styles.statText}>
            {challenge.reward} points
          </Text>
        </View>
      </View>

      {/* Join Button */}
      {showJoinButton && !challenge.isParticipating && onJoinPress && (
        <TouchableOpacity
          style={[styles.joinButton, { backgroundColor: getDifficultyColor()[0] }]}
          onPress={onJoinPress}
        >
          <Play size={16} color="#FFFFFF" />
          <Text style={styles.joinButtonText}>Join Challenge</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Default variant styles
  container: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    ...DesignTokens.shadow.sm,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border.primary,
  },

  header: {
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

  iconContainer: {
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    marginRight: DesignTokens.spacing[3],
  },

  headerInfo: {
    flex: 1,
  },

  title: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },

  metaRow: {
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

  participatingIndicator: {
    backgroundColor: DesignTokens.colors.success[100],
    padding: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  description: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
    marginBottom: DesignTokens.spacing[3],
  },

  progressSection: {
    marginBottom: DesignTokens.spacing[3],
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

  progressValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },

  progressBar: {
    height: 6,
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing[2],
  },

  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    flex: 1,
  },

  statText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing[2],
    marginTop: DesignTokens.spacing[2],
  },

  joinButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  // Compact variant styles
  compactContainer: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    ...DesignTokens.shadow.sm,
  },

  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },

  compactIcon: {
    backgroundColor: DesignTokens.colors.primary[500],
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.sm,
    marginRight: DesignTokens.spacing[2],
  },

  compactInfo: {
    flex: 1,
  },

  compactTitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },

  compactParticipants: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },

  compactDifficulty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  compactDifficultyText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  compactProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },

  compactProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: 2,
    overflow: 'hidden',
  },

  compactProgressFill: {
    height: '100%',
    borderRadius: 2,
  },

  compactProgressText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    minWidth: 30,
    textAlign: 'right',
  },

  // Active variant styles
  activeContainer: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.md,
  },

  activeGradient: {
    padding: DesignTokens.spacing[4],
  },

  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },

  activeIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    marginRight: DesignTokens.spacing[3],
  },

  activeHeaderInfo: {
    flex: 1,
  },

  activeTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: DesignTokens.spacing[1],
  },

  activeCategory: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  participatingBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  activeProgressSection: {
    marginBottom: DesignTokens.spacing[3],
  },

  activeProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },

  activeProgressLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  activeProgressValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },

  activeProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: DesignTokens.spacing[1],
    overflow: 'hidden',
  },

  activeProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },

  activeProgressPercentage: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  activeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  activeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },

  activeStatText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
