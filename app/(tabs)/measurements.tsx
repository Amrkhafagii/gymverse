import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MeasurementCard } from '@/components/measurements/MeasurementCard';
import { MeasurementChart } from '@/components/measurements/MeasurementChart';
import { AddMeasurementModal } from '@/components/measurements/AddMeasurementModal';
import { useMeasurements } from '@/hooks/useMeasurements';
import { DesignTokens } from '@/design-system/tokens';
import { 
  Ruler, 
  TrendingUp, 
  Calendar, 
  Target,
  Plus,
  BarChart3,
  Activity,
  Settings,
  Filter,
} from 'lucide-react-native';
import { MEASUREMENT_TYPES, getMeasurementTypeById } from '@/lib/measurements/measurementTypes';

type TabType = 'overview' | 'charts' | 'goals' | 'history';
type FilterType = 'all' | 'weight' | 'body' | 'performance';

export default function MeasurementsScreen() {
  const {
    measurements,
    goals,
    stats,
    isLoading,
    error,
    addMeasurement,
    getMeasurementsByType,
    getLatestMeasurement,
    getTrend,
    getProgressData,
    refreshMeasurements,
  } = useMeasurements();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshMeasurements();
    setRefreshing(false);
  };

  const handleAddMeasurements = async (measurementData: any[]) => {
    try {
      for (const data of measurementData) {
        await addMeasurement(data);
      }
      Alert.alert('Success', 'Measurements added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add measurements. Please try again.');
    }
  };

  const getFilteredMeasurementTypes = () => {
    if (selectedFilter === 'all') return MEASUREMENT_TYPES;
    return MEASUREMENT_TYPES.filter(type => type.category === selectedFilter);
  };

  const getLatestMeasurements = () => {
    const filteredTypes = getFilteredMeasurementTypes();
    return filteredTypes
      .map(type => {
        const latest = getLatestMeasurement(type.id);
        const trend = getTrend(type.id, 'month');
        return latest ? { measurement: latest, trend, type } : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b!.measurement.date).getTime() - new Date(a!.measurement.date).getTime());
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

  const FilterButton = ({ filter, label }: { filter: FilterType; label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderOverviewContent = () => {
    const latestMeasurements = getLatestMeasurements();

    return (
      <ScrollView 
        style={styles.overviewContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ruler size={24} color={DesignTokens.colors.primary[500]} />
              </View>
              <Text style={styles.statValue}>{stats.totalMeasurements}</Text>
              <Text style={styles.statLabel}>Total Measurements</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <BarChart3 size={24} color={DesignTokens.colors.success[500]} />
              </View>
              <Text style={styles.statValue}>{stats.measurementTypes}</Text>
              <Text style={styles.statLabel}>Types Tracked</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Calendar size={24} color={DesignTokens.colors.warning[500]} />
              </View>
              <Text style={styles.statValue}>{stats.streakDays}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Activity size={24} color={DesignTokens.colors.info[500]} />
              </View>
              <Text style={styles.statValue}>{stats.averageFrequency.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg/Week</Text>
            </View>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              <FilterButton filter="all" label="All" />
              <FilterButton filter="weight" label="Weight" />
              <FilterButton filter="body" label="Body" />
              <FilterButton filter="performance" label="Performance" />
            </View>
          </ScrollView>
        </View>

        {/* Latest Measurements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Measurements</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={20} color={DesignTokens.colors.text.primary} />
            </TouchableOpacity>
          </View>

          {latestMeasurements.length === 0 ? (
            <View style={styles.emptyState}>
              <Ruler size={48} color={DesignTokens.colors.text.tertiary} />
              <Text style={styles.emptyStateTitle}>No Measurements Yet</Text>
              <Text style={styles.emptyStateText}>
                Start tracking your body measurements to monitor your progress over time
              </Text>
              <TouchableOpacity
                style={styles.addFirstButton}
                onPress={() => setShowAddModal(true)}
              >
                <Plus size={20} color={DesignTokens.colors.text.primary} />
                <Text style={styles.addFirstButtonText}>Add First Measurement</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.measurementsList}>
              {latestMeasurements.slice(0, 6).map(({ measurement, trend }) => (
                <MeasurementCard
                  key={measurement.id}
                  measurement={measurement}
                  trend={trend}
                  showTrend={true}
                  onPress={() => {
                    console.log('View measurement details:', measurement.id);
                  }}
                  onEdit={() => {
                    console.log('Edit measurement:', measurement.id);
                  }}
                  onDelete={() => {
                    console.log('Delete measurement:', measurement.id);
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Quick Add Section */}
        {measurements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Add</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.quickAddRow}>
                {MEASUREMENT_TYPES.slice(0, 6).map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={styles.quickAddCard}
                    onPress={() => setShowAddModal(true)}
                  >
                    <Text style={styles.quickAddIcon}>{type.icon}</Text>
                    <Text style={styles.quickAddLabel}>{type.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderChartsContent = () => {
    const chartTypes = getFilteredMeasurementTypes().filter(type => 
      getMeasurementsByType(type.id).length >= 2
    );

    return (
      <ScrollView 
        style={styles.chartsContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Buttons */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              <FilterButton filter="all" label="All" />
              <FilterButton filter="weight" label="Weight" />
              <FilterButton filter="body" label="Body" />
              <FilterButton filter="performance" label="Performance" />
            </View>
          </ScrollView>
        </View>

        {chartTypes.length === 0 ? (
          <View style={styles.emptyState}>
            <BarChart3 size={48} color={DesignTokens.colors.text.tertiary} />
            <Text style={styles.emptyStateTitle}>No Chart Data</Text>
            <Text style={styles.emptyStateText}>
              Add at least 2 measurements of the same type to see progress charts
            </Text>
          </View>
        ) : (
          <View style={styles.chartsList}>
            {chartTypes.map((type) => {
              const progressData = getProgressData(type.id, 'month');
              return (
                <MeasurementChart
                  key={type.id}
                  data={progressData}
                  title={type.name}
                  unit={type.unit}
                  color={type.color || DesignTokens.colors.primary[500]}
                  height={220}
                  showGrid={true}
                  showPoints={true}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderGoalsContent = () => (
    <ScrollView 
      style={styles.goalsContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Measurement Goals</Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color={DesignTokens.colors.text.primary} />
          </TouchableOpacity>
        </View>

        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Target size={48} color={DesignTokens.colors.text.tertiary} />
            <Text style={styles.emptyStateTitle}>No Goals Set</Text>
            <Text style={styles.emptyStateText}>
              Set measurement goals to stay motivated and track your progress
            </Text>
            <TouchableOpacity style={styles.addFirstButton}>
              <Plus size={20} color={DesignTokens.colors.text.primary} />
              <Text style={styles.addFirstButtonText}>Set First Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.goalsList}>
            {goals.map((goal) => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalIcon}>
                      {getMeasurementTypeById(goal.measurementType)?.icon}
                    </Text>
                    <View>
                      <Text style={styles.goalName}>
                        {getMeasurementTypeById(goal.measurementType)?.name}
                      </Text>
                      <Text style={styles.goalTarget}>
                        Target: {goal.targetValue} {goal.unit}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.goalStatus}>
                    <Text style={styles.goalProgress}>
                      {goal.progress?.toFixed(1)}%
                    </Text>
                  </View>
                </View>
                
                <View style={styles.goalProgressBar}>
                  <View 
                    style={[
                      styles.goalProgressFill,
                      { width: `${Math.min(goal.progress || 0, 100)}%` }
                    ]}
                  />
                </View>
                
                <Text style={styles.goalDeadline}>
                  Due: {new Date(goal.deadline).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderHistoryContent = () => (
    <ScrollView 
      style={styles.historyContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Measurement History</Text>
        
        {measurements.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color={DesignTokens.colors.text.tertiary} />
            <Text style={styles.emptyStateTitle}>No History</Text>
            <Text style={styles.emptyStateText}>
              Your measurement history will appear here as you track your progress
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {measurements
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 20)
              .map((measurement) => (
                <MeasurementCard
                  key={measurement.id}
                  measurement={measurement}
                  trend={getTrend(measurement.type, 'month')}
                  showTrend={false}
                  compact={true}
                  onPress={() => {
                    console.log('View measurement details:', measurement.id);
                  }}
                />
              ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewContent();
      case 'charts':
        return renderChartsContent();
      case 'goals':
        return renderGoalsContent();
      case 'history':
        return renderHistoryContent();
      default:
        return renderOverviewContent();
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshMeasurements}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Body Measurements</Text>
        <TouchableOpacity
          style={styles.headerAddButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color={DesignTokens.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabButtons}>
            <TabButton
              tab="overview"
              label="Overview"
              icon={<BarChart3 size={18} color={activeTab === 'overview' ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />}
            />
            <TabButton
              tab="charts"
              label="Charts"
              icon={<TrendingUp size={18} color={activeTab === 'charts' ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />}
            />
            <TabButton
              tab="goals"
              label="Goals"
              icon={<Target size={18} color={activeTab === 'goals' ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />}
            />
            <TabButton
              tab="history"
              label="History"
              icon={<Calendar size={18} color={activeTab === 'history' ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />}
            />
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Add Measurement Modal */}
      <AddMeasurementModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddMeasurements}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  headerTitle: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  headerAddButton: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: DesignTokens.borderRadius.full,
    padding: DesignTokens.spacing[3],
  },
  tabContainer: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  tabButtons: {
    flexDirection: 'row',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[2],
    gap: DesignTokens.spacing[1],
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[4],
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
  overviewContainer: {
    flex: 1,
  },
  statsContainer: {
    padding: DesignTokens.spacing[5],
    paddingBottom: DesignTokens.spacing[4],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
  },
  statCard: {
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
  statIconContainer: {
    marginBottom: DesignTokens.spacing[2],
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  filtersContainer: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingBottom: DesignTokens.spacing[4],
  },
  filterRow: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  filterButton: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.secondary,
  },
  filterButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  filterButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  filterButtonTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  section: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  addButton: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: DesignTokens.borderRadius.full,
    padding: DesignTokens.spacing[2],
  },
  measurementsList: {
    gap: DesignTokens.spacing[3],
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
    paddingRight: DesignTokens.spacing[5],
  },
  quickAddCard: {
    alignItems: 'center',
    padding: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    backgroundColor: DesignTokens.colors.surface.primary,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickAddIcon: {
    fontSize: 24,
    marginBottom: DesignTokens.spacing[2],
  },
  quickAddLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  chartsContainer: {
    flex: 1,
  },
  chartsList: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingBottom: DesignTokens.spacing[5],
  },
  goalsContainer: {
    flex: 1,
  },
  goalsList: {
    gap: DesignTokens.spacing[3],
  },
  goalCard: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
    flex: 1,
  },
  goalIcon: {
    fontSize: 24,
  },
  goalName: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  goalTarget: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  goalStatus: {
    alignItems: 'flex-end',
  },
  goalProgress: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.primary[500],
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: DesignTokens.borderRadius.sm,
    marginBottom: DesignTokens.spacing[2],
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  goalDeadline: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.tertiary,
  },
  historyContainer: {
    flex: 1,
  },
  historyList: {
    gap: DesignTokens.spacing[2],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[12],
    paddingHorizontal: DesignTokens.spacing[5],
  },
  emptyStateTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[2],
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: DesignTokens.spacing[4],
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.primary[500],
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
  },
  addFirstButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignTokens.spacing[5],
  },
  errorText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.error[500],
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  retryButton: {
    backgroundColor: DesignTokens.colors.primary[500],
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
  },
  retryButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
  },
});
