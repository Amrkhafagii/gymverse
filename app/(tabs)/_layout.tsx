import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, Dumbbell, TrendingUp, Users, MoreHorizontal } from 'lucide-react-native';
import { HapticTab } from '@/components/HapticTab';

export default function TabLayout() {
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    // Ensure tabs are ready before rendering
    const timer = setTimeout(() => {
      setIsLayoutReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  if (!isLayoutReady) {
    return <View style={{ flex: 1, backgroundColor: '#0a0a0a' }} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 90,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <LinearGradient
              colors={['rgba(26, 26, 26, 0.95)', 'rgba(10, 10, 10, 0.98)']}
              style={styles.gradient}
            />
          </View>
        ),
        tabBarActiveTintColor: '#9E7FFF',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Medium',
          marginBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: 8,
        },
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: false,
      }}
    >
      {/* Main Tab Screens - Always Visible */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          tabBarAccessibilityLabel: 'Home Tab',
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
          tabBarAccessibilityLabel: 'Workouts Tab',
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />,
          tabBarAccessibilityLabel: 'Progress Tab',
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          tabBarAccessibilityLabel: 'Social Tab',
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <MoreHorizontal size={size} color={color} />,
          tabBarAccessibilityLabel: 'More Tab',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
});
