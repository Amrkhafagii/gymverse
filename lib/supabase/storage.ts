import * as SecureStore from 'expo-secure-store';

const AUTH_STORAGE_KEY = 'sb-auth';

export const secureStoreAdapter = {
  getItem: async (key: string) => {
    const value = await SecureStore.getItemAsync(`${AUTH_STORAGE_KEY}-${key}`);
    return value ?? null;
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(`${AUTH_STORAGE_KEY}-${key}`, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(`${AUTH_STORAGE_KEY}-${key}`);
  },
};
