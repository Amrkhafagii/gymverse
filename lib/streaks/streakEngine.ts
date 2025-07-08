import { WorkoutSession } from '@/contexts/WorkoutSessionContext';

export interface StreakCalculation {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  streakStartDate: string | null;
}

export interface StreakRecovery {
  canRecover: boolean;
  recoveryDeadline: string | null;
  missedDays: number;
  recoveryWorkoutsNeeded: number;
}

export interface MotivationalMessage {
  message: string;
  type: 'encouragement' | 'celebration' | 'recovery' | 'milestone';
  icon: string;
}

export class StreakEngine {
  private static readonly RECOVERY_WINDOW_HOURS = 48; // 48 hours to recover a streak
  private static readonly MAX_RECOVERY_USES_PER_MONTH = 2;

  static calculateStreaks(workouts: WorkoutSession[]): StreakCalculation {
    if (workouts.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastWorkoutDate: null,
        streakStartDate: null,
      };
    }

    // Get completed workouts sorted by date
    const completedWorkouts = workouts
      .filter(w => w.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());

    if (completedWorkouts.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastWorkoutDate: null,
        streakStartDate: null,
      };
    }

    // Group workouts by date (ignore time)
    const workoutDates = new Set(
      completedWorkouts.map(w => new Date(w.completed_at!).toISOString().split('T')[0])
    );

    const sortedDates = Array.from(workoutDates).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    const lastWorkoutDate = sortedDates[0];
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Calculate current streak
    let currentStreak = 0;
    let streakStartDate: string | null = null;

    // Check if streak is still active (workout today or yesterday)
    if (lastWorkoutDate === today || lastWorkoutDate === yesterdayStr) {
      let currentDate = new Date(lastWorkoutDate);
      
      while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (workoutDates.has(dateStr)) {
          currentStreak++;
          streakStartDate = dateStr;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let previousDate: Date | null = null;

    for (const dateStr of sortedDates.reverse()) {
      const currentDate = new Date(dateStr);
      
      if (previousDate === null) {
        tempStreak = 1;
      } else {
        const dayDiff = Math.floor(
          (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      
      previousDate = currentDate;
    }
    
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return {
      currentStreak,
      longestStreak,
      lastWorkoutDate,
      streakStartDate,
    };
  }

  static getWeeklyStreaks(workouts: WorkoutSession[]) {
    const weeks: { week: string; streak: number; workoutDays: string[] }[] = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekWorkouts = workouts.filter(w => {
        if (!w.completed_at) return false;
        const workoutDate = new Date(w.completed_at);
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      });

      const workoutDays = Array.from(new Set(
        weekWorkouts.map(w => new Date(w.completed_at!).toISOString().split('T')[0])
      ));

      // Calculate consecutive days in this week
      let weekStreak = 0;
      let tempStreak = 0;
      const sortedDays = workoutDays.sort();
      
      for (let day = 0; day < 7; day++) {
        const checkDate = new Date(weekStart);
        checkDate.setDate(checkDate.getDate() + day);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        if (sortedDays.includes(checkDateStr)) {
          tempStreak++;
          weekStreak = Math.max(weekStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      weeks.unshift({
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        streak: weekStreak,
        workoutDays,
      });
    }

    return weeks;
  }

  static getMonthlyStats(workouts: WorkoutSession[]) {
    const months: {
      month: string;
      totalWorkouts: number;
      streakDays: number;
      consistency: number;
    }[] = [];

    const today = new Date();
    
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

      const monthWorkouts = workouts.filter(w => {
        if (!w.completed_at) return false;
        const workoutDate = new Date(w.completed_at);
        return workoutDate >= monthStart && workoutDate <= monthEnd;
      });

      const workoutDays = new Set(
        monthWorkouts.map(w => new Date(w.completed_at!).toISOString().split('T')[0])
      );

      // Calculate longest streak in this month
      let longestStreakInMonth = 0;
      let currentStreakInMonth = 0;
      
      for (let day = 1; day <= monthEnd.getDate(); day++) {
        const checkDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        if (workoutDays.has(checkDateStr)) {
          currentStreakInMonth++;
          longestStreakInMonth = Math.max(longestStreakInMonth, currentStreakInMonth);
        } else {
          currentStreakInMonth = 0;
        }
      }

      const totalDaysInMonth = monthEnd.getDate();
      const consistency = Math.round((workoutDays.size / totalDaysInMonth) * 100);

      months.unshift({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        totalWorkouts: monthWorkouts.length,
        streakDays: longestStreakInMonth,
        consistency,
      });
    }

    return months;
  }

  static calculateStreakRecovery(workouts: WorkoutSession[]): StreakRecovery {
    const streakData = this.calculateStreaks(workouts);
    
    if (streakData.currentStreak > 0) {
      return {
        canRecover: false,
        recoveryDeadline: null,
        missedDays: 0,
        recoveryWorkoutsNeeded: 0,
      };
    }

    if (!streakData.lastWorkoutDate) {
      return {
        canRecover: false,
        recoveryDeadline: null,
        missedDays: 0,
        recoveryWorkoutsNeeded: 0,
      };
    }

    const lastWorkout = new Date(streakData.lastWorkoutDate);
    const now = new Date();
    const hoursSinceLastWorkout = (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60);
    const daysSinceLastWorkout = Math.floor(hoursSinceLastWorkout / 24);

    // Can only recover if within recovery window and haven't used too many recoveries
    const canRecover = hoursSinceLastWorkout <= this.RECOVERY_WINDOW_HOURS && 
                      daysSinceLastWorkout <= 2;

    if (!canRecover) {
      return {
        canRecover: false,
        recoveryDeadline: null,
        missedDays: daysSinceLastWorkout,
        recoveryWorkoutsNeeded: 0,
      };
    }

    const recoveryDeadline = new Date(lastWorkout);
    recoveryDeadline.setHours(recoveryDeadline.getHours() + this.RECOVERY_WINDOW_HOURS);

    return {
      canRecover: true,
      recoveryDeadline: recoveryDeadline.toISOString(),
      missedDays: daysSinceLastWorkout,
      recoveryWorkoutsNeeded: daysSinceLastWorkout,
    };
  }

  static getMotivationalMessage(
    streakData: StreakCalculation,
    recoveryData: StreakRecovery
  ): MotivationalMessage {
    const { currentStreak, longestStreak } = streakData;

    // Recovery messages
    if (recoveryData.canRecover) {
      return {
        message: `Don't break the chain! You have ${Math.floor((new Date(recoveryData.recoveryDeadline!).getTime() - new Date().getTime()) / (1000 * 60 * 60))} hours to recover your streak.`,
        type: 'recovery',
        icon: '⚡',
      };
    }

    // Celebration messages
    if (currentStreak >= 30) {
      return {
        message: `Incredible! ${currentStreak} days strong! You're unstoppable! 🔥`,
        type: 'celebration',
        icon: '🏆',
      };
    }

    if (currentStreak >= 14) {
      return {
        message: `Two weeks of consistency! You're building an amazing habit! 💪`,
        type: 'celebration',
        icon: '⭐',
      };
    }

    if (currentStreak >= 7) {
      return {
        message: `One week streak! You're on fire! Keep the momentum going! 🔥`,
        type: 'celebration',
        icon: '🎯',
      };
    }

    if (currentStreak >= 3) {
      return {
        message: `${currentStreak} days in a row! You're building momentum! 💪`,
        type: 'celebration',
        icon: '⚡',
      };
    }

    // Milestone messages
    if (currentStreak === longestStreak && currentStreak > 0) {
      return {
        message: `New personal record! ${currentStreak} days is your longest streak yet! 🎉`,
        type: 'milestone',
        icon: '🏅',
      };
    }

    // Encouragement messages
    if (currentStreak === 0) {
      const encouragements = [
        "Every expert was once a beginner. Start your streak today! 💪",
        "The best time to start was yesterday. The second best time is now! 🚀",
        "Your future self will thank you for starting today! ✨",
        "One workout at a time. You've got this! 💪",
        "Champions are made in the gym. Let's begin! 🏆",
      ];
      return {
        message: encouragements[Math.floor(Math.random() * encouragements.length)],
        type: 'encouragement',
        icon: '💪',
      };
    }

    return {
      message: `Day ${currentStreak}! Keep pushing forward! 💪`,
      type: 'encouragement',
      icon: '🎯',
    };
  }

  static getStreakMilestones() {
    return [
      {
        id: 'streak_3',
        name: 'Getting Started',
        description: 'Complete 3 workouts in a row',
        target: 3,
        achieved: false,
        icon: '🎯',
        color: '#10B981',
      },
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        target: 7,
        achieved: false,
        icon: '⚡',
        color: '#3B82F6',
      },
      {
        id: 'streak_14',
        name: 'Two Week Champion',
        description: 'Keep going for 14 days straight',
        target: 14,
        achieved: false,
        icon: '🏅',
        color: '#8B5CF6',
      },
      {
        id: 'streak_30',
        name: 'Monthly Master',
        description: 'Achieve a 30-day streak',
        target: 30,
        achieved: false,
        icon: '👑',
        color: '#F59E0B',
      },
      {
        id: 'streak_60',
        name: 'Consistency King',
        description: 'Reach 60 days of dedication',
        target: 60,
        achieved: false,
        icon: '🌟',
        color: '#EF4444',
      },
      {
        id: 'streak_100',
        name: 'Legendary Streak',
        description: 'The ultimate 100-day achievement',
        target: 100,
        achieved: false,
        icon: '🏆',
        color: '#DC2626',
      },
    ];
  }

  static updateMilestones(
    currentMilestones: any[],
    currentStreak: number,
    longestStreak: number
  ) {
    return currentMilestones.map(milestone => {
      const wasAchieved = milestone.achieved;
      const isNowAchieved = longestStreak >= milestone.target;
      
      if (!wasAchieved && isNowAchieved) {
        return {
          ...milestone,
          achieved: true,
          achievedAt: new Date().toISOString(),
        };
      }
      
      return milestone;
    });
  }
}
