import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSocial, SocialActivity } from '@/contexts/SocialContext';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: string;
  isRead: boolean;
  type: 'social' | 'workout' | 'achievement' | 'reminder' | 'system';
  priority: 'low' | 'normal' | 'high';
  actionable?: boolean;
  actions?: Array<{
    id: string;
    title: string;
    type: 'primary' | 'secondary' | 'destructive';
  }>;
}

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  types: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    achievements: boolean;
    workouts: boolean;
    milestones: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const STORAGE_KEYS = {
  NOTIFICATIONS: '@notifications',
  SETTINGS: '@notification_settings',
  PUSH_TOKEN: '@push_token',
};

const DEFAULT_SETTINGS: NotificationSettings = {
  pushNotifications: true,
  emailNotifications: false,
  soundEnabled: true,
  vibrationEnabled: true,
  types: {
    likes: true,
    comments: true,
    follows: true,
    achievements: true,
    workouts: false,
    milestones: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

export function useNotifications() {
  const { activities } = useSocial();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize notifications
  useEffect(() => {
    initializeNotifications();
  }, []);

  // Convert social activities to notifications
  useEffect(() => {
    if (isInitialized) {
      convertActivitiesToNotifications();
    }
  }, [activities, isInitialized]);

  const initializeNotifications = async () => {
    try {
      // Load stored data
      const [storedNotifications, storedSettings, storedToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN),
      ]);

      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }

      if (storedToken) {
        setPushToken(storedToken);
      }

      // Configure notification behavior
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: settings.soundEnabled,
          shouldSetBadge: true,
        }),
      });

      // Request permissions and get push token
      if (settings.pushNotifications) {
        await requestPermissions();
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing notifications:', error);
      setIsInitialized(true);
    }
  };

  const requestPermissions = async () => {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setPushToken(token);
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };

  const convertActivitiesToNotifications = useCallback(() => {
    const newNotifications: NotificationItem[] = activities.map((activity) => ({
      id: `activity_${activity.id}`,
      title: getNotificationTitle(activity),
      body: activity.content,
      data: { activityId: activity.id, type: 'social_activity' },
      timestamp: activity.timestamp,
      isRead: activity.isRead,
      type: 'social' as const,
      priority: getPriority(activity.type),
      actionable: true,
      actions: getNotificationActions(activity),
    }));

    setNotifications(prev => {
      // Merge with existing non-activity notifications
      const nonActivityNotifications = prev.filter(n => !n.id.startsWith('activity_'));
      return [...newNotifications, ...nonActivityNotifications].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });
  }, [activities]);

  const getNotificationTitle = (activity: SocialActivity): string => {
    switch (activity.type) {
      case 'like':
        return `${activity.username} liked your post`;
      case 'comment':
        return `${activity.username} commented on your post`;
      case 'follow':
        return `${activity.username} started following you`;
      case 'achievement':
        return 'New achievement unlocked!';
      case 'workout':
        return 'Workout completed!';
      case 'milestone':
        return 'Milestone reached!';
      default:
        return 'New activity';
    }
  };

  const getPriority = (type: SocialActivity['type']): NotificationItem['priority'] => {
    switch (type) {
      case 'achievement':
      case 'milestone':
        return 'high';
      case 'follow':
      case 'comment':
        return 'normal';
      default:
        return 'low';
    }
  };

  const getNotificationActions = (activity: SocialActivity): NotificationItem['actions'] => {
    switch (activity.type) {
      case 'like':
      case 'comment':
        return [
          { id: 'view', title: 'View Post', type: 'primary' },
          { id: 'dismiss', title: 'Dismiss', type: 'secondary' },
        ];
      case 'follow':
        return [
          { id: 'view_profile', title: 'View Profile', type: 'primary' },
          { id: 'follow_back', title: 'Follow Back', type: 'secondary' },
        ];
      default:
        return [
          { id: 'view', title: 'View', type: 'primary' },
          { id: 'dismiss', title: 'Dismiss', type: 'secondary' },
        ];
    }
  };

  const createNotification = async (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: `notification_${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));

    // Send push notification if enabled and not in quiet hours
    if (settings.pushNotifications && !isInQuietHours() && shouldSendNotification(notification.type)) {
      await sendPushNotification(newNotification);
    }

    return newNotification;
  };

  const isInQuietHours = (): boolean => {
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = settings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  const shouldSendNotification = (type: string): boolean => {
    switch (type) {
      case 'social':
        return true; // Social notifications are controlled by individual type settings
      case 'workout':
        return settings.types.workouts;
      case 'achievement':
        return settings.types.achievements;
      default:
        return true;
    }
  };

  const sendPushNotification = async (notification: NotificationItem) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: settings.soundEnabled ? 'default' : undefined,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    setNotifications(updatedNotifications);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
  };

  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updatedNotifications);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
  };

  const clearAll = async () => {
    setNotifications([]);
    await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  };

  const deleteNotification = async (notificationId: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    setNotifications(updatedNotifications);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
  };

  const updateSettings = async (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));

    // Request/revoke permissions based on settings
    if (newSettings.pushNotifications && !pushToken) {
      await requestPermissions();
    }

    // Update notification handler
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: newSettings.soundEnabled,
        shouldSetBadge: true,
      }),
    });
  };

  // Scheduled notifications for workouts, reminders, etc.
  const scheduleWorkoutReminder = async (time: Date, message: string) => {
    if (!settings.types.workouts || !settings.pushNotifications) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Workout Reminder',
          body: message,
          data: { type: 'workout_reminder' },
          sound: settings.soundEnabled ? 'default' : undefined,
        },
        trigger: {
          date: time,
        },
      });
    } catch (error) {
      console.error('Error scheduling workout reminder:', error);
    }
  };

  const cancelScheduledNotification = async (identifier: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling scheduled notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    settings,
    pushToken,
    isInitialized,
    
    // Actions
    createNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    updateSettings,
    
    // Scheduled notifications
    scheduleWorkoutReminder,
    cancelScheduledNotification,
    
    // Utilities
    isInQuietHours,
    shouldSendNotification,
  };
}
