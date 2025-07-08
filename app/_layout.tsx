import { Stack } from 'expo-router';
import { WorkoutSessionProvider } from '@/contexts/WorkoutSessionContext';
import { WorkoutHistoryProvider } from '@/contexts/WorkoutHistoryContext';
import { AchievementProvider } from '@/contexts/AchievementContext';
import { MeasurementProvider } from '@/contexts/MeasurementContext';
import { PersonalRecordProvider } from '@/contexts/PersonalRecordContext';
import { ProgressPhotoProvider } from '@/contexts/ProgressPhotoContext';
import { SocialProvider } from '@/contexts/SocialContext';
import { AchievementNotificationProvider } from '@/components/achievements/AchievementNotificationProvider';

export default function RootLayout() {
  return (
    <WorkoutSessionProvider>
      <WorkoutHistoryProvider>
        <PersonalRecordProvider>
          <AchievementProvider>
            <MeasurementProvider>
              <ProgressPhotoProvider>
                <SocialProvider>
                  <AchievementNotificationProvider>
                    <Stack>
                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    </Stack>
                  </AchievementNotificationProvider>
                </SocialProvider>
              </ProgressPhotoProvider>
            </MeasurementProvider>
          </AchievementProvider>
        </PersonalRecordProvider>
      </WorkoutHistoryProvider>
    </WorkoutSessionProvider>
  );
}
