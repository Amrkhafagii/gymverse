import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Camera,
  Image as ImageIcon,
  MapPin,
  Hash,
  Globe,
  Users,
  Lock,
  Send,
  Smile,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useSocial, SocialPost } from '@/contexts/SocialContext';
import { Button } from '@/components/ui/Button';
import * as Haptics from 'expo-haptics';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  initialType?: SocialPost['type'];
  initialContent?: string;
  workoutData?: any;
  achievementData?: any;
  recordData?: any;
}

export function CreatePostModal({
  visible,
  onClose,
  initialType = 'text',
  initialContent = '',
  workoutData,
  achievementData,
  recordData,
}: CreatePostModalProps) {
  const { createPost, currentUser } = useSocial();
  
  // State
  const [content, setContent] = useState(initialContent);
  const [postType, setPostType] = useState<SocialPost['type']>(initialType);
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);

  const contentInputRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const postData: Partial<SocialPost> = {
        type: postType,
        content: content.trim(),
        location: location.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        visibility,
      };

      // Add type-specific data
      if (workoutData && postType === 'workout_complete') {
        postData.workoutData = workoutData;
      }
      if (achievementData && postType === 'achievement') {
        postData.achievementData = achievementData;
      }
      if (recordData && postType === 'personal_record') {
        postData.recordData = recordData;
      }

      await createPost(postData);
      
      // Reset form
      setContent('');
      setLocation('');
      setTags([]);
      setTagInput('');
      setVisibility('public');
      
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const getPostTypeIcon = (type: SocialPost['type']) => {
    switch (type) {
      case 'workout_complete':
        return '💪';
      case 'achievement':
        return '🏆';
      case 'progress_photo':
        return '📸';
      case 'milestone':
        return '🎯';
      case 'personal_record':
        return '📈';
      default:
        return '💭';
    }
  };

  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'public':
        return <Globe size={16} color={DesignTokens.colors.text.secondary} />;
      case 'friends':
        return <Users size={16} color={DesignTokens.colors.text.secondary} />;
      case 'private':
        return <Lock size={16} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const getCharacterCount = () => {
    const maxLength = 500;
    const remaining = maxLength - content.length;
    const isNearLimit = remaining < 50;
    
    return (
      <Text style={[
        styles.characterCount,
        isNearLimit && styles.characterCountWarning,
        remaining < 0 && styles.characterCountError
      ]}>
        {remaining}
      </Text>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.gradient}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={DesignTokens.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Post</Text>
            <TouchableOpacity
              style={[
                styles.postButton,
                (!content.trim() || isSubmitting) && styles.postButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!content.trim() || isSubmitting}
            >
              <Send size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* User Info */}
            <View style={styles.userInfo}>
              <Image 
                source={{ uri: currentUser?.avatar }} 
                style={styles.userAvatar} 
              />
              <View style={styles.userDetails}>
                <Text style={styles.username}>{currentUser?.displayName}</Text>
                <TouchableOpacity 
                  style={styles.visibilitySelector}
                  onPress={() => {
                    const options: Array<'public' | 'friends' | 'private'> = ['public', 'friends', 'private'];
                    const currentIndex = options.indexOf(visibility);
                    const nextIndex = (currentIndex + 1) % options.length;
                    setVisibility(options[nextIndex]);
                  }}
                >
                  {getVisibilityIcon()}
                  <Text style={styles.visibilityText}>
                    {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Post Type Selector */}
            <View style={styles.postTypeContainer}>
              <Text style={styles.sectionTitle}>Post Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.postTypeOptions}>
                  {(['text', 'workout_complete', 'achievement', 'progress_photo', 'milestone', 'personal_record'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.postTypeOption,
                        postType === type && styles.postTypeOptionActive
                      ]}
                      onPress={() => setPostType(type)}
                    >
                      <Text style={styles.postTypeEmoji}>
                        {getPostTypeIcon(type)}
                      </Text>
                      <Text style={[
                        styles.postTypeLabel,
                        postType === type && styles.postTypeLabelActive
                      ]}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Content Input */}
            <View style={styles.contentContainer}>
              <TextInput
                ref={contentInputRef}
                style={styles.contentInput}
                placeholder="What's on your mind?"
                placeholderTextColor={DesignTokens.colors.text.tertiary}
                value={content}
                onChangeText={setContent}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <View style={styles.contentFooter}>
                {getCharacterCount()}
              </View>
            </View>

            {/* Media Options */}
            <View style={styles.mediaOptions}>
              <TouchableOpacity style={styles.mediaOption}>
                <Camera size={20} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.mediaOptionText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaOption}>
                <ImageIcon size={20} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.mediaOptionText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaOption}>
                <Smile size={20} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.mediaOptionText}>Emoji</Text>
              </TouchableOpacity>
            </View>

            {/* Location */}
            <View style={styles.optionContainer}>
              <TouchableOpacity
                style={styles.optionToggle}
                onPress={() => setShowLocationInput(!showLocationInput)}
              >
                <MapPin size={20} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.optionLabel}>Add Location</Text>
                <Switch
                  value={showLocationInput}
                  onValueChange={setShowLocationInput}
                  trackColor={{ false: DesignTokens.colors.neutral[700], true: DesignTokens.colors.primary[500] }}
                  thumbColor="#FFFFFF"
                />
              </TouchableOpacity>
              {showLocationInput && (
                <TextInput
                  style={styles.optionInput}
                  placeholder="Where are you?"
                  placeholderTextColor={DesignTokens.colors.text.tertiary}
                  value={location}
                  onChangeText={setLocation}
                />
              )}
            </View>

            {/* Tags */}
            <View style={styles.optionContainer}>
              <TouchableOpacity
                style={styles.optionToggle}
                onPress={() => setShowTagInput(!showTagInput)}
              >
                <Hash size={20} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.optionLabel}>Add Tags</Text>
                <Switch
                  value={showTagInput}
                  onValueChange={setShowTagInput}
                  trackColor={{ false: DesignTokens.colors.neutral[700], true: DesignTokens.colors.primary[500] }}
                  thumbColor="#FFFFFF"
                />
              </TouchableOpacity>
              
              {showTagInput && (
                <View style={styles.tagContainer}>
                  <View style={styles.tagInputContainer}>
                    <TextInput
                      style={styles.tagInput}
                      placeholder="Add a tag..."
                      placeholderTextColor={DesignTokens.colors.text.tertiary}
                      value={tagInput}
                      onChangeText={setTagInput}
                      onSubmitEditing={handleAddTag}
                      maxLength={20}
                    />
                    <TouchableOpacity
                      style={styles.addTagButton}
                      onPress={handleAddTag}
                      disabled={!tagInput.trim() || tags.length >= 5}
                    >
                      <Text style={styles.addTagButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {tags.length > 0 && (
                    <View style={styles.tagsList}>
                      {tags.map((tag, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.tag}
                          onPress={() => handleRemoveTag(tag)}
                        >
                          <Text style={styles.tagText}>#{tag}</Text>
                          <X size={12} color={DesignTokens.colors.text.secondary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  
                  <Text style={styles.tagHint}>
                    {tags.length}/5 tags • Tap to remove
                  </Text>
                </View>
              )}
            </View>

            {/* Type-specific Data Preview */}
            {workoutData && postType === 'workout_complete' && (
              <View style={styles.dataPreview}>
                <Text style={styles.dataPreviewTitle}>Workout Data</Text>
                <Text style={styles.dataPreviewText}>
                  {workoutData.name} • {Math.round(workoutData.duration / 60)}min • {workoutData.exercises} exercises
                </Text>
              </View>
            )}

            {achievementData && postType === 'achievement' && (
              <View style={styles.dataPreview}>
                <Text style={styles.dataPreviewTitle}>Achievement</Text>
                <Text style={styles.dataPreviewText}>
                  {achievementData.icon} {achievementData.name}
                </Text>
              </View>
            )}

            {recordData && postType === 'personal_record' && (
              <View style={styles.dataPreview}>
                <Text style={styles.dataPreviewTitle}>Personal Record</Text>
                <Text style={styles.dataPreviewText}>
                  {recordData.exerciseName}: {recordData.newValue}{recordData.unit}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <Button
              title={isSubmitting ? "Posting..." : "Share Post"}
              onPress={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              size="large"
              variant="primary"
            />
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
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
  headerTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  postButton: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: DesignTokens.colors.neutral[700],
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: DesignTokens.spacing[5],
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[5],
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: DesignTokens.spacing[3],
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  visibilitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  visibilityText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  postTypeContainer: {
    marginBottom: DesignTokens.spacing[5],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[3],
  },
  postTypeOptions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },
  postTypeOption: {
    alignItems: 'center',
    padding: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.secondary,
    minWidth: 80,
  },
  postTypeOptionActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  postTypeEmoji: {
    fontSize: 24,
    marginBottom: DesignTokens.spacing[1],
  },
  postTypeLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  postTypeLabelActive: {
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  contentContainer: {
    marginBottom: DesignTokens.spacing[5],
  },
  contentInput: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[4],
    minHeight: 120,
    textAlignVertical: 'top',
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: DesignTokens.spacing[2],
  },
  characterCount: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  characterCountWarning: {
    color: '#f59e0b',
  },
  characterCountError: {
    color: '#ef4444',
  },
  mediaOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[3],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
  },
  mediaOption: {
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  mediaOptionText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  optionContainer: {
    marginBottom: DesignTokens.spacing[4],
  },
  optionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: DesignTokens.spacing[3],
  },
  optionLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    flex: 1,
    marginLeft: DesignTokens.spacing[2],
  },
  optionInput: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    marginTop: DesignTokens.spacing[2],
  },
  tagContainer: {
    marginTop: DesignTokens.spacing[2],
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[3],
  },
  tagInput: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
  },
  addTagButton: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: DesignTokens.borderRadius.md,
    paddingHorizontal: DesignTokens.spacing[4],
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[2],
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: DesignTokens.borderRadius.sm,
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    gap: DesignTokens.spacing[1],
  },
  tagText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  tagHint: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    textAlign: 'center',
  },
  dataPreview: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[4],
  },
  dataPreviewTitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  dataPreviewText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  submitContainer: {
    padding: DesignTokens.spacing[5],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
  },
});
