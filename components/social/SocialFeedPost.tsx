import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  MapPin,
  Clock,
  Dumbbell,
  Trophy,
  Camera,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { SocialPost } from '@/contexts/SocialContext';
import * as Haptics from 'expo-haptics';

interface SocialFeedPostProps {
  post: SocialPost;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onUserPress: (userId: string) => void;
  onPostPress: (postId: string) => void;
  onMorePress?: (postId: string) => void;
  showFullContent?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export function SocialFeedPost({
  post,
  onLike,
  onComment,
  onShare,
  onUserPress,
  onPostPress,
  onMorePress,
  showFullContent = false,
  variant = 'default',
}: SocialFeedPostProps) {
  const [showFullText, setShowFullText] = useState(showFullContent);

  const handleLike = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLike(post.id);
  };

  const handleComment = () => {
    onComment(post.id);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this post from ${post.username}: ${post.content}`,
        title: 'GymVerse Post',
      });
      onShare(post.id);
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleMorePress = () => {
    if (onMorePress) {
      onMorePress(post.id);
    } else {
      Alert.alert(
        'Post Options',
        'What would you like to do?',
        [
          { text: 'Report', style: 'destructive' },
          { text: 'Hide', style: 'default' },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const getPostTypeIcon = () => {
    switch (post.type) {
      case 'workout_complete':
        return <Dumbbell size={16} color={DesignTokens.colors.primary[500]} />;
      case 'achievement':
        return <Trophy size={16} color="#FFD700" />;
      case 'progress_photo':
        return <Camera size={16} color="#4ECDC4" />;
      case 'milestone':
        return <Target size={16} color="#FF6B35" />;
      case 'personal_record':
        return <TrendingUp size={16} color="#96CEB4" />;
      default:
        return <Zap size={16} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const getPostTypeColor = () => {
    switch (post.type) {
      case 'workout_complete':
        return DesignTokens.colors.primary[500];
      case 'achievement':
        return '#FFD700';
      case 'progress_photo':
        return '#4ECDC4';
      case 'milestone':
        return '#FF6B35';
      case 'personal_record':
        return '#96CEB4';
      default:
        return DesignTokens.colors.text.secondary;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return postTime.toLocaleDateString();
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength || showFullText) return content;
    return content.substring(0, maxLength) + '...';
  };

  const renderWorkoutData = () => {
    if (!post.workoutData) return null;

    return (
      <View style={styles.workoutDataContainer}>
        <LinearGradient
          colors={['#1a1a1a', '#2a2a2a']}
          style={styles.workoutDataGradient}
        >
          <View style={styles.workoutDataHeader}>
            <Dumbbell size={16} color={DesignTokens.colors.primary[500]} />
            <Text style={styles.workoutDataTitle}>{post.workoutData.name}</Text>
          </View>
          <View style={styles.workoutStats}>
            <View style={styles.workoutStat}>
              <Clock size={14} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.workoutStatText}>
                {Math.round(post.workoutData.duration / 60)}min
              </Text>
            </View>
            <View style={styles.workoutStat}>
              <Target size={14} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.workoutStatText}>
                {post.workoutData.exercises} exercises
              </Text>
            </View>
            {post.workoutData.calories && (
              <View style={styles.workoutStat}>
                <Zap size={14} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.workoutStatText}>
                  {post.workoutData.calories} cal
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderAchievementData = () => {
    if (!post.achievementData) return null;

    const getRarityColor = (rarity: string) => {
      switch (rarity) {
        case 'legendary': return '#FF6B35';
        case 'epic': return '#9E7FFF';
        case 'rare': return '#4ECDC4';
        default: return '#96CEB4';
      }
    };

    return (
      <View style={styles.achievementContainer}>
        <LinearGradient
          colors={[getRarityColor(post.achievementData.rarity) + '20', getRarityColor(post.achievementData.rarity) + '10']}
          style={styles.achievementGradient}
        >
          <View style={styles.achievementHeader}>
            <Text style={styles.achievementIcon}>{post.achievementData.icon}</Text>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>{post.achievementData.name}</Text>
              <Text style={styles.achievementRarity}>
                {post.achievementData.rarity.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.achievementDescription}>
            {post.achievementData.description}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  const renderProgressPhoto = () => {
    if (!post.photoData) return null;

    return (
      <View style={styles.photoContainer}>
        <Image source={{ uri: post.photoData.imageUri }} style={styles.progressPhoto} />
        {post.photoData.description && (
          <Text style={styles.photoDescription}>{post.photoData.description}</Text>
        )}
        {post.photoData.measurements && (
          <View style={styles.measurementsContainer}>
            {Object.entries(post.photoData.measurements).map(([key, value]) => (
              <View key={key} style={styles.measurement}>
                <Text style={styles.measurementLabel}>{key}</Text>
                <Text style={styles.measurementValue}>{value}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderPersonalRecord = () => {
    if (!post.recordData) return null;

    return (
      <View style={styles.recordContainer}>
        <LinearGradient
          colors={['#96CEB4', '#8BC34A']}
          style={styles.recordGradient}
        >
          <View style={styles.recordHeader}>
            <TrendingUp size={20} color="#FFFFFF" />
            <Text style={styles.recordTitle}>Personal Record</Text>
          </View>
          <View style={styles.recordDetails}>
            <Text style={styles.recordExercise}>{post.recordData.exerciseName}</Text>
            <View style={styles.recordValues}>
              <Text style={styles.recordPrevious}>
                {post.recordData.previousValue}{post.recordData.unit}
              </Text>
              <Text style={styles.recordArrow}>→</Text>
              <Text style={styles.recordNew}>
                {post.recordData.newValue}{post.recordData.unit}
              </Text>
            </View>
            <Text style={styles.recordImprovement}>
              +{post.recordData.improvement.toFixed(1)}% improvement
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={() => onPostPress(post.id)}>
        <View style={styles.compactHeader}>
          <TouchableOpacity onPress={() => onUserPress(post.userId)}>
            <Image source={{ uri: post.userAvatar }} style={styles.compactAvatar} />
          </TouchableOpacity>
          <View style={styles.compactInfo}>
            <Text style={styles.compactUsername}>{post.username}</Text>
            <Text style={styles.compactTime}>{formatTimeAgo(post.timestamp)}</Text>
          </View>
          {getPostTypeIcon()}
        </View>
        <Text style={styles.compactContent} numberOfLines={2}>
          {post.content}
        </Text>
        <View style={styles.compactEngagement}>
          <Text style={styles.compactEngagementText}>
            {post.likes} likes • {post.comments.length} comments
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, variant === 'detailed' && styles.detailedContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => onUserPress(post.userId)}
        >
          <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
          <View style={styles.userDetails}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{post.username}</Text>
              {getPostTypeIcon()}
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.timestamp}>{formatTimeAgo(post.timestamp)}</Text>
              {post.location && (
                <>
                  <Text style={styles.separator}>•</Text>
                  <MapPin size={12} color={DesignTokens.colors.text.tertiary} />
                  <Text style={styles.location}>{post.location}</Text>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
          <MoreHorizontal size={20} color={DesignTokens.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <TouchableOpacity 
        style={styles.contentContainer}
        onPress={() => onPostPress(post.id)}
        activeOpacity={0.95}
      >
        <Text style={styles.content}>
          {truncateContent(post.content)}
        </Text>
        {post.content.length > 150 && !showFullText && (
          <TouchableOpacity onPress={() => setShowFullText(true)}>
            <Text style={styles.readMore}>Read more</Text>
          </TouchableOpacity>
        )}

        {/* Post Type Specific Content */}
        {renderWorkoutData()}
        {renderAchievementData()}
        {renderProgressPhoto()}
        {renderPersonalRecord()}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>

      {/* Engagement */}
      <View style={styles.engagementContainer}>
        <View style={styles.engagementStats}>
          <Text style={styles.engagementText}>
            {post.likes} likes • {post.comments.length} comments • {post.shares} shares
          </Text>
        </View>
        <View style={styles.engagementActions}>
          <TouchableOpacity 
            style={[styles.actionButton, post.isLiked && styles.actionButtonActive]}
            onPress={handleLike}
          >
            <Heart 
              size={20} 
              color={post.isLiked ? '#ef4444' : DesignTokens.colors.text.secondary}
              fill={post.isLiked ? '#ef4444' : 'none'}
            />
            <Text style={[
              styles.actionText,
              post.isLiked && styles.actionTextActive
            ]}>
              {post.likes}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <MessageCircle size={20} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.actionText}>{post.comments.length}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share2 size={20} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.actionText}>{post.shares}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments Preview */}
      {post.comments.length > 0 && variant === 'detailed' && (
        <View style={styles.commentsPreview}>
          {post.comments.slice(0, 2).map((comment) => (
            <View key={comment.id} style={styles.commentPreview}>
              <Text style={styles.commentUsername}>{comment.username}</Text>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))}
          {post.comments.length > 2 && (
            <TouchableOpacity onPress={handleComment}>
              <Text style={styles.viewAllComments}>
                View all {post.comments.length} comments
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.surface.primary,
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    ...DesignTokens.shadow.sm,
  },
  detailedContainer: {
    marginHorizontal: 0,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  compactContainer: {
    backgroundColor: DesignTokens.colors.surface.primary,
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[3],
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: DesignTokens.spacing[3],
  },
  compactAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: DesignTokens.spacing[2],
  },
  userDetails: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  username: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: DesignTokens.spacing[1],
    gap: DesignTokens.spacing[1],
  },
  timestamp: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  separator: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.tertiary,
  },
  location: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.tertiary,
  },
  moreButton: {
    padding: DesignTokens.spacing[1],
  },
  contentContainer: {
    marginBottom: DesignTokens.spacing[4],
  },
  content: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    lineHeight: 22,
    marginBottom: DesignTokens.spacing[2],
  },
  readMore: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  workoutDataContainer: {
    marginTop: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    overflow: 'hidden',
  },
  workoutDataGradient: {
    padding: DesignTokens.spacing[3],
  },
  workoutDataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[2],
  },
  workoutDataTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[4],
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  workoutStatText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  achievementContainer: {
    marginTop: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    overflow: 'hidden',
  },
  achievementGradient: {
    padding: DesignTokens.spacing[3],
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[2],
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  achievementRarity: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  achievementDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  photoContainer: {
    marginTop: DesignTokens.spacing[3],
  },
  progressPhoto: {
    width: '100%',
    height: 200,
    borderRadius: DesignTokens.borderRadius.md,
    marginBottom: DesignTokens.spacing[2],
  },
  photoDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[2],
  },
  measurementsContainer: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[4],
  },
  measurement: {
    alignItems: 'center',
  },
  measurementLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    textTransform: 'uppercase',
  },
  measurementValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[1],
  },
  recordContainer: {
    marginTop: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    overflow: 'hidden',
  },
  recordGradient: {
    padding: DesignTokens.spacing[3],
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[2],
  },
  recordTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  recordDetails: {
    alignItems: 'center',
  },
  recordExercise: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: DesignTokens.spacing[2],
  },
  recordValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[1],
  },
  recordPrevious: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  recordArrow: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  recordNew: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  recordImprovement: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
    marginTop: DesignTokens.spacing[2],
  },
  tag: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  tagText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  engagementContainer: {
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
    paddingTop: DesignTokens.spacing[3],
  },
  engagementStats: {
    marginBottom: DesignTokens.spacing[3],
  },
  engagementText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  engagementActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
  },
  actionButtonActive: {
    backgroundColor: '#ef444420',
  },
  actionText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  actionTextActive: {
    color: '#ef4444',
  },
  commentsPreview: {
    marginTop: DesignTokens.spacing[3],
    paddingTop: DesignTokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
  },
  commentPreview: {
    flexDirection: 'row',
    marginBottom: DesignTokens.spacing[2],
    gap: DesignTokens.spacing[2],
  },
  commentUsername: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  commentContent: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    flex: 1,
  },
  viewAllComments: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.tertiary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  compactInfo: {
    flex: 1,
  },
  compactUsername: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  compactTime: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  compactContent: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    lineHeight: 18,
    marginBottom: DesignTokens.spacing[2],
  },
  compactEngagement: {
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
    paddingTop: DesignTokens.spacing[2],
  },
  compactEngagementText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
});
