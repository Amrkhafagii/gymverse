import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Hash,
  User,
  Filter,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { SocialPost, useSocial } from '@/contexts/SocialContext';
import { useSocialFeed } from '@/hooks/useSocialFeed';
import { SocialFeedPost } from './SocialFeedPost';
import { debounce } from 'lodash';

interface SocialSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onPostPress: (postId: string) => void;
  onUserPress: (userId: string) => void;
}

interface SearchSuggestion {
  id: string;
  type: 'user' | 'tag' | 'recent';
  text: string;
  subtitle?: string;
  count?: number;
}

export function SocialSearchModal({
  visible,
  onClose,
  onPostPress,
  onUserPress,
}: SocialSearchModalProps) {
  const { posts } = useSocial();
  const { searchPosts, likePost, sharePost } = useSocialFeed();
  
  // State
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SocialPost[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'users' | 'tags'>('all');

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        const results = searchPosts(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300),
    [searchPosts]
  );

  // Effect for search
  useEffect(() => {
    debouncedSearch(query);
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  // Generate suggestions
  useEffect(() => {
    if (visible && !query) {
      generateSuggestions();
    }
  }, [visible, posts]);

  const generateSuggestions = () => {
    const suggestions: SearchSuggestion[] = [];

    // Recent searches
    recentSearches.slice(0, 3).forEach((search, index) => {
      suggestions.push({
        id: `recent_${index}`,
        type: 'recent',
        text: search,
      });
    });

    // Popular tags
    const tagCounts: Record<string, number> = {};
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const popularTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count], index) => ({
        id: `tag_${index}`,
        type: 'tag' as const,
        text: `#${tag}`,
        count,
      }));

    suggestions.push(...popularTags);

    // Popular users (mock data for now)
    const popularUsers: SearchSuggestion[] = [
      {
        id: 'user_1',
        type: 'user',
        text: 'sarah_fitness',
        subtitle: 'Sarah Johnson',
      },
      {
        id: 'user_2',
        type: 'user',
        text: 'mike_lifts',
        subtitle: 'Mike Chen',
      },
      {
        id: 'user_3',
        type: 'user',
        text: 'emma_wellness',
        subtitle: 'Emma Wilson',
      },
    ];

    suggestions.push(...popularUsers);

    setSuggestions(suggestions);
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    // Add to recent searches
    if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
      setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 9)]);
    }
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'user') {
      onUserPress(suggestion.id);
      onClose();
    } else {
      handleSearch(suggestion.text);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    generateSuggestions();
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'user':
        return <User size={16} color={DesignTokens.colors.text.secondary} />;
      case 'tag':
        return <Hash size={16} color={DesignTokens.colors.text.secondary} />;
      case 'recent':
        return <Clock size={16} color={DesignTokens.colors.text.secondary} />;
      default:
        return <Search size={16} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestion}
      onPress={() => handleSuggestionPress(item)}
    >
      <View style={styles.suggestionIcon}>
        {getSuggestionIcon(item.type)}
      </View>
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionText}>{item.text}</Text>
        {item.subtitle && (
          <Text style={styles.suggestionSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      {item.count && (
        <Text style={styles.suggestionCount}>{item.count}</Text>
      )}
      {item.type === 'recent' && (
        <TouchableOpacity
          style={styles.removeSuggestion}
          onPress={() => {
            setRecentSearches(prev => prev.filter(search => search !== item.text));
            generateSuggestions();
          }}
        >
          <X size={14} color={DesignTokens.colors.text.tertiary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }: { item: SocialPost }) => (
    <SocialFeedPost
      post={item}
      onLike={likePost}
      onComment={() => onPostPress(item.id)}
      onShare={sharePost}
      onUserPress={onUserPress}
      onPostPress={onPostPress}
      variant="compact"
    />
  );

  const renderTabButton = (tab: typeof activeTab, title: string, count?: number) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.tabButtonTextActive
      ]}>
        {title}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Search size={20} color={DesignTokens.colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search posts, users, tags..."
              placeholderTextColor={DesignTokens.colors.text.tertiary}
              value={query}
              onChangeText={handleSearch}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <X size={20} color={DesignTokens.colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {query.length > 0 ? (
          <View style={styles.resultsContainer}>
            {/* Results Tabs */}
            <View style={styles.tabsContainer}>
              {renderTabButton('all', 'All', searchResults.length)}
              {renderTabButton('posts', 'Posts', searchResults.length)}
              {renderTabButton('users', 'Users', 0)}
              {renderTabButton('tags', 'Tags', 0)}
            </View>

            {/* Results Content */}
            <View style={styles.resultsContent}>
              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={DesignTokens.colors.primary[500]} />
                  <Text style={styles.loadingText}>Searching...</Text>
                </View>
              ) : searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchResult}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.resultsList}
                />
              ) : (
                <View style={styles.emptyResults}>
                  <Search size={48} color={DesignTokens.colors.text.tertiary} />
                  <Text style={styles.emptyResultsTitle}>No results found</Text>
                  <Text style={styles.emptyResultsText}>
                    Try searching for something else or check your spelling
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          /* Suggestions */
          <View style={styles.suggestionsContainer}>
            {/* Recent Searches Header */}
            {recentSearches.length > 0 && (
              <View style={styles.suggestionsHeader}>
                <Text style={styles.suggestionsTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={styles.clearButton}>Clear All</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Trending Section */}
            <View style={styles.trendingSection}>
              <View style={styles.trendingHeader}>
                <TrendingUp size={20} color={DesignTokens.colors.primary[500]} />
                <Text style={styles.trendingTitle}>Trending</Text>
              </View>
              <Text style={styles.trendingSubtitle}>
                Popular searches and hashtags in your community
              </Text>
            </View>

            {/* Suggestions List */}
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsList}
            />
          </View>
        )}
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Account for status bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
    gap: DesignTokens.spacing[3],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    gap: DesignTokens.spacing[3],
  },
  searchInput: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
  },
  cancelButton: {
    padding: DesignTokens.spacing[2],
  },
  cancelButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  resultsContainer: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
    gap: DesignTokens.spacing[4],
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[2],
    gap: DesignTokens.spacing[2],
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: DesignTokens.colors.primary[500],
  },
  tabButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  tabButtonTextActive: {
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  tabBadge: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[1],
  },
  tabBadgeText: {
    fontSize: 12,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  resultsContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: DesignTokens.spacing[4],
  },
  loadingText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  resultsList: {
    padding: DesignTokens.spacing[5],
  },
  emptyResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[8],
    gap: DesignTokens.spacing[4],
  },
  emptyResultsTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    textAlign: 'center',
  },
  emptyResultsText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  suggestionsContainer: {
    flex: 1,
    padding: DesignTokens.spacing[5],
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  suggestionsTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  clearButton: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  trendingSection: {
    marginBottom: DesignTokens.spacing[5],
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[2],
  },
  trendingTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  trendingSubtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  suggestionsList: {
    gap: DesignTokens.spacing[2],
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing[3],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing[3],
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignTokens.colors.surface.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  suggestionSubtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  suggestionCount: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.tertiary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  removeSuggestion: {
    padding: DesignTokens.spacing[1],
  },
});
