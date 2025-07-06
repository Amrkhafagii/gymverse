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
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { DesignTokens } from '@/design-system/tokens';
import { ProfileStatCard } from '@/components/ui/ProfileStatCard';
import { AchievementBadge } from '@/components/ui/AchievementBadge';
import { SettingsGroup } from '@/components/ui/SettingsGroup';
import { Button } from '@/components/ui/Button';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  // Mock user data
  const userData = {
    id: '1',
    name: 'Alex Johnson',
    username: '@alexfitness',
    email: 'alex@example.com',
    joinDate: 'January 2024',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    coverImage: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800',
    isVerified: true,
    level: 25,
    xp: 12847,
    xpToNext: 2153,
    stats: {
      workoutsCompleted: 247,
      totalMinutes: 8420,
      achievements: 34,
      streak: 15,
      followers: 1247,
      following: 892,
      posts: 156,
    },
    weeklyStats: {
      workouts: 6,
      minutes: 420,
      calories: 2840,
      avgHeartRate: 142,
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
      name: 'Cardio Champion',
      description: 'Burn 10,000 calories',
      icon: '🔥',
      rarity: 'rare' as const,
      unlockedAt: '2024-05-05',
    },
    {
      id: '4',
      name: 'Early Bird',
      description: 'Complete 20 morning workouts',
      icon: '🌅',
      rarity: 'common' as const,
      unlockedAt: '2024-04-28',
    },
    {
      id: '5',
      name: 'Marathon Runner',
      description: 'Run 100 miles total',
      icon: '🏃',
      rarity: 'epic' as const,
      progress: { current: 75, target: 100 },
    },
    {
      id: '6',
      name: 'Social Butterfly',
      description: 'Get 100 likes on posts',
      icon: '🦋',
      rarity: 'rare' as const,
      progress: { current: 67, target: 100 },
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <LinearGradient
              colors={['#1a1a1a', '#2a2a2a']}
              style={styles.profileCard}
            >
              {/* Cover Image */}
              <View style={styles.coverContainer}>
                <Image source={{ uri: userData.coverImage }} style={styles.coverImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.6)']}
                  style={styles.coverOverlay}
                />
              </View>

              {/* Profile Info */}
              <View style={styles.profileInfo}>
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: userData.avatar }} style={styles.avatar} />
                  <TouchableOpacity style={styles.cameraButton}>
                    <Camera size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{userData.level}</Text>
                  </View>
                </View>

                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{userData.name}</Text>
                    {userData.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedIcon}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.username}>{userData.username}</Text>
                  <Text style={styles.joinDate}>Member since {userData.joinDate}</Text>
                </View>

                <View style={styles.profileActions}>
                  <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                    <Edit3 size={20} color={DesignTokens.colors.primary[500]} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.shareButton} onPress={handleShareProfile}>
                    <Share2 size={20} color={DesignTokens.colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* XP Progress */}
              <View style={styles.xpContainer}>
                <View style={styles.xpHeader}>
                  <Text style={styles.xpLabel}>Level {userData.level}</Text>
                  <Text style={styles.xpText}>
                    {userData.xp.toLocaleString()} XP
                  </Text>
                </View>
                <View style={styles.xpBar}>
                  <View 
                    style={[
                      styles.xpFill,
                      { width: `${(userData.xp / (userData.xp + userData.xpToNext)) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.xpNext}>
                  {userData.xpToNext.toLocaleString()} XP to level {userData.level + 1}
                </Text>
              </View>

              {/* Social Stats */}
              <View style={styles.socialStats}>
                <TouchableOpacity style={styles.socialStat}>
                  <Text style={styles.socialStatValue}>{userData.stats.posts}</Text>
                  <Text style={styles.socialStatLabel}>Posts</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialStat}>
                  <Text style={styles.socialStatValue}>{userData.stats.followers.toLocaleString()}</Text>
                  <Text style={styles.socialStatLabel}>Followers</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialStat}>
                  <Text style={styles.socialStatValue}>{userData.stats.following}</Text>
                  <Text style={styles.socialStatLabel}>Following</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
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
                title="Avg HR"
                value={`${userData.weeklyStats.avgHeartRate} bpm`}
                subtitle="Heart rate"
                icon={<Heart size={20} color="#E74C3C" />}
                color="#E74C3C"
                trend={{ value: 3, isPositive: false }}
                onPress={() => router.push('/heart-rate-stats')}
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
  profileHeader: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingTop: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[6],
  },
  profileCard: {
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    ...DesignTokens.shadow.lg,
  },
  coverContainer: {
    height: 120,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: DesignTokens.spacing[5],
    paddingTop: DesignTokens.spacing[3],
  },
  avatarContainer: {
    position: 'relative',
    marginRight: DesignTokens.spacing[4],
    marginTop: -30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: DesignTokens.colors.surface.secondary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: DesignTokens.colors.surface.secondary,
  },
  levelBadge: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: DesignTokens.colors.surface.secondary,
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
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginRight: DesignTokens.spacing[2],
  },
  verifiedBadge: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    fontSize: 12,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  username: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginBottom: DesignTokens.spacing[1],
  },
  joinDate: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  profileActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  editButton: {
    backgroundColor: `${DesignTokens.colors.primary[500]}20`,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: DesignTokens.colors.surface.tertiary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpContainer: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingBottom: DesignTokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  xpLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  xpText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  xpBar: {
    height: 8,
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: 4,
    marginBottom: DesignTokens.spacing[2],
  },
  xpFill: {
    height: '100%',
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 4,
  },
  xpNext: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  socialStats: {
    flexDirection: 'row',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
  },
  socialStat: {
    flex: 1,
    alignItems: 'center',
  },
  socialStatValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  socialStatLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
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
