import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Shield,
  Eye,
  EyeOff,
  Users,
  Lock,
  Globe,
  UserCheck,
  MessageCircle,
  Heart,
  Share2,
  Search,
  MapPin,
  Calendar,
  Activity,
  Info,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { Button } from '@/components/ui/Button';
import { useSocial } from '@/contexts/SocialContext';
import * as Haptics from 'expo-haptics';

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showLocation: boolean;
  showLastActive: boolean;
  showWorkoutStats: boolean;
  showAchievements: boolean;
  allowFollowRequests: boolean;
  allowDirectMessages: boolean;
  allowTagging: boolean;
  allowSearchByEmail: boolean;
  allowSearchByPhone: boolean;
  showInLeaderboards: boolean;
  shareWorkoutData: boolean;
  shareProgressPhotos: boolean;
  allowDataExport: boolean;
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  dataRetention: '1year' | '2years' | '5years' | 'forever';
  blockedUsers: string[];
  mutedUsers: string[];
}

interface SocialPrivacySettingsProps {
  onSettingsChange?: (settings: PrivacySettings) => void;
}

export function SocialPrivacySettings({ onSettingsChange }: SocialPrivacySettingsProps) {
  const { currentUser, updateProfile } = useSocial();
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showLocation: false,
    showLastActive: true,
    showWorkoutStats: true,
    showAchievements: true,
    allowFollowRequests: true,
    allowDirectMessages: true,
    allowTagging: true,
    allowSearchByEmail: false,
    allowSearchByPhone: false,
    showInLeaderboards: true,
    shareWorkoutData: true,
    shareProgressPhotos: false,
    allowDataExport: true,
    twoFactorAuth: false,
    loginAlerts: true,
    dataRetention: '2years',
    blockedUsers: [],
    mutedUsers: [],
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved privacy settings
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    // In a real app, load from secure storage or API
    // For now, use default settings
  };

  const updateSetting = async (key: keyof PrivacySettings, value: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    onSettingsChange?.(updatedSettings);
    
    // Save to storage/API
    await savePrivacySettings(updatedSettings);
  };

  const savePrivacySettings = async (newSettings: PrivacySettings) => {
    setIsLoading(true);
    try {
      // In a real app, save to secure storage or API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      Alert.alert('Error', 'Failed to save privacy settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataExport = () => {
    Alert.alert(
      'Export Data',
      'This will create a downloadable file containing all your social data. This may take a few minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert('Export Started', 'Your data export will be ready shortly. You\'ll receive a notification when it\'s complete.');
          },
        },
      ]
    );
  };

  const handleAccountDeletion = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'Type "DELETE" to confirm account deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm Deletion',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Account Deletion', 'Account deletion process initiated. You will receive a confirmation email.');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    icon?: React.ComponentType<any>,
    warning?: boolean
  ) => {
    const IconComponent = icon;
    return (
      <View style={[styles.settingItem, warning && styles.settingItemWarning]}>
        <View style={styles.settingContent}>
          {IconComponent && (
            <View style={[styles.settingIcon, warning && styles.settingIconWarning]}>
              <IconComponent 
                size={20} 
                color={warning ? DesignTokens.colors.error[500] : DesignTokens.colors.text.secondary} 
              />
            </View>
          )}
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, warning && styles.settingTitleWarning]}>
              {title}
            </Text>
            <Text style={styles.settingDescription}>{description}</Text>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ 
            false: DesignTokens.colors.neutral[700], 
            true: warning ? DesignTokens.colors.error[500] : DesignTokens.colors.primary[500] 
          }}
          thumbColor="#FFFFFF"
        />
      </View>
    );
  };

  const renderVisibilitySelector = () => (
    <View style={styles.visibilitySelector}>
      <Text style={styles.sectionTitle}>Profile Visibility</Text>
      <Text style={styles.sectionDescription}>
        Control who can see your profile and posts
      </Text>
      
      <View style={styles.visibilityOptions}>
        {[
          { value: 'public', label: 'Public', description: 'Anyone can see your profile', icon: Globe },
          { value: 'friends', label: 'Friends Only', description: 'Only people you follow can see your profile', icon: Users },
          { value: 'private', label: 'Private', description: 'Only you can see your profile', icon: Lock },
        ].map((option) => {
          const IconComponent = option.icon;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.visibilityOption,
                settings.profileVisibility === option.value && styles.visibilityOptionActive,
              ]}
              onPress={() => updateSetting('profileVisibility', option.value)}
            >
              <View style={styles.visibilityOptionContent}>
                <IconComponent 
                  size={24} 
                  color={settings.profileVisibility === option.value ? 
                    DesignTokens.colors.primary[500] : 
                    DesignTokens.colors.text.secondary
                  } 
                />
                <View style={styles.visibilityOptionText}>
                  <Text style={[
                    styles.visibilityOptionLabel,
                    settings.profileVisibility === option.value && styles.visibilityOptionLabelActive,
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={styles.visibilityOptionDescription}>
                    {option.description}
                  </Text>
                </View>
              </View>
              <View style={[
                styles.visibilityOptionRadio,
                settings.profileVisibility === option.value && styles.visibilityOptionRadioActive,
              ]}>
                {settings.profileVisibility === option.value && (
                  <View style={styles.visibilityOptionRadioDot} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderDataRetentionSelector = () => (
    <View style={styles.dataRetentionSelector}>
      <Text style={styles.sectionTitle}>Data Retention</Text>
      <Text style={styles.sectionDescription}>
        How long should we keep your data?
      </Text>
      
      <View style={styles.retentionOptions}>
        {[
          { value: '1year', label: '1 Year', description: 'Data deleted after 1 year of inactivity' },
          { value: '2years', label: '2 Years', description: 'Data deleted after 2 years of inactivity' },
          { value: '5years', label: '5 Years', description: 'Data deleted after 5 years of inactivity' },
          { value: 'forever', label: 'Forever', description: 'Keep data until manually deleted' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.retentionOption,
              settings.dataRetention === option.value && styles.retentionOptionActive,
            ]}
            onPress={() => updateSetting('dataRetention', option.value)}
          >
            <View style={styles.retentionOptionContent}>
              <Text style={[
                styles.retentionOptionLabel,
                settings.dataRetention === option.value && styles.retentionOptionLabelActive,
              ]}>
                {option.label}
              </Text>
              <Text style={styles.retentionOptionDescription}>
                {option.description}
              </Text>
            </View>
            <View style={[
              styles.retentionOptionRadio,
              settings.dataRetention === option.value && styles.retentionOptionRadioActive,
            ]}>
              {settings.dataRetention === option.value && (
                <View style={styles.retentionOptionRadioDot} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Visibility */}
      {renderVisibilitySelector()}

      {/* Profile Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        <Text style={styles.sectionDescription}>
          Control what information is visible on your profile
        </Text>
        
        {renderSettingItem(
          'Show Email Address',
          'Display your email address on your profile',
          settings.showEmail,
          (value) => updateSetting('showEmail', value),
          MessageCircle
        )}
        
        {renderSettingItem(
          'Show Location',
          'Display your location on your profile',
          settings.showLocation,
          (value) => updateSetting('showLocation', value),
          MapPin
        )}
        
        {renderSettingItem(
          'Show Last Active',
          'Show when you were last active',
          settings.showLastActive,
          (value) => updateSetting('showLastActive', value),
          Activity
        )}
        
        {renderSettingItem(
          'Show Workout Stats',
          'Display your workout statistics',
          settings.showWorkoutStats,
          (value) => updateSetting('showWorkoutStats', value),
          Activity
        )}
        
        {renderSettingItem(
          'Show Achievements',
          'Display your fitness achievements',
          settings.showAchievements,
          (value) => updateSetting('showAchievements', value),
          Shield
        )}
      </View>

      {/* Social Interactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Social Interactions</Text>
        <Text style={styles.sectionDescription}>
          Control how others can interact with you
        </Text>
        
        {renderSettingItem(
          'Allow Follow Requests',
          'Let others send you follow requests',
          settings.allowFollowRequests,
          (value) => updateSetting('allowFollowRequests', value),
          UserCheck
        )}
        
        {renderSettingItem(
          'Allow Direct Messages',
          'Let others send you direct messages',
          settings.allowDirectMessages,
          (value) => updateSetting('allowDirectMessages', value),
          MessageCircle
        )}
        
        {renderSettingItem(
          'Allow Tagging',
          'Let others tag you in posts',
          settings.allowTagging,
          (value) => updateSetting('allowTagging', value),
          Users
        )}
      </View>

      {/* Discoverability */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discoverability</Text>
        <Text style={styles.sectionDescription}>
          Control how others can find you
        </Text>
        
        {renderSettingItem(
          'Search by Email',
          'Allow others to find you by email address',
          settings.allowSearchByEmail,
          (value) => updateSetting('allowSearchByEmail', value),
          Search
        )}
        
        {renderSettingItem(
          'Search by Phone',
          'Allow others to find you by phone number',
          settings.allowSearchByPhone,
          (value) => updateSetting('allowSearchByPhone', value),
          Search
        )}
        
        {renderSettingItem(
          'Show in Leaderboards',
          'Appear in community leaderboards',
          settings.showInLeaderboards,
          (value) => updateSetting('showInLeaderboards', value),
          Activity
        )}
      </View>

      {/* Data Sharing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Sharing</Text>
        <Text style={styles.sectionDescription}>
          Control what data you share with the community
        </Text>
        
        {renderSettingItem(
          'Share Workout Data',
          'Share your workout data for community insights',
          settings.shareWorkoutData,
          (value) => updateSetting('shareWorkoutData', value),
          Share2
        )}
        
        {renderSettingItem(
          'Share Progress Photos',
          'Allow progress photos to be shared publicly',
          settings.shareProgressPhotos,
          (value) => updateSetting('shareProgressPhotos', value),
          Share2
        )}
      </View>

      {/* Security */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <Text style={styles.sectionDescription}>
          Additional security measures for your account
        </Text>
        
        {renderSettingItem(
          'Two-Factor Authentication',
          'Require additional verification when logging in',
          settings.twoFactorAuth,
          (value) => updateSetting('twoFactorAuth', value),
          Shield
        )}
        
        {renderSettingItem(
          'Login Alerts',
          'Get notified when someone logs into your account',
          settings.loginAlerts,
          (value) => updateSetting('loginAlerts', value),
          Info
        )}
      </View>

      {/* Data Retention */}
      {renderDataRetentionSelector()}

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Text style={styles.sectionDescription}>
          Manage your personal data and account
        </Text>
        
        <Button
          title="Export My Data"
          variant="secondary"
          size="large"
          onPress={handleDataExport}
          icon={<Share2 size={20} color={DesignTokens.colors.primary[500]} />}
          style={styles.actionButton}
        />
        
        <Button
          title="Delete Account"
          variant="secondary"
          size="large"
          onPress={handleAccountDeletion}
          icon={<Lock size={20} color={DesignTokens.colors.error[500]} />}
          style={[styles.actionButton, styles.dangerButton]}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Your privacy is important to us. These settings help you control your data and how you interact with the community.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
  },
  section: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },
  sectionDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
    marginBottom: DesignTokens.spacing[4],
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  settingItemWarning: {
    borderBottomColor: DesignTokens.colors.error[500] + '30',
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
  settingIconWarning: {
    backgroundColor: DesignTokens.colors.error[500] + '20',
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
  settingTitleWarning: {
    color: DesignTokens.colors.error[500],
  },
  settingDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  visibilitySelector: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  visibilityOptions: {
    gap: DesignTokens.spacing[3],
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  visibilityOptionActive: {
    borderColor: DesignTokens.colors.primary[500],
    backgroundColor: DesignTokens.colors.primary[500] + '10',
  },
  visibilityOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  visibilityOptionText: {
    marginLeft: DesignTokens.spacing[3],
    flex: 1,
  },
  visibilityOptionLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  visibilityOptionLabelActive: {
    color: DesignTokens.colors.primary[500],
  },
  visibilityOptionDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  visibilityOptionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: DesignTokens.colors.neutral[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  visibilityOptionRadioActive: {
    borderColor: DesignTokens.colors.primary[500],
  },
  visibilityOptionRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: DesignTokens.colors.primary[500],
  },
  dataRetentionSelector: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  retentionOptions: {
    gap: DesignTokens.spacing[2],
  },
  retentionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  retentionOptionActive: {
    borderColor: DesignTokens.colors.primary[500],
    backgroundColor: DesignTokens.colors.primary[500] + '10',
  },
  retentionOptionContent: {
    flex: 1,
  },
  retentionOptionLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  retentionOptionLabelActive: {
    color: DesignTokens.colors.primary[500],
  },
  retentionOptionDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 16,
  },
  retentionOptionRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: DesignTokens.colors.neutral[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: DesignTokens.spacing[3],
  },
  retentionOptionRadioActive: {
    borderColor: DesignTokens.colors.primary[500],
  },
  retentionOptionRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DesignTokens.colors.primary[500],
  },
  actionButton: {
    marginBottom: DesignTokens.spacing[3],
  },
  dangerButton: {
    borderColor: DesignTokens.colors.error[500],
  },
  footer: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[6],
    alignItems: 'center',
  },
  footerText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
