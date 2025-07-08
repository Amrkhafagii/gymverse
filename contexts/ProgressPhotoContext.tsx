import React, { createContext, useContext, ReactNode } from 'react';
import { useProgressPhotos } from '@/hooks/useProgressPhotos';
import { ProgressPhoto, PhotoCategory, PhotoGallery, PhotoComparison, PhotoInsight } from '@/types/progressPhoto';

interface ProgressPhotoContextType {
  // Data
  photos: ProgressPhoto[];
  galleries: PhotoGallery[];
  comparisons: PhotoComparison[];
  insights: PhotoInsight[];
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addPhoto: (
    imageUri: string,
    category: PhotoCategory,
    notes?: string,
    weight?: number,
    measurements?: ProgressPhoto['measurements'],
    tags?: string[]
  ) => Promise<ProgressPhoto>;
  updatePhoto: (photoId: string, updates: Partial<ProgressPhoto>) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
  createGallery: (name: string, photoIds: string[], isPrivate?: boolean) => Promise<PhotoGallery>;
  createComparison: (beforePhotoId: string, afterPhotoId: string, title: string, notes?: string) => Promise<PhotoComparison>;
  
  // Utilities
  getPhotosByCategory: (category: PhotoCategory) => ProgressPhoto[];
  getPhotosByDateRange: (startDate: Date, endDate: Date) => ProgressPhoto[];
  getStorageStats: () => Promise<{
    totalPhotos: number;
    totalSize: number;
    categories: Record<PhotoCategory, number>;
  }>;
  cleanupStorage: () => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

const ProgressPhotoContext = createContext<ProgressPhotoContextType | undefined>(undefined);

interface ProgressPhotoProviderProps {
  children: ReactNode;
}

export function ProgressPhotoProvider({ children }: ProgressPhotoProviderProps) {
  const progressPhotos = useProgressPhotos();

  return (
    <ProgressPhotoContext.Provider value={progressPhotos}>
      {children}
    </ProgressPhotoContext.Provider>
  );
}

export function useProgressPhotoContext(): ProgressPhotoContextType {
  const context = useContext(ProgressPhotoContext);
  if (context === undefined) {
    throw new Error('useProgressPhotoContext must be used within a ProgressPhotoProvider');
  }
  return context;
}
