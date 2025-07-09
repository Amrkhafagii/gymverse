import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Settings,
  Trophy,
  Target,
  Calendar,
  Bell,
  Shield,
  HelpCircle,
  Star,
  Edit3,
  Camera,
  Share2,
  Award,
  Flame,
  TrendingUp,
  Zap,
  Heart,
  Users,
  BookOpen,
  Moon,
  Volume2,
  Smartphone,
  Lock,
  CreditCard,
  LogOut,
  Download,
  Globe,
  MessageCircle,
  ThumbsUp,
  Eye,
  BarChart3,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { DesignTokens } from '@/design-system/tokens';
import { ProfileStatCard } from '@/components/ui/ProfileStatCard';
import { AchievementBadge } from '@/components/ui/AchievementBadge';
import { SettingsGroup } from '@/components/ui/SettingsGroup';
import { Button } from '@/components/ui/Button';
import { SocialStatsCard } from '@/components/social/SocialStatsCard';
import { SocialProfileCard } from '@/components/social/SocialProfileCard';
import { SocialAnalyticsDashboard } from '@/components/social/SocialAnalyticsDashboard';
import { useSocial } from '@/contexts/SocialContext';
import { usePostComments } from '@/hooks/usePostComments';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const { 
    currentUser, 
    posts, 
    getUserPosts, 
    getUserStats,
    updateProfile,
    myPosts,
  } = useSocial();
  const { getPostComments } = usePostComments();
  
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  // Get user's social data
  const userPosts = getUserPosts(currentUser?.id || '');
  const userStats = getUserStats(currentUser?.id || '');

  // Calculate social metrics
  const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);
  const totalComments = userPosts.reduce((sum, post) => {
    const comments = getPostComments(post.id);
    return sum + comments.length;
  }, 0);
  const totalShares = userPosts.reduce((sum, post) => sum + post.shares, 0);
  const totalViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0);

  // Mock user data (enhanced with social features)
  const userData = {
    id: currentUser?.id || '1',
    name: currentUser?.displayName || 'Alex Johnson',
    username: currentUser?.username || '@alexfitness',
    email: currentUser?.email || 'alex@example.com',
    joinDate: 'January 2024',
    avatar: currentUser?.avatar || 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    coverImage: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800',
    isVerified: true,
    level: 25,
    xp: 12847,
    xpToNext: 2153,
    bio: currentUser?.bio || 'Fitness enthusiast on a journey to better health',
    stats: {
      workoutsCompleted: 247,
      totalMinutes: 8420,
      achievements: 34,
      streak: 15,
      followers: userStats.followers,
      following: userStats.following,
      posts: userPosts.length,
    },
    weeklyStats: {
      workouts: 6,
      minutes: 420,
      calories: 2840,
      avgHeartRate: 142,
    },
    socialStats: {
      posts: userPosts.length,
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      views: totalViews,
      engagementRate: userPosts.length > 0 ? ((totalLikes + totalComments + totalShares) / (userPosts.length * 100)) * 100 : 0,
    },
    goals: {
      weeklyWorkouts: { current: 6, target: 5 },
      monthlyMinutes: { current: 1680, target: 2000 },
      yearlyGoal: { current: 247, target: 365 },
    },
  };

  const achievements = [
    {
      id: '1',
      name: 'Consistency King',
      description: '30 days workout streak',
      icon: '👑',
      rarity: 'legendary' as const,
      unlockedAt: '2024-05-15',
    },
    {
      id: '2',
      name: 'Strength Master',
      description: 'Complete 100 strength workouts',
      icon: '💪',
      rarity: 'epic' as const,
      unlockedAt: '2024-05-10',
    },
    {
      id: '3',
      name: 'Social Butterfly',
      description: 'Get 100 likes on posts',
      icon: '🦋',
      rarity: 'rare' as const,
      unlockedAt: '2024-05-05',
    },
    {
      id: '4',
      name: 'Community Leader',
      description: 'Help 50 community members',
      icon: '🌟',
      rarity: 'epic' as const,
      unlockedAt: '2024-04-28',
    },
    {
      id: '5',
      name: 'Content Creator',
      description: 'Share 25 workout posts',
      icon: '📸',
      rarity: 'rare' as const,
      progress: { current: userPosts.length, target: 25 },
    },
    {
      id: '6',
      name: 'Engagement Master',
      description: 'Receive 500 total likes',
      icon: '❤️',
      rarity: 'epic' as const,
      progress: { current: totalLikes, target: 500 },
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Refresh social data here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleShareProfile = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Share Profile', 'Share your profile with friends!');
  };

  const handleAchievementPress = (achievementId: string) => {
    router.push({
      pathname: '/achievement-detail',
      params: { achievementId }
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            // Handle logout
            Alert.alert('Signed Out', 'You have been signed out successfully.');
          }
        },
      ]
    );
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        {
          id: 'edit-profile',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          icon: <Edit3 size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'navigation' as const,
          onPress: handleEditProfile,
        },
        {
          id: 'social-settings',
          title: 'Social Settings',
          subtitle: 'Manage your social preferences',
          icon: <Users size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'navigation' as const,
          onPress: () => router.push('/social-settings'),
        },
        {
          id: 'goals',
          title: 'Goals & Preferences',
          subtitle: 'Set your fitness goals and preferences',
          icon: <Target size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'navigation' as const,
          onPress: () => router.push('/goals-settings'),
        },
        {
          id: 'achievements',
          title: 'Achievements',
          subtitle: 'View all your fitness milestones',
          icon: <Trophy size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'navigation' as const,
          badge: '34',
          onPress: () => router.push('/achievements'),
        },
      ],
    },
    {
      title: 'Social & Community',
      items: [
        {
          id: 'my-posts',
          title: 'My Posts',
          subtitle: `${userPosts.length} posts shared`,
          icon: <MessageCircle size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'navigation' as const,
          badge: userPosts.length.toString(),
          onPress: () => router.push('/my-posts'),
        },
        {
          id: 'social-analytics',
          title: 'Social Analytics',
          subtitle: 'View your engagement metrics',
          icon: <BarChart3 size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'navigation' as const,
          onPress: () => router.push('/social-analytics'),
        },
        {
          id: 'followers',
          title: 'Followers & Following',
          subtitle: `${userData.stats.followers} followers • ${userData.stats.following} following`,
          icon: <Users size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'navigation' as const,
          onPress: () => router.push('/social-connections'),
        },
        {
          id: 'blocked-users',
          title: 'Blocked Users',
          subtitle: 'Manage blocked accounts',
          icon: <Shield size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'navigation' as const,
          onPress: () => router.push('/blocked-users'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Workout reminders and updates',
          icon: <Bell size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'switch' as const,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          id: 'dark-mode',
          title: 'Dark Mode',
          subtitle: 'App appearance theme',
          icon: <Moon size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'switch' as const,
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
        },
        {
          id: 'sound',
          title: 'Sound Effects',
          subtitle: 'Audio feedback and alerts',
          icon: <Volume2 size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'switch' as const,
          value: soundEnabled,
          onToggle: setSoundEnabled,
        },
        {
          id: 'units',
          title: 'Units & Measurements',
          subtitle: 'Metric or Imperial units',
          icon: <Globe size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'navigation' as const,
          onPress: () => router.push('/units-settings'),
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          id: 'privacy',
          title: 'Privacy Settings',
          subtitle: 'Control your data and visibility',
          icon: <Shield size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'navigation' as const,
          onPress: () => router.push('/privacy-settings'),
        },
        {
          id: 'biometrics',
          title: 'Biometric Authentication',
          subtitle: 'Use Face ID or Touch ID',
          icon: <Lock size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'switch' as const,
          value: biometricsEnabled,
          onToggle: setBiometricsEnabled,
        },
        {
          id: 'data',
          title: 'Data & Storage',
          subtitle: 'Manage your workout data',
          icon: <Download size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'navigation' as const,
          onPress: () => router.push('/data-settings'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help & Support',
          subtitle: 'Get assistance and tutorials',
          icon: <HelpCircle size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'navigation' as const,
          onPress: () => router.push('/help-support'),
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          subtitle: 'Help us improve the app',
          icon: <Star size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'navigation' as const,
          onPress: () => router.push('/feedback'),
        },
        {
          id: 'premium',
          title: 'Upgrade to Premium',
          subtitle: 'Unlock advanced features',
          icon: <CreditCard size={20} color={DesignTokens.colors.primary[500]} />,
          type: 'navigation' as const,
          badge: 'NEW',
          onPress: () => router.push('/premium'),
        },
      ],
    },
    {
      title: 'Account Actions',
      items: [
        {
          id: 'logout',
          title: 'Sign Out',
          subtitle: 'Sign out of your account',
          icon: <LogOut size={20} color={DesignTokens.colors.error[500]} />,
          type: 'action' as const,
          destructive: true,
          onPress: handleLogout,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.gradient}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Enhanced Social Profile Card */}
          <View style={styles.profileSection}>
            <SocialProfileCard
              user={{
                id: userData.id,
                username: userData.username,
                displayName: userData.name,
                avatar: userData.avatar,
                bio: userData.bio,
                isFollowing: false,
                isFollower: false,
                stats: {
                  posts: userData.stats.posts,
                  followers: userData.stats.followers,
                  following: userData.stats.following,
                  workouts: userData.stats.workoutsCompleted,
                  achievements: userData.stats.achievements,
                },
                joinDate: userData.joinDate,
                lastActive: new Date().toISOString(),
              }}
              isCurrentUser={true}
              onEdit={handleEditProfile}
              onShare={handleShareProfile}
              variant="full"
            />
          </View>

          {/* Social Analytics Dashboard */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Social Analytics</Text>
              <TouchableOpacity onPress={() => router.push('/social-analytics')}>
                <Text style={styles.sectionAction}>View Details</Text>
              </TouchableOpacity>
            </View>
            
            <SocialAnalyticsDashboard
              userId={userData.id}
              timeframe="week"
              showComparison={true}
              variant="compact"
            />
          </View>

          {/* Enhanced Social Stats */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Social Impact</Text>
              <TouchableOpacity onPress={() => router.push('/social-analytics')}>
                <Text style={styles.sectionAction}>View Trends</Text>
              </TouchableOpacity>
            </View>
            
            <SocialStatsCard
              title="Community Engagement"
              stats={{
                posts: userData.socialStats.posts,
                likes: userData.socialStats.likes,
                comments: userData.socialStats.comments,
                shares: userData.socialStats.shares,
                views: userData.socialStats.views,
                engagementRate: userData.socialStats.engagementRate,
              }}
              trend={{
                direction: 'up',
                percentage: 15.2,
                timeframe: 'last week',
              }}
              variant="detailed"
            />
          </View>

          {/* Weekly Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.statsGrid}>
              <ProfileStatCard
                title="Workouts"
                value={userData.weeklyStats.workouts}
                subtitle="This week"
                icon={<Target size={20} color="#00D4AA" />}
                color="#00D4AA"
                trend={{ value: 20, isPositive: true }}
                onPress={() => router.push('/workout-history')}
              />
              <ProfileStatCard
                title="Minutes"
                value={userData.weeklyStats.minutes}
                subtitle="Active time"
                icon={<Calendar size={20} color="#9E7FFF" />}
                color="#9E7FFF"
                trend={{ value: 15, isPositive: true }}
                onPress={() => router.push('/time-stats')}
              />
            </View>
            <View style={styles.statsGrid}>
              <ProfileStatCard
                title="Calories"
                value={userData.weeklyStats.calories}
                subtitle="Burned"
                icon={<Flame size={20} color="#FF6B35" />}
                color="#FF6B35"
                trend={{ value: 8, isPositive: true }}
                onPress={() => router.push('/calorie-stats')}
              />
              <ProfileStatCard
                title="Engagement"
                value={`${userData.socialStats.engagementRate.toFixed(1)}%`}
                subtitle="Social rate"
                icon={<Heart size={20} color="#E74C3C" />}
                color="#E74C3C"
                trend={{ value: 12, isPositive: true }}
                onPress={() => router.push('/social-analytics')}
              />
            </View>
          </View>

          {/* Goals Progress */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Goals Progress</Text>
              <TouchableOpacity onPress={() => router.push('/goals-settings')}>
                <Text style={styles.sectionAction}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <LinearGradient
              colors={['#1a1a1a', '#2a2a2a']}
              style={styles.goalsCard}
            >
              <View style={styles.goalItem}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>Weekly Workouts</Text>
                  <Text style={styles.goalValue}>
                    {userData.goals.weeklyWorkouts.current}/{userData.goals.weeklyWorkouts.target}
                  </Text>
                </View>
                <View style={styles.goalBar}>
                  <View 
                    style={[
                      styles.goalFill,
                      { 
                        width: `${Math.min((userData.goals.weeklyWorkouts.current / userData.goals.weeklyWorkouts.target) * 100, 100)}%`,
                        backgroundColor: userData.goals.weeklyWorkouts.current >= userData.goals.weeklyWorkouts.target ? '#10B981' : '#9E7FFF'
                      }
                    ]} 
                  />
                </View>
              </View>

              <View style={styles.goalItem}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>Monthly Minutes</Text>
                  <Text style={styles.goalValue}>
                    {userData.goals.monthlyMinutes.current}/{userData.goals.monthlyMinutes.target}
                  </Text>
                </View>
                <View style={styles.goalBar}>
                  <View 
                    style={[
                      styles.goalFill,
                      { 
                        width: `${(userData.goals.monthlyMinutes.current / userData.goals.monthlyMinutes.target) * 100}%`,
                        backgroundColor: '#FF6B35'
                      }
                    ]} 
                  />
                </View>
              </View>

              <View style={styles.goalItem}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>Yearly Goal</Text>
                  <Text style={styles.goalValue}>
                    {userData.goals.yearlyGoal.current}/{userData.goals.yearlyGoal.target}
                  </Text>
                </View>
                <View style={styles.goalBar}>
                  <View 
                    style={[
                      styles.goalFill,
                      { 
                        width: `${(userData.goals.yearlyGoal.current / userData.goals.yearlyGoal.target) * 100}%`,
                        backgroundColor: '#00D4AA'
                      }
                    ]} 
                  />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Recent Achievements */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Achievements</Text>
              <TouchableOpacity onPress={() => router.push('/achievements')}>
                <Text style={styles.sectionAction}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
              {achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  size="large"
                  showProgress={true}
                  onPress={() => handleAchievementPress(achievement.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Settings Groups */}
          {settingsGroups.map((group, index) => (
            <SettingsGroup
              key={index}
              title={group.title}
              items={group.items}
            />
          ))}

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>GymVerse v2.0.0</Text>
            <Text style={styles.buildText}>Build 2024.05.15</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  profileSection: {
    marginBottom: DesignTokens.spacing[6],
  },
  section: {
    marginBottom: DesignTokens.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  sectionAction: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[3],
  },
  goalsCard: {
    marginHorizontal: DesignTokens.spacing[5],
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[5],
    ...DesignTokens.shadow.base,
  },
  goalItem: {
    marginBottom: DesignTokens.spacing[4],
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  goalTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  goalValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  goalBar: {
    height: 8,
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: 4,
  },
  goalFill: {
    height: '100%',
    borderRadius: 4,
  },
  achievementsScroll: {
    paddingLeft: DesignTokens.spacing[3],
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[6],
  },
  versionText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  buildText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.tertiary,
    marginTop: DesignTokens.spacing[1],
  },
});
