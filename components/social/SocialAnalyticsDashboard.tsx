import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
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
  Calendar,
  Clock,
  Target,
  Award,
  Zap,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useSocial } from '@/contexts/SocialContext';
import { localSocialEngine } from '@/lib/social/localSocialEngine';
import { formatDistanceToNow, format, subDays, startOfDay } from 'date-fns';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsMetric {
  id: string;
  title: string;
  value: number | string;
  change?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    timeframe: string;
  };
  icon: React.ComponentType<any>;
  color: string;
  format?: 'number' | 'percentage' | 'duration' | 'currency';
}

interface AnalyticsChart {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  data: Array<{ label: string; value: number; color?: string }>;
  timeframe: string;
}

interface SocialAnalyticsDashboardProps {
  timeframe?: 'day' | 'week' | 'month' | 'year';
  onTimeframeChange?: (timeframe: string) => void;
}

export function SocialAnalyticsDashboard({
  timeframe = 'week',
  onTimeframeChange,
}: SocialAnalyticsDashboardProps) {
  const { posts, myPosts, currentUser } = useSocial();
  const [analytics, setAnalytics] = useState<{
    metrics: AnalyticsMetric[];
    charts: AnalyticsChart[];
    insights: Array<{ title: string; description: string; actionable: boolean }>;
  }>({
    metrics: [],
    charts: [],
    insights: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe, posts, myPosts]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const engagementAnalytics = await localSocialEngine.getEngagementAnalytics(timeframe);
      const insights = await localSocialEngine.generateInsights(currentUser!, posts, []);
      
      const metrics = generateMetrics(engagementAnalytics);
      const charts = generateCharts(engagementAnalytics);
      
      setAnalytics({
        metrics,
        charts,
        insights: insights.map(insight => ({
          title: insight.title,
          description: insight.description,
          actionable: insight.actionable,
        })),
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMetrics = (engagementData: any): AnalyticsMetric[] => {
    const totalPosts = myPosts.length;
    const totalLikes = myPosts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = myPosts.reduce((sum, post) => sum + post.comments.length, 0);
    const totalShares = myPosts.reduce((sum, post) => sum + post.shares, 0);
    const totalEngagement = totalLikes + totalComments + totalShares;
    const engagementRate = totalPosts > 0 ? (totalEngagement / totalPosts) : 0;
    const avgLikesPerPost = totalPosts > 0 ? (totalLikes / totalPosts) : 0;

    return [
      {
        id: 'total_posts',
        title: 'Total Posts',
        value: totalPosts,
        change: { value: 12, direction: 'up', timeframe: 'vs last week' },
        icon: BarChart3,
        color: '#9E7FFF',
        format: 'number',
      },
      {
        id: 'total_likes',
        title: 'Total Likes',
        value: totalLikes,
        change: { value: 8, direction: 'up', timeframe: 'vs last week' },
        icon: Heart,
        color: '#ef4444',
        format: 'number',
      },
      {
        id: 'total_comments',
        title: 'Comments',
        value: totalComments,
        change: { value: 15, direction: 'up', timeframe: 'vs last week' },
        icon: MessageCircle,
        color: '#3b82f6',
        format: 'number',
      },
      {
        id: 'total_shares',
        title: 'Shares',
        value: totalShares,
        change: { value: 5, direction: 'down', timeframe: 'vs last week' },
        icon: Share2,
        color: '#10b981',
        format: 'number',
      },
      {
        id: 'engagement_rate',
        title: 'Engagement Rate',
        value: engagementRate.toFixed(1),
        change: { value: 3, direction: 'up', timeframe: 'vs last week' },
        icon: TrendingUp,
        color: '#f59e0b',
        format: 'number',
      },
      {
        id: 'avg_likes',
        title: 'Avg Likes/Post',
        value: avgLikesPerPost.toFixed(1),
        change: { value: 7, direction: 'up', timeframe: 'vs last week' },
        icon: Target,
        color: '#8b5cf6',
        format: 'number',
      },
      {
        id: 'followers',
        title: 'Followers',
        value: currentUser?.stats.followers || 0,
        change: { value: 4, direction: 'up', timeframe: 'vs last week' },
        icon: Users,
        color: '#06b6d4',
        format: 'number',
      },
      {
        id: 'reach',
        title: 'Estimated Reach',
        value: Math.round((totalLikes + totalComments) * 2.5),
        change: { value: 18, direction: 'up', timeframe: 'vs last week' },
        icon: Eye,
        color: '#84cc16',
        format: 'number',
      },
    ];
  };

  const generateCharts = (engagementData: any): AnalyticsChart[] => {
    // Generate engagement trend chart
    const engagementTrend: AnalyticsChart = {
      id: 'engagement_trend',
      title: 'Engagement Over Time',
      type: 'line',
      data: engagementData.engagementTrend.map((item: any) => ({
        label: format(new Date(item.date), 'MMM dd'),
        value: item.count,
      })),
      timeframe: `Last ${timeframe === 'week' ? '7 days' : timeframe}`,
    };

    // Generate post type performance chart
    const postTypeData = myPosts.reduce((acc, post) => {
      const engagement = post.likes + post.comments.length + post.shares;
      acc[post.type] = (acc[post.type] || 0) + engagement;
      return acc;
    }, {} as Record<string, number>);

    const postTypeChart: AnalyticsChart = {
      id: 'post_type_performance',
      title: 'Post Type Performance',
      type: 'pie',
      data: Object.entries(postTypeData).map(([type, value], index) => ({
        label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value,
        color: ['#9E7FFF', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][index % 6],
      })),
      timeframe: 'All time',
    };

    // Generate daily activity chart
    const dailyActivity: AnalyticsChart = {
      id: 'daily_activity',
      title: 'Daily Activity',
      type: 'bar',
      data: Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dayPosts = myPosts.filter(post => 
          startOfDay(new Date(post.timestamp)).getTime() === startOfDay(date).getTime()
        );
        return {
          label: format(date, 'EEE'),
          value: dayPosts.reduce((sum, post) => sum + post.likes + post.comments.length + post.shares, 0),
        };
      }),
      timeframe: 'Last 7 days',
    };

    return [engagementTrend, postTypeChart, dailyActivity];
  };

  const formatMetricValue = (value: number | string, format?: string): string => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        return `${Math.round(value)}m`;
      case 'currency':
        return `$${value.toFixed(2)}`;
      default:
        return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
    }
  };

  const renderMetricCard = (metric: AnalyticsMetric) => {
    const IconComponent = metric.icon;
    const TrendIcon = metric.change?.direction === 'up' ? TrendingUp : 
                     metric.change?.direction === 'down' ? TrendingDown : Activity;
    
    return (
      <LinearGradient
        key={metric.id}
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.metricCard}
      >
        <View style={styles.metricHeader}>
          <View style={[styles.metricIcon, { backgroundColor: metric.color + '20' }]}>
            <IconComponent size={20} color={metric.color} />
          </View>
          {metric.change && (
            <View style={[
              styles.changeIndicator,
              { backgroundColor: metric.change.direction === 'up' ? '#10b981' : '#ef4444' }
            ]}>
              <TrendIcon size={12} color="#FFFFFF" />
              <Text style={styles.changeText}>
                {metric.change.value}%
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.metricValue}>
          {formatMetricValue(metric.value, metric.format)}
        </Text>
        <Text style={styles.metricTitle}>{metric.title}</Text>
        
        {metric.change && (
          <Text style={styles.metricChange}>
            {metric.change.timeframe}
          </Text>
        )}
      </LinearGradient>
    );
  };

  const renderSimpleChart = (chart: AnalyticsChart) => {
    if (chart.type === 'pie') {
      return (
        <View style={styles.pieChartContainer}>
          {chart.data.map((item, index) => (
            <View key={index} style={styles.pieChartItem}>
              <View style={[styles.pieChartColor, { backgroundColor: item.color }]} />
              <Text style={styles.pieChartLabel}>{item.label}</Text>
              <Text style={styles.pieChartValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      );
    }

    if (chart.type === 'bar') {
      const maxValue = Math.max(...chart.data.map(item => item.value));
      return (
        <View style={styles.barChartContainer}>
          {chart.data.map((item, index) => (
            <View key={index} style={styles.barChartItem}>
              <View style={styles.barChartBar}>
                <View
                  style={[
                    styles.barChartFill,
                    {
                      height: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: DesignTokens.colors.primary[500],
                    },
                  ]}
                />
              </View>
              <Text style={styles.barChartLabel}>{item.label}</Text>
              <Text style={styles.barChartValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      );
    }

    // Simple line chart representation
    return (
      <View style={styles.lineChartContainer}>
        <View style={styles.lineChartGrid}>
          {chart.data.map((item, index) => (
            <View key={index} style={styles.lineChartPoint}>
              <Text style={styles.lineChartValue}>{item.value}</Text>
              <Text style={styles.lineChartLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderChart = (chart: AnalyticsChart) => (
    <LinearGradient
      key={chart.id}
      colors={['#1a1a1a', '#2a2a2a']}
      style={styles.chartCard}
    >
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>{chart.title}</Text>
        <Text style={styles.chartTimeframe}>{chart.timeframe}</Text>
      </View>
      {renderSimpleChart(chart)}
    </LinearGradient>
  );

  const renderInsight = (insight: any, index: number) => (
    <LinearGradient
      key={index}
      colors={['#1a1a1a', '#2a2a2a']}
      style={styles.insightCard}
    >
      <View style={styles.insightHeader}>
        <Zap size={20} color={DesignTokens.colors.primary[500]} />
        <Text style={styles.insightTitle}>{insight.title}</Text>
      </View>
      <Text style={styles.insightDescription}>{insight.description}</Text>
      {insight.actionable && (
        <TouchableOpacity style={styles.insightAction}>
          <Text style={styles.insightActionText}>Take Action</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );

  const timeframeOptions = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Social Analytics</Text>
        <Text style={styles.subtitle}>Track your social media performance</Text>
      </View>

      {/* Timeframe Selector */}
      <View style={styles.timeframeSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {timeframeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.timeframeButton,
                timeframe === option.value && styles.timeframeButtonActive,
              ]}
              onPress={() => onTimeframeChange?.(option.value)}
            >
              <Text style={[
                styles.timeframeButtonText,
                timeframe === option.value && styles.timeframeButtonTextActive,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        {analytics.metrics.map(renderMetricCard)}
      </View>

      {/* Charts */}
      <View style={styles.chartsSection}>
        <Text style={styles.sectionTitle}>Performance Charts</Text>
        {analytics.charts.map(renderChart)}
      </View>

      {/* Insights */}
      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        {analytics.insights.map(renderInsight)}
      </View>

      {/* Summary */}
      <View style={styles.summarySection}>
        <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Award size={24} color={DesignTokens.colors.primary[500]} />
            <Text style={styles.summaryTitle}>Performance Summary</Text>
          </View>
          <Text style={styles.summaryText}>
            Your social engagement has increased by 12% this week. Your workout completion posts 
            are performing exceptionally well with an average of 15 likes per post. 
            Consider posting more progress updates to maintain this momentum.
          </Text>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
  },
  header: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize['3xl'],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },
  subtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  timeframeSelector: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  timeframeButton: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    marginRight: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.secondary,
  },
  timeframeButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  timeframeButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.secondary,
  },
  timeframeButtonTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[6],
  },
  metricCard: {
    width: (screenWidth - DesignTokens.spacing[6] * 2) / 2 - DesignTokens.spacing[2],
    margin: DesignTokens.spacing[2],
    padding: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    ...DesignTokens.shadow.base,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
    gap: DesignTokens.spacing[1],
  },
  changeText: {
    fontSize: 10,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  metricValue: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  metricTitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  metricChange: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  chartsSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[4],
  },
  chartCard: {
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[4],
    ...DesignTokens.shadow.base,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  chartTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  chartTimeframe: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  pieChartContainer: {
    gap: DesignTokens.spacing[2],
  },
  pieChartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  pieChartColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pieChartLabel: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
  },
  pieChartValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    gap: DesignTokens.spacing[2],
  },
  barChartItem: {
    flex: 1,
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  barChartBar: {
    flex: 1,
    width: '100%',
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: DesignTokens.borderRadius.sm,
    justifyContent: 'flex-end',
  },
  barChartFill: {
    width: '100%',
    borderRadius: DesignTokens.borderRadius.sm,
  },
  barChartLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  barChartValue: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  lineChartContainer: {
    height: 100,
  },
  lineChartGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
  },
  lineChartPoint: {
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  lineChartValue: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.primary[500],
  },
  lineChartLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  insightsSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  insightCard: {
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[3],
    ...DesignTokens.shadow.base,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
    gap: DesignTokens.spacing[2],
  },
  insightTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  insightDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
    marginBottom: DesignTokens.spacing[3],
  },
  insightAction: {
    alignSelf: 'flex-start',
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    borderRadius: DesignTokens.borderRadius.md,
  },
  insightActionText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.primary[500],
  },
  summarySection: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingBottom: DesignTokens.spacing[8],
  },
  summaryCard: {
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[5],
    ...DesignTokens.shadow.base,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
    gap: DesignTokens.spacing[3],
  },
  summaryTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  summaryText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 24,
  },
});
