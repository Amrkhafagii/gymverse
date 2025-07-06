import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { DeviceAuthProvider } from '@/contexts/DeviceAuthContext';
import { DataProvider } from '@/contexts/DataContext';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Ensure the app is ready before hiding splash screen
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsReady(true);
      } catch (e) {
        console.warn(e);
      } finally {
        // Hide splash screen after setup is complete
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: '#0a0a0a' }} />;
  }

  return (
    <DeviceAuthProvider>
      <DataProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="workout-session" />
          <Stack.Screen name="exercise-detail" />
          <Stack.Screen name="create-exercise" />
          <Stack.Screen name="template-preview" />
          <Stack.Screen name="tdee-calculator" />
        </Stack>
      </DataProvider>
    </DeviceAuthProvider>
  );
}
