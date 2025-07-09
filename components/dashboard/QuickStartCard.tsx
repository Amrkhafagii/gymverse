/**
 * Enhanced QuickStartCard with Achievement Integration
 * Now supports achievement badges and hints
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface QuickStartCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string[];
  onPress: () => void;
  style?: ViewStyle;
  badge?: string; // Achievement-related badge (emoji or text)
  achievementHint?: {
    name: string;
    progress: number;
    target: number;
  };
}

export const QuickStartCard: React.FC<QuickStartCardProps> = ({
  title,
  subtitle,
  icon,
  gradient,
  onPress,
  style,
  badge,
  achievementHint,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient colors={gradient} style={styles.gradient}>
        {/* Badge */}
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}

        {/* Icon */}
        <View style={styles.iconContainer}>
          {icon}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>

        {/* Achievement Hint */}
        {achievementHint && (
          <View style={styles.achievementHint}>
            <View style={styles.hintProgressBar}>
              <View 
                style={[
                  styles.hintProgressFill,
                  { width: `${(achievementHint.progress / achievementHint.target) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.hintText} numberOfLines={1}>
              {achievementHint.name}
            </Text>
          </View>
        )}

        {/* Arrow */}
        <View style={styles.arrow}>
          <ChevronRight size={20} color="rgba(255, 255, 255, 0.8)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 120,
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.md,
  },

  gradient: {
    flex: 1,
    padding: DesignTokens.spacing[4],
    position: 'relative',
  },

  badge: {
    position: 'absolute',
    top: DesignTokens.spacing[2],
    right: DesignTokens.spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
    zIndex: 2,
  },

  badgeText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  iconContainer: {
    marginBottom: DesignTokens.spacing[2],
  },

  content: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: DesignTokens.spacing[1],
  },

  subtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },

  achievementHint: {
    marginTop: DesignTokens.spacing[2],
    paddingTop: DesignTokens.spacing[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },

  hintProgressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    marginBottom: DesignTokens.spacing[1],
    overflow: 'hidden',
  },

  hintProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },

  hintText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  arrow: {
    position: 'absolute',
    bottom: DesignTokens.spacing[3],
    right: DesignTokens.spacing[3],
  },
});
