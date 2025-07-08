import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Trophy,
  Users,
  Target,
  Calendar,
  TrendingUp,
  Clock,
  Award,
  X,
} from 'lucide-react-native';
import { ChallengeCard } from './ChallengeCard';
import { Challenge } from '@/contexts/ChallengeContext';
import { useChallenges } from '@/hooks/useChallenges';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface ChallengeListProps {
  challenges?: Challenge[];
  variant?: 'default' | 'compact' | 'detailed';
  showSearch?: boolean;
  showFilters?: boolean;
  showSort?: boolean;
  onChallengePress?: (challenge: Challenge) => void;
  onChallengeJoin?: (challengeId: string) => void;
  onChallengeLeave?: (challengeId: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

type SortOption = 'title' | 'participants' | 'duration' | 'difficulty' | 'reward';
type SortDirection = 'asc' | 'desc';
type FilterCategory = 'all' | 'strength' | 'cardio' | 'consistency' | 'distance' | 'time' | 'social';
type FilterDifficulty = 'all' | 'beginner' | 'intermediate' | 'advanced';
type FilterStatus = 'all' | 'joined' | 'available' | 'completed';

export function ChallengeList({
  challenges: propChallenges,
  variant = 'default',
  showSearch = true,
  showFilters = true,
  showSort = true,
  onChallengePress,
  onChallengeJoin,
  onChallengeLeave,
  refreshing = false,
  onRefresh,
}: ChallengeListProps) {
  const { 
    challenges: contextChallenges, 
    joinChallenge, 
    leaveChallenge,
    refreshChallenges,
  } = useChallenges();

  const challenges = propChallenges || contextChallenges;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('participants');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<FilterDifficulty>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Filter and sort challenges
  const getFilteredAndSortedChallenges = (): Challenge[] => {
    let filtered = challenges;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(query) ||
        challenge.description.toLowerCase().includes(query) ||
        challenge.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(challenge => challenge.category === filterCategory);
    }

    // Difficulty filter
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(challenge => challenge.difficulty === filterDifficulty);
    }

    // Status filter
    if (filterStatus !== 'all') {
      switch (filterStatus) {
        case 'joined':
          filtered = filtered.filter(challenge => challenge.isJoined);
          break;
        case 'available':
          filtered = filtered.filter(challenge => !challenge.isJoined && !challenge.isCompleted);
          break;
        case 'completed':
          filtered = filtered.filter(challenge => challenge.isCompleted);
          break;
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'participants':
          aValue = a.participants;
          bValue = b.participants;
          break;
        case 'duration':
          aValue = new Date(a.duration.end).getTime() - new Date(a.duration.start).getTime();
          bValue = new Date(b.duration.end).getTime() - new Date(b.duration.start).getTime();
          break;
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          aValue = difficultyOrder[a.difficulty as keyof typeof difficultyOrder];
          bValue = difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
          break;
        case 'reward':
          aValue = a.reward.points;
          bValue = b.reward.points;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  const filteredChallenges = getFilteredAndSortedChallenges();

  const handleChallengePress = async (challenge: Challenge) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChallengePress?.(challenge);
  };

  const handleChallengeJoin = async (challengeId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await joinChallenge(challengeId);
      onChallengeJoin?.(challengeId);
    } catch (error) {
      Alert.alert('Error', 'Failed to join challenge. Please try again.');
    }
  };

  const handleChallengeLeave = async (challengeId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Alert.alert(
        'Leave Challenge',
        'Are you sure you want to leave this challenge? Your progress will be saved.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: async () => {
              await leaveChallenge(challengeId);
              onChallengeLeave?.(challengeId);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to leave challenge. Please try again.');
    }
  };

  const handleRefresh = async () => {
    await refreshChallenges();
    onRefresh?.();
  };

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('desc');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('all');
    setFilterDifficulty('all');
    setFilterStatus('all');
    setSortBy('participants');
    setSortDirection('desc');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (filterCategory !== 'all') count++;
    if (filterDifficulty !== 'all') count++;
    if (filterStatus !== 'all') count++;
    return count;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength':
        return <Trophy size={16} color="#666" />;
      case 'cardio':
        return <TrendingUp size={16} color="#666" />;
      case 'consistency':
        return <Target size={16} color="#666" />;
      case 'distance':
        return <Calendar size={16} color="#666" />;
      case 'time':
        return <Clock size={16} color="#666" />;
      case 'social':
        return <Users size={16} color="#666" />;
      default:
        return <Award size={16} color="#666" />;
    }
  };

  const renderChallenge = ({ item }: { item: Challenge }) => (
    <ChallengeCard
      challenge={item}
      variant={variant}
      onPress={() => handleChallengePress(item)}
      onJoin={() => handleChallengeJoin(item.id)}
      onLeave={() => handleChallengeLeave(item.id)}
      showProgress={true}
      showParticipants={true}
    />
  );

  const renderFiltersPanel = () => (
    <View style={styles.filtersPanel}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.filtersPanelGradient}
      >
        <View style={styles.filtersPanelHeader}>
          <Text style={styles.filtersPanelTitle}>Filters & Sort</Text>
          <TouchableOpacity
            style={styles.filtersPanelClose}
            onPress={() => setShowFiltersPanel(false)}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Sort Options */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Sort By</Text>
          <View style={styles.filterOptions}>
            {[
              { key: 'participants', label: 'Participants', icon: Users },
              { key: 'title', label: 'Title', icon: Award },
              { key: 'duration', label: 'Duration', icon: Calendar },
              { key: 'difficulty', label: 'Difficulty', icon: Target },
              { key: 'reward', label: 'Reward', icon: Trophy },
            ].map(({ key, label, icon: Icon }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterOption,
                  sortBy === key && styles.filterOptionActive
                ]}
                onPress={() => toggleSort(key as SortOption)}
              >
                <Icon size={16} color={sortBy === key ? '#FFFFFF' : '#666'} />
                <Text style={[
                  styles.filterOptionText,
                  sortBy === key && styles.filterOptionTextActive
                ]}>
                  {label}
                </Text>
                {sortBy === key && (
                  sortDirection === 'asc' ? 
                    <SortAsc size={16} color="#FFFFFF" /> : 
                    <SortDesc size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Category</Text>
          <View style={styles.filterOptions}>
            {[
              { key: 'all', label: 'All Categories' },
              { key: 'strength', label: 'Strength' },
              { key: 'cardio', label: 'Cardio' },
              { key: 'consistency', label: 'Consistency' },
              { key: 'distance', label: 'Distance' },
              { key: 'time', label: 'Time' },
              { key: 'social', label: 'Social' },
            ].map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterOption,
                  filterCategory === key && styles.filterOptionActive
                ]}
                onPress={() => setFilterCategory(key as FilterCategory)}
              >
                {key !== 'all' && getCategoryIcon(key)}
                <Text style={[
                  styles.filterOptionText,
                  filterCategory === key && styles.filterOptionTextActive
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Difficulty Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Difficulty</Text>
          <View style={styles.filterOptions}>
            {[
              { key: 'all', label: 'All Levels' },
              { key: 'beginner', label: 'Beginner' },
              { key: 'intermediate', label: 'Intermediate' },
              { key: 'advanced', label: 'Advanced' },
            ].map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterOption,
                  filterDifficulty === key && styles.filterOptionActive
                ]}
                onPress={() => setFilterDifficulty(key as FilterDifficulty)}
              >
                <Text style={[
                  styles.filterOptionText,
                  filterDifficulty === key && styles.filterOptionTextActive
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Status Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Status</Text>
          <View style={styles.filterOptions}>
            {[
              { key: 'all', label: 'All Challenges' },
              { key: 'joined', label: 'Joined' },
              { key: 'available', label: 'Available' },
              { key: 'completed', label: 'Completed' },
            ].map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterOption,
                  filterStatus === key && styles.filterOptionActive
                ]}
                onPress={() => setFilterStatus(key as FilterStatus)}
              >
                <Text style={[
                  styles.filterOptionText,
                  filterStatus === key && styles.filterOptionTextActive
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Clear Filters */}
        <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
          <Text style={styles.clearFiltersText}>Clear All Filters</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search and Controls */}
      {(showSearch || showFilters || showSort) && (
        <View style={styles.controls}>
          {showSearch && (
            <View style={styles.searchContainer}>
              <Search size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search challenges..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.searchClear}
                  onPress={() => setSearchQuery('')}
                >
                  <X size={16} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {(showFilters || showSort) && (
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  getActiveFiltersCount() > 0 && styles.controlButtonActive
                ]}
                onPress={() => setShowFiltersPanel(true)}
              >
                <Filter size={16} color={getActiveFiltersCount() > 0 ? '#FFFFFF' : '#666'} />
                {getActiveFiltersCount() > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Results Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {filteredChallenges.length} challenge{filteredChallenges.length !== 1 ? 's' : ''}
          {searchQuery && ` for "${searchQuery}"`}
        </Text>
        {getActiveFiltersCount() > 0 && (
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFiltersLink}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Challenge List */}
      <FlatList
        data={filteredChallenges}
        renderItem={renderChallenge}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Trophy size={48} color="#999" />
            <Text style={styles.emptyStateTitle}>No challenges found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || getActiveFiltersCount() > 0
                ? 'Try adjusting your search or filters'
                : 'Check back later for new challenges'}
            </Text>
          </View>
        }
      />

      {/* Filters Panel */}
      {showFiltersPanel && renderFiltersPanel()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  searchClear: {
    padding: 4,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    position: 'relative',
  },
  controlButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  clearFiltersLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Filters Panel Styles
  filtersPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  filtersPanelGradient: {
    flex: 1,
    paddingTop: 60,
  },
  filtersPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  filtersPanelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  filtersPanelClose: {
    padding: 8,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#333',
    gap: 12,
  },
  filterOptionActive: {
    backgroundColor: '#3B82F6',
  },
  filterOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#CCCCCC',
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  clearFiltersButton: {
    margin: 20,
    paddingVertical: 16,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    alignItems: 'center',
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
