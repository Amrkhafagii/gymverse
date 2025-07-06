import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Apple,
  Utensils,
  Coffee,
  Cookie,
  TrendingUp,
  Target,
  Clock,
  Zap,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface NutritionCardProps {
  title: string;
  value: string | number;
  unit?: string;
  target?: number;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
  type: 'calories' | 'protein' | 'carbs' | 'fat' | 'water' | 'fiber';
  onPress?: () => void;
}

export default function NutritionCard({
  title,
  value,
  unit,
  target,
  percentage,
  trend,
  type,
  onPress,
}: NutritionCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'calories': return <Zap size={20} color="#fff" />;
      case 'protein': return <Target size={20} color="#fff" />;
      case 'carbs': return <Cookie size={20} color="#fff" />;
      case 'fat': return <Apple size={20} color="#fff" />;
      case 'water': return <Coffee size={20} color="#fff" />;
      case 'fiber': return <Utensils size={20} color="#fff" />;
      default: return <Utensils size={20} color="#fff" />;
    }
  };

  const getGradientColors = () => {
    switch (type) {
      case 'calories': return ['#ef4444', '#dc2626'];
      case 'protein': return ['#10b981', '#059669'];
      case 'carbs': return ['#f59e0b', '#d97706'];
      case 'fat': return ['#8b5cf6', '#7c3aed'];
      case 'water': return ['#06b6d4', '#0891b2'];
      case 'fiber': return ['#84cc16', '#65a30d'];
      default: return ['#6b7280', '#4b5563'];
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up': return <TrendingUp size={12} color="#10b981" />;
      case 'down': return <TrendingUp size={12} color="#ef4444" style={{ transform: [{ rotate: '180deg' }] }} />;
      case 'stable': return <Clock size={12} color="#6b7280" />;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={getGradientColors()} style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>
          {getTrendIcon()}
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Text>
            {unit && <Text style={styles.unit}>{unit}</Text>}
          </View>
          
          {target && (
            <Text style={styles.target}>
              of {target.toLocaleString()}{unit} target
            </Text>
          )}
          
          {percentage !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min(percentage, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    flex: 1,
    minHeight: 120,
  },
  gradient: {
    flex: 1,
    padding: DesignTokens.spacing[4],
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[2],
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    opacity: 0.9,
    marginBottom: DesignTokens.spacing[1],
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: DesignTokens.spacing[1],
  },
  value: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: 'SF Mono',
  },
  unit: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    opacity: 0.8,
    marginLeft: DesignTokens.spacing[1],
  },
  target: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    opacity: 0.7,
    marginBottom: DesignTokens.spacing[2],
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: DesignTokens.colors.text.primary,
    borderRadius: 2,
  },
  percentage: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: 'SF Mono',
    minWidth: 32,
    textAlign: 'right',
  },
});
