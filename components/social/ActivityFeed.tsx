import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import {
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  Target,
  Users,
  TrendingUp,
  Clock,
  MoreHorizontal,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useSocial } from '@/contexts/SocialContext';
import { formatDistanceToNow } from 'date-fns';
import * as Haptics from 'expo-haptics';

interface ActivityFeedProps {
  onActivityPress?: (activityId: string) => void;
  onUserPress?: (userId: string) => void;
  maxItems?: number;
}

export default function ActivityFeed({
  onActivityPress,
  onUserPress,
  maxItems,
}: ActivityFeedProps) {
  const { activities, isLoading } = useSocial();
  const [refreshing, setRefreshing] = useState(false);
  const [likedActivities, setLikedActivities] = useState<Set<string>>(new Set());

  const displayActivities = maxItems ? activities.slice(0, maxItems) : activities;

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleLike = async (activityId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLikedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const handleComment = async (activityId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onActivityPress?.(activityId);
  };

  const handleShare = async (activityId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Handle share functionality
  };

  const getActivityIcon = (type: string) => {
    const iconProps = { size: 16, color: DesignTokens.colors.primary[500] };
    
    switch (type) {
      case 'workout':
        return <Target {...iconProps} />;
      case 'achievement':
        return <Trophy {...iconProps} />;
      case 'follow':
        return <Users {...iconProps} />;
      case 'like':
        return <Heart {...iconProps} />;
      case 'comment':
        return <MessageCircle {...iconProps} />;
      default:
        return <TrendingUp {...iconProps} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'workout':
        return '#8b5cf6';
      case 'achievement':
        return '#f59e0b';
      case 'follow':
        return '#10b981';
      case 'like':
        return '#ef4444';
      case 'comment':
        return '#3b82f6';
      default:
        return DesignTokens.colors.primary[500];
    }
  };

  const renderActivity = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.activityCard}
      onPress={() => onActivityPress?.(item.id)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.activityHeader}>
        <TouchableOpacity
          style={styles.userSection}
          onPress={() => onUserPress?.(item.userId)}
        >
          <Image source={{ uri: item.userAvatar }} style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{item.username}</Text>
            <View style={styles.activityMeta}>
              <View style={[
                styles.activityTypeIcon,
                { backgroundColor: getActivityColor(item.type) }
              ]}>
                {getActivityIcon(item.type)}
              </View>
              <Text style={styles.timestamp}>
                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={20} color={DesignTokens.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>{item.content}</Text>
        
        {item.workoutData && (
          <View style={styles.workoutPreview}>
            <View style={styles.workoutStats}>
              <View style={styles.workoutStat}>
                <Clock size={14} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.workoutStatText}>
                  {item.workoutData.duration}m
                </Text>
              </View>
              <View style={styles.workoutStat}>
                <Target size={14} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.workoutStatText}>
                  {item.workoutData.exercises} exercises
                </Text>
              </View>
              <View style={styles.workoutStat}>
                <TrendingUp size={14} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.workoutStatText}>
                  {item.workoutData.volume}kg
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.activityActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            likedActivities.has(item.id) && styles.actionButtonActive
          ]}
          onPress={() => handleLike(item.id)}
        >
          <Heart
            size={18}
            color={likedActivities.has(item.id) ? '#ef4444' : DesignTokens.colors.text.secondary}
            fill={likedActivities.has(item.id) ? '#ef4444' : 'none'}
          />
          <Text style={[
            styles.actionText,
            likedActivities.has(item.id) && styles.actionTextActive
          ]}>
            {(item.likes || 0) + (likedActivities.has(item.id) ? 1 : 0)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleComment(item.id)}
        >
          <MessageCircle size={18} color={DesignTokens.colors.text.secondary} />
          <Text style={styles.actionText}>{item.comments || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShare(item.id)}
        >
          <Share2 size={18} color={DesignTokens.colors.text.secondary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <TrendingUp size={48} color={DesignTokens.colors.text.tertiary} />
      <Text style={styles.emptyStateTitle}>No Activity Yet</Text>
      <Text style={styles.emptyStateText}>
        Follow friends and start working out to see activity here
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading activity feed...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={displayActivities}
      renderItem={renderActivity}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={DesignTokens.colors.primary[500]}
        />
      }
      contentContainerStyle={[
        styles.container,
        displayActivities.length === 0 && styles.containerEmpty,
      ]}
      ListEmptyComponent={renderEmptyState}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: DesignTokens.spacing[4],
  },
  containerEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[8],
  },
  loadingText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  activityCard: {
    backgroundColor: DesignTokens.colors.surface.primary,
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
    ...DesignTokens.shadow.base,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[3],
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: DesignTokens.spacing[3],
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  activityTypeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  moreButton: {
    padding: DesignTokens.spacing[1],
  },
  activityContent: {
    marginBottom: DesignTokens.spacing[4],
  },
  activityText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    lineHeight: 22,
    marginBottom: DesignTokens.spacing[3],
  },
  workoutPreview: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  activityActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: DesignTokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
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
    backgroundColor: DesignTokens.colors.error[500] + '20',
  },
  actionText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  actionTextActive: {
    color: '#ef4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[12],
    paddingHorizontal: DesignTokens.spacing[8],
  },
  emptyStateTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[2],
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
