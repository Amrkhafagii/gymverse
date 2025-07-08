import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressPhoto, PhotoCategory, PhotoGallery, PhotoComparison } from '@/types/progressPhoto';

const PHOTOS_STORAGE_KEY = 'progress_photos';
const GALLERIES_STORAGE_KEY = 'photo_galleries';
const COMPARISONS_STORAGE_KEY = 'photo_comparisons';
const PHOTOS_DIRECTORY = `${FileSystem.documentDirectory}progress_photos/`;

export class LocalImageStorage {
  // Initialize storage directory
  static async initializeStorage(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(PHOTOS_DIRECTORY, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to initialize photo storage:', error);
      throw new Error('Could not initialize photo storage');
    }
  }

  // Save image to local storage
  static async saveImage(uri: string, filename?: string): Promise<string> {
    try {
      await this.initializeStorage();
      
      const timestamp = Date.now();
      const extension = uri.split('.').pop() || 'jpg';
      const fileName = filename || `photo_${timestamp}.${extension}`;
      const localUri = `${PHOTOS_DIRECTORY}${fileName}`;

      await FileSystem.copyAsync({
        from: uri,
        to: localUri,
      });

      return localUri;
    } catch (error) {
      console.error('Failed to save image:', error);
      throw new Error('Could not save image');
    }
  }

  // Delete image from local storage
  static async deleteImage(uri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      // Don't throw error for delete operations
    }
  }

  // Get all photos from storage
  static async getPhotos(): Promise<ProgressPhoto[]> {
    try {
      const photosJson = await AsyncStorage.getItem(PHOTOS_STORAGE_KEY);
      if (!photosJson) return [];

      const photos: ProgressPhoto[] = JSON.parse(photosJson);
      
      // Verify that image files still exist
      const validPhotos: ProgressPhoto[] = [];
      for (const photo of photos) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(photo.uri);
          if (fileInfo.exists) {
            validPhotos.push(photo);
          }
        } catch {
          // Skip photos with invalid URIs
        }
      }

      // Update storage if some photos were invalid
      if (validPhotos.length !== photos.length) {
        await this.savePhotos(validPhotos);
      }

      return validPhotos;
    } catch (error) {
      console.error('Failed to get photos:', error);
      return [];
    }
  }

  // Save photos to storage
  static async savePhotos(photos: ProgressPhoto[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
    } catch (error) {
      console.error('Failed to save photos:', error);
      throw new Error('Could not save photos');
    }
  }

  // Add new photo
  static async addPhoto(
    imageUri: string,
    category: PhotoCategory,
    notes?: string,
    weight?: number,
    measurements?: ProgressPhoto['measurements'],
    tags?: string[]
  ): Promise<ProgressPhoto> {
    try {
      const localUri = await this.saveImage(imageUri);
      const photos = await this.getPhotos();

      const newPhoto: ProgressPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uri: localUri,
        date: new Date().toISOString(),
        category,
        notes,
        weight,
        measurements,
        tags: tags || [],
        isPrivate: true, // Default to private
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedPhotos = [newPhoto, ...photos];
      await this.savePhotos(updatedPhotos);

      return newPhoto;
    } catch (error) {
      console.error('Failed to add photo:', error);
      throw new Error('Could not add photo');
    }
  }

  // Update photo
  static async updatePhoto(photoId: string, updates: Partial<ProgressPhoto>): Promise<ProgressPhoto | null> {
    try {
      const photos = await this.getPhotos();
      const photoIndex = photos.findIndex(p => p.id === photoId);

      if (photoIndex === -1) {
        throw new Error('Photo not found');
      }

      const updatedPhoto = {
        ...photos[photoIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      photos[photoIndex] = updatedPhoto;
      await this.savePhotos(photos);

      return updatedPhoto;
    } catch (error) {
      console.error('Failed to update photo:', error);
      throw new Error('Could not update photo');
    }
  }

  // Delete photo
  static async deletePhoto(photoId: string): Promise<void> {
    try {
      const photos = await this.getPhotos();
      const photo = photos.find(p => p.id === photoId);

      if (photo) {
        await this.deleteImage(photo.uri);
        const updatedPhotos = photos.filter(p => p.id !== photoId);
        await this.savePhotos(updatedPhotos);
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
      throw new Error('Could not delete photo');
    }
  }

  // Get photos by category
  static async getPhotosByCategory(category: PhotoCategory): Promise<ProgressPhoto[]> {
    const photos = await this.getPhotos();
    return photos.filter(photo => photo.category === category);
  }

  // Get photos by date range
  static async getPhotosByDateRange(startDate: Date, endDate: Date): Promise<ProgressPhoto[]> {
    const photos = await this.getPhotos();
    return photos.filter(photo => {
      const photoDate = new Date(photo.date);
      return photoDate >= startDate && photoDate <= endDate;
    });
  }

  // Gallery management
  static async getGalleries(): Promise<PhotoGallery[]> {
    try {
      const galleriesJson = await AsyncStorage.getItem(GALLERIES_STORAGE_KEY);
      return galleriesJson ? JSON.parse(galleriesJson) : [];
    } catch (error) {
      console.error('Failed to get galleries:', error);
      return [];
    }
  }

  static async saveGalleries(galleries: PhotoGallery[]): Promise<void> {
    try {
      await AsyncStorage.setItem(GALLERIES_STORAGE_KEY, JSON.stringify(galleries));
    } catch (error) {
      console.error('Failed to save galleries:', error);
      throw new Error('Could not save galleries');
    }
  }

  static async createGallery(name: string, photoIds: string[], isPrivate: boolean = true): Promise<PhotoGallery> {
    try {
      const photos = await this.getPhotos();
      const galleryPhotos = photos.filter(photo => photoIds.includes(photo.id));
      
      const newGallery: PhotoGallery = {
        id: `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        photos: galleryPhotos,
        isPrivate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const galleries = await this.getGalleries();
      const updatedGalleries = [newGallery, ...galleries];
      await this.saveGalleries(updatedGalleries);

      return newGallery;
    } catch (error) {
      console.error('Failed to create gallery:', error);
      throw new Error('Could not create gallery');
    }
  }

  // Photo comparison management
  static async getComparisons(): Promise<PhotoComparison[]> {
    try {
      const comparisonsJson = await AsyncStorage.getItem(COMPARISONS_STORAGE_KEY);
      return comparisonsJson ? JSON.parse(comparisonsJson) : [];
    } catch (error) {
      console.error('Failed to get comparisons:', error);
      return [];
    }
  }

  static async saveComparisons(comparisons: PhotoComparison[]): Promise<void> {
    try {
      await AsyncStorage.setItem(COMPARISONS_STORAGE_KEY, JSON.stringify(comparisons));
    } catch (error) {
      console.error('Failed to save comparisons:', error);
      throw new Error('Could not save comparisons');
    }
  }

  static async createComparison(
    beforePhotoId: string,
    afterPhotoId: string,
    title: string,
    notes?: string
  ): Promise<PhotoComparison> {
    try {
      const photos = await this.getPhotos();
      const beforePhoto = photos.find(p => p.id === beforePhotoId);
      const afterPhoto = photos.find(p => p.id === afterPhotoId);

      if (!beforePhoto || !afterPhoto) {
        throw new Error('Photos not found for comparison');
      }

      const newComparison: PhotoComparison = {
        id: `comparison_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        beforePhoto,
        afterPhoto,
        title,
        notes,
        createdAt: new Date().toISOString(),
      };

      const comparisons = await this.getComparisons();
      const updatedComparisons = [newComparison, ...comparisons];
      await this.saveComparisons(updatedComparisons);

      return newComparison;
    } catch (error) {
      console.error('Failed to create comparison:', error);
      throw new Error('Could not create comparison');
    }
  }

  // Storage cleanup
  static async cleanupStorage(): Promise<void> {
    try {
      const photos = await this.getPhotos();
      const validPhotos: ProgressPhoto[] = [];

      // Check each photo file
      for (const photo of photos) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(photo.uri);
          if (fileInfo.exists) {
            validPhotos.push(photo);
          }
        } catch {
          // Photo file doesn't exist, skip it
        }
      }

      // Update storage with valid photos only
      await this.savePhotos(validPhotos);

      // Clean up orphaned files
      try {
        const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIRECTORY);
        if (dirInfo.exists && dirInfo.isDirectory) {
          const files = await FileSystem.readDirectoryAsync(PHOTOS_DIRECTORY);
          const validUris = new Set(validPhotos.map(p => p.uri.split('/').pop()));

          for (const file of files) {
            if (!validUris.has(file)) {
              await FileSystem.deleteAsync(`${PHOTOS_DIRECTORY}${file}`);
            }
          }
        }
      } catch (error) {
        console.error('Failed to clean up orphaned files:', error);
      }
    } catch (error) {
      console.error('Failed to cleanup storage:', error);
    }
  }

  // Get storage info
  static async getStorageInfo(): Promise<{
    totalPhotos: number;
    totalSize: number;
    categories: Record<PhotoCategory, number>;
  }> {
    try {
      const photos = await this.getPhotos();
      let totalSize = 0;
      const categories: Record<PhotoCategory, number> = {
        front: 0,
        side: 0,
        back: 0,
        progress: 0,
        workout: 0,
        custom: 0,
      };

      for (const photo of photos) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(photo.uri);
          if (fileInfo.exists) {
            totalSize += fileInfo.size || 0;
            categories[photo.category]++;
          }
        } catch {
          // Skip invalid files
        }
      }

      return {
        totalPhotos: photos.length,
        totalSize,
        categories,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
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
  }
}
