import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ProgressDashboard from '@/components/ProgressDashboard';
import { getLatestMeasurement, BodyMeasurement } from '@/lib/supabase/measurements';
import { getProgressPhotos, ProgressPhoto } from '@/lib/supabase/progressPhotos';
import { getWorkoutAnalytics, WorkoutAnalytics } from '@/lib/supabase/analytics';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const [activeTab, setActiveTab] = useState<'overview' | 'measurements' | 'photos' | 'analytics'>('overview');
  const [latestMeasurement, setLatestMeasurement] = useState<BodyMeasurement | null>(null);
  const [recentPhotos, setRecentPhotos] = useState<ProgressPhoto[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WorkoutAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      
      const [measurement, photos, analytics] = await Promise.all([
        getLatestMeasurement().catch(() => null),
        getProgressPhotos(4).catch(() => []),
        getWorkoutAnalytics(7).catch(() => null),
      ]);

      setLatestMeasurement(measurement);
      setRecentPhotos(photos);
      setWeeklyStats(analytics);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgressData();
    setRefreshing(false);
  };

  const handleAddMeasurement = () => {
    Alert.alert(
      'Add Measurement',
      'This will open the measurement input form',
      [{ text: 'OK' }]
    );
  };

  const handleTakePhoto = () => {
    Alert.alert(
      'Take Progress Photo',
      'This will open the camera to take a progress photo',
      [{ text: 'OK' }]
    );
  };

  const renderTabButton = (tab: typeof activeTab, title: string, icon: keyof typeof Ionicons.glyphMap) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon}
        size={20}
        color={activeTab === tab ? '#FFFFFF' : '#A3A3A3'}
      />
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.tabButtonTextActive
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <ScrollView
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9E7FFF" />
      }
    >
      {/* This Week Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient colors={['#9E7FFF', '#7C3AED']} style={styles.statGradient}>
              <Ionicons name="barbell" size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>{weeklyStats?.workouts_this_week || 0}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#f472b6', '#ec4899']} style={styles.statGradient}>
              <Ionicons name="time" size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>
                {Math.round((weeklyStats?.total_duration_minutes || 0) / 60)}h
              </Text>
              <Text style={styles.statLabel}>Hours</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#38bdf8', '#0ea5e9']} style={styles.statGradient}>
              <Ionicons name="flame" size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>{weeklyStats?.total_calories_burned || 0}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Latest Measurements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Measurements</Text>
          <TouchableOpacity onPress={handleAddMeasurement}>
            <Ionicons name="add-circle" size={24} color="#9E7FFF" />
          </TouchableOpacity>
        </View>
        
        {latestMeasurement ? (
          <View style={styles.measurementCard}>
            <LinearGradient colors={['#1f2937', '#111827']} style={styles.measurementGradient}>
              <Text style={styles.measurementDate}>
                {new Date(latestMeasurement.measurement_date).toLocaleDateString()}
              </Text>
              <View style={styles.measurementGrid}>
                {latestMeasurement.weight && (
                  <View style={styles.measurementItem}>
                    <Ionicons name="scale" size={20} color="#9E7FFF" />
                    <Text style={styles.measurementLabel}>Weight</Text>
                    <Text style={styles.measurementValue}>{latestMeasurement.weight} kg</Text>
                  </View>
                )}
                {latestMeasurement.body_fat_percentage && (
                  <View style={styles.measurementItem}>
                    <Ionicons name="fitness" size={20} color="#f472b6" />
                    <Text style={styles.measurementLabel}>Body Fat</Text>
                    <Text style={styles.measurementValue}>{latestMeasurement.body_fat_percentage}%</Text>
                  </View>
                )}
                {latestMeasurement.muscle_mass && (
                  <View style={styles.measurementItem}>
                    <Ionicons name="body" size={20} color="#38bdf8" />
                    <Text style={styles.measurementLabel}>Muscle</Text>
                    <Text style={styles.measurementValue}>{latestMeasurement.muscle_mass} kg</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <LinearGradient colors={['#1f2937', '#111827']} style={styles.emptyStateGradient}>
              <Ionicons name="scale" size={48} color="#A3A3A3" />
              <Text style={styles.emptyStateTitle}>No measurements yet</Text>
              <Text style={styles.emptyStateText}>
                Add your first measurement to track progress
              </Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddMeasurement}>
                <Text style={styles.emptyStateButtonText}>Add Measurement</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      </View>

      {/* Recent Photos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Photos</Text>
          <TouchableOpacity onPress={handleTakePhoto}>
            <Ionicons name="camera" size={24} color="#9E7FFF" />
          </TouchableOpacity>
        </View>
        
        {recentPhotos.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
            {recentPhotos.map((photo, index) => (
              <View key={photo.id} style={styles.photoCard}>
                <LinearGradient colors={['#1f2937', '#111827']} style={styles.photoGradient}>
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="image" size={32} color="#A3A3A3" />
                  </View>
                  <Text style={styles.photoDate}>
                    {new Date(photo.photo_date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.photoType}>{photo.photo_type}</Text>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <LinearGradient colors={['#1f2937', '#111827']} style={styles.emptyStateGradient}>
              <Ionicons name="camera" size={48} color="#A3A3A3" />
              <Text style={styles.emptyStateTitle}>No photos yet</Text>
              <Text style={styles.emptyStateText}>
                Take progress photos to track your transformation
              </Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={handleTakePhoto}>
                <Text style={styles.emptyStateButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => setActiveTab('analytics')}>
            <LinearGradient colors={['#9E7FFF', '#7C3AED']} style={styles.actionGradient}>
              <Ionicons name="analytics" size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>View Analytics</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => setActiveTab('measurements')}>
            <LinearGradient colors={['#f472b6', '#ec4899']} style={styles.actionGradient}>
              <Ionicons name="body" size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>Body Metrics</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderAnalytics = () => (
    <ProgressDashboard
      onNavigateToDetail={(screen, params) => {
        console.log('Navigate to:', screen, params);
        // Handle navigation to detail screens
      }}
    />
  );

  const renderPlaceholderTab = (title: string, description: string, icon: keyof typeof Ionicons.glyphMap) => (
    <View style={styles.placeholderContainer}>
      <LinearGradient colors={['#1f2937', '#111827']} style={styles.placeholderGradient}>
        <Ionicons name={icon} size={64} color="#9E7FFF" />
        <Text style={styles.placeholderTitle}>{title}</Text>
        <Text style={styles.placeholderText}>{description}</Text>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          {renderTabButton('overview', 'Overview', 'home')}
          {renderTabButton('analytics', 'Analytics', 'analytics')}
          {renderTabButton('measurements', 'Measurements', 'body')}
          {renderTabButton('photos', 'Photos', 'camera')}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'measurements' && renderPlaceholderTab(
          'Body Measurements',
          'Track weight, body fat, muscle mass, and body measurements over time',
          'body'
        )}
        {activeTab === 'photos' && renderPlaceholderTab(
          'Progress Photos',
          'Take and compare progress photos to visualize your transformation',
          'camera'
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  addButton: {
    backgroundColor: '#9E7FFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabNavigation: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabScroll: {
    flexGrow: 0,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#262626',
  },
  tabButtonActive: {
    backgroundColor: '#9E7FFF',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    marginTop: 4,
    opacity: 0.9,
  },
  measurementCard: {
    marginBottom: 8,
  },
  measurementGradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  measurementDate: {
    fontSize: 14,
    color: '#9E7FFF',
    fontFamily: 'Inter-Medium',
    marginBottom: 16,
  },
  measurementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  measurementItem: {
    flex: 1,
    alignItems: 'center',
  },
  measurementLabel: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    marginTop: 8,
  },
  measurementValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 4,
  },
  photosScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  photoCard: {
    width: 120,
    marginRight: 12,
  },
  photoGradient: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2F2F2F',
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoDate: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  photoType: {
    fontSize: 10,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textTransform: 'capitalize',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginTop: 8,
  },
  emptyState: {
    marginBottom: 8,
  },
  emptyStateGradient: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: '#9E7FFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  placeholderGradient: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F2F2F',
    width: '100%',
  },
  placeholderTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 20,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
});
