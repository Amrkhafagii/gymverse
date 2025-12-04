import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Target,
  Zap,
  Users,
  Trophy,
  Medal,
  Calendar,
  Dumbbell,
  Calculator,
  MoonStar,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileHeader from '@/components/ProfileHeader';
import ProfileStatsGrid from '@/components/ProfileStatsGrid';
import ProfileAchievementsSection from '@/components/ProfileAchievementsSection';
import ProfileRecentWorkoutsSection from '@/components/ProfileRecentWorkoutsSection';
import ProfilePersonalRecordsSection from '@/components/ProfilePersonalRecordsSection';
import ProfilePreferencesSection from '@/components/ProfilePreferencesSection';
import ProfileLogoutButton from '@/components/ProfileLogoutButton';
import TDEECalculator from '@/components/TDEECalculator';
import { useTheme } from '@/theme/ThemeProvider';
import { routes } from '@/utils/routes';
import { useWorkoutAnalytics } from '@/hooks/useWorkoutAnalytics';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useAchievements } from '@/hooks/useAchievements';

export default function ProfileScreen() {
  const { profile, signOut, user } = useAuth();
  const [showTDEECalculator, setShowTDEECalculator] = useState(false);
  const { mode, toggle } = useTheme();
  const { stats, streak, workoutSessions } = useWorkoutAnalytics(user?.id || null);
  const { personalRecords, recordStats } = usePersonalRecords(user?.id || null);
  const { userAchievements, getUnlockedCount } = useAchievements(user?.id || null);

  const totalWorkouts = stats.totalWorkouts || 0;
  const currentStreak = streak?.current_streak || 0;
  const unlockedAchievements = getUnlockedCount();
  const totalPRs = recordStats.totalRecords || personalRecords.length || 0;

  const statCards = [
    { label: 'Workouts', value: `${totalWorkouts}`, icon: Target },
    { label: 'Streak', value: `${currentStreak}`, icon: Zap },
    { label: 'PRs', value: `${totalPRs}`, icon: Medal },
    { label: 'Achievements', value: `${unlockedAchievements}`, icon: Trophy },
  ];

  const achievementIconByCategory: Record<string, any> = {
    workout: Target,
    strength: Dumbbell,
    consistency: Calendar,
    endurance: Zap,
    social: Users,
  };
  const achievementColors = ['#4A90E2', '#FF6B35', '#27AE60', '#9B59B6', '#F39C12', '#E74C3C'];
  const achievementItems = (userAchievements || []).slice(0, 6).map((ua, idx) => ({
    title: ua.achievement?.name || 'Achievement',
    icon: achievementIconByCategory[ua.achievement?.category || 'workout'] || Trophy,
    color: achievementColors[idx % achievementColors.length],
  }));

  const recentWorkouts = workoutSessions
    .slice()
    .sort((a, b) => (b.started_at || '').localeCompare(a.started_at || ''))
    .slice(0, 3)
    .map((session) => ({
      name: session.workout_id ? `Workout ${session.workout_id}` : `Session ${session.id}`,
      date: session.started_at ? new Date(session.started_at).toLocaleDateString() : 'Recently',
      duration: `${session.duration_minutes || 0} min`,
      calories: Math.round(session.calories_burned || 0),
    }));

  const personalRecordItems = personalRecords.slice(0, 4).map((record) => ({
    exercise:
      record.exercise?.name || record.exercise_name || record.exercise_id?.toString() || 'Exercise',
    weight: `${record.value ?? 0} ${record.unit || ''}`.trim(),
  }));

  // Dynamic preferences based on profile data
  const preferences = [
    { label: 'Workout Reminders', value: 'Daily at 6:00 PM' },
    {
      label: 'Units',
      value: profile?.preferred_units === 'imperial' ? 'Imperial (lbs)' : 'Metric (kg)',
    },
    {
      label: 'Privacy',
      value: profile?.is_public ? 'Public Profile' : 'Private Profile',
    },
    { label: 'Notifications', value: 'Enabled' },
    {
      label: 'Theme',
      value: mode === 'dark' ? 'Dark' : 'Light',
      action: toggle,
      icon: MoonStar,
      color: '#4A90E2',
    },
    {
      label: 'TDEE Calculator',
      value: 'Calculate daily calories',
      action: () => setShowTDEECalculator(true),
      icon: Calculator,
      color: '#FF6B35',
    },
  ];

  if (user?.app_metadata?.role === 'admin') {
    preferences.unshift({
      label: 'Admin payments',
      value: 'Approve receipts',
      action: () => router.push(routes.adminPayments as any),
      icon: ShieldCheck,
      color: '#FF6B35',
    });
  }

  if (user?.user_metadata?.is_coach || user?.app_metadata?.is_coach) {
    preferences.unshift({
      label: 'Your sales',
      value: 'View receipts',
      action: () => router.push(routes.coachPayments as any),
      icon: ShoppingBag,
      color: '#27AE60',
    });
    preferences.unshift({
      label: 'My products',
      value: 'Manage items',
      action: () => router.push(routes.coachProducts as any),
      icon: Target,
      color: '#F39C12',
    });
  }

  const handleSettingsPress = () => {
    console.log('Settings pressed');
  };

  const handleEditProfilePress = () => {
    router.push(routes.editProfile);
  };

  const handleShareProfilePress = () => {
    console.log('Share profile pressed');
  };

  const handleSeeAllWorkoutsPress = () => {
    console.log('See all workouts pressed');
  };

  const handlePreferencePress = (index: number) => {
    const preference = preferences[index];
    if (preference.action) {
      preference.action();
    } else {
      console.log('Preference pressed:', index);
    }
  };

  const handleLogoutPress = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get display values from profile or fallbacks
  const displayName = profile?.full_name || profile?.username || 'User';
  const displayHandle = profile?.username ? `@${profile.username}` : '@user';
  const displayBio = profile?.bio || 'No bio available. Edit your profile to add one!';
  const displayAvatar =
    profile?.avatar_url ||
    'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ProfileHeader
          userName={displayName}
          userHandle={displayHandle}
          userBio={displayBio}
          profileImageUrl={displayAvatar}
          onSettingsPress={handleSettingsPress}
          onEditProfilePress={handleEditProfilePress}
          onShareProfilePress={handleShareProfilePress}
        />

        <ProfileStatsGrid stats={statCards} />

        <ProfileAchievementsSection achievements={achievementItems} />

        <ProfileRecentWorkoutsSection
          recentWorkouts={recentWorkouts}
          onSeeAllPress={handleSeeAllWorkoutsPress}
        />

        <ProfilePersonalRecordsSection personalRecords={personalRecordItems} />

        <ProfilePreferencesSection
          preferences={preferences}
          onPreferencePress={handlePreferencePress}
        />

        <ProfileLogoutButton onLogoutPress={handleLogoutPress} />
      </ScrollView>

      <TDEECalculator visible={showTDEECalculator} onClose={() => setShowTDEECalculator(false)} />
    </View>
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
});
