import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { DataProvider } from '@/contexts/DataContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isFrameworkReady = useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if ((fontsLoaded || fontError) && isFrameworkReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isFrameworkReady]);

  if ((!fontsLoaded && !fontError) || !isFrameworkReady) {
    return null;
  }

  return (
    <DataProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </DataProvider>
  );
}
