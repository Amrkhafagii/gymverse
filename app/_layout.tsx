import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { DeviceAuthProvider } from '@/contexts/DeviceAuthContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding before asset loading is complete
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
    <DeviceAuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="workout-session" />
        <Stack.Screen name="exercise-detail" />
        <Stack.Screen name="exercise-progress" />
        <Stack.Screen name="create-exercise" />
        <Stack.Screen name="template-preview" />
      </Stack>
    </DeviceAuthProvider>
  );
}
