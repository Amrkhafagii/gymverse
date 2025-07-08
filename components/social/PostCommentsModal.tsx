import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Send,
  Heart,
  MoreHorizontal,
  Reply,
  Trash2,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { SocialPost, SocialComment, useSocial } from '@/contexts/SocialContext';
import * as Haptics from 'expo-haptics';

interface PostCommentsModalProps {
  visible: boolean;
  onClose: () => void;
  post: SocialPost | null;
}

export function PostCommentsModal({
  visible,
  onClose,
  post,
}: PostCommentsModalProps) {
  const { addComment, deleteComment, likeComment, currentUser } = useSocial();
  
  // State
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  const commentInputRef = useRef<TextInput>(null);

  // Focus input when replying
  useEffect(() => {
    if (replyingTo && visible) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 100);
    }
  }, [replyingTo, visible]);

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !post || isSubmitting) return;

    setIsSubmitting(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await addComment(post.id, commentText.trim());
      setCommentText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!post) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await likeComment(post.id, commentId);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (!post) return;

    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComment(post.id, commentId);
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', 'Failed to delete comment.');
            }
          },
        },
      ]
    );
  };

  const handleReply = (comment: SocialComment) => {
    setReplyingTo(comment.id);
    setCommentText(`@${comment.username} `);
    commentInputRef.current?.focus();
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - commentTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return commentTime.toLocaleDateString();
  };

  const renderComment = ({ item: comment }: { item: SocialComment }) => (
    <View style={styles.commentContainer}>
      <Image source={{ uri: comment.userAvatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>{comment.username}</Text>
          <Text style={styles.commentTime}>{formatTimeAgo(comment.timestamp)}</Text>
        </View>
        <Text style={styles.commentText}>{comment.content}</Text>
        
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={[styles.commentAction, comment.isLiked && styles.commentActionActive]}
            onPress={() => handleLikeComment(comment.id)}
          >
            <Heart
              size={14}
              color={comment.isLiked ? '#ef4444' : DesignTokens.colors.text.tertiary}
              fill={comment.isLiked ? '#ef4444' : 'none'}
            />
            {comment.likes > 0 && (
              <Text style={[
                styles.commentActionText,
                comment.isLiked && styles.commentActionTextActive
              ]}>
                {comment.likes}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.commentAction}
            onPress={() => handleReply(comment)}
          >
            <Reply size={14} color={DesignTokens.colors.text.tertiary} />
            <Text style={styles.commentActionText}>Reply</Text>
          </TouchableOpacity>
          
          {comment.userId === currentUser?.id && (
            <TouchableOpacity
              style={styles.commentAction}
              onPress={() => handleDeleteComment(comment.id)}
            >
              <Trash2 size={14} color={DesignTokens.colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  if (!post) return null;

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
            <Text style={styles.headerTitle}>Comments</Text>
            <View style={styles.headerRight}>
              <Text style={styles.commentCount}>
                {post.comments.length}
              </Text>
            </View>
          </View>

          {/* Comments List */}
          <FlatList
            data={post.comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            style={styles.commentsList}
            contentContainerStyle={styles.commentsListContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MessageCircle size={48} color={DesignTokens.colors.text.tertiary} />
                <Text style={styles.emptyStateTitle}>No comments yet</Text>
                <Text style={styles.emptyStateText}>
                  Be the first to share your thoughts!
                </Text>
              </View>
            }
          />

          {/* Comment Input */}
          <View style={styles.commentInputContainer}>
            {replyingTo && (
              <View style={styles.replyingToContainer}>
                <Text style={styles.replyingToText}>
                  Replying to comment
                </Text>
                <TouchableOpacity onPress={() => {
                  setReplyingTo(null);
                  setCommentText('');
                }}>
                  <X size={16} color={DesignTokens.colors.text.secondary} />
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.commentInputRow}>
              <Image 
                source={{ uri: currentUser?.avatar }} 
                style={styles.currentUserAvatar} 
              />
              <TextInput
                ref={commentInputRef}
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor={DesignTokens.colors.text.tertiary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!commentText.trim() || isSubmitting) && styles.sendButtonDisabled
                ]}
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || isSubmitting}
              >
                <Send size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
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
  headerRight: {
    padding: DesignTokens.spacing[2],
  },
  commentCount: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  commentsList: {
    flex: 1,
  },
  commentsListContent: {
    padding: DesignTokens.spacing[5],
    paddingBottom: DesignTokens.spacing[8],
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: DesignTokens.spacing[4],
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: DesignTokens.spacing[3],
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[1],
    gap: DesignTokens.spacing[2],
  },
  commentUsername: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  commentTime: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  commentText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    lineHeight: 18,
    marginBottom: DesignTokens.spacing[2],
  },
  commentActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[4],
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    paddingVertical: DesignTokens.spacing[1],
  },
  commentActionActive: {
    // Active state styling handled by icon color
  },
  commentActionText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  commentActionTextActive: {
    color: '#ef4444',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing[8],
  },
  emptyStateTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[2],
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  commentInputContainer: {
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
    padding: DesignTokens.spacing[4],
  },
  replyingToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.secondary,
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.sm,
    marginBottom: DesignTokens.spacing[3],
  },
  replyingToText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontStyle: 'italic',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: DesignTokens.spacing[3],
  },
  currentUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentInput: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: DesignTokens.colors.neutral[700],
    opacity: 0.5,
  },
});
