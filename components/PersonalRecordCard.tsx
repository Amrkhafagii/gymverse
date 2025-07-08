import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, TrendingUp, Calendar, Target, Weight, Clock } from 'lucide-react-native';

interface PersonalRecord {
  id: string;
  deviceId: string;
  exerciseId: string;
  recordType: 'max_weight' | 'max_reps' | 'max_duration' | 'max_volume';
  value: number;
  unit: string;
  achievedAt: string;
  previousRecord?: number;
}

interface PersonalRecordCardProps {
  record: PersonalRecord;
  exerciseName?: string;
  showExerciseName?: boolean;
  onPress?: () => void;
}

export default function PersonalRecordCard({
  record,
  exerciseName,
  showExerciseName = true,
  onPress,
}: PersonalRecordCardProps) {
  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'max_weight':
        return <Weight size={20} color="#F59E0B" />;
      case 'max_reps':
        return <Target size={20} color="#10B981" />;
      case 'max_duration':
        return <Clock size={20} color="#3B82F6" />;
      case 'max_volume':
        return <TrendingUp size={20} color="#8B5CF6" />;
      default:
        return <Trophy size={20} color="#F59E0B" />;
    }
  };

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case 'max_weight':
        return 'Max Weight';
      case 'max_reps':
        return 'Max Reps';
      case 'max_duration':
        return 'Max Duration';
      case 'max_volume':
        return 'Max Volume';
      default:
        return 'Personal Record';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'kg' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}k kg`;
    }
    if (unit === 'min' && value >= 60) {
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return `${hours}h ${minutes}m`;
    }
    return `${value} ${unit}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getImprovementPercentage = () => {
    if (!record.previousRecord || record.previousRecord === 0) return null;
    return ((record.value - record.previousRecord) / record.previousRecord) * 100;
  };

  const improvement = getImprovementPercentage();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      disabled={!onPress}
    >
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              {getRecordIcon(record.recordType)}
            </View>
            
            <View style={styles.headerInfo}>
              {showExerciseName && exerciseName && (
                <Text style={styles.exerciseName}>{exerciseName}</Text>
              )}
              <Text style={styles.recordType}>
                {getRecordTypeLabel(record.recordType)}
              </Text>
            </View>

            <View style={styles.trophyContainer}>
              <Trophy size={16} color="#F59E0B" />
            </View>
          </View>

          {/* Value */}
          <View style={styles.valueContainer}>
            <Text style={styles.value}>
              {formatValue(record.value, record.unit)}
            </Text>
            
            {improvement && (
              <View style={styles.improvementContainer}>
                <TrendingUp size={14} color="#10B981" />
                <Text style={styles.improvementText}>
                  +{improvement.toFixed(1)}%
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.dateContainer}>
              <Calendar size={12} color="#666" />
              <Text style={styles.date}>
                {formatDate(record.achievedAt)}
              </Text>
            </View>

            {record.previousRecord && (
              <Text style={styles.previousRecord}>
                Previous: {formatValue(record.previousRecord, record.unit)}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradient: {
    padding: 16,
  },
  content: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  recordType: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  trophyContainer: {
    padding: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  improvementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  improvementText: {
    fontSize: 12,
    color: '#10B981',
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  previousRecord: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
});
