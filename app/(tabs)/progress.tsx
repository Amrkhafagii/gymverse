import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  TrendingUp,
  Target,
  Award,
  Camera,
  Plus,
  Calendar,
  Zap,
  Eye,
  Share,
  Settings,
  ChevronRight,
  Sparkles
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { DesignTokens } from '@/design-system/tokens';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { MetricCard } from '@/components/ui/MetricCard';
import { AchievementCard } from '@/components/ui/AchievementCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { Button } from '@/components/ui/Button';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'strength' | 'endurance' | 'consistency' | 'milestone';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ProgressPhoto {
  id: string;
  date: string;
  type: 'front' | 'side' | 'back';
  url: string;
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  category: 'weight' | 'strength' | 'endurance' | 'habit';
}

export default function ProgressScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'achievements' | 'photos'>('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Mock data - in real app, this would come from your data context
  const overallProgress = 73; // Percentage towards main goal
  
  const keyMetrics = [
    {
      title: 'Weight Change',
      value: '-5.2',
      unit: 'kg',
      trend: 'down' as const,
      trendValue: '-1.2kg',
      timeframe: 'Last 3 months',
      color: '#4ECDC4',
    },
    {
      title: 'Muscle Gain',
      value: '+2.1',
      unit: 'kg',
      trend: 'up' as const,
      trendValue: '+0.8kg',
      timeframe: 'Last 3 months',
      color: '#9E7FFF',
    },
    {
      title: 'Body Fat',
      value: '18.5',
      unit: '%',
      trend: 'down' as const,
      trendValue: '-2.3%',
      timeframe: 'Last 3 months',
      color: '#F472B6',
    },
  ];

  const chartData = [
    { date: '2024-01-01', value: 75.2, label: 'New Year Start' },
    { date: '2024-01-15', value: 74.8, label: 'First Milestone' },
    { date: '2024-02-01', value: 74.1 },
    { date: '2024-02-15', value: 73.5 },
    { date: '2024-03-01', value: 72.8 },
    { date: '2024-03-15', value: 72.2 },
    { date: '2024-04-01', value: 71.5 },
    { date: '2024-04-15', value: 70.9 },
    { date: '2024-05-01', value: 70.0, label: 'Goal Achieved!' },
  ];

  const recentAchievements: Achievement[] = [
    {
      id: '1',
      name: 'Consistency King',
      description: 'Worked out 30 days in a row',
      icon: '🔥',
      category: 'consistency',
      unlocked: true,
      unlockedAt: '2024-05-01',
      rarity: 'epic',
    },
    {
      id: '2',
      name: 'Strength Milestone',
      description: 'Deadlifted 2x your body weight',
      icon: '💪',
      category: 'strength',
      unlocked: true,
      unlockedAt: '2024-04-28',
      rarity: 'rare',
    },
  ];

  const allAchievements: Achievement[] = [
    ...recentAchievements,
    {
      id: '3',
      name: 'Marathon Ready',
      description: 'Run 42.2km without stopping',
      icon: '🏃',
      category: 'endurance',
      unlocked: false,
      progress: 35,
      maxProgress: 42,
      rarity: 'legendary',
    },
    {
      id: '4',
      name: 'Early Bird',
      description: 'Complete 50 morning workouts',
      icon: '🌅',
      category: 'consistency',
      unlocked: false,
      progress: 32,
      maxProgress: 50,
      rarity: 'common',
    },
    {
      id: '5',
      name: 'Transformation',
      description: 'Lose 10kg and gain 5kg muscle',
      icon: '🎯',
      category: 'milestone',
      unlocked: false,
      progress: 8,
      maxProgress: 10,
      rarity: 'epic',
    },
    {
      id: '6',
      name: 'Flexibility Master',
      description: 'Complete 100 yoga sessions',
      icon: '🧘',
      category: 'endurance',
      unlocked: false,
      progress: 67,
      maxProgress: 100,
      rarity: 'rare',
    },
  ];

  const progressPhotos: ProgressPhoto[] = [
    {
      id: '1',
      date: '2024-05-01',
      type: 'front',
      url: 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '2',
      date: '2024-04-01',
      type: 'front',
      url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '3',
      date: '2024-03-01',
      type: 'front',
      url: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '4',
      date: '2024-02-01',
      type: 'front',
      url: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  const activeGoals: Goal[] = [
    {
      id: '1',
      title: 'Reach Target Weight',
      target: 70,
      current: 72.2,
      unit: 'kg',
      deadline: '2024-06-01',
      category: 'weight',
    },
    {
      id: '2',
      title: 'Bench Press Goal',
      target: 100,
      current: 85,
      unit: 'kg',
      deadline: '2024-07-01',
      category: 'strength',
    },
    {
      id: '3',
      title: 'Daily Steps',
      target: 10000,
      current: 8500,
      unit: 'steps',
      deadline: '2024-12-31',
      category: 'endurance',
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleGoalPress = (goal: Goal) => {
    router.push({
      pathname: '/goal-detail',
      params: { goalId: goal.id }
    });
  };

  const handleAchievementPress = (achievement: Achievement) => {
    router.push({
      pathname: '/achievement-detail',
      params: { achievementId: achievement.id }
    });
  };

  const handlePhotoPress = (photo: ProgressPhoto) => {
    router.push({
      pathname: '/photo-comparison',
      params: { photoId: photo.id }
    });
  };

  const renderTabButton = (tab: typeof activeTab, title: string, icon: React.ReactNode) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      {icon}
      <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Progress Hero */}
      <View style={styles.section}>
        <View style={styles.progressHero}>
          <LinearGradient
            colors={['#1a1a1a', '#2a2a2a']}
            style={styles.progressHeroGradient}
          >
            <View style={styles.progressHeroContent}>
              <CircularProgress
                percentage={overallProgress}
                size={120}
                strokeWidth={8}
                color={DesignTokens.colors.primary[500]}
              >
                <View style={styles.progressCenter}>
                  <Text style={styles.progressPercentage}>{overallProgress}%</Text>
                  <Text style={styles.progressLabel}>Complete</Text>
                </View>
              </CircularProgress>
              
              <View style={styles.progressText}>
                <Text style={styles.progressTitle}>Excellent Progress!</Text>
                <Text style={styles.progressSubtitle}>
                  You're {overallProgress}% towards your transformation goal
                </Text>
                <TouchableOpacity style={styles.updateGoalButton}>
                  <Text style={styles.updateGoalText}>Update Goal</Text>
                  <ChevronRight size={16} color={DesignTokens.colors.primary[500]} />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Key Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          {keyMetrics.map((metric, index) => (
            <MetricCard
              key={index}
              {...metric}
              onPress={() => router.push('/metric-detail')}
            />
          ))}
        </View>
      </View>

      {/* Progress Chart */}
      <View style={styles.section}>
        <View style={styles.chartHeader}>
          <Text style={styles.sectionTitle}>Weight Progress</Text>
          <View style={styles.timeRangeSelector}>
            {(['week', 'month', 'year'] as const).map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeButton,
                  selectedTimeRange === range && styles.timeRangeButtonActive
                ]}
                onPress={() => setSelectedTimeRange(range)}
              >
                <Text style={[
                  styles.timeRangeText,
                  selectedTimeRange === range && styles.timeRangeTextActive
                ]}>
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <InteractiveChart
          data={chartData}
          metric="kg"
          color={DesignTokens.colors.primary[500]}
          height={250}
          onDataPointPress={(point) => {
            Alert.alert('Data Point', `${point.value}kg on ${new Date(point.date).toLocaleDateString()}`);
          }}
        />
      </View>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              <Sparkles size={20} color={DesignTokens.colors.primary[500]} /> Recent Achievements
            </Text>
            <TouchableOpacity onPress={() => setActiveTab('achievements')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              variant="featured"
              onPress={() => handleAchievementPress(achievement)}
              onShare={() => Alert.alert('Share', `Share ${achievement.name} achievement`)}
            />
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Button
            title="Take Progress Photo"
            variant="gradient"
            size="medium"
            onPress={() => router.push('/camera')}
            icon={<Camera size={20} color="#FFFFFF" />}
            style={styles.quickActionButton}
          />
          <Button
            title="Set New Goal"
            variant="secondary"
            size="medium"
            onPress={() => router.push('/goal-creator')}
            icon={<Target size={20} color={DesignTokens.colors.primary[500]} />}
            style={styles.quickActionButton}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderGoals = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          <TouchableOpacity onPress={() => router.push('/goal-creator')}>
            <Plus size={24} color={DesignTokens.colors.primary[500]} />
          </TouchableOpacity>
        </View>
        
        {activeGoals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          const isOverTarget = goal.current > goal.target && goal.category === 'weight';
          const actualProgress = isOverTarget ? ((goal.target - (goal.current - goal.target)) / goal.target) * 100 : progress;
          
          return (
            <TouchableOpacity
              key={goal.id}
              style={styles.goalCard}
              onPress={() => handleGoalPress(goal)}
            >
              <LinearGradient
                colors={['#1a1a1a', '#2a2a2a']}
                style={styles.goalGradient}
              >
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalDeadline}>
                    Due {new Date(goal.deadline).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.goalProgress}>
                  <CircularProgress
                    percentage={Math.min(actualProgress, 100)}
                    size={60}
                    strokeWidth={6}
                    showPercentage={false}
                  >
                    <Text style={styles.goalProgressText}>
                      {Math.round(actualProgress)}%
                    </Text>
                  </CircularProgress>
                  
                  <View style={styles.goalStats}>
                    <Text style={styles.goalCurrent}>
                      {goal.current} {goal.unit}
                    </Text>
                    <Text style={styles.goalTarget}>
                      Target: {goal.target} {goal.unit}
                    </Text>
                    <Text style={styles.goalRemaining}>
                      {isOverTarget 
                        ? `${(goal.current - goal.target).toFixed(1)} ${goal.unit} over target`
                        : `${(goal.target - goal.current).toFixed(1)} ${goal.unit} to go`
                      }
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderAchievements = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Achievements</Text>
        <Text style={styles.sectionSubtitle}>
          {allAchievements.filter(a => a.unlocked).length} of {allAchievements.length} unlocked
        </Text>
        
        <View style={styles.achievementsContainer}>
          {allAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              variant="list"
              onPress={() => handleAchievementPress(achievement)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderPhotos = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Progress Photos</Text>
          <TouchableOpacity onPress={() => router.push('/camera')}>
            <Camera size={24} color={DesignTokens.colors.primary[500]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.photosGrid}>
          {progressPhotos.map((photo) => (
            <TouchableOpacity
              key={photo.id}
              style={styles.photoCard}
              onPress={() => handlePhotoPress(photo)}
            >
              <Image source={{ uri: photo.url }} style={styles.photoImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.photoOverlay}
              >
                <Text style={styles.photoDate}>
                  {new Date(photo.date).toLocaleDateString()}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.photoActions}>
          <Button
            title="Compare Photos"
            variant="secondary"
            size="medium"
            onPress={() => router.push('/photo-comparison')}
            icon={<Eye size={20} color={DesignTokens.colors.primary[500]} />}
            style={styles.photoActionButton}
          />
          <Button
            title="Share Progress"
            variant="secondary"
            size="medium"
            onPress={() => Alert.alert('Share', 'Share your transformation')}
            icon={<Share size={20} color={DesignTokens.colors.primary[500]} />}
            style={styles.photoActionButton}
          />
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>Track your transformation journey</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color={DesignTokens.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          {renderTabButton('overview', 'Overview', <TrendingUp size={18} color={activeTab === 'overview' ? '#FFFFFF' : DesignTokens.colors.text.secondary} />)}
          {renderTabButton('goals', 'Goals', <Target size={18} color={activeTab === 'goals' ? '#FFFFFF' : DesignTokens.colors.text.secondary} />)}
          {renderTabButton('achievements', 'Achievements', <Award size={18} color={activeTab === 'achievements' ? '#FFFFFF' : DesignTokens.colors.text.secondary} />)}
          {renderTabButton('photos', 'Photos', <Camera size={18} color={activeTab === 'photos' ? '#FFFFFF' : DesignTokens.colors.text.secondary} />)}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'goals' && renderGoals()}
          {activeTab === 'achievements' && renderAchievements()}
          {activeTab === 'photos' && renderPhotos()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: DesignTokens.spacing[5],
    paddingTop: DesignTokens.spacing[2],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize['4xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  subtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  settingsButton: {
    padding: DesignTokens.spacing[2],
  },
  tabNavigation: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  tabScroll: {
    flexGrow: 0,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    marginRight: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.secondary,
    gap: DesignTokens.spacing[2],
  },
  tabButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  tabButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  tabButtonTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  content: {
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
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  sectionSubtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[4],
  },
  viewAllText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  progressHero: {
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    ...DesignTokens.shadow.lg,
  },
  progressHeroGradient: {
    padding: DesignTokens.spacing[6],
  },
  progressHeroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[6],
  },
  progressCenter: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  progressLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  progressText: {
    flex: 1,
  },
  progressTitle: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[2],
  },
  progressSubtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 24,
    marginBottom: DesignTokens.spacing[4],
  },
  updateGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  updateGoalText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[1],
  },
  timeRangeButton: {
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  timeRangeButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  timeRangeText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  timeRangeTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
    marginTop: DesignTokens.spacing[4],
  },
  quickActionButton: {
    flex: 1,
  },
  goalCard: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[3],
    ...DesignTokens.shadow.base,
  },
  goalGradient: {
    padding: DesignTokens.spacing[4],
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  goalTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    flex: 1,
  },
  goalDeadline: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[4],
  },
  goalProgressText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  goalStats: {
    flex: 1,
  },
  goalCurrent: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  goalTarget: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  goalRemaining: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  achievementsContainer: {
    marginTop: DesignTokens.spacing[4],
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
    marginTop: DesignTokens.spacing[4],
  },
  photoCard: {
    width: '48%',
    aspectRatio: 3/4,
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    ...DesignTokens.shadow.base,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: DesignTokens.spacing[3],
  },
  photoDate: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  photoActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
    marginTop: DesignTokens.spacing[6],
  },
  photoActionButton: {
    flex: 1,
  },
});
