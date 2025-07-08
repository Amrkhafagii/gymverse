import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Bell, TrendingUp, Heart, MessageCircle, UserPlus } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { SocialNotificationBadge } from './SocialNotificationBadge';
import { useNotifications } from '@/hooks/useNotifications';
import { useSocial } from '@/contexts/SocialContext';
import * as Haptics from 'expo-haptics';

interface RealTimeUpdatesProps {
  onNotificationPress?: () => void;
  position?: 'top' | 'bottom';
  showBadge?: boolean;
}

interface LiveUpdate {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'achievement' | 'trending';
  message: string;
  timestamp: string;
  priority: 'low' | 'normal' | 'high';
}

export function RealTimeUpdates({
  onNotificationPress,
  position = 'top',
  showBadge = true,
}: RealTimeUpdatesProps) {
  const { unreadCount } = useNotifications();
  const { activities } = useSocial();
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);
  const [currentUpdate, setCurrentUpdate] = useState<LiveUpdate | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random updates
      if (Math.random() > 0.7) {
        generateRandomUpdate();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Show updates when they arrive
  useEffect(() => {
    if (liveUpdates.length > 0 && !currentUpdate) {
      showNextUpdate();
    }
  }, [liveUpdates, currentUpdate]);

  const generateRandomUpdate = () => {
    const updateTypes: Array<{ type: LiveUpdate['type']; messages: string[] }> = [
      {
        type: 'like',
        messages: [
          'Your post is getting lots of love! ❤️',
          'Someone just liked your workout post!',
          'Your progress photo is inspiring others!',
        ],
      },
      {
        type: 'comment',
        messages: [
          'New comment on your post! 💬',
          'Someone shared their thoughts on your workout!',
          'Your post sparked a conversation!',
        ],
      },
      {
        type: 'follow',
        messages: [
          'You have a new follower! 👥',
          'Someone joined your fitness journey!',
          'Your community is growing!',
        ],
      },
      {
        type: 'trending',
        messages: [
          'Your post is trending! 🔥',
          'You\'re in the top posts today!',
          'Your content is going viral!',
        ],
      },
      {
        type: 'achievement',
        messages: [
          'Achievement unlocked! 🏆',
          'You\'ve reached a new milestone!',
          'Congratulations on your progress!',
        ],
      },
    ];

    const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
    const randomMessage = randomType.messages[Math.floor(Math.random() * randomType.messages.length)];

    const newUpdate: LiveUpdate = {
      id: `update_${Date.now()}`,
      type: randomType.type,
      message: randomMessage,
      timestamp: new Date().toISOString(),
      priority: randomType.type === 'trending' ? 'high' : 'normal',
    };

    setLiveUpdates(prev => [newUpdate, ...prev.slice(0, 4)]); // Keep only 5 recent updates
  };

  const showNextUpdate = () => {
    if (liveUpdates.length === 0) return;

    const nextUpdate = liveUpdates[0];
    setCurrentUpdate(nextUpdate);
    setLiveUpdates(prev => prev.slice(1));

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Auto-hide after 4 seconds
    setTimeout(() => {
      hideCurrentUpdate();
    }, 4000);
  };

  const hideCurrentUpdate = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentUpdate(null);
      slideAnim.setValue(position === 'top' ? -100 : 100);
      
      // Show next update if available
      if (liveUpdates.length > 0) {
        setTimeout(showNextUpdate, 500);
      }
    });
  };

  const getUpdateIcon = (type: LiveUpdate['type']) => {
    const iconProps = { size: 16, color: DesignTokens.colors.text.primary };
    
    switch (type) {
      case 'like':
        return <Heart {...iconProps} fill={iconProps.color} />;
      case 'comment':
        return <MessageCircle {...iconProps} />;
      case 'follow':
        return <UserPlus {...iconProps} />;
      case 'trending':
        return <TrendingUp {...iconProps} />;
      case 'achievement':
        return <Bell {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  const getUpdateColor = (type: LiveUpdate['type']) => {
    switch (type) {
      case 'like':
        return '#ef4444';
      case 'comment':
        return '#3b82f6';
      case 'follow':
        return '#10b981';
      case 'trending':
        return '#f59e0b';
      case 'achievement':
        return '#8b5cf6';
      default:
        return DesignTokens.colors.primary[500];
    }
  };

  return (
    <View style={[
      styles.container,
      position === 'bottom' && styles.containerBottom,
    ]}>
      {/* Notification Badge */}
      {showBadge && (
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Bell size={24} color={DesignTokens.colors.text.primary} />
          {unreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <SocialNotificationBadge count={unreadCount} variant="small" />
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Live Update Toast */}
      {currentUpdate && (
        <Animated.View
          style={[
            styles.updateToast,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              borderLeftColor: getUpdateColor(currentUpdate.type),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.updateContent}
            onPress={() => {
              hideCurrentUpdate();
              onNotificationPress?.();
            }}
            activeOpacity={0.8}
          >
            <View style={[
              styles.updateIcon,
              { backgroundColor: getUpdateColor(currentUpdate.type) + '20' },
            ]}>
              {getUpdateIcon(currentUpdate.type)}
            </View>
            
            <View style={styles.updateText}>
              <Text style={styles.updateMessage} numberOfLines={2}>
                {currentUpdate.message}
              </Text>
              <Text style={styles.updateTime}>Just now</Text>
            </View>

            <TouchableOpacity
              style={styles.dismissButton}
              onPress={hideCurrentUpdate}
            >
              <Text style={styles.dismissText}>×</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: DesignTokens.spacing[4],
  },
  containerBottom: {
    top: undefined,
    bottom: 100,
  },
  notificationButton: {
    position: 'absolute',
    top: -50,
    right: DesignTokens.spacing[4],
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DesignTokens.colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignTokens.shadow.base,
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  updateToast: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    borderLeftWidth: 4,
    marginHorizontal: DesignTokens.spacing[4],
    ...DesignTokens.shadow.lg,
  },
  updateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing[4],
    gap: DesignTokens.spacing[3],
  },
  updateIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateText: {
    flex: 1,
  },
  updateMessage: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  updateTime: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  dismissButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: DesignTokens.colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 16,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
});
