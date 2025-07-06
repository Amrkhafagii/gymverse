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
  Plus,
  Camera,
  Search,
  Target,
  TrendingUp,
  Calendar,
  Settings,
  Utensils,
  Coffee,
  Apple,
  Cookie,
  Droplets,
  Brain,
  Award,
  Clock,
} from 'lucide-react-native';
import { useDeviceAuth } from '@/contexts/DeviceAuthContext';
import NutritionCard from '@/components/nutrition/NutritionCard';
import MacroRingChart from '@/components/nutrition/MacroRingChart';
import NutritionInsightCard from '@/components/nutrition/NutritionInsightCard';
import * as Haptics from 'expo-haptics';

interface NutritionData {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
  water: { current: number; target: number };
  fiber: { current: number; target: number };
}

interface MealEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface NutritionInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'achievement' | 'tip';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

export default function NutritionScreen() {
  const { user, isAuthenticated } = useDeviceAuth();
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    calories: { current: 1847, target: 2200 },
    protein: { current: 89, target: 150 },
    carbs: { current: 156, target: 275 },
    fat: { current: 67, target: 73 },
    water: { current: 6, target: 8 },
    fiber: { current: 18, target: 25 },
  });
  
  const [todaysMeals, setTodaysMeals] = useState<MealEntry[]>([
    {
      id: '1',
      name: 'Greek Yogurt with Berries',
      calories: 180,
      protein: 15,
      carbs: 20,
      fat: 6,
      time: '08:30',
      meal_type: 'breakfast',
    },
    {
      id: '2',
      name: 'Grilled Chicken Salad',
      calories: 420,
      protein: 35,
      carbs: 12,
      fat: 28,
      time: '12:45',
      meal_type: 'lunch',
    },
    {
      id: '3',
      name: 'Salmon with Quinoa',
      calories: 580,
      protein: 39,
      carbs: 45,
      fat: 25,
      time: '19:15',
      meal_type: 'dinner',
    },
    {
      id: '4',
      name: 'Mixed Nuts',
      calories: 160,
      protein: 6,
      carbs: 8,
      fat: 14,
      time: '15:30',
      meal_type: 'snack',
    },
  ]);

  const [insights, setInsights] = useState<NutritionInsight[]>([
    {
      id: '1',
      type: 'recommendation',
      title: 'Increase Protein Intake',
      description: 'You\'re 61g short of your protein goal. Consider adding a protein shake or lean meat to your next meal.',
      action: 'View Protein Sources',
      priority: 'high',
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Great Fiber Intake!',
      description: 'You\'re doing well with fiber today. This supports digestive health and helps you feel full.',
      priority: 'low',
    },
    {
      id: '3',
      type: 'tip',
      title: 'Hydration Reminder',
      description: 'You\'re close to your water goal! Drink 2 more glasses to stay optimally hydrated.',
      action: 'Log Water',
      priority: 'medium',
    },
    {
      id: '4',
      type: 'warning',
      title: 'Low Calorie Intake',
      description: 'You\'re 353 calories below your target. Make sure you\'re eating enough to fuel your workouts.',
      action: 'Add Meal',
      priority: 'high',
    },
  ]);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNutritionData();
  }, []);

  const loadNutritionData = async () => {
    try {
      setLoading(true);
      // In real app, load from API/database
      // Mock data is already set in state
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNutritionData();
    setRefreshing(false);
  };

  const handleAddMeal = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Add Meal',
      'Choose how you\'d like to add your meal:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Search Foods', onPress: () => console.log('Search foods') },
        { text: 'Scan Barcode', onPress: () => console.log('Scan barcode') },
        { text: 'Take Photo', onPress: () => console.log('Take photo') },
      ]
    );
  };

  const handleQuickAdd = async (type: 'water' | 'snack') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (type === 'water') {
      setNutritionData(prev => ({
        ...prev,
        water: {
          ...prev.water,
          current: Math.min(prev.water.current + 1, prev.water.target),
        },
      }));
    }
  };

  const handleInsightAction = async (insight: NutritionInsight) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (insight.action) {
      case 'View Protein Sources':
        Alert.alert('Protein Sources', 'Here are some high-protein foods to consider...');
        break;
      case 'Log Water':
        handleQuickAdd('water');
        break;
      case 'Add Meal':
        handleAddMeal();
        break;
      default:
        console.log('Insight action:', insight.action);
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return <Coffee size={16} color="#f59e0b" />;
      case 'lunch': return <Utensils size={16} color="#10b981" />;
      case 'dinner': return <Apple size={16} color="#ef4444" />;
      case 'snack': return <Cookie size={16} color="#8b5cf6" />;
      default: return <Utensils size={16} color="#6b7280" />;
    }
  };

  const macroData = {
    protein: { 
      current: nutritionData.protein.current, 
      target: nutritionData.protein.target, 
      color: '#10b981' 
    },
    carbs: { 
      current: nutritionData.carbs.current, 
      target: nutritionData.carbs.target, 
      color: '#f59e0b' 
    },
    fat: { 
      current: nutritionData.fat.current, 
      target: nutritionData.fat.target, 
      color: '#8b5cf6' 
    },
  };

  const caloriesPercentage = (nutritionData.calories.current / nutritionData.calories.target) * 100;
  const proteinPercentage = (nutritionData.protein.current / nutritionData.protein.target) * 100;
  const carbsPercentage = (nutritionData.carbs.current / nutritionData.carbs.target) * 100;
  const fatPercentage = (nutritionData.fat.current / nutritionData.fat.target) * 100;
  const waterPercentage = (nutritionData.water.current / nutritionData.water.target) * 100;
  const fiberPercentage = (nutritionData.fiber.current / nutritionData.fiber.target) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Brain size={32} color="#10b981" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Nutrition AI</Text>
              <Text style={styles.headerSubtitle}>Smart nutrition tracking</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Calendar size={24} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Settings size={24} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>
              {Math.round(caloriesPercentage)}%
            </Text>
            <Text style={styles.quickStatLabel}>Daily Goal</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{todaysMeals.length}</Text>
            <Text style={styles.quickStatLabel}>Meals Logged</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>
              {insights.filter(i => i.priority === 'high').length}
            </Text>
            <Text style={styles.quickStatLabel}>Insights</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction} onPress={handleAddMeal}>
              <LinearGradient colors={['#10b981', '#059669']} style={styles.quickActionGradient}>
                <Plus size={20} color="#fff" />
                <Text style={styles.quickActionText}>Add Meal</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.quickActionGradient}>
                <Camera size={20} color="#fff" />
                <Text style={styles.quickActionText}>Scan Food</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => handleQuickAdd('water')}
            >
              <LinearGradient colors={['#06b6d4', '#0891b2']} style={styles.quickActionGradient}>
                <Droplets size={20} color="#fff" />
                <Text style={styles.quickActionText}>Add Water</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Macro Ring Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Macros</Text>
          <MacroRingChart data={macroData} />
        </View>

        {/* Nutrition Cards Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Overview</Text>
          <View style={styles.nutritionGrid}>
            <NutritionCard
              title="Calories"
              value={nutritionData.calories.current}
              unit="kcal"
              target={nutritionData.calories.target}
              percentage={caloriesPercentage}
              trend="up"
              type="calories"
            />
            <NutritionCard
              title="Protein"
              value={nutritionData.protein.current}
              unit="g"
              target={nutritionData.protein.target}
              percentage={proteinPercentage}
              trend="down"
              type="protein"
            />
          </View>
          
          <View style={styles.nutritionGrid}>
            <NutritionCard
              title="Carbs"
              value={nutritionData.carbs.current}
              unit="g"
              target={nutritionData.carbs.target}
              percentage={carbsPercentage}
              trend="stable"
              type="carbs"
            />
            <NutritionCard
              title="Fat"
              value={nutritionData.fat.current}
              unit="g"
              target={nutritionData.fat.target}
              percentage={fatPercentage}
              trend="up"
              type="fat"
            />
          </View>
          
          <View style={styles.nutritionGrid}>
            <NutritionCard
              title="Water"
              value={nutritionData.water.current}
              unit="glasses"
              target={nutritionData.water.target}
              percentage={waterPercentage}
              trend="up"
              type="water"
            />
            <NutritionCard
              title="Fiber"
              value={nutritionData.fiber.current}
              unit="g"
              target={nutritionData.fiber.target}
              percentage={fiberPercentage}
              trend="up"
              type="fiber"
            />
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Insights</Text>
            <View style={styles.insightsBadge}>
              <Brain size={14} color="#10b981" />
              <Text style={styles.insightsBadgeText}>
                {insights.filter(i => i.priority === 'high').length} Priority
              </Text>
            </View>
          </View>
          
          {insights.map((insight) => (
            <NutritionInsightCard
              key={insight.id}
              insight={insight}
              onAction={() => handleInsightAction(insight)}
            />
          ))}
        </View>

        {/* Today's Meals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <TouchableOpacity onPress={handleAddMeal}>
              <Plus size={20} color="#10b981" />
            </TouchableOpacity>
          </View>
          
          {todaysMeals.map((meal) => (
            <View key={meal.id} style={styles.mealCard}>
              <LinearGradient colors={['#1f2937', '#111827']} style={styles.mealGradient}>
                <View style={styles.mealHeader}>
                  <View style={styles.mealInfo}>
                    <View style={styles.mealTitleRow}>
                      {getMealTypeIcon(meal.meal_type)}
                      <Text style={styles.mealName}>{meal.name}</Text>
                    </View>
                    <View style={styles.mealMeta}>
                      <Clock size={12} color="#999" />
                      <Text style={styles.mealTime}>{meal.time}</Text>
                      <Text style={styles.mealType}>
                        {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.mealStats}>
                    <Text style={styles.mealCalories}>{meal.calories}</Text>
                    <Text style={styles.mealCaloriesLabel}>kcal</Text>
                  </View>
                </View>
                
                <View style={styles.mealMacros}>
                  <View style={styles.mealMacro}>
                    <Text style={styles.mealMacroValue}>{meal.protein}g</Text>
                    <Text style={styles.mealMacroLabel}>Protein</Text>
                  </View>
                  <View style={styles.mealMacro}>
                    <Text style={styles.mealMacroValue}>{meal.carbs}g</Text>
                    <Text style={styles.mealMacroLabel}>Carbs</Text>
                  </View>
                  <View style={styles.mealMacro}>
                    <Text style={styles.mealMacroValue}>{meal.fat}g</Text>
                    <Text style={styles.mealMacroLabel}>Fat</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Weekly Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weeklyStats}>
            <View style={styles.weeklyStat}>
              <LinearGradient colors={['#10b981', '#059669']} style={styles.weeklyStatGradient}>
                <Target size={24} color="#fff" />
                <Text style={styles.weeklyStatValue}>5/7</Text>
                <Text style={styles.weeklyStatLabel}>Goals Met</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.weeklyStat}>
              <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.weeklyStatGradient}>
                <TrendingUp size={24} color="#fff" />
                <Text style={styles.weeklyStatValue}>+2.1kg</Text>
                <Text style={styles.weeklyStatLabel}>Avg Protein</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.weeklyStat}>
              <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.weeklyStatGradient}>
                <Award size={24} color="#fff" />
                <Text style={styles.weeklyStatValue}>12</Text>
                <Text style={styles.weeklyStatLabel}>Streak Days</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    marginBottom: 20,
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
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  insightsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  insightsBadgeText: {
    fontSize: 12,
    color: '#10b981',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  quickActionText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  nutritionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  mealCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  mealGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  mealMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealTime: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  mealType: {
    fontSize: 12,
    color: '#10b981',
    fontFamily: 'Inter-Medium',
  },
  mealStats: {
    alignItems: 'flex-end',
  },
  mealCalories: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  mealCaloriesLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  mealMacros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
  },
  mealMacro: {
    alignItems: 'center',
  },
  mealMacroValue: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  mealMacroLabel: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  weeklyStats: {
    flexDirection: 'row',
    gap: 12,
  },
  weeklyStat: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  weeklyStatGradient: {
    padding: 20,
    alignItems: 'center',
  },
  weeklyStatValue: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  weeklyStatLabel: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    opacity: 0.8,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
});
