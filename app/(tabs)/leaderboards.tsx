import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import LeaderboardList from '@/components/LeaderboardList';
import { Trophy, Crown, Star } from 'lucide-react-native';

export default function LeaderboardsScreen() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('weekly_points');

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
      </LinearGradient>

      <LeaderboardList
        currentUserId={user?.id}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />
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
});
