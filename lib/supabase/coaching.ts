import { Database, Json } from '@/types/supabase';
import { supabase } from './client';
import { handleSupabaseError } from './errors';

export type CoachingPath = Database['public']['Tables']['coaching_paths']['Row'];
export type CoachingBlock = Database['public']['Tables']['coaching_blocks']['Row'];
export type CoachingSession = Database['public']['Tables']['coaching_sessions']['Row'];
export type CoachingEvent = Database['public']['Tables']['coaching_events']['Row'];
export type CoachingPathStatus = 'active' | 'paused' | 'completed';

export type CoachNotes = {
  cue: string;
  goal: string;
  last_event: Record<string, unknown> | null;
};

export type CreateCoachingPathInput = {
  goalType: string;
  weeks: number;
  baselineMetrics?: Record<string, unknown>;
};

export const getCoachingPaths = async (): Promise<CoachingPath[]> => {
  const { data, error } = await supabase
    .from('coaching_paths')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError(error, 'get_coaching_paths');
    return [];
  }

  return data ?? [];
};

export const updateCoachingPathStatus = async (pathId: string, status: CoachingPathStatus) => {
  const { data, error } = await supabase
    .from('coaching_paths')
    .update({ status })
    .eq('id', pathId)
    .select()
    .single();

  return { data, error: handleSupabaseError(error, 'update_coaching_path_status') };
};

export const createCoachingPath = async ({
  goalType,
  weeks,
  baselineMetrics,
}: CreateCoachingPathInput) => {
  const { data, error } = await supabase.rpc('create_coaching_path', {
    goal_type: goalType,
    weeks,
    baseline_metrics: (baselineMetrics ?? {}) as Json,
  });

  return { data, error: handleSupabaseError(error, 'create_coaching_path') };
};

export const recalculateCoachingPath = async (pathId: string) => {
  const { error } = await supabase.rpc('recalculate_path', { p_path_id: pathId });
  return { error: handleSupabaseError(error, 'recalculate_path') };
};

type CoachingPayload = Database['public']['Tables']['coaching_events']['Insert']['payload'];

export const logCoachingEvent = async (
  pathId: string,
  type: CoachingEvent['type'],
  payload?: CoachingPayload
) => {
  const { error } = await supabase
    .from('coaching_events')
    .insert({ path_id: pathId, type, payload: payload ?? null });
  return { error: handleSupabaseError(error, 'log_coaching_event') };
};

export const getCoachNotesForSession = async (
  sessionId: string
): Promise<{ notes: CoachNotes | null; pathId: string | null }> => {
  const { data: session, error: sessionError } = await supabase
    .from('coaching_sessions')
    .select('id, block_id')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    handleSupabaseError(sessionError, 'get_coach_notes_session_lookup');
    return { notes: null, pathId: null };
  }

  const { data: block, error: blockError } = await supabase
    .from('coaching_blocks')
    .select('id, path_id')
    .eq('id', session.block_id)
    .single();

  if (blockError || !block) {
    handleSupabaseError(blockError, 'get_coach_notes_block_lookup');
    return { notes: null, pathId: null };
  }

  const { data, error } = await supabase.rpc('get_coach_notes', {
    p_path_id: block.path_id,
    p_session_id: sessionId,
  });

  if (error) {
    handleSupabaseError(error, 'get_coach_notes');
    return { notes: null, pathId: block.path_id };
  }

  return { notes: (data as CoachNotes | null) ?? null, pathId: block.path_id };
};

export const getCoachingSessions = async (
  pathId: string
): Promise<(CoachingSession & { block?: CoachingBlock | null })[]> => {
  const { data: blocks, error: blocksError } = await supabase
    .from('coaching_blocks')
    .select('*')
    .eq('path_id', pathId);

  if (blocksError) {
    handleSupabaseError(blocksError, 'get_coaching_sessions_blocks');
    return [];
  }

  const blockIds = (blocks ?? []).map((b) => b.id).filter(Boolean);
  if (blockIds.length === 0) return [];

  const { data, error } = await supabase
    .from('coaching_sessions')
    .select(
      `
        *,
        block:coaching_blocks (*)
      `
    )
    .in('block_id', blockIds);

  if (error) {
    handleSupabaseError(error, 'get_coaching_sessions');
    return [];
  }

  return (data as (CoachingSession & { block?: CoachingBlock | null })[]) ?? [];
};

export const getLatestCoachingEvent = async (pathId: string): Promise<CoachingEvent | null> => {
  const { data, error } = await supabase
    .from('coaching_events')
    .select('*')
    .eq('path_id', pathId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    handleSupabaseError(error, 'get_latest_coaching_event');
    return null;
  }

  return data ?? null;
};

export const getCoachingAdherence = async (
  pathId: string
): Promise<{ planned: number; completed: number }> => {
  const sessions = await getCoachingSessions(pathId);
  const planned = sessions.length;
  const sessionIds = sessions.map((s) => s.id).filter(Boolean);

  if (sessionIds.length === 0) {
    return { planned: 0, completed: 0 };
  }

  const { data: completedSessions, error } = await supabase
    .from('workout_sessions')
    .select('id')
    .in('coaching_session_id', sessionIds)
    .not('completed_at', 'is', null);

  if (error) {
    handleSupabaseError(error, 'get_coaching_adherence');
    return { planned, completed: 0 };
  }

  return { planned, completed: completedSessions?.length ?? 0 };
};
