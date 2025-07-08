/**
 * PersonalRecordModal - Previously unused, now integrated into workout celebrations
 * Celebrates personal records with animations and sharing options
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Trophy, 
  X, 
  Share2, 
  Camera,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

export interface PersonalRecord {
  id: string;
  exerciseName: string;
  recordType: 'weight' | 'reps' | 'volume' | 'duration';
  previousValue: number;
  newValue: number;
  unit: string;
  achievedAt: string;
  improvement: number; // percentage
  category: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

export interface PersonalRecordModalProps {
  visible: boolean;
  onClose: () => void;
  record: PersonalRecord | null;
  onShare?: () => void;
  onTakePhoto?: () => void;
  showSocialOptions?: boolean;
}

export const PersonalRecordModal: React.FC<PersonalRecordModalProps> = ({
  visible,
  onClose,
  record,
  onShare,
  onTakePhoto,
  showSocialOptions = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const trophyRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && record) {
      // Haptic feedback for achievement
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Start animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
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
        ),
        Animated.loop(
          Animated.timing(trophyRotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          })
        ),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      sparkleAnim.setValue(0);
      trophyRotateAnim.setValue(0);
    }
  }, [visible, record]);

  const getCategoryColor = (category: string): string[] => {
    switch (category) {
      case 'Bronze':
        return ['#CD7F32', '#B8860B'];
      case 'Silver':
        return ['#C0C0C0', '#A8A8A8'];
      case 'Gold':
        return ['#FFD700', '#FFA500'];
      case 'Platinum':
        return ['#E5E4E2', '#B8B8B8'];
      default:
        return ['#FFD700', '#FFA500'];
    }
  };

  const getRecordTypeLabel = (type: string): string => {
    switch (type) {
      case 'weight':
        return 'Max Weight';
      case 'reps':
        return 'Max Reps';
      case 'volume':
        return 'Total Volume';
      case 'duration':
        return 'Duration';
      default:
        return 'Record';
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'weight':
        return <Trophy size={32} color="#FFFFFF" />;
      case 'reps':
        return <TrendingUp size={32} color="#FFFFFF" />;
      case 'volume':
        return <Award size={32} color="#FFFFFF" />;
      case 'duration':
        return <Trophy size={32} color="#FFFFFF" />;
      default:
        return <Trophy size={32} color="#FFFFFF" />;
    }
  };

  const handleShare = async () => {
    if (!record) return;

    const message = `🏆 New Personal Record! 🏆\n\n` +
      `Exercise: ${record.exerciseName}\n` +
      `${getRecordTypeLabel(record.recordType)}: ${record.newValue} ${record.unit}\n` +
      `Previous: ${record.previousValue} ${record.unit}\n` +
      `Improvement: +${record.improvement.toFixed(1)}%\n\n` +
      `#PersonalRecord #Fitness #GymVerse`;

    try {
      await Share.share({
        message,
        title: 'Personal Record Achievement',
      });
      onShare?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to share your achievement');
    }
  };

  const handleTakePhoto = () => {
    onTakePhoto?.();
    // In a real app, this would open the camera
    Alert.alert('Photo', 'Camera functionality would open here');
  };

  if (!record) return null;

  const trophyRotation = trophyRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarHidden
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <LinearGradient 
            colors={getCategoryColor(record.category)} 
            style={styles.gradient}
          >
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Sparkle Effects */}
            <Animated.View 
              style={[
                styles.sparkleContainer,
                { opacity: sparkleOpacity }
              ]}
            >
              <Sparkles size={20} color="#FFFFFF" style={styles.sparkle1} />
              <Sparkles size={16} color="#FFFFFF" style={styles.sparkle2} />
              <Sparkles size={24} color="#FFFFFF" style={styles.sparkle3} />
              <Sparkles size={18} color="#FFFFFF" style={styles.sparkle4} />
            </Animated.View>

            {/* Header */}
            <View style={styles.header}>
              <Animated.View 
                style={[
                  styles.trophyContainer,
                  { transform: [{ rotate: trophyRotation }] }
                ]}
              >
                {getRecordIcon(record.recordType)}
              </Animated.View>
              
              <Text style={styles.title}>Personal Record!</Text>
              <Text style={styles.category}>{record.category} Achievement</Text>
            </View>

            {/* Exercise Info */}
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{record.exerciseName}</Text>
              <Text style={styles.recordType}>{getRecordTypeLabel(record.recordType)}</Text>
            </View>

            {/* Record Details */}
            <View style={styles.recordDetails}>
              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>New Record</Text>
                <Text style={styles.newValue}>
                  {record.newValue} {record.unit}
                </Text>
              </View>
              
              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>Previous Best</Text>
                <Text style={styles.previousValue}>
                  {record.previousValue} {record.unit}
                </Text>
              </View>
              
              <View style={styles.improvementRow}>
                <TrendingUp size={16} color="#FFFFFF" />
                <Text style={styles.improvementText}>
                  +{record.improvement.toFixed(1)}% improvement
                </Text>
              </View>
            </View>

            {/* Achievement Date */}
            <Text style={styles.achievementDate}>
              Achieved on {new Date(record.achievedAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>

            {/* Motivational Message */}
            <View style={styles.motivationSection}>
              <Text style={styles.motivationText}>
                {getMotivationalMessage(record.improvement)}
              </Text>
            </View>

            {/* Action Buttons */}
            {showSocialOptions && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={handleShare}
                >
                  <Share2 size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={handleTakePhoto}
                >
                  <Camera size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Photo</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Continue Button */}
            <TouchableOpacity style={styles.continueButton} onPress={onClose}>
              <Text style={styles.continueButtonText}>Continue Workout</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

function getMotivationalMessage(improvement: number): string {
  if (improvement >= 20) return "Incredible breakthrough! You're crushing your limits! 💪";
  if (improvement >= 10) return "Amazing progress! Your dedication is paying off! 🔥";
  if (improvement >= 5) return "Great improvement! Keep pushing forward! 🚀";
  return "Every step forward counts! You're getting stronger! ⭐";
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignTokens.spacing[5],
  },

  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    ...DesignTokens.shadow.xl,
  },

  gradient: {
    padding: DesignTokens.spacing[6],
    alignItems: 'center',
  },

  closeButton: {
    position: 'absolute',
    top: DesignTokens.spacing[4],
    right: DesignTokens.spacing[4],
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: DesignTokens.borderRadius.full,
    padding: DesignTokens.spacing[2],
  },

  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  sparkle1: {
    position: 'absolute',
    top: '20%',
    left: '15%',
  },

  sparkle2: {
    position: 'absolute',
    top: '30%',
    right: '20%',
  },

  sparkle3: {
    position: 'absolute',
    bottom: '30%',
    left: '10%',
  },

  sparkle4: {
    position: 'absolute',
    bottom: '20%',
    right: '15%',
  },

  header: {
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[6],
  },

  trophyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.full,
    marginBottom: DesignTokens.spacing[4],
  },

  title: {
    fontSize: DesignTokens.typography.fontSize['3xl'],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[2],
  },

  category: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  exerciseInfo: {
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[6],
  },

  exerciseName: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[1],
  },

  recordType: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  recordDetails: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[4],
  },

  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },

  recordLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  newValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  previousValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.7)',
    textDecorationLine: 'line-through',
  },

  improvementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing[2],
    marginTop: DesignTokens.spacing[2],
    paddingTop: DesignTokens.spacing[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },

  improvementText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },

  achievementDate: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[4],
  },

  motivationSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[6],
  },

  motivationText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[4],
  },

  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
  },

  actionButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },

  continueButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: DesignTokens.spacing[4],
    paddingHorizontal: DesignTokens.spacing[8],
    borderRadius: DesignTokens.borderRadius.xl,
  },

  continueButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#000000',
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
  },
});
