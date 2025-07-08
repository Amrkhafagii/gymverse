import { useState, useEffect, useMemo } from 'react';
import { SocialPost, useSocial } from '@/contexts/SocialContext';
import { SocialFeedFilter, SocialFeedSort } from '@/components/social/SocialFeedFilters';

export function useSocialFeed() {
  const { posts, likePost: contextLikePost, sharePost: contextSharePost } = useSocial();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SocialFeedFilter>({
    type: 'all',
    timeRange: 'all',
    users: 'all',
    engagement: 'all',
    hasMedia: null,
  });
  const [activeSort, setActiveSort] = useState<SocialFeedSort>({
    by: 'timestamp',
    order: 'desc',
  });

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    // Filter by post type
    if (activeFilter.type !== 'all') {
      filtered = filtered.filter(post => post.type === activeFilter.type);
    }

    // Filter by time range
    if (activeFilter.timeRange !== 'all') {
      const now = new Date();
      const cutoffTime = new Date();
      
      switch (activeFilter.timeRange) {
        case 'today':
          cutoffTime.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffTime.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffTime.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(post => 
        new Date(post.timestamp) >= cutoffTime
      );
    }

    // Filter by media presence
    if (activeFilter.hasMedia === true) {
      filtered = filtered.filter(post => 
        post.photoData || post.workoutData || post.achievementData || post.recordData
      );
    }

    // Filter by engagement level
    if (activeFilter.engagement === 'popular') {
      filtered = filtered.filter(post => post.likes > 10 || post.comments.length > 5);
    } else if (activeFilter.engagement === 'recent') {
      const recentCutoff = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours
      filtered = filtered.filter(post => new Date(post.timestamp) >= recentCutoff);
    }

    // Sort posts
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (activeSort.by) {
        case 'likes':
          aValue = a.likes;
          bValue = b.likes;
          break;
        case 'comments':
          aValue = a.comments.length;
          bValue = b.comments.length;
          break;
        case 'engagement':
          aValue = a.likes + a.comments.length * 2 + a.shares;
          bValue = b.likes + b.comments.length * 2 + b.shares;
          break;
        case 'timestamp':
        default:
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
      }
      
      return activeSort.order === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return filtered;
  }, [posts, activeFilter, activeSort]);

  const refreshFeed = async () => {
    setIsRefreshing(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would fetch new posts from the server
    // For now, we'll just refresh the existing posts
    
    setIsRefreshing(false);
  };

  const setFilter = (filter: SocialFeedFilter) => {
    setActiveFilter(filter);
  };

  const setSort = (sort: SocialFeedSort) => {
    setActiveSort(sort);
  };

  const clearFilters = () => {
    setActiveFilter({
      type: 'all',
      timeRange: 'all',
      users: 'all',
      engagement: 'all',
      hasMedia: null,
    });
    setActiveSort({
      by: 'timestamp',
      order: 'desc',
    });
  };

  const likePost = async (postId: string) => {
    await contextLikePost(postId);
  };

  const sharePost = async (postId: string) => {
    await contextSharePost(postId);
  };

  const getFeedAnalytics = () => {
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);
    const totalShares = posts.reduce((sum, post) => sum + post.shares, 0);
    const totalEngagement = totalLikes + totalComments + totalShares;
    const engagementRate = totalPosts > 0 ? (totalEngagement / totalPosts) * 100 : 0;

    return {
      totalPosts,
      totalLikes,
      totalComments,
      totalShares,
      totalEngagement,
      engagementRate,
      filteredCount: filteredPosts.length,
    };
  };

  return {
    filteredPosts,
    isRefreshing,
    activeFilter,
    activeSort,
    refreshFeed,
    setFilter,
    setSort,
    clearFilters,
    likePost,
    sharePost,
    getFeedAnalytics,
  };
}
