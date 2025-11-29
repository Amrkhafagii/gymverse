import { ReactNode, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { QueryClientProvider, focusManager } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/queryClient';

type Props = {
  children: ReactNode;
};

const handleAppStateChange = (status: AppStateStatus) => {
  focusManager.setFocused(status === 'active');
};

export function QueryProvider({ children }: Props) {
  const [queryClient] = useState(createQueryClient);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
