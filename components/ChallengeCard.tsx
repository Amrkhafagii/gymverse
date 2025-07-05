import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Challenge, UserChallenge, getChallengeTypeInfo, getDifficultyColor } from '@/lib/challenges';

interface ChallengeCardProps {
  challenge: Challenge;
  userChallenge?: UserChallenge;
  onJoin?: () => void;
  onPress?: () => void;
}

export default function ChallengeCard({ 
  challenge, 
  userChallenge, 
  onJoin, 
  onPress 
}: ChallengeCardProps) {
  const challengeType = getChallengeTypeInfo(challenge.type);
  const difficultyColor = getDifficultyColor(challenge.difficulty);
  
  if (!challengeType) return null;

  const progress = userChallenge 
    ? (userChallenge.progress / challenge.requirements.target) * 100 
    : 0;

  const isJoined = !!userChallenge;
  const isCompleted = userChallenge?.is_completed || false;
  
  const timeLeft = Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  const getStatusColor = () => {
    if (isCompleted) return '#10B981';
    if (isJoined) return '#3B82F6';
    return '#6B7280';
  };

  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (isJoined) return 'In Progress';
    return 'Available';
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[challengeType.color, challengeType.color + '80']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{challengeType.icon}</Text>
          </View>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
            <Text style={styles.difficultyText}>{challenge.difficulty.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.requirements}>
          <Text style={styles.requirementText}>
            {challenge.requirements.target} {challenge.requirements.metric.replace('_', ' ')}
          </Text>
          <Text style={styles.timeframeText}>
            {challenge.requirements.timeframe} • {timeLeft} days left
          </Text>
        </View>

        {isJoined && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                Progress: {userChallenge?.progress || 0}/{challenge.requirements.target}
              </Text>
              <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.rewards}>
            <Text style={styles.rewardText}>🏆 {challenge.rewards.points} pts</Text>
            {challenge.rewards.bonus_multiplier && (
              <Text style={styles.bonusText}>
                +{Math.round((challenge.rewards.bonus_multiplier - 1) * 100)}% bonus
              </Text>
            )}
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        {!isJoined && onJoin && (
          <TouchableOpacity style={styles.joinButton} onPress={onJoin}>
            <Text style={styles.joinButtonText}>Join Challenge</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  challengeInfo: {
    flex: 1,
    marginRight: 12,
  },
  challengeTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  requirements: {
    marginBottom: 16,
  },
  requirementText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  timeframeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter-Regular',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Inter-Medium',
  },
  percentageText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewards: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  bonusText: {
    fontSize: 12,
    color: '#FFD700',
    fontFamily: 'Inter-Medium',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  joinButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
});
