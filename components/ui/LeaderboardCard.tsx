import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Flame,
  Target
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface LeaderboardUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  rank: number;
  previousRank?: number;
  points: number;
  level: number;
  streak: number;
  workoutsThisWeek: number;
  badge?: {
    name: string;
    color: string;
  };
}

interface LeaderboardCardProps {
  user: LeaderboardUser;
  onPress?: () => void;
  variant?: 'podium' | 'list';
  isCurrentUser?: boolean;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  user,
  onPress,
  variant = 'list',
  isCurrentUser = false,
}) => {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return DesignTokens.colors.text.secondary;
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Crown size={20} color={getRankColor(rank)} />;
    }
    return null;
  };

  const getTrendIcon = () => {
    if (!user.previousRank) return <Minus size={16} color={DesignTokens.colors.text.tertiary} />;
    
    if (user.rank < user.previousRank) {
      return <TrendingUp size={16} color={DesignTokens.colors.success[500]} />;
    } else if (user.rank > user.previousRank) {
      return <TrendingDown size={16} color={DesignTokens.colors.error[500]} />;
    }
    return <Minus size={16} color={DesignTokens.colors.text.tertiary} />;
  };

  const getTrendText = () => {
    if (!user.previousRank) return '';
    
    const change = Math.abs(user.rank - user.previousRank);
    if (user.rank < user.previousRank) {
      return `+${change}`;
    } else if (user.rank > user.previousRank) {
      return `-${change}`;
    }
    return '—';
  };

  if (variant === 'podium') {
    return (
      <TouchableOpacity 
        style={[styles.podiumCard, user.rank === 1 && styles.firstPlace]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={user.rank === 1 
            ? ['#FFD700', '#FFA500'] 
            : user.rank === 2 
            ? ['#C0C0C0', '#A8A8A8']
            : user.rank === 3
            ? ['#CD7F32', '#B8860B']
            : ['#1a1a1a', '#2a2a2a']
          }
          style={styles.podiumGradient}
        >
          {/* Rank Badge */}
          <View style={styles.podiumRank}>
            <Text style={styles.podiumRankText}>{user.rank}</Text>
          </View>

          {/* Avatar */}
          <View style={styles.podiumAvatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.podiumAvatar} />
            {user.rank <= 3 && (
              <View style={styles.crownContainer}>
                <Crown size={24} color="#FFFFFF" />
              </View>
            )}
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{user.level}</Text>
            </View>
          </View>

          {/* User Info */}
          <Text style={styles.podiumName} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={styles.podiumUsername} numberOfLines={1}>
            {user.username}
          </Text>

          {/* Points */}
          <Text style={styles.podiumPoints}>
            {user.points.toLocaleString()}
          </Text>
          <Text style={styles.podiumPointsLabel}>points</Text>

          {/* Stats */}
          <View style={styles.podiumStats}>
            <View style={styles.podiumStat}>
              <Flame size={14} color="#FFFFFF" />
              <Text style={styles.podiumStatText}>{user.streak}</Text>
            </View>
            <View style={styles.podiumStat}>
              <Target size={14} color="#FFFFFF" />
              <Text style={styles.podiumStatText}>{user.workoutsThisWeek}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[
        styles.listCard,
        isCurrentUser && styles.currentUserCard,
        user.rank <= 3 && styles.topThreeCard
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={isCurrentUser 
          ? [DesignTokens.colors.primary[500] + '20', DesignTokens.colors.primary[500] + '10']
          : ['#1a1a1a', '#2a2a2a']
        }
        style={styles.listGradient}
      >
        {/* Rank */}
        <View style={[styles.rankContainer, user.rank <= 3 && { backgroundColor: getRankColor(user.rank) + '20' }]}>
          {user.rank <= 3 ? (
            getRankIcon(user.rank)
          ) : (
            <Text style={[styles.rankNumber, { color: getRankColor(user.rank) }]}>
              {user.rank}
            </Text>
          )}
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{user.level}</Text>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {user.name}
            </Text>
            {user.badge && (
              <View style={[styles.userBadge, { backgroundColor: user.badge.color }]}>
                <Text style={styles.badgeText}>{user.badge.name}</Text>
              </View>
            )}
          </View>
          <Text style={styles.username} numberOfLines={1}>
            {user.username}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statColumn}>
            <Text style={styles.statValue}>{user.points.toLocaleString()}</Text>
            <Text style={styles.statLabel}>points</Text>
          </View>
          <View style={styles.statColumn}>
            <View style={styles.streakContainer}>
              <Flame size={12} color="#FF6B35" />
              <Text style={styles.statValue}>{user.streak}</Text>
            </View>
            <Text style={styles.statLabel}>streak</Text>
          </View>
        </View>

        {/* Trend */}
        <View style={styles.trendContainer}>
          {getTrendIcon()}
          {getTrendText() && (
            <Text style={[
              styles.trendText,
              { color: user.rank < (user.previousRank || user.rank) 
                ? DesignTokens.colors.success[500] 
                : user.rank > (user.previousRank || user.rank)
                ? DesignTokens.colors.error[500]
                : DesignTokens.colors.text.tertiary
              }
            ]}>
              {getTrendText()}
            </Text>
          )}
        </View>

        {/* Accent Line for Top 3 */}
        {user.rank <= 3 && (
          <View style={[styles.accentLine, { backgroundColor: getRankColor(user.rank) }]} />
        )}

        {/* Current User Indicator */}
        {isCurrentUser && (
          <View style={styles.currentUserIndicator}>
            <Text style={styles.currentUserText}>You</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Podium Card
  podiumCard: {
    flex: 1,
    margin: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    minHeight: 200,
    ...DesignTokens.shadow.lg,
  },
  firstPlace: {
    transform: [{ scale: 1.05 }],
    zIndex: 1,
  },
  podiumGradient: {
    flex: 1,
    padding: DesignTokens.spacing[4],
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  podiumRank: {
    position: 'absolute',
    top: DesignTokens.spacing[3],
    right: DesignTokens.spacing[3],
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumRankText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  podiumAvatarContainer: {
    position: 'relative',
    alignItems: 'center',
    marginTop: DesignTokens.spacing[2],
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  crownContainer: {
    position: 'absolute',
    top: -12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: DesignTokens.spacing[1],
  },
  podiumName: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
    marginTop: DesignTokens.spacing[2],
  },
  podiumUsername: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    opacity: 0.8,
    textAlign: 'center',
  },
  podiumPoints: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
    marginTop: DesignTokens.spacing[2],
  },
  podiumPointsLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    opacity: 0.8,
    textAlign: 'center',
  },
  podiumStats: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
    marginTop: DesignTokens.spacing[2],
  },
  podiumStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  podiumStatText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  // List Card
  listCard: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[3],
    position: 'relative',
    ...DesignTokens.shadow.base,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: DesignTokens.colors.primary[500],
  },
  topThreeCard: {
    // Additional styling for top 3 if needed
  },
  listGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing[4],
    position: 'relative',
  },
  rankContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.surface.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing[3],
  },
  rankNumber: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: DesignTokens.spacing[3],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: DesignTokens.colors.surface.primary,
  },
  levelText: {
    fontSize: 10,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[1],
  },
  name: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    flex: 1,
  },
  userBadge: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
    marginLeft: DesignTokens.spacing[2],
  },
  badgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  username: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[4],
    marginRight: DesignTokens.spacing[3],
  },
  statColumn: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  trendContainer: {
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  trendText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  currentUserIndicator: {
    position: 'absolute',
    top: DesignTokens.spacing[2],
    right: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.primary[500],
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  currentUserText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
});
