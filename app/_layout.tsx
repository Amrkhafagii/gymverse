import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Context Providers
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { AchievementProvider } from '@/contexts/AchievementContext';
import { ChallengeProvider } from '@/contexts/ChallengeContext';
import { SocialProvider } from '@/contexts/SocialContext';
import { LeaderboardProvider } from '@/contexts/LeaderboardContext';
import { OfflineProvider } from '@/contexts/OfflineContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
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
    <OfflineProvider>
      <WorkoutProvider>
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
      </WorkoutProvider>
    </OfflineProvider>
  );
}
