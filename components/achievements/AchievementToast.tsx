import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Trophy, Star, Crown, Sparkles } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { Achievement, AchievementRarity } from '@/types/achievement';

const { width } = Dimensions.get('window');

interface AchievementToastProps {
  achievement: Achievement;
  visible: boolean;
  onPress?: () => void;
  onDismiss: () => void;
  duration?: number;
}

export function AchievementToast({
  achievement,
  visible,
  onPress,
  onDismiss,
  duration = 4000,
}: AchievementToastProps) {
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      showToast();
    } else {
      hideToast();
    }
  }, [visible]);

  const showToast = () => {
    // Reset animations
    slideAnim.setValue(-width);
    progressAnim.setValue(0);

    // Slide in
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start();

    // Auto dismiss
    setTimeout(() => {
      hideToast();
    }, duration);
  };

  const hideToast = () => {
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    hideToast();
  };

  const getRarityColors = (rarity: AchievementRarity): string[] => {
    switch (rarity) {
      case 'common':
        return ['#6b7280', '#4b5563'];
      case 'rare':
        return ['#3b82f6', '#2563eb'];
      case 'epic':
        return ['#8b5cf6', '#7c3aed'];
      case 'legendary':
        return ['#f59e0b', '#d97706'];
      default:
        return ['#6b7280', '#4b5563'];
    }
  };

  const getRarityIcon = (rarity: AchievementRarity) => {
    switch (rarity) {
      case 'common':
        return <Star size={16} color="#FFFFFF" />;
      case 'rare':
        return <Trophy size={16} color="#FFFFFF" />;
      case 'epic':
        return <Crown size={16} color="#FFFFFF" />;
      case 'legendary':
        return <Sparkles size={16} color="#FFFFFF" />;
      default:
        return <Star size={16} color="#FFFFFF" />;
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.toast}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={getRarityColors(achievement.rarity)}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
            </View>
            
            <View style={styles.textContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Achievement Unlocked!</Text>
                <View style={styles.rarityBadge}>
                  {getRarityIcon(achievement.rarity)}
                </View>
              </View>
              
              <Text style={styles.achievementName} numberOfLines={1}>
                {achievement.name}
              </Text>
              
              <Text style={styles.points}>+{achievement.points} points</Text>
            </View>
            
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={hideToast}
            >
              <X size={16} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>
          </View>
          
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: DesignTokens.spacing[4],
  },
  toast: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.xl,
  },
  gradient: {
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing[4],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignTokens.spacing[3],
  },
  achievementEmoji: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[1],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  rarityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: DesignTokens.borderRadius.full,
    padding: DesignTokens.spacing[1],
  },
  achievementName: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  points: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  dismissButton: {
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});
