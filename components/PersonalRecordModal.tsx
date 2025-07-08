import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  X, 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Target,
  Award,
  Zap,
  Share2,
} from 'lucide-react-native';
import { PersonalRecord } from '@/lib/analytics/prDetection';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import * as Haptics from 'expo-haptics';

interface PersonalRecordModalProps {
  visible: boolean;
  onClose: () => void;
  record: PersonalRecord | null;
}

const { width } = Dimensions.get('window');

export function PersonalRecordModal({ visible, onClose, record }: PersonalRecordModalProps) {
  const { celebratePR } = usePersonalRecords();
  const [isAnimating, setIsAnimating] = useState(false);

  if (!record) return null;

  const handleCelebrate = async () => {
    setIsAnimating(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await celebratePR(record.id);
    
    setTimeout(() => {
      setIsAnimating(false);
      onClose();
    }, 1500);
  };

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement sharing functionality
    console.log('Share PR:', record);
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

  const getRecordTypeIcon = (type: PersonalRecord['recordType']) => {
    switch (type) {
      case 'weight':
        return <Trophy size={24} color="#FFD700" />;
      case 'reps':
        return <Target size={24} color="#FF6B6B" />;
      case 'volume':
        return <TrendingUp size={24} color="#4ECDC4" />;
      case 'duration':
        return <Zap size={24} color="#45B7D1" />;
      default:
        return <Award size={24} color="#96CEB4" />;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={getRecordTypeColor(record.recordType)}
          style={styles.header}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              {getRecordTypeIcon(record.recordType)}
            </View>
            <Text style={styles.headerTitle}>Personal Record!</Text>
            <Text style={styles.headerSubtitle}>
              {record.recordType.charAt(0).toUpperCase() + record.recordType.slice(1)} PR
            </Text>
          </View>

          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Share2 size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Exercise Info */}
          <View style={styles.exerciseSection}>
            <Text style={styles.exerciseName}>{record.exerciseName}</Text>
            <Text style={styles.achievedDate}>
              {formatDate(record.achievedAt)} at {formatTime(record.achievedAt)}
            </Text>
          </View>

          {/* Record Value */}
          <View style={styles.recordSection}>
            <LinearGradient
              colors={['#1a1a1a', '#2a2a2a']}
              style={styles.recordCard}
            >
              <View style={styles.recordHeader}>
                <Text style={styles.recordLabel}>New Record</Text>
                {record.previousRecord && (
                  <View style={styles.improvementBadge}>
                    <TrendingUp size={16} color="#00D4AA" />
                    <Text style={styles.improvementText}>
                      +{record.improvementPercentage.toFixed(1)}%
                    </Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.recordValue}>
                {formatValue(record.value, record.recordType, record.unit)}
              </Text>
              
              {record.previousRecord && (
                <Text style={styles.previousRecord}>
                  Previous: {formatValue(record.previousRecord, record.recordType, record.unit)}
                </Text>
              )}
            </LinearGradient>
          </View>

          {/* Set Details */}
          {record.setDetails && (
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Set Details</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Weight</Text>
                  <Text style={styles.detailValue}>{record.setDetails.weight}kg</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Reps</Text>
                  <Text style={styles.detailValue}>{record.setDetails.reps}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Volume</Text>
                  <Text style={styles.detailValue}>{record.setDetails.volume.toFixed(1)}kg</Text>
                </View>
              </View>
            </View>
          )}

          {/* Improvement Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Improvement</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  +{record.improvement.toFixed(record.recordType === 'weight' ? 1 : 0)}
                </Text>
                <Text style={styles.statLabel}>
                  {record.recordType === 'weight' ? 'kg' : 
                   record.recordType === 'reps' ? 'reps' : 
                   record.recordType === 'volume' ? 'kg' : 'sec'} gained
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {record.improvementPercentage.toFixed(1)}%
                </Text>
                <Text style={styles.statLabel}>improvement</Text>
              </View>
            </View>
          </View>

          {/* Motivational Message */}
          <View style={styles.motivationSection}>
            <LinearGradient
              colors={['#6C5CE7', '#A29BFE']}
              style={styles.motivationCard}
            >
              <Text style={styles.motivationText}>
                {getMotivationalMessage(record.recordType, record.improvementPercentage)}
              </Text>
            </LinearGradient>
          </View>
        </ScrollView>

        {/* Celebrate Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleCelebrate}
            style={styles.celebrateButton}
            disabled={isAnimating}
          >
            <LinearGradient
              colors={isAnimating ? ['#00D4AA', '#01A3A4'] : getRecordTypeColor(record.recordType)}
              style={styles.celebrateButtonGradient}
            >
              <Trophy size={24} color="#FFFFFF" />
              <Text style={styles.celebrateButtonText}>
                {isAnimating ? 'Celebrating!' : 'Celebrate Achievement'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function getMotivationalMessage(recordType: PersonalRecord['recordType'], improvement: number): string {
  const messages = {
    weight: [
      "You're getting stronger every day! 💪",
      "That's some serious strength gains!",
      "Your dedication is paying off big time!",
      "Crushing those weight goals like a champion!",
    ],
    reps: [
      "Your endurance is through the roof! 🔥",
      "More reps, more gains, more awesome!",
      "You're building incredible stamina!",
      "That rep count is seriously impressive!",
    ],
    volume: [
      "Your total volume is skyrocketing! 📈",
      "That's what consistent training looks like!",
      "You're maximizing every workout!",
      "Volume gains = muscle gains!",
    ],
    duration: [
      "Your endurance is next level! ⏱️",
      "Time to celebrate that stamina!",
      "You're going the distance!",
      "That's some serious staying power!",
    ],
  };

  const typeMessages = messages[recordType] || messages.weight;
  const messageIndex = Math.min(Math.floor(improvement / 25), typeMessages.length - 1);
  return typeMessages[messageIndex];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  closeButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Medium',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  exerciseName: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  achievedDate: {
    fontSize: 16,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  recordSection: {
    marginBottom: 24,
  },
  recordCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordLabel: {
    fontSize: 16,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    marginRight: 12,
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 170, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  improvementText: {
    fontSize: 14,
    color: '#00D4AA',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  recordValue: {
    fontSize: 48,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  previousRecord: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    color: '#00D4AA',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  motivationSection: {
    marginBottom: 24,
  },
  motivationCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  celebrateButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  celebrateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  celebrateButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
});
