import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { DeviceAuthProvider } from '@/contexts/DeviceAuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { OfflineProvider } from '@/contexts/OfflineContext';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cfltlvkiglukppjqoxwn.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmbHRsdmtpZ2x1a3BwanFveHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDYzNjAsImV4cCI6MjA2NjY4MjM2MH0.VTMaE1R-KuqKTzqQWnjIvaiWM5vK-Y7VTnYT9wXc7o8';

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
    <OfflineProvider supabaseUrl={SUPABASE_URL} supabaseKey={SUPABASE_ANON_KEY}>
      <DeviceAuthProvider>
        <DataProvider>
          <Stack 
            screenOptions={{ 
              headerShown: false,
              gestureEnabled: true,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen 
              name="(tabs)" 
              options={{
                gestureEnabled: false,
              }}
            />
            <Stack.Screen 
              name="workout-session" 
              options={{
                presentation: 'modal',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="exercise-detail" 
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="create-exercise" 
              options={{
                presentation: 'modal',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="template-preview" 
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="tdee-calculator" 
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="profile" 
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="scanner" 
              options={{
                presentation: 'modal',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="exercises" 
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="achievements" 
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="education" 
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="create-workout" 
              options={{
                presentation: 'modal',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="workout-history" 
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="exercise-library" 
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="schedule" 
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="edit-profile" 
              options={{
                presentation: 'modal',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="leaderboards" 
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="workout-detail" 
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="exercise-progress" 
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="workout-templates" 
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
          </Stack>
        </DataProvider>
      </DeviceAuthProvider>
    </OfflineProvider>
  );
}
