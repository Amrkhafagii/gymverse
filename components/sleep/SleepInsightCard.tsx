import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface SleepInsightCardProps {
  insight: {
    id: string;
    type: 'tip' | 'improvement' | 'warning' | 'achievement';
    title: string;
    description: string;
    action?: string;
    priority: 'high' | 'medium' | 'low';
  };
  onActionPress?: (insightId: string) => void;
}

export const SleepInsightCard: React.FC<SleepInsightCardProps> = ({
  insight,
  onActionPress,
}) => {
  const getInsightConfig = () => {
    switch (insight.type) {
      case 'tip':
        return {
          icon: <Lightbulb size={20} color="#FFFFFF" />,
          colors: ['#3B82F6', '#2563EB'],
          bgColor: 'rgba(59, 130, 246, 0.1)',
        };
      case 'improvement':
        return {
          icon: <TrendingUp size={20} color="#FFFFFF" />,
          colors: ['#10B981', '#059669'],
          bgColor: 'rgba(16, 185, 129, 0.1)',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={20} color="#FFFFFF" />,
          colors: ['#F59E0B', '#D97706'],
          bgColor: 'rgba(245, 158, 11, 0.1)',
        };
      case 'achievement':
        return {
          icon: <CheckCircle size={20} color="#FFFFFF" />,
          colors: ['#8B5CF6', '#7C3AED'],
          bgColor: 'rgba(139, 92, 246, 0.1)',
        };
      default:
        return {
          icon: <Lightbulb size={20} color="#FFFFFF" />,
          colors: ['#6B7280', '#4B5563'],
          bgColor: 'rgba(107, 114, 128, 0.1)',
        };
    }
  };

  const getPriorityIndicator = () => {
    switch (insight.priority) {
      case 'high':
        return <View style={[styles.priorityDot, { backgroundColor: '#EF4444' }]} />;
      case 'medium':
        return <View style={[styles.priorityDot, { backgroundColor: '#F59E0B' }]} />;
      case 'low':
        return <View style={[styles.priorityDot, { backgroundColor: '#10B981' }]} />;
      default:
        return null;
    }
  };

  const handleActionPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onActionPress?.(insight.id);
  };

  const config = getInsightConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <View style={styles.header}>
        <LinearGradient
          colors={config.colors}
          style={styles.iconContainer}
        >
          {config.icon}
        </LinearGradient>
        
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{insight.title}</Text>
            {getPriorityIndicator()}
          </View>
          <Text style={styles.description}>{insight.description}</Text>
        </View>
      </View>

      {insight.action && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleActionPress}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>{insight.action}</Text>
          <ArrowRight size={16} color={DesignTokens.colors.primary[500]} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[3],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignTokens.spacing[3],
  },
  headerContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[1],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    flex: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: DesignTokens.spacing[2],
  },
  description: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: DesignTokens.typography.fontSize.sm * 1.4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: DesignTokens.spacing[3],
    paddingTop: DesignTokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
  },
  actionText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
