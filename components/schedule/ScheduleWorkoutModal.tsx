import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Calendar, Clock, Bell, Repeat, Save } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { 
  scheduleWorkout, 
  ScheduledWorkout,
  updateScheduledWorkout,
  generateRecurringWorkouts,
  saveWorkoutSchedule,
  getWorkoutSchedule
} from '@/lib/storage/scheduleStorage';
import { NotificationManager } from '@/lib/notifications';

interface ScheduleWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  onScheduled: (scheduledWorkout: ScheduledWorkout) => void;
  selectedDate?: string;
  workoutId?: string;
  workoutName?: string;
  editingSchedule?: ScheduledWorkout;
}

export default function ScheduleWorkoutModal({
  visible,
  onClose,
  onScheduled,
  selectedDate,
  workoutId = '',
  workoutName = '',
  editingSchedule,
}: ScheduleWorkoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    workoutId: workoutId,
    workoutName: workoutName,
    date: selectedDate || new Date().toISOString().split('T')[0],
    time: '09:00',
    reminderMinutes: 30,
    notes: '',
  });

  const [recurring, setRecurring] = useState({
    enabled: false,
    type: 'weekly' as 'daily' | 'weekly' | 'monthly',
    interval: 1,
    daysOfWeek: [] as number[],
    endDate: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const reminderOptions = [
    { label: 'No reminder', value: 0 },
    { label: '15 minutes before', value: 15 },
    { label: '30 minutes before', value: 30 },
    { label: '1 hour before', value: 60 },
    { label: '2 hours before', value: 120 },
  ];

  useEffect(() => {
    if (editingSchedule) {
      setFormData({
        workoutId: editingSchedule.workoutId,
        workoutName: editingSchedule.workoutName,
        date: editingSchedule.scheduledDate,
        time: editingSchedule.scheduledTime,
        reminderMinutes: editingSchedule.reminderMinutes,
        notes: editingSchedule.notes || '',
      });

      if (editingSchedule.recurring) {
        setRecurring({
          enabled: true,
          type: editingSchedule.recurring.type,
          interval: editingSchedule.recurring.interval,
          daysOfWeek: editingSchedule.recurring.daysOfWeek || [],
          endDate: editingSchedule.recurring.endDate || '',
        });
      }
    } else {
      // Reset form for new schedule
      setFormData({
        workoutId: workoutId,
        workoutName: workoutName,
        date: selectedDate || new Date().toISOString().split('T')[0],
        time: '09:00',
        reminderMinutes: 30,
        notes: '',
      });
      setRecurring({
        enabled: false,
        type: 'weekly',
        interval: 1,
        daysOfWeek: [],
        endDate: '',
      });
    }
  }, [visible, editingSchedule, selectedDate, workoutId, workoutName]);

  const handleSchedule = async () => {
    if (!formData.workoutId || !formData.workoutName) {
      Alert.alert('Error', 'Please select a workout to schedule');
      return;
    }

    setLoading(true);

    try {
      let scheduledWorkout: ScheduledWorkout;

      const recurringConfig = recurring.enabled ? {
        type: recurring.type,
        interval: recurring.interval,
        daysOfWeek: recurring.type === 'weekly' ? recurring.daysOfWeek : undefined,
        endDate: recurring.endDate || undefined,
      } : undefined;

      if (editingSchedule) {
        // Update existing schedule
        const updated = await updateScheduledWorkout(editingSchedule.id, {
          workoutId: formData.workoutId,
          workoutName: formData.workoutName,
          scheduledDate: formData.date,
          scheduledTime: formData.time,
          reminderMinutes: formData.reminderMinutes,
          notes: formData.notes,
          recurring: recurringConfig,
        });

        if (!updated) {
          throw new Error('Failed to update scheduled workout');
        }

        scheduledWorkout = updated;
      } else {
        // Create new schedule
        scheduledWorkout = await scheduleWorkout(
          formData.workoutId,
          formData.workoutName,
          formData.date,
          formData.time,
          formData.reminderMinutes,
          recurringConfig
        );
      }

      // Schedule notification if reminder is enabled
      if (formData.reminderMinutes > 0) {
        const scheduledDateTime = new Date(`${formData.date}T${formData.time}`);
        const notificationId = await NotificationManager.scheduleWorkoutReminder(
          formData.workoutId,
          formData.workoutName,
          scheduledDateTime,
          formData.reminderMinutes
        );

        if (notificationId) {
          await updateScheduledWorkout(scheduledWorkout.id, {
            notificationId,
          });
        }
      }

      // Generate recurring workouts if enabled
      if (recurring.enabled) {
        const recurringWorkouts = await generateRecurringWorkouts(scheduledWorkout, 8);
        
        if (recurringWorkouts.length > 0) {
          const schedule = await getWorkoutSchedule();
          schedule.scheduledWorkouts.push(...recurringWorkouts);
          await saveWorkoutSchedule(schedule);

          // Schedule notifications for recurring workouts
          for (const recurringWorkout of recurringWorkouts) {
            if (recurringWorkout.reminderMinutes > 0) {
              const scheduledDateTime = new Date(`${recurringWorkout.scheduledDate}T${recurringWorkout.scheduledTime}`);
              const notificationId = await NotificationManager.scheduleWorkoutReminder(
                recurringWorkout.workoutId,
                recurringWorkout.workoutName,
                scheduledDateTime,
                recurringWorkout.reminderMinutes
              );

              if (notificationId) {
                await updateScheduledWorkout(recurringWorkout.id, {
                  notificationId,
                });
              }
            }
          }
        }
      }

      onScheduled(scheduledWorkout);
      onClose();

      Alert.alert(
        'Success',
        `Workout ${editingSchedule ? 'updated' : 'scheduled'} successfully!`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error scheduling workout:', error);
      Alert.alert('Error', error.message || 'Failed to schedule workout');
    } finally {
      setLoading(false);
    }
  };

  const toggleDayOfWeek = (dayIndex: number) => {
    setRecurring(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(dayIndex)
        ? prev.daysOfWeek.filter(d => d !== dayIndex)
        : [...prev.daysOfWeek, dayIndex].sort(),
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate.toISOString().split('T')[0],
      }));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setFormData(prev => ({
        ...prev,
        time: `${hours}:${minutes}`,
      }));
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setRecurring(prev => ({
        ...prev,
        endDate: selectedDate.toISOString().split('T')[0],
      }));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {editingSchedule ? 'Edit Schedule' : 'Schedule Workout'}
            </Text>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSchedule}
              disabled={loading}
            >
              <Save size={20} color={loading ? "#666" : "#9E7FFF"} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Workout Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workout</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.workoutName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, workoutName: text }))}
                placeholder="Enter workout name"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Date & Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date & Time</Text>
            
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.inputContainer, styles.halfWidth]}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.dateTimeButton}>
                  <Calendar size={20} color="#9E7FFF" />
                  <Text style={styles.dateTimeText}>
                    {new Date(formData.date).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.inputContainer, styles.halfWidth]}
                onPress={() => setShowTimePicker(true)}
              >
                <View style={styles.dateTimeButton}>
                  <Clock size={20} color="#9E7FFF" />
                  <Text style={styles.dateTimeText}>{formData.time}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reminder */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminder</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {reminderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.reminderChip,
                    formData.reminderMinutes === option.value && styles.reminderChipActive,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, reminderMinutes: option.value }))}
                >
                  <Bell size={16} color={formData.reminderMinutes === option.value ? "#fff" : "#999"} />
                  <Text style={[
                    styles.reminderChipText,
                    formData.reminderMinutes === option.value && styles.reminderChipTextActive,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Recurring */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recurring</Text>
              <Switch
                value={recurring.enabled}
                onValueChange={(value) => setRecurring(prev => ({ ...prev, enabled: value }))}
                trackColor={{ false: '#333', true: '#9E7FFF' }}
                thumbColor={recurring.enabled ? '#fff' : '#999'}
              />
            </View>

            {recurring.enabled && (
              <View style={styles.recurringOptions}>
                {/* Frequency Type */}
                <View style={styles.frequencyContainer}>
                  {['daily', 'weekly', 'monthly'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.frequencyChip,
                        recurring.type === type && styles.frequencyChipActive,
                      ]}
                      onPress={() => setRecurring(prev => ({ ...prev, type: type as any }))}
                    >
                      <Text style={[
                        styles.frequencyChipText,
                        recurring.type === type && styles.frequencyChipTextActive,
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Days of Week (for weekly) */}
                {recurring.type === 'weekly' && (
                  <View style={styles.daysContainer}>
                    <Text style={styles.subsectionTitle}>Days of Week</Text>
                    <View style={styles.daysRow}>
                      {dayNames.map((day, index) => (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.dayChip,
                            recurring.daysOfWeek.includes(index) && styles.dayChipActive,
                          ]}
                          onPress={() => toggleDayOfWeek(index)}
                        >
                          <Text style={[
                            styles.dayChipText,
                            recurring.daysOfWeek.includes(index) && styles.dayChipTextActive,
                          ]}>
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* End Date */}
                <View style={styles.endDateContainer}>
                  <Text style={styles.subsectionTitle}>End Date (Optional)</Text>
                  <TouchableOpacity
                    style={styles.endDateButton}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Calendar size={20} color="#9E7FFF" />
                    <Text style={styles.endDateText}>
                      {recurring.endDate 
                        ? new Date(recurring.endDate).toLocaleDateString()
                        : 'No end date'
                      }
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              placeholder="Add any notes about this workout..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Date/Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={new Date(formData.date)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={new Date(`2000-01-01T${formData.time}`)}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={recurring.endDate ? new Date(recurring.endDate) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleEndDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#333',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
  },
  reminderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  reminderChipActive: {
    backgroundColor: '#9E7FFF',
    borderColor: '#9E7FFF',
  },
  reminderChipText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  reminderChipTextActive: {
    color: '#fff',
  },
  recurringOptions: {
    marginTop: 16,
  },
  frequencyContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  frequencyChip: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  frequencyChipActive: {
    backgroundColor: '#9E7FFF',
    borderColor: '#9E7FFF',
  },
  frequencyChipText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  frequencyChipTextActive: {
    color: '#fff',
  },
  daysContainer: {
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    marginBottom: 12,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayChip: {
    backgroundColor: '#1a1a1a',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  dayChipActive: {
    backgroundColor: '#9E7FFF',
    borderColor: '#9E7FFF',
  },
  dayChipText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  dayChipTextActive: {
    color: '#fff',
  },
  endDateContainer: {
    marginBottom: 20,
  },
  endDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  endDateText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
  },
  bottomSpacer: {
    height: 100,
  },
});
