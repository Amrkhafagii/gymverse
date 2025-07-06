import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  HelpCircle,
  Star,
  Share2,
  Mail,
  ExternalLink,
  Smartphone,
  Database,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Vibrate,
  Lock,
  Eye,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Info,
  Heart,
  Coffee,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { SettingsSection, SettingsItem } from '@/components/settings/SettingsSection';
import { ToggleSwitch } from '@/components/settings/ToggleSwitch';
import { StorageUsageCard } from '@/components/settings/StorageUsageCard';
import { DeviceInfoCard } from '@/components/settings/DeviceInfoCard';
import { useDeviceAuth } from '@/contexts/DeviceAuthContext';
import * as Haptics from 'expo-haptics';

interface AppSettings {
  notifications: {
    workoutReminders: boolean;
    progressUpdates: boolean;
    socialActivity: boolean;
    systemUpdates: boolean;
  };
  appearance: {
    darkMode: boolean;
    accentColor: string;
    compactMode: boolean;
  };
  privacy: {
    shareProgress: boolean;
    showInLeaderboards: boolean;
    allowFriendRequests: boolean;
  };
  workout: {
    autoStartTimer: boolean;
    hapticFeedback: boolean;
    soundEffects: boolean;
    restTimerSound: boolean;
  };
  data: {
    autoBackup: boolean;
    syncAcrossDevices: boolean;
    offlineMode: boolean;
  };
}

export default function SettingsScreen() {
  const { user, isAuthenticated } = useDeviceAuth();
  const [settings, setSettings] = useState<AppSettings>({
    notifications: {
      workoutReminders: true,
      progressUpdates: true,
      socialActivity: false,
      systemUpdates: true,
    },
    appearance: {
      darkMode: true,
      accentColor: '#9E7FFF',
      compactMode: false,
    },
    privacy: {
      shareProgress: true,
      showInLeaderboards: true,
      allowFriendRequests: true,
    },
    workout: {
      autoStartTimer: true,
      hapticFeedback: true,
      soundEffects: false,
      restTimerSound: true,
    },
    data: {
      autoBackup: true,
      syncAcrossDevices: false,
      offlineMode: true,
    },
  });

  const updateSetting = async (section: keyof AppSettings, key: string, value: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleRateApp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Rate GymVerse',
      'Enjoying GymVerse? Please rate us on the App Store!',
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Rate Now', onPress: () => {
          // In a real app, open App Store rating
          Alert.alert('Thank you!', 'This would open the App Store rating page.');
        }},
      ]
    );
  };

  const handleShareApp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: 'Check out GymVerse - the ultimate fitness tracking app! 💪',
        url: 'https://gymverse.app', // Placeholder URL
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const handleContactSupport = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Contact Support',
      'How would you like to contact our support team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email', onPress: () => {
          Linking.openURL('mailto:support@gymverse.app');
        }},
        { text: 'Help Center', onPress: () => {
          Alert.alert('Help Center', 'This would open the help center.');
        }},
      ]
    );
  };

  const handleExportData = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Export Data',
      'Export your workout data and progress to a file.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          Alert.alert('Export Started', 'Your data export will be ready shortly.');
        }},
      ]
    );
  };

  const handleImportData = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Import Data',
      'Import workout data from another fitness app or backup file.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose File', onPress: () => {
          Alert.alert('File Picker', 'This would open a file picker.');
        }},
      ]
    );
  };

  const handleClearCache = async () => {
    // Simulate cache clearing
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleClearAllData = async () => {
    // Simulate data clearing
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleResetSettings = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their default values. Your workout data will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {
          // Reset to default settings
          setSettings({
            notifications: {
              workoutReminders: true,
              progressUpdates: true,
              socialActivity: false,
              systemUpdates: true,
            },
            appearance: {
              darkMode: true,
              accentColor: '#9E7FFF',
              compactMode: false,
            },
            privacy: {
              shareProgress: true,
              showInLeaderboards: true,
              allowFriendRequests: true,
            },
            workout: {
              autoStartTimer: true,
              hapticFeedback: true,
              soundEffects: false,
              restTimerSound: true,
            },
            data: {
              autoBackup: true,
              syncAcrossDevices: false,
              offlineMode: true,
            },
          });
          Alert.alert('Settings Reset', 'All settings have been reset to defaults.');
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <View style={styles.headerContent}>
          <SettingsIcon size={28} color={DesignTokens.colors.primary[500]} />
          <Text style={styles.title}>Settings</Text>
        </View>
        {user && (
          <View style={styles.deviceBadge}>
            <Smartphone size={16} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.deviceText}>
              {user.platform} Device
            </Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Device Information */}
        <DeviceInfoCard />

        {/* Storage Usage */}
        <StorageUsageCard 
          onClearCache={handleClearCache}
          onClearData={handleClearAllData}
        />

        {/* Profile & Account */}
        <SettingsSection 
          title="Profile & Account"
          subtitle="Manage your profile and account settings"
        >
          <SettingsItem
            title="Edit Profile"
            subtitle="Update your name, photo, and bio"
            icon={<User size={20} color={DesignTokens.colors.primary[500]} />}
            onPress={() => Alert.alert('Edit Profile', 'This would open the profile editor.')}
          />
          <SettingsItem
            title="Privacy Settings"
            subtitle="Control who can see your activity"
            icon={<Shield size={20} color={DesignTokens.colors.success[500]} />}
            rightElement={
              <ToggleSwitch
                value={settings.privacy.shareProgress}
                onValueChange={(value) => updateSetting('privacy', 'shareProgress', value)}
              />
            }
          />
          <SettingsItem
            title="Show in Leaderboards"
            subtitle="Appear in community leaderboards"
            icon={<Star size={20} color={DesignTokens.colors.warning[500]} />}
            rightElement={
              <ToggleSwitch
                value={settings.privacy.showInLeaderboards}
                onValueChange={(value) => updateSetting('privacy', 'showInLeaderboards', value)}
              />
            }
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection 
          title="Notifications"
          subtitle="Customize your notification preferences"
        >
          <SettingsItem
            title="Workout Reminders"
            subtitle="Get reminded about scheduled workouts"
            icon={<Bell size={20} color={DesignTokens.colors.primary[500]} />}
            rightElement={
              <ToggleSwitch
                value={settings.notifications.workoutReminders}
                onValueChange={(value) => updateSetting('notifications', 'workoutReminders', value)}
              />
            }
          />
          <SettingsItem
            title="Progress Updates"
            subtitle="Notifications about your achievements"
            icon={<Star size={20} color={DesignTokens.colors.success[500]} />}
            rightElement={
              <ToggleSwitch
                value={settings.notifications.progressUpdates}
                onValueChange={(value) => updateSetting('notifications', 'progressUpdates', value)}
              />
            }
          />
          <SettingsItem
            title="Social Activity"
            subtitle="Friend requests and social interactions"
            icon={<Heart size={20} color={DesignTokens.colors.error[500]} />}
            rightElement={
              <ToggleSwitch
                value={settings.notifications.socialActivity}
                onValueChange={(value) => updateSetting('notifications', 'socialActivity', value)}
              />
            }
          />
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection 
          title="Appearance"
          subtitle="Customize the look and feel of the app"
        >
          <SettingsItem
            title="Dark Mode"
            subtitle="Use dark theme throughout the app"
            icon={settings.appearance.darkMode ? 
              <Moon size={20} color={DesignTokens.colors.primary[500]} /> : 
              <Sun size={20} color={DesignTokens.colors.warning[500]} />
            }
            rightElement={
              <ToggleSwitch
                value={settings.appearance.darkMode}
                onValueChange={(value) => updateSetting('appearance', 'darkMode', value)}
              />
            }
          />
          <SettingsItem
            title="Accent Color"
            subtitle="Choose your preferred accent color"
            icon={<Palette size={20} color={settings.appearance.accentColor} />}
            onPress={() => Alert.alert('Color Picker', 'This would open a color picker.')}
          />
          <SettingsItem
            title="Compact Mode"
            subtitle="Show more content in less space"
            icon={<Eye size={20} color={DesignTokens.colors.text.secondary} />}
            rightElement={
              <ToggleSwitch
                value={settings.appearance.compactMode}
                onValueChange={(value) => updateSetting('appearance', 'compactMode', value)}
              />
            }
          />
        </SettingsSection>

        {/* Workout Settings */}
        <SettingsSection 
          title="Workout Settings"
          subtitle="Configure workout behavior and feedback"
        >
          <SettingsItem
            title="Auto-Start Timer"
            subtitle="Automatically start rest timers"
            icon={<RefreshCw size={20} color={DesignTokens.colors.primary[500]} />}
            rightElement={
              <ToggleSwitch
                value={settings.workout.autoStartTimer}
                onValueChange={(value) => updateSetting('workout', 'autoStartTimer', value)}
              />
            }
          />
          <SettingsItem
            title="Haptic Feedback"
            subtitle="Vibration feedback for interactions"
            icon={<Vibrate size={20} color={DesignTokens.colors.success[500]} />}
            rightElement={
              <ToggleSwitch
                value={settings.workout.hapticFeedback}
                onValueChange={(value) => updateSetting('workout', 'hapticFeedback', value)}
              />
            }
          />
          <SettingsItem
            title="Sound Effects"
            subtitle="Audio feedback during workouts"
            icon={settings.workout.soundEffects ? 
              <Volume2 size={20} color={DesignTokens.colors.primary[500]} /> : 
              <VolumeX size={20} color={DesignTokens.colors.text.secondary} />
            }
            rightElement={
              <ToggleSwitch
                value={settings.workout.soundEffects}
                onValueChange={(value) => updateSetting('workout', 'soundEffects', value)}
              />
            }
          />
        </SettingsSection>

        {/* Data & Backup */}
        <SettingsSection 
          title="Data & Backup"
          subtitle="Manage your data and backup preferences"
        >
          <SettingsItem
            title="Auto Backup"
            subtitle="Automatically backup your data"
            icon={<Database size={20} color={DesignTokens.colors.primary[500]} />}
            rightElement={
              <ToggleSwitch
                value={settings.data.autoBackup}
                onValueChange={(value) => updateSetting('data', 'autoBackup', value)}
              />
            }
          />
          <SettingsItem
            title="Export Data"
            subtitle="Download your workout data"
            icon={<Download size={20} color={DesignTokens.colors.success[500]} />}
            onPress={handleExportData}
          />
          <SettingsItem
            title="Import Data"
            subtitle="Import data from other apps"
            icon={<Upload size={20} color={DesignTokens.colors.warning[500]} />}
            onPress={handleImportData}
          />
          <SettingsItem
            title="Offline Mode"
            subtitle="Use app without internet connection"
            icon={<Globe size={20} color={DesignTokens.colors.text.secondary} />}
            rightElement={
              <ToggleSwitch
                value={settings.data.offlineMode}
                onValueChange={(value) => updateSetting('data', 'offlineMode', value)}
              />
            }
          />
        </SettingsSection>

        {/* Support & Feedback */}
        <SettingsSection 
          title="Support & Feedback"
          subtitle="Get help and share your thoughts"
        >
          <SettingsItem
            title="Help Center"
            subtitle="Find answers to common questions"
            icon={<HelpCircle size={20} color={DesignTokens.colors.primary[500]} />}
            onPress={handleContactSupport}
          />
          <SettingsItem
            title="Contact Support"
            subtitle="Get help from our support team"
            icon={<Mail size={20} color={DesignTokens.colors.success[500]} />}
            onPress={handleContactSupport}
          />
          <SettingsItem
            title="Rate App"
            subtitle="Rate GymVerse on the App Store"
            icon={<Star size={20} color={DesignTokens.colors.warning[500]} />}
            onPress={handleRateApp}
          />
          <SettingsItem
            title="Share App"
            subtitle="Tell your friends about GymVerse"
            icon={<Share2 size={20} color={DesignTokens.colors.primary[500]} />}
            onPress={handleShareApp}
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection 
          title="About"
          subtitle="App information and legal"
        >
          <SettingsItem
            title="Version"
            subtitle="1.0.0 (Build 2024.1.1)"
            icon={<Info size={20} color={DesignTokens.colors.text.secondary} />}
          />
          <SettingsItem
            title="Privacy Policy"
            subtitle="How we handle your data"
            icon={<Lock size={20} color={DesignTokens.colors.primary[500]} />}
            onPress={() => Alert.alert('Privacy Policy', 'This would open the privacy policy.')}
          />
          <SettingsItem
            title="Terms of Service"
            subtitle="Terms and conditions"
            icon={<ExternalLink size={20} color={DesignTokens.colors.text.secondary} />}
            onPress={() => Alert.alert('Terms of Service', 'This would open the terms of service.')}
          />
          <SettingsItem
            title="Made with ❤️"
            subtitle="Built for fitness enthusiasts"
            icon={<Coffee size={20} color={DesignTokens.colors.warning[500]} />}
          />
        </SettingsSection>

        {/* Danger Zone */}
        <SettingsSection 
          title="Danger Zone"
          subtitle="Irreversible actions - use with caution"
        >
          <SettingsItem
            title="Reset Settings"
            subtitle="Reset all settings to defaults"
            icon={<RefreshCw size={20} color={DesignTokens.colors.warning[500]} />}
            onPress={handleResetSettings}
            destructive
          />
          <SettingsItem
            title="Delete All Data"
            subtitle="Permanently delete all your data"
            icon={<Trash2 size={20} color={DesignTokens.colors.error[500]} />}
            onPress={() => Alert.alert('Delete All Data', 'This action cannot be undone!')}
            destructive
          />
        </SettingsSection>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            GymVerse v1.0.0 • Made with ❤️ for fitness
          </Text>
          <Text style={styles.footerSubtext}>
            {user ? `Device: ${user.deviceId.substring(0, 8)}...` : 'Device not authenticated'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
  },
  header: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingTop: DesignTokens.spacing[2],
    paddingBottom: DesignTokens.spacing[4],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize['3xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginLeft: DesignTokens.spacing[3],
  },
  deviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.secondary,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.full,
    alignSelf: 'flex-start',
  },
  deviceText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: DesignTokens.spacing[8],
  },
  footer: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[6],
    paddingHorizontal: DesignTokens.spacing[5],
  },
  footerText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[1],
  },
  footerSubtext: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    textAlign: 'center',
  },
});
