import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocialPost, SocialComment, SocialUser, SocialActivity } from '@/contexts/SocialContext';

export interface SocialEngagement {
  postId: string;
  userId: string;
  type: 'like' | 'comment' | 'share';
  timestamp: string;
  metadata?: any;
}

export interface SocialRecommendation {
  id: string;
  type: 'user_to_follow' | 'post_to_like' | 'workout_buddy' | 'challenge_partner';
  title: string;
  description: string;
  targetId: string;
  confidence: number; // 0-100
  reasoning: string[];
}

export interface SocialInsight {
  id: string;
  type: 'engagement_trend' | 'popular_content' | 'best_posting_time' | 'audience_growth';
  title: string;
  description: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  timeframe: string;
  actionable: boolean;
  suggestions: string[];
}

const STORAGE_KEYS = {
  ENGAGEMENTS: '@social_engagements',
  RECOMMENDATIONS: '@social_recommendations',
  INSIGHTS: '@social_insights',
  USER_PREFERENCES: '@social_user_preferences',
  CONTENT_ANALYTICS: '@social_content_analytics',
};

export class LocalSocialEngine {
  private static instance: LocalSocialEngine;
  
  static getInstance(): LocalSocialEngine {
    if (!LocalSocialEngine.instance) {
      LocalSocialEngine.instance = new LocalSocialEngine();
    }
    return LocalSocialEngine.instance;
  }

  // Content Generation
  async generatePostContent(
    type: SocialPost['type'],
    data: any,
    userPreferences?: any
  ): Promise<{ content: string; tags: string[]; suggestions: string[] }> {
    const templates = this.getContentTemplates(type);
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    let content = this.fillTemplate(template, data);
    const tags = this.generateTags(type, data);
    const suggestions = this.generateContentSuggestions(type, data);

    return { content, tags, suggestions };
  }

  private getContentTemplates(type: SocialPost['type']): string[] {
    const templates: Record<SocialPost['type'], string[]> = {
      workout_complete: [
        'Just finished {workoutName}! 💪 Feeling {feeling}!',
        'Crushed {workoutName} today! {duration} minutes of pure dedication 🔥',
        'Another {workoutName} in the books! {exercises} exercises completed 💯',
        '{workoutName} ✅ Progress never stops! 🚀',
      ],
      achievement: [
        'Unlocked "{achievementName}"! 🏆 {description}',
        'New achievement unlocked: {achievementName}! 🎯 {feeling}',
        'Just earned "{achievementName}"! 🌟 The grind pays off!',
      ],
      progress_photo: [
        '{timeframe} progress update! 📸 The journey continues...',
        'Transformation in progress! 💪 {timeframe} of dedication',
        'Progress check! 📈 {timeframe} of consistent work',
      ],
      milestone: [
        'Hit a major milestone today! 🎯 {milestone}',
        'Celebrating {milestone}! 🎉 Grateful for this journey',
        'Milestone achieved: {milestone}! 🚀 On to the next goal!',
      ],
      personal_record: [
        'New PR! {exercise}: {value}{unit} 🎯 {improvement}% improvement!',
        'Personal record smashed! {exercise} - {value}{unit} 💪',
        'PR alert! 🚨 {exercise}: {value}{unit} - feeling unstoppable!',
      ],
      text: [
        '{content}',
      ],
    };

    return templates[type] || templates.text;
  }

  private fillTemplate(template: string, data: any): string {
    let content = template;
    
    // Replace placeholders with actual data
    const replacements: Record<string, any> = {
      workoutName: data.name || data.workoutName || 'workout',
      duration: data.duration ? Math.round(data.duration / 60) : 'unknown',
      exercises: data.exercises || data.exerciseCount || 'several',
      feeling: this.getRandomFeeling(),
      achievementName: data.name || data.achievementName,
      description: data.description || '',
      timeframe: data.timeframe || '3 months',
      milestone: data.milestone || data.description,
      exercise: data.exerciseName || data.exercise,
      value: data.value || data.newValue,
      unit: data.unit || '',
      improvement: data.improvement ? data.improvement.toFixed(1) : '0',
      content: data.content || '',
    };

    Object.entries(replacements).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{${key}}`, 'g'), String(value));
    });

    return content;
  }

  private getRandomFeeling(): string {
    const feelings = [
      'amazing', 'strong', 'accomplished', 'energized', 'motivated',
      'powerful', 'unstoppable', 'focused', 'determined', 'proud'
    ];
    return feelings[Math.floor(Math.random() * feelings.length)];
  }

  private generateTags(type: SocialPost['type'], data: any): string[] {
    const baseTags: Record<SocialPost['type'], string[]> = {
      workout_complete: ['workout', 'fitness', 'training', 'gym'],
      achievement: ['achievement', 'milestone', 'progress', 'success'],
      progress_photo: ['transformation', 'progress', 'beforeafter', 'journey'],
      milestone: ['milestone', 'goal', 'achievement', 'success'],
      personal_record: ['pr', 'personalrecord', 'strength', 'progress'],
      text: ['fitness', 'motivation'],
    };

    let tags = [...baseTags[type]];

    // Add specific tags based on data
    if (data.muscleGroups) {
      tags.push(...data.muscleGroups.map((mg: string) => mg.toLowerCase()));
    }
    if (data.exerciseName) {
      tags.push(data.exerciseName.toLowerCase().replace(/\s+/g, ''));
    }
    if (data.rarity) {
      tags.push(data.rarity);
    }

    return tags.slice(0, 5); // Limit to 5 tags
  }

  private generateContentSuggestions(type: SocialPost['type'], data: any): string[] {
    const suggestions: Record<SocialPost['type'], string[]> = {
      workout_complete: [
        'Add your workout stats for more engagement',
        'Tag your workout location',
        'Share what motivated you today',
        'Mention your next fitness goal',
      ],
      achievement: [
        'Share how long it took to achieve this',
        'Thank people who supported you',
        'Set your next achievement goal',
        'Share tips for others pursuing this',
      ],
      progress_photo: [
        'Add measurements or stats',
        'Share your routine or diet changes',
        'Mention challenges you overcame',
        'Inspire others with your journey',
      ],
      milestone: [
        'Share what this milestone means to you',
        'Thank your support system',
        'Set your next big goal',
        'Share lessons learned',
      ],
      personal_record: [
        'Share your training approach',
        'Mention how long you\'ve been working toward this',
        'Tag your training partners',
        'Set your next PR goal',
      ],
      text: [
        'Add relevant hashtags',
        'Share a personal story',
        'Ask a question to engage followers',
        'Include a motivational quote',
      ],
    };

    return suggestions[type] || suggestions.text;
  }

  // Engagement Analytics
  async trackEngagement(engagement: SocialEngagement): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.ENGAGEMENTS);
      const engagements: SocialEngagement[] = stored ? JSON.parse(stored) : [];
      
      engagements.push(engagement);
      
      // Keep only last 1000 engagements
      if (engagements.length > 1000) {
        engagements.splice(0, engagements.length - 1000);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.ENGAGEMENTS, JSON.stringify(engagements));
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  }

  async getEngagementAnalytics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    totalEngagements: number;
    engagementsByType: Record<string, number>;
    engagementTrend: Array<{ date: string; count: number }>;
    topPosts: Array<{ postId: string; engagements: number }>;
  }> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.ENGAGEMENTS);
      const engagements: SocialEngagement[] = stored ? JSON.parse(stored) : [];
      
      const cutoffDate = new Date();
      switch (timeframe) {
        case 'day':
          cutoffDate.setDate(cutoffDate.getDate() - 1);
          break;
        case 'week':
          cutoffDate.setDate(cutoffDate.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(cutoffDate.getMonth() - 1);
          break;
      }
      
      const filteredEngagements = engagements.filter(
        eng => new Date(eng.timestamp) >= cutoffDate
      );
      
      const totalEngagements = filteredEngagements.length;
      
      const engagementsByType = filteredEngagements.reduce((acc, eng) => {
        acc[eng.type] = (acc[eng.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Generate trend data
      const days = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
      const engagementTrend = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const count = filteredEngagements.filter(
          eng => eng.timestamp.split('T')[0] === dateString
        ).length;
        
        engagementTrend.push({ date: dateString, count });
      }
      
      // Top posts by engagement
      const postEngagements = filteredEngagements.reduce((acc, eng) => {
        acc[eng.postId] = (acc[eng.postId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topPosts = Object.entries(postEngagements)
        .map(([postId, engagements]) => ({ postId, engagements }))
        .sort((a, b) => b.engagements - a.engagements)
        .slice(0, 10);
      
      return {
        totalEngagements,
        engagementsByType,
        engagementTrend,
        topPosts,
      };
    } catch (error) {
      console.error('Error getting engagement analytics:', error);
      return {
        totalEngagements: 0,
        engagementsByType: {},
        engagementTrend: [],
        topPosts: [],
      };
    }
  }

  // Recommendations
  async generateRecommendations(
    currentUser: SocialUser,
    posts: SocialPost[],
    users: SocialUser[]
  ): Promise<SocialRecommendation[]> {
    const recommendations: SocialRecommendation[] = [];
    
    // User recommendations based on similar interests
    const userRecommendations = this.generateUserRecommendations(currentUser, users, posts);
    recommendations.push(...userRecommendations);
    
    // Content recommendations
    const contentRecommendations = this.generateContentRecommendations(currentUser, posts);
    recommendations.push(...contentRecommendations);
    
    return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }

  private generateUserRecommendations(
    currentUser: SocialUser,
    users: SocialUser[],
    posts: SocialPost[]
  ): SocialRecommendation[] {
    return users
      .filter(user => user.id !== currentUser.id && !user.isFollowing)
      .map(user => {
        const userPosts = posts.filter(post => post.userId === user.id);
        const commonInterests = this.calculateCommonInterests(currentUser, user, posts);
        
        return {
          id: `user_rec_${user.id}`,
          type: 'user_to_follow' as const,
          title: `Follow ${user.displayName}`,
          description: `${user.displayName} shares similar fitness interests`,
          targetId: user.id,
          confidence: Math.min(commonInterests * 20, 95),
          reasoning: [
            `${userPosts.length} recent posts`,
            `${user.stats.followers} followers`,
            'Similar workout preferences',
          ],
        };
      })
      .filter(rec => rec.confidence > 30);
  }

  private generateContentRecommendations(
    currentUser: SocialUser,
    posts: SocialPost[]
  ): SocialRecommendation[] {
    return posts
      .filter(post => post.userId !== currentUser.id && !post.isLiked)
      .map(post => {
        const relevanceScore = this.calculatePostRelevance(currentUser, post);
        
        return {
          id: `post_rec_${post.id}`,
          type: 'post_to_like' as const,
          title: 'You might like this post',
          description: `${post.username} shared: ${post.content.substring(0, 50)}...`,
          targetId: post.id,
          confidence: relevanceScore,
          reasoning: [
            'Similar to posts you\'ve liked',
            'Popular in your network',
            'Matches your interests',
          ],
        };
      })
      .filter(rec => rec.confidence > 40);
  }

  private calculateCommonInterests(
    user1: SocialUser,
    user2: SocialUser,
    posts: SocialPost[]
  ): number {
    const user1Posts = posts.filter(post => post.userId === user1.id);
    const user2Posts = posts.filter(post => post.userId === user2.id);
    
    const user1Types = new Set(user1Posts.map(post => post.type));
    const user2Types = new Set(user2Posts.map(post => post.type));
    
    const commonTypes = [...user1Types].filter(type => user2Types.has(type));
    
    return commonTypes.length;
  }

  private calculatePostRelevance(user: SocialUser, post: SocialPost): number {
    let score = 50; // Base score
    
    // Boost score based on post engagement
    const engagementScore = (post.likes + post.comments.length * 2 + post.shares * 3) / 10;
    score += Math.min(engagementScore, 30);
    
    // Boost score for recent posts
    const hoursAgo = (Date.now() - new Date(post.timestamp).getTime()) / (1000 * 60 * 60);
    if (hoursAgo < 24) score += 10;
    else if (hoursAgo < 72) score += 5;
    
    return Math.min(score, 95);
  }

  // Insights Generation
  async generateInsights(
    currentUser: SocialUser,
    posts: SocialPost[],
    engagements: SocialEngagement[]
  ): Promise<SocialInsight[]> {
    const insights: SocialInsight[] = [];
    
    // Engagement trend insight
    const engagementTrend = await this.analyzeEngagementTrend(engagements);
    if (engagementTrend) insights.push(engagementTrend);
    
    // Popular content insight
    const popularContent = this.analyzePopularContent(posts);
    if (popularContent) insights.push(popularContent);
    
    // Best posting time insight
    const bestPostingTime = this.analyzeBestPostingTime(posts, engagements);
    if (bestPostingTime) insights.push(bestPostingTime);
    
    return insights;
  }

  private async analyzeEngagementTrend(engagements: SocialEngagement[]): Promise<SocialInsight | null> {
    const lastWeek = engagements.filter(eng => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(eng.timestamp) >= weekAgo;
    });
    
    const previousWeek = engagements.filter(eng => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(eng.timestamp) >= twoWeeksAgo && new Date(eng.timestamp) < weekAgo;
    });
    
    if (previousWeek.length === 0) return null;
    
    const change = ((lastWeek.length - previousWeek.length) / previousWeek.length) * 100;
    const trend = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';
    
    return {
      id: 'engagement_trend',
      type: 'engagement_trend',
      title: 'Engagement Trend',
      description: `Your engagement is ${trend === 'up' ? 'increasing' : trend === 'down' ? 'decreasing' : 'stable'}`,
      value: Math.abs(change),
      trend,
      timeframe: 'Last 7 days',
      actionable: trend === 'down',
      suggestions: trend === 'down' ? [
        'Post more consistently',
        'Engage with others\' content',
        'Try different content types',
        'Post at optimal times',
      ] : [],
    };
  }

  private analyzePopularContent(posts: SocialPost[]): SocialInsight | null {
    const myPosts = posts.filter(post => post.userId === 'current_user');
    if (myPosts.length === 0) return null;
    
    const postsByType = myPosts.reduce((acc, post) => {
      if (!acc[post.type]) acc[post.type] = [];
      acc[post.type].push(post);
      return acc;
    }, {} as Record<string, SocialPost[]>);
    
    let bestType: string = '';
    let bestEngagement = 0;
    
    Object.entries(postsByType).forEach(([type, typePosts]) => {
      const avgEngagement = typePosts.reduce((sum, post) => 
        sum + post.likes + post.comments.length + post.shares, 0
      ) / typePosts.length;
      
      if (avgEngagement > bestEngagement) {
        bestEngagement = avgEngagement;
        bestType = type;
      }
    });
    
    return {
      id: 'popular_content',
      type: 'popular_content',
      title: 'Popular Content Type',
      description: `Your ${bestType.replace('_', ' ')} posts perform best`,
      value: bestEngagement,
      trend: 'stable',
      timeframe: 'All time',
      actionable: true,
      suggestions: [
        `Create more ${bestType.replace('_', ' ')} content`,
        'Analyze what makes these posts successful',
        'Experiment with similar content formats',
      ],
    };
  }

  private analyzeBestPostingTime(posts: SocialPost[], engagements: SocialEngagement[]): SocialInsight | null {
    const myPosts = posts.filter(post => post.userId === 'current_user');
    if (myPosts.length === 0) return null;
    
    const hourlyEngagement: Record<number, number> = {};
    
    myPosts.forEach(post => {
      const hour = new Date(post.timestamp).getHours();
      const postEngagements = engagements.filter(eng => eng.postId === post.id).length;
      hourlyEngagement[hour] = (hourlyEngagement[hour] || 0) + postEngagements;
    });
    
    let bestHour = 0;
    let maxEngagement = 0;
    
    Object.entries(hourlyEngagement).forEach(([hour, engagement]) => {
      if (engagement > maxEngagement) {
        maxEngagement = engagement;
        bestHour = parseInt(hour);
      }
    });
    
    const timeString = bestHour === 0 ? '12:00 AM' : 
                     bestHour < 12 ? `${bestHour}:00 AM` :
                     bestHour === 12 ? '12:00 PM' :
                     `${bestHour - 12}:00 PM`;
    
    return {
      id: 'best_posting_time',
      type: 'best_posting_time',
      title: 'Optimal Posting Time',
      description: `Your posts get most engagement around ${timeString}`,
      value: bestHour,
      trend: 'stable',
      timeframe: 'Based on your posting history',
      actionable: true,
      suggestions: [
        `Schedule posts around ${timeString}`,
        'Test posting at different times',
        'Consider your audience\'s timezone',
      ],
    };
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing social data:', error);
    }
  }

  async exportData(): Promise<{
    engagements: SocialEngagement[];
    recommendations: SocialRecommendation[];
    insights: SocialInsight[];
  }> {
    try {
      const [engagements, recommendations, insights] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ENGAGEMENTS),
        AsyncStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.INSIGHTS),
      ]);

      return {
        engagements: engagements ? JSON.parse(engagements) : [],
        recommendations: recommendations ? JSON.parse(recommendations) : [],
        insights: insights ? JSON.parse(insights) : [],
      };
    } catch (error) {
      console.error('Error exporting social data:', error);
      return { engagements: [], recommendations: [], insights: [] };
    }
  }
}

export const localSocialEngine = LocalSocialEngine.getInstance();
