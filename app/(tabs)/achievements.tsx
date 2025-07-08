import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { AchievementGrid } from '@/components/AchievementGrid';
import { AchievementBadge } from '@/components/AchievementBadge';
import { useAchievements } from '@/hooks/useAchievements';
import { Achievement } from '@/lib/achievementEngine';

export default function AchievementsScreen() {
  const {
    achievements,
    unlockedAchievements,
    recentUnlocks,
    totalPoints,
    isLoading,
    refreshAchievements,
  } = useAchievements();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAchievements();
    setRefreshing(false);
  };

  const handleAchievementPress = (achievement: Achievement) => {
    // Handle achievement press - could show modal with details
    console.log('Achievement pressed:', achievement.name);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.subtitle}>
            {unlockedAchievements.length} of {achievements.length} unlocked
          </Text>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>🏆 {totalPoints.toLocaleString()} points</Text>
          </View>
        </View>

        {/* Recent Unlocks */}
        {recentUnlocks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Unlocks 🎉</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentUnlocks}
            >
              {recentUnlocks.map((achievement) => (
                <View key={achievement.id} style={styles.recentUnlockItem}>
                  <AchievementBadge
                    achievement={achievement}
                    size="medium"
                    onPress={() => handleAchievementPress(achievement)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Achievement Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Achievements</Text>
          <AchievementGrid
            achievements={achievements}
            columns={3}
            showProgress={true}
            showFilters={true}
            onAchievementPress={handleAchievementPress}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  pointsBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  recentUnlocks: {
    paddingRight: 20,
    gap: 12,
  },
  recentUnlockItem: {
    // Individual styling handled by AchievementBadge
  },
});
