import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  X,
  Trophy,
  Star,
  Crown,
  Sparkles,
  Share2,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { Achievement, AchievementRarity } from '@/types/achievement';
import { useAchievements } from '@/contexts/AchievementContext';

const { width, height } = Dimensions.get('window');

interface NotificationItem {
  id: string;
  achievement: Achievement;
  timestamp: number;
  isNew: boolean;
}

export function AchievementNotificationManager() {
  const { achievements, checkAchievements } = useAchievements();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [currentNotification, setCurrentNotification] = useState<NotificationItem | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Listen for new achievements
    const checkForNewAchievements = async () => {
      try {
        const newUnlocks = await checkAchievements();
        
        if (newUnlocks.length > 0) {
          const newNotifications = newUnlocks.map(achievement => ({
            id: `${achievement.id}-${Date.now()}`,
            achievement,
            timestamp: Date.now(),
            isNew: true,
          }));
          
          setNotifications(prev => [...prev, ...newNotifications]);
          
          // Show first notification immediately
          if (newNotifications.length > 0) {
            showNotification(newNotifications[0]);
          }
        }
      } catch (error) {
        console.error('Error checking achievements:', error);
      }
    };

    // Check achievements periodically
    const interval = setInterval(checkForNewAchievements, 5000);
    
    return () => clearInterval(interval);
  }, [achievements]);

  useEffect(() => {
    // Process notification queue
    if (notifications.length > 0 && !currentNotification) {
      const nextNotification = notifications[0];
      showNotification(nextNotification);
    }
  }, [notifications, currentNotification]);

  const showNotification = (notification: NotificationItem) => {
    setCurrentNotification(notification);
    
    // Slide in animation
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(3000), // Show for 3 seconds
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Remove from queue and show next
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setCurrentNotification(null);
    });
  };

  const handleNotificationPress = () => {
    if (currentNotification) {
      setShowUnlockModal(true);
      
      // Hide the notification
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setNotifications(prev => prev.filter(n => n.id !== currentNotification.id));
        setCurrentNotification(null);
      });
    }
  };

  const handleDismissNotification = () => {
    if (currentNotification) {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setNotifications(prev => prev.filter(n => n.id !== currentNotification.id));
        setCurrentNotification(null);
      });
    }
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

  if (!currentNotification) return null;

  return (
    <>
      {/* Notification Toast */}
      <Animated.View
        style={[
          styles.notificationContainer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.notification}
          onPress={handleNotificationPress}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={getRarityColors(currentNotification.achievement.rarity)}
            style={styles.notificationGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.notificationContent}>
              <View style={styles.notificationIcon}>
                <Text style={styles.achievementEmoji}>
                  {currentNotification.achievement.icon}
                </Text>
              </View>
              
              <View style={styles.notificationText}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>Achievement Unlocked!</Text>
                  <View style={styles.rarityBadge}>
                    {getRarityIcon(currentNotification.achievement.rarity)}
                  </View>
                </View>
                <Text style={styles.achievementName}>
                  {currentNotification.achievement.name}
                </Text>
                <Text style={styles.pointsText}>
                  +{currentNotification.achievement.points} points
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={handleDismissNotification}
              >
                <X size={16} color="rgba(255, 255, 255, 0.8)" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Achievement Unlock Modal */}
      {showUnlockModal && currentNotification && (
        <AchievementUnlockModal
          achievement={currentNotification.achievement}
          visible={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          onShare={() => {
            // Handle sharing
            console.log('Share achievement:', currentNotification.achievement.name);
            setShowUnlockModal(false);
          }}
        />
      )}
    </>
  );
}

// Achievement Unlock Modal Component
interface AchievementUnlockModalProps {
  achievement: Achievement;
  visible: boolean;
  onClose: () => void;
  onShare?: () => void;
}

function AchievementUnlockModal({
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
    if (visible) {
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
  }, [visible]);

  if (!visible) return null;

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
    <View style={styles.modalOverlay}>
      <BlurView intensity={20} style={styles.modalBlur}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.modalContainer,
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
            style={styles.modalGradient}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.modalContent}>
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
                  <View style={styles.rarityBadgeModal}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  // Notification Toast Styles
  notificationContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: DesignTokens.spacing[4],
  },
  notification: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.xl,
  },
  notificationGradient: {
    padding: DesignTokens.spacing[4],
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
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
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[1],
  },
  notificationTitle: {
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
  pointsText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  dismissButton: {
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
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
  modalGradient: {
    padding: DesignTokens.spacing[6],
    zIndex: 2,
  },
  modalHeader: {
    alignItems: 'flex-end',
    marginBottom: DesignTokens.spacing[4],
  },
  closeButton: {
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalContent: {
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[6],
  },
  unlockText: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[4],
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
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
  rarityBadgeModal: {
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
