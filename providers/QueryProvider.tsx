import { ReactNode, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Network from 'expo-network';
import { QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createQueryClient } from '@/lib/queryClient';

type Props = {
  children: ReactNode;
};

const handleAppStateChange = (status: AppStateStatus) => {
  focusManager.setFocused(status === 'active');
};

export function QueryProvider({ children }: Props) {
  const [{ queryClient, persister }] = useState(() => createQueryClient());
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncOnlineStatus = async () => {
      try {
        const status = await Network.getNetworkStateAsync();
        onlineManager.setOnline(Boolean(status.isConnected));
      } catch {
        onlineManager.setOnline(true);
      }

      const subscription = Network.addNetworkStateListener((state) => {
        onlineManager.setOnline(Boolean(state.isConnected));
      });

      return () => subscription.remove();
    };

    const init = async () => {
      const unsubscribeNetwork = await syncOnlineStatus();

      try {
        await persistQueryClient({
          queryClient,
          persister,
          maxAge: 24 * 60 * 60 * 1000, // 24h cache
        });
      } finally {
        if (isMounted) setIsRestoring(false);
      }

      return unsubscribeNetwork;
    };

    let cleanup: (() => void) | undefined;
    init().then((unsub) => {
      cleanup = unsub;
    });

    return () => {
      isMounted = false;
      cleanup?.();
    };
  }, [persister, queryClient]);

  if (isRestoring) {
    return null;
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
