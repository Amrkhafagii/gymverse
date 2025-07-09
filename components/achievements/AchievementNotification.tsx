/**
 * Achievement Notification Component
 * Shows floating notifications when achievements are unlocked
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, X, Star } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface AchievementNotificationProps {
  achievement: Achievement;
  onPress: () => void;
  onDismiss: () => void;
  style?: ViewStyle;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onPress,
  onDismiss,
  style,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getRarityColors = () => {
    switch (achievement.rarity) {
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

  const getRarityIcon = () => {
    switch (achievement.rarity) {
      case 'legendary':
        return <Star size={16} color="#FFFFFF" fill="#FFFFFF" />;
      case 'epic':
        return <Star size={16} color="#FFFFFF" />;
      default:
        return <Trophy size={16} color="#FFFFFF" />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <LinearGradient colors={getRarityColors()} style={styles.gradient}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                {getRarityIcon()}
              </View>
              <Text style={styles.headerText}>Achievement Unlocked!</Text>
            </View>
            
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.achievementIcon}>
              <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
            </View>
            
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName} numberOfLines={1}>
                {achievement.name}
              </Text>
              <Text style={styles.achievementDescription} numberOfLines={2}>
                {achievement.description}
              </Text>
            </View>

            <View style={styles.pointsContainer}>
              <Text style={styles.pointsText}>+{achievement.points}</Text>
              <Text style={styles.pointsLabel}>pts</Text>
            </View>
          </View>

          {/* Rarity Badge */}
          <View style={styles.rarityBadge}>
            <Text style={styles.rarityText}>
              {achievement.rarity.toUpperCase()}
            </Text>
          </View>

          {/* Sparkle Effect */}
          <View style={styles.sparkleContainer}>
            {[...Array(3)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.sparkle,
                  {
                    opacity: opacityAnim,
                    transform: [
                      {
                        rotate: opacityAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Star size={8} color="rgba(255, 255, 255, 0.6)" fill="rgba(255, 255, 255, 0.6)" />
              </Animated.View>
            ))}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.lg,
  },

  touchable: {
    flex: 1,
  },

  gradient: {
    padding: DesignTokens.spacing[4],
    position: 'relative',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },

  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  headerText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  dismissButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },

  achievementIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  achievementEmoji: {
    fontSize: 20,
  },

  achievementInfo: {
    flex: 1,
  },

  achievementName: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: DesignTokens.spacing[1],
  },

  achievementDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },

  pointsContainer: {
    alignItems: 'center',
  },

  pointsText: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  pointsLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  rarityBadge: {
    position: 'absolute',
    top: DesignTokens.spacing[2],
    right: DesignTokens.spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  rarityText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },

  sparkle: {
    position: 'absolute',
  },
});
