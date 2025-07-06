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
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  Trophy,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Heart,
  MessageCircle,
  Share2,
  Flame,
  Target,
  Award,
  Camera,
  Bell,
  Settings,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { DesignTokens } from '@/design-system/tokens';
import { PostCard } from '@/components/ui/PostCard';
import { ChallengeCard } from '@/components/ui/ChallengeCard';
import { LeaderboardCard } from '@/components/ui/LeaderboardCard';
import { Button } from '@/components/ui/Button';
import * as Haptics from 'expo-haptics';

// Mock data interfaces
interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified?: boolean;
  level?: number;
}

interface Post {
  id: string;
  user: User;
  type: 'workout_complete' | 'achievement' | 'progress_photo' | 'milestone' | 'challenge';
  content: string;
  workout?: string;
  stats?: {
    duration: number;
    calories: number;
    exercises?: number;
    sets?: number;
  };
  achievement?: {
    name: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  };
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
  isLiked?: boolean;
  location?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'community';
  category: 'strength' | 'cardio' | 'consistency' | 'distance' | 'time';
  participants: number;
  maxParticipants?: number;
  duration: {
    start: string;
    end: string;
    daysLeft: number;
  };
  progress?: {
    current: number;
    target: number;
    unit: string;
  };
  reward: {
    points: number;
    badge?: string;
    title?: string;
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isJoined?: boolean;
  isCompleted?: boolean;
  image?: string;
  color: string;
}

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

export default function SocialScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'leaderboard'>('feed');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data
  const feedPosts: Post[] = [
    {
      id: '1',
      user: {
        id: '1',
        name: 'Sarah Johnson',
        username: '@sarahfits',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
        isVerified: true,
        level: 15,
      },
      type: 'workout_complete',
      content: 'Just crushed my leg day! 💪 New PR on squats - 185lbs! Feeling stronger than ever and ready to take on the world. The grind never stops! 🔥',
      workout: 'Leg Day Destroyer',
      stats: { duration: 45, calories: 320, exercises: 8, sets: 24 },
      likes: 47,
      comments: 12,
      shares: 3,
      timeAgo: '2h ago',
      isLiked: false,
      location: 'PowerHouse Gym',
    },
    {
      id: '2',
      user: {
        id: '2',
        name: 'Mike Chen',
        username: '@mikelifts',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
        level: 22,
      },
      type: 'achievement',
      content: 'Unlocked the "Consistency King" achievement! 30 days straight of workouts! 🔥 This journey has been incredible and I\'m just getting started. Thanks to everyone for the motivation!',
      achievement: {
        name: 'Consistency King',
        icon: '👑',
        rarity: 'epic',
      },
      likes: 89,
      comments: 23,
      shares: 8,
      timeAgo: '4h ago',
      isLiked: true,
    },
    {
      id: '3',
      user: {
        id: '3',
        name: 'Emma Wilson',
        username: '@emmawellness',
        avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
        isVerified: true,
        level: 18,
      },
      type: 'progress_photo',
      content: '3 months transformation! Feeling stronger than ever 💪 The journey isn\'t just about the physical changes, but the mental strength I\'ve gained along the way.',
      media: {
        type: 'image',
        url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      likes: 156,
      comments: 34,
      shares: 12,
      timeAgo: '6h ago',
      isLiked: false,
    },
    {
      id: '4',
      user: {
        id: '4',
        name: 'Alex Rodriguez',
        username: '@alexfitness',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
        level: 25,
      },
      type: 'milestone',
      content: 'Hit my 1000th workout today! 🎯 What started as a New Year\'s resolution has become a lifestyle. Here\'s to the next 1000! 💪',
      likes: 203,
      comments: 45,
      shares: 18,
      timeAgo: '8h ago',
      isLiked: true,
    },
  ];

  const challenges: Challenge[] = [
    {
      id: '1',
      title: '30-Day Push-Up Challenge',
      description: 'Build upper body strength with daily push-ups. Start with your current max and increase by 2 each day!',
      type: 'community',
      category: 'strength',
      participants: 1247,
      duration: {
        start: '2024-05-01',
        end: '2024-05-31',
        daysLeft: 12,
      },
      progress: {
        current: 18,
        target: 30,
        unit: 'days',
      },
      reward: {
        points: 500,
        badge: 'Push-Up Master',
      },
      difficulty: 'intermediate',
      isJoined: true,
      color: '#9E7FFF',
      image: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '2',
      title: 'January Miles',
      description: 'Run or walk 100 miles this month. Track your progress and compete with friends!',
      type: 'individual',
      category: 'cardio',
      participants: 892,
      duration: {
        start: '2024-05-01',
        end: '2024-05-31',
        daysLeft: 8,
      },
      progress: {
        current: 75,
        target: 100,
        unit: 'miles',
      },
      reward: {
        points: 750,
        badge: 'Distance Destroyer',
        title: 'Marathon Warrior',
      },
      difficulty: 'advanced',
      isJoined: false,
      color: '#00D4AA',
    },
    {
      id: '3',
      title: 'Strength Builder',
      description: 'Complete 20 strength workouts this month. Focus on progressive overload!',
      type: 'community',
      category: 'strength',
      participants: 634,
      duration: {
        start: '2024-05-01',
        end: '2024-05-31',
        daysLeft: 15,
      },
      progress: {
        current: 8,
        target: 20,
        unit: 'workouts',
      },
      reward: {
        points: 1000,
        badge: 'Strength Master',
      },
      difficulty: 'beginner',
      isJoined: true,
      color: '#FF6B35',
    },
  ];

  const leaderboard: LeaderboardUser[] = [
    {
      id: '1',
      name: 'Alex Rodriguez',
      username: '@alexfitness',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
      rank: 1,
      previousRank: 2,
      points: 2847,
      level: 25,
      streak: 15,
      workoutsThisWeek: 6,
      badge: {
        name: 'Elite',
        color: '#FFD700',
      },
    },
    {
      id: '2',
      name: 'Jessica Park',
      username: '@jessicastrong',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      rank: 2,
      previousRank: 1,
      points: 2634,
      level: 23,
      streak: 12,
      workoutsThisWeek: 5,
    },
    {
      id: '3',
      name: 'David Kim',
      username: '@davidlifts',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
      rank: 3,
      previousRank: 3,
      points: 2521,
      level: 21,
      streak: 18,
      workoutsThisWeek: 4,
    },
    {
      id: '4',
      name: 'You',
      username: '@yourhandle',
      avatar: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
      rank: 7,
      previousRank: 9,
      points: 1892,
      level: 16,
      streak: 8,
      workoutsThisWeek: 3,
    },
    {
      id: '5',
      name: 'Maria Santos',
      username: '@mariafits',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
      rank: 8,
      previousRank: 6,
      points: 1756,
      level: 14,
      streak: 5,
      workoutsThisWeek: 4,
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handlePostLike = async (postId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Handle like logic
  };

  const handlePostComment = (postId: string) => {
    router.push({
      pathname: '/post-detail',
      params: { postId }
    });
  };

  const handlePostShare = (postId: string) => {
    Alert.alert('Share Post', 'Share this post with your friends!');
  };

  const handleUserPress = (userId: string) => {
    router.push({
      pathname: '/user-profile',
      params: { userId }
    });
  };

  const handlePostPress = (postId: string) => {
    router.push({
      pathname: '/post-detail',
      params: { postId }
    });
  };

  const handleChallengePress = (challengeId: string) => {
    router.push({
      pathname: '/challenge-detail',
      params: { challengeId }
    });
  };

  const handleChallengeJoin = async (challengeId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Join Challenge', 'You have joined the challenge!');
  };

  const renderTabButton = (tab: typeof activeTab, title: string, icon: React.ComponentType<any>, count?: number) => {
    const IconComponent = icon;
    return (
      <TouchableOpacity
        style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
        onPress={() => setActiveTab(tab)}
      >
        <View style={styles.tabIconContainer}>
          <IconComponent size={20} color={activeTab === tab ? '#FFFFFF' : DesignTokens.colors.text.secondary} />
          {count && count > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{count > 99 ? '99+' : count}</Text>
            </View>
          )}
        </View>
        <Text style={[
          styles.tabButtonText,
          activeTab === tab && styles.tabButtonTextActive
        ]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFeedPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onLike={handlePostLike}
      onComment={handlePostComment}
      onShare={handlePostShare}
      onUserPress={handleUserPress}
      onPostPress={handlePostPress}
    />
  );

  const renderChallenge = ({ item }: { item: Challenge }) => (
    <ChallengeCard
      challenge={item}
      onPress={() => handleChallengePress(item.id)}
      onJoin={() => handleChallengeJoin(item.id)}
      variant="detailed"
    />
  );

  const renderLeaderboardUser = ({ item, index }: { item: LeaderboardUser; index: number }) => (
    <LeaderboardCard
      user={item}
      onPress={() => handleUserPress(item.id)}
      variant={index < 3 ? 'podium' : 'list'}
      isCurrentUser={item.name === 'You'}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Social</Text>
            <Text style={styles.subtitle}>Connect with your fitness community</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Bell size={24} color={DesignTokens.colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/create-post')}
            >
              <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color={DesignTokens.colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search posts, users, challenges..."
              placeholderTextColor={DesignTokens.colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={showFilters ? '#FFFFFF' : DesignTokens.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
            {renderTabButton('feed', 'Feed', Users, 5)}
            {renderTabButton('challenges', 'Challenges', Trophy, 3)}
            {renderTabButton('leaderboard', 'Leaderboard', TrendingUp)}
          </ScrollView>
        </View>

        {/* Tab Content */}
        <View style={styles.content}>
          {activeTab === 'feed' && (
            <FlatList
              data={feedPosts}
              renderItem={renderFeedPost}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={styles.feedContent}
              ListHeaderComponent={
                <View style={styles.feedHeader}>
                  <Text style={styles.feedHeaderText}>Latest from your community</Text>
                </View>
              }
            />
          )}

          {activeTab === 'challenges' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {/* Featured Challenge */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Featured Challenge</Text>
                <ChallengeCard
                  challenge={challenges[0]}
                  onPress={() => handleChallengePress(challenges[0].id)}
                  onJoin={() => handleChallengeJoin(challenges[0].id)}
                  variant="featured"
                />
              </View>

              {/* All Challenges */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>All Challenges</Text>
                {challenges.slice(1).map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onPress={() => handleChallengePress(challenge.id)}
                    onJoin={() => handleChallengeJoin(challenge.id)}
                    variant="detailed"
                  />
                ))}
              </View>

              {/* Create Challenge */}
              <View style={styles.section}>
                <Button
                  title="Create Your Own Challenge"
                  variant="secondary"
                  size="large"
                  onPress={() => router.push('/create-challenge')}
                  icon={<Plus size={20} color={DesignTokens.colors.primary[500]} />}
                />
              </View>
            </ScrollView>
          )}

          {activeTab === 'leaderboard' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {/* Leaderboard Header */}
              <View style={styles.leaderboardHeader}>
                <Text style={styles.leaderboardTitle}>This Month's Champions</Text>
                <Text style={styles.leaderboardSubtitle}>
                  Based on workout consistency, achievements, and community engagement
                </Text>
              </View>

              {/* Top 3 Podium */}
              <View style={styles.podiumContainer}>
                <View style={styles.podiumRow}>
                  {leaderboard.slice(0, 3).map((user, index) => (
                    <LeaderboardCard
                      key={user.id}
                      user={user}
                      onPress={() => handleUserPress(user.id)}
                      variant="podium"
                    />
                  ))}
                </View>
              </View>

              {/* Rest of Leaderboard */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Full Rankings</Text>
                {leaderboard.slice(3).map((user) => (
                  <LeaderboardCard
                    key={user.id}
                    user={user}
                    onPress={() => handleUserPress(user.id)}
                    variant="list"
                    isCurrentUser={user.name === 'You'}
                  />
                ))}
              </View>
            </ScrollView>
          )}
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingTop: DesignTokens.spacing[2],
    paddingBottom: DesignTokens.spacing[4],
  },
  headerLeft: {
    flex: 1,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  headerButton: {
    padding: DesignTokens.spacing[2],
  },
  createButton: {
    backgroundColor: DesignTokens.colors.primary[500],
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignTokens.shadow.base,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
    gap: DesignTokens.spacing[3],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    gap: DesignTokens.spacing[3],
  },
  searchInput: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
  },
  filterButton: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
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
  tabIconContainer: {
    position: 'relative',
  },
  tabBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: DesignTokens.colors.error[500],
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[1],
  },
  tabBadgeText: {
    fontSize: 10,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
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
  feedContent: {
    paddingBottom: 100,
  },
  feedHeader: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingBottom: DesignTokens.spacing[4],
  },
  feedHeaderText: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  section: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[4],
  },
  leaderboardHeader: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingBottom: DesignTokens.spacing[4],
    alignItems: 'center',
  },
  leaderboardTitle: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  leaderboardSubtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  podiumContainer: {
    paddingHorizontal: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[6],
  },
  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: DesignTokens.spacing[2],
  },
});
