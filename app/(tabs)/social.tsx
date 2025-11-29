import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList,
  ListRenderItemInfo,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plus,
  Search,
  Trophy,
  Users,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Filter,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useSocialFeed } from '@/hooks/useSocialFeed';
import SocialFeedPost from '@/components/SocialFeedPost';
import PostCommentsModal from '@/components/PostCommentsModal';
import CreatePostModal from '@/components/CreatePostModal';
import SocialLeaderboard from '@/components/SocialLeaderboard';
import SocialStatsCard from '@/components/SocialStatsCard';
import { ScreenState } from '@/components/ScreenState';
import { useTheme } from '@/theme/ThemeProvider';

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
  const { colors } = useTheme();

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Mock leaderboard data - in production, this would come from the database
  const leaderboard = [
    {
      id: '1',
      name: 'Alex Thompson',
      username: 'alex_fit',
      points: 2450,
      rank: 1,
      avatar:
        'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      streak: 28,
      workouts: 156,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      username: 'sarah_strong',
      points: 2380,
      rank: 2,
      avatar:
        'https://images.pexels.com/photos/3823488/pexels-photo-3823488.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      streak: 21,
      workouts: 142,
    },
    {
      id: '3',
      name: 'Mike Chen',
      username: 'mike_muscle',
      points: 2290,
      rank: 3,
      avatar:
        'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      streak: 15,
      workouts: 128,
    },
    {
      id: user?.id || '4',
      name: 'You',
      username: 'your_username',
      points: 2180,
      rank: 4,
      avatar:
        'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      streak: 12,
      workouts: 98,
    },
  ];

  // Mock social stats
  const socialStats = [
    { label: 'Following', value: '127', icon: Users, color: '#4A90E2' },
    { label: 'Followers', value: '89', icon: Heart, color: '#E74C3C' },
    { label: 'Posts', value: '34', icon: MessageCircle, color: '#27AE60' },
    { label: 'Likes', value: '456', icon: Heart, color: '#FF6B35' },
  ];

  const filterOptions = [
    { id: 'all', name: 'All Posts', icon: TrendingUp },
    { id: 'workout', name: 'Workouts', icon: Trophy },
    { id: 'achievement', name: 'Achievements', icon: Trophy },
    { id: 'progress', name: 'Progress', icon: TrendingUp },
    { id: 'following', name: 'Following', icon: Users },
  ];

  const handleLike = async (postId: number) => {
    try {
      await toggleLike(postId);
    } catch (error) {
      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  };

  const handleComment = (postId: number) => {
    setSelectedPostId(postId);
    setShowComments(true);
  };

  const handleShare = (postId: number) => {
    Alert.alert('Share Post', 'Share functionality coming soon!');
  };

  const handleDeletePost = async (postId: number) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(postId);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete post. Please try again.');
          }
        },
      },
    ]);
  };

  const handleCreatePost = async (
    content: string,
    type: 'general' | 'workout' | 'achievement' | 'progress'
  ) => {
    try {
      switch (type) {
        case 'workout':
          await createWorkoutPost(content);
          break;
        case 'achievement':
          await createAchievementPost(content, 1);
          break;
        case 'progress':
          await createProgressPost(content);
          break;
        default:
          await createProgressPost(content);
          break;
      }
      setShowCreatePost(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  const filteredPosts = useMemo(
    () =>
      selectedFilter === 'all' ? posts : posts.filter((post) => post.post_type === selectedFilter),
    [posts, selectedFilter]
  );

  const renderPost = ({ item }: ListRenderItemInfo<(typeof posts)[number]>) => (
    <SocialFeedPost
      post={item}
      onLike={() => handleLike(item.id)}
      onComment={() => handleComment(item.id)}
      onShare={() => handleShare(item.id)}
      onDelete={() => handleDeletePost(item.id)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshFeed} />}
        ListHeaderComponent={
          <>
            <LinearGradient colors={[colors.surface, colors.surfaceAlt]} style={styles.header}>
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
                    <Plus size={24} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.headerSubtitle}>Connect with the fitness community</Text>
            </LinearGradient>

            {/* Social Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statsGrid}>
                {socialStats.map((stat, index) => (
                  <SocialStatsCard
                    key={index}
                    label={stat.label}
                    value={stat.value}
                    icon={stat.icon}
                    color={stat.color}
                  />
                ))}
              </View>
            </View>

            {/* Weekly Leaderboard */}
            <SocialLeaderboard leaderboard={leaderboard} currentUserId={user?.id} />

            {/* Filter Options */}
            <View style={styles.filtersContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {filterOptions.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterButton,
                      selectedFilter === filter.id && styles.filterButtonActive,
                    ]}
                    onPress={() => setSelectedFilter(filter.id)}
                  >
                    <filter.icon size={16} color={selectedFilter === filter.id ? '#fff' : '#ccc'} />
                    <Text
                      style={[
                        styles.filterButtonText,
                        selectedFilter === filter.id && styles.filterButtonTextActive,
                      ]}
                    >
                      {filter.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Quick Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.quickFilters}
            >
              <TouchableOpacity style={styles.quickFilterButton}>
                <Filter size={16} color="#fff" />
                <Text style={styles.quickFilterText}>Trending</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickFilterButton}>
                <Heart size={16} color="#fff" />
                <Text style={styles.quickFilterText}>Most Liked</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickFilterButton}>
                <MessageCircle size={16} color="#fff" />
                <Text style={styles.quickFilterText}>Most Discussed</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickFilterButton}>
                <Share2 size={16} color="#fff" />
                <Text style={styles.quickFilterText}>Shared</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Social Feed States */}
            {loading && <ScreenState variant="loading" title="Loading feed..." />}
            {!loading && filteredPosts.length === 0 && (
              <ScreenState
                variant="empty"
                title="No posts yet"
                message="Create your first post to share with friends."
              />
            )}
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <ScreenState
              variant="empty"
              title="No posts yet"
              message="Create your first post to share with friends."
            />
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />

      <CreatePostModal
        visible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onCreatePost={handleCreatePost}
        onCreateAchievementPost={(content, achievementId) =>
          createAchievementPost(content, achievementId)
        }
        onCreateProgressPost={(content, mediaUrls) => createProgressPost(content, mediaUrls)}
      />

      <PostCommentsModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        postId={selectedPostId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterButtonText: {
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  quickFilters: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  quickFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 10,
  },
  quickFilterText: {
    color: '#fff',
    marginLeft: 6,
    fontFamily: 'Inter-Medium',
  },
  feedContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  listContent: {
    paddingBottom: 80,
  },
  feedSpacer: {
    height: 8,
  },
});
