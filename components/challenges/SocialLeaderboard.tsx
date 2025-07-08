import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Trophy,
  Crown,
  Medal,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Target,
  Award,
  Zap,
  Filter,
  Search,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useLeaderboards } from '@/hooks/useLeaderboards';
import { LeaderboardEntry, LeaderboardType, LeaderboardTimeframe } from '@/lib/challenges/localLeaderboards';
import { DesignTokens } from '@/design-system/tokens';

const { width } = Dimensions.get('window');

interface SocialLeaderboardProps {
  challengeId?: string;
  type?: LeaderboardType;
  timeframe?: LeaderboardTimeframe;
  maxEntries?: number;
  showFilters?: boolean;
  compact?: boolean;
}

const TIMEFRAME_OPTIONS = [
  { value: 'daily' as LeaderboardTimeframe, label: 'Today', icon: <Target size={16} color="#FF6B35" /> },
  { value: 'weekly' as LeaderboardTimeframe, label: 'This Week', icon: <Star size={16} color="#4A90E2" /> },
  { value: 'monthly' as LeaderboardTimeframe, label: 'This Month', icon: <Award size={16} color="#27AE60" /> },
  { value: 'all-time' as LeaderboardTimeframe, label: 'All Time', icon: <Crown size={16} color="#FFD700" /> },
];

const TYPE_OPTIONS = [
  { value: 'global' as LeaderboardType, label: 'Global', icon: <Users size={16} color="#9B59B6" /> },
  { value: 'challenge' as LeaderboardType, label: 'Challenge', icon: <Trophy size={16} color="#E74C3C" /> },
  { value: 'category' as LeaderboardType, label: 'Category', icon: <Zap size={16} color="#F39C12" /> },
];

export default function SocialLeaderboard({
  challengeId,
  type = 'global',
  timeframe = 'weekly',
  maxEntries = 50,
  showFilters = true,
  compact = false,
}: SocialLeaderboardProps) {
  const {
    leaderboards,
    loading,
    refreshLeaderboards,
    getLeaderboardEntries,
    getUserRank,
    getNearbyCompetitors,
  } = useLeaderboards();

  const [selectedType, setSelectedType] = useState<LeaderboardType>(type);
  const [selectedTimeframe, setSelectedTimeframe] = useState<LeaderboardTimeframe>(timeframe);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [nearbyCompetitors, setNearbyCompetitors] = useState<LeaderboardEntry[]>([]);

  const filterPanelAnimation = new Animated.Value(0);

  useEffect(() => {
    loadLeaderboardData();
  }, [selectedType, selectedTimeframe, challengeId]);

  const loadLeaderboardData = async () => {
    try {
      const leaderboardEntries = await getLeaderboardEntries(
        selectedType,
        selectedTimeframe,
        challengeId,
        maxEntries
      );
      setEntries(leaderboardEntries);

      const rank = await getUserRank(selectedType, selectedTimeframe, challengeId);
      setUserRank(rank);

      if (rank) {
        const nearby = await getNearbyCompetitors(selectedType, selectedTimeframe, challengeId, 3);
        setNearbyCompetitors(nearby);
      }
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLeaderboards();
    await loadLeaderboardData();
    setRefreshing(false);
  };

  const handleTypeChange = (newType: LeaderboardType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(newType);
  };

  const handleTimeframeChange = (newTimeframe: LeaderboardTimeframe) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTimeframe(newTimeframe);
  };

  const toggleFilterPanel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const toValue = showFilterPanel ? 0 : 1;
    setShowFilterPanel(!showFilterPanel);
    
    Animated.spring(filterPanelAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const getRankIcon = (rank: number, score: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color="#FFD700" />;
      case 2:
        return <Medal size={24} color="#C0C0C0" />;
      case 3:
        return <Trophy size={24} color="#CD7F32" />;
      default:
        return (
          <View style={styles.rankNumber}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        );
    }
  };

  const getRankChange = (entry: LeaderboardEntry) => {
    const change = entry.rankChange || 0;
    if (change > 0) {
      return <TrendingUp size={16} color="#27AE60" />;
    } else if (change < 0) {
      return <TrendingDown size={16} color="#E74C3C" />;
    }
    return <Minus size={16} color="#999" />;
  };

  const getScoreDisplay = (entry: LeaderboardEntry) => {
    const { score, scoreType } = entry;
    switch (scoreType) {
      case 'points':
        return `${score.toLocaleString()} pts`;
      case 'time':
        return formatTime(score);
      case 'weight':
        return `${score}kg`;
      case 'distance':
        return `${score}km`;
      case 'reps':
        return `${score} reps`;
      default:
        return score.toString();
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const renderFilterPanel = () => (
    <Animated.View
      style={[
        styles.filterPanel,
        {
          transform: [
            {
              translateY: filterPanelAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-200, 0],
              }),
            },
          ],
          opacity: filterPanelAnimation,
        },
      ]}
    >
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.filterContent}>
        <Text style={styles.filterTitle}>Filter Leaderboard</Text>
        
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Type</Text>
          <View style={styles.filterOptions}>
            {TYPE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  selectedType === option.value && styles.filterOptionActive,
                ]}
                onPress={() => handleTypeChange(option.value)}
              >
                {option.icon}
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedType === option.value && styles.filterOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Timeframe</Text>
          <View style={styles.filterOptions}>
            {TIMEFRAME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  selectedTimeframe === option.value && styles.filterOptionActive,
                ]}
                onPress={() => handleTimeframeChange(option.value)}
              >
                {option.icon}
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedTimeframe === option.value && styles.filterOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderUserPosition = () => {
    if (!userRank) return null;

    return (
      <View style={styles.userPositionContainer}>
        <LinearGradient colors={['#FF6B3520', '#FF6B3510']} style={styles.userPositionCard}>
          <View style={styles.userPositionHeader}>
            <Text style={styles.userPositionTitle}>Your Position</Text>
            <View style={styles.userPositionRank}>
              <Text style={styles.userPositionRankText}>#{userRank}</Text>
            </View>
          </View>
          
          {nearbyCompetitors.length > 0 && (
            <View style={styles.nearbyCompetitors}>
              <Text style={styles.nearbyTitle}>Nearby Competitors</Text>
              {nearbyCompetitors.map((competitor, index) => (
                <View key={competitor.userId} style={styles.nearbyCompetitor}>
                  <Text style={styles.nearbyRank}>#{competitor.rank}</Text>
                  <Text style={styles.nearbyName}>{competitor.displayName}</Text>
                  <Text style={styles.nearbyScore}>{getScoreDisplay(competitor)}</Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => {
    const isTopThree = entry.rank <= 3;
    const isUser = entry.isCurrentUser;

    return (
      <View
        key={entry.userId}
        style={[
          styles.leaderboardEntry,
          isTopThree && styles.leaderboardEntryTop,
          isUser && styles.leaderboardEntryUser,
        ]}
      >
        <LinearGradient
          colors={
            isUser
              ? ['#FF6B3520', '#FF6B3510']
              : isTopThree
              ? ['#1f2937', '#111827']
              : ['#1a1a1a', '#1a1a1a']
          }
          style={styles.leaderboardEntryGradient}
        >
          <View style={styles.leaderboardEntryRank}>
            {getRankIcon(entry.rank, entry.score)}
          </View>

          <View style={styles.leaderboardEntryInfo}>
            <View style={styles.leaderboardEntryHeader}>
              <Text
                style={[
                  styles.leaderboardEntryName,
                  isUser && styles.leaderboardEntryNameUser,
                ]}
              >
                {entry.displayName}
                {isUser && ' (You)'}
              </Text>
              <View style={styles.leaderboardEntryChange}>
                {getRankChange(entry)}
              </View>
            </View>
            
            {entry.tier && (
              <View style={styles.leaderboardEntryTier}>
                <Text style={styles.leaderboardEntryTierText}>{entry.tier}</Text>
              </View>
            )}
          </View>

          <View style={styles.leaderboardEntryScore}>
            <Text
              style={[
                styles.leaderboardEntryScoreValue,
                isUser && styles.leaderboardEntryScoreValueUser,
              ]}
            >
              {getScoreDisplay(entry)}
            </Text>
            {entry.streak && entry.streak > 1 && (
              <View style={styles.streakBadge}>
                <Star size={12} color="#FFD700" />
                <Text style={styles.streakText}>{entry.streak}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Trophy size={20} color="#FF6B35" />
          <Text style={styles.compactTitle}>Leaderboard</Text>
        </View>
        <ScrollView style={styles.compactList} showsVerticalScrollIndicator={false}>
          {entries.slice(0, 5).map((entry, index) => (
            <View key={entry.userId} style={styles.compactEntry}>
              <Text style={styles.compactRank}>#{entry.rank}</Text>
              <Text style={styles.compactName}>{entry.displayName}</Text>
              <Text style={styles.compactScore}>{getScoreDisplay(entry)}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showFilters && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Trophy size={24} color="#FF6B35" />
            <Text style={styles.headerTitle}>Leaderboard</Text>
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={toggleFilterPanel}>
            <Filter size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {showFilterPanel && renderFilterPanel()}
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderUserPosition()}

        <View style={styles.leaderboardContainer}>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.leaderboardTitle}>
              {TYPE_OPTIONS.find(t => t.value === selectedType)?.label} Rankings
            </Text>
            <Text style={styles.leaderboardSubtitle}>
              {TIMEFRAME_OPTIONS.find(t => t.value === selectedTimeframe)?.label}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading leaderboard...</Text>
            </View>
          ) : entries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Trophy size={48} color="#666" />
              <Text style={styles.emptyTitle}>No Rankings Yet</Text>
              <Text style={styles.emptyText}>
                Be the first to compete and claim the top spot!
              </Text>
            </View>
          ) : (
            <View style={styles.leaderboardList}>
              {entries.map((entry, index) => renderLeaderboardEntry(entry, index))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  compactContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  compactTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  compactList: {
    maxHeight: 200,
  },
  compactEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  compactRank: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    width: 30,
  },
  compactName: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    flex: 1,
    marginLeft: 12,
  },
  compactScore: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 12,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  filterPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000,
  },
  filterContent: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  filterTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#444',
  },
  filterOptionActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterOptionText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  userPositionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  userPositionCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B35',
    overflow: 'hidden',
  },
  userPositionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  userPositionTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  userPositionRank: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  userPositionRankText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  nearbyCompetitors: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    padding: 16,
  },
  nearbyTitle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 12,
  },
  nearbyCompetitor: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  nearbyRank: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    width: 30,
  },
  nearbyName: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    flex: 1,
    marginLeft: 8,
  },
  nearbyScore: {
    fontSize: 12,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
  },
  leaderboardContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  leaderboardHeader: {
    marginBottom: 16,
  },
  leaderboardTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  leaderboardSubtitle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardEntry: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  leaderboardEntryTop: {
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  leaderboardEntryUser: {
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  leaderboardEntryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  leaderboardEntryRank: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  leaderboardEntryInfo: {
    flex: 1,
  },
  leaderboardEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  leaderboardEntryName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  leaderboardEntryNameUser: {
    color: '#FF6B35',
  },
  leaderboardEntryChange: {
    marginLeft: 8,
  },
  leaderboardEntryTier: {
    alignSelf: 'flex-start',
  },
  leaderboardEntryTierText: {
    fontSize: 12,
    color: '#FFD700',
    fontFamily: 'Inter-Medium',
  },
  leaderboardEntryScore: {
    alignItems: 'flex-end',
  },
  leaderboardEntryScoreValue: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  leaderboardEntryScoreValueUser: {
    color: '#FF6B35',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70020',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  streakText: {
    fontSize: 10,
    color: '#FFD700',
    fontFamily: 'Inter-Bold',
    marginLeft: 2,
  },
});
