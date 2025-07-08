import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
  ChevronRight,
  Calendar,
  BarChart3,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useLeaderboards } from '@/hooks/useLeaderboards';
import { LeaderboardEntry, LeaderboardType, LeaderboardTimeframe } from '@/lib/challenges/localLeaderboards';
import { DesignTokens } from '@/design-system/tokens';

const { width } = Dimensions.get('window');

interface LeaderboardListProps {
  type: LeaderboardType;
  timeframe: LeaderboardTimeframe;
  challengeId?: string;
  onEntryPress?: (entry: LeaderboardEntry) => void;
  showHeader?: boolean;
  maxEntries?: number;
  showUserPosition?: boolean;
}

const RANK_COLORS = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
};

const TIER_COLORS = {
  'Bronze': '#CD7F32',
  'Silver': '#C0C0C0',
  'Gold': '#FFD700',
  'Platinum': '#E5E4E2',
  'Diamond': '#B9F2FF',
  'Master': '#FF6B35',
  'Grandmaster': '#9B59B6',
};

export default function LeaderboardList({
  type,
  timeframe,
  challengeId,
  onEntryPress,
  showHeader = true,
  maxEntries = 100,
  showUserPosition = true,
}: LeaderboardListProps) {
  const {
    leaderboards,
    loading,
    refreshLeaderboards,
    getLeaderboardEntries,
    getUserRank,
    getNearbyCompetitors,
    getLeaderboardStats,
  } = useLeaderboards();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const animatedValues = new Map<string, Animated.Value>();

  useEffect(() => {
    loadData();
  }, [type, timeframe, challengeId]);

  const loadData = async () => {
    try {
      const [leaderboardEntries, rank, leaderboardStats] = await Promise.all([
        getLeaderboardEntries(type, timeframe, challengeId, maxEntries),
        getUserRank(type, timeframe, challengeId),
        getLeaderboardStats(type, timeframe, challengeId),
      ]);

      setEntries(leaderboardEntries);
      setUserRank(rank);
      setStats(leaderboardStats);

      // Find user entry
      const currentUserEntry = leaderboardEntries.find(entry => entry.isCurrentUser);
      setUserEntry(currentUserEntry || null);

      // Initialize animations for new entries
      leaderboardEntries.forEach(entry => {
        if (!animatedValues.has(entry.userId)) {
          animatedValues.set(entry.userId, new Animated.Value(0));
        }
      });

      // Animate entries in
      const animations = leaderboardEntries.map((entry, index) => {
        const animValue = animatedValues.get(entry.userId);
        if (animValue) {
          return Animated.timing(animValue, {
            toValue: 1,
            duration: 300,
            delay: index * 50,
            useNativeDriver: true,
          });
        }
        return null;
      }).filter(Boolean);

      Animated.stagger(50, animations as Animated.CompositeAnimation[]).start();
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLeaderboards();
    await loadData();
    setRefreshing(false);
  };

  const handleEntryPress = (entry: LeaderboardEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (onEntryPress) {
      onEntryPress(entry);
    } else {
      // Toggle expanded state
      const newExpanded = new Set(expandedEntries);
      if (newExpanded.has(entry.userId)) {
        newExpanded.delete(entry.userId);
      } else {
        newExpanded.add(entry.userId);
      }
      setExpandedEntries(newExpanded);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color={RANK_COLORS[1]} />;
      case 2:
        return <Medal size={24} color={RANK_COLORS[2]} />;
      case 3:
        return <Trophy size={24} color={RANK_COLORS[3]} />;
      default:
        return (
          <View style={[styles.rankNumber, { backgroundColor: getRankBackgroundColor(rank) }]}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        );
    }
  };

  const getRankBackgroundColor = (rank: number) => {
    if (rank <= 10) return '#FF6B35';
    if (rank <= 50) return '#4A90E2';
    if (rank <= 100) return '#27AE60';
    return '#666';
  };

  const getRankChange = (entry: LeaderboardEntry) => {
    const change = entry.rankChange || 0;
    if (change > 0) {
      return (
        <View style={styles.rankChangeContainer}>
          <TrendingUp size={14} color="#27AE60" />
          <Text style={[styles.rankChangeText, { color: '#27AE60' }]}>+{change}</Text>
        </View>
      );
    } else if (change < 0) {
      return (
        <View style={styles.rankChangeContainer}>
          <TrendingDown size={14} color="#E74C3C" />
          <Text style={[styles.rankChangeText, { color: '#E74C3C' }]}>{change}</Text>
        </View>
      );
    }
    return (
      <View style={styles.rankChangeContainer}>
        <Minus size={14} color="#999" />
        <Text style={[styles.rankChangeText, { color: '#999' }]}>0</Text>
      </View>
    );
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

  const getTierColor = (tier?: string) => {
    if (!tier) return '#666';
    return TIER_COLORS[tier as keyof typeof TIER_COLORS] || '#666';
  };

  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Trophy size={24} color="#FF6B35" />
            <Text style={styles.headerTitle}>Leaderboard</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Users size={16} color="#4A90E2" />
              <Text style={styles.statText}>{entries.length}</Text>
            </View>
            {stats && (
              <View style={styles.statItem}>
                <BarChart3 size={16} color="#27AE60" />
                <Text style={styles.statText}>{stats.averageScore.toFixed(0)}</Text>
              </View>
            )}
          </View>
        </View>
        
        {showUserPosition && userRank && userEntry && (
          <View style={styles.userPosition}>
            <LinearGradient colors={['#FF6B3520', '#FF6B3510']} style={styles.userPositionGradient}>
              <View style={styles.userPositionRank}>
                {getRankIcon(userRank)}
              </View>
              <View style={styles.userPositionInfo}>
                <Text style={styles.userPositionName}>Your Position</Text>
                <Text style={styles.userPositionScore}>{getScoreDisplay(userEntry)}</Text>
              </View>
              <View style={styles.userPositionChange}>
                {getRankChange(userEntry)}
              </View>
            </LinearGradient>
          </View>
        )}
      </View>
    );
  };

  const renderEntry = ({ item: entry, index }: { item: LeaderboardEntry; index: number }) => {
    const isTopThree = entry.rank <= 3;
    const isUser = entry.isCurrentUser;
    const isExpanded = expandedEntries.has(entry.userId);
    const animValue = animatedValues.get(entry.userId) || new Animated.Value(1);

    return (
      <Animated.View
        style={[
          styles.entryContainer,
          {
            opacity: animValue,
            transform: [
              {
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.entry,
            isTopThree && styles.entryTop,
            isUser && styles.entryUser,
          ]}
          onPress={() => handleEntryPress(entry)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              isUser
                ? ['#FF6B3520', '#FF6B3510']
                : isTopThree
                ? ['#1f2937', '#111827']
                : ['#1a1a1a', '#1a1a1a']
            }
            style={styles.entryGradient}
          >
            <View style={styles.entryRank}>
              {getRankIcon(entry.rank)}
            </View>

            <View style={styles.entryInfo}>
              <View style={styles.entryHeader}>
                <Text
                  style={[
                    styles.entryName,
                    isUser && styles.entryNameUser,
                  ]}
                  numberOfLines={1}
                >
                  {entry.displayName}
                  {isUser && ' (You)'}
                </Text>
                <View style={styles.entryChange}>
                  {getRankChange(entry)}
                </View>
              </View>
              
              <View style={styles.entryDetails}>
                {entry.tier && (
                  <View style={[styles.tierBadge, { backgroundColor: `${getTierColor(entry.tier)}20` }]}>
                    <Text style={[styles.tierText, { color: getTierColor(entry.tier) }]}>
                      {entry.tier}
                    </Text>
                  </View>
                )}
                
                {entry.streak && entry.streak > 1 && (
                  <View style={styles.streakBadge}>
                    <Star size={12} color="#FFD700" />
                    <Text style={styles.streakText}>{entry.streak}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.entryScore}>
              <Text
                style={[
                  styles.entryScoreValue,
                  isUser && styles.entryScoreValueUser,
                ]}
              >
                {getScoreDisplay(entry)}
              </Text>
              <ChevronRight 
                size={16} 
                color="#666" 
                style={[
                  styles.chevron,
                  isExpanded && styles.chevronExpanded,
                ]} 
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.expandedGradient}>
              <View style={styles.expandedStats}>
                <View style={styles.expandedStat}>
                  <Target size={16} color="#4A90E2" />
                  <Text style={styles.expandedStatLabel}>Score</Text>
                  <Text style={styles.expandedStatValue}>{getScoreDisplay(entry)}</Text>
                </View>
                
                {entry.streak && (
                  <View style={styles.expandedStat}>
                    <Star size={16} color="#FFD700" />
                    <Text style={styles.expandedStatLabel}>Streak</Text>
                    <Text style={styles.expandedStatValue}>{entry.streak} days</Text>
                  </View>
                )}
                
                {entry.tier && (
                  <View style={styles.expandedStat}>
                    <Award size={16} color={getTierColor(entry.tier)} />
                    <Text style={styles.expandedStatLabel}>Tier</Text>
                    <Text style={styles.expandedStatValue}>{entry.tier}</Text>
                  </View>
                )}
                
                <View style={styles.expandedStat}>
                  <Calendar size={16} color="#27AE60" />
                  <Text style={styles.expandedStatLabel}>Last Active</Text>
                  <Text style={styles.expandedStatValue}>
                    {new Date(entry.lastUpdated).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}
      </Animated.View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Trophy size={48} color="#666" />
      <Text style={styles.emptyTitle}>No Rankings Yet</Text>
      <Text style={styles.emptyText}>
        Be the first to compete and claim the top spot!
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (entries.length === 0) return null;
    
    return (
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Showing {entries.length} of {stats?.totalParticipants || entries.length} participants
        </Text>
        {stats && (
          <Text style={styles.footerSubtext}>
            Average score: {getScoreDisplay({ ...entries[0], score: stats.averageScore })}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.userId}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  headerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  userPosition: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  userPositionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  userPositionRank: {
    marginRight: 16,
  },
  userPositionInfo: {
    flex: 1,
  },
  userPositionName: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  userPositionScore: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  userPositionChange: {
    alignItems: 'flex-end',
  },
  entryContainer: {
    marginHorizontal: 20,
    marginBottom: 8,
  },
  entry: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  entryTop: {
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  entryUser: {
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  entryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 80,
  },
  entryRank: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  entryInfo: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  entryName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  entryNameUser: {
    color: '#FF6B35',
  },
  entryChange: {
    marginLeft: 8,
  },
  rankChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rankChangeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  entryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tierText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70020',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  streakText: {
    fontSize: 10,
    color: '#FFD700',
    fontFamily: 'Inter-Bold',
  },
  entryScore: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryScoreValue: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  entryScoreValueUser: {
    color: '#FF6B35',
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  expandedContent: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  expandedGradient: {
    padding: 16,
  },
  expandedStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  expandedStat: {
    alignItems: 'center',
    minWidth: 80,
  },
  expandedStatLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginTop: 4,
    marginBottom: 2,
  },
  expandedStatValue: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  emptyContainer: {
    padding: 60,
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
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
});
