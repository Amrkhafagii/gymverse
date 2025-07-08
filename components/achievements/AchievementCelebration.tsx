import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '@/design-system/tokens';
import { Achievement, AchievementRarity } from '@/types/achievement';

const { width, height } = Dimensions.get('window');

interface AchievementCelebrationProps {
  achievement: Achievement;
  visible: boolean;
  onComplete: () => void;
}

export function AchievementCelebration({
  achievement,
  visible,
  onComplete,
}: AchievementCelebrationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 20 }, () => ({
      translateY: new Animated.Value(-100),
      translateX: new Animated.Value(Math.random() * width),
      rotate: new Animated.Value(0),
      scale: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      startCelebration();
    }
  }, [visible]);

  const startCelebration = () => {
    // Main achievement animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ),
    ]).start();

    // Confetti animation
    const confettiAnimations = confettiAnims.map((anim, index) => {
      const delay = index * 100;
      const duration = 2000 + Math.random() * 1000;
      
      return Animated.parallel([
        Animated.timing(anim.translateY, {
          toValue: height + 100,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateX, {
          toValue: anim.translateX._value + (Math.random() - 0.5) * 200,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(anim.rotate, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ),
        Animated.sequence([
          Animated.timing(anim.scale, {
            toValue: 1.2,
            duration: duration / 2,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim.scale, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.parallel(confettiAnimations).start();

    // Auto-complete after 3 seconds
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.5,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(onComplete);
    }, 3000);
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

  const getConfettiColors = (rarity: AchievementRarity): string[] => {
    switch (rarity) {
      case 'common':
        return ['#9CA3AF', '#6B7280', '#4B5563'];
      case 'rare':
        return ['#60A5FA', '#3B82F6', '#2563EB'];
      case 'epic':
        return ['#A78BFA', '#8B5CF6', '#7C3AED'];
      case 'legendary':
        return ['#FBBF24', '#F59E0B', '#D97706'];
      default:
        return ['#9CA3AF', '#6B7280', '#4B5563'];
    }
  };

  if (!visible) return null;

  const confettiColors = getConfettiColors(achievement.rarity);

  return (
    <View style={styles.container}>
      {/* Confetti */}
      {confettiAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confetti,
            {
              backgroundColor: confettiColors[index % confettiColors.length],
              transform: [
                { translateX: anim.translateX },
                { translateY: anim.translateY },
                {
                  rotate: anim.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                { scale: anim.scale },
              ],
            },
          ]}
        />
      ))}

      {/* Main Achievement Display */}
      <Animated.View
        style={[
          styles.achievementContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '5deg'],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={getRarityColors(achievement.rarity)}
          style={styles.achievementCard}
        >
          <View style={styles.achievementContent}>
            <Text style={styles.celebrationText}>🎉 ACHIEVEMENT UNLOCKED! 🎉</Text>
            
            <View style={styles.iconContainer}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            </View>
            
            <Text style={styles.achievementName}>{achievement.name}</Text>
            <Text style={styles.achievementDescription}>{achievement.description}</Text>
            
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>+{achievement.points} POINTS</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Background Glow Effect */}
      <Animated.View
        style={[
          styles.glowEffect,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            getRarityColors(achievement.rarity)[0] + '40',
            'transparent',
          ]}
          style={styles.glowGradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1500,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  achievementContainer: {
    width: width * 0.85,
    maxWidth: 350,
  },
  achievementCard: {
    borderRadius: DesignTokens.borderRadius.xl,
    padding: DesignTokens.spacing[6],
    ...DesignTokens.shadow.xl,
  },
  achievementContent: {
    alignItems: 'center',
  },
  celebrationText: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[4],
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignTokens.spacing[4],
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  achievementIcon: {
    fontSize: 48,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  achievementName: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[2],
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  achievementDescription: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: DesignTokens.spacing[4],
  },
  pointsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.full,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  pointsText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  glowGradient: {
    flex: 1,
  },
});
