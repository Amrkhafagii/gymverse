import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Crown, Star, Smartphone, Users, TrendingUp, Award, Target } from 'lucide-react-native';
import { useDeviceAuth } from '@/contexts/DeviceAuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DeviceLeaderboardEntry {
  deviceId: string;
  devicePlatform: string;
  deviceName: string;
  displayName?: string;
  score: number;
  rank: number;
  lastUpdated: string;
  stats: {
    totalWorkouts: number;
    totalExercises: number;
    totalSets: number;
    totalReps: number;
    maxWeight: number;
    streakDays: number;
  };
}

interface LeaderboardCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  scoreType: 'workouts' | 'exercises' | 'sets' | 'reps' | 'weight' | 'streak';
}

const LEADERBOARD_CATEGORIES: LeaderboardCategory[] = [
  {
    id: 'workouts',
    title: 'Total Workouts',
    description: 'Most completed workouts',
    icon: <Target size={20} color="#FF6B35" />,
    scoreType: 'workouts',
  },
  {
    id: 'exercises',
    title: 'Exercise Variety',
    description: 'Most different exercises performed',
    icon: <TrendingUp size={20} color="#4A90E2" />,
    scoreType: 'exercises',
  },
  {
    id: 'sets',
    title: 'Total Sets',
    description: 'Most sets completed',
    icon: <Award size={20} color="#27AE60" />,
    scoreType: 'sets',
  },
  {
    id: 'weight',
    title: 'Max Weight',
    description: 'Highest weight lifted',
    icon: <Trophy size={20} color="#9B59B6" />,
    scoreType: 'weight',
  },
  {
    id: 'streak',
    title: 'Workout Streak',
    description: 'Longest consecutive workout days',
    icon: <Star size={20} color="#FFD700" />,
    scoreType: 'streak',
  },
];

export default function LeaderboardsScreen() {
  const { user, isAuthenticated, updateLastActive } = useDeviceAuth();
  const [selectedCategory, setSelectedCategory] = useState('workouts');
  const [leaderboardData, setLeaderboardData] = useState<DeviceLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userStats, setUserStats] = useState<DeviceLeaderboardEntry | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadLeaderboardData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, selectedCategory]);

  const loadLeaderboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await updateLastActive();

      // Load device-specific leaderboard data
      const leaderboardKey = `device_leaderboard_${selectedCategory}`;
      const userStatsKey = `device_stats_${user.deviceId}`;

      const [storedLeaderboard, storedUserStats] = await Promise.all([
        AsyncStorage.getItem(leaderboardKey),
        AsyncStorage.getItem(userStatsKey),
      ]);

      // Generate mock leaderboard data for demonstration
      // In a real app, this would come from a backend service
      const mockLeaderboardData = generateMockLeaderboardData(selectedCategory);
      
      // Add current user to leaderboard if they have stats
      if (storedUserStats) {
        const userStatsData = JSON.parse(storedUserStats);
        const userEntry = createUserLeaderboardEntry(userStatsData, selectedCategory);
        
        // Insert user into leaderboard and sort
        const combinedData = [...mockLeaderboardData, userEntry];
        const sortedData = sortLeaderboardData(combinedData, selectedCategory);
        
        // Update ranks
        const rankedData = sortedData.map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

        setLeaderboardData(rankedData);
        
        // Find user's rank
        const userRankIndex = rankedData.findIndex(entry => entry.deviceId === user.deviceId);
        setUserRank(userRankIndex >= 0 ? userRankIndex + 1 : null);
        setUserStats(userRankIndex >= 0 ? rankedData[userRankIndex] : null);
      } else {
        // User has no stats yet
        const rankedData = mockLeaderboardData.map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));
        
        setLeaderboardData(rankedData);
        setUserRank(null);
        setUserStats(null);
      }
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockLeaderboardData = (category: string): DeviceLeaderboardEntry[] => {
    // Generate mock data for demonstration
    const mockDevices = [
      { platform: 'iOS', name: 'iPhone 15 Pro', displayName: 'FitnessKing' },
      { platform: 'Android', name: 'Galaxy S24', displayName: 'GymWarrior' },
      { platform: 'iOS', name: 'iPhone 14', displayName: 'IronLifter' },
      { platform: 'Android', name: 'Pixel 8', displayName: 'StrengthMaster' },
      { platform: 'iOS', name: 'iPhone 13', displayName: 'CardioQueen' },
      { platform: 'Android', name: 'OnePlus 12', displayName: 'FlexibilityPro' },
      { platform: 'iOS', name: 'iPad Pro', displayName: 'WorkoutBeast' },
      { platform: 'Android', name: 'Galaxy Tab', displayName: 'FitnessFanatic' },
    ];

    return mockDevices.map((device, index) => {
      const baseScore = Math.floor(Math.random() * 1000) + 500;
      const stats = {
        totalWorkouts: Math.floor(Math.random() * 200) + 50,
        totalExercises: Math.floor(Math.random() * 100) + 20,
        totalSets: Math.floor(Math.random() * 2000) + 500,
        totalReps: Math.floor(Math.random() * 10000) + 2000,
        maxWeight: Math.floor(Math.random() * 200) + 50,
        streakDays: Math.floor(Math.random() * 30) + 5,
      };

      let score = baseScore;
      switch (category) {
        case 'workouts':
          score = stats.totalWorkouts;
          break;
        case 'exercises':
          score = stats.totalExercises;
          break;
        case 'sets':
          score = stats.totalSets;
          break;
        case 'weight':
          score = stats.maxWeight;
          break;
        case 'streak':
          score = stats.streakDays;
          break;
      }

      return {
        deviceId: `mock_device_${index}`,
        devicePlatform: device.platform,
        deviceName: device.name,
        displayName: device.displayName,
        score,
        rank: index + 1,
        lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        stats,
      };
    });
  };

  const createUserLeaderboardEntry = (userStats: any, category: string): DeviceLeaderboardEntry => {
    if (!user) throw new Error('User not authenticated');

    let score = 0;
    switch (category) {
      case 'workouts':
        score = userStats.totalWorkouts || 0;
        break;
      case 'exercises':
        score = userStats.totalExercises || 0;
        break;
      case 'sets':
        score = userStats.totalSets || 0;
        break;
      case 'weight':
        score = userStats.maxWeight || 0;
        break;
      case 'streak':
        score = userStats.streakDays || 0;
        break;
    }

    return {
      deviceId: user.deviceId,
      devicePlatform: user.platform,
      deviceName: user.deviceName,
      displayName: `${user.platform} User`,
      score,
      rank: 0, // Will be calculated after sorting
      lastUpdated: new Date().toISOString(),
      stats: {
        totalWorkouts: userStats.totalWorkouts || 0,
        totalExercises: userStats.totalExercises || 0,
        totalSets: userStats.totalSets || 0,
        totalReps: userStats.totalReps || 0,
        maxWeight: userStats.maxWeight || 0,
        streakDays: userStats.streakDays || 0,
      },
    };
  };

  const sortLeaderboardData = (data: DeviceLeaderboardEntry[], category: string): DeviceLeaderboardEntry[] => {
    return data.sort((a, b) => b.score - a.score);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboardData();
    setRefreshing(false);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color="#FFD700" />;
      case 2:
        return <Trophy size={24} color="#C0C0C0" />;
      case 3:
        return <Award size={24} color="#CD7F32" />;
      default:
        return <Text style={styles.rankNumber}>{rank}</Text>;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'ios':
        return '#007AFF';
      case 'android':
        return '#3DDC84';
      default:
        return '#999';
    }
  };

  const formatScore = (score: number, scoreType: string) => {
    switch (scoreType) {
      case 'weight':
        return `${score}kg`;
      case 'streak':
        return `${score} days`;
      default:
        return score.toString();
    }
  };

  const selectedCategoryData = LEADERBOARD_CATEGORIES.find(cat => cat.id === selectedCategory);

  // Show authentication requirement if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Trophy size={32} color="#FFD700" />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Leaderboards</Text>
                <Text style={styles.headerSubtitle}>Compete with the community</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.authRequiredContainer}>
          <Smartphone size={64} color="#666" />
          <Text style={styles.authRequiredTitle}>Device Authentication Required</Text>
          <Text style={styles.authRequiredText}>
            Your device needs to be authenticated to participate in leaderboards and compete with other users.
          </Text>
          <Text style={styles.authRequiredSubtext}>
            All leaderboard entries are device-based to ensure fair competition and privacy.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Trophy size={32} color="#FFD700" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Leaderboards</Text>
              <Text style={styles.headerSubtitle}>Compete with the community</Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <Crown size={24} color="#FF6B35" />
            <Star size={24} color="#FFD700" style={styles.headerIcon} />
          </View>
        </View>
        
        {/* Device Status */}
        <View style={styles.deviceStatus}>
          <Smartphone size={16} color="#FF6B35" />
          <Text style={styles.deviceStatusText}>
            Competing as {user.platform} • {user.deviceName}
          </Text>
          {userRank && (
            <View style={styles.userRankBadge}>
              <Text style={styles.userRankText}>#{userRank}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Category Selector */}
        <View style={styles.categoryContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {LEADERBOARD_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardActive
                ]}
                onPress={() => handleCategoryChange(category.id)}
              >
                <LinearGradient
                  colors={selectedCategory === category.id ? ['#FF6B35', '#FF8C42'] : ['#1f2937', '#111827']}
                  style={styles.categoryCardGradient}
                >
                  {category.icon}
                  <Text style={[
                    styles.categoryTitle,
                    selectedCategory === category.id && styles.categoryTitleActive
                  ]}>
                    {category.title}
                  </Text>
                  <Text style={[
                    styles.categoryDescription,
                    selectedCategory === category.id && styles.categoryDescriptionActive
                  ]}>
                    {category.description}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* User's Position */}
        {userStats && (
          <View style={styles.userPositionContainer}>
            <Text style={styles.sectionTitle}>Your Position</Text>
            <LinearGradient colors={['#FF6B3520', '#FF6B3510']} style={styles.userPositionCard}>
              <View style={styles.userPositionHeader}>
                <View style={styles.userPositionRank}>
                  {getRankIcon(userStats.rank)}
                </View>
                <View style={styles.userPositionInfo}>
                  <Text style={styles.userPositionName}>{userStats.displayName}</Text>
                  <View style={styles.userPositionDevice}>
                    <View style={[styles.platformIndicator, { backgroundColor: getPlatformColor(userStats.devicePlatform) }]} />
                    <Text style={styles.userPositionDeviceText}>
                      {userStats.devicePlatform} • {userStats.deviceName}
                    </Text>
                  </View>
                </View>
                <View style={styles.userPositionScore}>
                  <Text style={styles.userPositionScoreValue}>
                    {formatScore(userStats.score, selectedCategoryData?.scoreType || 'workouts')}
                  </Text>
                  <Text style={styles.userPositionScoreLabel}>
                    {selectedCategoryData?.title}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Leaderboard List */}
        <View style={styles.leaderboardContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategoryData?.title} Leaderboard
          </Text>
          <Text style={styles.sectionSubtitle}>
            {selectedCategoryData?.description}
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading leaderboard...</Text>
            </View>
          ) : (
            <View style={styles.leaderboardList}>
              {leaderboardData.slice(0, 50).map((entry, index) => (
                <View
                  key={entry.deviceId}
                  style={[
                    styles.leaderboardItem,
                    entry.deviceId === user?.deviceId && styles.leaderboardItemUser,
                    index < 3 && styles.leaderboardItemTop
                  ]}
                >
                  <LinearGradient
                    colors={
                      entry.deviceId === user?.deviceId 
                        ? ['#FF6B3520', '#FF6B3510']
                        : index < 3 
                        ? ['#1f2937', '#111827']
                        : ['#1a1a1a', '#1a1a1a']
                    }
                    style={styles.leaderboardItemGradient}
                  >
                    <View style={styles.leaderboardItemRank}>
                      {getRankIcon(entry.rank)}
                    </View>
                    
                    <View style={styles.leaderboardItemInfo}>
                      <Text style={[
                        styles.leaderboardItemName,
                        entry.deviceId === user?.deviceId && styles.leaderboardItemNameUser
                      ]}>
                        {entry.displayName}
                        {entry.deviceId === user?.deviceId && ' (You)'}
                      </Text>
                      <View style={styles.leaderboardItemDevice}>
                        <View style={[
                          styles.platformIndicator,
                          { backgroundColor: getPlatformColor(entry.devicePlatform) }
                        ]} />
                        <Text style={styles.leaderboardItemDeviceText}>
                          {entry.devicePlatform} • {entry.deviceName}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.leaderboardItemScore}>
                      <Text style={[
                        styles.leaderboardItemScoreValue,
                        entry.deviceId === user?.deviceId && styles.leaderboardItemScoreValueUser
                      ]}>
                        {formatScore(entry.score, selectedCategoryData?.scoreType || 'workouts')}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Competition Info */}
        <View style={styles.infoContainer}>
          <LinearGradient colors={['#1f2937', '#111827']} style={styles.infoCard}>
            <Users size={24} color="#4A90E2" />
            <Text style={styles.infoTitle}>Device-Based Competition</Text>
            <Text style={styles.infoText}>
              Leaderboards are device-based to ensure fair competition and protect your privacy. 
              Each device competes independently with its own fitness data and achievements.
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 12,
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  deviceStatusText: {
    fontSize: 12,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
    flex: 1,
  },
  userRankBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  userRankText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
  },
  authRequiredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  authRequiredTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  authRequiredText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  authRequiredSubtext: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    marginTop: -8,
  },
  categoryCard: {
    width: 160,
    marginRight: 16,
  },
  categoryCardActive: {},
  categoryCardGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryTitleActive: {
    color: '#fff',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  categoryDescriptionActive: {
    color: '#fff',
  },
  userPositionContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  userPositionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  userPositionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  userPositionRank: {
    marginRight: 16,
  },
  userPositionInfo: {
    flex: 1,
  },
  userPositionName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  userPositionDevice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userPositionDeviceText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
  },
  userPositionScore: {
    alignItems: 'flex-end',
  },
  userPositionScoreValue: {
    fontSize: 18,
    color: '#FF6B35',
    fontFamily: 'Inter-Bold',
  },
  userPositionScoreLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  leaderboardContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  leaderboardItemUser: {
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  leaderboardItemTop: {
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  leaderboardItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  leaderboardItemRank: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Bold',
  },
  leaderboardItemInfo: {
    flex: 1,
  },
  leaderboardItemName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  leaderboardItemNameUser: {
    color: '#FF6B35',
  },
  leaderboardItemDevice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  leaderboardItemDeviceText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
  },
  leaderboardItemScore: {
    alignItems: 'flex-end',
  },
  leaderboardItemScoreValue: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  leaderboardItemScoreValueUser: {
    color: '#FF6B35',
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
});
