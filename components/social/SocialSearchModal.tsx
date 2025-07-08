import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Search,
  Users,
  Hash,
  Clock,
  TrendingUp,
  Filter,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { SocialPost, useSocial } from '@/contexts/SocialContext';
import { useSocialSearch } from '@/hooks/useSocialSearch';
import * as Haptics from 'expo-haptics';

interface SocialSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onPostPress: (postId: string) => void;
  onUserPress: (userId: string) => void;
}

type SearchTab = 'all' | 'posts' | 'users' | 'hashtags';

interface SearchResult {
  type: 'post' | 'user' | 'hashtag';
  id: string;
  data: any;
  relevance: number;
}

export function SocialSearchModal({
  visible,
  onClose,
  onPostPress,
  onUserPress,
}: SocialSearchModalProps) {
  const { posts } = useSocial();
  const {
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
  } = useSocialSearch();

  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      clearSearch();
      setActiveTab('all');
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      addToRecentSearches(query);
    }
  };

  const handleResultPress = async (result: SearchResult) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (result.type === 'post') {
      onPostPress(result.id);
      onClose();
    } else if (result.type === 'user') {
      onUserPress(result.id);
      onClose();
    } else if (result.type === 'hashtag') {
      setSearchQuery(`#${result.data.tag}`);
    }
  };

  const handleRecentSearchPress = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const getFilteredResults = () => {
    if (activeTab === 'all') return searchResults;
    return searchResults.filter(result => result.type === activeTab.slice(0, -1));
  };

  const TabButton = ({ tab, label, icon, count }: { 
    tab: SearchTab; 
    label: string; 
    icon: React.ComponentType<any>;
    count?: number;
  }) => {
    const IconComponent = icon;
    return (
      <TouchableOpacity
        style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
        onPress={() => setActiveTab(tab)}
      >
        <IconComponent 
          size={16} 
          color={activeTab === tab ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} 
        />
        <Text style={[
          styles.tabButtonText,
          activeTab === tab && styles.tabButtonTextActive
        ]}>
          {label}
        </Text>
        {count !== undefined && count > 0 && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    if (item.type === 'post') {
      const post = item.data as SocialPost;
      return (
        <TouchableOpacity
          style={styles.resultItem}
          onPress={() => handleResultPress(item)}
        >
          <Image source={{ uri: post.userAvatar }} style={styles.resultAvatar} />
          <View style={styles.resultContent}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultUsername}>{post.username}</Text>
              <Text style={styles.resultTime}>
                {new Date(post.timestamp).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.resultText} numberOfLines={2}>
              {post.content}
            </Text>
            <View style={styles.resultStats}>
              <Text style={styles.resultStat}>{post.likes} likes</Text>
              <Text style={styles.resultStat}>{post.comments.length} comments</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    if (item.type === 'user') {
      const user = item.data;
      return (
        <TouchableOpacity
          style={styles.resultItem}
          onPress={() => handleResultPress(item)}
        >
          <Image source={{ uri: user.avatar }} style={styles.resultAvatar} />
          <View style={styles.resultContent}>
            <Text style={styles.resultUsername}>{user.displayName}</Text>
            <Text style={styles.resultHandle}>@{user.username}</Text>
            {user.bio && (
              <Text style={styles.resultBio} numberOfLines={1}>
                {user.bio}
              </Text>
            )}
            <View style={styles.resultStats}>
              <Text style={styles.resultStat}>{user.followers} followers</Text>
              <Text style={styles.resultStat}>{user.posts} posts</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    if (item.type === 'hashtag') {
      const hashtag = item.data;
      return (
        <TouchableOpacity
          style={styles.resultItem}
          onPress={() => handleResultPress(item)}
        >
          <View style={styles.hashtagIcon}>
            <Hash size={20} color={DesignTokens.colors.primary[500]} />
          </View>
          <View style={styles.resultContent}>
            <Text style={styles.resultHashtag}>#{hashtag.tag}</Text>
            <Text style={styles.resultCount}>{hashtag.count} posts</Text>
            {hashtag.trending && (
              <View style={styles.trendingBadge}>
                <TrendingUp size={12} color={DesignTokens.colors.success[500]} />
                <Text style={styles.trendingText}>Trending</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderRecentSearch = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.recentItem}
      onPress={() => handleRecentSearchPress(item)}
    >
      <Clock size={16} color={DesignTokens.colors.text.tertiary} />
      <Text style={styles.recentText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderTrendingHashtag = ({ item }: { item: { tag: string; count: number } }) => (
    <TouchableOpacity
      style={styles.trendingItem}
      onPress={() => handleSearch(`#${item.tag}`)}
    >
      <Hash size={16} color={DesignTokens.colors.primary[500]} />
      <View style={styles.trendingContent}>
        <Text style={styles.trendingTag}>#{item.tag}</Text>
        <Text style={styles.trendingCount}>{item.count} posts</Text>
      </View>
      <TrendingUp size={16} color={DesignTokens.colors.success[500]} />
    </TouchableOpacity>
  );

  const filteredResults = getFilteredResults();
  const showEmptyState = searchQuery.trim() && !isSearching && filteredResults.length === 0;
  const showInitialState = !searchQuery.trim() && !isSearching;

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
            <Search size={20} color={DesignTokens.colors.text.tertiary} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search posts, users, hashtags..."
              placeholderTextColor={DesignTokens.colors.text.tertiary}
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color={DesignTokens.colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        {searchQuery.trim() && (
          <View style={styles.tabContainer}>
            <TabButton 
              tab="all" 
              label="All" 
              icon={Search} 
              count={searchResults.length}
            />
            <TabButton 
              tab="posts" 
              label="Posts" 
              icon={Filter}
              count={searchResults.filter(r => r.type === 'post').length}
            />
            <TabButton 
              tab="users" 
              label="Users" 
              icon={Users}
              count={searchResults.filter(r => r.type === 'user').length}
            />
            <TabButton 
              tab="hashtags" 
              label="Tags" 
              icon={Hash}
              count={searchResults.filter(r => r.type === 'hashtag').length}
            />
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {isSearching && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={DesignTokens.colors.primary[500]} />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}

          {showEmptyState && (
            <View style={styles.emptyState}>
              <Search size={48} color={DesignTokens.colors.text.tertiary} />
              <Text style={styles.emptyStateTitle}>No results found</Text>
              <Text style={styles.emptyStateText}>
                Try searching for something else or check your spelling
              </Text>
            </View>
          )}

          {showInitialState && (
            <View style={styles.initialState}>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Searches</Text>
                    <TouchableOpacity onPress={clearRecentSearches}>
                      <Text style={styles.clearText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={recentSearches}
                    renderItem={renderRecentSearch}
                    keyExtractor={(item, index) => `recent-${index}`}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              )}

              {/* Trending Hashtags */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trending Hashtags</Text>
                <FlatList
                  data={trendingHashtags}
                  renderItem={renderTrendingHashtag}
                  keyExtractor={(item) => item.tag}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>
          )}

          {filteredResults.length > 0 && !isSearching && (
            <FlatList
              data={filteredResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
            />
          )}
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingTop: DesignTokens.spacing[12],
    paddingBottom: DesignTokens.spacing[4],
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
    paddingVertical: DesignTokens.spacing[2],
  },
  cancelText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingBottom: DesignTokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
    gap: DesignTokens.spacing[1],
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  tabButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  tabButtonTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  tabBadge: {
    backgroundColor: DesignTokens.colors.error[500],
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[1],
  },
  tabBadgeText: {
    fontSize: 10,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  content: {
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[8],
    gap: DesignTokens.spacing[4],
  },
  emptyStateTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  initialState: {
    flex: 1,
    padding: DesignTokens.spacing[5],
  },
  section: {
    marginBottom: DesignTokens.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  clearText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  resultsList: {
    padding: DesignTokens.spacing[5],
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[3],
    gap: DesignTokens.spacing[3],
  },
  resultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[1],
  },
  resultUsername: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  resultTime: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.tertiary,
  },
  resultText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    lineHeight: 18,
    marginBottom: DesignTokens.spacing[2],
  },
  resultHandle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  resultBio: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[2],
  },
  resultStats: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[4],
  },
  resultStat: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  hashtagIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultHashtag: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.primary[500],
    marginBottom: DesignTokens.spacing[1],
  },
  resultCount: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    marginTop: DesignTokens.spacing[1],
  },
  trendingText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.success[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[3],
    paddingHorizontal: DesignTokens.spacing[4],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    marginBottom: DesignTokens.spacing[2],
  },
  recentText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[3],
    paddingHorizontal: DesignTokens.spacing[4],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    marginBottom: DesignTokens.spacing[2],
  },
  trendingContent: {
    flex: 1,
  },
  trendingTag: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.primary[500],
  },
  trendingCount: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
});
