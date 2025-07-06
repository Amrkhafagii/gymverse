import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Moon,
  Sun,
  Clock,
  TrendingUp,
  Calendar,
  Settings,
  Plus,
  Target,
  Zap,
  Shield,
  Award,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { DesignTokens } from '@/design-system/tokens';
import { SleepRingChart } from '@/components/sleep/SleepRingChart';
import { SleepScoreCard } from '@/components/sleep/SleepScoreCard';
import { SleepTrendChart } from '@/components/sleep/SleepTrendChart';
import { SleepInsightCard } from '@/components/sleep/SleepInsightCard';
import { Button } from '@/components/ui/Button';
import * as Haptics from 'expo-haptics';

export default function SleepScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  // Mock sleep data - in real app, this would come from API/database
  const todaySleepData = {
    deep: 120,    // 2 hours
    light: 240,   // 4 hours
    rem: 90,      // 1.5 hours
    awake: 30,    // 30 minutes
  };

  const totalSleep = todaySleepData.deep + todaySleepData.light + todaySleepData.rem;
  const sleepEfficiency = Math.round((totalSleep / (totalSleep + todaySleepData.awake)) * 100);

  const sleepScore = {
    score: 78,
    previousScore: 72,
    factors: {
      duration: 85,
      efficiency: sleepEfficiency,
      consistency: 70,
      quality: 82,
    },
  };

  const trendData = [
    { date: '2024-01-15', score: 65, duration: 420 },
    { date: '2024-01-16', score: 72, duration: 450 },
    { date: '2024-01-17', score: 68, duration: 390 },
    { date: '2024-01-18', score: 75, duration: 480 },
    { date: '2024-01-19', score: 82, duration: 465 },
    { date: '2024-01-20', score: 78, duration: 450 },
    { date: '2024-01-21', score: 78, duration: 450 },
  ];

  const sleepInsights = [
    {
      id: '1',
      type: 'improvement' as const,
      title: 'Great Sleep Consistency!',
      description: 'You\'ve maintained a consistent bedtime for 5 days straight. Keep it up!',
      action: 'View Sleep Schedule',
      priority: 'low' as const,
    },
    {
      id: '2',
      type: 'tip' as const,
      title: 'Optimize Your Sleep Environment',
      description: 'Your room temperature might be affecting your deep sleep. Try keeping it between 65-68°F.',
      action: 'Learn More',
      priority: 'medium' as const,
    },
    {
      id: '3',
      type: 'warning' as const,
      title: 'Late Screen Time Detected',
      description: 'You used your phone 30 minutes before bed last night. This can impact sleep quality.',
      action: 'Set Sleep Mode',
      priority: 'high' as const,
    },
    {
      id: '4',
      type: 'achievement' as const,
      title: 'Sleep Goal Achieved!',
      description: 'You\'ve hit your 7.5-hour sleep target 4 times this week.',
      priority: 'low' as const,
    },
  ];

  const sleepGoals = [
    {
      title: 'Sleep Duration',
      current: '7h 30m',
      target: '8h 00m',
      progress: 0.94,
      icon: <Clock size={20} color={DesignTokens.colors.primary[500]} />,
    },
    {
      title: 'Bedtime Consistency',
      current: '5/7 days',
      target: '7/7 days',
      progress: 0.71,
      icon: <Target size={20} color={DesignTokens.colors.success[500]} />,
    },
    {
      title: 'Sleep Efficiency',
      current: `${sleepEfficiency}%`,
      target: '90%',
      progress: sleepEfficiency / 90,
      icon: <Zap size={20} color={DesignTokens.colors.warning[500]} />,
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handlePeriodChange = (period: '7d' | '30d' | '90d') => {
    setSelectedPeriod(period);
  };

  const handleInsightAction = (insightId: string) => {
    const insight = sleepInsights.find(i => i.id === insightId);
    Alert.alert('Sleep Insight', `Action: ${insight?.action}`);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getBedtimeRecommendation = () => {
    // Calculate recommended bedtime based on wake time and sleep goal
    const wakeTime = new Date();
    wakeTime.setHours(7, 0, 0, 0); // 7:00 AM wake time
    
    const bedtime = new Date(wakeTime);
    bedtime.setHours(bedtime.getHours() - 8); // 8 hours before wake time
    
    return bedtime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Moon size={28} color={DesignTokens.colors.primary[500]} />
            <Text style={styles.title}>Sleep</Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity 
              onPress={() => router.push('/sleep-log')} 
              style={styles.headerButton}
            >
              <Plus size={20} color={DesignTokens.colors.text.secondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => router.push('/sleep-settings')} 
              style={styles.headerButton}
            >
              <Settings size={20} color={DesignTokens.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Moon size={16} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.statLabel}>Last Night</Text>
            <Text style={styles.statValue}>{formatTime(totalSleep)}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Sun size={16} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.statLabel}>Recommended Bedtime</Text>
            <Text style={styles.statValue}>{getBedtimeRecommendation()}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Sleep Score */}
        <View style={styles.section}>
          <SleepScoreCard
            score={sleepScore.score}
            previousScore={sleepScore.previousScore}
            factors={sleepScore.factors}
            onInfoPress={() => Alert.alert('Sleep Score', 'Your sleep score is calculated based on duration, efficiency, consistency, and quality factors.')}
          />
        </View>

        {/* Sleep Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Last Night's Sleep</Text>
            <TouchableOpacity onPress={() => router.push('/sleep-details')}>
              <Text style={styles.sectionAction}>View Details</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.sleepBreakdownCard}>
            <SleepRingChart
              sleepData={todaySleepData}
              totalSleep={totalSleep}
              size={220}
            />
            
            <View style={styles.sleepStats}>
              <View style={styles.sleepStatRow}>
                <Text style={styles.sleepStatLabel}>Sleep Efficiency</Text>
                <Text style={styles.sleepStatValue}>{sleepEfficiency}%</Text>
              </View>
              <View style={styles.sleepStatRow}>
                <Text style={styles.sleepStatLabel}>Time in Bed</Text>
                <Text style={styles.sleepStatValue}>{formatTime(totalSleep + todaySleepData.awake)}</Text>
              </View>
              <View style={styles.sleepStatRow}>
                <Text style={styles.sleepStatLabel}>Sleep Onset</Text>
                <Text style={styles.sleepStatValue}>12 min</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sleep Goals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sleep Goals</Text>
            <TouchableOpacity onPress={() => router.push('/sleep-goals')}>
              <Text style={styles.sectionAction}>Edit Goals</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.goalsContainer}>
            {sleepGoals.map((goal, index) => (
              <View key={index} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  {goal.icon}
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                </View>
                
                <View style={styles.goalProgress}>
                  <View style={styles.goalProgressBar}>
                    <View 
                      style={[
                        styles.goalProgressFill,
                        { width: `${Math.min(goal.progress * 100, 100)}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.goalProgressText}>
                    {Math.round(goal.progress * 100)}%
                  </Text>
                </View>
                
                <View style={styles.goalValues}>
                  <Text style={styles.goalCurrent}>{goal.current}</Text>
                  <Text style={styles.goalTarget}>/ {goal.target}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Sleep Trends */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sleep Trends</Text>
            
            <View style={styles.periodSelector}>
              {(['7d', '30d', '90d'] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && styles.activePeriodButton,
                  ]}
                  onPress={() => handlePeriodChange(period)}
                >
                  <Text style={[
                    styles.periodButtonText,
                    selectedPeriod === period && styles.activePeriodButtonText,
                  ]}>
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <SleepTrendChart data={trendData} period={selectedPeriod} />
        </View>

        {/* Sleep Insights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sleep Insights</Text>
            <TouchableOpacity onPress={() => router.push('/sleep-insights')}>
              <Text style={styles.sectionAction}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {sleepInsights.slice(0, 3).map((insight) => (
            <SleepInsightCard
              key={insight.id}
              insight={insight}
              onActionPress={handleInsightAction}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/sleep-log')}
            >
              <LinearGradient
                colors={['#9E7FFF', '#7C3AED']}
                style={styles.quickActionGradient}
              >
                <Plus size={24} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Log Sleep</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/sleep-schedule')}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.quickActionGradient}
              >
                <Calendar size={24} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Schedule</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
  },
  header: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingTop: DesignTokens.spacing[2],
    paddingBottom: DesignTokens.spacing[4],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: DesignTokens.typography.fontSize['3xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginLeft: DesignTokens.spacing[3],
  },
  headerRight: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  headerButton: {
    padding: DesignTokens.spacing[2],
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: DesignTokens.colors.neutral[700],
    marginHorizontal: DesignTokens.spacing[4],
  },
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[1],
    textAlign: 'center',
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    fontFamily: 'SF Mono',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  sectionAction: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  sleepBreakdownCard: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.xl,
    padding: DesignTokens.spacing[5],
    alignItems: 'center',
  },
  sleepStats: {
    width: '100%',
    marginTop: DesignTokens.spacing[6],
  },
  sleepStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  sleepStatLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  sleepStatValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    fontFamily: 'SF Mono',
  },
  goalsContainer: {
    gap: DesignTokens.spacing[3],
  },
  goalCard: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  goalTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginLeft: DesignTokens.spacing[2],
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  goalProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: DesignTokens.spacing[3],
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 4,
  },
  goalProgressText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    fontFamily: 'SF Mono',
    minWidth: 40,
    textAlign: 'right',
  },
  goalValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  goalCurrent: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: 'SF Mono',
  },
  goalTarget: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    fontFamily: 'SF Mono',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[1],
  },
  periodButton: {
    paddingVertical: DesignTokens.spacing[1],
    paddingHorizontal: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
  },
  activePeriodButton: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  periodButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  activePeriodButtonText: {
    color: DesignTokens.colors.text.primary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },
  quickActionButton: {
    flex: 1,
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: DesignTokens.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  quickActionText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginTop: DesignTokens.spacing[2],
  },
  bottomPadding: {
    height: 100,
  },
});
