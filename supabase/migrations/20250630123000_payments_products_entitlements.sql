-- Payments/Products/Entitlements schema for manual receipts flow

-- Products (coach-created or platform-owned when coach_id is null)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('template','path_pack','addon')),
  title text not null,
  description text,
  price_cents integer not null check (price_cents > 0),
  currency text not null default 'usd',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure feature_key exists for existing deployments
alter table public.products add column if not exists feature_key text;

-- Payments submitted by users with receipt uploads
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  coach_id uuid references public.profiles(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  amount_client_paid_cents integer not null check (amount_client_paid_cents > 0),
  platform_fee_cents integer not null default 0,
  coach_net_cents integer not null default 0,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  receipt_url text,
  notes text,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Entitlements granting access to paid items
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  source_payment_id uuid references public.payments(id) on delete set null,
  granted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_products_coach on public.products(coach_id);
create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_payments_coach on public.payments(coach_id);
create index if not exists idx_entitlements_user on public.entitlements(user_id);
create unique index if not exists idx_products_feature_key on public.products(feature_key);
create unique index if not exists idx_payments_pending_unique
  on public.payments(user_id, product_id)
  where status = 'pending';

-- Helper to validate entitlement by feature_key or product_id
create or replace function public.has_entitlement(p_user uuid, p_feature_key text default null, p_product_id uuid default null)
returns boolean
language sql security definer set search_path = public as $$
  select exists (
    select 1
    from public.entitlements e
    join public.products p on p.id = e.product_id
    where e.user_id = p_user
      and (
        (p_feature_key is not null and p.feature_key = p_feature_key)
        or (p_product_id is not null and e.product_id = p_product_id)
      )
  );
$$;

-- Enable RLS
alter table public.products enable row level security;
alter table public.payments enable row level security;
alter table public.entitlements enable row level security;

-- Helper for admin check: assumes JWT has role claim = 'admin'
create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public as $$
  select coalesce(current_setting('request.jwt.claims', true)::json->>'role', '') = 'admin';
$$;

-- Products policies: public can read active; coach/admin manage own/all
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'Products public read active'
  ) then
    create policy "Products public read active" on public.products
      for select using (is_active = true or is_admin());
  end if;
end$$;

-- Seed platform add-ons (platform-owned when coach_id is null)
insert into public.products (id, coach_id, type, feature_key, title, description, price_cents, currency, is_active)
values
  ('00000000-0000-0000-0000-000000000a11', null, 'addon', 'readiness_check', 'Readiness Check Pack', 'Automated readiness + form review add-on.', 900, 'usd', true),
  ('00000000-0000-0000-0000-000000000a12', null, 'addon', 'ai_plan', 'AI Plan Generation', 'Generate AI coaching plans.', 1200, 'usd', true),
  ('00000000-0000-0000-0000-000000000a13', null, 'addon', 'goal_pack_5k', '5K Goal Pack', 'Targeted 5K plan add-on.', 800, 'usd', true)
on conflict (feature_key) do update
  set title = excluded.title,
      description = excluded.description,
      price_cents = excluded.price_cents,
      is_active = excluded.is_active;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'Products coach manage own'
  ) then
    create policy "Products coach manage own" on public.products
      for all using (coach_id = auth.uid() or is_admin())
      with check (coach_id = auth.uid() or is_admin());
  end if;
end$$;

-- Payments policies
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'payments' and policyname = 'Payments user insert own'
  ) then
    create policy "Payments user insert own" on public.payments
      for insert with check (user_id = auth.uid());
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'payments' and policyname = 'Payments user read own'
  ) then
    create policy "Payments user read own" on public.payments
      for select using (user_id = auth.uid());
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'payments' and policyname = 'Payments coach read theirs'
  ) then
    create policy "Payments coach read theirs" on public.payments
      for select using (coach_id = auth.uid());
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'payments' and policyname = 'Payments admin all'
  ) then
    create policy "Payments admin all" on public.payments
      for all using (is_admin()) with check (is_admin());
  end if;
end$$;

-- Entitlements policies
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'entitlements' and policyname = 'Entitlements owner read'
  ) then
    create policy "Entitlements owner read" on public.entitlements
      for select using (user_id = auth.uid() or is_admin());
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'entitlements' and policyname = 'Entitlements admin insert'
  ) then
    create policy "Entitlements admin insert" on public.entitlements
      for insert with check (is_admin());
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'entitlements' and policyname = 'Entitlements admin manage'
  ) then
    create policy "Entitlements admin manage" on public.entitlements
      for all using (is_admin());
  end if;
end$$;

-- Note: create a private storage bucket for receipts separately; allow user upload and admin/coach read.

-- Storage bucket + policies for receipts
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Receipts user upload'
  ) then
    create policy "Receipts user upload" on storage.objects
      for insert with check (
        bucket_id = 'receipts'
        and (owner = auth.uid() or owner is null)
      );
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Receipts owner read'
  ) then
    create policy "Receipts owner read" on storage.objects
      for select using (
        bucket_id = 'receipts'
        and (owner = auth.uid())
      );
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Receipts coach read'
  ) then
    create policy "Receipts coach read" on storage.objects
      for select using (
        bucket_id = 'receipts'
        and (
          (owner = auth.uid())
          or public.is_admin()
          or (
            cardinality(path_tokens) > 1
            and path_tokens[2] = ('coach-' || auth.uid())
          )
        )
      );
  end if;
end$$;
