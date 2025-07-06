import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Target,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface NutritionInsightCardProps {
  insight: {
    id: string;
    type: 'success' | 'warning' | 'info' | 'tip';
    title: string;
    description: string;
    action?: string;
    trend?: 'up' | 'down' | 'stable';
    value?: string;
  };
  onPress?: () => void;
  onActionPress?: () => void;
}

export const NutritionInsightCard: React.FC<NutritionInsightCardProps> = ({
  insight,
  onPress,
  onActionPress,
}) => {
  const getInsightIcon = () => {
    switch (insight.type) {
      case 'success':
        return <CheckCircle size={24} color="#10B981" />;
      case 'warning':
        return <AlertCircle size={24} color="#F59E0B" />;
      case 'info':
        return <Target size={24} color="#3B82F6" />;
      case 'tip':
        return <Lightbulb size={24} color="#8B5CF6" />;
      default:
        return <Target size={24} color="#6B7280" />;
    }
  };

  const getTrendIcon = () => {
    if (!insight.trend) return null;
    
    switch (insight.trend) {
      case 'up':
        return <TrendingUp size={16} color="#10B981" />;
      case 'down':
        return <TrendingDown size={16} color="#EF4444" />;
      default:
        return null;
    }
  };

  const getGradientColors = () => {
    switch (insight.type) {
      case 'success':
        return ['#10B981', '#059669'];
      case 'warning':
        return ['#F59E0B', '#D97706'];
      case 'info':
        return ['#3B82F6', '#2563EB'];
      case 'tip':
        return ['#8B5CF6', '#7C3AED'];
      default:
        return ['#6B7280', '#4B5563'];
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {getInsightIcon()}
          </View>
          
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{insight.title}</Text>
              {insight.value && (
                <View style={styles.valueContainer}>
                  {getTrendIcon()}
                  <Text style={styles.value}>{insight.value}</Text>
                </View>
              )}
            </View>
            <Text style={styles.description}>{insight.description}</Text>
          </View>
        </View>

        {insight.action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onActionPress}
          >
            <LinearGradient
              colors={getGradientColors()}
              style={styles.actionGradient}
            >
              <Text style={styles.actionText}>{insight.action}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[3],
  },
  card: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: DesignTokens.spacing[3],
    marginTop: DesignTokens.spacing[1],
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  value: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  description: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    overflow: 'hidden',
  },
  actionGradient: {
    paddingVertical: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[4],
    alignItems: 'center',
  },
  actionText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
