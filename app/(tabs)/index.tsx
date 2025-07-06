import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  Clock,
  Flame,
  Award,
  ChevronRight,
  Play,
  Zap,
  Camera,
  Plus
} from 'lucide-react-native';
import { router } from 'expo-router';
import { DesignTokens } from '@/design-system/tokens';
import { StatCard } from '@/components/ui/StatCard';
import { WorkoutCard } from '@/components/ui/WorkoutCard';
import { Button } from '@/components/ui/Button';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 17) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getGreeting = () => {
    const greetings = {
      morning: 'Good morning',
      afternoon: 'Good afternoon', 
      evening: 'Good evening'
    };
    return greetings[timeOfDay as keyof typeof greetings];
  };

  const getMotivationalMessage = () => {
    const messages = {
      morning: 'Ready to start strong? 💪',
      afternoon: 'Time to power through! ⚡',
      evening: 'Let\'s finish the day right! 🔥'
    };
    return messages[timeOfDay as keyof typeof messages];
  };

  const primaryStat = {
    label: 'Current Streak',
    value: '12',
    unit: 'days',
    trend: 'up' as const,
    trendValue: '+3 from last week',
    icon: <Flame size={24} color="#FF6B6B" />,
    color: '#FF6B6B',
  };

  const secondaryStats = [
    { 
      label: 'This Week', 
      value: '4', 
      unit: 'workouts', 
      icon: <Target size={20} color="#4ECDC4" />, 
      color: '#4ECDC4',
      trend: 'up' as const,
      trendValue: '+1'
    },
    { 
      label: 'Total Time', 
      value: '8.5', 
      unit: 'hours', 
      icon: <Clock size={20} color="#45B7D1" />, 
      color: '#45B7D1',
      trend: 'up' as const,
      trendValue: '+2.5h'
    },
    { 
      label: 'PR Count', 
      value: '23', 
      unit: 'records', 
      icon: <Award size={20} color="#96CEB4" />, 
      color: '#96CEB4',
      trend: 'up' as const,
      trendValue: '+2'
    },
  ];

  const recentWorkouts = [
    {
      id: 1,
      name: 'Push Day - Chest & Triceps',
      date: 'Today',
      duration: '45 min',
      exercises: 6,
      image: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Intermediate' as const,
      muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
      lastPerformed: '3 days ago',
    },
    {
      id: 2,
      name: 'Pull Day - Back & Biceps',
      date: 'Yesterday',
      duration: '52 min',
      exercises: 7,
      image: 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=400',
      difficulty: 'Advanced' as const,
      muscleGroups: ['Back', 'Biceps', 'Rear Delts'],
      lastPerformed: '1 week ago',
    },
  ];

  const quickActions = [
    { 
      title: 'Start Workout', 
      subtitle: 'Push Day ready',
      icon: <Play size={20} color="#FFFFFF" />, 
      primary: true,
      action: () => router.push('/(tabs)/workout-session') 
    },
    { 
      title: 'Quick Log', 
      subtitle: 'Track progress',
      icon: <Plus size={20} color="#9E7FFF" />, 
      action: () => router.push('/quick-log') 
    },
    { 
      title: 'Progress Photo', 
      subtitle: 'Capture gains',
      icon: <Camera size={20} color="#9E7FFF" />, 
      action: () => router.push('/progress-photo') 
    },
  ];

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Hero Section */}
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>Alex</Text>
            <Text style={styles.motivationalMessage}>
              {getMotivationalMessage()}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100' }}
              style={styles.profileImage}
            />
            <View style={styles.statusIndicator} />
          </TouchableOpacity>
        </View>

        {/* Primary CTA */}
        <View style={styles.primaryCTA}>
          <Button
            title="Start Today's Workout"
            variant="gradient"
            size="large"
            onPress={() => router.push('/(tabs)/workout-session')}
            icon={<Zap size={24} color="#FFFFFF" />}
            style={styles.startButton}
          />
          <Text style={styles.ctaSubtext}>Push Day • 45 min • 6 exercises</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Progress Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <Text style={styles.sectionSubtitle}>Keep the momentum going</Text>
          
          {/* Primary Stat */}
          <StatCard
            {...primaryStat}
            variant="primary"
            onPress={() => router.push('/(tabs)/progress')}
          />
          
          {/* Secondary Stats Grid */}
          <View style={styles.statsGrid}>
            {secondaryStats.map((stat, index) => (
              <StatCard
                key={index}
                {...stat}
                onPress={() => router.push('/(tabs)/progress')}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.actionsScroll}
          >
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionCard,
                  action.primary && styles.primaryActionCard
                ]}
                onPress={action.action}
              >
                {action.primary ? (
                  <LinearGradient
                    colors={['#9E7FFF', '#7C3AED']}
                    style={styles.actionGradient}
                  >
                    {action.icon}
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.actionContent}>
                    {action.icon}
                    <Text style={styles.secondaryActionTitle}>{action.title}</Text>
                    <Text style={styles.secondaryActionSubtitle}>{action.subtitle}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Text style={styles.sectionSubtitle}>Your latest workouts</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/workout-history')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentWorkouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onPress={() => router.push('/workout-detail')}
              onQuickAction={() => router.push('/repeat-workout')}
              showInsights={true}
            />
          ))}
        </View>

        {/* Achievement Highlight */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.achievementCard}
            onPress={() => router.push('/(tabs)/achievements')}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              style={styles.achievementGradient}
            >
              <View style={styles.achievementContent}>
                <Award size={32} color="#FFFFFF" />
                <View style={styles.achievementText}>
                  <Text style={styles.achievementTitle}>New Achievement!</Text>
                  <Text style={styles.achievementDescription}>
                    Consistency Champion - 7 day streak
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
  },
  hero: {
    paddingTop: 60,
    paddingHorizontal: DesignTokens.spacing[5],
    paddingBottom: DesignTokens.spacing[6],
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[6],
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.regular,
  },
  userName: {
    fontSize: DesignTokens.typography.fontSize['4xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginTop: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[2],
  },
  motivationalMessage: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  profileButton: {
    position: 'relative',
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: DesignTokens.colors.primary[500],
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: DesignTokens.colors.success[500],
    borderWidth: 2,
    borderColor: DesignTokens.colors.surface.primary,
  },
  primaryCTA: {
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
    marginBottom: DesignTokens.spacing[2],
  },
  ctaSubtext: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  content: {
    padding: DesignTokens.spacing[5],
  },
  section: {
    marginBottom: DesignTokens.spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  sectionSubtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.regular,
  },
  seeAllText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
  },
  actionsScroll: {
    marginTop: DesignTokens.spacing[4],
  },
  actionCard: {
    width: 140,
    marginRight: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  primaryActionCard: {
    width: 160,
  },
  actionGradient: {
    padding: DesignTokens.spacing[4],
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    minHeight: 120,
  },
  actionContent: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    padding: DesignTokens.spacing[4],
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    minHeight: 120,
  },
  actionTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    opacity: 0.8,
    textAlign: 'center',
  },
  secondaryActionTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  secondaryActionSubtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  achievementCard: {
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    ...DesignTokens.shadow.lg,
  },
  achievementGradient: {
    padding: DesignTokens.spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  achievementText: {
    marginLeft: DesignTokens.spacing[4],
    flex: 1,
  },
  achievementTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  achievementDescription: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    opacity: 0.9,
  },
});
