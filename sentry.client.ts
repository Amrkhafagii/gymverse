import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const initSentry = () => {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not set (EXPO_PUBLIC_SENTRY_DSN); skipping init.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
    enableAutoPerformanceTracing: true,
    enableNativeFramesTracking: true,
    integrations: [
      Sentry.reactNativeTracingIntegration({
        enableNativeFramesTracking: true,
      }),
    ],
  });
};

export const withSentry = Sentry.wrap;
