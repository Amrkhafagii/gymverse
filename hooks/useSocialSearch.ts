import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocialPost, useSocial } from '@/contexts/SocialContext';

interface SearchResult {
  type: 'post' | 'user' | 'hashtag';
  id: string;
  data: any;
  relevance: number;
}

interface TrendingHashtag {
  tag: string;
  count: number;
  trending?: boolean;
}

const RECENT_SEARCHES_KEY = 'social_recent_searches';
const MAX_RECENT_SEARCHES = 10;

export function useSocialSearch() {
  const { posts } = useSocial();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
    generateTrendingHashtags();
  }, []);

  // Update trending hashtags when posts change
  useEffect(() => {
    generateTrendingHashtags();
  }, [posts]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearches = async (searches: string[]) => {
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };

  const addToRecentSearches = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setRecentSearches(prev => {
      const filtered = prev.filter(search => search !== trimmedQuery);
      const updated = [trimmedQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      saveRecentSearches(updated);
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    saveRecentSearches([]);
  };

  const generateTrendingHashtags = () => {
    const hashtagCounts = new Map<string, number>();
    
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
        });
      }
      
      // Extract hashtags from content
      const hashtagMatches = post.content.match(/#\w+/g);
      if (hashtagMatches) {
        hashtagMatches.forEach(hashtag => {
          const tag = hashtag.slice(1).toLowerCase();
          hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
        });
      }
    });

    const trending = Array.from(hashtagCounts.entries())
      .map(([tag, count]) => ({ tag, count, trending: count > 2 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setTrendingHashtags(trending);
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const results: SearchResult[] = [];
      const lowerQuery = query.toLowerCase();

      // Search posts
      posts.forEach(post => {
        let relevance = 0;
        
        // Content match
        if (post.content.toLowerCase().includes(lowerQuery)) {
          relevance += 10;
        }
        
        // Username match
        if (post.username.toLowerCase().includes(lowerQuery)) {
          relevance += 15;
        }
        
        // Tag match
        if (post.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
          relevance += 20;
        }
        
        // Hashtag in content
        if (lowerQuery.startsWith('#')) {
          const searchTag = lowerQuery.slice(1);
          if (post.content.toLowerCase().includes(`#${searchTag}`)) {
            relevance += 25;
          }
        }

        if (relevance > 0) {
          results.push({
            type: 'post',
            id: post.id,
            data: post,
            relevance,
          });
        }
      });

      // Search users (mock data for now)
      const mockUsers = [
        {
          id: '1',
          displayName: 'Alex Rodriguez',
          username: 'alexfitness',
          avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
          bio: 'Fitness enthusiast and personal trainer',
          followers: 1250,
          posts: 89,
        },
        {
          id: '2',
          displayName: 'Jessica Park',
          username: 'jessicastrong',
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
          bio: 'Strength training coach',
          followers: 892,
          posts: 156,
        },
      ];

      mockUsers.forEach(user => {
        let relevance = 0;
        
        if (user.displayName.toLowerCase().includes(lowerQuery)) {
          relevance += 20;
        }
        
        if (user.username.toLowerCase().includes(lowerQuery)) {
          relevance += 25;
        }
        
        if (user.bio?.toLowerCase().includes(lowerQuery)) {
          relevance += 10;
        }

        if (relevance > 0) {
          results.push({
            type: 'user',
            id: user.id,
            data: user,
            relevance,
          });
        }
      });

      // Search hashtags
      trendingHashtags.forEach(hashtag => {
        let relevance = 0;
        
        if (lowerQuery.startsWith('#')) {
          const searchTag = lowerQuery.slice(1);
          if (hashtag.tag.toLowerCase().includes(searchTag)) {
            relevance += 30;
          }
        } else if (hashtag.tag.toLowerCase().includes(lowerQuery)) {
          relevance += 20;
        }

        if (relevance > 0) {
          results.push({
            type: 'hashtag',
            id: hashtag.tag,
            data: hashtag,
            relevance,
          });
        }
      });

      // Sort by relevance
      results.sort((a, b) => b.relevance - a.relevance);
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    recentSearches,
    trendingHashtags,
    isSearching,
    performSearch,
    clearSearch,
    addToRecentSearches,
    clearRecentSearches,
  };
}
