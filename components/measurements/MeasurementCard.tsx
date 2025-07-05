import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MeasurementStats } from '@/lib/supabase/measurements';

interface MeasurementCardProps {
  stats: MeasurementStats;
  onPress?: () => void;
}

const measurementLabels: Record<string, { label: string; unit: string; icon: string }> = {
  weight: { label: 'Weight', unit: 'kg', icon: 'scale' },
  body_fat_percentage: { label: 'Body Fat', unit: '%', icon: 'fitness' },
  muscle_mass: { label: 'Muscle Mass', unit: 'kg', icon: 'body' },
  chest: { label: 'Chest', unit: 'cm', icon: 'resize' },
  waist: { label: 'Waist', unit: 'cm', icon: 'resize' },
  hips: { label: 'Hips', unit: 'cm', icon: 'resize' },
  bicep_left: { label: 'Left Bicep', unit: 'cm', icon: 'fitness' },
  bicep_right: { label: 'Right Bicep', unit: 'cm', icon: 'fitness' },
  thigh_left: { label: 'Left Thigh', unit: 'cm', icon: 'resize' },
  thigh_right: { label: 'Right Thigh', unit: 'cm', icon: 'resize' },
  neck: { label: 'Neck', unit: 'cm', icon: 'resize' },
  forearm_left: { label: 'Left Forearm', unit: 'cm', icon: 'fitness' },
  forearm_right: { label: 'Right Forearm', unit: 'cm', icon: 'fitness' },
  calf_left: { label: 'Left Calf', unit: 'cm', icon: 'resize' },
  calf_right: { label: 'Right Calf', unit: 'cm', icon: 'resize' },
};

export default function MeasurementCard({ stats, onPress }: MeasurementCardProps) {
  const measurementInfo = measurementLabels[stats.measurement_type];
  if (!measurementInfo) return null;

  const getTrendColor = () => {
    switch (stats.trend) {
      case 'up':
        return '#10b981';
      case 'down':
        return '#ef4444';
      default:
        return '#A3A3A3';
    }
  };

  const getTrendIcon = () => {
    switch (stats.trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const formatValue = (value: number) => {
    if (measurementInfo.unit === '%') {
      return value.toFixed(1);
    }
    return value.toFixed(1);
  };

  const formatChange = (change: number, percentage: number) => {
    const sign = change > 0 ? '+' : '';
    const changeText = `${sign}${formatValue(Math.abs(change))}${measurementInfo.unit}`;
    const percentageText = `(${sign}${percentage.toFixed(1)}%)`;
    return `${changeText} ${percentageText}`;
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <LinearGradient colors={['#1f2937', '#111827']} style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name={measurementInfo.icon as any} size={20} color="#9E7FFF" />
            <Text style={styles.title}>{measurementInfo.label}</Text>
          </View>
          <Ionicons name={getTrendIcon() as any} size={20} color={getTrendColor()} />
        </View>

        <View style={styles.content}>
          <View style={styles.currentValue}>
            <Text style={styles.value}>
              {formatValue(stats.current_value)}
            </Text>
            <Text style={styles.unit}>{measurementInfo.unit}</Text>
          </View>

          {stats.previous_value && (
            <View style={styles.change}>
              <Text style={[styles.changeText, { color: getTrendColor() }]}>
                {formatChange(stats.change, stats.change_percentage)}
              </Text>
              <Text style={styles.changeLabel}>from last measurement</Text>
            </View>
          )}

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Best</Text>
              <Text style={styles.statValue}>
                {formatValue(stats.best_value)}{measurementInfo.unit}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Average</Text>
              <Text style={styles.statValue}>
                {formatValue(stats.average_value)}{measurementInfo.unit}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Records</Text>
              <Text style={styles.statValue}>{stats.measurement_count}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  gradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  content: {
    gap: 12,
  },
  currentValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: 'Inter-Bold',
  },
  unit: {
    color: '#A3A3A3',
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  change: {
    gap: 4,
  },
  changeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  changeLabel: {
    color: '#A3A3A3',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2F2F2F',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#A3A3A3',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});
