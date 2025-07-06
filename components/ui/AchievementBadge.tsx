import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '@/design-system/tokens';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
  };
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  showProgress?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'medium',
  onPress,
  showProgress = false,
}) => {
  const getRarityColors = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return ['#6B7280', '#4B5563'];
      case 'rare':
        return ['#3B82F6', '#1D4ED8'];
      case 'epic':
        return ['#8B5CF6', '#7C3AED'];
      case 'legendary':
        return ['#F59E0B', '#D97706'];
      default:
        return ['#6B7280', '#4B5563'];
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 60, height: 60 },
          icon: { fontSize: 20 },
          name: { fontSize: 10 },
        };
      case 'large':
        return {
          container: { width: 100, height: 100 },
          icon: { fontSize: 36 },
          name: { fontSize: 14 },
        };
      default:
        return {
          container: { width: 80, height: 80 },
          icon: { fontSize: 28 },
          name: { fontSize: 12 },
        };
    }
  };

  const isUnlocked = !!achievement.unlockedAt;
  const colors = getRarityColors(achievement.rarity);
  const sizeStyles = getSizeStyles();

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component 
      style={[styles.container, sizeStyles.container]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <LinearGradient
        colors={isUnlocked ? colors : ['#374151', '#1F2937']}
        style={styles.gradient}
      >
        <Text style={[
          styles.icon, 
          sizeStyles.icon,
          { opacity: isUnlocked ? 1 : 0.5 }
        ]}>
          {achievement.icon}
        </Text>
        
        {size !== 'small' && (
          <Text style={[
            styles.name,
            sizeStyles.name,
            { opacity: isUnlocked ? 1 : 0.7 }
          ]} numberOfLines={2}>
            {achievement.name}
          </Text>
        )}

        {showProgress && achievement.progress && !isUnlocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${(achievement.progress.current / achievement.progress.target) * 100}%`,
                    backgroundColor: colors[0]
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress.current}/{achievement.progress.target}
            </Text>
          </View>
        )}

        {isUnlocked && (
          <View style={styles.unlockedIndicator}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}

        <View style={[styles.rarityBorder, { borderColor: colors[0] }]} />
      </LinearGradient>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    margin: DesignTokens.spacing[2],
    ...DesignTokens.shadow.base,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignTokens.spacing[2],
    position: 'relative',
  },
  icon: {
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[1],
  },
  name: {
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    textAlign: 'center',
    lineHeight: 14,
  },
  progressContainer: {
    position: 'absolute',
    bottom: DesignTokens.spacing[2],
    left: DesignTokens.spacing[2],
    right: DesignTokens.spacing[2],
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: DesignTokens.spacing[1],
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 8,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  unlockedIndicator: {
    position: 'absolute',
    top: DesignTokens.spacing[1],
    right: DesignTokens.spacing[1],
    backgroundColor: '#10B981',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 10,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  rarityBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: DesignTokens.borderRadius.lg,
  },
});
