import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Trophy,
  Users,
  Target,
  Heart,
  MessageCircle,
  Share2,
  Award,
  TrendingUp,
  Calendar,
  Flame,
  ChevronRight,
  Plus,
} from 'lucide-react-native';

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'leaderboard'>('feed');

  // Mock data
  const feedPosts = [
    {
      id: 1,
      user: {
        name: 'Sarah Johnson',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
        username: '@sarahfits',
      },
      type: 'workout_complete',
      content: 'Just crushed my leg day! 💪 New PR on squats - 185lbs!',
      workout: 'Leg Day Destroyer',
      stats: { duration: 45, calories: 320 },
      likes: 24,
      comments: 8,
      timeAgo: '2h ago',
    },
    {
      id: 2,
      user: {
        name: 'Mike Chen',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
        username: '@mikelifts',
      },
      type: 'achievement',
      content: 'Unlocked the "Consistency King" achievement! 30 days straight! 🔥',
      achievement: 'Consistency King',
      likes: 42,
      comments: 15,
      timeAgo: '4h ago',
    },
    {
      id: 3,
      user: {
        name: 'Emma Wilson',
        avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
        username: '@emmawellness',
      },
      type: 'progress_photo',
      content: '3 months transformation! Feeling stronger than ever 💪',
      likes: 67,
      comments: 23,
      timeAgo: '6h ago',
    },
  ];

  const challenges = [
    {
      id: 1,
      title: '30-Day Push-Up Challenge',
      description: 'Build upper body strength with daily push-ups',
      participants: 1247,
      daysLeft: 12,
      progress: 60,
      reward: '500 XP + Badge',
      color: '#9E7FFF',
    },
    {
      id: 2,
      title: 'January Miles',
      description: 'Run or walk 100 miles this month',
      participants: 892,
      daysLeft: 8,
      progress: 75,
      reward: '750 XP + Trophy',
      color: '#00D4AA',
    },
    {
      id: 3,
      title: 'Strength Builder',
      description: 'Complete 20 strength workouts',
      participants: 634,
      daysLeft: 15,
      progress: 40,
      reward: '1000 XP + Title',
      color: '#FF6B35',
    },
  ];

  const leaderboard = [
    {
      id: 1,
      rank: 1,
      user: {
        name: 'Alex Rodriguez',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
        username: '@alexfitness',
      },
      points: 2847,
      workouts: 28,
      streak: 15,
    },
    {
      id: 2,
      rank: 2,
      user: {
        name: 'Jessica Park',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
        username: '@jessicastrong',
      },
      points: 2634,
      workouts: 25,
      streak: 12,
    },
    {
      id: 3,
      rank: 3,
      user: {
        name: 'David Kim',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
        username: '@davidlifts',
      },
      points: 2521,
      workouts: 24,
      streak: 18,
    },
  ];

  const renderTabButton = (tab: typeof activeTab, title: string, icon: React.ComponentType<any>) => {
    const IconComponent = icon;
    return (
      <TouchableOpacity
        style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
        onPress={() => setActiveTab(tab)}
      >
        <IconComponent size={20} color={activeTab === tab ? '#FFFFFF' : '#A3A3A3'} />
        <Text style={[
          styles.tabButtonText,
          activeTab === tab && styles.tabButtonTextActive
        ]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFeedPost = ({ item }: { item: typeof feedPosts[0] }) => (
    <View style={styles.postCard}>
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.postGradient}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.user.name}</Text>
            <Text style={styles.userHandle}>{item.user.username} • {item.timeAgo}</Text>
          </View>
        </View>

        {/* Post Content */}
        <Text style={styles.postContent}>{item.content}</Text>

        {/* Post Stats */}
        {item.type === 'workout_complete' && item.stats && (
          <View style={styles.workoutStats}>
            <View style={styles.workoutStat}>
              <Target size={16} color="#9E7FFF" />
              <Text style={styles.workoutStatText}>{item.workout}</Text>
            </View>
            <View style={styles.workoutStat}>
              <Calendar size={16} color="#00D4AA" />
              <Text style={styles.workoutStatText}>{item.stats.duration} min</Text>
            </View>
            <View style={styles.workoutStat}>
              <Flame size={16} color="#FF6B35" />
              <Text style={styles.workoutStatText}>{item.stats.calories} cal</Text>
            </View>
          </View>
        )}

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.postAction}>
            <Heart size={20} color="#FF6B35" />
            <Text style={styles.postActionText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <MessageCircle size={20} color="#9E7FFF" />
            <Text style={styles.postActionText}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <Share2 size={20} color="#00D4AA" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderChallengeCard = ({ item }: { item: typeof challenges[0] }) => (
    <TouchableOpacity style={styles.challengeCard}>
      <LinearGradient colors={[`${item.color}20`, `${item.color}10`]} style={styles.challengeGradient}>
        <View style={styles.challengeHeader}>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeTitle}>{item.title}</Text>
            <Text style={styles.challengeDescription}>{item.description}</Text>
          </View>
          <View style={[styles.challengeIcon, { backgroundColor: `${item.color}30` }]}>
            <Trophy size={24} color={item.color} />
          </View>
        </View>

        <View style={styles.challengeStats}>
          <View style={styles.challengeStat}>
            <Users size={16} color="#999" />
            <Text style={styles.challengeStatText}>{item.participants.toLocaleString()} joined</Text>
          </View>
          <View style={styles.challengeStat}>
            <Calendar size={16} color="#999" />
            <Text style={styles.challengeStatText}>{item.daysLeft} days left</Text>
          </View>
        </View>

        <View style={styles.challengeProgress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progress}%`, backgroundColor: item.color }]} />
          </View>
          <Text style={styles.progressText}>{item.progress}% complete</Text>
        </View>

        <View style={styles.challengeReward}>
          <Award size={16} color={item.color} />
          <Text style={styles.rewardText}>{item.reward}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderLeaderboardItem = ({ item }: { item: typeof leaderboard[0] }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        <Text style={[
          styles.rankNumber,
          item.rank === 1 && styles.firstPlace,
          item.rank === 2 && styles.secondPlace,
          item.rank === 3 && styles.thirdPlace,
        ]}>
          {item.rank}
        </Text>
      </View>
      
      <Image source={{ uri: item.user.avatar }} style={styles.leaderboardAvatar} />
      
      <View style={styles.leaderboardInfo}>
        <Text style={styles.leaderboardName}>{item.user.name}</Text>
        <Text style={styles.leaderboardHandle}>{item.user.username}</Text>
      </View>
      
      <View style={styles.leaderboardStats}>
        <Text style={styles.pointsText}>{item.points.toLocaleString()}</Text>
        <Text style={styles.pointsLabel}>points</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Social</Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
            {renderTabButton('feed', 'Feed', Users)}
            {renderTabButton('challenges', 'Challenges', Trophy)}
            {renderTabButton('leaderboard', 'Leaderboard', TrendingUp)}
          </ScrollView>
        </View>

        {/* Tab Content */}
        <View style={styles.content}>
          {activeTab === 'feed' && (
            <FlatList
              data={feedPosts}
              renderItem={renderFeedPost}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.feedContent}
            />
          )}

          {activeTab === 'challenges' && (
            <FlatList
              data={challenges}
              renderItem={renderChallengeCard}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.challengesContent}
            />
          )}

          {activeTab === 'leaderboard' && (
            <View style={styles.leaderboardContainer}>
              <View style={styles.leaderboardHeader}>
                <Text style={styles.leaderboardTitle}>This Month's Top Performers</Text>
                <Text style={styles.leaderboardSubtitle}>Based on workout consistency and achievements</Text>
              </View>
              <FlatList
                data={leaderboard}
                renderItem={renderLeaderboardItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.leaderboardContent}
              />
            </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  addButton: {
    backgroundColor: '#9E7FFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabNavigation: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabScroll: {
    flexGrow: 0,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#262626',
  },
  tabButtonActive: {
    backgroundColor: '#9E7FFF',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  postCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  postGradient: {
    padding: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  userHandle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  postContent: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 16,
  },
  workoutStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  workoutStatText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  postActionText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  challengesContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  challengeCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  challengeGradient: {
    padding: 20,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  challengeInfo: {
    flex: 1,
    marginRight: 16,
  },
  challengeTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  challengeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  challengeStatText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  challengeProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  leaderboardContainer: {
    flex: 1,
  },
  leaderboardHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  leaderboardTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  leaderboardSubtitle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  leaderboardContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  rankContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  firstPlace: {
    color: '#FFD700',
  },
  secondPlace: {
    color: '#C0C0C0',
  },
  thirdPlace: {
    color: '#CD7F32',
  },
  leaderboardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  leaderboardHandle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  leaderboardStats: {
    alignItems: 'flex-end',
  },
  pointsText: {
    fontSize: 18,
    color: '#9E7FFF',
    fontFamily: 'Inter-Bold',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
});
