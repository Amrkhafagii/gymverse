import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const createQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
      },
    },
  });

  const persister = createAsyncStoragePersister({
    storage: AsyncStorage,
  });

  return { queryClient, persister };
};
