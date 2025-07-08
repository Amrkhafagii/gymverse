import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Trophy,
  Crown,
  Medal,
  Star,
  Users,
  TrendingUp,
  ChevronRight,
  Calendar,
  Target,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LeaderboardEntry, LeaderboardType, LeaderboardTimeframe } from '@/lib/challenges/localLeaderboards';

const { width } = Dimensions.get('window');

interface LeaderboardCardProps {
  type: LeaderboardType;
  timeframe: LeaderboardTimeframe;
  title: string;
  description?: string;
  topEntries: LeaderboardEntry[];
  totalParticipants: number;
  userRank?: number;
  onPress?: () => void;
  compact?: boolean;
}

const TIMEFRAME_LABELS = {
  'daily': 'Today',
  'weekly': 'This Week',
  'monthly': 'This Month',
  'all-time': 'All Time',
};

const TYPE_ICONS = {
  'global': <Users size={20} color="#9B59B6" />,
  'challenge': <Trophy size={20} color="#E74C3C" />,
  'category': <Target size={20} color="#F39C12" />,
};

export default function LeaderboardCard({
  type,
  timeframe,
  title,
  description,
  topEntries,
  totalParticipants,
  userRank,
  onPress,
  compact = false,
}: LeaderboardCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={16} color="#FFD700" />;
      case 2:
        return <Medal size={16} color="#C0C0C0" />;
      case 3:
        return <Trophy size={16} color="#CD7F32" />;
      default:
        return (
          <View style={styles.rankNumber}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        );
    }
  };

  const getScoreDisplay = (entry: LeaderboardEntry) => {
    const { score, scoreType } = entry;
    switch (scoreType) {
      case 'points':
        return `${score.toLocaleString()}`;
      case 'time':
        return formatTime(score);
      case 'weight':
        return `${score}kg`;
      case 'distance':
        return `${score}km`;
      case 'reps':
        return `${score}`;
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

  const renderTopEntries = () => {
    const displayEntries = topEntries.slice(0, compact ? 3 : 5);
    
    return (
      <View style={styles.topEntries}>
        {displayEntries.map((entry, index) => (
          <View key={entry.userId} style={styles.topEntry}>
            <View style={styles.topEntryRank}>
              {getRankIcon(entry.rank)}
            </View>
            <Text style={styles.topEntryName} numberOfLines={1}>
              {entry.displayName}
              {entry.isCurrentUser && ' (You)'}
            </Text>
            <Text style={[
              styles.topEntryScore,
              entry.isCurrentUser && styles.topEntryScoreUser,
            ]}>
              {getScoreDisplay(entry)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderUserPosition = () => {
    if (!userRank) return null;

    return (
      <View style={styles.userPosition}>
        <View style={styles.userPositionLeft}>
          <Text style={styles.userPositionLabel}>Your Position</Text>
          <View style={styles.userPositionRank}>
            <Text style={styles.userPositionRankText}>#{userRank}</Text>
          </View>
        </View>
        <TrendingUp size={16} color="#27AE60" />
      </View>
    );
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={handlePress} activeOpacity={0.8}>
        <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.compactGradient}>
          <View style={styles.compactHeader}>
            <View style={styles.compactHeaderLeft}>
              {TYPE_ICONS[type]}
              <Text style={styles.compactTitle}>{title}</Text>
            </View>
            <ChevronRight size={16} color="#666" />
          </View>
          
          <View style={styles.compactStats}>
            <View style={styles.compactStat}>
              <Users size={14} color="#4A90E2" />
              <Text style={styles.compactStatText}>{totalParticipants}</Text>
            </View>
            <View style={styles.compactStat}>
              <Calendar size={14} color="#27AE60" />
              <Text style={styles.compactStatText}>{TIMEFRAME_LABELS[timeframe]}</Text>
            </View>
          </View>

          {topEntries.length > 0 && (
            <View style={styles.compactTopEntry}>
              <View style={styles.compactTopEntryRank}>
                {getRankIcon(1)}
              </View>
              <Text style={styles.compactTopEntryName} numberOfLines={1}>
                {topEntries[0].displayName}
              </Text>
              <Text style={styles.compactTopEntryScore}>
                {getScoreDisplay(topEntries[0])}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {TYPE_ICONS[type]}
            <View style={styles.headerText}>
              <Text style={styles.title}>{title}</Text>
              {description && (
                <Text style={styles.description}>{description}</Text>
              )}
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.timeframeBadge}>
              <Calendar size={12} color="#4A90E2" />
              <Text style={styles.timeframeText}>{TIMEFRAME_LABELS[timeframe]}</Text>
            </View>
            <ChevronRight size={20} color="#666" />
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Users size={16} color="#4A90E2" />
            <Text style={styles.statLabel}>Participants</Text>
            <Text style={styles.statValue}>{totalParticipants}</Text>
          </View>
          
          {userRank && (
            <View style={styles.stat}>
              <Trophy size={16} color="#FF6B35" />
              <Text style={styles.statLabel}>Your Rank</Text>
              <Text style={styles.statValue}>#{userRank}</Text>
            </View>
          )}
        </View>

        {topEntries.length > 0 && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Top Performers</Text>
            {renderTopEntries()}
          </View>
        )}

        {renderUserPosition()}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  gradient: {
    padding: 20,
  },
  compactContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  compactGradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  timeframeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E220',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  timeframeText: {
    fontSize: 12,
    color: '#4A90E2',
    fontFamily: 'Inter-Medium',
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  compactHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compactTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  compactStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  compactStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactStatText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  stats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  statValue: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  content: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 12,
  },
  topEntries: {
    gap: 8,
  },
  topEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  topEntryRank: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 10,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  topEntryName: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  topEntryScore: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-SemiBold',
  },
  topEntryScoreUser: {
    color: '#FF6B35',
  },
  compactTopEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  compactTopEntryRank: {
    marginRight: 8,
  },
  compactTopEntryName: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  compactTopEntryScore: {
    fontSize: 12,
    color: '#FFD700',
    fontFamily: 'Inter-Bold',
  },
  userPosition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF6B3520',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  userPositionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userPositionLabel: {
    fontSize: 12,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
  },
  userPositionRank: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  userPositionRankText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
});
