import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Trophy,
  Users,
  Target,
  Calendar,
  Star,
  Award,
  Zap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LeaderboardType, LeaderboardTimeframe } from '@/lib/challenges/localLeaderboards';
import SocialLeaderboard from './SocialLeaderboard';

const { width } = Dimensions.get('window');

interface LeaderboardTabsProps {
  challengeId?: string;
  defaultType?: LeaderboardType;
  defaultTimeframe?: LeaderboardTimeframe;
}

const TYPE_TABS = [
  {
    id: 'global' as LeaderboardType,
    label: 'Global',
    icon: <Users size={18} color="#9B59B6" />,
    description: 'All users across all challenges',
    gradient: ['#9B59B6', '#8E44AD'],
  },
  {
    id: 'challenge' as LeaderboardType,
    label: 'Challenge',
    icon: <Trophy size={18} color="#E74C3C" />,
    description: 'Specific challenge rankings',
    gradient: ['#E74C3C', '#C0392B'],
  },
  {
    id: 'category' as LeaderboardType,
    label: 'Category',
    icon: <Target size={18} color="#F39C12" />,
    description: 'Category-based rankings',
    gradient: ['#F39C12', '#E67E22'],
  },
];

const TIMEFRAME_TABS = [
  {
    id: 'daily' as LeaderboardTimeframe,
    label: 'Today',
    icon: <Star size={16} color="#FF6B35" />,
    shortLabel: 'Day',
  },
  {
    id: 'weekly' as LeaderboardTimeframe,
    label: 'This Week',
    icon: <Calendar size={16} color="#4A90E2" />,
    shortLabel: 'Week',
  },
  {
    id: 'monthly' as LeaderboardTimeframe,
    label: 'This Month',
    icon: <Award size={16} color="#27AE60" />,
    shortLabel: 'Month',
  },
  {
    id: 'all-time' as LeaderboardTimeframe,
    label: 'All Time',
    icon: <Zap size={16} color="#FFD700" />,
    shortLabel: 'All',
  },
];

export default function LeaderboardTabs({
  challengeId,
  defaultType = 'global',
  defaultTimeframe = 'weekly',
}: LeaderboardTabsProps) {
  const [selectedType, setSelectedType] = useState<LeaderboardType>(defaultType);
  const [selectedTimeframe, setSelectedTimeframe] = useState<LeaderboardTimeframe>(defaultTimeframe);

  const handleTypeChange = (type: LeaderboardType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(type);
  };

  const handleTimeframeChange = (timeframe: LeaderboardTimeframe) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTimeframe(timeframe);
  };

  const renderTypeTab = (tab: typeof TYPE_TABS[0]) => {
    const isSelected = selectedType === tab.id;
    
    return (
      <TouchableOpacity
        key={tab.id}
        style={[styles.typeTab, isSelected && styles.typeTabActive]}
        onPress={() => handleTypeChange(tab.id)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isSelected ? tab.gradient : ['#1a1a1a', '#2a2a2a']}
          style={styles.typeTabGradient}
        >
          <View style={styles.typeTabIcon}>
            {React.cloneElement(tab.icon, {
              color: isSelected ? '#fff' : tab.icon.props.color,
            })}
          </View>
          <Text style={[
            styles.typeTabLabel,
            isSelected && styles.typeTabLabelActive,
          ]}>
            {tab.label}
          </Text>
          <Text style={[
            styles.typeTabDescription,
            isSelected && styles.typeTabDescriptionActive,
          ]}>
            {tab.description}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderTimeframeTab = (tab: typeof TIMEFRAME_TABS[0]) => {
    const isSelected = selectedTimeframe === tab.id;
    
    return (
      <TouchableOpacity
        key={tab.id}
        style={[styles.timeframeTab, isSelected && styles.timeframeTabActive]}
        onPress={() => handleTimeframeChange(tab.id)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isSelected ? ['#FF6B35', '#FF8C42'] : ['#333', '#444']}
          style={styles.timeframeTabGradient}
        >
          {React.cloneElement(tab.icon, {
            color: isSelected ? '#fff' : '#999',
          })}
          <Text style={[
            styles.timeframeTabLabel,
            isSelected && styles.timeframeTabLabelActive,
          ]}>
            {tab.shortLabel}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Type Selector */}
      <View style={styles.typeSelectorContainer}>
        <Text style={styles.sectionTitle}>Leaderboard Type</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeSelector}
        >
          {TYPE_TABS.map(renderTypeTab)}
        </ScrollView>
      </View>

      {/* Timeframe Selector */}
      <View style={styles.timeframeSelectorContainer}>
        <View style={styles.timeframeSelector}>
          {TIMEFRAME_TABS.map(renderTimeframeTab)}
        </View>
      </View>

      {/* Leaderboard Content */}
      <View style={styles.leaderboardContainer}>
        <SocialLeaderboard
          type={selectedType}
          timeframe={selectedTimeframe}
          challengeId={challengeId}
          showFilters={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  typeSelectorContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  typeSelector: {
    paddingRight: 20,
  },
  typeTab: {
    width: width * 0.7,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  typeTabActive: {
    borderColor: 'transparent',
  },
  typeTabGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  typeTabIcon: {
    marginBottom: 12,
  },
  typeTabLabel: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 6,
  },
  typeTabLabelActive: {
    color: '#fff',
  },
  typeTabDescription: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  typeTabDescriptionActive: {
    color: '#fff',
    opacity: 0.8,
  },
  timeframeSelectorContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  timeframeTab: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  timeframeTabActive: {},
  timeframeTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  timeframeTabLabel: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  timeframeTabLabelActive: {
    color: '#fff',
  },
  leaderboardContainer: {
    flex: 1,
  },
});
