import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Apple,
  Target,
  TrendingUp,
  Calendar,
  Search,
  Plus,
  Camera,
  Scan,
  BookOpen,
  Award,
  Zap,
  Droplets,
  Scale,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { DesignTokens } from '@/design-system/tokens';
import { NutritionCard } from '@/components/nutrition/NutritionCard';
import { MacroRingChart } from '@/components/nutrition/MacroRingChart';
import { NutritionInsightCard } from '@/components/nutrition/NutritionInsightCard';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import * as Haptics from 'expo-haptics';

export default function NutritionScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Mock data
  const dailyGoals = {
    calories: { current: 1850, target: 2200 },
    protein: { current: 125, target: 150, color: '#10B981' },
    carbs: { current: 180, target: 220, color: '#3B82F6' },
    fat: { current: 65, target: 80, color: '#F59E0B' },
    water: { current: 6, target: 8 },
  };

  const meals = [
    {
      id: '1',
      name: 'Breakfast',
      time: '8:30 AM',
      calories: 450,
      protein: 25,
      carbs: 45,
      fat: 18,
      foods: [
        { name: 'Greek Yogurt', quantity: '1 cup', calories: 150 },
        { name: 'Blueberries', quantity: '1/2 cup', calories: 40 },
        { name: 'Granola', quantity: '1/4 cup', calories: 120 },
        { name: 'Honey', quantity: '1 tbsp', calories: 60 },
        { name: 'Almonds', quantity: '10 pieces', calories: 80 },
      ],
      isLogged: true,
    },
    {
      id: '2',
      name: 'Lunch',
      time: '12:30 PM',
      calories: 650,
      protein: 45,
      carbs: 55,
      fat: 25,
      foods: [
        { name: 'Grilled Chicken', quantity: '6 oz', calories: 280 },
        { name: 'Brown Rice', quantity: '1 cup', calories: 220 },
        { name: 'Broccoli', quantity: '1 cup', calories: 30 },
        { name: 'Olive Oil', quantity: '1 tbsp', calories: 120 },
      ],
      isLogged: true,
    },
    {
      id: '3',
      name: 'Dinner',
      time: '7:00 PM',
      calories: 750,
      protein: 55,
      carbs: 80,
      fat: 22,
      foods: [],
      isLogged: false,
    },
    {
      id: '4',
      name: 'Snacks',
      time: 'Throughout day',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      foods: [],
      isLogged: false,
    },
  ];

  const insights = [
    {
      id: '1',
      type: 'success' as const,
      title: 'Great protein intake!',
      description: 'You\'re 83% towards your protein goal. Keep it up!',
      trend: 'up' as const,
      value: '+15g',
    },
    {
      id: '2',
      type: 'warning' as const,
      title: 'Low on calories',
      description: 'You\'re 350 calories below your target. Consider a healthy snack.',
      action: 'View Snack Ideas',
      trend: 'down' as const,
      value: '-350 cal',
    },
    {
      id: '3',
      type: 'tip' as const,
      title: 'Hydration reminder',
      description: 'You\'re doing well! 2 more glasses to reach your water goal.',
      action: 'Log Water',
      value: '6/8 glasses',
    },
  ];

  const weeklyStats = [
    {
      label: 'Avg Calories',
      value: '2,050',
      unit: 'cal/day',
      trend: 'up' as const,
      trendValue: '+150',
      icon: <Target size={20} color="#4ECDC4" />,
      color: '#4ECDC4',
    },
    {
      label: 'Protein Goal',
      value: '85',
      unit: '% hit',
      trend: 'up' as const,
      trendValue: '+12%',
      icon: <Award size={20} color="#10B981" />,
      color: '#10B981',
    },
    {
      label: 'Water Intake',
      value: '7.2',
      unit: 'glasses',
      trend: 'up' as const,
      trendValue: '+0.8',
      icon: <Droplets size={20} color="#3B82F6" />,
      color: '#3B82F6',
    },
  ];

  const quickActions = [
    {
      title: 'Scan Barcode',
      icon: <Scan size={20} color="#FFFFFF" />,
      gradient: ['#9E7FFF', '#7C3AED'],
      onPress: () => router.push('/barcode-scanner'),
    },
    {
      title: 'Photo Food',
      icon: <Camera size={20} color="#FFFFFF" />,
      gradient: ['#10B981', '#059669'],
      onPress: () => router.push('/photo-food'),
    },
    {
      title: 'Search Food',
      icon: <Search size={20} color="#FFFFFF" />,
      gradient: ['#3B82F6', '#2563EB'],
      onPress: () => router.push('/food-search'),
    },
    {
      title: 'Meal Plans',
      icon: <BookOpen size={20} color="#FFFFFF" />,
      gradient: ['#F59E0B', '#D97706'],
      onPress: () => router.push('/meal-plans'),
    },
  ];

  const getCalorieProgress = () => {
    return (dailyGoals.calories.current / dailyGoals.calories.target) * 100;
  };

  const getWaterProgress = () => {
    return (dailyGoals.water.current / dailyGoals.water.target) * 100;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Apple size={28} color={DesignTokens.colors.primary[500]} />
            <Text style={styles.title}>Nutrition</Text>
          </View>
          
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => Alert.alert('Date Picker', 'This would open a date picker')}
          >
            <Calendar size={20} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.dateText}>Today</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Overview */}
        <View style={styles.dailyOverview}>
          <View style={styles.calorieProgress}>
            <View style={styles.calorieHeader}>
              <Text style={styles.calorieTitle}>Daily Calories</Text>
              <Text style={styles.calorieValue}>
                {dailyGoals.calories.current} / {dailyGoals.calories.target}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min(getCalorieProgress(), 100)}%`,
                    backgroundColor: getCalorieProgress() > 100 ? 
                      DesignTokens.colors.warning[500] : 
                      DesignTokens.colors.primary[500]
                  }
                ]}
              />
            </View>
            <Text style={styles.remainingText}>
              {dailyGoals.calories.target - dailyGoals.calories.current > 0 ? 
                `${dailyGoals.calories.target - dailyGoals.calories.current} calories remaining` :
                `${dailyGoals.calories.current - dailyGoals.calories.target} calories over`
              }
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickActionsScroll}
          >
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickAction}
                onPress={action.onPress}
              >
                <LinearGradient
                  colors={action.gradient}
                  style={styles.quickActionGradient}
                >
                  {action.icon}
                  <Text style={styles.quickActionText}>{action.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Macro Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Macronutrients</Text>
          <View style={styles.macroChartContainer}>
            <MacroRingChart
              protein={dailyGoals.protein}
              carbs={dailyGoals.carbs}
              fat={dailyGoals.fat}
              size={180}
            />
          </View>
        </View>

        {/* Weekly Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statsGrid}>
            {weeklyStats.map((stat, index) => (
              <StatCard
                key={index}
                {...stat}
                onPress={() => router.push('/nutrition-analytics')}
              />
            ))}
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Insights</Text>
            <TouchableOpacity onPress={() => router.push('/nutrition-insights')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {insights.map((insight) => (
            <NutritionInsightCard
              key={insight.id}
              insight={insight}
              onPress={() => router.push('/nutrition-detail')}
              onActionPress={() => {
                if (insight.action === 'View Snack Ideas') {
                  router.push('/snack-ideas');
                } else if (insight.action === 'Log Water') {
                  Alert.alert('Water Logged', 'Added 1 glass of water!');
                }
              }}
            />
          ))}
        </View>

        {/* Meals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {meals.map((meal) => (
            <NutritionCard
              key={meal.id}
              meal={meal}
              onPress={() => router.push('/meal-detail')}
              onAddFood={() => router.push('/add-food')}
            />
          ))}
        </View>

        {/* Water Tracking */}
        <View style={styles.section}>
          <View style={styles.waterCard}>
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.waterGradient}
            >
              <View style={styles.waterHeader}>
                <Droplets size={24} color="#FFFFFF" />
                <Text style={styles.waterTitle}>Water Intake</Text>
              </View>
              
              <View style={styles.waterProgress}>
                <Text style={styles.waterValue}>
                  {dailyGoals.water.current} / {dailyGoals.water.target} glasses
                </Text>
                <View style={styles.waterProgressBar}>
                  <View 
                    style={[
                      styles.waterProgressFill,
                      { width: `${getWaterProgress()}%` }
                    ]}
                  />
                </View>
              </View>

              <View style={styles.waterGlasses}>
                {Array.from({ length: dailyGoals.water.target }, (_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.waterGlass,
                      index < dailyGoals.water.current && styles.waterGlassFilled
                    ]}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      // Toggle water glass
                    }}
                  >
                    <Droplets 
                      size={16} 
                      color={index < dailyGoals.water.current ? "#FFFFFF" : "rgba(255,255,255,0.3)"} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Weight Tracking */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.weightCard}
            onPress={() => router.push('/weight-tracking')}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.weightGradient}
            >
              <Scale size={24} color="#FFFFFF" />
              <View style={styles.weightContent}>
                <Text style={styles.weightTitle}>Weight Tracking</Text>
                <Text style={styles.weightSubtitle}>Log your weight progress</Text>
              </View>
              <Text style={styles.weightValue}>165.2 lbs</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
  },
  header: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingTop: DesignTokens.spacing[2],
    paddingBottom: DesignTokens.spacing[4],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: DesignTokens.typography.fontSize['3xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginLeft: DesignTokens.spacing[3],
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.secondary,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.lg,
    gap: DesignTokens.spacing[2],
  },
  dateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  dailyOverview: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
  },
  calorieProgress: {
    alignItems: 'center',
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: DesignTokens.spacing[3],
  },
  calorieTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  calorieValue: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[2],
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  remainingText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: DesignTokens.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  seeAllText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  quickActionsScroll: {
    paddingLeft: DesignTokens.spacing[5],
  },
  quickAction: {
    marginRight: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  quickActionGradient: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    minWidth: 100,
  },
  quickActionText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textAlign: 'center',
  },
  macroChartContainer: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[4],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
    paddingHorizontal: DesignTokens.spacing[5],
  },
  waterCard: {
    marginHorizontal: DesignTokens.spacing[5],
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
  },
  waterGradient: {
    padding: DesignTokens.spacing[4],
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  waterTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginLeft: DesignTokens.spacing[2],
  },
  waterProgress: {
    marginBottom: DesignTokens.spacing[4],
  },
  waterValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginBottom: DesignTokens.spacing[2],
  },
  waterProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  waterProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  waterGlasses: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waterGlass: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterGlassFilled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  weightCard: {
    marginHorizontal: DesignTokens.spacing[5],
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
  },
  weightGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing[4],
    gap: DesignTokens.spacing[3],
  },
  weightContent: {
    flex: 1,
  },
  weightTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  weightSubtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    opacity: 0.8,
  },
  weightValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
});
