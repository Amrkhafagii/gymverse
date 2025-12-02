import { useEffect } from 'react';
import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

const getRelease = () => {
  const { expoConfig } = Constants;
  if (!expoConfig?.slug || !expoConfig?.version) return undefined;
  const build = Constants.nativeBuildVersion ?? expoConfig.extra?.eas?.buildNumber;
  return `${expoConfig.slug}@${expoConfig.version}${build ? `+${build}` : ''}`;
};

const getEnvironment = () => {
  const env = Constants.expoConfig?.extra?.environment;
  if (typeof env === 'string' && env.length > 0) return env;
  return __DEV__ ? 'development' : 'production';
};

let initialized = false;

const initSentryOnce = () => {
  if (initialized) return;

  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not set (EXPO_PUBLIC_SENTRY_DSN); skipping init.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    release: getRelease(),
    dist: Constants.nativeBuildVersion ?? Constants.expoConfig?.extra?.eas?.buildNumber,
    environment: getEnvironment(),
    tracesSampleRate: 0.2,
    enableInExpoDevelopment: true,
    enableAutoPerformanceTracing: true,
    enableNativeFramesTracking: true,
    integrations: [
      Sentry.reactNativeTracingIntegration({
        enableNativeFramesTracking: true,
      }),
    ],
  });

  initialized = true;
};

export const useInitSentry = () => {
  useEffect(() => {
    initSentryOnce();
  }, []);
};

export const withSentry = Sentry.wrap;
