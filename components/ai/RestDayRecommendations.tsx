import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Brain,
  Moon,
  Heart,
  Activity,
  Droplets,
  Coffee,
  Bed,
  Utensils,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  Battery,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useRestDayRecommendations } from '@/hooks/useRestDayRecommendations';
import { Button } from '@/components/ui/Button';
import * as Haptics from 'expo-haptics';

interface RestDayRecommendationsProps {
  onActivitySelect: (activityId: string) => void;
  onScheduleRest: () => void;
  showDetailed?: boolean;
}

export function RestDayRecommendations({
  onActivitySelect,
  onScheduleRest,
  showDetailed = true,
}: RestDayRecommendationsProps) {
  const {
    recommendations,
    fatigueLevel,
    recoveryScore,
    restDayNeeded,
    nextRestDay,
    recoveryActivities,
    fatigueIndicators,
    isAnalyzing,
    refreshAnalysis,
  } = useRestDayRecommendations();

  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const handleActivityPress = async (activityId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedActivity(activityId);
    onActivitySelect(activityId);
  };

  const handleSchedulePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onScheduleRest();
  };

  const getFatigueColor = (level: number) => {
    if (level <= 0.3) return DesignTokens.colors.success[500];
    if (level <= 0.6) return DesignTokens.colors.warning[500];
    return DesignTokens.colors.error[500];
  };

  const getRecoveryColor = (score: number) => {
    if (score >= 0.8) return DesignTokens.colors.success[500];
    if (score >= 0.6) return DesignTokens.colors.warning[500];
    return DesignTokens.colors.error[500];
  };

  const getFatigueIcon = (level: number) => {
    if (level <= 0.3) return <CheckCircle size={20} color={DesignTokens.colors.success[500]} />;
    if (level <= 0.6) return <Clock size={20} color={DesignTokens.colors.warning[500]} />;
    return <AlertTriangle size={20} color={DesignTokens.colors.error[500]} />;
  };

  const getFatigueText = (level: number) => {
    if (level <= 0.3) return 'Low - You\'re feeling great!';
    if (level <= 0.6) return 'Moderate - Consider lighter training';
    return 'High - Rest day recommended';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sleep':
        return <Bed size={20} color={DesignTokens.colors.primary[500]} />;
      case 'hydration':
        return <Droplets size={20} color={DesignTokens.colors.info[500]} />;
      case 'nutrition':
        return <Utensils size={20} color={DesignTokens.colors.success[500]} />;
      case 'meditation':
        return <Moon size={20} color={DesignTokens.colors.purple[500]} />;
      case 'stretching':
        return <Activity size={20} color={DesignTokens.colors.warning[500]} />;
      case 'massage':
        return <Heart size={20} color={DesignTokens.colors.error[500]} />;
      default:
        return <Zap size={20} color={DesignTokens.colors.text.secondary} />;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Brain size={24} color={DesignTokens.colors.primary[500]} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Recovery Analysis</Text>
          <Text style={styles.headerSubtitle}>AI-powered rest recommendations</Text>
        </View>
      </View>

      {/* Recovery Status */}
      <View style={styles.statusContainer}>
        <LinearGradient
          colors={restDayNeeded ? ['#dc2626', '#ef4444'] : ['#059669', '#10b981']}
          style={styles.statusGradient}
        >
          <View style={styles.statusContent}>
            <View style={styles.statusIcon}>
              {restDayNeeded ? (
                <AlertTriangle size={32} color="#FFFFFF" />
              ) : (
                <CheckCircle size={32} color="#FFFFFF" />
              )}
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>
                {restDayNeeded ? 'Rest Day Needed' : 'Recovery On Track'}
              </Text>
              <Text style={styles.statusMessage}>
                {restDayNeeded 
                  ? 'Your body needs recovery time'
                  : 'You\'re recovering well from training'
                }
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Battery size={16} color={getFatigueColor(fatigueLevel)} />
            <Text style={styles.metricTitle}>Fatigue Level</Text>
          </View>
          <View style={styles.metricContent}>
            <Text style={[styles.metricValue, { color: getFatigueColor(fatigueLevel) }]}>
              {Math.round(fatigueLevel * 100)}%
            </Text>
            <View style={styles.metricBar}>
              <View style={styles.metricTrack}>
                <View 
                  style={[
                    styles.metricFill,
                    { 
                      width: `${fatigueLevel * 100}%`,
                      backgroundColor: getFatigueColor(fatigueLevel),
                    }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.metricDescription}>
              {getFatigueText(fatigueLevel)}
            </Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Heart size={16} color={getRecoveryColor(recoveryScore)} />
            <Text style={styles.metricTitle}>Recovery Score</Text>
          </View>
          <View style={styles.metricContent}>
            <Text style={[styles.metricValue, { color: getRecoveryColor(recoveryScore) }]}>
              {Math.round(recoveryScore * 100)}%
            </Text>
            <View style={styles.metricBar}>
              <View style={styles.metricTrack}>
                <View 
                  style={[
                    styles.metricFill,
                    { 
                      width: `${recoveryScore * 100}%`,
                      backgroundColor: getRecoveryColor(recoveryScore),
                    }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.metricDescription}>
              {recoveryScore >= 0.8 ? 'Excellent recovery' : 
               recoveryScore >= 0.6 ? 'Good recovery' : 'Poor recovery'}
            </Text>
          </View>
        </View>
      </View>

      {/* Fatigue Indicators */}
      {showDetailed && fatigueIndicators.length > 0 && (
        <View style={styles.indicatorsContainer}>
          <Text style={styles.sectionTitle}>Fatigue Indicators</Text>
          <View style={styles.indicatorsList}>
            {fatigueIndicators.map((indicator, index) => (
              <View key={index} style={styles.indicatorItem}>
                <View style={[
                  styles.indicatorIcon,
                  { backgroundColor: indicator.severity === 'high' ? DesignTokens.colors.error[500] + '20' : DesignTokens.colors.warning[500] + '20' }
                ]}>
                  {indicator.severity === 'high' ? (
                    <AlertTriangle size={16} color={DesignTokens.colors.error[500]} />
                  ) : (
                    <Clock size={16} color={DesignTokens.colors.warning[500]} />
                  )}
                </View>
                <View style={styles.indicatorContent}>
                  <Text style={styles.indicatorTitle}>{indicator.type}</Text>
                  <Text style={styles.indicatorDescription}>{indicator.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recommendations */}
      <View style={styles.recommendationsContainer}>
        <Text style={styles.sectionTitle}>AI Recommendations</Text>
        <View style={styles.recommendationsList}>
          {recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <View style={styles.recommendationIcon}>
                  {rec.priority === 'high' ? (
                    <AlertTriangle size={16} color={DesignTokens.colors.error[500]} />
                  ) : rec.priority === 'medium' ? (
                    <Clock size={16} color={DesignTokens.colors.warning[500]} />
                  ) : (
                    <CheckCircle size={16} color={DesignTokens.colors.success[500]} />
                  )}
                </View>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: 
                    rec.priority === 'high' ? DesignTokens.colors.error[500] + '20' :
                    rec.priority === 'medium' ? DesignTokens.colors.warning[500] + '20' :
                    DesignTokens.colors.success[500] + '20'
                  }
                ]}>
                  <Text style={[
                    styles.priorityText,
                    { color: 
                      rec.priority === 'high' ? DesignTokens.colors.error[500] :
                      rec.priority === 'medium' ? DesignTokens.colors.warning[500] :
                      DesignTokens.colors.success[500]
                    }
                  ]}>
                    {rec.priority}
                  </Text>
                </View>
              </View>
              <Text style={styles.recommendationDescription}>{rec.description}</Text>
              {rec.duration && (
                <Text style={styles.recommendationDuration}>
                  Recommended duration: {rec.duration}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Recovery Activities */}
      <View style={styles.activitiesContainer}>
        <Text style={styles.sectionTitle}>Recovery Activities</Text>
        <View style={styles.activitiesList}>
          {recoveryActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={[
                styles.activityCard,
                selectedActivity === activity.id && styles.activityCardSelected,
              ]}
              onPress={() => handleActivityPress(activity.id)}
            >
              <View style={styles.activityIcon}>
                {getActivityIcon(activity.type)}
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.name}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <View style={styles.activityMeta}>
                  <Text style={styles.activityDuration}>{activity.duration}</Text>
                  <Text style={styles.activityBenefit}>{activity.benefit}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Next Rest Day */}
      {nextRestDay && (
        <View style={styles.nextRestContainer}>
          <View style={styles.nextRestCard}>
            <View style={styles.nextRestIcon}>
              <Moon size={20} color={DesignTokens.colors.primary[500]} />
            </View>
            <View style={styles.nextRestContent}>
              <Text style={styles.nextRestTitle}>Next Scheduled Rest Day</Text>
              <Text style={styles.nextRestDate}>
                {new Date(nextRestDay).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {restDayNeeded && (
          <Button
            title="Schedule Rest Day"
            variant="primary"
            size="large"
            onPress={handleSchedulePress}
            style={styles.actionButton}
            leftIcon={<Moon size={20} color={DesignTokens.colors.text.primary} />}
          />
        )}
        <Button
          title="Refresh Analysis"
          variant="secondary"
          size="large"
          onPress={refreshAnalysis}
          style={styles.actionButton}
          leftIcon={<Brain size={20} color={DesignTokens.colors.text.primary} />}
          disabled={isAnalyzing}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: DesignTokens.spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[5],
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  statusContainer: {
    marginBottom: DesignTokens.spacing[5],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  statusGradient: {
    padding: DesignTokens.spacing[4],
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: DesignTokens.spacing[1],
  },
  statusMessage: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[5],
  },
  metricCard: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[3],
  },
  metricTitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  metricContent: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[2],
  },
  metricBar: {
    width: '100%',
    marginBottom: DesignTokens.spacing[2],
  },
  metricTrack: {
    height: 4,
    backgroundColor: DesignTokens.colors.neutral[700],
    borderRadius: 2,
  },
  metricFill: {
    height: '100%',
    borderRadius: 2,
  },
  metricDescription: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  indicatorsContainer: {
    marginBottom: DesignTokens.spacing[5],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[3],
  },
  indicatorsList: {
    gap: DesignTokens.spacing[3],
  },
  indicatorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: DesignTokens.spacing[3],
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
  },
  indicatorIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorContent: {
    flex: 1,
  },
  indicatorTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  indicatorDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  recommendationsContainer: {
    marginBottom: DesignTokens.spacing[5],
  },
  recommendationsList: {
    gap: DesignTokens.spacing[3],
  },
  recommendationCard: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[2],
  },
  recommendationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: DesignTokens.colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationTitle: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  priorityBadge: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  priorityText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  recommendationDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
    marginBottom: DesignTokens.spacing[2],
  },
  recommendationDuration: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    fontStyle: 'italic',
  },
  activitiesContainer: {
    marginBottom: DesignTokens.spacing[5],
  },
  activitiesList: {
    gap: DesignTokens.spacing[3],
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: DesignTokens.spacing[3],
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activityCardSelected: {
    borderColor: DesignTokens.colors.primary[500],
    backgroundColor: DesignTokens.colors.primary[500] + '10',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  activityDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
    marginBottom: DesignTokens.spacing[2],
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityDuration: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  activityBenefit: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  nextRestContainer: {
    marginBottom: DesignTokens.spacing[5],
  },
  nextRestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: DesignTokens.colors.primary[500] + '30',
  },
  nextRestIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextRestContent: {
    flex: 1,
  },
  nextRestTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  nextRestDate: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  actionsContainer: {
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[8],
  },
  actionButton: {
    width: '100%',
  },
});
