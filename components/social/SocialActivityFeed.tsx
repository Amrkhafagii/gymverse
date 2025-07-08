import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Heart,
  MessageCircle,
  UserPlus,
  Trophy,
  Target,
  Share2,
  Flame,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { SocialActivity, useSocial } from '@/contexts/SocialContext';
import { formatDistanceToNow } from 'date-fns';
import * as Haptics from 'expo-haptics';

interface SocialActivityFeedProps {
  onActivityPress?: (activity: SocialActivity) => void;
  onUserPress?: (userId: string) => void;
  variant?: 'full' | 'compact';
  maxItems?: number;
}

export function SocialActivityFeed({
  onActivityPress,
  onUserPress,
  variant = 'full',
  maxItems,
}: SocialActivityFeedProps) {
  const { activities, markActivityAsRead, markAllActivitiesAsRead } = useSocial();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const displayActivities = maxItems ? activities.slice(0, maxItems) : activities;

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleActivityPress = async (activity: SocialActivity) => {
    if (!activity.isRead) {
      await markActivityAsRead(activity.id);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onActivityPress?.(activity);
  };

  const handleUserPress = (userId: string) => {
    onUserPress?.(userId);
  };

  const getActivityIcon = (type: SocialActivity['type']) => {
    const iconProps = {
      size: variant === 'compact' ? 16 : 20,
      color: DesignTokens.colors.primary[500],
    };

    switch (type) {
      case 'like':
        return <Heart {...iconProps} fill={iconProps.color} />;
      case 'comment':
        return <MessageCircle {...iconProps} />;
      case 'follow':
        return <UserPlus {...iconProps} />;
      case 'achievement':
        return <Trophy {...iconProps} />;
      case 'workout':
        return <Target {...iconProps} />;
      case 'milestone':
        return <Award {...iconProps} />;
      default:
        return <TrendingUp {...iconProps} />;
    }
  };

  const getActivityColor = (type: SocialActivity['type']) => {
    switch (type) {
      case 'like':
        return '#ef4444';
      case 'comment':
        return '#3b82f6';
      case 'follow':
        return '#10b981';
      case 'achievement':
        return '#f59e0b';
      case 'workout':
        return '#8b5cf6';
      case 'milestone':
        return '#06b6d4';
      default:
        return DesignTokens.colors.primary[500];
    }
  };

  const renderActivity = ({ item }: { item: SocialActivity }) => (
    <TouchableOpacity
      style={[
        styles.activityItem,
        variant === 'compact' && styles.activityItemCompact,
        !item.isRead && styles.activityItemUnread,
      ]}
      onPress={() => handleActivityPress(item)}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={styles.userAvatarContainer}
        onPress={() => handleUserPress(item.userId)}
      >
        <Image source={{ uri: item.userAvatar }} style={styles.userAvatar} />
        <View style={[
          styles.activityIconContainer,
          { backgroundColor: getActivityColor(item.type) }
        ]}>
          {getActivityIcon(item.type)}
        </View>
      </TouchableOpacity>

      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <TouchableOpacity onPress={() => handleUserPress(item.userId)}>
            <Text style={styles.username}>{item.username}</Text>
          </TouchableOpacity>
          <Text style={styles.activityText}>{item.content}</Text>
        </View>

        <View style={styles.activityFooter}>
          <View style={styles.timeContainer}>
            <Clock size={12} color={DesignTokens.colors.text.tertiary} />
            <Text style={styles.timestamp}>
              {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
            </Text>
          </View>
          {!item.isRead && (
            <View style={styles.unreadIndicator}>
              <View style={styles.unreadDot} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <TrendingUp size={48} color={DesignTokens.colors.text.tertiary} />
      <Text style={styles.emptyStateTitle}>No Activity Yet</Text>
      <Text style={styles.emptyStateText}>
        When people interact with your posts or follow you, you'll see it here
      </Text>
    </View>
  );

  const renderHeader = () => {
    if (variant === 'compact') return null;

    const unreadCount = activities.filter(a => !a.isRead).length;

    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Activity</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllReadButton}
            onPress={markAllActivitiesAsRead}
          >
            <CheckCircle size={16} color={DesignTokens.colors.primary[500]} />
            <Text style={styles.markAllReadText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DesignTokens.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading activity...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, variant === 'compact' && styles.containerCompact]}>
      {renderHeader()}
      <FlatList
        data={displayActivities}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          variant === 'full' ? (
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        contentContainerStyle={[
          styles.listContent,
          displayActivities.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerCompact: {
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  headerTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  unreadBadge: {
    backgroundColor: DesignTokens.colors.error[500],
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[2],
  },
  unreadBadgeText: {
    fontSize: 12,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  markAllReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
  },
  markAllReadText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  listContent: {
    paddingVertical: DesignTokens.spacing[2],
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
    backgroundColor: DesignTokens.colors.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  activityItemCompact: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
  },
  activityItemUnread: {
    backgroundColor: DesignTokens.colors.primary[500] + '08',
    borderLeftWidth: 3,
    borderLeftColor: DesignTokens.colors.primary[500],
  },
  userAvatarContainer: {
    position: 'relative',
    marginRight: DesignTokens.spacing[3],
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  activityIconContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: DesignTokens.colors.surface.primary,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    marginBottom: DesignTokens.spacing[2],
  },
  username: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  activityText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  timestamp: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  unreadIndicator: {
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DesignTokens.colors.primary[500],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing[8],
    paddingHorizontal: DesignTokens.spacing[8],
    gap: DesignTokens.spacing[4],
  },
  emptyStateTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: DesignTokens.spacing[4],
  },
  loadingText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
});
