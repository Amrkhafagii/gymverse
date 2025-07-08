import { useState, useEffect, useCallback } from 'react';
import { useSocial, SocialPost } from '@/contexts/SocialContext';

export interface FeedFilter {
  type?: SocialPost['type'] | 'all';
  timeRange?: 'today' | 'week' | 'month' | 'all';
  users?: string[]; // Filter by specific users
  tags?: string[]; // Filter by tags
}

export interface FeedSort {
  by: 'timestamp' | 'likes' | 'comments' | 'engagement';
  order: 'asc' | 'desc';
}

export interface UseSocialFeedReturn {
  // Feed data
  posts: SocialPost[];
  filteredPosts: SocialPost[];
  myPosts: SocialPost[];
  
  // Feed state
  isLoading: boolean;
  isRefreshing: boolean;
  hasMorePosts: boolean;
  error: string | null;
  
  // Filters and sorting
  activeFilter: FeedFilter;
  activeSort: FeedSort;
  
  // Actions
  refreshFeed: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  setFilter: (filter: FeedFilter) => void;
  setSort: (sort: FeedSort) => void;
  clearFilters: () => void;
  
  // Post interactions
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  sharePost: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  
  // Search
  searchPosts: (query: string) => SocialPost[];
  
  // Analytics
  getFeedAnalytics: () => {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    engagementRate: number;
    topPostTypes: Array<{ type: SocialPost['type']; count: number }>;
    activityByDay: Array<{ date: string; posts: number }>;
  };
}

export function useSocialFeed(): UseSocialFeedReturn {
  const {
    posts,
    myPosts,
    isLoading,
    hasMorePosts,
    refreshFeed: contextRefreshFeed,
    loadMorePosts: contextLoadMorePosts,
    likePost: contextLikePost,
    unlikePost: contextUnlikePost,
    sharePost: contextSharePost,
    deletePost: contextDeletePost,
  } = useSocial();

  // State
  const [filteredPosts, setFilteredPosts] = useState<SocialPost[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>({ type: 'all', timeRange: 'all' });
  const [activeSort, setActiveSort] = useState<FeedSort>({ by: 'timestamp', order: 'desc' });

  // Apply filters and sorting when posts or filters change
  useEffect(() => {
    applyFiltersAndSort();
  }, [posts, activeFilter, activeSort]);

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...posts];

    // Apply type filter
    if (activeFilter.type && activeFilter.type !== 'all') {
      filtered = filtered.filter(post => post.type === activeFilter.type);
    }

    // Apply time range filter
    if (activeFilter.timeRange && activeFilter.timeRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();

      switch (activeFilter.timeRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(post => new Date(post.timestamp) >= cutoffDate);
    }

    // Apply user filter
    if (activeFilter.users && activeFilter.users.length > 0) {
      filtered = filtered.filter(post => activeFilter.users!.includes(post.userId));
    }

    // Apply tag filter
    if (activeFilter.tags && activeFilter.tags.length > 0) {
      filtered = filtered.filter(post => 
        post.tags && post.tags.some(tag => activeFilter.tags!.includes(tag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (activeSort.by) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'likes':
          aValue = a.likes;
          bValue = b.likes;
          break;
        case 'comments':
          aValue = a.comments.length;
          bValue = b.comments.length;
          break;
        case 'engagement':
          aValue = a.likes + a.comments.length + a.shares;
          bValue = b.likes + b.comments.length + b.shares;
          break;
        default:
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
      }

      return activeSort.order === 'desc' ? bValue - aValue : aValue - bValue;
    });

    setFilteredPosts(filtered);
  }, [posts, activeFilter, activeSort]);

  // Actions
  const refreshFeed = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      await contextRefreshFeed();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh feed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadMorePosts = async () => {
    try {
      await contextLoadMorePosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more posts');
    }
  };

  const setFilter = (filter: FeedFilter) => {
    setActiveFilter(prev => ({ ...prev, ...filter }));
  };

  const setSort = (sort: FeedSort) => {
    setActiveSort(sort);
  };

  const clearFilters = () => {
    setActiveFilter({ type: 'all', timeRange: 'all' });
    setActiveSort({ by: 'timestamp', order: 'desc' });
  };

  // Post interactions
  const likePost = async (postId: string) => {
    try {
      await contextLikePost(postId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post');
    }
  };

  const unlikePost = async (postId: string) => {
    try {
      await contextUnlikePost(postId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlike post');
    }
  };

  const sharePost = async (postId: string) => {
    try {
      await contextSharePost(postId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share post');
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await contextDeletePost(postId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  // Search
  const searchPosts = useCallback((query: string): SocialPost[] => {
    if (!query.trim()) return filteredPosts;

    const lowercaseQuery = query.toLowerCase();
    return filteredPosts.filter(post => 
      post.content.toLowerCase().includes(lowercaseQuery) ||
      post.username.toLowerCase().includes(lowercaseQuery) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))) ||
      (post.workoutData?.name.toLowerCase().includes(lowercaseQuery)) ||
      (post.achievementData?.name.toLowerCase().includes(lowercaseQuery)) ||
      (post.recordData?.exerciseName.toLowerCase().includes(lowercaseQuery))
    );
  }, [filteredPosts]);

  // Analytics
  const getFeedAnalytics = useCallback(() => {
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);
    const totalShares = posts.reduce((sum, post) => sum + post.shares, 0);
    
    const engagementRate = totalPosts > 0 
      ? ((totalLikes + totalComments + totalShares) / totalPosts) 
      : 0;

    // Count post types
    const postTypeCounts: Record<SocialPost['type'], number> = {
      workout_complete: 0,
      achievement: 0,
      progress_photo: 0,
      milestone: 0,
      personal_record: 0,
      text: 0,
    };

    posts.forEach(post => {
      postTypeCounts[post.type]++;
    });

    const topPostTypes = Object.entries(postTypeCounts)
      .map(([type, count]) => ({ type: type as SocialPost['type'], count }))
      .sort((a, b) => b.count - a.count);

    // Activity by day (last 7 days)
    const activityByDay: Array<{ date: string; posts: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const postsOnDay = posts.filter(post => 
        post.timestamp.split('T')[0] === dateString
      ).length;

      activityByDay.push({
        date: dateString,
        posts: postsOnDay,
      });
    }

    return {
      totalPosts,
      totalLikes,
      totalComments,
      totalShares,
      engagementRate,
      topPostTypes,
      activityByDay,
    };
  }, [posts]);

  return {
    // Feed data
    posts,
    filteredPosts,
    myPosts,
    
    // Feed state
    isLoading,
    isRefreshing,
    hasMorePosts,
    error,
    
    // Filters and sorting
    activeFilter,
    activeSort,
    
    // Actions
    refreshFeed,
    loadMorePosts,
    setFilter,
    setSort,
    clearFilters,
    
    // Post interactions
    likePost,
    unlikePost,
    sharePost,
    deletePost,
    
    // Search
    searchPosts,
    
    // Analytics
    getFeedAnalytics,
  };
}
