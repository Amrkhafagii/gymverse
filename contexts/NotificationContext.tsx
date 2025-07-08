import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'achievement' | 'workout' | 'social' | 'challenge' | 'reminder' | 'system';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
  data?: any;
}

export interface NotificationSettings {
  achievementNotifications: boolean;
  workoutReminders: boolean;
  socialNotifications: boolean;
  challengeUpdates: boolean;
  systemNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATIONS_STORAGE_KEY = '@gymverse_notifications';
const SETTINGS_STORAGE_KEY = '@gymverse_notification_settings';

const defaultSettings: NotificationSettings = {
  achievementNotifications: true,
  workoutReminders: true,
  socialNotifications: true,
  challengeUpdates: true,
  systemNotifications: true,
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '07:00',
  },
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    loadSettings();
  }, []);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const parsedNotifications = JSON.parse(stored);
        // Sort by timestamp, newest first
        parsedNotifications.sort((a: Notification, b: Notification) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setNotifications(parsedNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotifications = async (newNotifications: Notification[]) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(newNotifications));
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    // Check if notifications of this type are enabled
    const typeEnabled = getNotificationTypeEnabled(notificationData.type);
    if (!typeEnabled) return;

    // Check quiet hours
    if (settings.quietHours.enabled && isInQuietHours()) {
      // Store notification but don't show immediately
    }

    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const updatedNotifications = [newNotification, ...notifications];
    
    // Keep only last 100 notifications
    if (updatedNotifications.length > 100) {
      updatedNotifications.splice(100);
    }

    await saveNotifications(updatedNotifications);
  };

  const markAsRead = async (notificationId: string) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    );
    await saveNotifications(updatedNotifications);
  };

  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: true,
    }));
    await saveNotifications(updatedNotifications);
  };

  const deleteNotification = async (notificationId: string) => {
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    );
    await saveNotifications(updatedNotifications);
  };

  const clearAllNotifications = async () => {
    await saveNotifications([]);
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    await saveSettings(updatedSettings);
  };

  const getNotificationTypeEnabled = (type: Notification['type']): boolean => {
    switch (type) {
      case 'achievement':
        return settings.achievementNotifications;
      case 'workout':
        return settings.workoutReminders;
      case 'social':
        return settings.socialNotifications;
      case 'challenge':
        return settings.challengeUpdates;
      case 'system':
        return settings.systemNotifications;
      default:
        return true;
    }
  };

  const isInQuietHours = (): boolean => {
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.quietHours.startTime.split(':').map(Number);
    const [endHour, endMin] = settings.quietHours.endTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        settings,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        updateSettings,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
