-- Structured path tagging and coaching linkage updates

-- 1) Structured path tagging for social posts
alter table public.social_posts
  add column if not exists coaching_path_id uuid references public.coaching_paths(id);

-- Policies to ensure the path belongs to the author
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'social_posts'
      and policyname = 'Post path must belong to author'
  ) then
    create policy "Post path must belong to author" on public.social_posts
      for insert
      with check (
        coaching_path_id is null
        or exists (
          select 1 from public.coaching_paths p
          where p.id = coaching_path_id
            and p.user_id = auth.uid()
        )
      );
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'social_posts'
      and policyname = 'Update own post path'
  ) then
    create policy "Update own post path" on public.social_posts
      for update using (user_id = auth.uid())
      with check (
        coaching_path_id is null
        or exists (
          select 1 from public.coaching_paths p
          where p.id = coaching_path_id
            and p.user_id = auth.uid()
        )
      );
  end if;
end$$;

-- 2) Link workout_sessions to coaching_sessions for adherence
alter table public.workout_sessions
  add column if not exists coaching_session_id uuid references public.coaching_sessions(id);

create index if not exists idx_workout_sessions_coaching_session
  on public.workout_sessions(coaching_session_id);

-- 3) Streak-gap deload logic in recalculate_path
create or replace function public.recalculate_path(p_path_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_streak int := 0;
  v_recent_volume int := 0;
  v_gap_days int := 0;
  v_last_workout date;
begin
  select user_id into v_user from public.coaching_paths where id = p_path_id;
  if v_user is null then return; end if;

  select current_streak, last_workout_date
  into v_streak, v_last_workout
  from public.workout_streaks
  where user_id = v_user;

  if v_last_workout is not null then
    v_gap_days := (current_date - v_last_workout);
  end if;

  select coalesce(sum(duration_minutes),0)
  into v_recent_volume
  from public.workout_sessions
  where user_id = v_user
    and started_at > now() - interval '14 days';

  -- Gap-based deload first
  if v_gap_days >= 3 then
    update public.coaching_sessions cs
      set planned_duration = greatest(20, coalesce(planned_duration,45) - 15),
          notes = coalesce(notes,'') || ' | Deload: long gap'
    where cs.id in (
      select id from public.coaching_sessions s
      join public.coaching_blocks b on b.id = s.block_id
      where b.path_id = p_path_id
      order by b.week_index, s.session_index
      limit 2
    );

    insert into public.coaching_events(path_id, type, payload)
    values (
      p_path_id,
      'deload',
      jsonb_build_object('gap_days', v_gap_days, 'reason', 'streak_gap')
    );
    return;
  end if;

  -- Progression/deload fallback
  if v_streak < 3 or v_recent_volume < 120 then
    update public.coaching_sessions cs
      set planned_duration = greatest(25, coalesce(planned_duration,45) - 10),
          notes = coalesce(notes,'') || ' | Deload: reduce volume'
    where cs.id in (
      select id from public.coaching_sessions s
      join public.coaching_blocks b on b.id = s.block_id
      where b.path_id = p_path_id
      order by b.week_index, s.session_index
      limit 2
    );

    insert into public.coaching_events(path_id, type, payload)
    values (
      p_path_id,
      'deload',
      jsonb_build_object('streak', v_streak, 'recent_volume', v_recent_volume)
    );
  else
    update public.coaching_sessions cs
      set planned_duration = coalesce(planned_duration,45) + 5,
          notes = coalesce(notes,'') || ' | Progress: add small intensity bump'
    where cs.id in (
      select id from public.coaching_sessions s
      join public.coaching_blocks b on b.id = s.block_id
      where b.path_id = p_path_id
      order by b.week_index, s.session_index
      limit 2
    );

    insert into public.coaching_events(path_id, type, payload)
    values (
      p_path_id,
      'progression',
      jsonb_build_object('streak', v_streak, 'recent_volume', v_recent_volume)
    );
  end if;
end;
$$;
