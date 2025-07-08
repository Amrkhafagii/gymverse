import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SocialNotification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'share' | 'achievement' | 'milestone' | 'challenge_invite' | 'friend_request';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  fromUserId?: string;
  fromUserName?: string;
  fromUserAvatar?: string;
  relatedId?: string; // Post ID, Achievement ID, etc.
  actionUrl?: string;
}

const NOTIFICATIONS_KEY = 'social_notifications';
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

export function useNotifications() {
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    generateMockNotifications(); // For demo purposes
  }, []);

  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    setUnreadCount(unread);
  }, [notifications]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.sort((a: SocialNotification, b: SocialNotification) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotifications = async (notifs: SocialNotification[]) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const addNotification = (notification: Omit<SocialNotification, 'id' | 'timestamp'>) => {
    const newNotification: SocialNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      saveNotifications(updated);
      return updated;
    });
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      saveNotifications(updated);
      return updated;
    });
  };

  const markAllAsRead = async () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      saveNotifications(updated);
      return updated;
    });
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notificationId);
      saveNotifications(updated);
      return updated;
    });
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
  };

  const refreshNotifications = async () => {
    // In a real app, this would fetch from server
    await loadNotifications();
  };

  // Mock notification generator for demo
  const generateMockNotifications = () => {
    const mockNotifications: SocialNotification[] = [
      {
        id: '1',
        type: 'like',
        title: 'New Like',
        message: 'Alex Rodriguez liked your workout post',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        isRead: false,
        fromUserId: 'user1',
        fromUserName: 'Alex Rodriguez',
        fromUserAvatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
        relatedId: 'post1',
      },
      {
        id: '2',
        type: 'comment',
        title: 'New Comment',
        message: 'Jessica Park commented on your progress photo',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        isRead: false,
        fromUserId: 'user2',
        fromUserName: 'Jessica Park',
        fromUserAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
        relatedId: 'post2',
      },
      {
        id: '3',
        type: 'follow',
        title: 'New Follower',
        message: 'David Kim started following you',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        isRead: true,
        fromUserId: 'user3',
        fromUserName: 'David Kim',
        fromUserAvatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: '4',
        type: 'achievement',
        title: 'Achievement Unlocked',
        message: 'You earned the "Consistency Champion" badge!',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        isRead: true,
        relatedId: 'achievement1',
      },
      {
        id: '5',
        type: 'challenge_invite',
        title: 'Challenge Invitation',
        message: 'Maria Santos invited you to join the "30-Day Push-Up Challenge"',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        isRead: false,
        fromUserId: 'user4',
        fromUserName: 'Maria Santos',
        fromUserAvatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
        relatedId: 'challenge1',
      },
    ];

    // Only set mock notifications if no notifications exist
    if (notifications.length === 0) {
      setNotifications(mockNotifications);
      saveNotifications(mockNotifications);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications,
  };
}
