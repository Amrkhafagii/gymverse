import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Trophy, TrendingUp, Calendar, Target, Smartphone, User, Activity } from 'lucide-react-native';
import { useDeviceAuth } from '@/contexts/DeviceAuthContext';
import { EXERCISE_DATABASE } from '@/lib/data/exerciseDatabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ExerciseProgressChart from '@/components/ExerciseProgressChart';
import PersonalRecordCard from '@/components/PersonalRecordCard';

interface DeviceProgressData {
  deviceId: string;
  exerciseId: string;
  date: string;
  sets: Array<{
    reps?: number;
    weight?: number;
    duration?: number;
    restTime?: number;
  }>;
  totalVolume: number;
  maxWeight: number;
  maxReps: number;
  totalDuration: number;
  notes?: string;
}

interface DevicePersonalRecord {
  id: string;
  deviceId: string;
  exerciseId: string;
  recordType: 'max_weight' | 'max_reps' | 'max_duration' | 'max_volume';
  value: number;
  unit: string;
  achievedAt: string;
  previousRecord?: number;
}

interface DeviceExerciseStats {
  totalSessions: number;
  totalSets: number;
  totalReps: number;
  averageReps: number;
  maxWeight: number;
  totalVolume: number;
  averageVolume: number;
  firstSession: string;
  lastSession: string;
}

interface ProgressChartData {
  weightProgress: Array<{ date: string; value: number }>;
  repsProgress: Array<{ date: string; value: number }>;
  volumeProgress: Array<{ date: string; value: number }>;
  durationProgress: Array<{ date: string; value: number }>;
}

export default function ExerciseProgressScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { user, isAuthenticated, updateLastActive } = useDeviceAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressChartData>({
    weightProgress: [],
    repsProgress: [],
    volumeProgress: [],
    durationProgress: [],
  });
  const [personalRecords, setPersonalRecords] = useState<DevicePersonalRecord[]>([]);
  const [stats, setStats] = useState<DeviceExerciseStats>({
    totalSessions: 0,
    totalSets: 0,
    totalReps: 0,
    averageReps: 0,
    maxWeight: 0,
    totalVolume: 0,
    averageVolume: 0,
    firstSession: '',
    lastSession: '',
  });

  const exercise = EXERCISE_DATABASE.find(ex => ex.id === exerciseId);

  useEffect(() => {
    if (!isAuthenticated || !user || !exerciseId) {
      setError('Device authentication required to view progress');
      setLoading(false);
      return;
    }

    if (!exercise) {
      setError('Exercise not found');
      setLoading(false);
      return;
    }

    loadDeviceProgressData();
  }, [isAuthenticated, user, exerciseId, exercise]);

  const loadDeviceProgressData = async () => {
    if (!user || !exerciseId) return;

    try {
      setLoading(true);
      await updateLastActive();

      // Load progress data from device storage
      const progressKey = `device_progress_${user.deviceId}_${exerciseId}`;
      const recordsKey = `device_records_${user.deviceId}_${exerciseId}`;

      const [storedProgress, storedRecords] = await Promise.all([
        AsyncStorage.getItem(progressKey),
        AsyncStorage.getItem(recordsKey),
      ]);

      let deviceProgressData: DeviceProgressData[] = [];
      let deviceRecords: DevicePersonalRecord[] = [];

      if (storedProgress) {
        deviceProgressData = JSON.parse(storedProgress);
      }

      if (storedRecords) {
        deviceRecords = JSON.parse(storedRecords);
      }

      // Process progress data for charts
      const chartData = processProgressDataForCharts(deviceProgressData);
      setProgressData(chartData);

      // Set personal records
      setPersonalRecords(deviceRecords);

      // Calculate stats
      const calculatedStats = calculateExerciseStats(deviceProgressData);
      setStats(calculatedStats);

      setError(null);
    } catch (err) {
      console.error('Error loading device progress data:', err);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const processProgressDataForCharts = (data: DeviceProgressData[]): ProgressChartData => {
    const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      weightProgress: sortedData
        .filter(d => d.maxWeight > 0)
        .map(d => ({ date: d.date, value: d.maxWeight })),
      repsProgress: sortedData
        .filter(d => d.maxReps > 0)
        .map(d => ({ date: d.date, value: d.maxReps })),
      volumeProgress: sortedData
        .filter(d => d.totalVolume > 0)
        .map(d => ({ date: d.date, value: d.totalVolume })),
      durationProgress: sortedData
        .filter(d => d.totalDuration > 0)
        .map(d => ({ date: d.date, value: d.totalDuration })),
    };
  };

  const calculateExerciseStats = (data: DeviceProgressData[]): DeviceExerciseStats => {
    if (data.length === 0) {
      return {
        totalSessions: 0,
        totalSets: 0,
        totalReps: 0,
        averageReps: 0,
        maxWeight: 0,
        totalVolume: 0,
        averageVolume: 0,
        firstSession: '',
        lastSession: '',
      };
    }

    const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const totalSessions = data.length;
    const totalSets = data.reduce((sum, session) => sum + session.sets.length, 0);
    const totalReps = data.reduce((sum, session) => 
      sum + session.sets.reduce((setSum, set) => setSum + (set.reps || 0), 0), 0
    );
    const maxWeight = Math.max(...data.map(d => d.maxWeight), 0);
    const totalVolume = data.reduce((sum, session) => sum + session.totalVolume, 0);

    return {
      totalSessions,
      totalSets,
      totalReps,
      averageReps: totalSets > 0 ? Math.round(totalReps / totalSets) : 0,
      maxWeight,
      totalVolume,
      averageVolume: totalSessions > 0 ? Math.round(totalVolume / totalSessions) : 0,
      firstSession: sortedData[0].date,
      lastSession: sortedData[sortedData.length - 1].date,
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDeviceProgressData();
    setRefreshing(false);
  };

  const handleBackPress = () => {
    router.back();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#27AE60';
      case 'intermediate':
        return '#F39C12';
      case 'advanced':
        return '#E74C3C';
      default:
        return '#999';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return '#FF6B35';
      case 'cardio':
        return '#E74C3C';
      case 'flexibility':
        return '#27AE60';
      case 'balance':
        return '#9B59B6';
      default:
        return '#999';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Show authentication requirement if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
          <TouchableOpacity style={styles.headerBackButton} onPress={handleBackPress}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exercise Progress</Text>
        </LinearGradient>

        <View style={styles.authRequiredContainer}>
          <Smartphone size={64} color="#666" />
          <Text style={styles.authRequiredTitle}>Device Authentication Required</Text>
          <Text style={styles.authRequiredText}>
            Your device needs to be authenticated to view exercise progress and personal records.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
          <TouchableOpacity style={styles.headerBackButton} onPress={handleBackPress}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exercise Progress</Text>
        </LinearGradient>

        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading progress data...</Text>
        </View>
      </View>
    );
  }

  if (error || !exercise) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
          <TouchableOpacity style={styles.headerBackButton} onPress={handleBackPress}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exercise Progress</Text>
        </LinearGradient>

        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Exercise not found'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseTitle}>{exercise.name}</Text>
          <View style={styles.exerciseMeta}>
            <View style={styles.metaItem}>
              <Text style={[styles.metaText, { color: getDifficultyColor(exercise.difficulty_level) }]}>
                {exercise.difficulty_level}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={[styles.metaText, { color: getTypeColor(exercise.exercise_type) }]}>
                {exercise.exercise_type}
              </Text>
            </View>
          </View>
          {exercise.description && (
            <Text style={styles.exerciseDescription}>{exercise.description}</Text>
          )}
        </View>
      </LinearGradient>

      {/* Device Status */}
      <View style={styles.deviceStatus}>
        <LinearGradient colors={['#1f2937', '#111827']} style={styles.deviceStatusGradient}>
          <User size={16} color="#FF6B35" />
          <Text style={styles.deviceStatusText}>
            Progress tracked on {user.platform} • Device: {user.deviceName}
          </Text>
          <View style={styles.activeIndicator}>
            <View style={styles.activeIndicatorDot} />
          </View>
        </LinearGradient>
      </View>

      {exercise.demo_image_url && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: exercise.demo_image_url }} style={styles.exerciseImage} />
        </View>
      )}

      {/* Exercise Stats Overview */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Progress Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Calendar size={20} color="#4A90E2" />
            <Text style={styles.statValue}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={20} color="#27AE60" />
            <Text style={styles.statValue}>{stats.totalSets}</Text>
            <Text style={styles.statLabel}>Total Sets</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={20} color="#FF6B35" />
            <Text style={styles.statValue}>{stats.averageReps}</Text>
            <Text style={styles.statLabel}>Avg Reps</Text>
          </View>
          <View style={styles.statCard}>
            <Trophy size={20} color="#9B59B6" />
            <Text style={styles.statValue}>{personalRecords.length}</Text>
            <Text style={styles.statLabel}>Records</Text>
          </View>
        </View>
        
        {stats.totalSessions > 0 && (
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionInfoText}>
              First session: {formatDate(stats.firstSession)} • Last session: {formatDate(stats.lastSession)}
            </Text>
          </View>
        )}
      </View>

      {/* Progress Charts */}
      {progressData.weightProgress.length > 0 && (
        <View style={styles.chartContainer}>
          <ExerciseProgressChart
            data={progressData.weightProgress}
            title="Weight Progress"
            subtitle="Maximum weight lifted per session on this device"
            color="#FF6B35"
            unit="kg"
            chartType="line"
          />
        </View>
      )}

      {progressData.repsProgress.length > 0 && (
        <View style={styles.chartContainer}>
          <ExerciseProgressChart
            data={progressData.repsProgress}
            title="Reps Progress"
            subtitle="Maximum reps performed per session on this device"
            color="#4A90E2"
            unit="reps"
            chartType="line"
          />
        </View>
      )}

      {progressData.volumeProgress.length > 0 && (
        <View style={styles.chartContainer}>
          <ExerciseProgressChart
            data={progressData.volumeProgress}
            title="Volume Progress"
            subtitle="Total volume (weight × reps) per session on this device"
            color="#27AE60"
            unit="kg"
            chartType="bar"
          />
        </View>
      )}

      {progressData.durationProgress.length > 0 && (
        <View style={styles.chartContainer}>
          <ExerciseProgressChart
            data={progressData.durationProgress}
            title="Duration Progress"
            subtitle="Exercise duration per session on this device"
            color="#9B59B6"
            unit="min"
            chartType="line"
          />
        </View>
      )}

      {/* Personal Records */}
      {personalRecords.length > 0 && (
        <View style={styles.recordsContainer}>
          <Text style={styles.sectionTitle}>Personal Records</Text>
          <Text style={styles.sectionSubtitle}>Achievements on your {user.platform} device</Text>
          {personalRecords.map((record, index) => (
            <PersonalRecordCard
              key={record.id}
              record={record}
              showExerciseName={false}
            />
          ))}
        </View>
      )}

      {/* Muscle Groups */}
      <View style={styles.muscleGroupsContainer}>
        <Text style={styles.sectionTitle}>Target Muscle Groups</Text>
        <View style={styles.muscleGroups}>
          {exercise.muscle_groups.map((muscle, index) => (
            <View key={index} style={styles.muscleTag}>
              <Text style={styles.muscleTagText}>{muscle}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Equipment */}
      {exercise.equipment && exercise.equipment.length > 0 && (
        <View style={styles.equipmentContainer}>
          <Text style={styles.sectionTitle}>Equipment Needed</Text>
          <View style={styles.equipmentList}>
            {exercise.equipment.map((item, index) => (
              <View key={index} style={styles.equipmentTag}>
                <Text style={styles.equipmentTagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Instructions */}
      {exercise.instructions && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsText}>{exercise.instructions}</Text>
          </View>
        </View>
      )}

      {/* Empty State */}
      {stats.totalSessions === 0 && (
        <View style={styles.emptyState}>
          <Activity size={48} color="#666" />
          <Text style={styles.emptyTitle}>No Progress Data Yet</Text>
          <Text style={styles.emptyText}>
            Complete workouts with this exercise on your {user.platform} device to see your progress charts and statistics.
          </Text>
          <Text style={styles.emptyDeviceText}>
            All progress is tracked per device for privacy and accuracy.
          </Text>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  authRequiredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  authRequiredTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  authRequiredText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerBackButton: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  exerciseHeader: {
    alignItems: 'flex-start',
  },
  exerciseTitle: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  exerciseMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  deviceStatus: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  deviceStatusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  deviceStatusText: {
    fontSize: 12,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
    flex: 1,
  },
  activeIndicator: {
    marginLeft: 8,
  },
  activeIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ECC71',
  },
  imageContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  exerciseImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    marginTop: -8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  statValue: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  sessionInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  sessionInfoText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  chartContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  recordsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  muscleGroupsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleTag: {
    backgroundColor: '#FF6B3520',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  muscleTagText: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  equipmentContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equipmentTag: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  equipmentTagText: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  instructionsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  instructionsText: {
    fontSize: 16,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  emptyDeviceText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
});
