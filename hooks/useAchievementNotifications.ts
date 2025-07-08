import { useState, useEffect, useCallback } from 'react';
import { Achievement } from '@/types/achievement';
import { useAchievements } from '@/contexts/AchievementContext';

interface NotificationItem {
  id: string;
  achievement: Achievement;
  timestamp: number;
  type: 'toast' | 'modal' | 'celebration';
  shown: boolean;
}

interface AchievementNotificationState {
  notifications: NotificationItem[];
  currentNotification: NotificationItem | null;
  isProcessing: boolean;
}

export function useAchievementNotifications() {
  const { achievements, checkAchievements } = useAchievements();
  const [state, setState] = useState<AchievementNotificationState>({
    notifications: [],
    currentNotification: null,
    isProcessing: false,
  });

  // Check for new achievements periodically
  useEffect(() => {
    const checkForNewAchievements = async () => {
      if (state.isProcessing) return;

      try {
        setState(prev => ({ ...prev, isProcessing: true }));
        
        const newUnlocks = await checkAchievements();
        
        if (newUnlocks.length > 0) {
          const newNotifications: NotificationItem[] = newUnlocks.map(achievement => ({
            id: `${achievement.id}-${Date.now()}-${Math.random()}`,
            achievement,
            timestamp: Date.now(),
            type: getNotificationType(achievement),
            shown: false,
          }));
          
          setState(prev => ({
            ...prev,
            notifications: [...prev.notifications, ...newNotifications],
            isProcessing: false,
          }));
        } else {
          setState(prev => ({ ...prev, isProcessing: false }));
        }
      } catch (error) {
        console.error('Error checking achievements:', error);
        setState(prev => ({ ...prev, isProcessing: false }));
      }
    };

    // Check immediately and then every 5 seconds
    checkForNewAchievements();
    const interval = setInterval(checkForNewAchievements, 5000);
    
    return () => clearInterval(interval);
  }, [achievements, state.isProcessing]);

  // Process notification queue
  useEffect(() => {
    if (state.notifications.length > 0 && !state.currentNotification) {
      const nextNotification = state.notifications.find(n => !n.shown);
      if (nextNotification) {
        setState(prev => ({
          ...prev,
          currentNotification: nextNotification,
        }));
      }
    }
  }, [state.notifications, state.currentNotification]);

  const getNotificationType = (achievement: Achievement): 'toast' | 'modal' | 'celebration' => {
    // Legendary achievements get full celebration
    if (achievement.rarity === 'legendary') {
      return 'celebration';
    }
    
    // Epic achievements get modal
    if (achievement.rarity === 'epic') {
      return 'modal';
    }
    
    // Common and rare get toast
    return 'toast';
  };

  const markNotificationShown = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === notificationId ? { ...n, shown: true } : n
      ),
      currentNotification: null,
    }));
  }, []);

  const dismissNotification = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== notificationId),
      currentNotification: prev.currentNotification?.id === notificationId ? null : prev.currentNotification,
    }));
  }, []);

  const dismissAllNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: [],
      currentNotification: null,
    }));
  }, []);

  const getUnshownNotifications = useCallback(() => {
    return state.notifications.filter(n => !n.shown);
  }, [state.notifications]);

  const getNotificationsByType = useCallback((type: 'toast' | 'modal' | 'celebration') => {
    return state.notifications.filter(n => n.type === type && !n.shown);
  }, [state.notifications]);

  // Manual trigger for testing
  const triggerTestNotification = useCallback((achievement: Achievement) => {
    const testNotification: NotificationItem = {
      id: `test-${achievement.id}-${Date.now()}`,
      achievement,
      timestamp: Date.now(),
      type: getNotificationType(achievement),
      shown: false,
    };
    
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, testNotification],
    }));
  }, []);

  return {
    // State
    notifications: state.notifications,
    currentNotification: state.currentNotification,
    isProcessing: state.isProcessing,
    
    // Actions
    markNotificationShown,
    dismissNotification,
    dismissAllNotifications,
    
    // Getters
    getUnshownNotifications,
    getNotificationsByType,
    
    // Utils
    triggerTestNotification,
    hasUnshownNotifications: getUnshownNotifications().length > 0,
    unshownCount: getUnshownNotifications().length,
  };
}
