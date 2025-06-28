import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Search, Trophy } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useSocialFeed } from '@/hooks/useSocialFeed';
import SocialFeedPost from '@/components/SocialFeedPost';
import PostCommentsModal from '@/components/PostCommentsModal';
import CreatePostModal from '@/components/CreatePostModal';

export default function SocialScreen() {
  const { user } = useAuth();
  const {
    posts,
    loading,
    refreshing,
    error,
    refreshFeed,
    toggleLike,
    createWorkoutPost,
    createAchievementPost,
    createProgressPost,
    deletePost,
  } = useSocialFeed(user?.id);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const leaderboard = [
    { name: 'Alex Thompson', points: 2450, rank: 1, avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2' },
    { name: 'Sarah Johnson', points: 2380, rank: 2, avatar: 'https://images.pexels.com/photos/3823488/pexels-photo-3823488.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2' },
    { name: 'Mike Chen', points: 2290, rank: 3, avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2' },
    { name: 'You', points: 2180, rank: 4, avatar: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2' },
  ];

  const handleLike = async (postId: number) => {
    await toggleLike(postId);
  };

  const handleComment = (postId: number) => {
    setSelectedPostId(postId);
    setShowComments(true);
  };

  const handleShare = (postId: number) => {
    Alert.alert('Share Post', 'Share functionality coming soon!');
  };

  const handleDeletePost = async (postId: number) => {
    await deletePost(postId);
  };

  const handleCreatePost = async (content: string, type: 'general' | 'workout' | 'achievement' | 'progress') => {
    switch (type) {
      case 'workout':
        await createWorkoutPost(content);
        break;
      case 'achievement':
        // For demo purposes, we'll create a general post
        // In a real app, you'd select a specific achievement
        await createAchievementPost(content, 1);
        break;
      case 'progress':
        await createProgressPost(content);
        break;
      default:
        await createProgressPost(content); // General posts as progress posts
        break;
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshFeed} />
      }
    >
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Social</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Search size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowCreatePost(true)}
            >
              <Plus size={24} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Connect with the community</Text>
      </LinearGradient>

      <View style={styles.leaderboardContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weekly Leaderboard</Text>
          <TouchableOpacity>
            <Trophy size={24} color="#FF6B35" />
          </TouchableOpacity>
        </View>
        <View style={styles.leaderboardCard}>
          {leaderboard.map((user, index) => (
            <View key={index} style={[
              styles.leaderboardItem,
              user.name === 'You' && styles.currentUserItem
            ]}>
              <View style={styles.rankContainer}>
                <Text style={[
                  styles.rankText,
                  user.rank <= 3 && styles.topRankText
                ]}>#{user.rank}</Text>
              </View>
              <View style={styles.leaderboardAvatar} />
              <Text style={styles.leaderboardName}>{user.name}</Text>
              <Text style={styles.leaderboardPoints}>{user.points.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.feedContainer}>
        <Text style={styles.sectionTitle}>Community Feed</Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshFeed}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && posts.length === 0 ? (
          <Text style={styles.loadingText}>Loading feed...</Text>
        ) : posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyText}>
              Be the first to share your fitness journey!
            </Text>
            <TouchableOpacity 
              style={styles.createFirstPostButton}
              onPress={() => setShowCreatePost(true)}
            >
              <Text style={styles.createFirstPostText}>Create Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          posts.map((post) => (
            <SocialFeedPost
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </View>

      {/* Create Post Modal */}
      <CreatePostModal
        visible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onCreatePost={handleCreatePost}
      />

      {/* Comments Modal */}
      {selectedPostId && (
        <PostCommentsModal
          visible={showComments}
          postId={selectedPostId}
          userId={user?.id}
          onClose={() => {
            setShowComments(false);
            setSelectedPostId(null);
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  leaderboardContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  leaderboardCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  currentUserItem: {
    backgroundColor: '#FF6B3520',
    borderRadius: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 0,
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Bold',
  },
  topRankText: {
    color: '#FF6B35',
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    marginLeft: 12,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 12,
  },
  leaderboardPoints: {
    fontSize: 14,
    color: '#4A90E2',
    fontFamily: 'Inter-Bold',
  },
  feedContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    paddingBottom: 100,
  },
  errorContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createFirstPostButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFirstPostText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
});