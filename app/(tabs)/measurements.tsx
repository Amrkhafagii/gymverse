/**
 * Enhanced Measurements Screen with Progress Indicators
 * Chunk 14: Adding progress bars and circular progress throughout
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  Ruler,
  Weight,
  Activity,
  BarChart3,
  Camera,
  Edit3,
  Trash2,
  Filter,
  Download,
  Share,
  ChevronRight,
  Clock,
  Award,
} from 'lucide-react-native';
import { router } from 'expo-router';

// Design System
import { DesignTokens } from '@/design-system/tokens';

// Context Integration
import { useMeasurements } from '@/contexts/MeasurementContext';
import { useAchievements } from '@/contexts/AchievementContext';

// Enhanced Progress Components - NEW
import { CircularProgress, CircularProgressDashboard, CircularProgressGradient } from '@/components/ui/CircularProgress';
import { ProgressBar, ProgressBarGradient, ProgressBarWithLabel, ProgressBarSuccess, ProgressBarWarning } from '@/components/ui/ProgressBar';

// Previously Integrated Components
import { MeasurementCard } from '@/components/measurements/MeasurementCard';
import { AddMeasurementModal } from '@/components/measurements/AddMeasurementModal';
import { MeasurementChart } from '@/components/measurements/MeasurementChart';
import { BodyCompositionCard } from '@/components/measurements/BodyCompositionCard';

const { width: screenWidth } = Dimensions.get('window');

interface MeasurementGoal {
  id: string;
  measurementType: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  direction: 'increase' | 'decrease' | 'maintain';
  priority: 'high' | 'medium' | 'low';
  category: 'weight' | 'body_fat' | 'muscle' | 'measurements';
}

interface MeasurementTrend {
  type: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
  period: string;
  isPositive: boolean;
}

export default function MeasurementsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | '3months' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'weight' | 'body_fat' | 'muscle' | 'measurements'>('all');
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  // Context Integration
  const {
    measurements,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    getMeasurementsByType,
    getLatestMeasurement,
    getMeasurementTrend,
    refreshMeasurements,
  } = useMeasurements();

  const { checkForNewUnlocks } = useAchievements();

  // Mock measurement goals - would come from context in real app
  const [measurementGoals] = useState<MeasurementGoal[]>([
    {
      id: 'weight_goal',
      measurementType: 'weight',
      targetValue: 180,
      currentValue: 185,
      unit: 'lbs',
      deadline: '2024-06-01',
      direction: 'decrease',
      priority: 'high',
      category: 'weight',
    },
    {
      id: 'body_fat_goal',
      measurementType: 'body_fat',
      targetValue: 12,
      currentValue: 15,
      unit: '%',
      deadline: '2024-08-01',
      direction: 'decrease',
      priority: 'high',
      category: 'body_fat',
    },
    {
      id: 'muscle_mass_goal',
      measurementType: 'muscle_mass',
      targetValue: 160,
      currentValue: 155,
      unit: 'lbs',
      deadline: '2024-12-31',
      direction: 'increase',
      priority: 'medium',
      category: 'muscle',
    },
    {
      id: 'waist_goal',
      measurementType: 'waist',
      targetValue: 32,
      currentValue: 34,
      unit: 'inches',
      deadline: '2024-07-01',
      direction: 'decrease',
      priority: 'medium',
      category: 'measurements',
    },
    {
      id: 'chest_goal',
      measurementType: 'chest',
      targetValue: 42,
      currentValue: 40,
      unit: 'inches',
      deadline: '2024-09-01',
      direction: 'increase',
      priority: 'low',
      category: 'measurements',
    },
  ]);

  // Calculate measurement trends
  const measurementTrends: MeasurementTrend[] = [
    'weight',
    'body_fat',
    'muscle_mass',
    'waist',
    'chest',
    'arms',
    'thighs',
  ].map(type => {
    const trend = getMeasurementTrend(type, selectedTimeframe);
    const isWeightOrBodyFat = type === 'weight' || type === 'body_fat';
    
    return {
      type,
      trend: trend.direction,
      change: trend.change,
      changePercent: trend.changePercent,
      period: selectedTimeframe,
      isPositive: isWeightOrBodyFat ? trend.direction === 'down' : trend.direction === 'up',
    };
  });

  const filteredGoals = selectedCategory === 'all' 
    ? measurementGoals 
    : measurementGoals.filter(goal => goal.category === selectedCategory);

  const overallProgress = calculateOverallProgress();

  useEffect(() => {
    // Check for measurement-related achievements
    checkForNewUnlocks();
  }, [measurements]);

  // Refresh Handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMeasurements();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Navigation Handlers
  const handleAddMeasurement = () => {
    setShowAddModal(true);
  };

  const handleGoalPress = (goalId: string) => {
    setExpandedGoal(expandedGoal === goalId ? null : goalId);
  };

  const handleViewProgress = (measurementType: string) => {
    router.push(`/measurements/${measurementType}/progress`);
  };

  const handleTakePhoto = () => {
    router.push('/measurements/photos');
  };

  const handleExportData = () => {
    // Export functionality
  };

  const handleShareProgress = () => {
    // Share functionality
  };

  // Helper Functions
  function calculateOverallProgress(): number {
    const totalProgress = measurementGoals.reduce((sum, goal) => {
      const progress = calculateGoalProgress(goal);
      return sum + progress;
    }, 0);
    return totalProgress / measurementGoals.length;
  }

  function calculateGoalProgress(goal: MeasurementGoal): number {
    const { currentValue, targetValue, direction } = goal;
    
    if (direction === 'maintain') {
      const tolerance = targetValue * 0.05; // 5% tolerance
      const diff = Math.abs(currentValue - targetValue);
      return Math.max(0, 100 - (diff / tolerance) * 100);
    }
    
    if (direction === 'decrease') {
      if (currentValue <= targetValue) return 100;
      const totalChange = Math.abs(targetValue - currentValue);
      const progress = Math.max(0, 100 - ((currentValue - targetValue) / totalChange) * 100);
      return Math.min(100, progress);
    }
    
    if (direction === 'increase') {
      if (currentValue >= targetValue) return 100;
      const totalChange = targetValue - currentValue;
      const progress = Math.max(0, (currentValue / targetValue) * 100);
      return Math.min(100, progress);
    }
    
    return 0;
  }

  function getDaysUntilDeadline(deadline: string): number {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  function formatDeadline(deadline: string): string {
    const days = getDaysUntilDeadline(deadline);
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    if (days <= 7) return `${days} days left`;
    if (days <= 30) return `${Math.ceil(days / 7)} weeks left`;
    return `${Math.ceil(days / 30)} months left`;
  }

  function getProgressBarColor(goal: MeasurementGoal): string {
    const progress = calculateGoalProgress(goal);
    const daysLeft = getDaysUntilDeadline(goal.deadline);
    
    if (progress >= 80) return DesignTokens.colors.success[500];
    if (progress >= 50) return DesignTokens.colors.warning[500];
    if (daysLeft <= 7) return DesignTokens.colors.error[500];
    return DesignTokens.colors.primary[500];
  }

  function getTrendIcon(trend: MeasurementTrend) {
    if (trend.trend === 'up') {
      return <TrendingUp size={16} color={trend.isPositive ? DesignTokens.colors.success[500] : DesignTokens.colors.error[500]} />;
    } else if (trend.trend === 'down') {
      return <TrendingDown size={16} color={trend.isPositive ? DesignTokens.colors.success[500] : DesignTokens.colors.error[500]} />;
    } else {
      return <Minus size={16} color={DesignTokens.colors.text.secondary} />;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={DesignTokens.colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Overall Progress */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Measurements</Text>
            <Text style={styles.headerSubtitle}>Track your body composition</Text>
          </View>

          {/* Overall Progress Circle - NEW */}
          <CircularProgressGradient
            progress={overallProgress}
            size={80}
            strokeWidth={8}
            showPercentage={true}
            showLabel={true}
            label="Goals"
            gradientColors={[DesignTokens.colors.success[400], DesignTokens.colors.success[600]]}
            glowEffect={true}
            pulseAnimation={overallProgress > 90}
          />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.timeframeSelector}>
            {(['week', 'month', '3months', 'year'] as const).map((timeframe) => (
              <TouchableOpacity
                key={timeframe}
                style={[
                  styles.timeframeButton,
                  selectedTimeframe === timeframe && styles.timeframeButtonActive,
                ]}
                onPress={() => setSelectedTimeframe(timeframe)}
              >
                <Text
                  style={[
                    styles.timeframeButtonText,
                    selectedTimeframe === timeframe && styles.timeframeButtonTextActive,
                  ]}
                >
                  {timeframe === '3months' ? '3M' : timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
              <Camera size={20} color={DesignTokens.colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
              <Download size={20} color={DesignTokens.colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShareProgress}>
              <Share size={20} color={DesignTokens.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categoryFilter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['all', 'weight', 'body_fat', 'muscle', 'measurements'] as const).map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.categoryButtonTextActive,
                  ]}
                >
                  {category === 'body_fat' ? 'Body Fat' : category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Add Button */}
        <TouchableOpacity style={styles.quickAddButton} onPress={handleAddMeasurement}>
          <LinearGradient colors={[DesignTokens.colors.primary[500], DesignTokens.colors.primary[600]]} style={styles.quickAddGradient}>
            <Plus size={24} color="#FFFFFF" />
            <Text style={styles.quickAddText}>Add Measurement</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Measurement Goals with Enhanced Progress Indicators - NEW */}
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          
          {filteredGoals.map((goal) => {
            const progress = calculateGoalProgress(goal);
            const progressColor = getProgressBarColor(goal);
            const daysLeft = getDaysUntilDeadline(goal.deadline);
            
            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  expandedGoal === goal.id && styles.goalCardExpanded,
                ]}
                onPress={() => handleGoalPress(goal.id)}
              >
                <LinearGradient
                  colors={['#1a1a1a', '#2a2a2a']}
                  style={styles.goalGradient}
                >
                  {/* Goal Header */}
                  <View style={styles.goalHeader}>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalTitle}>
                        {goal.measurementType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Goal
                      </Text>
                      <Text style={styles.goalDescription}>
                        {goal.direction === 'increase' ? 'Increase to' : 
                         goal.direction === 'decrease' ? 'Decrease to' : 'Maintain'} {goal.targetValue} {goal.unit}
                      </Text>
                    </View>
                    
                    {/* Circular Progress for Goal - NEW */}
                    <CircularProgressDashboard
                      progress={progress}
                      size={60}
                      strokeWidth={6}
                      color={progressColor}
                      showPercentage={true}
                      showLabel={false}
                      gradient={true}
                      gradientColors={[progressColor + '80', progressColor]}
                    />
                  </View>

                  {/* Current vs Target */}
                  <View style={styles.goalValues}>
                    <View style={styles.goalValue}>
                      <Text style={styles.goalValueLabel}>Current</Text>
                      <Text style={styles.goalValueText}>
                        {goal.currentValue} {goal.unit}
                      </Text>
                    </View>
                    
                    <View style={styles.goalArrow}>
                      {goal.direction === 'increase' ? (
                        <TrendingUp size={20} color={DesignTokens.colors.success[500]} />
                      ) : goal.direction === 'decrease' ? (
                        <TrendingDown size={20} color={DesignTokens.colors.success[500]} />
                      ) : (
                        <Target size={20} color={DesignTokens.colors.warning[500]} />
                      )}
                    </View>
                    
                    <View style={styles.goalValue}>
                      <Text style={styles.goalValueLabel}>Target</Text>
                      <Text style={styles.goalValueText}>
                        {goal.targetValue} {goal.unit}
                      </Text>
                    </View>
                  </View>

                  {/* Enhanced Progress Bar - NEW */}
                  <ProgressBarWithLabel
                    progress={progress}
                    height={12}
                    color={progressColor}
                    gradient={true}
                    gradientColors={[progressColor + '80', progressColor]}
                    showPercentage={true}
                    showLabel={true}
                    label="Progress"
                    labelPosition="top"
                    animated={true}
                    glowEffect={progress > 80}
                    style={styles.goalProgressBar}
                  />

                  {/* Goal Footer */}
                  <View style={styles.goalFooter}>
                    <View style={styles.goalDeadline}>
                      <Clock size={12} color={daysLeft <= 7 ? DesignTokens.colors.error[500] : DesignTokens.colors.text.tertiary} />
                      <Text style={[
                        styles.goalDeadlineText,
                        { color: daysLeft <= 7 ? DesignTokens.colors.error[500] : DesignTokens.colors.text.tertiary }
                      ]}>
                        {formatDeadline(goal.deadline)}
                      </Text>
                    </View>
                    
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: goal.priority === 'high' ? DesignTokens.colors.error[500] + '20' : 
                                       goal.priority === 'medium' ? DesignTokens.colors.warning[500] + '20' : 
                                       DesignTokens.colors.success[500] + '20' }
                    ]}>
                      <Text style={[
                        styles.priorityBadgeText,
                        { color: goal.priority === 'high' ? DesignTokens.colors.error[500] : 
                                goal.priority === 'medium' ? DesignTokens.colors.warning[500] : 
                                DesignTokens.colors.success[500] }
                      ]}>
                        {goal.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Expanded Details */}
                  {expandedGoal === goal.id && (
                    <View style={styles.goalExpanded}>
                      <View style={styles.expandedStats}>
                        <View style={styles.expandedStat}>
                          <Text style={styles.expandedStatLabel}>Remaining</Text>
                          <Text style={styles.expandedStatValue}>
                            {Math.abs(goal.targetValue - goal.currentValue).toFixed(1)} {goal.unit}
                          </Text>
                        </View>
                        <View style={styles.expandedStat}>
                          <Text style={styles.expandedStatLabel}>Daily Target</Text>
                          <Text style={styles.expandedStatValue}>
                            {daysLeft > 0 ? (Math.abs(goal.targetValue - goal.currentValue) / daysLeft).toFixed(2) : '0'} {goal.unit}/day
                          </Text>
                        </View>
                        <View style={styles.expandedStat}>
                          <Text style={styles.expandedStatLabel}>Category</Text>
                          <Text style={styles.expandedStatValue}>
                            {goal.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Priority Indicator */}
                  <View style={[
                    styles.priorityIndicator,
                    { backgroundColor: goal.priority === 'high' ? DesignTokens.colors.error[500] : 
                                     goal.priority === 'medium' ? DesignTokens.colors.warning[500] : 
                                     DesignTokens.colors.success[500] }
                  ]} />
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Measurement Trends with Progress Indicators - NEW */}
        <View style={styles.trendsSection}>
          <Text style={styles.sectionTitle}>Recent Trends</Text>
          
          <View style={styles.trendsGrid}>
            {measurementTrends.map((trend) => (
              <TouchableOpacity
                key={trend.type}
                style={styles.trendCard}
                onPress={() => handleViewProgress(trend.type)}
              >
                <LinearGradient
                  colors={['#1a1a1a', '#2a2a2a']}
                  style={styles.trendGradient}
                >
                  <View style={styles.trendHeader}>
                    <Text style={styles.trendTitle}>
                      {trend.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                    {getTrendIcon(trend)}
                  </View>

                  {/* Trend Progress Indicator - NEW */}
                  <View style={styles.trendProgress}>
                    <CircularProgress
                      progress={Math.abs(trend.changePercent)}
                      size={50}
                      strokeWidth={4}
                      color={trend.isPositive ? DesignTokens.colors.success[500] : DesignTokens.colors.error[500]}
                      backgroundColor={DesignTokens.colors.neutral[800]}
                      showPercentage={false}
                      showLabel={false}
                      animated={true}
                    />
                    
                    <View style={styles.trendChange}>
                      <Text style={[
                        styles.trendChangeText,
                        { color: trend.isPositive ? DesignTokens.colors.success[500] : DesignTokens.colors.error[500] }
                      ]}>
                        {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}
                      </Text>
                      <Text style={styles.trendPeriod}>
                        this {trend.period}
                      </Text>
                    </View>
                  </View>

                  {/* Trend Status Bar - NEW */}
                  <ProgressBar
                    progress={Math.min(100, Math.abs(trend.changePercent) * 10)}
                    height={4}
                    color={trend.isPositive ? DesignTokens.colors.success[500] : DesignTokens.colors.error[500]}
                    backgroundColor={DesignTokens.colors.neutral[800]}
                    showPercentage={false}
                    animated={true}
                    style={styles.trendStatusBar}
                  />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Body Composition Overview */}
        <View style={styles.compositionSection}>
          <Text style={styles.sectionTitle}>Body Composition</Text>
          <BodyCompositionCard
            measurements={measurements}
            timeframe={selectedTimeframe}
            style={styles.compositionCard}
          />
        </View>

        {/* Recent Measurements */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Measurements</Text>
            <TouchableOpacity onPress={() => router.push('/measurements/history')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {measurements.slice(0, 5).map((measurement) => (
            <MeasurementCard
              key={measurement.id}
              measurement={measurement}
              onEdit={(id) => {/* Edit measurement */}}
              onDelete={(id) => {/* Delete measurement */}}
              showTrend={true}
              style={styles.measurementCard}
            />
          ))}
        </View>

        {/* Charts Section */}
        <View style={styles.chartsSection}>
          <Text style={styles.sectionTitle}>Progress Charts</Text>
          
          <MeasurementChart
            measurementType="weight"
            timeframe={selectedTimeframe}
            style={styles.chart}
          />
          
          <MeasurementChart
            measurementType="body_fat"
            timeframe={selectedTimeframe}
            style={styles.chart}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={handleAddMeasurement}>
            <Plus size={24} color={DesignTokens.colors.primary[500]} />
            <Text style={styles.quickActionText}>Add Measurement</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton} onPress={handleTakePhoto}>
            <Camera size={24} color={DesignTokens.colors.success[500]} />
            <Text style={styles.quickActionText}>Progress Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/measurements/goals')}>
            <Target size={24} color={DesignTokens.colors.warning[500]} />
            <Text style={styles.quickActionText}>Manage Goals</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Measurement Modal */}
      <AddMeasurementModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addMeasurement}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  headerSubtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[1],
  },
  timeframeButton: {
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.sm,
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
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  actionButton: {
    padding: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
  },
  categoryFilter: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  categoryButton: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    marginRight: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
  },
  categoryButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  categoryButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  quickAddButton: {
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.md,
  },
  quickAddGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: DesignTokens.spacing[4],
    gap: DesignTokens.spacing[2],
  },
  quickAddText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  goalsSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  viewAllText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  goalCard: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[3],
    ...DesignTokens.shadow.base,
    position: 'relative',
  },
  goalCardExpanded: {
    ...DesignTokens.shadow.lg,
  },
  goalGradient: {
    padding: DesignTokens.spacing[4],
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  goalInfo: {
    flex: 1,
    marginRight: DesignTokens.spacing[3],
  },
  goalTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  goalDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  goalValues: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing[3],
  },
  goalValue: {
    alignItems: 'center',
    flex: 1,
  },
  goalValueLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    marginBottom: DesignTokens.spacing[1],
  },
  goalValueText: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  goalArrow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: DesignTokens.spacing[3],
  },
  goalProgressBar: {
    marginBottom: DesignTokens.spacing[3],
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  goalDeadlineText: {
    fontSize: DesignTokens.typography.fontSize.xs,
  },
  priorityBadge: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  priorityBadgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  goalExpanded: {
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
    paddingTop: DesignTokens.spacing[3],
    marginTop: DesignTokens.spacing[3],
  },
  expandedStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  expandedStat: {
    alignItems: 'center',
  },
  expandedStatLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    marginBottom: DesignTokens.spacing[1],
  },
  expandedStatValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  priorityIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  trendsSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  trendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
  },
  trendCard: {
    width: (screenWidth - DesignTokens.spacing[5] * 2 - DesignTokens.spacing[3]) / 2,
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  trendGradient: {
    padding: DesignTokens.spacing[3],
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  trendTitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    flex: 1,
  },
  trendProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing[2],
  },
  trendChange: {
    alignItems: 'center',
  },
  trendChangeText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  trendPeriod: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  trendStatusBar: {
    marginTop: DesignTokens.spacing[1],
  },
  compositionSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  compositionCard: {
    marginBottom: DesignTokens.spacing[3],
  },
  recentSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  measurementCard: {
    marginBottom: DesignTokens.spacing[3],
  },
  chartsSection: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  chart: {
    marginBottom: DesignTokens.spacing[4],
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
    backgroundColor: DesignTokens.colors.surface.primary,
    marginHorizontal: DesignTokens.spacing[5],
    borderRadius: DesignTokens.borderRadius.lg,
    marginBottom: DesignTokens.spacing[6],
  },
  quickActionButton: {
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  quickActionText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
