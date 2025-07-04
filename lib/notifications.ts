import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface WorkoutReminder {
  id: string;
  title: string;
  body: string;
  scheduledTime: Date;
  workoutId?: string;
  workoutName?: string;
  type: 'workout' | 'rest_day' | 'streak_reminder' | 'weekly_goal';
  isActive: boolean;
}

export class NotificationManager {
  static async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('workout-reminders', {
        name: 'Workout Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#9E7FFF',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('motivational', {
        name: 'Motivational Messages',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#f472b6',
        sound: 'default',
      });
    }

    return true;
  }

  static async scheduleWorkoutReminder(
    workoutId: string,
    workoutName: string,
    scheduledTime: Date,
    reminderMinutes: number = 30
  ): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const reminderTime = new Date(scheduledTime.getTime() - (reminderMinutes * 60 * 1000));
      
      if (reminderTime <= new Date()) {
        console.log('Reminder time is in the past, skipping');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💪 Workout Time!',
          body: `Your "${workoutName}" workout starts in ${reminderMinutes} minutes. Get ready to crush it!`,
          data: {
            workoutId,
            workoutName,
            type: 'workout_reminder',
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: reminderTime,
          channelId: 'workout-reminders',
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling workout reminder:', error);
      return null;
    }
  }

  static async scheduleRestDayReminder(scheduledTime: Date): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧘 Rest Day Reminder',
          body: 'Today is your rest day. Focus on recovery, stretching, or light activities!',
          data: {
            type: 'rest_day',
          },
          sound: 'default',
        },
        trigger: {
          date: scheduledTime,
          channelId: 'motivational',
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling rest day reminder:', error);
      return null;
    }
  }

  static async scheduleStreakReminder(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      // Schedule for 8 PM daily
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(20, 0, 0, 0);
      
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Keep Your Streak Alive!',
          body: "Don't break your workout streak! Even a quick 10-minute session counts.",
          data: {
            type: 'streak_reminder',
          },
          sound: 'default',
        },
        trigger: {
          date: reminderTime,
          repeats: true,
          channelId: 'motivational',
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling streak reminder:', error);
      return null;
    }
  }

  static async scheduleWeeklyGoalReminder(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      // Schedule for Sunday at 6 PM
      const now = new Date();
      const reminderTime = new Date();
      const daysUntilSunday = (7 - now.getDay()) % 7;
      
      reminderTime.setDate(now.getDate() + daysUntilSunday);
      reminderTime.setHours(18, 0, 0, 0);

      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 7);
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 Weekly Goal Check-in',
          body: 'How did your week go? Review your progress and plan for the week ahead!',
          data: {
            type: 'weekly_goal',
          },
          sound: 'default',
        },
        trigger: {
          date: reminderTime,
          repeats: true,
          channelId: 'motivational',
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling weekly goal reminder:', error);
      return null;
    }
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
}
