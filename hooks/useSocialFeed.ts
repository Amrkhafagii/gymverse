import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import {
  SocialFeedPost,
  PostComment,
  getSocialFeedWithStats,
  togglePostLike,
  addPostComment,
  createWorkoutPost,
  createAchievementPost,
  createProgressPost,
  deletePost,
  getUserPosts,
  searchPosts,
} from '@/lib/socialFeed';

export function useSocialFeed(userId?: string) {
  const queryClient = useQueryClient();
  const feedKey = queryKeys.social.feed(userId);

  const { data, isLoading, isFetching, isRefetching, error, refetch } = useQuery<SocialFeedPost[]>({
    queryKey: feedKey,
    queryFn: () => getSocialFeedWithStats(userId),
    staleTime: 30 * 1000,
  });

  const setFeed = useCallback(
    (updater: (prev: SocialFeedPost[]) => SocialFeedPost[]) => {
      queryClient.setQueryData<SocialFeedPost[]>(feedKey, (prev = []) => updater(prev));
    },
    [feedKey, queryClient]
  );

  // Set up realtime subscriptions
  useEffect(() => {
    // ensure feed is loaded once when hook mounts
    refetch();

    // Subscribe to new posts
    const postsSubscription = supabase
      .channel('social_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_posts',
          filter: 'is_public=eq.true',
        },
        async (payload) => {
          console.log('Post change detected:', payload);

          if (payload.eventType === 'INSERT') {
            // Add new post to the beginning of the feed
            const newPost = await getSocialFeedWithStats(userId, 1);
            if (newPost.length > 0) {
              setFeed((prevPosts) => [newPost[0], ...prevPosts]);
            }
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted post from feed
            setFeed((prevPosts) => prevPosts.filter((post) => post.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            // Update existing post
            setFeed((prevPosts) =>
              prevPosts.map((post) =>
                post.id === payload.new.id ? { ...post, ...payload.new } : post
              )
            );
          }
        }
      )
      .subscribe();

    // Subscribe to likes changes
    const likesSubscription = supabase
      .channel('post_likes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
        },
        async (payload) => {
          console.log('Like change detected:', payload);

          const postId = (payload.new as any)?.post_id || (payload.old as any)?.post_id;
          if (!postId) return;

          // Update the likes count for the affected post
          setFeed((prevPosts) =>
            prevPosts.map((post) => {
              if (post.id === postId) {
                if (payload.eventType === 'INSERT') {
                  return {
                    ...post,
                    likes_count: post.likes_count + 1,
                    user_has_liked: payload.new.user_id === userId ? true : post.user_has_liked,
                  };
                } else if (payload.eventType === 'DELETE') {
                  return {
                    ...post,
                    likes_count: Math.max(0, post.likes_count - 1),
                    user_has_liked: payload.old.user_id === userId ? false : post.user_has_liked,
                  };
                }
              }
              return post;
            })
          );
        }
      )
      .subscribe();

    // Subscribe to comments changes
    const commentsSubscription = supabase
      .channel('post_comments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
        },
        async (payload) => {
          console.log('Comment change detected:', payload);

          const postId = (payload.new as any)?.post_id || (payload.old as any)?.post_id;
          if (!postId) return;

          // Update the comments count for the affected post
          setFeed((prevPosts) =>
            prevPosts.map((post) => {
              if (post.id === postId) {
                if (payload.eventType === 'INSERT') {
                  return {
                    ...post,
                    comments_count: post.comments_count + 1,
                  };
                } else if (payload.eventType === 'DELETE') {
                  return {
                    ...post,
                    comments_count: Math.max(0, post.comments_count - 1),
                  };
                }
              }
              return post;
            })
          );
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(postsSubscription);
      supabase.removeChannel(likesSubscription);
      supabase.removeChannel(commentsSubscription);
    };
  }, [refetch, setFeed, userId]);

  const toggleLikeMutation = useMutation({
    mutationFn: async (postId: number) => {
      if (!userId) throw new Error('User must be logged in to like a post');
      return togglePostLike(postId, userId);
    },
    onMutate: async (postId: number) => {
      await queryClient.cancelQueries({ queryKey: feedKey });
      const previous = queryClient.getQueryData<SocialFeedPost[]>(feedKey);

      setFeed((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes_count: post.likes_count + (post.user_has_liked ? -1 : 1),
                user_has_liked: !post.user_has_liked,
              }
            : post
        )
      );

      return { previous };
    },
    onError: (_err, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(feedKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedKey });
    },
  });

  // Add a comment to a post
  const handleAddComment = async (postId: number, content: string) => {
    if (!userId) return null;

    try {
      const comment = await addPostComment(postId, userId, content);

      if (comment) {
        // Optimistically update the comments count
        setFeed((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, comments_count: post.comments_count + 1 } : post
          )
        );
      }

      return comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  };

  // Create a new workout post
  const handleCreateWorkoutPost = async (
    content: string,
    workoutSessionId?: number,
    coachingPathId?: string | null
  ) => {
    if (!userId) return null;

    try {
      const post = await createWorkoutPost(userId, content, workoutSessionId, coachingPathId);
      if (post) {
        // The realtime subscription will handle adding it to the feed
        return post;
      }
    } catch (error) {
      console.error('Error creating workout post:', error);
    }
    return null;
  };

  // Create a new achievement post
  const handleCreateAchievementPost = async (
    content: string,
    achievementId: number,
    coachingPathId?: string | null
  ) => {
    if (!userId) return null;

    try {
      const post = await createAchievementPost(userId, content, achievementId, coachingPathId);
      if (post) {
        // The realtime subscription will handle adding it to the feed
        return post;
      }
    } catch (error) {
      console.error('Error creating achievement post:', error);
    }
    return null;
  };

  // Create a new progress post
  const handleCreateProgressPost = async (
    content: string,
    mediaUrls?: string[],
    coachingPathId?: string | null
  ) => {
    if (!userId) return null;

    try {
      const post = await createProgressPost(userId, content, mediaUrls, coachingPathId);
      if (post) {
        // The realtime subscription will handle adding it to the feed
        return post;
      }
    } catch (error) {
      console.error('Error creating progress post:', error);
    }
    return null;
  };

  // Delete a post
  const handleDeletePost = async (postId: number) => {
    if (!userId) return false;

    try {
      const success = await deletePost(postId, userId);
      if (success) {
        // Optimistically remove from UI
        setFeed((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      }
      return success;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  };

  // Search posts
  const handleSearchPosts = async (query: string) => {
    try {
      const searchResults = await searchPosts(query, userId);
      queryClient.setQueryData(feedKey, searchResults);
    } catch (error) {
      console.error('Error searching posts:', error);
    }
  };

  // Get user's own posts
  const handleGetUserPosts = async (targetUserId: string) => {
    try {
      const userPosts = await getUserPosts(targetUserId);
      queryClient.setQueryData(feedKey, userPosts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  return {
    posts: data || [],
    loading: isLoading,
    refreshing: isRefetching || isFetching,
    error: error ? 'Failed to load social feed' : null,
    refreshFeed: refetch,
    toggleLike: (postId: number) => toggleLikeMutation.mutateAsync(postId),
    addComment: handleAddComment,
    createWorkoutPost: handleCreateWorkoutPost,
    createAchievementPost: handleCreateAchievementPost,
    createProgressPost: handleCreateProgressPost,
    deletePost: handleDeletePost,
    searchPosts: handleSearchPosts,
    getUserPosts: handleGetUserPosts,
    clearError: () => queryClient.invalidateQueries({ queryKey: feedKey }),
  };
}
