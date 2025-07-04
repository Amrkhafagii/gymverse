import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useData } from '@/contexts/DataContext';

export default function IndexScreen() {
  const { loading } = useData();

  useEffect(() => {
    if (!loading) {
      // Always redirect to tabs since we removed authentication
      router.replace('/(tabs)');
    }
  }, [loading]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.logo}>GymVerse</Text>
          <Text style={styles.subtitle}>Your Fitness Journey</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: '#9E7FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#A3A3A3',
  },
});
