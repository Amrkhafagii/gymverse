import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, X, Share2 } from 'lucide-react-native';
import { PersonalRecord } from '@/lib/analytics/prDetection';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import * as Haptics from 'expo-haptics';

interface PRCelebrationNotificationProps {
  record: PersonalRecord;
  onDismiss: () => void;
  onCelebrate: () => void;
}

const { width } = Dimensions.get('window');

export function PRCelebrationNotification({ 
  record, 
  onDismiss, 
  onCelebrate 
}: PRCelebrationNotificationProps) {
  const [slideAnim] = useState(new Animated.Value(-width));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Slide in animation
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
    ]).start();

    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Auto dismiss after 8 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const handleCelebrate = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCelebrate();
    handleDismiss();
  };

  const formatValue = (value: number, recordType: PersonalRecord['recordType'], unit: string) => {
    switch (recordType) {
      case 'weight':
        return `${value}${unit}`;
      case 'reps':
        return `${value} ${unit}`;
      case 'volume':
        return `${value.toFixed(1)}${unit}`;
      case 'duration':
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      default:
        return `${value}${unit}`;
    }
  };

  const getRecordTypeColor = (type: PersonalRecord['recordType']) => {
    switch (type) {
      case 'weight':
        return ['#FFD700', '#FFA500'];
      case 'reps':
        return ['#FF6B6B', '#FF4757'];
      case 'volume':
        return ['#4ECDC4', '#44A08D'];
      case 'duration':
        return ['#45B7D1', '#3742FA'];
      default:
        return ['#96CEB4', '#6C5CE7'];
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={getRecordTypeColor(record.recordType)}
        style={styles.notification}
      >
        <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
          <X size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Trophy size={24} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Personal Record!</Text>
              <Text style={styles.subtitle}>
                {record.recordType.charAt(0).toUpperCase() + record.recordType.slice(1)} PR
              </Text>
            </View>
          </View>

          <View style={styles.recordInfo}>
            <Text style={styles.exerciseName} numberOfLines={1}>
              {record.exerciseName}
            </Text>
            <Text style={styles.recordValue}>
              {formatValue(record.value, record.recordType, record.unit)}
            </Text>
            {record.previousRecord && (
              <Text style={styles.improvement}>
                +{record.improvementPercentage.toFixed(1)}% improvement!
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={handleCelebrate} style={styles.celebrateButton}>
              <Text style={styles.celebrateButtonText}>🎉 Celebrate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Share2 size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  notification: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  content: {
    paddingRight: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Medium',
  },
  recordInfo: {
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  recordValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  improvement: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Inter-Medium',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  celebrateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    marginRight: 12,
  },
  celebrateButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  shareButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
