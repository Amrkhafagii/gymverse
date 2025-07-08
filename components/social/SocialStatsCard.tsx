import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  TrendingDown,
  Heart,
  MessageCircle,
  Share2,
  Users,
  Eye,
  BarChart3,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface SocialStats {
  posts: number;
  likes: number;
  comments: number;
  shares: number;
  followers?: number;
  following?: number;
  views?: number;
  engagementRate: number;
}

interface SocialTrend {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  timeframe: string;
}

interface SocialStatsCardProps {
  title: string;
  stats: SocialStats;
  trend?: SocialTrend;
  variant?: 'default' | 'compact' | 'detailed';
  onPress?: () => void;
}

export function SocialStatsCard({
  title,
  stats,
  trend,
  variant = 'default',
  onPress,
}: SocialStatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp size={16} color={DesignTokens.colors.success[500]} />;
      case 'down':
        return <TrendingDown size={16} color={DesignTokens.colors.error[500]} />;
      default:
        return <BarChart3 size={16} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return DesignTokens.colors.text.secondary;
    
    switch (trend.direction) {
      case 'up':
        return DesignTokens.colors.success[500];
      case 'down':
        return DesignTokens.colors.error[500];
      default:
        return DesignTokens.colors.text.secondary;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const StatItem = ({ 
    icon, 
    value, 
    label, 
    color 
  }: { 
    icon: React.ReactNode; 
    value: number; 
    label: string;
    color?: string;
  }) => (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, color && { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{formatNumber(value)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.compactHeader}>
          <Text style={styles.compactTitle}>{title}</Text>
          {trend && (
            <View style={styles.compactTrend}>
              {getTrendIcon()}
              <Text style={[styles.compactTrendText, { color: getTrendColor() }]}>
                {trend.percentage > 0 ? '+' : ''}{trend.percentage.toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
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
            <Text style={styles.compactStatValue}>{stats.engagementRate.toFixed(1)}%</Text>
            <Text style={styles.compactStatLabel}>Engagement</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'detailed') {
    return (
      <TouchableOpacity
        style={styles.detailedContainer}
        onPress={onPress}
        disabled={!onPress}
      >
        <LinearGradient
          colors={['#1a1a1a', '#2a2a2a']}
          style={styles.detailedGradient}
        >
          <View style={styles.detailedHeader}>
            <Text style={styles.detailedTitle}>{title}</Text>
            {trend && (
              <View style={styles.trendContainer}>
                {getTrendIcon()}
                <Text style={[styles.trendText, { color: getTrendColor() }]}>
                  {trend.percentage > 0 ? '+' : ''}{trend.percentage.toFixed(1)}%
                </Text>
                <Text style={styles.trendTimeframe}>{trend.timeframe}</Text>
              </View>
            )}
          </View>

          <View style={styles.detailedStats}>
            <View style={styles.primaryStats}>
              <StatItem
                icon={<Heart size={16} color={DesignTokens.colors.error[500]} />}
                value={stats.likes}
                label="Likes"
                color={DesignTokens.colors.error[500]}
              />
              <StatItem
                icon={<MessageCircle size={16} color={DesignTokens.colors.primary[500]} />}
                value={stats.comments}
                label="Comments"
                color={DesignTokens.colors.primary[500]}
              />
              <StatItem
                icon={<Share2 size={16} color={DesignTokens.colors.success[500]} />}
                value={stats.shares}
                label="Shares"
                color={DesignTokens.colors.success[500]}
              />
            </View>

            <View style={styles.secondaryStats}>
              {stats.followers !== undefined && (
                <StatItem
                  icon={<Users size={16} color={DesignTokens.colors.warning[500]} />}
                  value={stats.followers}
                  label="Followers"
                  color={DesignTokens.colors.warning[500]}
                />
              )}
              {stats.views !== undefined && (
                <StatItem
                  icon={<Eye size={16} color={DesignTokens.colors.info[500]} />}
                  value={stats.views}
                  label="Views"
                  color={DesignTokens.colors.info[500]}
                />
              )}
              <StatItem
                icon={<BarChart3 size={16} color={DesignTokens.colors.text.secondary} />}
                value={stats.engagementRate}
                label="Engagement %"
              />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Default variant
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {trend && (
          <View style={styles.trendContainer}>
            {getTrendIcon()}
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {trend.percentage > 0 ? '+' : ''}{trend.percentage.toFixed(1)}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statRow}>
          <StatItem
            icon={<Heart size={16} color={DesignTokens.colors.error[500]} />}
            value={stats.likes}
            label="Likes"
          />
          <StatItem
            icon={<MessageCircle size={16} color={DesignTokens.colors.primary[500]} />}
            value={stats.comments}
            label="Comments"
          />
        </View>
        <View style={styles.statRow}>
          <StatItem
            icon={<Share2 size={16} color={DesignTokens.colors.success[500]} />}
            value={stats.shares}
            label="Shares"
          />
          <StatItem
            icon={<BarChart3 size={16} color={DesignTokens.colors.text.secondary} />}
            value={stats.engagementRate}
            label="Engagement %"
          />
        </View>
      </View>

      {trend && (
        <Text style={styles.trendTimeframe}>
          vs {trend.timeframe}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactContainer: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[3],
  },
  detailedContainer: {
    borderRadius: DesignTokens.borderRadius.lg,
    marginBottom: DesignTokens.spacing[4],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  detailedGradient: {
    padding: DesignTokens.spacing[5],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[5],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  compactTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  detailedTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    flex: 1,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  compactTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  trendText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  compactTrendText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  trendTimeframe: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    textAlign: 'center',
    marginTop: DesignTokens.spacing[2],
  },
  statsGrid: {
    gap: DesignTokens.spacing[3],
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailedStats: {
    gap: DesignTokens.spacing[4],
  },
  primaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  compactStat: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignTokens.colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  compactStatValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  compactStatLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
});
