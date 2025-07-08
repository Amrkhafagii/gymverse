import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface SocialStatsCardProps {
  title: string;
  stats: {
    posts: number;
    likes: number;
    comments: number;
    shares: number;
    followers?: number;
    following?: number;
    engagementRate?: number;
  };
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    timeframe: string;
  };
  onPress?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
}

export function SocialStatsCard({
  title,
  stats,
  trend,
  onPress,
  variant = 'default',
}: SocialStatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp size={16} color="#10b981" />;
      case 'down':
        return <TrendingDown size={16} color="#ef4444" />;
      default:
        return <Minus size={16} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return DesignTokens.colors.text.secondary;
    
    switch (trend.direction) {
      case 'up':
        return '#10b981';
      case 'down':
        return '#ef4444';
      default:
        return DesignTokens.colors.text.secondary;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        disabled={!onPress}
      >
        <Text style={styles.compactTitle}>{title}</Text>
        <View style={styles.compactStats}>
          <View style={styles.compactStat}>
            <Text style={styles.compactStatValue}>{formatNumber(stats.posts)}</Text>
            <Text style={styles.compactStatLabel}>Posts</Text>
          </View>
          <View style={styles.compactStat}>
            <Text style={styles.compactStatValue}>{formatNumber(stats.likes)}</Text>
            <Text style={styles.compactStatLabel}>Likes</Text>
          </View>
          <View style={styles.compactStat}>
            <Text style={styles.compactStatValue}>{formatNumber(stats.comments)}</Text>
            <Text style={styles.compactStatLabel}>Comments</Text>
          </View>
        </View>
        {trend && (
          <View style={styles.compactTrend}>
            {getTrendIcon()}
            <Text style={[styles.compactTrendText, { color: getTrendColor() }]}>
              {trend.percentage}% {trend.timeframe}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {trend && (
            <View style={styles.trendContainer}>
              {getTrendIcon()}
              <Text style={[styles.trendText, { color: getTrendColor() }]}>
                {trend.percentage}%
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <MessageCircle size={20} color={DesignTokens.colors.primary[500]} />
            </View>
            <Text style={styles.statValue}>{formatNumber(stats.posts)}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Heart size={20} color="#ef4444" />
            </View>
            <Text style={styles.statValue}>{formatNumber(stats.likes)}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <MessageCircle size={20} color="#4ECDC4" />
            </View>
            <Text style={styles.statValue}>{formatNumber(stats.comments)}</Text>
            <Text style={styles.statLabel}>Comments</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Share2 size={20} color="#96CEB4" />
            </View>
            <Text style={styles.statValue}>{formatNumber(stats.shares)}</Text>
            <Text style={styles.statLabel}>Shares</Text>
          </View>
        </View>

        {variant === 'detailed' && (stats.followers !== undefined || stats.following !== undefined) && (
          <View style={styles.followStats}>
            {stats.followers !== undefined && (
              <View style={styles.followStat}>
                <Users size={16} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.followStatValue}>{formatNumber(stats.followers)}</Text>
                <Text style={styles.followStatLabel}>Followers</Text>
              </View>
            )}
            {stats.following !== undefined && (
              <View style={styles.followStat}>
                <Users size={16} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.followStatValue}>{formatNumber(stats.following)}</Text>
                <Text style={styles.followStatLabel}>Following</Text>
              </View>
            )}
            {stats.engagementRate !== undefined && (
              <View style={styles.followStat}>
                <TrendingUp size={16} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.followStatValue}>{stats.engagementRate.toFixed(1)}%</Text>
                <Text style={styles.followStatLabel}>Engagement</Text>
              </View>
            )}
          </View>
        )}

        {trend && (
          <View style={styles.trendFooter}>
            <Text style={styles.trendFooterText}>
              {trend.direction === 'up' ? 'Increased' : trend.direction === 'down' ? 'Decreased' : 'No change'} by {trend.percentage}% in the {trend.timeframe}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.sm,
  },
  gradient: {
    padding: DesignTokens.spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  trendText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing[4],
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textTransform: 'uppercase',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  followStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: DesignTokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
    marginBottom: DesignTokens.spacing[3],
  },
  followStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  followStatValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  followStatLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  trendFooter: {
    paddingTop: DesignTokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
  },
  trendFooterText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  compactContainer: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[3],
  },
  compactTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },
  compactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing[2],
  },
  compactStat: {
    alignItems: 'center',
  },
  compactStatValue: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  compactStatLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  compactTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing[1],
  },
  compactTrendText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
