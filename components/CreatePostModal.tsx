import React, { useEffect, useState } from 'react';
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
import {
  X,
  Send,
  Dumbbell,
  Trophy,
  TrendingUp,
  MessageSquare,
  Image as ImageIcon,
  Smile,
} from 'lucide-react-native';
import { WorkoutSession } from '@/lib/supabase';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onCreatePost: (
    content: string,
    type: 'general' | 'workout' | 'achievement' | 'progress',
    workoutSessionId?: number,
    achievementId?: number
  ) => Promise<void>;
  coachingGoal?: string | null;
  workoutSessions?: Pick<WorkoutSession, 'id' | 'duration_minutes' | 'started_at'>[];
  achievements?: {
    id: number;
    name: string;
    description?: string | null;
    points?: number | null;
  }[];
}

export default function CreatePostModal({
  visible,
  onClose,
  onCreatePost,
  coachingGoal,
  workoutSessions = [],
  achievements = [],
}: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'general' | 'workout' | 'achievement' | 'progress'>(
    'general'
  );
  const [submitting, setSubmitting] = useState(false);
  const [tagPath, setTagPath] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | undefined>();
  const [selectedAchievementId, setSelectedAchievementId] = useState<number | undefined>();

  useEffect(() => {
    if (postType === 'workout' && workoutSessions.length > 0) {
      setSelectedSessionId(workoutSessions[0].id);
    }
    if (postType === 'achievement' && achievements.length > 0) {
      setSelectedAchievementId(achievements[0].id as number);
    }
  }, [postType, workoutSessions, achievements]);

  const postTypes = [
    {
      id: 'general',
      name: 'General',
      icon: MessageSquare,
      color: '#4A90E2',
      description: 'Share thoughts or updates',
    },
    {
      id: 'workout',
      name: 'Workout',
      icon: Dumbbell,
      color: '#FF6B35',
      description: 'Share your workout session',
    },
    {
      id: 'achievement',
      name: 'Achievement',
      icon: Trophy,
      color: '#FFD700',
      description: 'Celebrate your wins',
    },
    {
      id: 'progress',
      name: 'Progress',
      icon: TrendingUp,
      color: '#27AE60',
      description: 'Show your improvements',
    },
  ];

  const placeholderTexts = {
    general: "What's on your mind?",
    workout: 'How was your workout today? Share the details!',
    achievement: 'What achievement are you celebrating? 🎉',
    progress: 'What progress have you made? Share your journey!',
  };

  const sessionLabel = (session: WorkoutSession) => {
    const duration = session.duration_minutes ? `${session.duration_minutes} min • ` : '';
    const started = session.started_at ? new Date(session.started_at).toLocaleDateString() : '';
    return `${duration}${started || 'Session'} #${session.id}`;
  };

  const achievementLabel = (achievement: { name: string; points?: number | null }) =>
    `${achievement.name}${achievement.points ? ` (${achievement.points} pts)` : ''}`;

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    if (content.trim().length > 500) {
      Alert.alert('Error', 'Post content must be less than 500 characters');
      return;
    }

    const contentWithTag =
      tagPath && coachingGoal ? `${content.trim()}\n#OnPath: ${coachingGoal}` : content.trim();

    if (postType === 'workout' && workoutSessions.length > 0 && !selectedSessionId) {
      Alert.alert('Pick a session', 'Select a workout session to attach.');
      return;
    }
    if (postType === 'achievement' && achievements.length > 0 && !selectedAchievementId) {
      Alert.alert('Pick an achievement', 'Select an achievement to celebrate.');
      return;
    }

    setSubmitting(true);
    try {
      await onCreatePost(contentWithTag, postType, selectedSessionId, selectedAchievementId);
      setContent('');
      setPostType('general');
      setTagPath(false);
      setSelectedSessionId(undefined);
      setSelectedAchievementId(undefined);
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
      Alert.alert('Discard Post', 'Are you sure you want to discard this post?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            setContent('');
            setPostType('general');
            onClose();
          },
        },
      ]);
    } else {
      onClose();
    }
  };

  const selectedPostType = postTypes.find((type) => type.id === postType);

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
        <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
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
            <Send size={16} color={!content.trim() || submitting ? '#666' : '#fff'} />
            <Text
              style={[
                styles.postButtonText,
                (!content.trim() || submitting) && styles.postButtonTextDisabled,
              ]}
            >
              {submitting ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Post Type Selection */}
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
                  <View
                    style={[
                      styles.postTypeIconContainer,
                      { backgroundColor: postType === type.id ? type.color : `${type.color}20` },
                    ]}
                  >
                    <type.icon size={20} color={postType === type.id ? '#fff' : type.color} />
                  </View>
                  <Text
                    style={[styles.postTypeText, postType === type.id && styles.postTypeTextActive]}
                  >
                    {type.name}
                  </Text>
                  <Text style={styles.postTypeDescription}>{type.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Content Input */}
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>{selectedPostType?.name} Post</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.contentInput}
                placeholder={placeholderTexts[postType]}
                placeholderTextColor="#999"
                value={content}
                onChangeText={setContent}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <View style={styles.inputFooter}>
                <Text style={styles.characterCount}>{content.length}/500</Text>
                <View style={styles.inputActions}>
                  <TouchableOpacity style={styles.inputActionButton}>
                    <ImageIcon size={20} color="#999" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.inputActionButton}>
                    <Smile size={20} color="#999" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {postType === 'workout' && (
            <View style={styles.selectorContainer}>
              <Text style={styles.sectionTitle}>Attach workout session</Text>
              {workoutSessions.length === 0 ? (
                <Text style={styles.emptyText}>No recent sessions found.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {workoutSessions.map((session) => (
                    <TouchableOpacity
                      key={session.id}
                      style={[
                        styles.selectorChip,
                        selectedSessionId === session.id && styles.selectorChipActive,
                      ]}
                      onPress={() => setSelectedSessionId(session.id)}
                    >
                      <Dumbbell
                        size={16}
                        color={selectedSessionId === session.id ? '#000' : '#FF6B35'}
                      />
                      <Text
                        style={[
                          styles.selectorText,
                          selectedSessionId === session.id && styles.selectorTextActive,
                        ]}
                      >
                        {sessionLabel(session)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {postType === 'achievement' && (
            <View style={styles.selectorContainer}>
              <Text style={styles.sectionTitle}>Pick achievement</Text>
              {achievements.length === 0 ? (
                <Text style={styles.emptyText}>No achievements unlocked yet.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {achievements.map((achievement) => (
                    <TouchableOpacity
                      key={achievement.id}
                      style={[
                        styles.selectorChip,
                        selectedAchievementId === achievement.id && styles.selectorChipActive,
                      ]}
                      onPress={() => setSelectedAchievementId(achievement.id as number)}
                    >
                      <Trophy
                        size={16}
                        color={selectedAchievementId === achievement.id ? '#000' : '#FFD700'}
                      />
                      <Text
                        style={[
                          styles.selectorText,
                          selectedAchievementId === achievement.id && styles.selectorTextActive,
                        ]}
                      >
                        {achievementLabel(achievement)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {coachingGoal ? (
            <TouchableOpacity
              style={[styles.tagRow, tagPath ? styles.tagRowActive : styles.tagRowInactive]}
              onPress={() => setTagPath((prev) => !prev)}
            >
              <Text
                style={[styles.tagText, tagPath ? styles.tagTextActive : styles.tagTextInactive]}
              >
                Tag my coaching path: {coachingGoal}
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Post Type Tips */}
          {postType === 'workout' && (
            <View style={[styles.tipContainer, { borderColor: '#FF6B35' }]}>
              <View style={styles.tipHeader}>
                <Dumbbell size={16} color="#FF6B35" />
                <Text style={styles.tipTitle}>💪 Workout Post Tips</Text>
              </View>
              <Text style={styles.tipText}>
                • Share what exercises you did{'\n'}• Mention your achievements or PRs{'\n'}•
                Include how you felt during the workout{'\n'}• Add any challenges you overcame
              </Text>
            </View>
          )}

          {postType === 'achievement' && (
            <View style={[styles.tipContainer, { borderColor: '#FFD700' }]}>
              <View style={styles.tipHeader}>
                <Trophy size={16} color="#FFD700" />
                <Text style={styles.tipTitle}>🏆 Achievement Post Tips</Text>
              </View>
              <Text style={styles.tipText}>
                • Celebrate your personal records{'\n'}• Share milestone moments{'\n'}• Inspire
                others with your progress{'\n'}• Mention what helped you achieve this
              </Text>
            </View>
          )}

          {postType === 'progress' && (
            <View style={[styles.tipContainer, { borderColor: '#27AE60' }]}>
              <View style={styles.tipHeader}>
                <TrendingUp size={16} color="#27AE60" />
                <Text style={styles.tipTitle}>📈 Progress Post Tips</Text>
              </View>
              <Text style={styles.tipText}>
                • Share before/after comparisons{'\n'}• Mention what's working for you{'\n'}•
                Include your goals and plans{'\n'}• Show your consistency journey
              </Text>
            </View>
          )}

          {postType === 'general' && (
            <View style={[styles.tipContainer, { borderColor: '#4A90E2' }]}>
              <View style={styles.tipHeader}>
                <MessageSquare size={16} color="#4A90E2" />
                <Text style={styles.tipTitle}>💬 General Post Tips</Text>
              </View>
              <Text style={styles.tipText}>
                • Share your thoughts and experiences{'\n'}• Ask questions to the community{'\n'}•
                Provide motivation and support{'\n'}• Connect with fellow fitness enthusiasts
              </Text>
            </View>
          )}

          <View style={styles.bottomSpacer} />
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
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 6,
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
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333',
    width: 140,
    alignItems: 'center',
  },
  postTypeButtonActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FF6B3510',
  },
  tagRow: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  tagRowActive: {
    borderColor: '#27AE60',
    backgroundColor: '#27AE6020',
  },
  tagRowInactive: {
    borderColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  tagText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  tagTextActive: {
    color: '#27AE60',
  },
  tagTextInactive: {
    color: '#ccc',
  },
  postTypeIconContainer: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  postTypeText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  postTypeTextActive: {
    color: '#fff',
  },
  postTypeDescription: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 14,
  },
  contentContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  contentInput: {
    padding: 16,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputActionButton: {
    padding: 8,
    marginLeft: 8,
  },
  selectorContainer: {
    marginBottom: 20,
    gap: 8,
  },
  selectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1a1a1a',
    marginRight: 8,
    gap: 8,
  },
  selectorChipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  selectorText: {
    color: '#ccc',
    fontFamily: 'Inter-Medium',
  },
  selectorTextActive: {
    color: '#000',
  },
  emptyText: {
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  tipContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 100,
  },
});
