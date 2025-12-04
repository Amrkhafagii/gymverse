import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/theme/ThemeProvider';
import { useCoachingPaths } from '@/hooks/useCoachingPaths';
import { usePathRecalc } from '@/hooks/usePathRecalc';
import { getCoachingSessions, CoachingSession, getCoachingAdherence } from '@/lib/supabase';
import { routes } from '@/utils/routes';
import { router } from 'expo-router';

export default function CoachingPathsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { activePath, loading, refresh, pausePath, resumePath } = useCoachingPaths(user?.id);
  const { recalc, loading: recalcLoading } = usePathRecalc(user?.id);
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => a.session_index - b.session_index);
  }, [sessions]);

  const upcomingSession = sortedSessions[0];

  const [adherence, setAdherence] = useState<{ percent: number; summary: string }>({
    percent: 0,
    summary: 'No sessions planned yet.',
  });

  const loadSessions = async () => {
    if (!activePath) return;
    const data = await getCoachingSessions(activePath.id);
    setSessions(data);
    const adherenceData = await getCoachingAdherence(activePath.id);
    const percent =
      adherenceData.planned > 0
        ? Math.min(100, Math.round((adherenceData.completed / adherenceData.planned) * 100))
        : 0;
    setAdherence({
      percent,
      summary: `${adherenceData.completed}/${adherenceData.planned} sessions completed`,
    });
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePath?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), loadSessions()]);
    setRefreshing(false);
  };

  const handleStartNext = () => {
    if (!upcomingSession?.template_workout_id) {
      Alert.alert('No linked workout', 'This coaching session is missing a workout template.');
      return;
    }
    router.push(
      routes.workoutSession(
        upcomingSession.template_workout_id,
        'Coaching Session',
        upcomingSession.id
      )
    );
  };

  const handlePauseResume = async () => {
    if (!activePath) return;
    if (activePath.status === 'active') {
      await pausePath(activePath.id);
    } else {
      await resumePath(activePath.id);
    }
    await refresh();
  };

  const handleRecalc = async () => {
    if (!activePath) return;
    await recalc(activePath.id);
    await loadSessions();
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Sign in to view coaching paths.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing || loading} onRefresh={handleRefresh} />
      }
    >
      <LinearGradient colors={[colors.surface, colors.surfaceAlt]} style={styles.header}>
        <Text style={styles.title}>Coaching</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Track your adaptive plan and jump into the next session.
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push(routes.createCoachingPath)}
        >
          <Text style={styles.createButtonText}>Create / Adjust Path</Text>
        </TouchableOpacity>

        {activePath ? (
          <View
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Active Path</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{activePath.goal_type}</Text>
            <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
              Week {activePath.current_week} of {activePath.weeks} • {activePath.status}
            </Text>

            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={[styles.metricValue, { color: colors.text }]}>
                  {adherence.percent}%
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                  Adherence (est)
                </Text>
                <Text style={[styles.metricSmall, { color: colors.textMuted }]}>
                  {adherence.summary}
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={[styles.metricValue, { color: colors.text }]}>
                  {sessions.length || '—'}
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                  Sessions planned
                </Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.action} onPress={handlePauseResume}>
                <Text style={[styles.actionText, { color: colors.text }]}>
                  {activePath.status === 'active' ? 'Pause' : 'Resume'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.action}
                onPress={handleRecalc}
                disabled={recalcLoading}
              >
                <Text style={[styles.actionText, { color: colors.text }]}>
                  {recalcLoading ? 'Updating...' : 'Recalc'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>No active path</Text>
            <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
              Create a goal to generate your first plan.
            </Text>
          </View>
        )}

        {upcomingSession ? (
          <View
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.rowBetween}>
              <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Upcoming Session</Text>
              <Text style={[styles.pill, { backgroundColor: colors.primary, color: '#000' }]}>
                Session {upcomingSession.session_index}
              </Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {upcomingSession.notes || 'Next coaching session'}
            </Text>
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: colors.primary }]}
              onPress={handleStartNext}
            >
              <Text style={styles.startButtonText}>Start session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Upcoming Session</Text>
            <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
              No session ready yet. Refresh or create a path.
            </Text>
          </View>
        )}

        {sortedSessions.length > 0 ? (
          <View
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.cardLabel, { color: colors.textMuted }]}>All Sessions</Text>
            {sortedSessions.map((session) => (
              <View key={session.id} style={[styles.sessionRow, { borderColor: colors.border }]}>
                <View>
                  <Text style={[styles.sessionTitle, { color: colors.text }]}>
                    Session {session.session_index}
                  </Text>
                  <Text style={[styles.sessionMeta, { color: colors.textMuted }]}>
                    Planned {session.planned_duration ?? 45} min
                  </Text>
                </View>
                {session.id === upcomingSession?.id ? (
                  <Text style={[styles.pill, { backgroundColor: colors.info, color: '#000' }]}>
                    Next up
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginTop: 6,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  createButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginTop: 6,
  },
  cardMeta: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  metric: {
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  metricLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  metricSmall: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  action: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pill: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  startButton: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sessionTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  sessionMeta: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginTop: 40,
  },
});
