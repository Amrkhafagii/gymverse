import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Trophy,
  Users,
  TrendingUp,
  Medal,
  Crown,
  Target,
  Calendar,
  Filter,
  ChevronRight,
  Activity,
  Bell,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// Existing imports
import { useSocial } from '@/contexts/SocialContext';
import { useChallenges } from '@/contexts/ChallengeContext';
import { useLeaderboardContext } from '@/contexts/LeaderboardContext';
import SocialHeader from '@/components/social/SocialHeader';
import ActivityFeed from '@/components/social/ActivityFeed';
import ChallengeCard from '@/components/challenges/ChallengeCard';
import ChallengeProgress from '@/components/challenges/ChallengeProgress';
import LeaderboardCard from '@/components/challenges/LeaderboardCard';

// Enhanced social activity feed
import { SocialActivityFeed } from '@/components/social/SocialActivityFeed';

const { width } = Dimensions.get('window');

export default function SocialScreen() {
  const { 
    activities, 
    friends, 
    isLoading: socialLoading, 
    refreshActivities 
  } = useSocial();
  
  const { 
    challenges, 
    userParticipations, 
    isLoading: challengesLoading,
    refreshChallenges 
  } = useChallenges();

  const {
    globalLeaderboard,
    challengeLeaderboards,
    userRankings,
    filters,
    setFilters,
    isLoading: leaderboardLoading,
    refreshLeaderboards,
    getChallengeLeaderboard,
    analytics,
  } = useLeaderboardContext();

  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'leaderboards'>('feed');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshActivities(),
      refreshChallenges(),
      refreshLeaderboards(),
    ]);
    setRefreshing(false);
  };

  const handleTabPress = (tab: 'feed' | 'challenges' | 'leaderboards') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleLeaderboardFilterChange = (newFilters: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters(newFilters);
  };

  const handleActivityPress = (activity: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to activity detail or related screen
  };

  const handleUserPress = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to user profile
  };

  const renderEnhancedFeedSection = () => {
    const unreadActivities = activities.filter(a => !a.isRead).length;
    
    return (
      <View style={styles.feedSection}>
        {/* Activity Summary Header */}
        <View style={styles.activitySummary}>
          <View style={styles.activitySummaryLeft}>
            <Activity size={20} color="#4A90E2" />
            <Text style={styles.activitySummaryTitle}>Recent Activity</Text>
            {unreadActivities > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadActivities}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Open notification settings
            }}
          >
            <Bell size={16} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Enhanced Activity Feed */}
        <SocialActivityFeed
          onActivityPress={handleActivityPress}
          onUserPress={handleUserPress}
          variant="full"
        />

        {/* Activity Insights */}
        <View style={styles.activityInsights}>
          <Text style={styles.insightsTitle}>This Week's Highlights</Text>
          <View style={styles.insightsGrid}>
            <View style={styles.insightItem}>
              <Trophy size={16} color="#FFD700" />
              <Text style={styles.insightValue}>
                {activities.filter(a => a.type === 'achievement').length}
              </Text>
              <Text style={styles.insightLabel}>New Achievements</Text>
            </View>
            <View style={styles.insightItem}>
              <Users size={16} color="#27AE60" />
              <Text style={styles.insightValue}>
                {activities.filter(a => a.type === 'follow').length}
              </Text>
              <Text style={styles.insightLabel}>New Followers</Text>
            </View>
            <View style={styles.insightItem}>
              <Target size={16} color="#9B59B6" />
              <Text style={styles.insightValue}>
                {activities.filter(a => a.type === 'workout').length}
              </Text>
              <Text style={styles.insightLabel}>Workouts Shared</Text>
            </View>
            <View style={styles.insightItem}>
              <TrendingUp size={16} color="#E74C3C" />
              <Text style={styles.insightValue}>
                {activities.filter(a => a.type === 'like').length}
              </Text>
              <Text style={styles.insightLabel}>Likes Received</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Navigate to create post
            }}
          >
            <Text style={styles.quickActionText}>Share Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Navigate to find friends
            }}
          >
            <Text style={styles.quickActionText}>Find Friends</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderLeaderboardOverview = () => {
    const activeChallengeLeaderboards = Object.keys(challengeLeaderboards).slice(0, 3);
    
    return (
      <View style={styles.leaderboardOverview}>
        <View style={styles.leaderboardHeader}>
          <View style={styles.leaderboardHeaderLeft}>
            <Trophy size={24} color="#FFD700" />
            <Text style={styles.leaderboardTitle}>Leaderboards</Text>
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => {
              // Filter modal would open here
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Filter size={16} color="#4A90E2" />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Global Leaderboard Summary */}
        <LeaderboardCard
          type="global"
          timeframe="all-time"
          title="Global Rankings"
          description="Top performers across all challenges"
          topEntries={globalLeaderboard.slice(0, 5).map(entry => ({
            userId: entry.userId,
            displayName: entry.displayName,
            score: entry.totalPoints,
            scoreType: 'points' as const,
            rank: entry.rank,
            isCurrentUser: entry.isCurrentUser,
            progress: {
              percentage: Math.min((entry.totalPoints / 1000) * 100, 100),
              current: entry.totalPoints,
              target: 1000,
            },
            completedAt: entry.activeChallenges > 0 ? undefined : new Date().toISOString(),
          }))}
          totalParticipants={globalLeaderboard.length}
          userRank={userRankings.global}
          compact={true}
        />

        {/* Active Challenge Leaderboards */}
        {activeChallengeLeaderboards.map(challengeId => {
          const challenge = challenges.find(c => c.id === challengeId);
          const leaderboard = getChallengeLeaderboard(challengeId);
          
          if (!challenge || leaderboard.length === 0) return null;

          return (
            <LeaderboardCard
              key={challengeId}
              type="challenge"
              timeframe="all-time"
              title={challenge.title}
              description={`${challenge.category} challenge`}
              topEntries={leaderboard.slice(0, 3)}
              totalParticipants={leaderboard.length}
              userRank={leaderboard.find(entry => entry.isCurrentUser)?.rank}
              compact={true}
            />
          );
        })}

        {/* Leaderboard Analytics */}
        <View style={styles.leaderboardStats}>
          <Text style={styles.statsTitle}>Your Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Crown size={20} color="#FFD700" />
              <Text style={styles.statValue}>{analytics.topRanks}</Text>
              <Text style={styles.statLabel}>Top 3 Finishes</Text>
            </View>
            <View style={styles.statItem}>
              <TrendingUp size={20} color="#27AE60" />
              <Text style={styles.statValue}>{analytics.averageRank}</Text>
              <Text style={styles.statLabel}>Avg Rank</Text>
            </View>
            <View style={styles.statItem}>
              <Users size={20} color="#4A90E2" />
              <Text style={styles.statValue}>{analytics.activeChallengeLeaderboards}</Text>
              <Text style={styles.statLabel}>Active Boards</Text>
            </View>
            <View style={styles.statItem}>
              <Target size={20} color="#9B59B6" />
              <Text style={styles.statValue}>{Math.round(analytics.completionRate)}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderChallengeSection = () => {
    const activeChallenges = userParticipations
      .filter(p => !p.completedAt)
      .map(p => challenges.find(c => c.id === p.challengeId))
      .filter(Boolean)
      .slice(0, 3);

    const featuredChallenges = challenges
      .filter(c => !userParticipations.some(p => p.challengeId === c.id))
      .slice(0, 2);

    return (
      <View style={styles.challengeSection}>
        {/* Active Challenges with Leaderboard Context */}
        {activeChallenges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Active Challenges</Text>
              <TouchableOpacity style={styles.sectionAction}>
                <Text style={styles.sectionActionText}>View All</Text>
                <ChevronRight size={16} color="#4A90E2" />
              </TouchableOpacity>
            </View>
            {activeChallenges.map(challenge => {
              if (!challenge) return null;
              const participation = userParticipations.find(p => p.challengeId === challenge.id);
              const leaderboard = getChallengeLeaderboard(challenge.id);
              const userRank = leaderboard.find(entry => entry.isCurrentUser)?.rank;
              
              return (
                <View key={challenge.id} style={styles.challengeWithLeaderboard}>
                  <ChallengeCard
                    challenge={challenge}
                    participation={participation}
                    compact={true}
                  />
                  {userRank && (
                    <View style={styles.challengeRankBadge}>
                      <Medal size={14} color="#FFD700" />
                      <Text style={styles.challengeRankText}>Rank #{userRank}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Featured Challenges */}
        {featuredChallenges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Challenges</Text>
              <TouchableOpacity style={styles.sectionAction}>
                <Text style={styles.sectionActionText}>Explore</Text>
                <ChevronRight size={16} color="#4A90E2" />
              </TouchableOpacity>
            </View>
            {featuredChallenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                compact={true}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'leaderboards':
        return renderLeaderboardOverview();
      case 'challenges':
        return renderChallengeSection();
      default:
        return renderEnhancedFeedSection();
    }
  };

  return (
    <View style={styles.container}>
      <SocialHeader />
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
          onPress={() => handleTabPress('feed')}
        >
          <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>
            Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
          onPress={() => handleTabPress('challenges')}
        >
          <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>
            Challenges
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'leaderboards' && styles.activeTab]}
          onPress={() => handleTabPress('leaderboards')}
        >
          <Text style={[styles.tabText, activeTab === 'leaderboards' && styles.activeTabText]}>
            Leaderboards
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4A90E2"
            colors={['#4A90E2']}
          />
        }
      >
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4A90E2',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  feedSection: {
    paddingBottom: 100,
  },
  activitySummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  activitySummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activitySummaryTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  unreadBadge: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  notificationButton: {
    padding: 8,
    backgroundColor: '#4A90E220',
    borderRadius: 8,
  },
  activityInsights: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  insightsTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  insightItem: {
    flex: 1,
    minWidth: (width - 80) / 2 - 6,
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  insightValue: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  insightLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  challengeSection: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionActionText: {
    fontSize: 14,
    color: '#4A90E2',
    fontFamily: 'Inter-Medium',
  },
  challengeWithLeaderboard: {
    position: 'relative',
    marginBottom: 12,
  },
  challengeRankBadge: {
    position: 'absolute',
    top: 12,
    right: 32,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFD700',
    gap: 4,
  },
  challengeRankText: {
    fontSize: 12,
    color: '#FFD700',
    fontFamily: 'Inter-Bold',
  },
  leaderboardOverview: {
    paddingBottom: 100,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  leaderboardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leaderboardTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E220',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#4A90E2',
    fontFamily: 'Inter-Medium',
  },
  leaderboardStats: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  statsTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: (width - 80) / 2 - 8,
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});
