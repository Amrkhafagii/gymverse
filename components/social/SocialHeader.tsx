import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Bell,
  Search,
  MessageCircle,
  Users,
  Settings,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useDeviceAuth } from '@/contexts/DeviceAuthContext';
import { useSocial } from '@/contexts/SocialContext';
import * as Haptics from 'expo-haptics';

interface SocialHeaderProps {
  onSearchPress?: () => void;
  onNotificationsPress?: () => void;
  onMessagesPress?: () => void;
  onSettingsPress?: () => void;
}

export default function SocialHeader({
  onSearchPress,
  onNotificationsPress,
  onMessagesPress,
  onSettingsPress,
}: SocialHeaderProps) {
  const { user } = useDeviceAuth();
  const { activities, friends } = useSocial();

  const unreadNotifications = activities.filter(a => !a.isRead).length;
  const onlineFriends = friends.filter(f => f.isOnline).length;

  const handlePress = async (action: () => void) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Left Section - User Info */}
        <View style={styles.leftSection}>
          <Image 
            source={{ uri: user?.avatar || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg' }} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.username}>{user?.displayName || 'Fitness Enthusiast'}</Text>
          </View>
        </View>

        {/* Right Section - Actions */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handlePress(onSearchPress || (() => {}))}
          >
            <Search size={20} color={DesignTokens.colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.notificationButton]}
            onPress={() => handlePress(onNotificationsPress || (() => {}))}
          >
            <Bell size={20} color={DesignTokens.colors.text.secondary} />
            {unreadNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handlePress(onMessagesPress || (() => {}))}
          >
            <MessageCircle size={20} color={DesignTokens.colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Users size={16} color={DesignTokens.colors.primary[500]} />
          <Text style={styles.statText}>{onlineFriends} friends online</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Bell size={16} color={DesignTokens.colors.warning[500]} />
          <Text style={styles.statText}>
            {unreadNotifications} new notification{unreadNotifications !== 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => handlePress(onSettingsPress || (() => {}))}
        >
          <Settings size={16} color={DesignTokens.colors.text.tertiary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.surface.primary,
    paddingTop: 60, // Account for status bar
    paddingBottom: DesignTokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: DesignTokens.spacing[3],
    borderWidth: 2,
    borderColor: DesignTokens.colors.primary[500],
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  username: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: DesignTokens.colors.error[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    backgroundColor: DesignTokens.colors.surface.secondary,
    marginHorizontal: DesignTokens.spacing[5],
    borderRadius: DesignTokens.borderRadius.lg,
    paddingVertical: DesignTokens.spacing[3],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  statText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: DesignTokens.colors.neutral[700],
    marginHorizontal: DesignTokens.spacing[4],
  },
  settingsButton: {
    marginLeft: 'auto',
    padding: DesignTokens.spacing[2],
  },
});
