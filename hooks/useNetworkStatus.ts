import { useEffect, useState } from 'react';
import * as Network from 'expo-network';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let subscription: Network.NetworkStateSubscription | undefined;

    const fetchStatus = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        setIsOnline(Boolean(state?.isConnected));
      } catch (error) {
        console.warn('Failed to fetch network status', error);
      }
    };

    fetchStatus();

    const listen = async () => {
      subscription = Network.addNetworkStateChangeListener((state) => {
        setIsOnline(Boolean(state.isConnected));
      });
    };

    listen();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return { isOnline };
}
