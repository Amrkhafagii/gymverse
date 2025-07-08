import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Trophy,
  Target,
  Users,
  Calendar,
  Settings,
  Check,
  Trash2,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useNotifications, SocialNotification } from '@/hooks/useNotifications';
import * as Haptics from 'expo-haptics';

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
  onActivityPress: (activityId: string) => void;
  onUserPress: (userId: string) => void;
}

export function NotificationCenter({
  visible,
  onClose,
  onActivityPress,
  onUserPress,
}: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all');

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: SocialNotification) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'share':
        if (notification.relatedId) {
          onActivityPress(notification.relatedId);
        }
        break;
      case 'follow':
      case 'friend_request':
        if (notification.fromUserId) {
          onUserPress(notification.fromUserId);
        }
        break;
      case 'achievement':
      case 'milestone':
      case 'challenge_invite':
        if (notification.relatedId) {
          onActivityPress(notification.relatedId);
        }
        break;
    }
    
    onClose();
  };

  const handleMarkAllRead = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await markAllAsRead();
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type: SocialNotification['type']) => {
    switch (type) {
      case 'like':
        return <Heart size={16} color={DesignTokens.colors.error[500]} />;
      case 'comment':
        return <MessageCircle size={16} color={DesignTokens.colors.primary[500]} />;
      case 'follow':
        return <UserPlus size={16} color={DesignTokens.colors.success[500]} />;
      case 'achievement':
        return <Trophy size={16} color="#FFD700" />;
      case 'milestone':
        return <Target size={16} color={DesignTokens.colors.warning[500]} />;
      case 'challenge_invite':
        return <Users size={16} color={DesignTokens.colors.info[500]} />;
      case 'friend_request':
        return <UserPlus size={16} color={DesignTokens.colors.primary[500]} />;
      case 'share':
        return <Users size={16} color={DesignTokens.colors.success[500]} />;
      default:
        return <Bell size={16} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationTime.toLocaleDateString();
  };

  const filteredNotifications = selectedTab === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const renderNotification = ({ item }: { item: SocialNotification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.notificationItemUnread
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIcon}>
            {getNotificationIcon(item.type)}
          </View>
          {item.fromUserAvatar && (
            <Image 
              source={{ uri: item.fromUserAvatar }} 
              style={styles.notificationAvatar} 
            />
          )}
          <View style={styles.notificationInfo}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationTime}>
              {formatTimeAgo(item.timestamp)}
            </Text>
          </View>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteNotification(item.id)}
      >
        <Trash2 size={16} color={DesignTokens.colors.text.tertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const TabButton = ({ 
    tab, 
    label, 
    count 
  }: { 
    tab: 'all' | 'unread'; 
    label: string; 
    count?: number;
  }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        selectedTab === tab && styles.tabButtonActive
      ]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text style={[
        styles.tabButtonText,
        selectedTab === tab && styles.tabButtonTextActive
      ]}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={DesignTokens.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
                <Check size={20} color={DesignTokens.colors.primary[500]} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={20} color={DesignTokens.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TabButton tab="all" label="All" count={notifications.length} />
          <TabButton tab="unread" label="Unread" count={unreadCount} />
        </View>

        {/* Notifications List */}
        <View style={styles.content}>
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell size={48} color={DesignTokens.colors.text.tertiary} />
              <Text style={styles.emptyStateTitle}>
                {selectedTab === 'unread' ? 'No unread notifications' : 'No notifications'}
              </Text>
              <Text style={styles.emptyStateText}>
                {selectedTab === 'unread' 
                  ? 'All caught up! Check back later for new updates.'
                  : 'When you get notifications, they\'ll appear here.'
                }
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredNotifications}
              renderItem={renderNotification}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={styles.notificationsList}
            />
          )}
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  closeButton: {
    padding: DesignTokens.spacing[2],
  },
  headerTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  markAllButton: {
    padding: DesignTokens.spacing[2],
  },
  settingsButton: {
    padding: DesignTokens.spacing[2],
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
    gap: DesignTokens.spacing[1],
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  tabButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  tabButtonTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  tabBadge: {
    backgroundColor: DesignTokens.colors.error[500],
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[1],
  },
  tabBadgeText: {
    fontSize: 10,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  notificationsList: {
    padding: DesignTokens.spacing[5],
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[3],
    gap: DesignTokens.spacing[3],
  },
  notificationItemUnread: {
    backgroundColor: DesignTokens.colors.primary[500] + '10',
    borderLeftWidth: 3,
    borderLeftColor: DesignTokens.colors.primary[500],
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: DesignTokens.spacing[3],
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignTokens.colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  notificationMessage: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
    marginBottom: DesignTokens.spacing[1],
  },
  notificationTime: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DesignTokens.colors.primary[500],
  },
  deleteButton: {
    padding: DesignTokens.spacing[2],
  },
});
