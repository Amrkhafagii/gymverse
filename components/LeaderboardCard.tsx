import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LeaderboardEntry, getRankTier, calculateRankChange } from '@/lib/leaderboards';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react-native';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  currentUserId?: string;
  onPress?: () => void;
  showRankChange?: boolean;
}

export default function LeaderboardCard({ 
  entry, 
  currentUserId, 
  onPress,
  showRankChange = true 
}: LeaderboardCardProps) {
  const isCurrentUser = entry.user_id === currentUserId;
  const rankTier = getRankTier(entry.rank);
  const rankChange = calculateRankChange(entry.rank, entry.previous_rank);
  
  const getRankChangeIcon = () => {
    switch (rankChange.direction) {
      case 'up':
        return <TrendingUp size={16} color={rankChange.color} />;
      case 'down':
        return <TrendingDown size={16} color={rankChange.color} />;
      case 'new':
        return <Sparkles size={16} color={rankChange.color} />;
      default:
        return <Minus size={16} color={rankChange.color} />;
    }
  };

  const getRankChangeText = () => {
    switch (rankChange.direction) {
      case 'up':
        return `+${rankChange.change}`;
      case 'down':
        return `-${rankChange.change}`;
      case 'new':
        return 'NEW';
      default:
        return '—';
    }
  };

  const getCardGradient = () => {
    if (isCurrentUser) {
      return ['#FF6B35', '#FF6B3580'];
    }
    
    switch (entry.rank) {
      case 1:
        return ['#FFD700', '#FFA500'];
      case 2:
        return ['#C0C0C0', '#A0A0A0'];
      case 3:
        return ['#CD7F32', '#B8860B'];
      default:
        return ['#1a1a1a', '#2a2a2a'];
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={getCardGradient()}
        style={[
          styles.card,
          isCurrentUser && styles.currentUserCard
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.rankContainer}>
          <View style={[styles.rankBadge, { backgroundColor: rankTier.color }]}>
            <Text style={styles.rankIcon}>{rankTier.icon}</Text>
            <Text style={styles.rankNumber}>#{entry.rank}</Text>
          </View>
          <Text style={[styles.rankTier, { color: rankTier.color }]}>
            {rankTier.tier}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Image 
            source={{ 
              uri: entry.user?.avatar_url || 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
            }} 
            style={styles.avatar} 
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {entry.user?.full_name || entry.user?.username || 'Unknown User'}
              {isCurrentUser && <Text style={styles.youLabel}> (You)</Text>}
            </Text>
            <Text style={styles.userHandle}>
              @{entry.user?.username || 'user'}
            </Text>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.score}>
            {entry.score.toLocaleString()}
          </Text>
          <Text style={styles.scoreLabel}>points</Text>
          
          {showRankChange && (
            <View style={styles.rankChangeContainer}>
              {getRankChangeIcon()}
              <Text style={[styles.rankChangeText, { color: rankChange.color }]}>
                {getRankChangeText()}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  rankIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  rankNumber: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  rankTier: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  youLabel: {
    color: '#FFD700',
    fontFamily: 'Inter-Bold',
  },
  userHandle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter-Regular',
  },
  scoreContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  score: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  rankChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rankChangeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    marginLeft: 2,
  },
});
