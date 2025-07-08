import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  X,
  Share2,
  Trophy,
  Star,
  Crown,
  Sparkles,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { Achievement, AchievementRarity } from '@/types/achievement';

interface AchievementUnlockModalProps {
  achievement: Achievement | null;
  visible: boolean;
  onClose: () => void;
  onShare?: () => void;
}

const { width, height } = Dimensions.get('window');

export function AchievementUnlockModal({
  achievement,
  visible,
  onClose,
  onShare,
}: AchievementUnlockModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && achievement) {
      // Entry animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Sparkle animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Pulse animation for icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, achievement]);

  if (!achievement) return null;

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
        return <Star size={24} color="#FFFFFF" />;
      case 'rare':
        return <Trophy size={24} color="#FFFFFF" />;
      case 'epic':
        return <Crown size={24} color="#FFFFFF" />;
      case 'legendary':
        return <Sparkles size={24} color="#FFFFFF" />;
      default:
        return <Star size={24} color="#FFFFFF" />;
    }
  };

  const getRarityLabel = (rarity: AchievementRarity): string => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const getParticleCount = (rarity: AchievementRarity): number => {
    switch (rarity) {
      case 'common': return 8;
      case 'rare': return 12;
      case 'epic': return 16;
      case 'legendary': return 24;
      default: return 8;
    }
  };

  const renderParticles = () => {
    const particles = [];
    const count = getParticleCount(achievement.rarity);
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const radius = 120 + Math.random() * 60;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      particles.push(
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: x },
                { translateY: y },
                {
                  scale: sparkleAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 0],
                  }),
                },
                {
                  rotate: sparkleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
              opacity: sparkleAnim.interpolate({
                inputRange: [0, 0.2, 0.8, 1],
                outputRange: [0, 1, 1, 0],
              }),
            },
          ]}
        >
          <View style={[
            styles.particleDot,
            { backgroundColor: getRarityColors(achievement.rarity)[0] }
          ]} />
        </Animated.View>
      );
    }
    
    return particles;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Particles */}
          <View style={styles.particleContainer}>
            {renderParticles()}
          </View>

          <LinearGradient
            colors={getRarityColors(achievement.rarity)}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.unlockText}>Achievement Unlocked!</Text>
              
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              </Animated.View>

              <View style={styles.achievementInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <View style={styles.rarityBadge}>
                    {getRarityIcon(achievement.rarity)}
                    <Text style={styles.rarityText}>
                      {getRarityLabel(achievement.rarity)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>

                <View style={styles.pointsContainer}>
                  <Text style={styles.pointsLabel}>Points Earned</Text>
                  <Text style={styles.pointsValue}>+{achievement.points}</Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {onShare && (
                <TouchableOpacity 
                  style={styles.shareButton}
                  onPress={onShare}
                >
                  <Share2 size={20} color="#FFFFFF" />
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={onClose}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    ...DesignTokens.shadow.xl,
  },
  particleContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 1,
    height: 1,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
  },
  particleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  gradient: {
    padding: DesignTokens.spacing[6],
    zIndex: 2,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: DesignTokens.spacing[4],
  },
  closeButton: {
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[6],
  },
  unlockText: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[4],
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignTokens.spacing[5],
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  achievementIcon: {
    fontSize: 64,
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  },
  achievementInfo: {
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  achievementName: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.full,
  },
  rarityText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  achievementDescription: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: DesignTokens.spacing[4],
  },
  pointsContainer: {
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    marginTop: DesignTokens.spacing[2],
  },
  pointsLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  pointsValue: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  actions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  shareButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  continueButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  continueButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
});
