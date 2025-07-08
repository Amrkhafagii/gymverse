import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  X,
  Settings,
  Heart,
  MessageCircle,
  UserPlus,
  Trophy,
  Target,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  CheckCircle,
  Circle,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { SocialActivityFeed } from './SocialActivityFeed';
import { Button } from '@/components/ui/Button';
import { useNotifications } from '@/hooks/useNotifications';
import * as Haptics from 'expo-haptics';

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
  onActivityPress?: (activityId: string) => void;
  onUserPress?: (userId: string) => void;
}

interface NotificationSettings {
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

export function NotificationCenter({
  visible,
  onClose,
  onActivityPress,
  onUserPress,
}: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    settings,
    updateSettings,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'activity' | 'settings'>('activity');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
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
  });

  useEffect(() => {
    if (settings) {
      setNotificationSettings(settings);
    }
  }, [settings]);

  const handleSettingChange = async (key: string, value: boolean | object) => {
    const updatedSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(updatedSettings);
    await updateSettings(updatedSettings);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTypeSettingChange = async (type: keyof NotificationSettings['types'], value: boolean) => {
    const updatedTypes = { ...notificationSettings.types, [type]: value };
    const updatedSettings = { ...notificationSettings, types: updatedTypes };
    setNotificationSettings(updatedSettings);
    await updateSettings(updatedSettings);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  };

  const renderTabButton = (tab: typeof activeTab, title: string, icon: React.ComponentType<any>) => {
    const IconComponent = icon;
    return (
      <TouchableOpacity
        style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
        onPress={() => setActiveTab(tab)}
      >
        <IconComponent 
          size={20} 
          color={activeTab === tab ? DesignTokens.colors.primary[500] : DesignTokens.colors.text.secondary} 
        />
        <Text style={[
          styles.tabButtonText,
          activeTab === tab && styles.tabButtonTextActive
        ]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    icon?: React.ComponentType<any>
  ) => {
    const IconComponent = icon;
    return (
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          {IconComponent && (
            <View style={styles.settingIcon}>
              <IconComponent size={20} color={DesignTokens.colors.text.secondary} />
            </View>
          )}
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title}</Text>
            <Text style={styles.settingDescription}>{description}</Text>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: DesignTokens.colors.neutral[700], true: DesignTokens.colors.primary[500] }}
          thumbColor="#FFFFFF"
        />
      </View>
    );
  };

  const renderSettings = () => (
    <View style={styles.settingsContainer}>
      {/* General Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>General</Text>
        
        {renderSettingItem(
          'Push Notifications',
          'Receive notifications on your device',
          notificationSettings.pushNotifications,
          (value) => handleSettingChange('pushNotifications', value),
          Smartphone
        )}
        
        {renderSettingItem(
          'Email Notifications',
          'Receive notifications via email',
          notificationSettings.emailNotifications,
          (value) => handleSettingChange('emailNotifications', value),
          Mail
        )}
        
        {renderSettingItem(
          'Sound',
          'Play sound for notifications',
          notificationSettings.soundEnabled,
          (value) => handleSettingChange('soundEnabled', value),
          notificationSettings.soundEnabled ? Volume2 : VolumeX
        )}
        
        {renderSettingItem(
          'Vibration',
          'Vibrate for notifications',
          notificationSettings.vibrationEnabled,
          (value) => handleSettingChange('vibrationEnabled', value),
          Smartphone
        )}
      </View>

      {/* Notification Types */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Notification Types</Text>
        
        {renderSettingItem(
          'Likes',
          'When someone likes your posts',
          notificationSettings.types.likes,
          (value) => handleTypeSettingChange('likes', value),
          Heart
        )}
        
        {renderSettingItem(
          'Comments',
          'When someone comments on your posts',
          notificationSettings.types.comments,
          (value) => handleTypeSettingChange('comments', value),
          MessageCircle
        )}
        
        {renderSettingItem(
          'New Followers',
          'When someone follows you',
          notificationSettings.types.follows,
          (value) => handleTypeSettingChange('follows', value),
          UserPlus
        )}
        
        {renderSettingItem(
          'Achievements',
          'When you unlock new achievements',
          notificationSettings.types.achievements,
          (value) => handleTypeSettingChange('achievements', value),
          Trophy
        )}
        
        {renderSettingItem(
          'Workout Reminders',
          'Daily workout reminders',
          notificationSettings.types.workouts,
          (value) => handleTypeSettingChange('workouts', value),
          Target
        )}
        
        {renderSettingItem(
          'Milestones',
          'When you reach fitness milestones',
          notificationSettings.types.milestones,
          (value) => handleTypeSettingChange('milestones', value),
          Trophy
        )}
      </View>

      {/* Quiet Hours */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Quiet Hours</Text>
        
        {renderSettingItem(
          'Enable Quiet Hours',
          'Pause notifications during specified hours',
          notificationSettings.quietHours.enabled,
          (value) => handleSettingChange('quietHours', { 
            ...notificationSettings.quietHours, 
            enabled: value 
          })
        )}
        
        {notificationSettings.quietHours.enabled && (
          <View style={styles.quietHoursContainer}>
            <Text style={styles.quietHoursText}>
              Notifications paused from {notificationSettings.quietHours.start} to {notificationSettings.quietHours.end}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.settingsSection}>
        <Button
          title="Clear All Notifications"
          variant="secondary"
          size="large"
          onPress={handleClearAll}
          icon={<X size={20} color={DesignTokens.colors.error[500]} />}
        />
      </View>
    </View>
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
          
          <View style={styles.headerCenter}>
            <Bell size={24} color={DesignTokens.colors.primary[500]} />
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          
          {activeTab === 'activity' && unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={markAllAsRead}
            >
              <CheckCircle size={20} color={DesignTokens.colors.primary[500]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          {renderTabButton('activity', 'Activity', Bell)}
          {renderTabButton('settings', 'Settings', Settings)}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'activity' ? (
            <SocialActivityFeed
              onActivityPress={(activity) => {
                markAsRead(activity.id);
                onActivityPress?.(activity.id);
              }}
              onUserPress={onUserPress}
              variant="full"
            />
          ) : (
            renderSettings()
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  headerTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  headerBadge: {
    backgroundColor: DesignTokens.colors.error[500],
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[2],
  },
  headerBadgeText: {
    fontSize: 12,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  markAllButton: {
    padding: DesignTokens.spacing[2],
  },
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
    gap: DesignTokens.spacing[4],
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing[2],
  },
  tabButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500] + '20',
  },
  tabButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  tabButtonTextActive: {
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  settingsContainer: {
    flex: 1,
    padding: DesignTokens.spacing[5],
  },
  settingsSection: {
    marginBottom: DesignTokens.spacing[6],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[4],
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: DesignTokens.spacing[4],
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing[3],
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  settingDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  quietHoursContainer: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    marginTop: DesignTokens.spacing[2],
  },
  quietHoursText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
});
