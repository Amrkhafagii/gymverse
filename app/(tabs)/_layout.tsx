import { Tabs } from 'expo-router';
import { 
  Home, 
  Dumbbell, 
  BarChart3, 
  Trophy,
  Ruler,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: DesignTokens.colors.primary[500],
        tabBarInactiveTintColor: DesignTokens.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: DesignTokens.colors.surface.secondary,
          borderTopColor: DesignTokens.colors.neutral[800],
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: DesignTokens.typography.fontSize.xs,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="measurements"
        options={{
          title: 'Measurements',
          tabBarIcon: ({ color, size }) => <Ruler size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Achievements',
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
