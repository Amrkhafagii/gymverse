import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target,
  ArrowRight,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface NutritionInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'achievement' | 'tip';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

interface NutritionInsightCardProps {
  insight: NutritionInsight;
  onPress?: () => void;
  onAction?: () => void;
}

export default function NutritionInsightCard({
  insight,
  onPress,
  onAction,
}: NutritionInsightCardProps) {
  const getIcon = () => {
    switch (insight.type) {
      case 'recommendation': return <Brain size={20} color="#fff" />;
      case 'warning': return <AlertTriangle size={20} color="#fff" />;
      case 'achievement': return <CheckCircle size={20} color="#fff" />;
      case 'tip': return <Lightbulb size={20} color="#fff" />;
      default: return <Target size={20} color="#fff" />;
    }
  };

  const getGradientColors = () => {
    switch (insight.type) {
      case 'recommendation': return ['#3b82f6', '#2563eb'];
      case 'warning': return ['#f59e0b', '#d97706'];
      case 'achievement': return ['#10b981', '#059669'];
      case 'tip': return ['#8b5cf6', '#7c3aed'];
      default: return ['#6b7280', '#4b5563'];
    }
  };

  const getBorderColor = () => {
    switch (insight.priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { borderColor: getBorderColor() }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient colors={['#1f2937', '#111827']} style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <LinearGradient colors={getGradientColors()} style={styles.iconGradient}>
              {getIcon()}
            </LinearGradient>
          </View>
          
          <View style={styles.headerContent}>
            <Text style={styles.title}>{insight.title}</Text>
            <View style={styles.typeContainer}>
              <Text style={[styles.type, { color: getGradientColors()[0] }]}>
                {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
              </Text>
              {insight.priority === 'high' && (
                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityText}>High Priority</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.description}>{insight.description}</Text>

        {insight.action && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onAction}
          >
            <LinearGradient colors={getGradientColors()} style={styles.actionGradient}>
              <Text style={styles.actionText}>{insight.action}</Text>
              <ArrowRight size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[3],
    borderWidth: 1,
  },
  gradient: {
    padding: DesignTokens.spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[3],
  },
  iconContainer: {
    marginRight: DesignTokens.spacing[3],
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  type: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: 2,
    borderRadius: DesignTokens.borderRadius.sm,
  },
  priorityText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  description: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
    marginBottom: DesignTokens.spacing[3],
  },
  actionButton: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    gap: DesignTokens.spacing[2],
  },
  actionText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
