import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus,
  Ruler,
  TrendingUp,
  Calendar,
  Target,
  Bell,
  BarChart3,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useMeasurementContext } from '@/contexts/MeasurementContext';
import { AddMeasurementModal } from '@/components/measurements/AddMeasurementModal';
import { MeasurementCard } from '@/components/measurements/MeasurementCard';
import { MeasurementChart } from '@/components/measurements/MeasurementChart';
import { getMeasurementTypeById, getDefaultMeasurementTypes } from '@/lib/measurements/measurementTypes';

type TabType = 'overview' | 'history' | 'trends';

export default function MeasurementsScreen() {
  const {
    measurements,
    stats,
    isLoading,
    addMeasurement,
    deleteMeasurement,
    getTrend,
    getLatestMeasurement,
    getMeasurementsByType,
    getProgressData,
    refreshMeasurements,
  } = useMeasurementContext();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
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
    } catch (error) {
      console.error('Error adding measurements:', error);
      Alert.alert('Error', 'Failed to add measurements');
    }
  };

  const handleDeleteMeasurement = (measurementId: string) => {
    Alert.alert(
      'Delete Measurement',
      'Are you sure you want to delete this measurement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMeasurement(measurementId),
        },
      ]
    );
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

  const renderOverview = () => {
    const defaultTypes = getDefaultMeasurementTypes();
    const recentMeasurements = measurements
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);

    return (
      <ScrollView 
        style={styles.tabContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ruler size={24} color={DesignTokens.colors.primary[500]} />
              <Text style={styles.statValue}>{stats.totalMeasurements}</Text>
              <Text style={styles.statLabel}>Total Measurements</Text>
            </View>
            
            <View style={styles.statCard}>
              <BarChart3 size={24} color={DesignTokens.colors.success[500]} />
              <Text style={styles.statValue}>{stats.measurementTypes}</Text>
              <Text style={styles.statLabel}>Types Tracked</Text>
            </View>
            
            <View style={styles.statCard}>
              <TrendingUp size={24} color={DesignTokens.colors.warning[500]} />
              <Text style={styles.statValue}>{stats.streakDays}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            
            <View style={styles.statCard}>
              <Calendar size={24} color={DesignTokens.colors.info[500]} />
              <Text style={styles.statValue}>
                {stats.averageFrequency.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Per Week</Text>
            </View>
          </View>
        </View>

        {/* Quick Add Default Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Measurements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickAddContainer}>
              {defaultTypes.map(type => {
                const latest = getLatestMeasurement(type.id);
                const trend = getTrend(type.id, 'month');
                
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={styles.quickAddCard}
                    onPress={() => setShowAddModal(true)}
                  >
                    <Text style={styles.quickAddIcon}>{type.icon}</Text>
                    <Text style={styles.quickAddName}>{type.name}</Text>
                    {latest ? (
                      <Text style={styles.quickAddValue}>
                        {latest.value.toFixed(1)} {type.unit}
                      </Text>
                    ) : (
                      <Text style={styles.quickAddEmpty}>No data</Text>
                    )}
                    {trend && (
                      <View style={[
                        styles.quickAddTrend,
                        { backgroundColor: trend.trend === 'up' ? DesignTokens.colors.success[500] : 
                          trend.trend === 'down' ? DesignTokens.colors.error[500] : 
                          DesignTokens.colors.neutral[500] }
                      ]}>
                        <Text style={styles.quickAddTrendText}>
                          {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Recent Measurements */}
        {recentMeasurements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Measurements</Text>
            {recentMeasurements.map(measurement => {
              const trend = getTrend(measurement.type, 'month');
              return (
                <MeasurementCard
                  key={measurement.id}
                  measurement={measurement}
                  trend={trend}
                  onDelete={() => handleDeleteMeasurement(measurement.id)}
                  compact
                />
              );
            })}
          </View>
        )}

        {measurements.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📏</Text>
            <Text style={styles.emptyStateTitle}>No measurements yet</Text>
            <Text style={styles.emptyStateText}>
              Start tracking your body measurements to see your progress over time
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.emptyStateButtonText}>Add First Measurement</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderHistory = () => {
    const sortedMeasurements = measurements
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <ScrollView 
        style={styles.tabContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Measurements</Text>
          {sortedMeasurements.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📊</Text>
              <Text style={styles.emptyStateTitle}>No measurement history</Text>
              <Text style={styles.emptyStateText}>
                Your measurement history will appear here
              </Text>
            </View>
          ) : (
            sortedMeasurements.map(measurement => {
              const trend = getTrend(measurement.type, 'month');
              return (
                <MeasurementCard
                  key={measurement.id}
                  measurement={measurement}
                  trend={trend}
                  onDelete={() => handleDeleteMeasurement(measurement.id)}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    );
  };

  const renderTrends = () => {
    const trackedTypes = [...new Set(measurements.map(m => m.type))];

    return (
      <ScrollView 
        style={styles.tabContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Charts</Text>
          {trackedTypes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📈</Text>
              <Text style={styles.emptyStateTitle}>No trend data</Text>
              <Text style={styles.emptyStateText}>
                Add measurements to see your progress trends
              </Text>
            </View>
          ) : (
            trackedTypes.map(typeId => {
              const type = getMeasurementTypeById(typeId);
              const progressData = getProgressData(typeId, 'month');
              
              if (!type || progressData.length < 2) return null;
              
              return (
                <MeasurementChart
                  key={typeId}
                  data={progressData}
                  title={type.name}
                  unit={type.unit}
                  color={DesignTokens.colors.primary[500]}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'history':
        return renderHistory();
      case 'trends':
        return renderTrends();
      default:
        return renderOverview();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Measurements</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <LinearGradient
            colors={[DesignTokens.colors.primary[500], DesignTokens.colors.primary[600]]}
            style={styles.addButtonGradient}
          >
            <Plus size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

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
          icon={<Calendar size={20} color={activeTab === 'history' ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />}
        />
        <TabButton
          tab="trends"
          label="Trends"
          icon={<TrendingUp size={20} color={activeTab === 'trends' ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />}
        />
      </View>

      {/* Content */}
      {renderContent()}

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  addButton: {
    borderRadius: DesignTokens.borderRadius.full,
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  addButtonGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
  tabContent: {
    flex: 1,
  },
  section: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[4],
  },
  statsContainer: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: DesignTokens.spacing[4],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginTop: DesignTokens.spacing[2],
  },
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    marginTop: DesignTokens.spacing[1],
  },
  quickAddContainer: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },
  quickAddCard: {
    alignItems: 'center',
    padding: DesignTokens.spacing[4],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
    minWidth: 120,
    position: 'relative',
  },
  quickAddIcon: {
    fontSize: 32,
    marginBottom: DesignTokens.spacing[2],
  },
  quickAddName: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  quickAddValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  quickAddEmpty: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontStyle: 'italic',
  },
  quickAddTrend: {
    position: 'absolute',
    top: DesignTokens.spacing[2],
    right: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.full,
  },
  quickAddTrendText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
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
    marginBottom: DesignTokens.spacing[6],
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[6],
    paddingVertical: DesignTokens.spacing[3],
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: DesignTokens.borderRadius.lg,
  },
  emptyStateButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
});
