import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhotoComparison } from '@/lib/supabase/progressPhotos';

interface PhotoComparisonCardProps {
  comparison: PhotoComparison;
  onPress?: () => void;
}

export default function PhotoComparisonCard({ comparison, onPress }: PhotoComparisonCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTimeDifference = (days: number) => {
    if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    } else if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(days / 365);
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return '#ef4444'; // Red for weight gain
    if (change < 0) return '#10b981'; // Green for weight loss
    return '#A3A3A3'; // Gray for no change
  };

  const formatChange = (change: number, unit: string) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}${unit}`;
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <LinearGradient colors={['#1f2937', '#111827']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="git-compare" size={20} color="#9E7FFF" />
            <Text style={styles.title}>Progress Comparison</Text>
          </View>
          <Text style={styles.timeDifference}>
            {formatTimeDifference(comparison.time_difference_days)}
          </Text>
        </View>

        {/* Photos */}
        <View style={styles.photosContainer}>
          <View style={styles.photoSection}>
            <Text style={styles.photoLabel}>Before</Text>
            <View style={styles.photoWrapper}>
              <Image 
                source={{ uri: comparison.before_photo.photo_url }} 
                style={styles.photo}
                resizeMode="cover"
              />
              <View style={styles.photoOverlay}>
                <Text style={styles.photoDate}>
                  {formatDate(comparison.before_photo.photo_date)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-forward" size={24} color="#9E7FFF" />
          </View>

          <View style={styles.photoSection}>
            <Text style={styles.photoLabel}>After</Text>
            <View style={styles.photoWrapper}>
              <Image 
                source={{ uri: comparison.after_photo.photo_url }} 
                style={styles.photo}
                resizeMode="cover"
              />
              <View style={styles.photoOverlay}>
                <Text style={styles.photoDate}>
                  {formatDate(comparison.after_photo.photo_date)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        {(comparison.weight_change !== undefined || comparison.body_fat_change !== undefined) && (
          <View style={styles.statsContainer}>
            {comparison.weight_change !== undefined && (
              <View style={styles.statItem}>
                <Ionicons name="scale" size={16} color="#A3A3A3" />
                <Text style={styles.statLabel}>Weight</Text>
                <Text style={[
                  styles.statValue, 
                  { color: getChangeColor(comparison.weight_change) }
                ]}>
                  {formatChange(comparison.weight_change, 'kg')}
                </Text>
              </View>
            )}
            
            {comparison.body_fat_change !== undefined && (
              <View style={styles.statItem}>
                <Ionicons name="fitness" size={16} color="#A3A3A3" />
                <Text style={styles.statLabel}>Body Fat</Text>
                <Text style={[
                  styles.statValue, 
                  { color: getChangeColor(comparison.body_fat_change) }
                ]}>
                  {formatChange(comparison.body_fat_change, '%')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Photo Type Badge */}
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {comparison.before_photo.photo_type.charAt(0).toUpperCase() + 
               comparison.before_photo.photo_type.slice(1)} View
            </Text>
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
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  timeDifference: {
    color: '#9E7FFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  photosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  photoSection: {
    flex: 1,
    alignItems: 'center',
  },
  photoLabel: {
    color: '#A3A3A3',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 133,
    borderRadius: 12,
    backgroundColor: '#262626',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 6,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  photoDate: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  arrowContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2F2F2F',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    color: '#A3A3A3',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  badgeContainer: {
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#262626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#9E7FFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});
