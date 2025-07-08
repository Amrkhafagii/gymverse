import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Trophy,
  Users,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Award,
  CheckCircle,
  Play,
  Star,
} from 'lucide-react-native';
import { Challenge } from '@/contexts/ChallengeContext';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface ChallengeCardProps {
  challenge: Challenge;
  variant?: 'default' | 'featured' | 'compact' | 'detailed';
  onPress?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  showProgress?: boolean;
  showParticipants?: boolean;
}

export function ChallengeCard({
  challenge,
  variant = 'default',
  onPress,
  onJoin,
  onLeave,
  showProgress = true,
  showParticipants = true,
}: ChallengeCardProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const handleJoin = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onJoin?.();
  };

  const handleLeave = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onLeave?.();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength':
        return <Trophy size={20} color="#FFFFFF" />;
      case 'cardio':
        return <TrendingUp size={20} color="#FFFFFF" />;
      case 'consistency':
        return <Target size={20} color="#FFFFFF" />;
      case 'distance':
        return <Play size={20} color="#FFFFFF" />;
      case 'time':
        return <Clock size={20} color="#FFFFFF" />;
      case 'social':
        return <Users size={20} color="#FFFFFF" />;
      default:
        return <Award size={20} color="#FFFFFF" />;
    }
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#27AE60';
      case 'intermediate':
        return '#F39C12';
      case 'advanced':
        return '#E74C3C';
      default:
        return '#95A5A6';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'individual':
        return <Target size={16} color="#666" />;
      case 'team':
        return <Users size={16} color="#666" />;
      case 'community':
        return <Trophy size={16} color="#666" />;
      default:
        return <Award size={16} color="#666" />;
    }
  };

  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  };

  const getProgressPercentage = () => {
    if (!challenge.progress || challenge.progress.target === 0) return 0;
    return Math.min((challenge.progress.current / challenge.progress.target) * 100, 100);
  };

  const renderCompactCard = () => (
    <TouchableOpacity style={styles.compactCard} onPress={handlePress} activeOpacity={0.8}>
      <LinearGradient
        colors={getCategoryColor(challenge.category)}
        style={styles.compactGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.compactHeader}>
          <View style={styles.compactIcon}>
            {getCategoryIcon(challenge.category)}
          </View>
          <View style={styles.compactInfo}>
            <Text style={styles.compactTitle} numberOfLines={1}>
              {challenge.title}
            </Text>
            <Text style={styles.compactSubtitle}>
              {challenge.participants} participants
            </Text>
          </View>
          <View style={styles.compactStatus}>
            {challenge.isJoined ? (
              <CheckCircle size={20} color="#FFFFFF" />
            ) : (
              <Play size={20} color="#FFFFFF" />
            )}
          </View>
        </View>
        
        {showProgress && challenge.progress && (
          <View style={styles.compactProgress}>
            <View style={styles.compactProgressBar}>
              <View 
                style={[
                  styles.compactProgressFill,
                  { width: `${getProgressPercentage()}%` }
                ]}
              />
            </View>
            <Text style={styles.compactProgressText}>
              {challenge.progress.current}/{challenge.progress.target} {challenge.progress.unit}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderFeaturedCard = () => (
    <TouchableOpacity style={styles.featuredCard} onPress={handlePress} activeOpacity={0.8}>
      <LinearGradient
        colors={getCategoryColor(challenge.category)}
        style={styles.featuredGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {challenge.image && (
          <Image source={{ uri: challenge.image }} style={styles.featuredImage} />
        )}
        
        <View style={styles.featuredOverlay}>
          <View style={styles.featuredHeader}>
            <View style={styles.featuredBadge}>
              <Star size={16} color="#FFD700" />
              <Text style={styles.featuredBadgeText}>FEATURED</Text>
            </View>
            <View style={styles.featuredCategory}>
              {getCategoryIcon(challenge.category)}
              <Text style={styles.featuredCategoryText}>
                {challenge.category.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>{challenge.title}</Text>
            <Text style={styles.featuredDescription} numberOfLines={2}>
              {challenge.description}
            </Text>

            <View style={styles.featuredStats}>
              <View style={styles.featuredStat}>
                <Users size={16} color="#FFFFFF" />
                <Text style={styles.featuredStatText}>
                  {challenge.participants.toLocaleString()}
                </Text>
              </View>
              <View style={styles.featuredStat}>
                <Calendar size={16} color="#FFFFFF" />
                <Text style={styles.featuredStatText}>
                  {formatDuration(challenge.duration.start, challenge.duration.end)}
                </Text>
              </View>
              <View style={styles.featuredStat}>
                <Trophy size={16} color="#FFFFFF" />
                <Text style={styles.featuredStatText}>
                  {challenge.reward.points} pts
                </Text>
              </View>
            </View>

            {showProgress && challenge.progress && (
              <View style={styles.featuredProgress}>
                <View style={styles.featuredProgressHeader}>
                  <Text style={styles.featuredProgressLabel}>Progress</Text>
                  <Text style={styles.featuredProgressValue}>
                    {Math.round(getProgressPercentage())}%
                  </Text>
                </View>
                <View style={styles.featuredProgressBar}>
                  <View 
                    style={[
                      styles.featuredProgressFill,
                      { width: `${getProgressPercentage()}%` }
                    ]}
                  />
                </View>
                <Text style={styles.featuredProgressText}>
                  {challenge.progress.current}/{challenge.progress.target} {challenge.progress.unit}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.featuredButton,
                challenge.isJoined && styles.featuredButtonJoined
              ]}
              onPress={challenge.isJoined ? handleLeave : handleJoin}
            >
              <Text style={[
                styles.featuredButtonText,
                challenge.isJoined && styles.featuredButtonTextJoined
              ]}>
                {challenge.isJoined ? 'Leave Challenge' : 'Join Challenge'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderDetailedCard = () => (
    <TouchableOpacity style={styles.detailedCard} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.detailedContent}>
        <View style={styles.detailedHeader}>
          <LinearGradient
            colors={getCategoryColor(challenge.category)}
            style={styles.detailedIcon}
          >
            {getCategoryIcon(challenge.category)}
          </LinearGradient>
          
          <View style={styles.detailedInfo}>
            <Text style={styles.detailedTitle}>{challenge.title}</Text>
            <Text style={styles.detailedDescription} numberOfLines={2}>
              {challenge.description}
            </Text>
          </View>

          <View style={styles.detailedMeta}>
            <View style={[
              styles.detailedDifficulty,
              { backgroundColor: getDifficultyColor(challenge.difficulty) }
            ]}>
              <Text style={styles.detailedDifficultyText}>
                {challenge.difficulty.toUpperCase()}
              </Text>
            </View>
            {challenge.isJoined && (
              <View style={styles.detailedJoinedBadge}>
                <CheckCircle size={16} color="#27AE60" />
              </View>
            )}
          </View>
        </View>

        <View style={styles.detailedStats}>
          <View style={styles.detailedStat}>
            {getTypeIcon(challenge.type)}
            <Text style={styles.detailedStatLabel}>Type</Text>
            <Text style={styles.detailedStatValue}>
              {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
            </Text>
          </View>

          {showParticipants && (
            <View style={styles.detailedStat}>
              <Users size={16} color="#666" />
              <Text style={styles.detailedStatLabel}>Participants</Text>
              <Text style={styles.detailedStatValue}>
                {challenge.participants.toLocaleString()}
              </Text>
            </View>
          )}

          <View style={styles.detailedStat}>
            <Calendar size={16} color="#666" />
            <Text style={styles.detailedStatLabel}>Duration</Text>
            <Text style={styles.detailedStatValue}>
              {formatDuration(challenge.duration.start, challenge.duration.end)}
            </Text>
          </View>

          <View style={styles.detailedStat}>
            <Trophy size={16} color="#666" />
            <Text style={styles.detailedStatLabel}>Reward</Text>
            <Text style={styles.detailedStatValue}>
              {challenge.reward.points} pts
            </Text>
          </View>
        </View>

        {showProgress && challenge.progress && (
          <View style={styles.detailedProgress}>
            <View style={styles.detailedProgressHeader}>
              <Text style={styles.detailedProgressLabel}>Your Progress</Text>
              <Text style={styles.detailedProgressValue}>
                {challenge.progress.current}/{challenge.progress.target} {challenge.progress.unit}
              </Text>
            </View>
            <View style={styles.detailedProgressBar}>
              <LinearGradient
                colors={getCategoryColor(challenge.category)}
                style={[
                  styles.detailedProgressFill,
                  { width: `${getProgressPercentage()}%` }
                ]}
              />
            </View>
            <Text style={styles.detailedProgressPercentage}>
              {Math.round(getProgressPercentage())}% complete
            </Text>
          </View>
        )}

        <View style={styles.detailedActions}>
          <TouchableOpacity
            style={[
              styles.detailedButton,
              challenge.isJoined && styles.detailedButtonSecondary
            ]}
            onPress={challenge.isJoined ? handleLeave : handleJoin}
          >
            <Text style={[
              styles.detailedButtonText,
              challenge.isJoined && styles.detailedButtonTextSecondary
            ]}>
              {challenge.isJoined ? 'Leave' : 'Join Challenge'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDefaultCard = () => (
    <TouchableOpacity style={styles.defaultCard} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.defaultContent}>
        <View style={styles.defaultHeader}>
          <LinearGradient
            colors={getCategoryColor(challenge.category)}
            style={styles.defaultIcon}
          >
            {getCategoryIcon(challenge.category)}
          </LinearGradient>
          
          <View style={styles.defaultInfo}>
            <Text style={styles.defaultTitle}>{challenge.title}</Text>
            <Text style={styles.defaultSubtitle}>
              {challenge.participants} participants • {formatDuration(challenge.duration.start, challenge.duration.end)}
            </Text>
          </View>

          {challenge.isJoined && (
            <CheckCircle size={20} color="#27AE60" />
          )}
        </View>

        {showProgress && challenge.progress && (
          <View style={styles.defaultProgress}>
            <View style={styles.defaultProgressBar}>
              <LinearGradient
                colors={getCategoryColor(challenge.category)}
                style={[
                  styles.defaultProgressFill,
                  { width: `${getProgressPercentage()}%` }
                ]}
              />
            </View>
            <Text style={styles.defaultProgressText}>
              {challenge.progress.current}/{challenge.progress.target} {challenge.progress.unit} • {Math.round(getProgressPercentage())}%
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  switch (variant) {
    case 'compact':
      return renderCompactCard();
    case 'featured':
      return renderFeaturedCard();
    case 'detailed':
      return renderDetailedCard();
    default:
      return renderDefaultCard();
  }
}

const styles = StyleSheet.create({
  // Compact Card Styles
  compactCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  compactGradient: {
    padding: 16,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  compactSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  compactStatus: {
    marginLeft: 12,
  },
  compactProgress: {
    marginTop: 12,
  },
  compactProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 6,
  },
  compactProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  compactProgressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'right',
  },

  // Featured Card Styles
  featuredCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 280,
  },
  featuredGradient: {
    flex: 1,
    position: 'relative',
  },
  featuredImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  featuredOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700',
  },
  featuredCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  featuredCategoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  featuredStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredStatText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  featuredProgress: {
    marginBottom: 16,
  },
  featuredProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featuredProgressLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  featuredProgressValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  featuredProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginBottom: 6,
  },
  featuredProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  featuredProgressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  featuredButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  featuredButtonJoined: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  featuredButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  featuredButtonTextJoined: {
    color: '#FFFFFF',
  },

  // Detailed Card Styles
  detailedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailedContent: {
    padding: 20,
  },
  detailedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailedInfo: {
    flex: 1,
  },
  detailedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  detailedDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  detailedMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  detailedDifficulty: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detailedDifficultyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailedJoinedBadge: {
    // Styling handled by CheckCircle icon
  },
  detailedStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  detailedStat: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  detailedStatLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  detailedStatValue: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
  },
  detailedProgress: {
    marginBottom: 16,
  },
  detailedProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailedProgressLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  detailedProgressValue: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailedProgressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  detailedProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  detailedProgressPercentage: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  detailedActions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailedButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailedButtonSecondary: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  detailedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailedButtonTextSecondary: {
    color: '#6B7280',
  },

  // Default Card Styles
  defaultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  defaultContent: {
    padding: 16,
  },
  defaultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  defaultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  defaultInfo: {
    flex: 1,
  },
  defaultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  defaultSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  defaultProgress: {
    // Progress container
  },
  defaultProgressBar: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  defaultProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  defaultProgressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
});
