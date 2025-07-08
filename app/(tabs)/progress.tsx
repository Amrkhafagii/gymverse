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
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { AnalyticsChart, ChartTypeToggle, ChartType } from '@/components/analytics/AnalyticsChart';
import { TrendAnalysis } from '@/components/analytics/TrendAnalysis';
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useAnalytics, AnalyticsTimeframe, AnalyticsMetric } from '@/hooks/useAnalytics';
import { DesignTokens } from '@/design-system/tokens';
import { BarChart3, History, TrendingUp, Trophy, Calendar, Target } from 'lucide-react-native';

type TabType = 'overview' | 'analytics' | 'history' | 'records';

export default function ProgressScreen() {
  const { workouts, refreshHistory, isLoading } = useWorkoutHistory();
  const { refreshPRs } = usePersonalRecords();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [refreshing, setRefreshing] = useState(false);
  
  // Analytics state
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<AnalyticsTimeframe>('month');
  const [chartType, setChartType] = useState<ChartType>('line');
  
  const {
    analyticsData,
    exerciseData,
    summaryStats,
    volumeTrend,
    frequencyTrend,
    exerciseTrend,
    selectedExercise,
    setSelectedExercise,
    selectedMetric,
    setSelectedMetric,
    availableExercises,
    isLoading: analyticsLoading,
    hasData,
  } = useAnalytics(analyticsTimeframe);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshHistory(),
      refreshPRs(),
    ]);
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

  const TimeframeButton = ({ timeframe, label }: { timeframe: AnalyticsTimeframe; label: string }) => (
    <TouchableOpacity
      style={[
        styles.timeframeButton,
        analyticsTimeframe === timeframe && styles.timeframeButtonActive
      ]}
      onPress={() => setAnalyticsTimeframe(timeframe)}
    >
      <Text style={[
        styles.timeframeButtonText,
        analyticsTimeframe === timeframe && styles.timeframeButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const ExerciseButton = ({ exercise }: { exercise: string }) => (
    <TouchableOpacity
      style={[
        styles.exerciseButton,
        selectedExercise === exercise && styles.exerciseButtonActive
      ]}
      onPress={() => setSelectedExercise(selectedExercise === exercise ? null : exercise)}
    >
      <Text style={[
        styles.exerciseButtonText,
        selectedExercise === exercise && styles.exerciseButtonTextActive
      ]}>
        {exercise}
      </Text>
    </TouchableOpacity>
  );

  const MetricButton = ({ metric, label }: { metric: AnalyticsMetric; label: string }) => (
    <TouchableOpacity
      style={[
        styles.metricButton,
        selectedMetric === metric && styles.metricButtonActive
      ]}
      onPress={() => setSelectedMetric(metric)}
    >
      <Text style={[
        styles.metricButtonText,
        selectedMetric === metric && styles.metricButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderAnalyticsContent = () => (
    <ScrollView 
      style={styles.analyticsContainer} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Timeframe Selection */}
      <View style={styles.controlsContainer}>
        <Text style={styles.controlsTitle}>Timeframe</Text>
        <View style={styles.timeframeContainer}>
          <TimeframeButton timeframe="week" label="Week" />
          <TimeframeButton timeframe="month" label="Month" />
          <TimeframeButton timeframe="year" label="Year" />
        </View>
      </View>

      {hasData ? (
        <>
          {/* Summary Stats */}
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{summaryStats.totalWorkouts}</Text>
                <Text style={styles.summaryLabel}>Workouts</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{summaryStats.averageWorkoutsPerWeek}</Text>
                <Text style={styles.summaryLabel}>Per Week</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{summaryStats.uniqueExercises}</Text>
                <Text style={styles.summaryLabel}>Exercises</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  {Math.round(summaryStats.averageWorkoutDuration)}m
                </Text>
                <Text style={styles.summaryLabel}>Avg Duration</Text>
              </View>
            </View>
          </View>

          {/* Chart Type Toggle */}
          <View style={styles.controlsContainer}>
            <ChartTypeToggle chartType={chartType} onTypeChange={setChartType} />
          </View>

          {/* Volume Chart */}
          <AnalyticsChart
            data={analyticsData.volumeData}
            title="Training Volume"
            subtitle={`Total volume over ${analyticsTimeframe}`}
            trend={volumeTrend}
            chartType={chartType}
            color={DesignTokens.colors.primary[500]}
            showTrend={true}
          />

          {/* Frequency Chart */}
          <AnalyticsChart
            data={analyticsData.frequencyData}
            title="Workout Frequency"
            subtitle={`Workouts per ${analyticsTimeframe === 'year' ? 'month' : 'week'}`}
            trend={frequencyTrend}
            chartType={chartType}
            color={DesignTokens.colors.success[500]}
            showTrend={true}
          />

          {/* Exercise Selection */}
          {availableExercises.length > 0 && (
            <View style={styles.controlsContainer}>
              <Text style={styles.controlsTitle}>Exercise Progress</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.exerciseContainer}>
                  {availableExercises.slice(0, 8).map((exercise) => (
                    <ExerciseButton key={exercise} exercise={exercise} />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Exercise Progress Chart */}
          {selectedExercise && (
            <>
              <View style={styles.controlsContainer}>
                <Text style={styles.controlsTitle}>Metric</Text>
                <View style={styles.metricContainer}>
                  <MetricButton metric="weight" label="Weight" />
                  <MetricButton metric="reps" label="Reps" />
                  <MetricButton metric="volume" label="Volume" />
                </View>
              </View>

              <AnalyticsChart
                data={exerciseData}
                title={`${selectedExercise} Progress`}
                subtitle={`${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} over time`}
                trend={exerciseTrend}
                chartType={chartType}
                color={DesignTokens.colors.warning[500]}
                showTrend={true}
              />
            </>
          )}

          {/* Trend Analysis */}
          <View style={styles.trendAnalysisContainer}>
            <TrendAnalysis
              insights={analyticsData.insights}
              trends={{
                volume: volumeTrend,
                frequency: frequencyTrend,
              }}
              onInsightPress={(insight) => {
                console.log('Insight pressed:', insight);
              }}
            />
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <BarChart3 size={48} color={DesignTokens.colors.text.tertiary} />
          <Text style={styles.emptyStateTitle}>No Analytics Data</Text>
          <Text style={styles.emptyStateText}>
            Complete some workouts to see your analytics and progress charts
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <WorkoutStatsOverview />;
      
      case 'analytics':
        return renderAnalyticsContent();
      
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
                      console.log('View workout details:', workout.id);
                    }}
                    onDelete={() => {
                      console.log('Delete workout:', workout.id);
                    }}
                    onShare={() => {
                      console.log('Share workout:', workout.id);
                    }}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        );

      case 'records':
        return (
          <ScrollView 
            style={styles.recordsContainer} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <ProgressDashboard showFilters={true} compactMode={false} />
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
          tab="analytics"
          label="Analytics"
          icon={<TrendingUp size={20} color={activeTab === 'analytics' ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />}
        />
        <TabButton
          tab="history"
          label="History"
          icon={<History size={20} color={activeTab === 'history' ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />}
        />
        <TabButton
          tab="records"
          label="Records"
          icon={<Trophy size={20} color={activeTab === 'records' ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />}
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
  analyticsContainer: {
    flex: 1,
    padding: DesignTokens.spacing[5],
  },
  controlsContainer: {
    marginBottom: DesignTokens.spacing[4],
  },
  controlsTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },
  timeframeContainer: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  timeframeButton: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.secondary,
  },
  timeframeButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  timeframeButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  timeframeButtonTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  summaryContainer: {
    marginBottom: DesignTokens.spacing[6],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[4],
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  summaryLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  exerciseContainer: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
    paddingRight: DesignTokens.spacing[5],
  },
  exerciseButton: {
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  exerciseButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderColor: DesignTokens.colors.primary[500],
  },
  exerciseButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  exerciseButtonTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  metricContainer: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  metricButton: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.secondary,
  },
  metricButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  metricButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  metricButtonTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  trendAnalysisContainer: {
    marginTop: DesignTokens.spacing[4],
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
  recordsContainer: {
    flex: 1,
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
