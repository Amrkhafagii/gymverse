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
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  Target,
  Calendar,
  Award,
  Zap,
  BarChart3,
  Filter,
} from 'lucide-react-native';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { PersonalRecord, ExerciseProgress } from '@/lib/analytics/prDetection';
import { PersonalRecordModal } from './PersonalRecordModal';

const { width } = Dimensions.get('window');

interface ProgressDashboardProps {
  showFilters?: boolean;
  compactMode?: boolean;
}

export function ProgressDashboard({ showFilters = true, compactMode = false }: ProgressDashboardProps) {
  const {
    personalRecords,
    exerciseProgress,
    recentPRs,
    prStats,
    exerciseProgressStats,
    isLoading,
  } = usePersonalRecords();

  const [selectedPR, setSelectedPR] = useState<PersonalRecord | null>(null);
  const [showPRModal, setShowPRModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'weight' | 'reps' | 'volume' | 'duration'>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year' | 'all'>('month');

  const filteredPRs = personalRecords.filter(pr => {
    const matchesType = selectedFilter === 'all' || pr.recordType === selectedFilter;
    
    let matchesTimeframe = true;
    if (selectedTimeframe !== 'all') {
      const prDate = new Date(pr.achievedAt);
      const now = new Date();
      const timeframeDays = {
        week: 7,
        month: 30,
        year: 365,
      }[selectedTimeframe];
      
      const cutoffDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);
      matchesTimeframe = prDate >= cutoffDate;
    }
    
    return matchesType && matchesTimeframe;
  });

  const handlePRPress = (record: PersonalRecord) => {
    setSelectedPR(record);
    setShowPRModal(true);
  };

  const getTrendIcon = (trend: ExerciseProgress['progressTrend']) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp size={16} color="#00D4AA" />;
      case 'declining':
        return <TrendingDown size={16} color="#FF6B6B" />;
      default:
        return <Minus size={16} color="#A3A3A3" />;
    }
  };

  const getTrendColor = (trend: ExerciseProgress['progressTrend']) => {
    switch (trend) {
      case 'improving':
        return '#00D4AA';
      case 'declining':
        return '#FF6B6B';
      default:
        return '#A3A3A3';
    }
  };

  const formatValue = (value: number, recordType: PersonalRecord['recordType'], unit: string) => {
    switch (recordType) {
      case 'weight':
        return `${value}${unit}`;
      case 'reps':
        return `${value}`;
      case 'volume':
        return `${value.toFixed(1)}${unit}`;
      case 'duration':
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      default:
        return `${value}${unit}`;
    }
  };

  const getRecordTypeIcon = (type: PersonalRecord['recordType']) => {
    switch (type) {
      case 'weight':
        return <Trophy size={20} color="#FFD700" />;
      case 'reps':
        return <Target size={20} color="#FF6B6B" />;
      case 'volume':
        return <BarChart3 size={20} color="#4ECDC4" />;
      case 'duration':
        return <Zap size={20} color="#45B7D1" />;
      default:
        return <Award size={20} color="#96CEB4" />;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading progress data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Overview */}
      <View style={styles.statsOverview}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.statIconContainer}>
              <Trophy size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.statValue}>{prStats.totalPRs}</Text>
            <Text style={styles.statLabel}>Total PRs</Text>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#00D4AA', '#01A3A4']} style={styles.statIconContainer}>
              <Calendar size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.statValue}>{prStats.recentPRs}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#6C5CE7', '#A29BFE']} style={styles.statIconContainer}>
              <TrendingUp size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.statValue}>{exerciseProgressStats.improvingExercises}</Text>
            <Text style={styles.statLabel}>Improving</Text>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#FF6B6B', '#FF4757']} style={styles.statIconContainer}>
              <Target size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.statValue}>{exerciseProgressStats.averageProgressScore.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {['all', 'weight', 'reps', 'volume', 'duration'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter && styles.activeFilterButton
                  ]}
                  onPress={() => setSelectedFilter(filter as any)}
                >
                  <Text style={[
                    styles.filterText,
                    selectedFilter === filter && styles.activeFilterText
                  ]}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {['week', 'month', 'year', 'all'].map((timeframe) => (
                <TouchableOpacity
                  key={timeframe}
                  style={[
                    styles.timeframeButton,
                    selectedTimeframe === timeframe && styles.activeTimeframeButton
                  ]}
                  onPress={() => setSelectedTimeframe(timeframe as any)}
                >
                  <Text style={[
                    styles.timeframeText,
                    selectedTimeframe === timeframe && styles.activeTimeframeText
                  ]}>
                    {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recent PRs */}
        {recentPRs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Personal Records 🔥</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.recentPRsRow}>
                {recentPRs.slice(0, 5).map((record) => (
                  <TouchableOpacity
                    key={record.id}
                    style={styles.recentPRCard}
                    onPress={() => handlePRPress(record)}
                  >
                    <LinearGradient
                      colors={['#1a1a1a', '#2a2a2a']}
                      style={styles.recentPRGradient}
                    >
                      <View style={styles.recentPRHeader}>
                        {getRecordTypeIcon(record.recordType)}
                        <Text style={styles.recentPRType}>
                          {record.recordType.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.recentPRExercise} numberOfLines={1}>
                        {record.exerciseName}
                      </Text>
                      <Text style={styles.recentPRValue}>
                        {formatValue(record.value, record.recordType, record.unit)}
                      </Text>
                      <View style={styles.recentPRImprovement}>
                        <TrendingUp size={12} color="#00D4AA" />
                        <Text style={styles.recentPRImprovementText}>
                          +{record.improvementPercentage.toFixed(1)}%
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Exercise Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercise Progress</Text>
          {exerciseProgress.slice(0, compactMode ? 5 : 10).map((progress) => (
            <View key={progress.exerciseId} style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressExerciseName}>{progress.exerciseName}</Text>
                  <Text style={styles.progressMuscleGroups}>
                    {progress.muscleGroups.join(', ')}
                  </Text>
                </View>
                <View style={styles.progressTrend}>
                  {getTrendIcon(progress.progressTrend)}
                  <Text style={[styles.progressTrendText, { color: getTrendColor(progress.progressTrend) }]}>
                    {progress.progressTrend}
                  </Text>
                </View>
              </View>

              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <Text style={styles.progressStatValue}>{progress.totalSessions}</Text>
                  <Text style={styles.progressStatLabel}>Sessions</Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={styles.progressStatValue}>{progress.bestWeight.toFixed(1)}kg</Text>
                  <Text style={styles.progressStatLabel}>Best Weight</Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={styles.progressStatValue}>{progress.bestReps}</Text>
                  <Text style={styles.progressStatLabel}>Best Reps</Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={styles.progressStatValue}>{progress.progressScore}</Text>
                  <Text style={styles.progressStatLabel}>Score</Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: `${progress.progressScore}%`,
                      backgroundColor: getTrendColor(progress.progressTrend)
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>

        {/* All PRs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            All Personal Records ({filteredPRs.length})
          </Text>
          {filteredPRs.length === 0 ? (
            <View style={styles.emptyState}>
              <Trophy size={48} color="#A3A3A3" />
              <Text style={styles.emptyStateTitle}>No records found</Text>
              <Text style={styles.emptyStateText}>
                Complete workouts to start setting personal records!
              </Text>
            </View>
          ) : (
            filteredPRs.map((record) => (
              <TouchableOpacity
                key={record.id}
                style={styles.prCard}
                onPress={() => handlePRPress(record)}
              >
                <View style={styles.prCardHeader}>
                  <View style={styles.prCardInfo}>
                    {getRecordTypeIcon(record.recordType)}
                    <View style={styles.prCardText}>
                      <Text style={styles.prCardExercise}>{record.exerciseName}</Text>
                      <Text style={styles.prCardType}>
                        {record.recordType.charAt(0).toUpperCase() + record.recordType.slice(1)} PR
                      </Text>
                    </View>
                  </View>
                  <View style={styles.prCardValue}>
                    <Text style={styles.prCardValueText}>
                      {formatValue(record.value, record.recordType, record.unit)}
                    </Text>
                    <View style={styles.prCardImprovement}>
                      <TrendingUp size={12} color="#00D4AA" />
                      <Text style={styles.prCardImprovementText}>
                        +{record.improvementPercentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.prCardDate}>
                  {new Date(record.achievedAt).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <PersonalRecordModal
        visible={showPRModal}
        onClose={() => setShowPRModal(false)}
        record={selectedPR}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  statsOverview: {
    padding: 20,
    paddingBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#9E7FFF',
  },
  filterText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  timeframeButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeTimeframeButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#9E7FFF',
  },
  timeframeText: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
  },
  activeTimeframeText: {
    color: '#9E7FFF',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  recentPRsRow: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  recentPRCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  recentPRGradient: {
    padding: 16,
    height: 140,
  },
  recentPRHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentPRType: {
    fontSize: 10,
    color: '#A3A3A3',
    fontFamily: 'Inter-Bold',
    marginLeft: 6,
  },
  recentPRExercise: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  recentPRValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  recentPRImprovement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentPRImprovementText: {
    fontSize: 12,
    color: '#00D4AA',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  progressCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  progressInfo: {
    flex: 1,
  },
  progressExerciseName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  progressMuscleGroups: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
  },
  progressTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrendText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  progressStatLabel: {
    fontSize: 10,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  prCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  prCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  prCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  prCardText: {
    marginLeft: 12,
    flex: 1,
  },
  prCardExercise: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  prCardType: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
  },
  prCardValue: {
    alignItems: 'flex-end',
  },
  prCardValueText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  prCardImprovement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prCardImprovementText: {
    fontSize: 12,
    color: '#00D4AA',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  prCardDate: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});
