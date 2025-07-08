import { Tabs } from 'expo-router';
import { 
  Home, 
  Dumbbell, 
  BarChart3, 
  Trophy,
  Ruler,
  Users,
  User,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useSocial } from '@/contexts/SocialContext';
import { useNotifications } from '@/hooks/useNotifications';
import { View, Text, StyleSheet } from 'react-native';

// Badge component for tab notifications
const TabBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </View>
  );
};

export default function TabLayout() {
  const { posts, currentUser } = useSocial();
  const { unreadCount } = useNotifications();
  
  // Calculate social activity indicators
  const userPosts = posts.filter(post => post.author.id === currentUser?.id);
  const recentActivity = posts.filter(post => {
    const postDate = new Date(post.timestamp);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return postDate > oneDayAgo;
  }).length;

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
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Users size={size} color={color} />
              {recentActivity > 0 && <TabBadge count={recentActivity} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <User size={size} color={color} />
              {unreadCount > 0 && <TabBadge count={unreadCount} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: DesignTokens.colors.error[500],
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: DesignTokens.colors.surface.secondary,
  },
  badgeText: {
    fontSize: 10,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
  },
});
