import * as Sentry from '@sentry/react-native';

export const logSupabaseError = (error: unknown, context: string) => {
  Sentry.captureException(error, {
    tags: { service: 'supabase', context },
  });
  console.error(`[supabase:${context}]`, error);
};

export const handleSupabaseError = <T extends { message?: string }>(
  error: T | null,
  context: string
) => {
  if (!error) return null;
  logSupabaseError(error, context);
  return error;
};
