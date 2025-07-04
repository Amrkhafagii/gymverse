import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calendar, 
  Plus, 
  Clock, 
  Bell, 
  Play, 
  Edit3, 
  Trash2,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react-native';
import WorkoutCalendar from '@/components/schedule/WorkoutCalendar';
import ScheduleWorkoutModal from '@/components/schedule/ScheduleWorkoutModal';
import { 
  ScheduledWorkout,
  getWorkoutSchedule,
  getScheduledWorkoutsForDate,
  getUpcomingScheduledWorkouts,
  deleteScheduledWorkout,
  markWorkoutCompleted,
  updateSchedulePreferences
} from '@/lib/storage/scheduleStorage';
import { NotificationManager } from '@/lib/notifications';

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<ScheduledWorkout[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledWorkout | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScheduleData();
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    loadWorkoutsForDate(selectedDate);
  }, [selectedDate]);

  const requestNotificationPermissions = async () => {
    try {
      await NotificationManager.requestPermissions();
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      const [workoutsForDate, upcoming] = await Promise.all([
        getScheduledWorkoutsForDate(selectedDate),
        getUpcomingScheduledWorkouts(7),
      ]);
      
      setScheduledWorkouts(workoutsForDate);
      setUpcomingWorkouts(upcoming);
    } catch (error) {
      console.error('Error loading schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkoutsForDate = async (date: string) => {
    try {
      const workouts = await getScheduledWorkoutsForDate(date);
      setScheduledWorkouts(workouts);
    } catch (error) {
      console.error('Error loading workouts for date:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadScheduleData();
    setRefreshing(false);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleAddWorkout = (date?: string) => {
    setSelectedDate(date || selectedDate);
    setEditingSchedule(undefined);
    setShowScheduleModal(true);
  };

  const handleEditSchedule = (schedule: ScheduledWorkout) => {
    setEditingSchedule(schedule);
    setShowScheduleModal(true);
  };

  const handleDeleteSchedule = (schedule: ScheduledWorkout) => {
    Alert.alert(
      'Delete Scheduled Workout',
      `Are you sure you want to delete "${schedule.workoutName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Cancel notification if exists
              if (schedule.notificationId) {
                await NotificationManager.cancelNotification(schedule.notificationId);
              }
              
              await deleteScheduledWorkout(schedule.id);
              await loadScheduleData();
            } catch (error) {
              console.error('Error deleting scheduled workout:', error);
              Alert.alert('Error', 'Failed to delete scheduled workout');
            }
          },
        },
      ]
    );
  };

  const handleCompleteWorkout = async (schedule: ScheduledWorkout) => {
    try {
      await markWorkoutCompleted(schedule.id, 'Completed from schedule');
      await loadScheduleData();
    } catch (error) {
      console.error('Error marking workout as completed:', error);
      Alert.alert('Error', 'Failed to mark workout as completed');
    }
  };

  const handleScheduled = async (scheduledWorkout: ScheduledWorkout) => {
    await loadScheduleData();
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getWorkoutStatusColor = (workout: ScheduledWorkout) => {
    if (workout.isCompleted) return '#10b981';
    
    const now = new Date();
    const workoutDateTime = new Date(`${workout.scheduledDate}T${workout.scheduledTime}`);
    
    if (workoutDateTime < now) return '#ef4444'; // Overdue
    return '#9E7FFF'; // Scheduled
  };

  const getWorkoutStatusIcon = (workout: ScheduledWorkout) => {
    if (workout.isCompleted) return <CheckCircle size={20} color="#10b981" />;
    
    const now = new Date();
    const workoutDateTime = new Date(`${workout.scheduledDate}T${workout.scheduledTime}`);
    
    if (workoutDateTime < now) return <AlertCircle size={20} color="#ef4444" />;
    return <Clock size={20} color="#9E7FFF" />;
  };

  const renderScheduledWorkout = (workout: ScheduledWorkout) => (
    <View key={workout.id} style={styles.workoutCard}>
      <LinearGradient
        colors={['#1f2937', '#111827']}
        style={styles.workoutGradient}
      >
        <View style={styles.workoutHeader}>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutName}>{workout.workoutName}</Text>
            <View style={styles.workoutMeta}>
              {getWorkoutStatusIcon(workout)}
              <Text style={styles.workoutTime}>{formatTime(workout.scheduledTime)}</Text>
              {workout.reminderMinutes > 0 && (
                <>
                  <Bell size={16} color="#999" />
                  <Text style={styles.reminderText}>
                    {workout.reminderMinutes}m before
                  </Text>
                </>
              )}
            </View>
            {workout.notes && (
              <Text style={styles.workoutNotes}>{workout.notes}</Text>
            )}
          </View>
          
          <View style={styles.workoutActions}>
            {!workout.isCompleted && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleCompleteWorkout(workout)}
              >
                <CheckCircle size={20} color="#10b981" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditSchedule(workout)}
            >
              <Edit3 size={18} color="#9E7FFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteSchedule(workout)}
            >
              <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
        
        {workout.recurring && (
          <View style={styles.recurringBadge}>
            <Text style={styles.recurringText}>
              Repeats {workout.recurring.type}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );

  const renderUpcomingWorkout = (workout: ScheduledWorkout) => {
    const workoutDate = new Date(workout.scheduledDate);
    const today = new Date();
    const isToday = workoutDate.toDateString() === today.toDateString();
    const isTomorrow = workoutDate.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    let dateLabel = workoutDate.toLocaleDateString();
    if (isToday) dateLabel = 'Today';
    else if (isTomorrow) dateLabel = 'Tomorrow';

    return (
      <TouchableOpacity
        key={workout.id}
        style={styles.upcomingCard}
        onPress={() => setSelectedDate(workout.scheduledDate)}
      >
        <View style={styles.upcomingInfo}>
          <Text style={styles.upcomingName}>{workout.workoutName}</Text>
          <Text style={styles.upcomingDate}>
            {dateLabel} at {formatTime(workout.scheduledTime)}
          </Text>
        </View>
        <Play size={20} color="#9E7FFF" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Schedule</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => handleAddWorkout()}
            >
              <Plus size={24} color="#9E7FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Settings size={24} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.section}>
          <WorkoutCalendar
            onDateSelect={handleDateSelect}
            onAddWorkout={handleAddWorkout}
            selectedDate={selectedDate}
          />
        </View>

        {/* Selected Date Workouts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedDate === new Date().toISOString().split('T')[0] 
                ? 'Today' 
                : new Date(selectedDate).toLocaleDateString()
              }
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddWorkout(selectedDate)}
            >
              <Plus size={20} color="#9E7FFF" />
              <Text style={styles.addButtonText}>Add Workout</Text>
            </TouchableOpacity>
          </View>

          {scheduledWorkouts.length > 0 ? (
            scheduledWorkouts.map(renderScheduledWorkout)
          ) : (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={['#1f2937', '#111827']}
                style={styles.emptyStateGradient}
              >
                <Calendar size={48} color="#666" />
                <Text style={styles.emptyStateTitle}>No workouts scheduled</Text>
                <Text style={styles.emptyStateText}>
                  Tap "Add Workout" to schedule your first workout for this day
                </Text>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Upcoming Workouts */}
        {upcomingWorkouts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming This Week</Text>
            {upcomingWorkouts.slice(0, 5).map(renderUpcomingWorkout)}
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <LinearGradient colors={['#9E7FFF', '#7C3AED']} style={styles.statGradient}>
                <Text style={styles.statNumber}>
                  {upcomingWorkouts.filter(w => !w.isCompleted).length}
                </Text>
                <Text style={styles.statLabel}>Scheduled</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient colors={['#10b981', '#059669']} style={styles.statGradient}>
                <Text style={styles.statNumber}>
                  {upcomingWorkouts.filter(w => w.isCompleted).length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient colors={['#f472b6', '#ec4899']} style={styles.statGradient}>
                <Text style={styles.statNumber}>
                  {Math.round((upcomingWorkouts.filter(w => w.isCompleted).length / Math.max(upcomingWorkouts.length, 1)) * 100)}%
                </Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Schedule Modal */}
      <ScheduleWorkoutModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onScheduled={handleScheduled}
        selectedDate={selectedDate}
        editingSchedule={editingSchedule}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
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
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9E7FFF20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9E7FFF',
  },
  addButtonText: {
    fontSize: 14,
    color: '#9E7FFF',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  workoutCard: {
    marginBottom: 12,
  },
  workoutGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  workoutTime: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
    marginRight: 12,
  },
  reminderText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  workoutNotes: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    fontStyle: 'italic',
  },
  workoutActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  recurringBadge: {
    backgroundColor: '#9E7FFF20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  recurringText: {
    fontSize: 12,
    color: '#9E7FFF',
    fontFamily: 'Inter-Medium',
  },
  upcomingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  upcomingDate: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
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
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    opacity: 0.8,
  },
});
