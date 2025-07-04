import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { ScheduledWorkout, getScheduledWorkoutsForDate } from '@/lib/storage/scheduleStorage';

interface WorkoutCalendarProps {
  onDateSelect: (date: string) => void;
  onAddWorkout: (date: string) => void;
  selectedDate?: string;
}

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  scheduledWorkouts: ScheduledWorkout[];
}

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width - 40;
const DAY_WIDTH = CALENDAR_WIDTH / 7;

export default function WorkoutCalendar({ 
  onDateSelect, 
  onAddWorkout, 
selectedDate 
}: WorkoutCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate]);

  const generateCalendarDays = async () => {
    setLoading(true);
    
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // Get first day of the month and how many days in month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      // Get days from previous month to fill the first week
      const prevMonth = new Date(year, month - 1, 0);
      const daysFromPrevMonth = startingDayOfWeek;
      
      // Get days from next month to fill the last week
      const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
      const daysFromNextMonth = totalCells - (daysInMonth + daysFromPrevMonth);
      
      const days: CalendarDay[] = [];
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      // Previous month days
      for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
        const day = prevMonth.getDate() - i;
        const date = new Date(year, month - 1, day);
        const dateString = date.toISOString().split('T')[0];
        
        const scheduledWorkouts = await getScheduledWorkoutsForDate(dateString);
        
        days.push({
          date: dateString,
          day,
          isCurrentMonth: false,
          isToday: dateString === todayString,
          isSelected: dateString === selectedDate,
          scheduledWorkouts,
        });
      }
      
      // Current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toISOString().split('T')[0];
        
        const scheduledWorkouts = await getScheduledWorkoutsForDate(dateString);
        
        days.push({
          date: dateString,
          day,
          isCurrentMonth: true,
          isToday: dateString === todayString,
          isSelected: dateString === selectedDate,
          scheduledWorkouts,
        });
      }
      
      // Next month days
      for (let day = 1; day <= daysFromNextMonth; day++) {
        const date = new Date(year, month + 1, day);
        const dateString = date.toISOString().split('T')[0];
        
        const scheduledWorkouts = await getScheduledWorkoutsForDate(dateString);
        
        days.push({
          date: dateString,
          day,
          isCurrentMonth: false,
          isToday: dateString === todayString,
          isSelected: dateString === selectedDate,
          scheduledWorkouts,
        });
      }
      
      setCalendarDays(days);
    } catch (error) {
      console.error('Error generating calendar days:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDatePress = (day: CalendarDay) => {
    onDateSelect(day.date);
  };

  const getWorkoutIndicatorColor = (scheduledWorkouts: ScheduledWorkout[]) => {
    if (scheduledWorkouts.length === 0) return null;
    
    const hasCompleted = scheduledWorkouts.some(w => w.isCompleted);
    const hasIncomplete = scheduledWorkouts.some(w => !w.isCompleted);
    
    if (hasCompleted && !hasIncomplete) return '#10b981'; // Green - all completed
    if (hasCompleted && hasIncomplete) return '#f59e0b'; // Orange - partially completed
    return '#9E7FFF'; // Purple - scheduled but not completed
  };

  const renderCalendarDay = (day: CalendarDay, index: number) => {
    const indicatorColor = getWorkoutIndicatorColor(day.scheduledWorkouts);
    
    return (
      <TouchableOpacity
        key={`${day.date}-${index}`}
        style={[
          styles.dayContainer,
          day.isToday && styles.todayContainer,
          day.isSelected && styles.selectedContainer,
        ]}
        onPress={() => handleDatePress(day)}
        onLongPress={() => onAddWorkout(day.date)}
      >
        <Text style={[
          styles.dayText,
          !day.isCurrentMonth && styles.inactiveDayText,
          day.isToday && styles.todayText,
          day.isSelected && styles.selectedText,
        ]}>
          {day.day}
        </Text>
        
        {indicatorColor && (
          <View style={styles.indicatorContainer}>
            <View style={[styles.workoutIndicator, { backgroundColor: indicatorColor }]} />
            {day.scheduledWorkouts.length > 1 && (
              <Text style={styles.workoutCount}>{day.scheduledWorkouts.length}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Calendar Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
        >
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.monthYear}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
        >
          <ChevronRight size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Day Names */}
      <View style={styles.dayNamesContainer}>
        {dayNames.map((dayName) => (
          <View key={dayName} style={styles.dayNameContainer}>
            <Text style={styles.dayNameText}>{dayName}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => renderCalendarDay(day, index))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, { backgroundColor: '#9E7FFF' }]} />
          <Text style={styles.legendText}>Scheduled</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>Partial</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#262626',
  },
  monthYear: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  dayNamesContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayNameContainer: {
    width: DAY_WIDTH,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayNameText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: DAY_WIDTH,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  todayContainer: {
    backgroundColor: '#9E7FFF20',
    borderRadius: 8,
  },
  selectedContainer: {
    backgroundColor: '#9E7FFF',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Medium',
  },
  inactiveDayText: {
    color: '#666',
  },
  todayText: {
    color: '#9E7FFF',
    fontFamily: 'Inter-Bold',
  },
  selectedText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  workoutCount: {
    fontSize: 8,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginLeft: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
});
