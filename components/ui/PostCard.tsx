import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trophy,
  Target,
  Calendar,
  Flame,
  Zap,
  Camera,
  Play
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified?: boolean;
  level?: number;
}

interface WorkoutStats {
  duration: number;
  calories: number;
  exercises?: number;
  sets?: number;
}

interface Achievement {
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Post {
  id: string;
  user: User;
  type: 'workout_complete' | 'achievement' | 'progress_photo' | 'milestone' | 'challenge';
  content: string;
  workout?: string;
  stats?: WorkoutStats;
  achievement?: Achievement;
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  };
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
  isLiked?: boolean;
  location?: string;
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onUserPress?: (userId: string) => void;
  onPostPress?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onUserPress,
  onPostPress,
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    
    onLike?.(post.id);
  };

  const getPostTypeIcon = () => {
    switch (post.type) {
      case 'workout_complete':
        return <Target size={16} color="#00D4AA" />;
      case 'achievement':
        return <Trophy size={16} color="#FFD700" />;
      case 'progress_photo':
        return <Camera size={16} color="#9E7FFF" />;
      case 'milestone':
        return <Zap size={16} color="#FF6B35" />;
      case 'challenge':
        return <Flame size={16} color="#E74C3C" />;
      default:
        return null;
    }
  };

  const getPostTypeColor = () => {
    switch (post.type) {
      case 'workout_complete':
        return '#00D4AA';
      case 'achievement':
        return '#FFD700';
      case 'progress_photo':
        return '#9E7FFF';
      case 'milestone':
        return '#FF6B35';
      case 'challenge':
        return '#E74C3C';
      default:
        return DesignTokens.colors.primary[500];
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '#6B7280';
      case 'rare':
        return '#3B82F6';
      case 'epic':
        return '#8B5CF6';
      case 'legendary':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPostPress?.(post.id)}
      activeOpacity={0.98}
    >
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.gradient}
      >
        {/* Post Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => onUserPress?.(post.user.id)}
          >
            <View style={styles.avatarContainer}>
              <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
              {post.user.level && (
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>{post.user.level}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{post.user.name}</Text>
                {post.user.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedIcon}>✓</Text>
                  </View>
                )}
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.userHandle}>{post.user.username}</Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.timeAgo}>{post.timeAgo}</Text>
                {post.location && (
                  <>
                    <Text style={styles.separator}>•</Text>
                    <Text style={styles.location}>{post.location}</Text>
                  </>
                )}
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <View style={styles.postTypeIndicator}>
              {getPostTypeIcon()}
            </View>
            <TouchableOpacity style={styles.moreButton}>
              <MoreHorizontal size={20} color={DesignTokens.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Post Content */}
        <Text style={styles.content}>{post.content}</Text>

        {/* Media Content */}
        {post.media && (
          <View style={styles.mediaContainer}>
            {post.media.type === 'image' ? (
              <Image source={{ uri: post.media.url }} style={styles.mediaImage} />
            ) : (
              <View style={styles.videoContainer}>
                <Image source={{ uri: post.media.thumbnail || post.media.url }} style={styles.mediaImage} />
                <View style={styles.playButton}>
                  <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                </View>
              </View>
            )}
          </View>
        )}

        {/* Workout Stats */}
        {post.type === 'workout_complete' && post.stats && (
          <View style={styles.workoutStats}>
            <LinearGradient
              colors={['#00D4AA20', '#00D4AA10']}
              style={styles.statsGradient}
            >
              {post.workout && (
                <View style={styles.workoutName}>
                  <Target size={16} color="#00D4AA" />
                  <Text style={styles.workoutNameText}>{post.workout}</Text>
                </View>
              )}
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Calendar size={16} color="#00D4AA" />
                  <Text style={styles.statText}>{post.stats.duration} min</Text>
                </View>
                <View style={styles.statItem}>
                  <Flame size={16} color="#FF6B35" />
                  <Text style={styles.statText}>{post.stats.calories} cal</Text>
                </View>
                {post.stats.exercises && (
                  <View style={styles.statItem}>
                    <Zap size={16} color="#9E7FFF" />
                    <Text style={styles.statText}>{post.stats.exercises} exercises</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Achievement Display */}
        {post.type === 'achievement' && post.achievement && (
          <View style={styles.achievementContainer}>
            <LinearGradient
              colors={[`${getRarityColor(post.achievement.rarity)}30`, `${getRarityColor(post.achievement.rarity)}10`]}
              style={styles.achievementGradient}
            >
              <View style={styles.achievementContent}>
                <View style={[styles.achievementIcon, { backgroundColor: `${getRarityColor(post.achievement.rarity)}40` }]}>
                  <Text style={styles.achievementEmoji}>{post.achievement.icon}</Text>
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>{post.achievement.name}</Text>
                  <Text style={[styles.achievementRarity, { color: getRarityColor(post.achievement.rarity) }]}>
                    {post.achievement.rarity.toUpperCase()} ACHIEVEMENT
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Post Actions */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, isLiked && styles.likedButton]}
            onPress={handleLike}
          >
            <Heart 
              size={20} 
              color={isLiked ? "#FF6B35" : DesignTokens.colors.text.secondary}
              fill={isLiked ? "#FF6B35" : "transparent"}
            />
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {likeCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onComment?.(post.id)}
          >
            <MessageCircle size={20} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onShare?.(post.id)}
          >
            <Share2 size={20} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.actionText}>{post.shares}</Text>
          </TouchableOpacity>
        </View>

        {/* Engagement Indicator */}
        <View style={[styles.engagementBar, { backgroundColor: getPostTypeColor() }]} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    ...DesignTokens.shadow.lg,
  },
  gradient: {
    padding: DesignTokens.spacing[5],
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[4],
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: DesignTokens.spacing[3],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: DesignTokens.colors.primary[500],
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: DesignTokens.colors.surface.primary,
  },
  levelText: {
    fontSize: 10,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[1],
  },
  userName: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginRight: DesignTokens.spacing[2],
  },
  verifiedBadge: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    fontSize: 10,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userHandle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  separator: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.tertiary,
    marginHorizontal: DesignTokens.spacing[2],
  },
  timeAgo: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  location: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  postTypeIndicator: {
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.sm,
    backgroundColor: DesignTokens.colors.surface.tertiary,
  },
  moreButton: {
    padding: DesignTokens.spacing[2],
  },
  content: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    lineHeight: 24,
    marginBottom: DesignTokens.spacing[4],
  },
  mediaContainer: {
    marginBottom: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  videoContainer: {
    position: 'relative',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutStats: {
    marginBottom: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: DesignTokens.spacing[4],
  },
  workoutName: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
    gap: DesignTokens.spacing[2],
  },
  workoutNameText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  achievementContainer: {
    marginBottom: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  achievementGradient: {
    padding: DesignTokens.spacing[4],
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  achievementRarity: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: DesignTokens.spacing[4],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
    gap: DesignTokens.spacing[6],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  likedButton: {
    // Additional styling for liked state if needed
  },
  actionText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  likedText: {
    color: '#FF6B35',
  },
  engagementBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});
