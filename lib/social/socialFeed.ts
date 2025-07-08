import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocialPost, SocialComment, SocialUser, SocialActivity } from '@/contexts/SocialContext';

export interface FeedConfiguration {
  algorithm: 'chronological' | 'engagement' | 'personalized';
  filters: {
    postTypes: string[];
    timeRange: 'day' | 'week' | 'month' | 'all';
    minEngagement?: number;
  };
  pagination: {
    pageSize: number;
    maxPages: number;
  };
}

export interface FeedMetrics {
  totalPosts: number;
  averageEngagement: number;
  topPerformingPosts: SocialPost[];
  engagementTrends: Array<{ date: string; engagement: number }>;
  userActivity: Array<{ userId: string; posts: number; engagement: number }>;
}

const STORAGE_KEYS = {
  FEED_CONFIG: '@social_feed_config',
  FEED_CACHE: '@social_feed_cache',
  FEED_METRICS: '@social_feed_metrics',
  USER_PREFERENCES: '@social_user_preferences',
};

export class SocialFeedManager {
  private static instance: SocialFeedManager;
  private feedConfig: FeedConfiguration;
  private feedCache: Map<string, SocialPost[]> = new Map();

  constructor() {
    this.feedConfig = {
      algorithm: 'chronological',
      filters: {
        postTypes: ['workout_complete', 'achievement', 'progress_photo', 'milestone', 'personal_record', 'text'],
        timeRange: 'week',
      },
      pagination: {
        pageSize: 20,
        maxPages: 10,
      },
    };
  }

  static getInstance(): SocialFeedManager {
    if (!SocialFeedManager.instance) {
      SocialFeedManager.instance = new SocialFeedManager();
    }
    return SocialFeedManager.instance;
  }

  // Feed Generation
  async generateFeed(
    posts: SocialPost[],
    currentUser: SocialUser,
    page: number = 0
  ): Promise<{ posts: SocialPost[]; hasMore: boolean; metrics: Partial<FeedMetrics> }> {
    try {
      // Apply filters
      let filteredPosts = this.applyFilters(posts);
      
      // Apply algorithm
      filteredPosts = await this.applyAlgorithm(filteredPosts, currentUser);
      
      // Apply pagination
      const startIndex = page * this.feedConfig.pagination.pageSize;
      const endIndex = startIndex + this.feedConfig.pagination.pageSize;
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
      
      const hasMore = endIndex < filteredPosts.length && page < this.feedConfig.pagination.maxPages - 1;
      
      // Generate metrics
      const metrics = this.generateFeedMetrics(filteredPosts);
      
      // Cache results
      const cacheKey = `${currentUser.id}_${page}_${JSON.stringify(this.feedConfig)}`;
      this.feedCache.set(cacheKey, paginatedPosts);
      
      return {
        posts: paginatedPosts,
        hasMore,
        metrics,
      };
    } catch (error) {
      console.error('Error generating feed:', error);
      return { posts: [], hasMore: false, metrics: {} };
    }
  }

  private applyFilters(posts: SocialPost[]): SocialPost[] {
    let filtered = [...posts];

    // Filter by post types
    if (this.feedConfig.filters.postTypes.length > 0) {
      filtered = filtered.filter(post => 
        this.feedConfig.filters.postTypes.includes(post.type)
      );
    }

    // Filter by time range
    const now = new Date();
    let cutoffDate = new Date();

    switch (this.feedConfig.filters.timeRange) {
      case 'day':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
        cutoffDate = new Date(0); // No filter
        break;
    }

    filtered = filtered.filter(post => new Date(post.timestamp) >= cutoffDate);

    // Filter by minimum engagement
    if (this.feedConfig.filters.minEngagement) {
      filtered = filtered.filter(post => {
        const engagement = post.likes + post.comments.length + post.shares;
        return engagement >= this.feedConfig.filters.minEngagement;
      });
    }

    return filtered;
  }

  private async applyAlgorithm(posts: SocialPost[], currentUser: SocialUser): Promise<SocialPost[]> {
    switch (this.feedConfig.algorithm) {
      case 'chronological':
        return posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      case 'engagement':
        return posts.sort((a, b) => {
          const aEngagement = a.likes + a.comments.length * 2 + a.shares * 3;
          const bEngagement = b.likes + b.comments.length * 2 + b.shares * 3;
          return bEngagement - aEngagement;
        });
      
      case 'personalized':
        return await this.applyPersonalizedAlgorithm(posts, currentUser);
      
      default:
        return posts;
    }
  }

  private async applyPersonalizedAlgorithm(posts: SocialPost[], currentUser: SocialUser): Promise<SocialPost[]> {
    // Get user preferences
    const preferences = await this.getUserPreferences(currentUser.id);
    
    // Score posts based on user preferences and behavior
    const scoredPosts = posts.map(post => {
      let score = 0;
      
      // Base engagement score
      score += post.likes * 1;
      score += post.comments.length * 2;
      score += post.shares * 3;
      
      // Recency bonus (newer posts get higher scores)
      const hoursAgo = (Date.now() - new Date(post.timestamp).getTime()) / (1000 * 60 * 60);
      if (hoursAgo < 1) score += 50;
      else if (hoursAgo < 6) score += 30;
      else if (hoursAgo < 24) score += 10;
      
      // Post type preference
      if (preferences.preferredPostTypes.includes(post.type)) {
        score += 20;
      }
      
      // User interaction history
      if (post.isLiked) score += 15;
      if (post.comments.some(comment => comment.userId === currentUser.id)) score += 25;
      
      // Tag preferences
      if (post.tags && preferences.preferredTags.some(tag => post.tags!.includes(tag))) {
        score += 10;
      }
      
      return { post, score };
    });
    
    // Sort by score and return posts
    return scoredPosts
      .sort((a, b) => b.score - a.score)
      .map(item => item.post);
  }

  private generateFeedMetrics(posts: SocialPost[]): Partial<FeedMetrics> {
    const totalPosts = posts.length;
    
    if (totalPosts === 0) {
      return { totalPosts: 0, averageEngagement: 0, topPerformingPosts: [], engagementTrends: [] };
    }
    
    // Calculate average engagement
    const totalEngagement = posts.reduce((sum, post) => 
      sum + post.likes + post.comments.length + post.shares, 0
    );
    const averageEngagement = totalEngagement / totalPosts;
    
    // Get top performing posts
    const topPerformingPosts = [...posts]
      .sort((a, b) => {
        const aEngagement = a.likes + a.comments.length + a.shares;
        const bEngagement = b.likes + b.comments.length + b.shares;
        return bEngagement - aEngagement;
      })
      .slice(0, 5);
    
    // Generate engagement trends (last 7 days)
    const engagementTrends: Array<{ date: string; engagement: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayPosts = posts.filter(post => post.timestamp.split('T')[0] === dateString);
      const dayEngagement = dayPosts.reduce((sum, post) => 
        sum + post.likes + post.comments.length + post.shares, 0
      );
      
      engagementTrends.push({ date: dateString, engagement: dayEngagement });
    }
    
    return {
      totalPosts,
      averageEngagement,
      topPerformingPosts,
      engagementTrends,
    };
  }

  // Configuration Management
  async updateFeedConfig(config: Partial<FeedConfiguration>): Promise<void> {
    this.feedConfig = { ...this.feedConfig, ...config };
    await AsyncStorage.setItem(STORAGE_KEYS.FEED_CONFIG, JSON.stringify(this.feedConfig));
    this.clearCache();
  }

  async loadFeedConfig(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.FEED_CONFIG);
      if (stored) {
        this.feedConfig = { ...this.feedConfig, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading feed config:', error);
    }
  }

  getFeedConfig(): FeedConfiguration {
    return { ...this.feedConfig };
  }

  // User Preferences
  private async getUserPreferences(userId: string): Promise<{
    preferredPostTypes: string[];
    preferredTags: string[];
    blockedUsers: string[];
    mutedKeywords: string[];
  }> {
    try {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEYS.USER_PREFERENCES}_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
    
    // Default preferences
    return {
      preferredPostTypes: ['workout_complete', 'achievement', 'progress_photo'],
      preferredTags: [],
      blockedUsers: [],
      mutedKeywords: [],
    };
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<{
      preferredPostTypes: string[];
      preferredTags: string[];
      blockedUsers: string[];
      mutedKeywords: string[];
    }>
  ): Promise<void> {
    try {
      const current = await this.getUserPreferences(userId);
      const updated = { ...current, ...preferences };
      await AsyncStorage.setItem(`${STORAGE_KEYS.USER_PREFERENCES}_${userId}`, JSON.stringify(updated));
      this.clearCache();
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  // Cache Management
  clearCache(): void {
    this.feedCache.clear();
  }

  async clearStoredCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.FEED_CACHE);
    } catch (error) {
      console.error('Error clearing stored cache:', error);
    }
  }

  // Content Discovery
  async discoverContent(
    posts: SocialPost[],
    currentUser: SocialUser,
    criteria: {
      similarToPost?: string;
      byTags?: string[];
      byType?: string;
      trending?: boolean;
    }
  ): Promise<SocialPost[]> {
    let discovered = [...posts];
    
    // Filter out user's own posts
    discovered = discovered.filter(post => post.userId !== currentUser.id);
    
    if (criteria.similarToPost) {
      // Find posts similar to a specific post
      const targetPost = posts.find(p => p.id === criteria.similarToPost);
      if (targetPost) {
        discovered = discovered.filter(post => 
          post.type === targetPost.type ||
          (post.tags && targetPost.tags && 
           post.tags.some(tag => targetPost.tags!.includes(tag)))
        );
      }
    }
    
    if (criteria.byTags && criteria.byTags.length > 0) {
      discovered = discovered.filter(post =>
        post.tags && post.tags.some(tag => criteria.byTags!.includes(tag))
      );
    }
    
    if (criteria.byType) {
      discovered = discovered.filter(post => post.type === criteria.byType);
    }
    
    if (criteria.trending) {
      // Sort by recent engagement
      discovered = discovered.sort((a, b) => {
        const aRecent = a.likes + a.comments.length + a.shares;
        const bRecent = b.likes + b.comments.length + b.shares;
        const aAge = Date.now() - new Date(a.timestamp).getTime();
        const bAge = Date.now() - new Date(b.timestamp).getTime();
        
        // Boost score for recent posts
        const aScore = aRecent * (1 / (aAge / (1000 * 60 * 60) + 1));
        const bScore = bRecent * (1 / (bAge / (1000 * 60 * 60) + 1));
        
        return bScore - aScore;
      });
    }
    
    return discovered.slice(0, 20); // Limit results
  }

  // Analytics
  async generateFeedAnalytics(posts: SocialPost[]): Promise<{
    engagement: { total: number; average: number; trend: 'up' | 'down' | 'stable' };
    contentTypes: Array<{ type: string; count: number; engagement: number }>;
    timeDistribution: Array<{ hour: number; posts: number }>;
    topTags: Array<{ tag: string; count: number; engagement: number }>;
  }> {
    const totalEngagement = posts.reduce((sum, post) => 
      sum + post.likes + post.comments.length + post.shares, 0
    );
    const averageEngagement = posts.length > 0 ? totalEngagement / posts.length : 0;
    
    // Calculate engagement trend (compare last week to previous week)
    const now = new Date();
    const lastWeek = posts.filter(post => {
      const postDate = new Date(post.timestamp);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return postDate >= weekAgo;
    });
    
    const previousWeek = posts.filter(post => {
      const postDate = new Date(post.timestamp);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return postDate >= twoWeeksAgo && postDate < weekAgo;
    });
    
    const lastWeekEngagement = lastWeek.reduce((sum, post) => 
      sum + post.likes + post.comments.length + post.shares, 0
    );
    const previousWeekEngagement = previousWeek.reduce((sum, post) => 
      sum + post.likes + post.comments.length + post.shares, 0
    );
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (previousWeekEngagement > 0) {
      const change = (lastWeekEngagement - previousWeekEngagement) / previousWeekEngagement;
      if (change > 0.1) trend = 'up';
      else if (change < -0.1) trend = 'down';
    }
    
    // Content types analysis
    const contentTypes = posts.reduce((acc, post) => {
      if (!acc[post.type]) {
        acc[post.type] = { count: 0, engagement: 0 };
      }
      acc[post.type].count++;
      acc[post.type].engagement += post.likes + post.comments.length + post.shares;
      return acc;
    }, {} as Record<string, { count: number; engagement: number }>);
    
    const contentTypesArray = Object.entries(contentTypes).map(([type, data]) => ({
      type,
      count: data.count,
      engagement: data.engagement,
    }));
    
    // Time distribution
    const timeDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      posts: posts.filter(post => new Date(post.timestamp).getHours() === hour).length,
    }));
    
    // Top tags
    const tagCounts: Record<string, { count: number; engagement: number }> = {};
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          if (!tagCounts[tag]) {
            tagCounts[tag] = { count: 0, engagement: 0 };
          }
          tagCounts[tag].count++;
          tagCounts[tag].engagement += post.likes + post.comments.length + post.shares;
        });
      }
    });
    
    const topTags = Object.entries(tagCounts)
      .map(([tag, data]) => ({ tag, count: data.count, engagement: data.engagement }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10);
    
    return {
      engagement: {
        total: totalEngagement,
        average: averageEngagement,
        trend,
      },
      contentTypes: contentTypesArray,
      timeDistribution,
      topTags,
    };
  }
}

export const socialFeedManager = SocialFeedManager.getInstance();
