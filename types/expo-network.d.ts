declare module 'expo-network' {
  export type NetworkState = {
    type: string;
    isConnected: boolean | null;
    isInternetReachable?: boolean | null;
  };

  export type NetworkStateSubscription = {
    remove: () => void;
  };

  export function getNetworkStateAsync(): Promise<NetworkState>;

  export function addNetworkStateListener(
    listener: (state: NetworkState) => void
  ): NetworkStateSubscription;

  // Older signature used in code; map to addNetworkStateListener
  export function addNetworkStateChangeListener(
    listener: (state: NetworkState) => void
  ): NetworkStateSubscription;
}
