import { Stack } from 'expo-router';
import { WorkoutSessionProvider } from '@/contexts/WorkoutSessionContext';
import { WorkoutHistoryProvider } from '@/contexts/WorkoutHistoryContext';
import { AchievementProvider } from '@/contexts/AchievementContext';
import { MeasurementProvider } from '@/contexts/MeasurementContext';
import { AchievementNotificationProvider } from '@/components/achievements/AchievementNotificationProvider';

export default function RootLayout() {
  return (
    <WorkoutSessionProvider>
      <WorkoutHistoryProvider>
        <AchievementProvider>
          <MeasurementProvider>
            <AchievementNotificationProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </AchievementNotificationProvider>
          </MeasurementProvider>
        </AchievementProvider>
      </WorkoutHistoryProvider>
    </WorkoutSessionProvider>
  );
}
