import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/theme/ThemeProvider';
import { Product } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

type ProductForm = {
  id?: string;
  title: string;
  description: string;
  type: Product['type'];
  price: string;
  is_active: boolean;
  feature_key?: string;
};

const PRODUCT_TYPES: Product['type'][] = ['template', 'path_pack', 'addon'];

export default function CoachProductsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    title: '',
    description: '',
    type: 'template',
    price: '0',
    is_active: true,
    feature_key: '',
  });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products' as any)
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to load products');
      } else {
        setProducts((data as unknown as Product[]) || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      type: 'template',
      price: '0',
      is_active: true,
      id: undefined,
      feature_key: '',
    });
  };

  const handleEdit = (p: Product) => {
    setForm({
      id: p.id,
      title: p.title,
      description: p.description || '',
      type: p.type,
      price: (p.price_cents / 100).toString(),
      is_active: p.is_active,
      feature_key: p.feature_key || '',
    });
  };

  const platformFee = useMemo(() => {
    const cents = Math.max(0, Math.round(parseFloat(form.price || '0') * 100));
    const fee = Math.ceil(cents * 0.1);
    const coachNet = cents - fee;
    return { fee, coachNet };
  }, [form.price]);

  const handleSave = async () => {
    if (!user) return;
    const priceNumber = parseFloat(form.price);
    if (!form.title || Number.isNaN(priceNumber) || priceNumber <= 0) {
      Alert.alert('Invalid', 'Please enter a title and positive price.');
      return;
    }
    // Feature key is required for add-ons/path packs; warn on duplicates
    if ((form.type === 'addon' || form.type === 'path_pack') && !form.feature_key?.trim()) {
      Alert.alert('Feature key required', 'Add-ons and path packs need a unique feature key.');
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      type: form.type,
      price_cents: Math.round(priceNumber * 100),
      is_active: form.is_active,
      coach_id: user.id,
      feature_key: form.feature_key?.trim() || null,
    };

    if (form.id) {
      const { data, error } = await supabase
        .from('products' as any)
        .update(payload as any)
        .eq('id', form.id)
        .select()
        .single();
      if (error) {
        Alert.alert('Error', 'Failed to update product');
      } else if (data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === form.id ? (data as unknown as Product) : p))
        );
        resetForm();
      }
    } else {
      const { data, error } = await supabase
        .from('products' as any)
        .insert(payload as any)
        .select()
        .single();
      if (error) {
        Alert.alert('Error', 'Failed to create product');
      } else if (data) {
        setProducts((prev) => [data as unknown as Product, ...prev]);
        resetForm();
      }
    }
    setSaving(false);
  };

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Sign in to manage products.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Text style={[styles.title, { color: colors.text }]}>My Products</Text>
      <Text style={{ color: colors.textMuted, marginBottom: 12 }}>
        Platform fee is 10%. You keep ${(platformFee.coachNet / 100).toFixed(2)} on a $
        {(parseFloat(form.price || '0') || 0).toFixed(2)} price.
      </Text>

      <View style={[styles.card, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {form.id ? 'Edit product' : 'Create product'}
        </Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Title"
          placeholderTextColor={colors.textMuted}
          value={form.title}
          onChangeText={(text) => setForm((f) => ({ ...f, title: text }))}
        />
        {(form.type === 'addon' || form.type === 'path_pack') && (
          <>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Feature key (e.g., ai_plan, goal_pack_5k)"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              value={form.feature_key}
              onChangeText={(text) => setForm((f) => ({ ...f, feature_key: text }))}
            />
            <Text style={{ color: colors.textMuted, marginBottom: 8, fontSize: 12 }}>
              Feature keys map to entitlements (one per product). Keep them unique; users get access
              by feature_key after payment approval.
            </Text>
          </>
        )}
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Description"
          placeholderTextColor={colors.textMuted}
          value={form.description}
          onChangeText={(text) => setForm((f) => ({ ...f, description: text }))}
          multiline
        />
        <View style={styles.row}>
          {PRODUCT_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeChip,
                form.type === t && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setForm((f) => ({ ...f, type: t }))}
            >
              <Text style={{ color: form.type === t ? '#000' : colors.text }}>
                {t.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Price (USD)"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={form.price}
          onChangeText={(text) => setForm((f) => ({ ...f, price: text }))}
        />
        <View style={styles.switchRow}>
          <Text style={{ color: colors.text }}>Active</Text>
          <Switch
            value={form.is_active}
            onValueChange={(val) => setForm((f) => ({ ...f, is_active: val }))}
          />
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? 'Saving...' : form.id ? 'Update' : 'Create'}
            </Text>
          </TouchableOpacity>
          {form.id ? (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#333' }]}
              onPress={resetForm}
              disabled={saving}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>Your items</Text>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {!loading && products.length === 0 ? (
        <Text style={{ color: colors.textMuted }}>No products yet. Create one above.</Text>
      ) : (
        products.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.card, { borderColor: colors.border }]}
            onPress={() => handleEdit(p)}
          >
            <Text style={[styles.productTitle, { color: colors.text }]}>{p.title}</Text>
            <Text style={{ color: colors.textMuted, marginBottom: 4 }}>
              {p.type.replace('_', ' ')}
            </Text>
            <Text style={{ color: colors.primary }}>${(p.price_cents / 100).toFixed(2)}</Text>
            {p.feature_key ? (
              <Text style={{ color: colors.textMuted }}>Feature key: {p.feature_key}</Text>
            ) : null}
            <Text style={{ color: colors.textMuted }}>
              Status: {p.is_active ? 'Active' : 'Inactive'}
            </Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontFamily: 'Inter-Bold', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter-Bold', marginBottom: 8 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#0f0f0f',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontFamily: 'Inter-Medium',
  },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  typeChip: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: { color: '#000', fontFamily: 'Inter-Bold' },
  productTitle: { fontSize: 16, fontFamily: 'Inter-Bold' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
