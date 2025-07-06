import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { DeviceAuthProvider } from '@/contexts/DeviceAuthContext';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen immediately since we're not loading custom fonts
    SplashScreen.hideAsync();
  }, []);

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
