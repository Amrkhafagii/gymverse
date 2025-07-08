import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { WorkoutStatsOverview } from '@/components/workout/WorkoutStatsOverview';
import { WorkoutHistoryCard } from '@/components/workout/WorkoutHistoryCard';
import { ExerciseProgressChart } from '@/components/workout/ExerciseProgressChart';
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';
import { DesignTokens } from '@/design-system/tokens';
import { BarChart3, History, TrendingUp } from 'lucide-react-native';

type TabType = 'overview' | 'history' | 'progress';

export default function ProgressScreen() {
  const { workouts, refreshHistory, isLoading } = useWorkoutHistory();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshHistory();
    setRefreshing(false);
  };

  const TabButton = ({ tab, label, icon }: { tab: TabType; label: string; icon: React.ReactNode }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.tabButtonActive
      ]}
      onPress={() => setActiveTab(tab)}
    >
      {icon}
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.tabButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <WorkoutStatsOverview />;
      
      case 'history':
        return (
          <ScrollView style={styles.historyContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Workout History</Text>
              <Text style={styles.historySubtitle}>
                {workouts.length} workout{workouts.length !== 1 ? 's' : ''} completed
              </Text>
            </View>
            
            {workouts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📊</Text>
                <Text style={styles.emptyStateTitle}>No workouts yet</Text>
                <Text style={styles.emptyStateText}>
                  Complete your first workout to see your history here
                </Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                {workouts.map((workout) => (
                  <WorkoutHistoryCard
                    key={workout.id}
                    workout={workout}
                    onPress={() => {
                      // Handle workout details view
                      console.log('View workout details:', workout.id);
                    }}
                    onDelete={() => {
                      // Handle workout deletion
                      console.log('Delete workout:', workout.id);
                    }}
                    onShare={() => {
                      // Handle workout sharing
                      console.log('Share workout:', workout.id);
                    }}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        );
      
      case 'progress':
        return (
          <ScrollView style={styles.progressContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Exercise Progress</Text>
              <Text style={styles.progressSubtitle}>
                Track your improvement over time
              </Text>
            </View>
            
            {/* Sample exercise progress charts */}
            <ExerciseProgressChart
              exerciseName="Bench Press"
              data={[
                { date: '2024-01-01', value: 80 },
                { date: '2024-01-08', value: 82.5 },
                { date: '2024-01-15', value: 85 },
                { date: '2024-01-22', value: 87.5 },
                { date: '2024-01-29', value: 90 },
              ]}
              metric="weight"
              timeframe="month"
              onTimeframeChange={(timeframe) => {
                console.log('Timeframe changed:', timeframe);
              }}
            />
            
            <ExerciseProgressChart
              exerciseName="Squat"
              data={[
                { date: '2024-01-01', value: 100 },
                { date: '2024-01-08', value: 105 },
                { date: '2024-01-15', value: 110 },
                { date: '2024-01-22', value: 115 },
                { date: '2024-01-29', value: 120 },
              ]}
              metric="weight"
              timeframe="month"
              onTimeframeChange={(timeframe) => {
                console.log('Timeframe changed:', timeframe);
              }}
            />
          </ScrollView>
        );
      
      default:
        return <WorkoutStatsOverview />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton
          tab="overview"
          label="Overview"
          icon={<BarChart3 size={20} color={activeTab === 'overview' ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />}
        />
        <TabButton
          tab="history"
          label="History"
          icon={<History size={20} color={activeTab === 'history' ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />}
        />
        <TabButton
          tab="progress"
          label="Progress"
          icon={<TrendingUp size={20} color={activeTab === 'progress' ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.colors.surface.secondary,
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
  },
  tabButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
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
  historyContainer: {
    flex: 1,
  },
  historyHeader: {
    padding: DesignTokens.spacing[5],
    paddingBottom: DesignTokens.spacing[4],
  },
  historyTitle: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  historySubtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  historyList: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingBottom: DesignTokens.spacing[5],
  },
  progressContainer: {
    flex: 1,
  },
  progressHeader: {
    padding: DesignTokens.spacing[5],
    paddingBottom: DesignTokens.spacing[4],
  },
  progressTitle: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  progressSubtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[12],
    paddingHorizontal: DesignTokens.spacing[5],
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: DesignTokens.spacing[4],
  },
  emptyStateTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[2],
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
