import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ScheduledWorkout {
  id: string;
  workoutId: string;
  workoutName: string;
  scheduledDate: string; // ISO string
  scheduledTime: string; // HH:MM format
  reminderMinutes: number;
  notificationId?: string;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number; // every X days/weeks/months
    daysOfWeek?: number[]; // 0-6, Sunday = 0
    endDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSchedule {
  scheduledWorkouts: ScheduledWorkout[];
  preferences: {
    defaultReminderMinutes: number;
    enableStreakReminders: boolean;
    enableWeeklyGoalReminders: boolean;
    quietHoursStart: string; // HH:MM
    quietHoursEnd: string; // HH:MM
  };
}

const SCHEDULE_STORAGE_KEY = '@gymverse_workout_schedule';

const defaultSchedule: WorkoutSchedule = {
  scheduledWorkouts: [],
  preferences: {
    defaultReminderMinutes: 30,
    enableStreakReminders: true,
    enableWeeklyGoalReminders: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  },
};

export const getWorkoutSchedule = async (): Promise<WorkoutSchedule> => {
  try {
    const stored = await AsyncStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...defaultSchedule,
        ...parsed,
        preferences: {
          ...defaultSchedule.preferences,
          ...parsed.preferences,
        },
      };
    }
    return defaultSchedule;
  } catch (error) {
    console.error('Error loading workout schedule:', error);
    return defaultSchedule;
  }
};

export const saveWorkoutSchedule = async (schedule: WorkoutSchedule): Promise<void> => {
  try {
    await AsyncStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
  } catch (error) {
    console.error('Error saving workout schedule:', error);
    throw error;
  }
};

export const scheduleWorkout = async (
  workoutId: string,
  workoutName: string,
  scheduledDate: string,
  scheduledTime: string,
  reminderMinutes?: number,
  recurring?: ScheduledWorkout['recurring']
): Promise<ScheduledWorkout> => {
  try {
    const schedule = await getWorkoutSchedule();
    const now = new Date().toISOString();
    
    const scheduledWorkout: ScheduledWorkout = {
      id: `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workoutId,
      workoutName,
      scheduledDate,
      scheduledTime,
      reminderMinutes: reminderMinutes ?? schedule.preferences.defaultReminderMinutes,
      isCompleted: false,
      recurring,
      createdAt: now,
      updatedAt: now,
    };

    schedule.scheduledWorkouts.push(scheduledWorkout);
    await saveWorkoutSchedule(schedule);
    
    return scheduledWorkout;
  } catch (error) {
    console.error('Error scheduling workout:', error);
    throw error;
  }
};

export const updateScheduledWorkout = async (
  scheduledWorkoutId: string,
  updates: Partial<ScheduledWorkout>
): Promise<ScheduledWorkout | null> => {
  try {
    const schedule = await getWorkoutSchedule();
    const index = schedule.scheduledWorkouts.findIndex(sw => sw.id === scheduledWorkoutId);
    
    if (index === -1) {
      return null;
    }

    const updatedWorkout = {
      ...schedule.scheduledWorkouts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    schedule.scheduledWorkouts[index] = updatedWorkout;
    await saveWorkoutSchedule(schedule);
    
    return updatedWorkout;
  } catch (error) {
    console.error('Error updating scheduled workout:', error);
    throw error;
  }
};

export const deleteScheduledWorkout = async (scheduledWorkoutId: string): Promise<boolean> => {
  try {
    const schedule = await getWorkoutSchedule();
    const initialLength = schedule.scheduledWorkouts.length;
    
    schedule.scheduledWorkouts = schedule.scheduledWorkouts.filter(
      sw => sw.id !== scheduledWorkoutId
    );

    if (schedule.scheduledWorkouts.length < initialLength) {
      await saveWorkoutSchedule(schedule);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting scheduled workout:', error);
    throw error;
  }
};

export const getScheduledWorkoutsForDate = async (date: string): Promise<ScheduledWorkout[]> => {
  try {
    const schedule = await getWorkoutSchedule();
    return schedule.scheduledWorkouts.filter(sw => sw.scheduledDate === date);
  } catch (error) {
    console.error('Error getting scheduled workouts for date:', error);
    return [];
  }
};

export const getUpcomingScheduledWorkouts = async (days: number = 7): Promise<ScheduledWorkout[]> => {
  try {
    const schedule = await getWorkoutSchedule();
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return schedule.scheduledWorkouts
      .filter(sw => {
        const scheduledDateTime = new Date(`${sw.scheduledDate}T${sw.scheduledTime}`);
        return scheduledDateTime >= now && scheduledDateTime <= futureDate && !sw.isCompleted;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
        const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
        return dateA.getTime() - dateB.getTime();
      });
  } catch (error) {
    console.error('Error getting upcoming scheduled workouts:', error);
    return [];
  }
};

export const markWorkoutCompleted = async (
  scheduledWorkoutId: string,
  notes?: string
): Promise<ScheduledWorkout | null> => {
  try {
    return await updateScheduledWorkout(scheduledWorkoutId, {
      isCompleted: true,
      completedAt: new Date().toISOString(),
      notes,
    });
  } catch (error) {
    console.error('Error marking workout as completed:', error);
    throw error;
  }
};

export const updateSchedulePreferences = async (
  preferences: Partial<WorkoutSchedule['preferences']>
): Promise<void> => {
  try {
    const schedule = await getWorkoutSchedule();
    schedule.preferences = {
      ...schedule.preferences,
      ...preferences,
    };
    await saveWorkoutSchedule(schedule);
  } catch (error) {
    console.error('Error updating schedule preferences:', error);
    throw error;
  }
};

export const generateRecurringWorkouts = async (
  baseWorkout: ScheduledWorkout,
  weeksAhead: number = 4
): Promise<ScheduledWorkout[]> => {
  try {
    if (!baseWorkout.recurring) {
      return [];
    }

    const generatedWorkouts: ScheduledWorkout[] = [];
    const startDate = new Date(baseWorkout.scheduledDate);
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + (weeksAhead * 7));

    if (baseWorkout.recurring.endDate) {
      const recurringEndDate = new Date(baseWorkout.recurring.endDate);
      if (recurringEndDate < endDate) {
        endDate.setTime(recurringEndDate.getTime());
      }
    }

    let currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + 1); // Start from next occurrence

    while (currentDate <= endDate) {
      let shouldSchedule = false;

      if (baseWorkout.recurring.type === 'daily') {
        shouldSchedule = true;
        currentDate.setDate(currentDate.getDate() + baseWorkout.recurring.interval);
      } else if (baseWorkout.recurring.type === 'weekly') {
        if (baseWorkout.recurring.daysOfWeek) {
          shouldSchedule = baseWorkout.recurring.daysOfWeek.includes(currentDate.getDay());
        } else {
          shouldSchedule = currentDate.getDay() === startDate.getDay();
        }
        
        if (!shouldSchedule) {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }
        
        currentDate.setDate(currentDate.getDate() + (7 * baseWorkout.recurring.interval));
      } else if (baseWorkout.recurring.type === 'monthly') {
        shouldSchedule = true;
        currentDate.setMonth(currentDate.getMonth() + baseWorkout.recurring.interval);
      }

      if (shouldSchedule) {
        const newWorkout: ScheduledWorkout = {
          ...baseWorkout,
          id: `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          scheduledDate: currentDate.toISOString().split('T')[0],
          isCompleted: false,
          completedAt: undefined,
          notes: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        generatedWorkouts.push(newWorkout);
      }
    }

    return generatedWorkouts;
  } catch (error) {
    console.error('Error generating recurring workouts:', error);
    return [];
  }
};
