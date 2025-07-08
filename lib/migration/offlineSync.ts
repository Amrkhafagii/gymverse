import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../supabase';

export interface OfflineOperation {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
}

export interface OfflineQueueStatus {
  queueSize: number;
  isProcessing: boolean;
  lastProcessed: string | null;
  failedOperations: number;
}

class OfflineSyncManager {
  private isProcessing = false;
  private queue: OfflineOperation[] = [];
  private readonly QUEUE_KEY = 'offline_operation_queue';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  constructor() {
    this.initializeOfflineSync();
  }

  private async initializeOfflineSync() {
    // Load existing queue from storage
    await this.loadQueue();

    // Listen for network connectivity changes
    NetInfo.addEventListener(state => {
      if (state.isConnected && this.queue.length > 0 && !this.isProcessing) {
        this.processQueue();
      }
    });

    // Process queue on app start if online
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected && this.queue.length > 0) {
      this