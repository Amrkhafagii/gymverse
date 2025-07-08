import { useState, useEffect, useRef } from 'react';

interface LiveUpdate {
  id: string;
  type: 'new_notification' | 'like' | 'comment' | 'follow' | 'trending' | 'system_update' | 'live_activity';
  title: string;
  message?: string;
  timestamp: string;
  badge?: string;
  priority: 'low' | 'medium' | 'high';
  autoHide?: boolean;
  hideAfter?: number; // milliseconds
}

export function useRealTimeUpdates() {
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Connected');
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Simulate real-time connection
    simulateConnection();
    
    // Generate mock live updates for demo
    generateMockUpdates();

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const simulateConnection = () => {
    // Simulate occasional connection issues
    const connectionInterval = setInterval(() => {
      const shouldDisconnect = Math.random() < 0.05; // 5% chance
      
      if (shouldDisconnect && isConnected) {
        setIsConnected(false);
        setConnectionStatus('Reconnecting...');
        
        // Reconnect after 2-5 seconds
        setTimeout(() => {
          setIsConnected(true);
          setConnectionStatus('Connected');
        }, 2000 + Math.random() * 3000);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(connectionInterval);
  };

  const generateMockUpdates = () => {
    const mockUpdates: Omit<LiveUpdate, 'id' | 'timestamp'>[] = [
      {
        type: 'like',
        title: 'New Like',
        message: 'Alex Rodriguez liked your workout post',
        priority: 'medium',
        badge: '1',
        autoHide: true,
        hideAfter: 5000,
      },
      {
        type: 'comment',
        title: 'New Comment',
        message: 'Jessica Park: "Great form! Keep it up!"',
        priority: 'high',
        badge: '1',
        autoHide: true,
        hideAfter: 7000,
      },
      {
        type: 'follow',
        title: 'New Follower',
        message: 'David Kim started following you',
        priority: 'medium',
        autoHide: true,
        hideAfter: 5000,
      },
      {
        type: 'trending',
        title: 'Trending Now',
        message: 'Your post is trending in #FitnessMotivation',
        priority: 'high',
        badge: '🔥',
        autoHide: true,
        hideAfter: 8000,
      },
      {
        type: 'live_activity',
        title: 'Live Activity',
        message: '3 friends are currently working out',
        priority: 'low',
        autoHide: true,
        hideAfter: 6000,
      },
    ];

    // Randomly show updates every 10-30 seconds
    const scheduleNextUpdate = () => {
      const delay = 10000 + Math.random() * 20000; // 10-30 seconds
      
      updateTimeoutRef.current = setTimeout(() => {
        if (isConnected && mockUpdates.length > 0) {
          const randomUpdate = mockUpdates[Math.floor(Math.random() * mockUpdates.length)];
          addLiveUpdate(randomUpdate);
        }
        scheduleNextUpdate();
      }, delay);
    };

    scheduleNextUpdate();
  };

  const addLiveUpdate = (update: Omit<LiveUpdate, 'id' | 'timestamp'>) => {
    const newUpdate: LiveUpdate = {
      ...update,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };

    setLiveUpdates(prev => {
      // Keep only the latest 5 updates
      const updated = [newUpdate, ...prev].slice(0, 5);
      return updated;
    });

    // Auto-hide if specified
    if (update.autoHide && update.hideAfter) {
      setTimeout(() => {
        dismissUpdate(newUpdate.id);
      }, update.hideAfter);
    }
  };

  const dismissUpdate = (updateId: string) => {
    setLiveUpdates(prev => prev.filter(update => update.id !== updateId));
  };

  const dismissAllUpdates = () => {
    setLiveUpdates([]);
  };

  const simulateNewNotification = () => {
    addLiveUpdate({
      type: 'new_notification',
      title: 'New Notification',
      message: 'You have a new notification',
      priority: 'medium',
      badge: '1',
      autoHide: true,
      hideAfter: 5000,
    });
  };

  const simulateLiveActivity = (activity: string) => {
    addLiveUpdate({
      type: 'live_activity',
      title: 'Live Activity',
      message: activity,
      priority: 'low',
      autoHide: true,
      hideAfter: 6000,
    });
  };

  const simulateSystemUpdate = (message: string) => {
    addLiveUpdate({
      type: 'system_update',
      title: 'System Update',
      message,
      priority: 'high',
      autoHide: false,
    });
  };

  return {
    liveUpdates,
    isConnected,
    connectionStatus,
    addLiveUpdate,
    dismissUpdate,
    dismissAllUpdates,
    simulateNewNotification,
    simulateLiveActivity,
    simulateSystemUpdate,
  };
}
