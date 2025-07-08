import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Trophy,
  Users,
  TrendingUp,
  Target,
  Award,
  Star,
  BarChart3,
  Activity,
  Zap,
  Calendar,
} from 'lucide-react-native';
import { useLeaderboards } from '@/hooks/useLeaderboards';
import { LeaderboardType, LeaderboardTimeframe } from '@/lib/challenges/localLeaderboards';

const { width } = Dimensions.get('window');

interface LeaderboardStatsProps {
  type: LeaderboardType;
  timeframe: LeaderboardTimeframe;
  challengeId?: string;
}

interface StatCard {
  id: string;
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  gradient: string[];
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function LeaderboardStats({
  type,
  timeframe,
  challengeId,
}: LeaderboardStatsProps) {
  const { getLeaderboardStats, getLeaderboardInsights } = useLeaderboards();
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [type, timeframe, challengeId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [statsData, insightsData] = await Promise.all([
        getLeaderboardStats(type, timeframe, challengeId),
        getLeaderboardInsights(type, timeframe, challengeId),
      ]);
      setStats(statsData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading leaderboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatScore = (score: number, scoreType: string) => {
    switch (scoreType) {
      case 'points':
        return formatNumber(score);
      case 'time':
        return formatTime(score);
      case 'weight':
        return `${score}kg`;
      case 'distance':
        return `${score}km`;
      case 'reps':
        return formatNumber(score);
      default:
        return formatNumber(score);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    }
    return `${seconds}s`;
  };

  const getStatCards = (): StatCard[] => {
    if (!stats || !insights) return [];

    return [
      {
        id: 'participants',
        title: 'Total Participants',
        value: formatNumber(stats.totalParticipants),
        subtitle: `${insights.activeParticipants} active`,
        icon: <Users size={24} color="#fff" />,
        color: '#4A90E2',
        gradient: ['#4A90E2', '#357ABD'],
        trend: {
          value: insights.participantGrowth || 0,
          isPositive: (insights.participantGrowth || 0) > 0,
        },
      },
      {
        id: 'average',
        title: 'Average Score',
        value: formatScore(stats.averageScore, stats.scoreType || 'points'),
        subtitle: 'Community average',
        icon: <BarChart3 size={24} color="#fff" />,
        color: '#27AE60',
        gradient: ['#27AE60', '#229954'],
        trend: {
          value: insights.averageScoreTrend || 0,
          isPositive: (insights.averageScoreTrend || 0) > 0,
        },
      },
      {
        id: 'top',
        title: 'Top Score',
        value: formatScore(stats.topScore, stats.scoreType || 'points'),
        subtitle: `by ${stats.topPerformer}`,
        icon: <Trophy size={24} color="#fff" />,
        color: '#FFD700',
        gradient: ['#FFD700', '#FFC107'],
      },
      {
        id: 'competition',
        title: 'Competition Level',
        value: insights.competitionLevel || 'Medium',
        subtitle: `${insights.competitionScore}/100`,
        icon: <Zap size={24} color="#fff" />,
        color: '#FF6B35',
        gradient: ['#FF6B35', '#E55A2B'],
      },
      {
        id: 'activity',
        title: 'Activity Rate',
        value: `${Math.round((insights.activeParticipants / stats.totalParticipants) * 100)}%`,
        subtitle: 'Recently active',
        icon: <Activity size={24} color="#fff" />,
        color: '#9B59B6',
        gradient: ['#9B59B6', '#8E44AD'],
        trend: {
          value: insights.activityTrend || 0,
          isPositive: (insights.activityTrend || 0) > 0,
        },
      },
      {
        id: 'streaks',
        title: 'Active Streaks',
        value: formatNumber(insights.activeStreaks || 0),
        subtitle: 'Users on streak',
        icon: <Star size={24} color="#fff" />,
        color: '#F39C12',
        gradient: ['#F39C12', '#E67E22'],
      },
    ];
  };

  const renderStatCard = (card: StatCard) => (
    <View key={card.id} style={styles.statCard}>
      <LinearGradient colors={card.gradient} style={styles.statCardGradient}>
        <View style={styles.statCardHeader}>
          <View style={styles.statCardIcon}>
            {card.icon}
          </View>
          {card.trend && (
            <View style={[
              styles.trendIndicator,
              { backgroundColor: card.trend.isPositive ? '#27AE6020' : '#E74C3C20' },
            ]}>
              <TrendingUp 
                size={12} 
                color={card.trend.isPositive ? '#27AE60' : '#E74C3C'}
                style={card.trend.isPositive ? {} : { transform: [{ rotate: '180deg' }] }}
              />
              <Text style={[
                styles.trendText,
                { color: card.trend.isPositive ? '#27AE60' : '#E74C3C' },
              ]}>
                {Math.abs(card.trend.value)}%
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.statCardValue}>{card.value}</Text>
        <Text style={styles.statCardTitle}>{card.title}</Text>
        {card.subtitle && (
          <Text style={styles.statCardSubtitle}>{card.subtitle}</Text>
        )}
      </LinearGradient>
    </View>
  );

  const renderInsightCard = (insight: any) => (
    <View key={insight.id} style={styles.insightCard}>
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.insightCardGradient}>
        <View style={styles.insightHeader}>
          <Target size={20} color="#FF6B35" />
          <Text style={styles.insightTitle}>{insight.title}</Text>
        </View>
        <Text style={styles.insightText}>{insight.description}</Text>
        {insight.recommendation && (
          <View style={styles.recommendationContainer}>
            <Award size={16} color="#4A90E2" />
            <Text style={styles.recommendationText}>{insight.recommendation}</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  const statCards = getStatCards();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <BarChart3 size={24} color="#FF6B35" />
        <Text style={styles.headerTitle}>Leaderboard Statistics</Text>
      </View>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        {statCards.map(renderStatCard)}
      </View>

      {/* Insights Section */}
      {insights?.insights && insights.insights.length > 0 && (
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Insights & Recommendations</Text>
          {insights.insights.map(renderInsightCard)}
        </View>
      )}

      {/* Performance Distribution */}
      {stats?.distribution && (
        <View style={styles.distributionSection}>
          <Text style={styles.sectionTitle}>Performance Distribution</Text>
          <View style={styles.distributionCard}>
            <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.distributionGradient}>
              <View style={styles.distributionHeader}>
                <BarChart3 size={20} color="#4A90E2" />
                <Text style={styles.distributionTitle}>Score Distribution</Text>
              </View>
              
              <View style={styles.distributionBars}>
                {Object.entries(stats.distribution).map(([range, count]) => {
                  const percentage = ((count as number) / stats.totalParticipants) * 100;
                  return (
                    <View key={range} style={styles.distributionBar}>
                      <Text style={styles.distributionRange}>{range}</Text>
                      <View style={styles.distributionBarContainer}>
                        <View 
                          style={[
                            styles.distributionBarFill,
                            { width: `${percentage}%` },
                          ]} 
                        />
                      </View>
                      <Text style={styles.distributionCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </LinearGradient>
          </View>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: 16,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  statCardValue: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statCardTitle: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    opacity: 0.9,
  },
  statCardSubtitle: {
    fontSize: 10,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    opacity: 0.7,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  insightsSection: {
    marginTop: 32,
  },
  insightCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  insightCardGradient: {
    padding: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 8,
  },
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#4A90E220',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
  },
  recommendationText: {
    fontSize: 12,
    color: '#4A90E2',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  distributionSection: {
    marginTop: 32,
  },
  distributionCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  distributionGradient: {
    padding: 20,
  },
  distributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  distributionTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  distributionBars: {
    gap: 12,
  },
  distributionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distributionRange: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    width: 60,
  },
  distributionBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionBarFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    width: 30,
    textAlign: 'right',
  },
  bottomSpacer: {
    height: 40,
  },
});
