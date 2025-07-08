import { useState, useEffect, useCallback } from 'react';
import { ProgressPhoto, PhotoCategory, PhotoGallery, PhotoComparison, PhotoInsight } from '@/types/progressPhoto';
import { LocalImageStorage } from '@/lib/storage/localImageStorage';

export function useProgressPhotos() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [galleries, setGalleries] = useState<PhotoGallery[]>([]);
  const [comparisons, setComparisons] = useState<PhotoComparison[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [photosData, galleriesData, comparisonsData] = await Promise.all([
        LocalImageStorage.getPhotos(),
        LocalImageStorage.getGalleries(),
        LocalImageStorage.getComparisons(),
      ]);

      setPhotos(photosData);
      setGalleries(galleriesData);
      setComparisons(comparisonsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
      console.error('Failed to load progress photos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add new photo
  const addPhoto = useCallback(async (
    imageUri: string,
    category: PhotoCategory,
    notes?: string,
    weight?: number,
    measurements?: ProgressPhoto['measurements'],
    tags?: string[]
  ): Promise<ProgressPhoto> => {
    try {
      const newPhoto = await LocalImageStorage.addPhoto(
        imageUri,
        category,
        notes,
        weight,
        measurements,
        tags
      );

      setPhotos(prev => [newPhoto, ...prev]);
      return newPhoto;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add photo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Update photo
  const updatePhoto = useCallback(async (
    photoId: string,
    updates: Partial<ProgressPhoto>
  ): Promise<void> => {
    try {
      const updatedPhoto = await LocalImageStorage.updatePhoto(photoId, updates);
      if (updatedPhoto) {
        setPhotos(prev => prev.map(p => p.id === photoId ? updatedPhoto : p));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update photo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Delete photo
  const deletePhoto = useCallback(async (photoId: string): Promise<void> => {
    try {
      await LocalImageStorage.deletePhoto(photoId);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      
      // Remove from galleries
      setGalleries(prev => prev.map(gallery => ({
        ...gallery,
        photos: gallery.photos.filter(p => p.id !== photoId)
      })));
      
      // Remove comparisons that use this photo
      setComparisons(prev => prev.filter(comp => 
        comp.beforePhoto.id !== photoId && comp.afterPhoto.id !== photoId
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete photo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Create gallery
  const createGallery = useCallback(async (
    name: string,
    photoIds: string[],
    isPrivate: boolean = true
  ): Promise<PhotoGallery> => {
    try {
      const newGallery = await LocalImageStorage.createGallery(name, photoIds, isPrivate);
      setGalleries(prev => [newGallery, ...prev]);
      return newGallery;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create gallery';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Create comparison
  const createComparison = useCallback(async (
    beforePhotoId: string,
    afterPhotoId: string,
    title: string,
    notes?: string
  ): Promise<PhotoComparison> => {
    try {
      const newComparison = await LocalImageStorage.createComparison(
        beforePhotoId,
        afterPhotoId,
        title,
        notes
      );
      setComparisons(prev => [newComparison, ...prev]);
      return newComparison;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create comparison';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Get photos by category
  const getPhotosByCategory = useCallback((category: PhotoCategory): ProgressPhoto[] => {
    return photos.filter(photo => photo.category === category);
  }, [photos]);

  // Get photos by date range
  const getPhotosByDateRange = useCallback((startDate: Date, endDate: Date): ProgressPhoto[] => {
    return photos.filter(photo => {
      const photoDate = new Date(photo.date);
      return photoDate >= startDate && photoDate <= endDate;
    });
  }, [photos]);

  // Generate insights
  const generateInsights = useCallback((): PhotoInsight[] => {
    const insights: PhotoInsight[] = [];

    if (photos.length === 0) return insights;

    // Progress consistency insight
    const recentPhotos = photos.filter(photo => {
      const photoDate = new Date(photo.date);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return photoDate >= monthAgo;
    });

    if (recentPhotos.length >= 4) {
      insights.push({
        type: 'consistency',
        title: 'Great Photo Consistency!',
        description: `You've taken ${recentPhotos.length} progress photos this month`,
        photos: recentPhotos.slice(0, 3),
        value: recentPhotos.length,
        recommendation: 'Keep documenting your progress regularly for better tracking.'
      });
    } else if (recentPhotos.length === 0) {
      insights.push({
        type: 'consistency',
        title: 'Time for Progress Photos',
        description: 'No progress photos taken this month',
        photos: photos.slice(0, 2),
        recommendation: 'Take regular progress photos to track your visual transformation.'
      });
    }

    // Progress milestone insight
    const frontPhotos = photos.filter(p => p.category === 'front').slice(0, 2);
    if (frontPhotos.length >= 2) {
      const daysBetween = Math.abs(
        new Date(frontPhotos[0].date).getTime() - new Date(frontPhotos[1].date).getTime()
      ) / (1000 * 60 * 60 * 24);

      if (daysBetween >= 30) {
        insights.push({
          type: 'progress',
          title: 'Progress Comparison Available',
          description: `${Math.round(daysBetween)} days between your latest front photos`,
          photos: frontPhotos,
          value: Math.round(daysBetween),
          recommendation: 'Create a before/after comparison to see your transformation.'
        });
      }
    }

    // Photo variety insight
    const categories = new Set(photos.map(p => p.category));
    if (categories.size >= 3) {
      insights.push({
        type: 'milestone',
        title: 'Comprehensive Documentation',
        description: `You're tracking ${categories.size} different photo categories`,
        photos: photos.slice(0, 4),
        value: categories.size,
        recommendation: 'Great job capturing different angles for complete progress tracking.'
      });
    }

    return insights;
  }, [photos]);

  // Get storage statistics
  const getStorageStats = useCallback(async () => {
    try {
      return await LocalImageStorage.getStorageInfo();
    } catch (err) {
      console.error('Failed to get storage stats:', err);
      return {
        totalPhotos: 0,
        totalSize: 0,
        categories: {
          front: 0,
          side: 0,
          back: 0,
          progress: 0,
          workout: 0,
          custom: 0,
        },
      };
    }
  }, []);

  // Cleanup storage
  const cleanupStorage = useCallback(async () => {
    try {
      await LocalImageStorage.cleanupStorage();
      await loadData(); // Reload data after cleanup
    } catch (err) {
      console.error('Failed to cleanup storage:', err);
    }
  }, [loadData]);

  return {
    // Data
    photos,
    galleries,
    comparisons,
    insights: generateInsights(),
    
    // State
    isLoading,
    error,
    
    // Actions
    addPhoto,
    updatePhoto,
    deletePhoto,
    createGallery,
    createComparison,
    
    // Utilities
    getPhotosByCategory,
    getPhotosByDateRange,
    getStorageStats,
    cleanupStorage,
    refreshData: loadData,
    
    // Clear error
    clearError: () => setError(null),
  };
}
