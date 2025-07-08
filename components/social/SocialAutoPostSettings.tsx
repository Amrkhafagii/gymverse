import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {
  Zap,
  Target,
  Trophy,
  Camera,
  TrendingUp,
  MessageSquare,
  Clock,
  Settings,
  Edit3,
  Save,
  RotateCcw,
  Info,
  Sparkles,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { Button } from '@/components/ui/Button';
import { useSocial, SocialPost } from '@/contexts/SocialContext';
import { localSocialEngine } from '@/lib/social/localSocialEngine';
import * as Haptics from 'expo-haptics';

interface AutoPostSettings {
  enabled: boolean;
  types: Record<SocialPost['type'], {
    enabled: boolean;
    template: string;
    includeStats: boolean;
    includeLocation: boolean;
    includeTags: boolean;
    customMessage: string;
  }>;
  timing: {
    immediate: boolean;
    delay: number; // minutes
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  privacy: {
    defaultVisibility: SocialPost['visibility'];
    requireApproval: boolean;
  };
  content: {
    useAI: boolean;
    personalityTone: 'casual' | 'motivational' | 'professional' | 'humorous';
    includeEmojis: boolean;
    maxLength: number;
  };
}

interface SocialAutoPostSettingsProps {
  onSettingsChange?: (settings: AutoPostSettings) => void;
}

export function SocialAutoPostSettings({ onSettingsChange }: SocialAutoPostSettingsProps) {
  const { autoPostSettings, enableAutoPosting, disableAutoPosting } = useSocial();
  const [settings, setSettings] = useState<AutoPostSettings>({
    enabled: true,
    types: {
      workout_complete: {
        enabled: true,
        template: 'Just finished {workoutName}! 💪 {duration} minutes of pure dedication 🔥',
        includeStats: true,
        includeLocation: false,
        includeTags: true,
        customMessage: '',
      },
      achievement: {
        enabled: true,
        template: 'Unlocked "{achievementName}"! 🏆 {description}',
        includeStats: false,
        includeLocation: false,
        includeTags: true,
        customMessage: '',
      },
      progress_photo: {
        enabled: false,
        template: '{timeframe} progress update! 📸 The journey continues...',
        includeStats: true,
        includeLocation: false,
        includeTags: true,
        customMessage: '',
      },
      milestone: {
        enabled: true,
        template: 'Hit a major milestone today! 🎯 {milestone}',
        includeStats: true,
        includeLocation: false,
        includeTags: true,
        customMessage: '',
      },
      personal_record: {
        enabled: true,
        template: 'New PR! {exercise}: {value}{unit} 🎯 {improvement}% improvement!',
        includeStats: true,
        includeLocation: false,
        includeTags: true,
        customMessage: '',
      },
      text: {
        enabled: false,
        template: '{content}',
        includeStats: false,
        includeLocation: false,
        includeTags: false,
        customMessage: '',
      },
    },
    timing: {
      immediate: true,
      delay: 0,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    },
    privacy: {
      defaultVisibility: 'public',
      requireApproval: false,
    },
    content: {
      useAI: true,
      personalityTone: 'motivational',
      includeEmojis: true,
      maxLength: 280,
    },
  });

  const [editingTemplate, setEditingTemplate] = useState<SocialPost['type'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAutoPostSettings();
  }, []);

  const loadAutoPostSettings = async () => {
    // Load saved settings from storage
    // For now, use default settings
  };

  const updateSetting = async (path: string, value: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const keys = path.split('.');
    const updatedSettings = { ...settings };
    let current: any = updatedSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setSettings(updatedSettings);
    onSettingsChange?.(updatedSettings);
    
    // Update social context
    if (path.startsWith('types.')) {
      const type = keys[1] as SocialPost['type'];
      const typeSettings = updatedSettings.types[type];
      
      if (typeSettings.enabled) {
        await enableAutoPosting([type]);
      } else {
        await disableAutoPosting([type]);
      }
    }
    
    await saveAutoPostSettings(updatedSettings);
  };

  const saveAutoPostSettings = async (newSettings: AutoPostSettings) => {
    setIsLoading(true);
    try {
      // Save to storage
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error saving auto-post settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAITemplate = async (type: SocialPost['type']) => {
    setIsLoading(true);
    try {
      const { content } = await localSocialEngine.generatePostContent(
        type,
        { type },
        { tone: settings.content.personalityTone }
      );
      
      await updateSetting(`types.${type}.template`, content);
      Alert.alert('Template Generated', 'AI has generated a new template for you!');
    } catch (error) {
      console.error('Error generating AI template:', error);
      Alert.alert('Error', 'Failed to generate template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetTemplate = async (type: SocialPost['type']) => {
    const defaultTemplates: Record<SocialPost['type'], string> = {
      workout_complete: 'Just finished {workoutName}! 💪 {duration} minutes of pure dedication 🔥',
      achievement: 'Unlocked "{achievementName}"! 🏆 {description}',
      progress_photo: '{timeframe} progress update! 📸 The journey continues...',
      milestone: 'Hit a major milestone today! 🎯 {milestone}',
      personal_record: 'New PR! {exercise}: {value}{unit} 🎯 {improvement}% improvement!',
      text: '{content}',
    };
    
    await updateSetting(`types.${type}.template`, defaultTemplates[type]);
  };

  const renderPostTypeSettings = (type: SocialPost['type']) => {
    const typeSettings = settings.types[type];
    const typeLabels: Record<SocialPost['type'], { title: string; description: string; icon: React.ComponentType<any> }> = {
      workout_complete: {
        title: 'Workout Completion',
        description: 'Auto-post when you complete a workout',
        icon: Target,
      },
      achievement: {
        title: 'Achievements',
        description: 'Auto-post when you unlock achievements',
        icon: Trophy,
      },
      progress_photo: {
        title: 'Progress Photos',
        description: 'Auto-post progress photos with updates',
        icon: Camera,
      },
      milestone: {
        title: 'Milestones',
        description: 'Auto-post when you reach fitness milestones',
        icon: TrendingUp,
      },
      personal_record: {
        title: 'Personal Records',
        description: 'Auto-post when you set new PRs',
        icon: TrendingUp,
      },
      text: {
        title: 'Text Posts',
        description: 'Auto-post custom text content',
        icon: MessageSquare,
      },
    };

    const typeInfo = typeLabels[type];
    const IconComponent = typeInfo.icon;

    return (
      <View key={type} style={styles.postTypeContainer}>
        <View style={styles.postTypeHeader}>
          <View style={styles.postTypeInfo}>
            <View style={styles.postTypeIcon}>
              <IconComponent size={20} color={DesignTokens.colors.primary[500]} />
            </View>
            <View style={styles.postTypeText}>
              <Text style={styles.postTypeTitle}>{typeInfo.title}</Text>
              <Text style={styles.postTypeDescription}>{typeInfo.description}</Text>
            </View>
          </View>
          <Switch
            value={typeSettings.enabled}
            onValueChange={(value) => updateSetting(`types.${type}.enabled`, value)}
            trackColor={{ false: DesignTokens.colors.neutral[700], true: DesignTokens.colors.primary[500] }}
            thumbColor="#FFFFFF"
          />
        </View>

        {typeSettings.enabled && (
          <View style={styles.postTypeSettings}>
            {/* Template Editor */}
            <View style={styles.templateContainer}>
              <View style={styles.templateHeader}>
                <Text style={styles.templateLabel}>Post Template</Text>
                <View style={styles.templateActions}>
                  <TouchableOpacity
                    style={styles.templateAction}
                    onPress={() => generateAITemplate(type)}
                  >
                    <Sparkles size={16} color={DesignTokens.colors.primary[500]} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.templateAction}
                    onPress={() => resetTemplate(type)}
                  >
                    <RotateCcw size={16} color={DesignTokens.colors.text.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.templateAction}
                    onPress={() => setEditingTemplate(editingTemplate === type ? null : type)}
                  >
                    <Edit3 size={16} color={DesignTokens.colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {editingTemplate === type ? (
                <View style={styles.templateEditor}>
                  <TextInput
                    style={styles.templateInput}
                    value={typeSettings.template}
                    onChangeText={(text) => updateSetting(`types.${type}.template`, text)}
                    multiline
                    placeholder="Enter your post template..."
                    placeholderTextColor={DesignTokens.colors.text.tertiary}
                  />
                  <TouchableOpacity
                    style={styles.saveTemplateButton}
                    onPress={() => setEditingTemplate(null)}
                  >
                    <Save size={16} color={DesignTokens.colors.primary[500]} />
                    <Text style={styles.saveTemplateText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.templatePreview}>
                  <Text style={styles.templateText}>{typeSettings.template}</Text>
                </View>
              )}
            </View>

            {/* Content Options */}
            <View style={styles.contentOptions}>
              <View style={styles.contentOption}>
                <Text style={styles.contentOptionLabel}>Include Stats</Text>
                <Switch
                  value={typeSettings.includeStats}
                  onValueChange={(value) => updateSetting(`types.${type}.includeStats`, value)}
                  trackColor={{ false: DesignTokens.colors.neutral[700], true: DesignTokens.colors.primary[500] }}
                  thumbColor="#FFFFFF"
                />
              </View>
              
              <View style={styles.contentOption}>
                <Text style={styles.contentOptionLabel}>Include Location</Text>
                <Switch
                  value={typeSettings.includeLocation}
                  onValueChange={(value) => updateSetting(`types.${type}.includeLocation`, value)}
                  trackColor={{ false: DesignTokens.colors.neutral[700], true: DesignTokens.colors.primary[500] }}
                  thumbColor="#FFFFFF"
                />
              </View>
              
              <View style={styles.contentOption}>
                <Text style={styles.contentOptionLabel}>Include Tags</Text>
                <Switch
                  value={typeSettings.includeTags}
                  onValueChange={(value) => updateSetting(`types.${type}.includeTags`, value)}
                  trackColor={{ false: DesignTokens.colors.neutral[700], true: DesignTokens.colors.primary[500] }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Master Toggle */}
      <View style={styles.section}>
        <View style={styles.masterToggle}>
          <View style={styles.masterToggleInfo}>
            <Zap size={24} color={DesignTokens.colors.primary[500]} />
            <View style={styles.masterToggleText}>
              <Text style={styles.masterToggleTitle}>Auto-Posting</Text>
              <Text style={styles.masterToggleDescription}>
                Automatically share your fitness achievements
              </Text>
            </View>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={(value) => updateSetting('enabled', value)}
            trackColor={{ false: DesignTokens.colors.neutral[700], true: DesignTokens.colors.primary[500] }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {settings.enabled && (
        <>
          {/* Post Types */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Post Types</Text>
            <Text style={styles.sectionDescription}>
              Choose what types of activities to auto-post
            </Text>
            
            {Object.keys(settings.types).map((type) => 
              renderPostTypeSettings(type as SocialPost['type'])
            )}
          </View>

          {/* Timing Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timing</Text>
            <Text style={styles.sectionDescription}>
              Control when auto-posts are published
            </Text>
            
            <View style={styles.timingOption}>
              <View style={styles.timingOptionInfo}>
                <Clock size={20} color={DesignTokens.colors.text.secondary} />
                <View style={styles.timingOptionText}>
                  <Text style={styles.timingOptionTitle}>Post Immediately</Text>
                  <Text style={styles.timingOptionDescription}>
                    Publish posts as soon as activities are completed
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.timing.immediate}
                onValueChange={(value) => updateSetting('timing.immediate', value)}
                trackColor={{ false: DesignTokens.colors.neutral[700], true: DesignTokens.colors.primary[500] }}
                thumbColor="#FFFFFF"
              />
            </View>

            {!settings.timing.immediate && (
              <View style={styles.delayContainer}>
                <Text style={styles.delayLabel}>Delay (minutes)</Text>
                <TextInput
                  style={styles.delayInput}
                  value={settings.timing.delay.toString()}
                  onChangeText={(text) => updateSetting('timing.delay', parseInt(text) || 0)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={DesignTokens.colors.text.tertiary}
                />
              </View>
            )}

            <View style={styles.timingOption}>
              <View style={styles.timingOptionInfo}>
                <Clock size={20} color={DesignTokens.colors.text.secondary} />
                <View style={styles.timingOptionText}>
                  <Text style={styles.timingOptionTitle}>Quiet Hours</Text>
                  <Text style={styles.timingOptionDescription}>
                    Pause auto-posting during specified hours
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.timing.quietHours.enabled}
                onValueChange={(value) => updateSetting('timing.quietHours.enabled', value)}
                trackColor={{ false: DesignTokens.colors.neutral[700], true: DesignTokens.colors.primary[500] }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Privacy Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            <Text style={styles.sectionDescription}>
              Control the privacy of auto-generated posts
            </Text>
            
            <View style={styles.privacyOption}>
              <Text style={styles.privacyOptionLabel}>Default Visibility</Text>
              <View style={styles.visibilityButtons}>
                {['public', 'friends', 'private'].map((visibility) => (
                  <TouchableOpacity
                    key={visibility}
                    style={[
                      styles.visibilityButton,
                      settings.privacy.defaultVisibility === visibility && styles.visibilityButtonActive,
                    ]}
                    onPress={() => updateSetting('privacy.defaultVisibility', visibility)}
                  >
                    <Text style={[
                      styles.visibilityButtonText,
                      settings.privacy.defaultVisibility === visibility && styles.visibilityButtonTextActive,
                    ]}>
                      {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.privacyOption}>
              <View style={styles.privacyOptionInfo}>
                <Text style={styles.privacyOptionTitle}>Require Approval</Text>
                <Text style={styles.privacyOptionDescription}>
                  Review auto-generated posts before publishing
                </Text>
              </View>
              <Switch
                value={settings.privacy.requireApproval}
                onValueChange={(value) => updateSetting('privacy.requireApproval', value)}
                trackColor={{ false: DesignTokens.colors.neutral[700], true: DesignTokens.colors.primary[500] }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Content Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content Generation</Text>
            <Text style={styles.sectionDescription}>
              Customize how auto-posts are generated
            </Text>
            
            <View style={styles.contentSetting}>
              <View style={styles.contentSettingInfo}>
                <Sparkles size={20} color={DesignTokens.colors.text.secondary} />
                <View style={styles.contentSettingText}>
                  <Text style={styles.contentSettingTitle}>Use AI Enhancement</Text>
                  <Text style={styles.contentSettingDescription}>
                    Let AI improve your post content
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.content.useAI}
                onValueChange={(value) => updateSetting('content.useAI', value)}
                trackColor={{ false: DesignTokens.colors.neutral[700], true: DesignTokens.colors.primary[500] }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.contentSetting}>
              <Text style={styles.contentSettingLabel}>Personality Tone</Text>
              <View style={styles.toneButtons}>
                {['casual', 'motivational', 'professional', 'humorous'].map((tone) => (
                  <TouchableOpacity
                    key={tone}
                    style={[
                      styles.toneButton,
                      settings.content.personalityTone === tone && styles.toneButtonActive,
                    ]}
                    onPress={() => updateSetting('content.personalityTone', tone)}
                  >
                    <Text style={[
                      styles.toneButtonText,
                      settings.content.personalityTone === tone && styles.toneButtonTextActive,
                    ]}>
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.contentSetting}>
              <View style={styles.contentSettingInfo}>
                <Text style={styles.contentSettingTitle}>Include Emojis</Text>
                <Text style={styles.contentSettingDescription}>
                  Add emojis to make posts more engaging
                </Text>
              </View>
              <Switch
                value={settings.content.includeEmojis}
                onValueChange={(value) => updateSetting('content.includeEmojis', value)}
                trackColor={{ false: DesignTokens.colors.neutral[700], true: DesignTokens.colors.primary[500] }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Button
              title="Test Auto-Post"
              variant="secondary"
              size="large"
              onPress={() => Alert.alert('Test Post', 'This would generate a test auto-post.')}
              icon={<Zap size={20} color={DesignTokens.colors.primary[500]} />}
              style={styles.actionButton}
            />
            
            <Button
              title="Reset All Settings"
              variant="secondary"
              size="large"
              onPress={() => Alert.alert('Reset Settings', 'This would reset all auto-post settings to defaults.')}
              icon={<RotateCcw size={20} color={DesignTokens.colors.text.secondary} />}
              style={styles.actionButton}
            />
          </View>
        </>
      )}

      {/* Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoContainer}>
          <Info size={20} color={DesignTokens.colors.primary[500]} />
          <Text style={styles.infoText}>
            Auto-posting helps you stay connected with your fitness community by automatically sharing your achievements and progress. You can always edit or delete auto-generated posts.
          </Text>
        </View>
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
  masterToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  masterToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: DesignTokens.spacing[4],
  },
  masterToggleText: {
    marginLeft: DesignTokens.spacing[3],
    flex: 1,
  },
  masterToggleTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  masterToggleDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  postTypeContainer: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[3],
  },
  postTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  postTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: DesignTokens.spacing[4],
  },
  postTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing[3],
  },
  postTypeText: {
    flex: 1,
  },
  postTypeTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  postTypeDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  postTypeSettings: {
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[700],
    paddingTop: DesignTokens.spacing[3],
  },
  templateContainer: {
    marginBottom: DesignTokens.spacing[3],
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  templateLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
  },
  templateActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  templateAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignTokens.colors.surface.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateEditor: {
    gap: DesignTokens.spacing[3],
  },
  templateInput: {
    backgroundColor: DesignTokens.colors.surface.tertiary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveTemplateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    borderRadius: DesignTokens.borderRadius.md,
    paddingVertical: DesignTokens.spacing[2],
    gap: DesignTokens.spacing[2],
  },
  saveTemplateText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.primary[500],
  },
  templatePreview: {
    backgroundColor: DesignTokens.colors.surface.tertiary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
  },
  templateText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  contentOptions: {
    gap: DesignTokens.spacing[2],
  },
  contentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[2],
  },
  contentOptionLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
  },
  timingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  timingOptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: DesignTokens.spacing[4],
  },
  timingOptionText: {
    marginLeft: DesignTokens.spacing[3],
    flex: 1,
  },
  timingOptionTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  timingOptionDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  delayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: DesignTokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  delayLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
  },
  delayInput: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    minWidth: 80,
    textAlign: 'center',
  },
  privacyOption: {
    marginBottom: DesignTokens.spacing[4],
  },
  privacyOptionLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[3],
  },
  privacyOptionInfo: {
    flex: 1,
    marginRight: DesignTokens.spacing[4],
  },
  privacyOptionTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  privacyOptionDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  visibilityButtons: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  visibilityButton: {
    flex: 1,
    paddingVertical: DesignTokens.spacing[3],
    paddingHorizontal: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  visibilityButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    borderColor: DesignTokens.colors.primary[500],
  },
  visibilityButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.secondary,
  },
  visibilityButtonTextActive: {
    color: DesignTokens.colors.primary[500],
  },
  contentSetting: {
    marginBottom: DesignTokens.spacing[4],
  },
  contentSettingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentSettingText: {
    flex: 1,
    marginLeft: DesignTokens.spacing[3],
    marginRight: DesignTokens.spacing[4],
  },
  contentSettingTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  contentSettingDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  contentSettingLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[3],
  },
  toneButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[2],
  },
  toneButton: {
    paddingVertical: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toneButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    borderColor: DesignTokens.colors.primary[500],
  },
  toneButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.secondary,
  },
  toneButtonTextActive: {
    color: DesignTokens.colors.primary[500],
  },
  actionButton: {
    marginBottom: DesignTokens.spacing[3],
  },
  infoSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[6],
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: DesignTokens.colors.primary[500] + '10',
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    gap: DesignTokens.spacing[3],
  },
  infoText: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
  },
});
