import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Send, Dumbbell, Trophy, TrendingUp, MessageSquare } from 'lucide-react-native';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onCreatePost: (content: string, type: 'general' | 'workout' | 'achievement' | 'progress') => Promise<void>;
}

export default function CreatePostModal({
  visible,
  onClose,
  onCreatePost,
}: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'general' | 'workout' | 'achievement' | 'progress'>('general');
  const [submitting, setSubmitting] = useState(false);

  const postTypes = [
    { id: 'general', name: 'General', icon: MessageSquare, color: '#4A90E2' },
    { id: 'workout', name: 'Workout', icon: Dumbbell, color: '#FF6B35' },
    { id: 'achievement', name: 'Achievement', icon: Trophy, color: '#FFD700' },
    { id: 'progress', name: 'Progress', icon: TrendingUp, color: '#27AE60' },
  ];

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    setSubmitting(true);
    try {
      await onCreatePost(content.trim(), postType);
      setContent('');
      setPostType('general');
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (content.trim()) {
      Alert.alert(
        'Discard Post',
        'Are you sure you want to discard this post?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive', 
            onPress: () => {
              setContent('');
              setPostType('general');
              onClose();
            }
          },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <TouchableOpacity
            style={[
              styles.postButton,
              (!content.trim() || submitting) && styles.postButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!content.trim() || submitting}
          >
            <Text style={[
              styles.postButtonText,
              (!content.trim() || submitting) && styles.postButtonTextDisabled,
            ]}>
              {submitting ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.postTypeContainer}>
            <Text style={styles.sectionTitle}>Post Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {postTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.postTypeButton,
                    postType === type.id && styles.postTypeButtonActive,
                  ]}
                  onPress={() => setPostType(type.id as any)}
                >
                  <type.icon 
                    size={20} 
                    color={postType === type.id ? '#fff' : type.color} 
                  />
                  <Text
                    style={[
                      styles.postTypeText,
                      postType === type.id && styles.postTypeTextActive,
                    ]}
                  >
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>What's on your mind?</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Share your fitness journey, achievements, or thoughts..."
              placeholderTextColor="#999"
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {content.length}/500
            </Text>
          </View>

          {postType === 'workout' && (
            <View style={styles.tipContainer}>
              <Text style={styles.tipTitle}>💪 Workout Post Tips:</Text>
              <Text style={styles.tipText}>
                • Share what exercises you did{'\n'}
                • Mention your achievements{'\n'}
                • Include how you felt during the workout
              </Text>
            </View>
          )}

          {postType === 'achievement' && (
            <View style={styles.tipContainer}>
              <Text style={styles.tipTitle}>🏆 Achievement Post Tips:</Text>
              <Text style={styles.tipText}>
                • Celebrate your personal records{'\n'}
                • Share milestone moments{'\n'}
                • Inspire others with your progress
              </Text>
            </View>
          )}

          {postType === 'progress' && (
            <View style={styles.tipContainer}>
              <Text style={styles.tipTitle}>📈 Progress Post Tips:</Text>
              <Text style={styles.tipText}>
                • Share before/after comparisons{'\n'}
                • Mention what's working for you{'\n'}
                • Include your goals and plans
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  postButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#333',
  },
  postButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  postButtonTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  postTypeContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  postTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  postTypeButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  postTypeText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  postTypeTextActive: {
    color: '#fff',
  },
  contentContainer: {
    marginBottom: 30,
  },
  contentInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#333',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'right',
    marginTop: 8,
  },
  tipContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  tipTitle: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
});