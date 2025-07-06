import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Clock, 
  Flame, 
  Zap,
  Plus,
  MoreHorizontal,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface NutritionCardProps {
  meal: {
    id: string;
    name: string;
    time: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    foods: Array<{
      name: string;
      quantity: string;
      calories: number;
    }>;
    image?: string;
    isLogged: boolean;
  };
  onPress?: () => void;
  onAddFood?: () => void;
  onQuickLog?: () => void;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({
  meal,
  onPress,
  onAddFood,
  onQuickLog,
}) => {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const handleAddFood = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddFood?.();
  };

  const getMealIcon = () => {
    switch (meal.name.toLowerCase()) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snacks':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  const getMealGradient = () => {
    switch (meal.name.toLowerCase()) {
      case 'breakfast':
        return ['#FF9A56', '#FF6B35'];
      case 'lunch':
        return ['#4ECDC4', '#44A08D'];
      case 'dinner':
        return ['#667eea', '#764ba2'];
      case 'snacks':
        return ['#f093fb', '#f5576c'];
      default:
        return ['#9E7FFF', '#7C3AED'];
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.95}
    >
      <LinearGradient
        colors={meal.isLogged ? getMealGradient() : ['#1A1A1A', '#2A2A2A']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.mealInfo}>
            <Text style={styles.mealIcon}>{getMealIcon()}</Text>
            <View style={styles.mealDetails}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <View style={styles.timeContainer}>
                <Clock size={14} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.mealTime}>{meal.time}</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {}}
          >
            <MoreHorizontal size={20} color={DesignTokens.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {meal.isLogged ? (
          <>
            {/* Nutrition Summary */}
            <View style={styles.nutritionSummary}>
              <View style={styles.caloriesContainer}>
                <Flame size={20} color="#FFFFFF" />
                <Text style={styles.caloriesText}>{meal.calories}</Text>
                <Text style={styles.caloriesLabel}>calories</Text>
              </View>
              
              <View style={styles.macrosContainer}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{meal.protein}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{meal.carbs}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{meal.fat}g</Text>
                  <Text style={styles.macroLabel}>Fat</Text>
                </View>
              </View>
            </View>

            {/* Food Items */}
            <View style={styles.foodItems}>
              {meal.foods.slice(0, 3).map((food, index) => (
                <View key={index} style={styles.foodItem}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.foodDetails}>
                    {food.quantity} • {food.calories} cal
                  </Text>
                </View>
              ))}
              {meal.foods.length > 3 && (
                <Text style={styles.moreItems}>
                  +{meal.foods.length - 3} more items
                </Text>
              )}
            </View>
          </>
        ) : (
          /* Empty State */
          <View style={styles.emptyState}>
            <Zap size={32} color={DesignTokens.colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No food logged yet</Text>
            <Text style={styles.emptySubtitle}>
              Add foods to track your nutrition
            </Text>
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddFood}
            >
              <Plus size={20} color={DesignTokens.colors.primary[500]} />
              <Text style={styles.addButtonText}>Add Food</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    ...DesignTokens.shadow.lg,
  },
  gradient: {
    padding: DesignTokens.spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  mealInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealIcon: {
    fontSize: 32,
    marginRight: DesignTokens.spacing[3],
  },
  mealDetails: {
    flex: 1,
  },
  mealName: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTime: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
  },
  moreButton: {
    padding: DesignTokens.spacing[2],
  },
  nutritionSummary: {
    marginBottom: DesignTokens.spacing[4],
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  caloriesText: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginLeft: DesignTokens.spacing[2],
  },
  caloriesLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    opacity: 0.8,
    marginLeft: DesignTokens.spacing[1],
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  macroLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    opacity: 0.7,
    marginTop: DesignTokens.spacing[1],
  },
  foodItems: {
    gap: DesignTokens.spacing[2],
  },
  foodItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
  },
  foodName: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginBottom: DesignTokens.spacing[1],
  },
  foodDetails: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    opacity: 0.8,
  },
  moreItems: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    opacity: 0.7,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[6],
  },
  emptyTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginTop: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[1],
  },
  emptySubtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.secondary,
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: DesignTokens.colors.primary[500],
    gap: DesignTokens.spacing[2],
  },
  addButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
