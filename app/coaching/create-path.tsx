import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useCoachingPaths } from '@/hooks/useCoachingPaths';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/theme/ThemeProvider';
import { routes } from '@/utils/routes';
import { getPendingPaymentForFeatureKey } from '@/lib/supabase';

const goalOptions = ['first_pullup', '5k', 'recomp', 'hypertrophy', 'fat_loss'];

export default function CreateCoachingPathScreen() {
  const { user, hasEntitlement } = useAuth();
  const { colors } = useTheme();
  const { createPath, isCreating } = useCoachingPaths(user?.id);
  const [goalType, setGoalType] = useState(goalOptions[0]);
  const [weeks, setWeeks] = useState('8');
  const [equipment, setEquipment] = useState('dumbbells');
  const [schedule, setSchedule] = useState('3x/week');
  const [notes, setNotes] = useState('');

  const handleCreate = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to create a coaching path.');
      return;
    }
    if (goalType === '5k' && !hasEntitlement('goal_pack_5k')) {
      const pending = await getPendingPaymentForFeatureKey(user.id, 'goal_pack_5k');
      if (pending) {
        Alert.alert(
          'Awaiting approval',
          'Your 5K pack payment is pending. Please wait for approval.'
        );
      } else {
        Alert.alert('Add-on required', 'Unlock the 5K goal pack to start this path.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Marketplace',
            onPress: () => router.push(routes.marketplace as any),
          },
        ]);
      }
      return;
    }
    const weeksNum = parseInt(weeks, 10);
    if (Number.isNaN(weeksNum) || weeksNum < 4 || weeksNum > 16) {
      Alert.alert('Invalid weeks', 'Choose between 4 and 16 weeks.');
      return;
    }
    const baselineMetrics = { equipment, schedule, notes };
    const { error } = await createPath({
      goalType,
      weeks: weeksNum,
      baselineMetrics,
    });
    if (error) {
      Alert.alert('Error', 'Could not create coaching path.');
      return;
    }
    router.replace(routes.coachingPaths);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Create Coaching Path</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Choose a goal and we’ll seed a 6–12 week adaptive plan.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Goal</Text>
        <View style={styles.chipRow}>
          {goalOptions.map((goal) => (
            <TouchableOpacity
              key={goal}
              style={[styles.chip, goalType === goal && styles.chipActive]}
              onPress={() => setGoalType(goal)}
            >
              <Text style={[styles.chipText, goalType === goal && styles.chipTextActive]}>
                {goal.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Length (weeks)</Text>
        <TextInput
          style={styles.input}
          value={weeks}
          onChangeText={setWeeks}
          keyboardType="numeric"
          placeholder="8"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Schedule</Text>
        <TextInput
          style={styles.input}
          value={schedule}
          onChangeText={setSchedule}
          placeholder="e.g. 3x/week AM"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Equipment</Text>
        <TextInput
          style={styles.input}
          value={equipment}
          onChangeText={setEquipment}
          placeholder="dumbbells, bands"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Baseline notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any injuries, preferences, time constraints..."
          placeholderTextColor="#666"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.submit, { backgroundColor: colors.primary }]}
          onPress={handleCreate}
          disabled={isCreating}
        >
          <Text style={styles.submitText}>{isCreating ? 'Creating...' : 'Create Path'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    gap: 10,
  },
  label: {
    color: '#ccc',
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  chipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  chipText: {
    color: '#ccc',
    fontFamily: 'Inter-Medium',
  },
  chipTextActive: {
    color: '#000',
    fontFamily: 'Inter-Bold',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    fontFamily: 'Inter-Medium',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submit: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {
    color: '#000',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
});
