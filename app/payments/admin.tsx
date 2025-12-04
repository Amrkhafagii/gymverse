import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/theme/ThemeProvider';
import {
  approvePayment,
  getAdminPayments,
  rejectPayment,
  getReceiptSignedUrl,
  type Payment,
} from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

export default function AdminPaymentsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>({});
  const [refreshingEntitlements, setRefreshingEntitlements] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAdminPayments();
        setPayments(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApprove = async (id: string) => {
    if (!user) return;
    const { error } = await approvePayment(id, user.id);
    if (error) {
      Alert.alert('Error', 'Failed to approve');
      return;
    }
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p)));
  };

  const handleReject = async (id: string) => {
    const { error } = await rejectPayment(id, rejectionNotes[id] || null);
    if (error) {
      Alert.alert('Error', 'Failed to reject');
      return;
    }
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'rejected' } : p)));
  };

  const openReceipt = async (path?: string | null) => {
    if (!path) return;
    const signed = await getReceiptSignedUrl(path);
    if (signed) {
      Linking.openURL(signed);
    } else {
      Alert.alert('Unavailable', 'Could not load receipt.');
    }
  };

  const refreshEntitlements = async () => {
    if (!user) return;
    setRefreshingEntitlements(true);
    try {
      const { error } = await supabase.rpc('refresh_entitlements_for_user', {
        p_user_id: user.id,
      });
      if (error) {
        console.error('refresh_entitlements_for_user', error);
        Alert.alert('Error', 'Failed to refresh entitlements');
      } else {
        Alert.alert('Entitlements refreshed', 'Latest access has been pulled for this user.');
      }
    } finally {
      setRefreshingEntitlements(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Text style={[styles.title, { color: colors.text }]}>Admin Payments</Text>
      <Text style={{ color: colors.textMuted, marginBottom: 8 }}>
        Admin-only: approvals grant entitlements. Use an admin JWT (app_metadata.role = 'admin').
      </Text>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={refreshEntitlements}
        disabled={refreshingEntitlements}
      >
        <Text style={{ color: colors.text }}>
          {refreshingEntitlements ? 'Refreshing…' : 'Refresh entitlements (admin)'}
        </Text>
      </TouchableOpacity>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      {!loading && payments.length === 0 ? (
        <Text style={{ color: colors.textMuted }}>No payments yet.</Text>
      ) : null}
      {payments
        .slice()
        .sort((a, b) => (a.status === 'pending' && b.status !== 'pending' ? -1 : 1))
        .map((p) => (
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
            {p.receipt_url ? (
              <TouchableOpacity onPress={() => openReceipt(p.receipt_url)}>
                <Text style={{ color: colors.info }}>View receipt</Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ color: colors.textMuted }}>No receipt uploaded</Text>
            )}
            {p.status === 'pending' && (
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Reason (optional)"
                  placeholderTextColor={colors.textMuted}
                  value={rejectionNotes[p.id] || ''}
                  onChangeText={(text) =>
                    setRejectionNotes((prev) => ({
                      ...prev,
                      [p.id]: text,
                    }))
                  }
                />
                <TouchableOpacity style={styles.btn} onPress={() => handleApprove(p.id)}>
                  <Text style={styles.btnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={() => handleReject(p.id)}>
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontFamily: 'Inter-Bold', marginBottom: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  amount: { fontSize: 16, fontFamily: 'Inter-Bold' },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: 'Inter-Medium',
    minWidth: 120,
  },
  btn: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#1a1a1a', borderRadius: 8 },
  btnText: { color: '#fff', fontFamily: 'Inter-SemiBold' },
});
