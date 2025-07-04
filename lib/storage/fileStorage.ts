import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

// File storage directories
const STORAGE_DIRS = {
  PROFILE_PICTURES: `${FileSystem.documentDirectory}profile_pictures/`,
  PROGRESS_PHOTOS: `${FileSystem.documentDirectory}progress_photos/`,
  WORKOUT_MEDIA: `${FileSystem.documentDirectory}workout_media/`,
  EXPORTS: `${FileSystem.documentDirectory}exports/`,
} as const;

// Initialize storage directories
export const initializeFileStorage = async (): Promise<void> => {
  try {
    for (const dir of Object.values(STORAGE_DIRS)) {
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
    }
    console.log('File storage directories initialized');
  } catch (error) {
    console.error('Error initializing file storage:', error);
    throw error;
  }
};

// Profile picture functions
export const saveProfilePicture = async (imageUri: string): Promise<string> => {
  try {
    const filename = `profile_${Date.now()}.jpg`;
    const destination = `${STORAGE_DIRS.PROFILE_PICTURES}${filename}`;
    
    await FileSystem.copyAsync({
      from: imageUri,
      to: destination,
    });
    
    return destination;
  } catch (error) {
    console.error('Error saving profile picture:', error);
    throw error;
  }
};

export const deleteProfilePicture = async (filePath: string): Promise<void> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath);
    }
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    throw error;
  }
};

// Progress photo functions
export const saveProgressPhoto = async (imageUri: string, notes?: string): Promise<string> => {
  try {
    const filename = `progress_${Date.now()}.jpg`;
    const destination = `${STORAGE_DIRS.PROGRESS_PHOTOS}${filename}`;
    
    await FileSystem.copyAsync({
      from: imageUri,
      to: destination,
    });
    
    return destination;
  } catch (error) {
    console.error('Error saving progress photo:', error);
    throw error;
  }
};

export const getProgressPhotos = async (): Promise<string[]> => {
  try {
    const files = await FileSystem.readDirectoryAsync(STORAGE_DIRS.PROGRESS_PHOTOS);
    return files
      .filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
      .map(file => `${STORAGE_DIRS.PROGRESS_PHOTOS}${file}`)
      .sort((a, b) => b.localeCompare(a)); // Sort by newest first
  } catch (error) {
    console.error('Error getting progress photos:', error);
    return [];
  }
};

export const deleteProgressPhoto = async (filePath: string): Promise<void> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath);
    }
  } catch (error) {
    console.error('Error deleting progress photo:', error);
    throw error;
  }
};

// Image picker functions
export const pickImageFromLibrary = async (): Promise<string | null> => {
  try {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      throw new Error('Permission to access camera roll is required!');
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Error picking image from library:', error);
    throw error;
  }
};

export const takePhotoWithCamera = async (): Promise<string | null> => {
  try {
    // Request permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      throw new Error('Permission to access camera is required!');
    }

    // Take photo
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Error taking photo with camera:', error);
    throw error;
  }
};

// Export/Import functions
export const exportDataToFile = async (data: any, filename: string): Promise<string> => {
  try {
    const filePath = `${STORAGE_DIRS.EXPORTS}${filename}`;
    const jsonString = JSON.stringify(data, null, 2);
    
    await FileSystem.writeAsStringAsync(filePath, jsonString);
    
    return filePath;
  } catch (error) {
    console.error('Error exporting data to file:', error);
    throw error;
  }
};

export const importDataFromFile = async (filePath: string): Promise<any> => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(filePath);
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error importing data from file:', error);
    throw error;
  }
};

// Cleanup functions
export const cleanupOldFiles = async (maxAgeInDays: number = 30): Promise<void> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeInDays);
    
    for (const dir of Object.values(STORAGE_DIRS)) {
      const files = await FileSystem.readDirectoryAsync(dir);
      
      for (const file of files) {
        const filePath = `${dir}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        
        if (fileInfo.exists && fileInfo.modificationTime) {
          const fileDate = new Date(fileInfo.modificationTime * 1000);
          
          if (fileDate < cutoffDate) {
            await FileSystem.deleteAsync(filePath);
          }
        }
      }
    }
    
    console.log('Old files cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up old files:', error);
  }
};

export const getStorageUsage = async (): Promise<{
  totalSize: number;
  profilePictures: number;
  progressPhotos: number;
  workoutMedia: number;
  exports: number;
}> => {
  try {
    const usage = {
      totalSize: 0,
      profilePictures: 0,
      progressPhotos: 0,
      workoutMedia: 0,
      exports: 0,
    };

    const dirSizes = await Promise.all([
      getDirectorySize(STORAGE_DIRS.PROFILE_PICTURES),
      getDirectorySize(STORAGE_DIRS.PROGRESS_PHOTOS),
      getDirectorySize(STORAGE_DIRS.WORKOUT_MEDIA),
      getDirectorySize(STORAGE_DIRS.EXPORTS),
    ]);

    usage.profilePictures = dirSizes[0];
    usage.progressPhotos = dirSizes[1];
    usage.workoutMedia = dirSizes[2];
    usage.exports = dirSizes[3];
    usage.totalSize = dirSizes.reduce((sum, size) => sum + size, 0);

    return usage;
  } catch (error) {
    console.error('Error getting storage usage:', error);
    return {
      totalSize: 0,
      profilePictures: 0,
      progressPhotos: 0,
      workoutMedia: 0,
      exports: 0,
    };
  }
};

const getDirectorySize = async (dirPath: string): Promise<number> => {
  try {
    const files = await FileSystem.readDirectoryAsync(dirPath);
    let totalSize = 0;

    for (const file of files) {
      const filePath = `${dirPath}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (fileInfo.exists && fileInfo.size) {
        totalSize += fileInfo.size;
      }
    }

    return totalSize;
  } catch (error) {
    console.error(`Error getting directory size for ${dirPath}:`, error);
    return 0;
  }
};

// Utility function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
