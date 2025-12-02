import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import {
  Plus,
  Search,
  Trophy,
  TrendingUp,
  Heart,
  MessageCircle,
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
import { supabase } from '@/lib/supabase';

export default function SocialScreen() {
  const { user } = useAuth();
  const {
    posts,
    loading,
    refreshing,
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
  const [leaderboard, setLeaderboard] = useState<
    {
      id: string;
      name: string;
      username?: string | null;
      avatar?: string | null;
      points: number;
      workouts: number;
      streak?: number | null;
    }[]
  >([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'none' | 'trending' | 'liked' | 'discussed'>(
    'none'
  );
  const [metricPosts, setMetricPosts] = useState<typeof posts | null>(null);
  const [metricLoading, setMetricLoading] = useState(false);

  const socialStats = useMemo(() => {
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
    const likedPosts = posts.filter((p) => p.user_has_liked).length;
    return [
      { label: 'Posts', value: `${totalPosts}`, icon: MessageCircle, color: '#27AE60' },
      { label: 'Likes', value: `${totalLikes}`, icon: Heart, color: '#FF6B35' },
      { label: 'Comments', value: `${totalComments}`, icon: MessageCircle, color: '#4A90E2' },
      { label: 'Liked', value: `${likedPosts}`, icon: Heart, color: '#E74C3C' },
    ];
  }, [posts]);

  const filterOptions = [
    { id: 'all', name: 'All Posts', icon: TrendingUp },
    { id: 'workout', name: 'Workouts', icon: Trophy },
    { id: 'achievement', name: 'Achievements', icon: Trophy },
    { id: 'progress', name: 'Progress', icon: TrendingUp },
  ];

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const [{ data: sessions }, { data: streaks }] = await Promise.all([
        supabase
          .from('workout_sessions')
          .select(
            'user_id, duration_minutes, calories_burned, profiles(username, full_name, avatar_url)'
          )
          .not('user_id', 'is', null),
        supabase.from('workout_streaks').select('user_id, current_streak'),
      ]);

      const streakMap = new Map<string, number>();
      (streaks || []).forEach((row) => {
        if (row.user_id) streakMap.set(row.user_id, row.current_streak || 0);
      });

      const byUser = new Map<
        string,
        {
          id: string;
          name: string;
          username?: string | null;
          avatar?: string | null;
          workouts: number;
          minutes: number;
          points: number;
          streak?: number | null;
        }
      >();

      (sessions || []).forEach((session) => {
        const userId = session.user_id;
        if (!userId) return;
        const profile = (session as any).profiles;
        const existing = byUser.get(userId) ?? {
          id: userId,
          name: profile?.full_name || profile?.username || 'Athlete',
          username: profile?.username,
          avatar: profile?.avatar_url,
          workouts: 0,
          minutes: 0,
          points: 0,
          streak: streakMap.get(userId) ?? null,
        };
        existing.workouts += 1;
        existing.minutes += session.duration_minutes || 0;
        existing.points = existing.workouts * 10 + Math.round(existing.minutes / 5);
        byUser.set(userId, existing);
      });

      const leaderboardData = Array.from(byUser.values()).sort((a, b) => b.points - a.points);
      setLeaderboard(leaderboardData.slice(0, 10));
    } catch (err) {
      console.error('Error loading leaderboard', err);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const fetchPostsByMetric = useCallback(
    async (metric: 'likes' | 'comments') => {
      setMetricLoading(true);
      try {
        const { data, error } = await supabase
          .from('social_posts')
          .select(
            `
            *,
            profile:profiles(username, full_name, avatar_url),
            workout_session:workout_sessions(name, duration_minutes, calories_burned),
            achievement:achievements(name, description, icon),
            post_likes(count),
            post_comments(count)
          `
          )
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        const enriched =
          data
            ?.map((post: any) => ({
              ...post,
              likes_count: post.post_likes?.[0]?.count || 0,
              comments_count: post.post_comments?.[0]?.count || 0,
              user_has_liked: post.post_likes?.some((l: any) => l.user_id === user?.id) || false,
            }))
            ?.sort((a: any, b: any) =>
              metric === 'likes'
                ? (b.likes_count || 0) - (a.likes_count || 0)
                : (b.comments_count || 0) - (a.comments_count || 0)
            ) ?? [];

        setMetricPosts(enriched);
      } catch (err) {
        console.error('Error fetching metric posts', err);
        setMetricPosts(null);
      } finally {
        setMetricLoading(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (quickFilter === 'liked' || quickFilter === 'trending') {
      fetchPostsByMetric('likes');
    } else if (quickFilter === 'discussed') {
      fetchPostsByMetric('comments');
    } else {
      setMetricPosts(null);
    }
  }, [quickFilter, fetchPostsByMetric]);

  const handleLike = async (postId: number) => {
    try {
      await toggleLike(postId);
    } catch {
      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  };

  const handleComment = (postId: number) => {
    setSelectedPostId(postId);
    setShowComments(true);
  };

  const handleShare = async (postId: number) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    try {
      await Share.share({
        message: `${post.profile?.username || 'Friend'} shared: ${post.content}`,
      });
    } catch {
      Alert.alert('Error', 'Unable to share right now.');
    }
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
          } catch {
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
    } catch {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  const filteredPosts = useMemo(() => {
    const source = metricPosts ?? posts;
    return selectedFilter === 'all'
      ? source
      : source.filter((post) => post.post_type === selectedFilter);
  }, [posts, selectedFilter, metricPosts]);

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
      <FlashList
        data={
          loading
            ? Array.from({ length: 6 }).map((_, i) => ({ id: `skeleton-${i}` }))
            : filteredPosts
        }
        renderItem={(info) =>
          loading ? (
            <View style={styles.skeletonCard}>
              <View style={styles.skeletonAvatar} />
              <View style={styles.skeletonContent}>
                <View style={styles.skeletonLineShort} />
                <View style={styles.skeletonLine} />
                <View style={styles.skeletonLine} />
              </View>
            </View>
          ) : (
            renderPost(info as ListRenderItemInfo<(typeof posts)[number]>)
          )
        }
        estimatedItemSize={320}
        keyExtractor={(item: any) => item.id.toString()}
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
              <TouchableOpacity
                style={[
                  styles.quickFilterButton,
                  quickFilter === 'none' && styles.quickFilterButtonActive,
                ]}
                onPress={() => setQuickFilter('none')}
              >
                <Filter size={16} color="#fff" />
                <Text style={styles.quickFilterText}>Recent</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.quickFilterButton,
                  quickFilter === 'trending' && styles.quickFilterButtonActive,
                ]}
                onPress={() => setQuickFilter('trending')}
              >
                <Filter size={16} color="#fff" />
                <Text style={styles.quickFilterText}>Trending</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.quickFilterButton,
                  quickFilter === 'liked' && styles.quickFilterButtonActive,
                ]}
                onPress={() => setQuickFilter('liked')}
              >
                <Heart size={16} color="#fff" />
                <Text style={styles.quickFilterText}>Most Liked</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.quickFilterButton,
                  quickFilter === 'discussed' && styles.quickFilterButtonActive,
                ]}
                onPress={() => setQuickFilter('discussed')}
              >
                <MessageCircle size={16} color="#fff" />
                <Text style={styles.quickFilterText}>Most Discussed</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Social Feed States */}
            {(loading || metricLoading || leaderboardLoading) && (
              <ScreenState variant="loading" title="Loading feed..." />
            )}
            {!loading && !metricLoading && !leaderboardLoading && filteredPosts.length === 0 && (
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
  quickFilterButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
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
  skeletonCard: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#222',
    gap: 12,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a2a',
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
  },
  skeletonLine: {
    height: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  skeletonLineShort: {
    height: 10,
    width: '60%',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  feedSpacer: {
    height: 8,
  },
});
