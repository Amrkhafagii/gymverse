import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#171717',
          borderTopColor: '#2F2F2F',
          borderTopWidth: 1,
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#9E7FFF',
        tabBarInactiveTintColor: '#A3A3A3',
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Medium',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="home" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="barbell" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="trending-up" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Achievements',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="trophy" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="person" size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
