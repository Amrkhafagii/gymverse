import { useState, useEffect, useCallback } from 'react';
import { useSync, useSyncData } from '@/contexts/SyncContext';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SyncHookOptions {
  table: string;
  localStorageKey?: string;
  realTimeSubscription?: boolean;
  syncOnMount?: boolean;
  conflictResolution?: 'server_wins' | 'client_wins' | 'merge';
}

interface SyncHookResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (item: Omit<T, 'id' | 'created_at' | 'updated_at'>) => Promise<T>;
  update: (id: string, updates: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  syncStatus: {
    isOnline: boolean;
    isSyncing: boolean;
    lastSyncTime: Date | null;
  };
}

export function useDataSync<T extends { id: string; created_at?: string; updated_at?: string }>(
  options: SyncHookOptions
): SyncHookResult<T> {
  const { table, localStorageKey, realTimeSubscription = true, syncOnMount = true } = options;
  const { syncStatus } = useSync();
  const { syncInsert, syncUpdate, syncDelete, isOnline } = useSyncData();

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storageKey = localStorageKey || `${table}_data`;

  // Load data from local storage
  const loadLocalData = useCallback(async () => {
    try {
      const localData = await AsyncStorage.getItem(storageKey);
      if (localData) {
        const parsedData = JSON.parse(localData);
        setData(parsedData);
      }
    } catch (err) {
      console.error(`Failed to load local data for ${table}:`, err);
    }
  }, [storageKey, table]);

  // Save data to local storage
  const saveLocalData = useCallback(async (newData: T[]) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(newData));
    } catch (err) {
      console.error(`Failed to save local data for ${table}:`, err);
    }
  }, [storageKey, table]);

  // Fetch data from server
  const fetchServerData = useCallback(async () => {
    if (!isOnline) return;

    try {
      const { data: serverData, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (serverData) {
        setData(serverData);
        await saveLocalData(serverData);
      }
    } catch (err: any) {
      console.error(`Failed to fetch server data for ${table}:`, err);
      setError(err.message);
    }
  }, [table, isOnline, saveLocalData]);

  // Refresh data (try server first, fallback to local)
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isOnline) {
        await fetchServerData();
      } else {
        await loadLocalData();
      }
    } catch (err: any) {
      setError(err.message);
      // Fallback to local data on error
      await loadLocalData();
    } finally {
      setLoading(false);
    }
  }, [isOnline, fetchServerData, loadLocalData]);

  // Create new item
  const create = useCallback(async (item: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> => {
    const newItem = {
      ...item,
      id: `temp_${Date.now()}_${Math.random()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as T;

    // Update local state immediately
    const updatedData = [newItem, ...data];
    setData(updatedData);
    await saveLocalData(updatedData);

    // Queue for sync
    await syncInsert(table, newItem, 'high');

    return newItem;
  }, [data, saveLocalData, syncInsert, table]);

  // Update existing item
  const update = useCallback(async (id: string, updates: Partial<T>): Promise<T> => {
    const updatedItem = {
      ...data.find(item => item.id === id),
      ...updates,
      updated_at: new Date().toISOString(),
    } as T;

    // Update local state immediately
    const updatedData = data.map(item => item.id === id ? updatedItem : item);
    setData(updatedData);
    await saveLocalData(updatedData);

    // Queue for sync
    await syncUpdate(table, updatedItem, 'high');

    return updatedItem;
  }, [data, saveLocalData, syncUpdate, table]);

  // Remove item
  const remove = useCallback(async (id: string): Promise<void> => {
    // Update local state immediately
    const updatedData = data.filter(item => item.id !== id);
    setData(updatedData);
    await saveLocalData(updatedData);

    // Queue for sync
    await syncDelete(table, id, 'high');
  }, [data, saveLocalData, syncDelete, table]);

  // Set up real-time subscription
  useEffect(() => {
    if (!realTimeSubscription || !isOnline) return;

    const subscription = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table }, 
        async (payload) => {
          console.log(`Real-time change in ${table}:`, payload);

          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as T;
            setData(prev => {
              const exists = prev.some(item => item.id === newItem.id);
              if (exists) return prev;
              const updated = [newItem, ...prev];
              saveLocalData(updated);
              return updated;
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as T;
            setData(prev => {
              const updated = prev.map(item => 
                item.id === updatedItem.id ? updatedItem : item
              );
              saveLocalData(updated);
              return updated;
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setData(prev => {
              const updated = prev.filter(item => item.id !== deletedId);
              saveLocalData(updated);
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table, realTimeSubscription, isOnline, saveLocalData]);

  // Initial data load
  useEffect(() => {
    if (syncOnMount) {
      refresh();
    } else {
      loadLocalData().finally(() => setLoading(false));
    }
  }, [syncOnMount, refresh, loadLocalData]);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && !loading) {
      fetchServerData();
    }
  }, [isOnline, loading, fetchServerData]);

  return {
    data,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
    syncStatus: {
      isOnline: syncStatus.isOnline,
      isSyncing: syncStatus.isSyncing,
      lastSyncTime: syncStatus.lastSyncTime,
    },
  };
}

// Specialized hooks for common use cases
export function useWorkoutSessions() {
  return useDataSync<{
    id: string;
    user_id: string;
    workout_plan_id: string;
    started_at: string;
    completed_at?: string;
    is_active: boolean;
    current_exercise_index: number;
    notes?: string;
    created_at: string;
    updated_at: string;
  }>({
    table: 'workout_sessions',
    localStorageKey: 'workout_sessions',
    realTimeSubscription: true,
  });
}

export function useExerciseSets() {
  return useDataSync<{
    id: string;
    workout_session_id: string;
    exercise_id: string;
    set_number: number;
    target_reps: number;
    target_weight?: number;
    actual_reps?: number;
    actual_weight?: number;
    rest_duration?: number;
    completed_at?: string;
    created_at: string;
    updated_at: string;
  }>({
    table: 'exercise_sets',
    localStorageKey: 'exercise_sets',
    realTimeSubscription: true,
  });
}

export function useMeasurements() {
  return useDataSync<{
    id: string;
    user_id: string;
    type: string;
    value: number;
    unit: string;
    measured_at: string;
    notes?: string;
    created_at: string;
    updated_at: string;
  }>({
    table: 'measurements',
    localStorageKey: 'measurements',
    realTimeSubscription: true,
  });
}

export function useProgressPhotos() {
  return useDataSync<{
    id: string;
    user_id: string;
    photo_url: string;
    category: string;
    taken_at: string;
    notes?: string;
    created_at: string;
    updated_at: string;
  }>({
    table: 'progress_photos',
    localStorageKey: 'progress_photos',
    realTimeSubscription: true,
  });
}

export function useUserAchievements() {
  return useDataSync<{
    id: string;
    user_id: string;
    achievement_id: string;
    unlocked_at?: string;
    progress: number;
    created_at: string;
    updated_at: string;
  }>({
    table: 'user_achievements',
    localStorageKey: 'user_achievements',
    realTimeSubscription: true,
  });
}
