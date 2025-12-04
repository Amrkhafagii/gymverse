import { supabase } from './client';
import { handleSupabaseError } from './errors';

export type Product = {
  id: string;
  coach_id: string | null;
  type: 'template' | 'path_pack' | 'addon';
  feature_key?: string | null;
  title: string;
  description: string | null;
  price_cents: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  coach?: {
    full_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
};

export type PaymentInsert = {
  user_id: string;
  coach_id: string | null;
  product_id: string | null;
  amount_client_paid_cents: number;
  platform_fee_cents: number;
  coach_net_cents: number;
  receipt_url?: string | null;
  notes?: string | null;
};

export type Payment = {
  id: string;
  user_id: string;
  coach_id: string | null;
  product_id: string | null;
  amount_client_paid_cents: number;
  platform_fee_cents: number;
  coach_net_cents: number;
  status: 'pending' | 'approved' | 'rejected';
  receipt_url?: string | null;
  notes?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  created_at: string;
  updated_at: string;
  products?: Product | null;
  user?: { full_name?: string | null; username?: string | null } | null;
};

export type Entitlement = {
  id: string;
  user_id: string;
  product_id: string;
  source_payment_id: string | null;
  granted_at: string;
  created_at: string;
  products?: Product | null;
};

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products' as any)
    .select(
      `
      *,
      coach:profiles(full_name, username, avatar_url)
    `
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError(error, 'get_products');
    return [];
  }

  return (data as unknown as Product[]) ?? [];
};

export const createPendingPayment = async (payload: PaymentInsert) => {
  const { data, error } = await supabase
    .from('payments' as any)
    .insert(payload as any)
    .select()
    .single();
  return {
    data: (data as unknown as Payment) || null,
    error: handleSupabaseError(error, 'create_pending_payment'),
  };
};

export const getUserPayments = async (userId: string): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments' as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError(error, 'get_user_payments');
    return [];
  }
  return (data as unknown as Payment[]) ?? [];
};

export const approvePayment = async (paymentId: string, approverId: string) => {
  const { data, error } = await supabase
    .from('payments' as any)
    .update({ status: 'approved', approved_by: approverId, approved_at: new Date().toISOString() })
    .eq('id', paymentId)
    .select()
    .single();

  if (error) {
    return { data: null, error: handleSupabaseError(error, 'approve_payment') };
  }

  const payment = (data as unknown as Payment | null) || null;

  if (payment?.product_id && payment.user_id) {
    await supabase.from('entitlements' as any).insert({
      user_id: payment.user_id,
      product_id: payment.product_id,
      source_payment_id: paymentId,
    });
  }

  return { data: payment, error: null };
};

export const rejectPayment = async (paymentId: string, reason?: string | null) => {
  const { error } = await supabase
    .from('payments' as any)
    .update({ status: 'rejected', notes: reason || null })
    .eq('id', paymentId);
  return { error: handleSupabaseError(error, 'reject_payment') };
};

export const getCoachPayments = async (coachId: string): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments' as any)
    .select(
      `
      *,
      products:products(*),
      user:profiles(full_name, username)
    `
    )
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError(error, 'get_coach_payments');
    return [];
  }
  return (data as unknown as Payment[]) ?? [];
};

export const getAdminPayments = async (): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments' as any)
    .select(
      `
      *,
      products:products(*),
      user:profiles(full_name, username)
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError(error, 'get_admin_payments');
    return [];
  }
  return (data as unknown as Payment[]) ?? [];
};

export const uploadReceipt = async (uri: string, userId: string, coachId?: string | null) => {
  const extension = uri.split('.').pop() || 'jpg';
  const randomId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `user-${userId}/coach-${coachId || 'platform'}/${randomId}.${extension}`;
  const response = await fetch(uri);
  const blob = await response.blob();
  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(path, blob, { upsert: true, contentType: blob.type || 'application/octet-stream' });

  return { path: data?.path || path, error: handleSupabaseError(error, 'upload_receipt') };
};

export const getReceiptSignedUrl = async (path?: string | null) => {
  if (!path) return null;
  const { data, error } = await supabase.storage.from('receipts').createSignedUrl(path, 60 * 60);
  if (error) {
    handleSupabaseError(error, 'get_receipt_signed_url');
    return null;
  }
  return data?.signedUrl || null;
};

export const getUserEntitlements = async (userId: string): Promise<Entitlement[]> => {
  const { data, error } = await supabase
    .from('entitlements' as any)
    .select(
      `
      *,
      products:products(*)
    `
    )
    .eq('user_id', userId);

  if (error) {
    handleSupabaseError(error, 'get_user_entitlements');
    return [];
  }
  return (data as unknown as Entitlement[]) ?? [];
};

export const getPendingPaymentForFeatureKey = async (userId: string, featureKey: string) => {
  const { data: product, error: productError } = await supabase
    .from('products' as any)
    .select('id')
    .eq('feature_key', featureKey)
    .maybeSingle();
  if (productError) {
    handleSupabaseError(productError, 'get_pending_payment_for_feature_key_product');
    return null;
  }
  const productId = (product as any)?.id as string | undefined;
  if (!productId) return null;

  const { data, error } = await supabase
    .from('payments' as any)
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .maybeSingle();

  if (error) {
    handleSupabaseError(error, 'get_pending_payment_for_feature_key');
    return null;
  }
  return (data as unknown as Payment) || null;
};
