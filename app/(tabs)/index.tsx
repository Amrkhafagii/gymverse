import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Dumbbell, Zap, Trophy, Clock, Play, Plus, TrendingUp, Users } from 'lucide-react-native';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHomeStatsQuery } from '@/hooks/useHomeStatsQuery';
import { useWorkoutAnalytics } from '@/hooks/useWorkoutAnalytics';
import HomeHeader from '@/components/HomeHeader';
import HomeStatsSection from '@/components/HomeStatsSection';
import HomeQuickActionsSection from '@/components/HomeQuickActionsSection';
import HomeTodaysWorkoutSection from '@/components/HomeTodaysWorkoutSection';
import HomeRecentActivitySection from '@/components/HomeRecentActivitySection';
import { useTheme } from '@/theme/ThemeProvider';

export default function HomeScreen() {
  const { user } = useAuth();
  const { workouts, streak, personalRecords, hours, loading } = useHomeStatsQuery(user?.id || null);
  const { workoutSessions, refreshAnalytics } = useWorkoutAnalytics(user?.id || null);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  const stats = [
    { label: 'Workouts', value: workouts, icon: Dumbbell },
    { label: 'Streak', value: streak, icon: Zap },
    { label: 'PR\'s', value: personalRecords, icon: Trophy },
    { label: 'Hours', value: hours, icon: Clock },
  ];

  const quickActions = [
    { label: 'Start Workout', icon: Play, color: colors.primary },
    { label: 'Log Exercise', icon: Plus, color: colors.info },
    { label: 'View Progress', icon: TrendingUp, color: colors.success },
    { label: 'Find Friends', icon: Users, color: '#9B59B6' },
  ];

  // Get recent activity from actual workout sessions
  const getRecentActivity = () => {
    if (!workoutSessions || workoutSessions.length === 0) {
      return [
        {
          type: 'welcome',
          title: 'Welcome to FitTracker!',
          description: 'Start your first workout to see your activity here',
          date: 'Today',
          icon: 'dumbbell',
        },
      ];
    }

    return workoutSessions.slice(0, 3).map((session, index) => {
      const sessionDate = new Date(session.started_at);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let dateLabel = 'Today';
      if (diffInDays === 1) dateLabel = 'Yesterday';
      else if (diffInDays > 1) dateLabel = `${diffInDays} days ago`;

      return {
        type: 'workout',
        title: session.name,
        description: `${session.duration_minutes || 0} minutes • ${session.calories_burned || 0} calories`,
        date: dateLabel,
        icon: 'dumbbell',
      };
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAnalytics();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <HomeHeader />
      <HomeStatsSection stats={stats} loading={loading} />
      <HomeQuickActionsSection quickActions={quickActions} />
      <HomeTodaysWorkoutSection />
      <HomeRecentActivitySection activities={getRecentActivity()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
