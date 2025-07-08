import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  Flame,
  Star,
  Users,
} from 'lucide-react-native';
import { Challenge } from '@/contexts/ChallengeContext';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface ChallengeProgressProps {
  challenge: Challenge;
  onMilestonePress?: (milestone: any) => void;
  onShareProgress?: () => void;
  showMilestones?: boolean;
  showStats?: boolean;
  showActions?: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  target: number;
  unit: string;
  reward: {
    points: number;
    badge?: string;
  };
  isCompleted: boolean;
  completedAt?: string;
  icon: string;
}

export function ChallengeProgress({
  challenge,
  onMilestonePress,
  onShareProgress,
  showMilestones = true,
  showStats = true,
  showActions = true,
}: ChallengeProgressProps) {
  
  // Mock milestones data - in real app, this would come from the challenge
  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first workout',
      target: 1,
      unit: 'workout',
      reward: { points: 50 },
      isCompleted: true,
      completedAt: '2024-01-15T10:00:00Z',
      icon: '🎯',
    },
    {
      id: '2',
      title: 'Building Momentum',
      description: 'Complete 5 workouts',
      target: 5,
      unit: 'workouts',
      reward: { points: 100, badge: 'Momentum Builder' },
      isCompleted: true,
      completedAt: '2024-01-20T15:30:00Z',
      icon: '🔥',
    },
    {
      id: '3',
      title: 'Consistency Champion',
      description: 'Complete 10 workouts',
      target: 10,
      unit: 'workouts',
      reward: { points: 200, badge: 'Consistent Performer' },
      isCompleted: false,
      icon: '⭐',
    },
    {
      id: '4',
      title: 'Challenge Master',
      description: 'Complete the full challenge',
      target: challenge.progress?.target || 20,
      unit: challenge.progress?.unit || 'workouts',
      reward: { points: challenge.reward.points, badge: challenge.reward.badge },
      isCompleted: challenge.isCompleted || false,
      icon: '🏆',
    },
  ];

  const getProgressPercentage = () => {
    if (!challenge.progress || challenge.progress.target === 0) return 0;
    return Math.min((challenge.progress.current / challenge.progress.target) * 100, 100);
  };

  const getDaysRemaining = () => {
    const endDate = new Date(challenge.duration.end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getDaysElapsed = () => {
    const startDate = new Date(challenge.duration.start);
    const now = new Date();
    const diffTime = now.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getTotalDays = () => {
    const startDate = new Date(challenge.duration.start);
    const endDate = new Date(challenge.duration.end);
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTimeProgressPercentage = () => {
    const totalDays = getTotalDays();
    const elapsedDays = getDaysElapsed();
    return Math.min((elapsedDays / totalDays) * 100, 100);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength':
        return ['#FF6B35', '#FF8C42'];
      case 'cardio':
        return ['#4A90E2', '#5BA0F2'];
      case 'consistency':
        return ['#27AE60', '#2ECC71'];
      case 'distance':
        return ['#9B59B6', '#A569BD'];
      case 'time':
        return ['#F39C12', '#F4A623'];
      case 'social':
        return ['#E74C3C', '#EC7063'];
      default:
        return ['#34495E', '#5D6D7E'];
    }
  };

  const handleMilestonePress = async (milestone: Milestone) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onMilestonePress?.(milestone);
  };

  const handleShareProgress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onShareProgress?.();
  };

  const renderProgressHeader = () => (
    <LinearGradient
      colors={getCategoryColor(challenge.category)}
      style={styles.progressHeader}
    >
      <View style={styles.progressHeaderContent}>
        <Text style={styles.challengeTitle}>{challenge.title}</Text>
        <Text style={styles.challengeCategory}>
          {challenge.category.toUpperCase()} • {challenge.difficulty.toUpperCase()}
        </Text>
        
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <Text style={styles.progressStatValue}>
              {challenge.progress?.current || 0}
            </Text>
            <Text style={styles.progressStatLabel}>Current</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressStatValue}>
              {challenge.progress?.target || 0}
            </Text>
            <Text style={styles.progressStatLabel}>Target</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressStatValue}>
              {Math.round(getProgressPercentage())}%
            </Text>
            <Text style={styles.progressStatLabel}>Complete</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressBarFill,
                { width: `${getProgressPercentage()}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {challenge.progress?.current || 0} / {challenge.progress?.target || 0} {challenge.progress?.unit || 'units'}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTimeProgress = () => (
    <View style={styles.timeProgressContainer}>
      <View style={styles.timeProgressHeader}>
        <Text style={styles.timeProgressTitle}>Time Progress</Text>
        <View style={styles.timeProgressStats}>
          <View style={styles.timeProgressStat}>
            <Clock size={16} color="#666" />
            <Text style={styles.timeProgressStatText}>
              {getDaysRemaining()} days left
            </Text>
          </View>
          <View style={styles.timeProgressStat}>
            <Calendar size={16} color="#666" />
            <Text style={styles.timeProgressStatText}>
              {getDaysElapsed()} / {getTotalDays()} days
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.timeProgressBar}>
        <LinearGradient
          colors={getCategoryColor(challenge.category)}
          style={[
            styles.timeProgressBarFill,
            { width: `${getTimeProgressPercentage()}%` }
          ]}
        />
      </View>
      
      <Text style={styles.timeProgressText}>
        {Math.round(getTimeProgressPercentage())}% of challenge duration completed
      </Text>
    </View>
  );

  const renderMilestone = (milestone: Milestone, index: number) => (
    <TouchableOpacity
      key={milestone.id}
      style={[
        styles.milestoneCard,
        milestone.isCompleted && styles.milestoneCardCompleted
      ]}
      onPress={() => handleMilestonePress(milestone)}
      activeOpacity={0.8}
    >
      <View style={styles.milestoneContent}>
        <View style={[
          styles.milestoneIcon,
          milestone.isCompleted && styles.milestoneIconCompleted
        ]}>
          {milestone.isCompleted ? (
            <CheckCircle size={24} color="#27AE60" />
          ) : (
            <Text style={styles.milestoneEmoji}>{milestone.icon}</Text>
          )}
        </View>
        
        <View style={styles.milestoneInfo}>
          <Text style={[
            styles.milestoneTitle,
            milestone.isCompleted && styles.milestoneTitleCompleted
          ]}>
            {milestone.title}
          </Text>
          <Text style={styles.milestoneDescription}>
            {milestone.description}
          </Text>
          <View style={styles.milestoneReward}>
            <Trophy size={14} color="#F59E0B" />
            <Text style={styles.milestoneRewardText}>
              {milestone.reward.points} points
              {milestone.reward.badge && ` • ${milestone.reward.badge}`}
            </Text>
          </View>
          {milestone.completedAt && (
            <Text style={styles.milestoneCompletedAt}>
              Completed {new Date(milestone.completedAt).toLocaleDateString()}
            </Text>
          )}
        </View>

        <View style={styles.milestoneStatus}>
          {milestone.isCompleted ? (
            <View style={styles.milestoneCompleted}>
              <CheckCircle size={20} color="#27AE60" />
            </View>
          ) : (
            <View style={styles.milestoneProgress}>
              <Text style={styles.milestoneProgressText}>
                {milestone.target} {milestone.unit}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>Challenge Statistics</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Users size={24} color="#4A90E2" />
          <Text style={styles.statValue}>{challenge.participants.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Participants</Text>
        </View>
        
        <View style={styles.statCard}>
          <Target size={24} color="#27AE60" />
          <Text style={styles.statValue}>
            {Math.round(getProgressPercentage())}%
          </Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
        
        <View style={styles.statCard}>
          <Flame size={24} color="#FF6B35" />
          <Text style={styles.statValue}>{getDaysElapsed()}</Text>
          <Text style={styles.statLabel}>Days Active</Text>
        </View>
        
        <View style={styles.statCard}>
          <Award size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{challenge.reward.points}</Text>
          <Text style={styles.statLabel}>Total Reward</Text>
        </View>
      </View>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleShareProgress}
      >
        <LinearGradient
          colors={getCategoryColor(challenge.category)}
          style={styles.actionButtonGradient}
        >
          <TrendingUp size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Share Progress</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderProgressHeader()}
      
      {renderTimeProgress()}
      
      {showStats && renderStats()}
      
      {showMilestones && (
        <View style={styles.milestonesContainer}>
          <Text style={styles.milestonesTitle}>Milestones</Text>
          {milestones.map((milestone, index) => renderMilestone(milestone, index))}
        </View>
      )}
      
      {showActions && renderActions()}
      
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  progressHeader: {
    padding: 24,
    paddingTop: 40,
  },
  progressHeaderContent: {
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  challengeCategory: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 24,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  timeProgressContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timeProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeProgressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  timeProgressStats: {
    flexDirection: 'row',
    gap: 16,
  },
  timeProgressStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeProgressStatText: {
    fontSize: 12,
    color: '#6B7280',
  },
  timeProgressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginBottom: 8,
  },
  timeProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  timeProgressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 80) / 2 - 6,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  milestonesContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  milestonesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  milestoneCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  milestoneCardCompleted: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  milestoneContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  milestoneIconCompleted: {
    backgroundColor: '#D1FAE5',
  },
  milestoneEmoji: {
    fontSize: 20,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  milestoneTitleCompleted: {
    color: '#059669',
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  milestoneReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  milestoneRewardText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  milestoneCompletedAt: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
  },
  milestoneStatus: {
    alignItems: 'center',
  },
  milestoneCompleted: {
    // Styling handled by CheckCircle icon
  },
  milestoneProgress: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  milestoneProgressText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 100,
  },
});
