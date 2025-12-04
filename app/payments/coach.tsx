import { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/theme/ThemeProvider';
import { getCoachPayments, getReceiptSignedUrl, type Payment } from '@/lib/supabase';

export default function CoachPaymentsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getCoachPayments(user.id);
        setPayments(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const openReceipt = async (path?: string | null) => {
    if (!path) return;
    const signed = await getReceiptSignedUrl(path);
    if (signed) {
      Linking.openURL(signed);
    }
  };

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Sign in to view payments.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Text style={[styles.title, { color: colors.text }]}>Your sales</Text>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      {!loading && payments.length === 0 ? (
        <Text style={{ color: colors.textMuted }}>No payments yet.</Text>
      ) : (
        payments.map((p) => (
          <View key={p.id} style={[styles.card, { borderColor: colors.border }]}>
            <Text style={[styles.amount, { color: colors.primary }]}>
              ${(p.amount_client_paid_cents / 100).toFixed(2)} • {p.status}
            </Text>
            <Text style={{ color: colors.textMuted }}>{p.products?.title || 'Product'}</Text>
            {p.user ? (
              <Text style={{ color: colors.textMuted }}>
                Buyer: {p.user.full_name || p.user.username || p.user_id}
              </Text>
            ) : null}
            <Text style={{ color: colors.textMuted }}>
              Net to you: ${(p.coach_net_cents / 100).toFixed(2)}
            </Text>
            {p.receipt_url ? (
              <TouchableOpacity onPress={() => openReceipt(p.receipt_url)}>
                <Text style={{ color: colors.info }}>View receipt</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontFamily: 'Inter-Bold', marginBottom: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  amount: { fontSize: 16, fontFamily: 'Inter-Bold' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
