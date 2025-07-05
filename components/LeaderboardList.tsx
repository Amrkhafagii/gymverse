import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LeaderboardEngine } from '@/lib/leaderboardEngine';
import { LeaderboardEntry, LEADERBOARD_TYPES, getLeaderboardTypeInfo, getTimeframeLabel, getNextResetTime } from '@/lib/leaderboards';
import LeaderboardCard from './LeaderboardCard';
import { Clock, Trophy, Users, TrendingUp } from 'lucide-react-native';

interface LeaderboardListProps {
  currentUserId?: string;
  selectedType?: string;
  onTypeChange?: (type: string) => void;
}

export default function LeaderboardList({ 
  currentUserId, 
  selectedType = 'weekly_points',
  onTypeChange 
}: LeaderboardListProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const leaderboardEngine = LeaderboardEngine.getInstance();
  const currentLeaderboard = getLeaderboardTypeInfo(selectedType);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedType]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Load leaderboard entries
      const leaderboardEntries = await leaderboardEngine.getLeaderboard(selectedType, 50);
      setEntries(leaderboardEntries);

      // Load current user's rank if available
      if (currentUserId) {
        const rank = await leaderboardEngine.getUserRank(currentUserId, selectedType);
        setUserRank(rank);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await leaderboardEngine.updateLeaderboardRankings();
    await loadLeaderboard();
    setRefreshing(false);
  };

  const getTimeUntilReset = () => {
    if (!currentLeaderboard?.resetSchedule) return null;
    
    const nextReset = getNextResetTime(currentLeaderboard.resetSchedule);
    if (!nextReset) return null;

    const now = new Date();
    const diff = nextReset.getTime() - now.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (!currentLeaderboard) return null;

  return (
    <View style={styles.container}>
      {/* Leaderboard Type Selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.typeSelector}
        contentContainerStyle={styles.typeSelectorContent}
      >
        {LEADERBOARD_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeButton,
              selectedType === type.id && styles.typeButtonActive,
              { borderColor: type.color }
            ]}
            onPress={() => onTypeChange?.(type.id)}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <Text style={[
              styles.typeButtonText,
              selectedType === type.id && styles.typeButtonTextActive
            ]}>
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Leaderboard Header */}
      <LinearGradient
        colors={[currentLeaderboard.color, currentLeaderboard.color + '80']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>{currentLeaderboard.icon}</Text>
            <View>
              <Text style={styles.headerTitle}>{currentLeaderboard.name}</Text>
              <Text style={styles.headerSubtitle}>
                {getTimeframeLabel(currentLeaderboard.timeframe)}
              </Text>
            </View>
          </View>
          
          {getTimeUntilReset() && (
            <View style={styles.resetTimer}>
              <Clock size={16} color="#FFFFFF" />
              <Text style={styles.resetText}>
                Resets in {getTimeUntilReset()}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.headerDescription}>
          {currentLeaderboard.description}
        </Text>
      </LinearGradient>

      {/* Current User Rank (if not in top list) */}
      {userRank && userRank.rank > 10 && (
        <View style={styles.userRankSection}>
          <Text style={styles.userRankTitle}>Your Rank</Text>
          <LeaderboardCard
            entry={userRank}
            currentUserId={currentUserId}
            showRankChange={true}
          />
        </View>
      )}

      {/* Leaderboard List */}
      <ScrollView
        style={styles.leaderboardList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading leaderboard...</Text>
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Trophy size={48} color="#666" />
            <Text style={styles.emptyTitle}>No Rankings Yet</Text>
            <Text style={styles.emptyText}>
              Be the first to earn points and climb the leaderboard!
            </Text>
          </View>
        ) : (
          <View style={styles.entriesContainer}>
            {entries.map((entry, index) => (
              <LeaderboardCard
                key={`${entry.user_id}-${entry.rank}`}
                entry={entry}
                currentUserId={currentUserId}
                showRankChange={true}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Stats Footer */}
      <View style={styles.statsFooter}>
        <View style={styles.statItem}>
          <Users size={16} color="#999" />
          <Text style={styles.statText}>{entries.length} competitors</Text>
        </View>
        <View style={styles.statItem}>
          <TrendingUp size={16} color="#999" />
          <Text style={styles.statText}>
            {getTimeframeLabel(currentLeaderboard.timeframe)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  typeSelector: {
    maxHeight: 60,
    marginBottom: 16,
  },
  typeSelectorContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  typeButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  typeButtonText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  header: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Medium',
  },
  resetTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resetText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  headerDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  userRankSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  userRankTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  leaderboardList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  entriesContainer: {
    paddingBottom: 20,
  },
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
  },
});
