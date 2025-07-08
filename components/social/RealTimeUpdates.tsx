import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  Bell,
  Heart,
  MessageCircle,
  Users,
  TrendingUp,
  X,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import * as Haptics from 'expo-haptics';

interface RealTimeUpdatesProps {
  onNotificationPress: () => void;
  position?: 'top' | 'bottom';
  showBadge?: boolean;
}

export function RealTimeUpdates({
  onNotificationPress,
  position = 'top',
  showBadge = true,
}: RealTimeUpdatesProps) {
  const {
    liveUpdates,
    isConnected,
    connectionStatus,
    dismissUpdate,
    dismissAllUpdates,
  } = useRealTimeUpdates();

  const [slideAnim] = useState(new Animated.Value(-100));
  const [visibleUpdates, setVisibleUpdates] = useState<typeof liveUpdates>([]);

  useEffect(() => {
    if (liveUpdates.length > 0) {
      setVisibleUpdates(liveUpdates.slice(0, 3)); // Show max 3 updates
      
      // Animate in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismissAll();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      handleDismissAll();
    }
  }, [liveUpdates]);

  const handleDismissAll = () => {
    Animated.spring(slideAnim, {
      toValue: position === 'top' ? -100 : 100,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setVisibleUpdates([]);
      dismissAllUpdates();
    });
  };

  const handleDismissUpdate = async (updateId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dismissUpdate(updateId);
  };

  const handleUpdatePress = async (update: typeof liveUpdates[0]) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Handle different update types
    switch (update.type) {
      case 'new_notification':
        onNotificationPress();
        break;
      case 'live_activity':
        // Handle live activity (e.g., someone liked your post)
        break;
      case 'system_update':
        // Handle system updates
        break;
    }
    
    handleDismissUpdate(update.id);
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'new_notification':
        return <Bell size={16} color={DesignTokens.colors.primary[500]} />;
      case 'like':
        return <Heart size={16} color={DesignTokens.colors.error[500]} />;
      case 'comment':
        return <MessageCircle size={16} color={DesignTokens.colors.primary[500]} />;
      case 'follow':
        return <Users size={16} color={DesignTokens.colors.success[500]} />;
      case 'trending':
        return <TrendingUp size={16} color={DesignTokens.colors.warning[500]} />;
      default:
        return <Bell size={16} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const getUpdateColor = (type: string) => {
    switch (type) {
      case 'like':
        return DesignTokens.colors.error[500];
      case 'comment':
        return DesignTokens.colors.primary[500];
      case 'follow':
        return DesignTokens.colors.success[500];
      case 'trending':
        return DesignTokens.colors.warning[500];
      default:
        return DesignTokens.colors.primary[500];
    }
  };

  if (visibleUpdates.length === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'bottom' ? styles.containerBottom : styles.containerTop,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.updatesContainer}>
        {visibleUpdates.map((update, index) => (
          <TouchableOpacity
            key={update.id}
            style={[
              styles.updateItem,
              { borderLeftColor: getUpdateColor(update.type) },
              index > 0 && styles.updateItemStacked,
            ]}
            onPress={() => handleUpdatePress(update)}
            activeOpacity={0.8}
          >
            <View style={styles.updateContent}>
              <View style={styles.updateHeader}>
                <View style={styles.updateIcon}>
                  {getUpdateIcon(update.type)}
                </View>
                <Text style={styles.updateTitle} numberOfLines={1}>
                  {update.title}
                </Text>
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={() => handleDismissUpdate(update.id)}
                >
                  <X size={14} color={DesignTokens.colors.text.tertiary} />
                </TouchableOpacity>
              </View>
              
              {update.message && (
                <Text style={styles.updateMessage} numberOfLines={2}>
                  {update.message}
                </Text>
              )}
              
              <View style={styles.updateFooter}>
                <Text style={styles.updateTime}>
                  {new Date(update.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
                {showBadge && update.badge && (
                  <View style={[styles.updateBadge, { backgroundColor: getUpdateColor(update.type) }]}>
                    <Text style={styles.updateBadgeText}>{update.badge}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        {liveUpdates.length > 3 && (
          <TouchableOpacity
            style={styles.moreUpdates}
            onPress={onNotificationPress}
          >
            <Text style={styles.moreUpdatesText}>
              +{liveUpdates.length - 3} more updates
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Connection Status Indicator */}
      <View style={[
        styles.connectionStatus,
        isConnected ? styles.connectionStatusOnline : styles.connectionStatusOffline
      ]}>
        <View style={[
          styles.connectionDot,
          { backgroundColor: isConnected ? DesignTokens.colors.success[500] : DesignTokens.colors.error[500] }
        ]} />
        <Text style={styles.connectionText}>
          {connectionStatus}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: DesignTokens.spacing[4],
    right: DesignTokens.spacing[4],
    zIndex: 1000,
  },
  containerTop: {
    top: DesignTokens.spacing[12],
  },
  containerBottom: {
    bottom: DesignTokens.spacing[12],
  },
  updatesContainer: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  updateItem: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderLeftWidth: 3,
    padding: DesignTokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  updateItemStacked: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  updateContent: {
    gap: DesignTokens.spacing[2],
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  updateIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: DesignTokens.colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateTitle: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  dismissButton: {
    padding: DesignTokens.spacing[1],
  },
  updateMessage: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
    marginLeft: 32, // Align with title
  },
  updateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 32, // Align with title
  },
  updateTime: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  updateBadge: {
    borderRadius: DesignTokens.borderRadius.sm,
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
  },
  updateBadgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  moreUpdates: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    padding: DesignTokens.spacing[3],
    alignItems: 'center',
  },
  moreUpdatesText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    marginTop: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
  },
  connectionStatusOnline: {
    backgroundColor: DesignTokens.colors.success[500] + '20',
  },
  connectionStatusOffline: {
    backgroundColor: DesignTokens.colors.error[500] + '20',
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  connectionText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
