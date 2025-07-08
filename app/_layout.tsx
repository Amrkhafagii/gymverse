import { Stack } from 'expo-router';
import { WorkoutSessionProvider } from '@/contexts/WorkoutSessionContext';
import { WorkoutHistoryProvider } from '@/contexts/WorkoutHistoryContext';
import { AchievementProvider } from '@/contexts/AchievementContext';
import { MeasurementProvider } from '@/contexts/MeasurementContext';
import { PersonalRecordProvider } from '@/contexts/PersonalRecordContext';
import { ProgressPhotoProvider } from '@/contexts/ProgressPhotoContext';
import { SocialProvider } from '@/contexts/SocialContext';
import { StreakProvider } from '@/contexts/StreakContext';
import { ChallengeProvider } from '@/contexts/ChallengeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { OfflineSyncProvider } from '@/contexts/OfflineSyncContext';
import { AchievementNotificationProvider } from '@/components/achievements/AchievementNotificationProvider';

export default function RootLayout() {
  return (
    <OfflineSyncProvider>
      <NotificationProvider>
        <WorkoutSessionProvider>
          <WorkoutHistoryProvider>
            <PersonalRecordProvider>
              <StreakProvider>
                <AchievementProvider>
                  <ChallengeProvider>
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
                  </ChallengeProvider>
                </AchievementProvider>
              </StreakProvider>
            </PersonalRecordProvider>
          </WorkoutHistoryProvider>
        </WorkoutSessionProvider>
      </NotificationProvider>
    </OfflineSyncProvider>
  );
}
