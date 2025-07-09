import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Context Providers
import { DeviceAuthProvider } from '@/contexts/DeviceAuthContext';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { WorkoutHistoryProvider } from '@/contexts/WorkoutHistoryContext';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { AchievementProvider } from '@/contexts/AchievementContext';
import { PersonalRecordProvider } from '@/contexts/PersonalRecordContext';
import { MeasurementProvider } from '@/contexts/MeasurementContext';
import { ChallengeProvider } from '@/contexts/ChallengeContext';
import { SocialProvider } from '@/contexts/SocialContext';
import { LeaderboardProvider } from '@/contexts/LeaderboardContext';
import { OfflineProvider } from '@/contexts/OfflineContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    // Use system fonts as fallback since custom fonts are causing issues
    'Inter-Regular': 'System',
    'Inter-Medium': 'System',
    'Inter-SemiBold': 'System',
    'Inter-Bold': 'System',
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <DeviceAuthProvider>
      <OfflineProvider>
        <WorkoutProvider>
          <WorkoutHistoryProvider>
            <ProgressProvider>
              <PersonalRecordProvider>
                <MeasurementProvider>
                  <AchievementProvider>
                    <ChallengeProvider>
                      <SocialProvider>
                        <LeaderboardProvider>
                          <Stack>
                            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                            <Stack.Screen name="achievements" options={{ headerShown: false }} />
                          </Stack>
                          <StatusBar style="light" />
                        </LeaderboardProvider>
                      </SocialProvider>
                    </ChallengeProvider>
                  </AchievementProvider>
                </MeasurementProvider>
              </PersonalRecordProvider>
            </ProgressProvider>
          </WorkoutHistoryProvider>
        </WorkoutProvider>
      </OfflineProvider>
    </DeviceAuthProvider>
  );
}
