import { useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, UploadCloud } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Product, uploadReceipt } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ToastProvider';
import { getDocumentAsync } from '@/utils/documentPicker';

type PaymentModalProps = {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSubmit: (receiptPath: string | null, amountCents: number, notes?: string) => Promise<void>;
  instapayHandle?: string;
  disabled?: boolean;
};

export default function PaymentModal({
  visible,
  product,
  onClose,
  onSubmit,
  instapayHandle,
  disabled = false,
}: PaymentModalProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const defaultAmount = useMemo(
    () => (product ? (product.price_cents / 100).toFixed(2) : '0.00'),
    [product]
  );
  const [amount, setAmount] = useState(defaultAmount);
  const [receiptPath, setReceiptPath] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setAmount(defaultAmount);
    setReceiptPath(null);
    setReceiptName(null);
    setNotes('');
  }, [defaultAmount, product?.id]);

  const handlePickReceipt = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to upload a receipt.');
      return;
    }
    const result = await getDocumentAsync({
      copyToCacheDirectory: true,
      type: ['image/*', 'application/pdf'],
    });
    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setUploading(true);
    try {
      const { path, error } = await uploadReceipt(asset.uri, user.id, product?.coach_id);
      if (error) throw error;
      setReceiptPath(path);
      setReceiptName(asset.name || path.split('/').pop() || 'receipt');
      showToast('Receipt uploaded', 'success');
    } catch (err) {
      console.error('Upload error', err);
      Alert.alert('Upload failed', 'Could not upload receipt. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const amountNumber = parseFloat(amount);
    if (!product || !user) return;
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid payment amount.');
      return;
    }
    if (!receiptPath) {
      Alert.alert('Receipt required', 'Please upload a receipt before submitting.');
      return;
    }
    if (disabled) {
      Alert.alert('Pending', 'You already have a pending submission for this product.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(receiptPath, Math.round(amountNumber * 100), notes);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <LinearGradient colors={[colors.surface, colors.surfaceAlt]} style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.close}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Pay & Upload Receipt</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Pay via Instapay, upload your receipt, and we will review.
        </Text>
        {instapayHandle ? (
          <Text style={[styles.subtitle, { color: '#fff', marginTop: 8 }]}>
            Instapay handle: <Text style={{ fontWeight: '700' }}>{instapayHandle}</Text>
          </Text>
        ) : null}
      </LinearGradient>

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Product</Text>
        <Text style={[styles.value, { color: colors.text }]}>{product?.title}</Text>
        <Text style={[styles.value, { color: colors.textMuted }]}>
          {product?.type?.replace('_', ' ')}
        </Text>

        <Text style={[styles.label, { color: colors.textMuted }]}>Amount</Text>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={[styles.label, { color: colors.textMuted }]}>Receipt</Text>
        <TouchableOpacity
          style={[styles.inputRow, { borderColor: colors.border }]}
          onPress={handlePickReceipt}
          disabled={uploading}
        >
          <UploadCloud size={18} color={colors.textMuted} />
          <View style={styles.inputFlex}>
            <Text style={{ color: receiptPath ? colors.text : colors.textMuted }}>
              {receiptName || 'Tap to upload receipt (image or PDF)'}
            </Text>
            {uploading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          </View>
        </TouchableOpacity>

        <Text style={[styles.label, { color: colors.textMuted }]}>Notes (optional)</Text>
        <TextInput
          style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add details for admin/coach"
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity
          style={[styles.submit, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={submitting || uploading || disabled}
        >
          <Text style={styles.submitText}>
            {disabled ? 'Pending approval' : submitting ? 'Submitting...' : 'Submit Payment'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  close: { padding: 4, alignSelf: 'flex-start' },
  title: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 12,
    fontFamily: 'Inter-Medium',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  inputFlex: {
    flex: 1,
    marginLeft: 8,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontFamily: 'Inter-Medium',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submit: {
    marginTop: 16,
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
