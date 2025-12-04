import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';
import {
  getProducts,
  createPendingPayment,
  getUserPayments,
  getUserEntitlements,
  type Product,
  type Payment,
  type Entitlement,
} from '@/lib/supabase';
import { useToast } from '@/components/ToastProvider';
import PaymentModal from '@/components/PaymentModal';

type ProductFilter = 'all' | 'template' | 'path_pack' | 'addon';

export default function MarketplaceScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<ProductFilter>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const instapayHandle = process.env.EXPO_PUBLIC_INSTAPAY_HANDLE || '@instapay_handle';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserPayments([]);
      setEntitlements([]);
      return;
    }
    const loadPayments = async () => {
      const data = await getUserPayments(user.id);
      setUserPayments(data as Payment[]);
    };
    const loadEntitlements = async () => {
      const data = await getUserEntitlements(user.id);
      setEntitlements(data as Entitlement[]);
    };
    loadPayments();
    loadEntitlements();
  }, [user]);

  const filtered = useMemo(() => {
    if (selectedFilter === 'all') return products;
    return products.filter((p) => p.type === selectedFilter);
  }, [products, selectedFilter]);

  const paymentStatusByProduct = useMemo(() => {
    const map: Record<string, Payment> = {};
    userPayments.forEach((p) => {
      if (p.product_id && (!map[p.product_id] || map[p.product_id].created_at < p.created_at)) {
        map[p.product_id] = p;
      }
    });
    return map;
  }, [userPayments]);

  const ownedProducts = useMemo(() => {
    const set = new Set<string>();
    entitlements.forEach((e) => {
      if (e.product_id) set.add(e.product_id);
    });
    return set;
  }, [entitlements]);

  const handleProductPress = (product: Product) => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to purchase.');
      return;
    }
    if (ownedProducts.has(product.id)) {
      Alert.alert('Already unlocked', 'You already own this item.');
      return;
    }
    const existing = paymentStatusByProduct[product.id];
    if (existing?.status === 'pending') {
      Alert.alert('Already submitted', 'You already have a pending payment for this product.');
      return;
    }
    setSelectedProduct(product);
  };

  const handleSubmitPayment = async (receiptUrl: string | null, amountCents: number, notes?: string) => {
    if (!user || !selectedProduct) return;
    try {
      const platformFee = Math.ceil(amountCents * 0.1);
      const coachNet = amountCents - platformFee;
      const { data, error } = await createPendingPayment({
        user_id: user.id,
        coach_id: selectedProduct.coach_id,
        product_id: selectedProduct.id,
        amount_client_paid_cents: amountCents,
        platform_fee_cents: platformFee,
        coach_net_cents: coachNet,
        receipt_url: receiptUrl,
        notes,
      });
      if (error) throw error;
      if (data) {
        setUserPayments((prev) => [data as Payment, ...prev]);
      }
      showToast('Payment submitted. Pending approval.', 'success');
    } catch (err) {
      console.error('Error creating payment', err);
      showToast('Failed to submit payment', 'error');
    } finally {
      setSelectedProduct(null);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.surface, colors.surfaceAlt]} style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Buy premium plans, templates, and add-ons.
        </Text>
      </LinearGradient>

      <View style={styles.filters}>
        {(['all', 'template', 'path_pack', 'addon'] as ProductFilter[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              selectedFilter === filter && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter === 'all' ? 'All' : filter.replace('_', ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.list}>
        {loading ? (
          <Text style={{ color: colors.text }}>Loading products...</Text>
        ) : filtered.length === 0 ? (
          <Text style={{ color: colors.textMuted }}>No products available.</Text>
        ) : (
          filtered.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={[styles.card, { borderColor: colors.border }]}
              onPress={() => handleProductPress(product)}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.productTitle, { color: colors.text }]}>{product.title}</Text>
                  <Text style={[styles.productType, { color: colors.textMuted }]}>
                    {product.type.replace('_', ' ')}
                  </Text>
                </View>
                <Text style={[styles.price, { color: colors.primary }]}>
                  ${(product.price_cents / 100).toFixed(2)}
                </Text>
              </View>
              {ownedProducts.has(product.id) ? (
                <Text style={[styles.statusPill, styles.statusApproved]}>Owned</Text>
              ) : paymentStatusByProduct[product.id] ? (
                <Text
                  style={[
                    styles.statusPill,
                    paymentStatusByProduct[product.id].status === 'pending'
                      ? styles.statusPending
                      : paymentStatusByProduct[product.id].status === 'approved'
                        ? styles.statusApproved
                        : styles.statusRejected,
                  ]}
                >
                  {paymentStatusByProduct[product.id].status === 'pending'
                    ? 'Awaiting approval'
                    : paymentStatusByProduct[product.id].status === 'approved'
                      ? 'Owned'
                      : 'Rejected'}
                </Text>
              ) : null}
              {product.description ? (
                <Text style={[styles.description, { color: colors.textMuted }]}>
                  {product.description}
                </Text>
              ) : null}
              {product.coach ? (
                <View style={styles.coachRow}>
                  <Image
                    source={{ uri: product.coach.avatar_url || undefined }}
                    style={styles.avatar}
                    contentFit="cover"
                  />
                  <View>
                    <Text style={[styles.coachName, { color: colors.text }]}>
                      {product.coach.full_name || product.coach.username || 'Coach'}
                    </Text>
                    <Text style={[styles.coachHandle, { color: colors.textMuted }]}>
                      {product.coach.username ? `@${product.coach.username}` : 'Premium creator'}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text
                  style={[
                    styles.platformBadge,
                    { color: colors.text, backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                  ]}
                >
                  {product.type === 'addon' ? 'Platform add-on' : 'Platform product'}
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </View>

      <PaymentModal
        visible={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSubmit={handleSubmitPayment}
        instapayHandle={instapayHandle}
        disabled={
          selectedProduct
            ? paymentStatusByProduct[selectedProduct.id]?.status === 'pending' ||
              ownedProducts.has(selectedProduct.id)
            : false
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 24 },
  title: { fontSize: 26, fontFamily: 'Inter-Bold', color: '#fff' },
  subtitle: { fontSize: 14, fontFamily: 'Inter-Medium', marginTop: 6 },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterText: {
    color: '#ccc',
    fontFamily: 'Inter-SemiBold',
  },
  filterTextActive: {
    color: '#000',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#111',
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusPending: {
    backgroundColor: '#33230f',
    color: '#f7c17f',
  },
  statusApproved: {
    backgroundColor: '#0f3323',
    color: '#7ff7b1',
  },
  statusRejected: {
    backgroundColor: '#331515',
    color: '#f79d9d',
  },
  productTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  productType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  price: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222',
  },
  coachName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  coachHandle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  platformBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
