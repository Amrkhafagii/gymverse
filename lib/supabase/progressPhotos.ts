import { supabase } from './index';

export interface ProgressPhoto {
  id: string;
  user_id: string;
  photo_url: string;
  photo_date: string;
  photo_type: 'front' | 'side' | 'back' | 'custom';
  category: 'progress' | 'before' | 'after' | 'milestone';
  weight_at_time?: number;
  body_fat_at_time?: number;
  notes?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface PhotoComparison {
  before_photo: ProgressPhoto;
  after_photo: ProgressPhoto;
  time_difference_days: number;
  weight_change?: number;
  body_fat_change?: number;
}

export async function uploadProgressPhoto(
  photoUri: string,
  photoData: Omit<ProgressPhoto, 'id' | 'user_id' | 'photo_url' | 'created_at' | 'updated_at'>
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Create unique filename
  const fileExt = photoUri.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  // Convert URI to blob for upload
  const response = await fetch(photoUri);
  const blob = await response.blob();

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('progress-photos')
    .upload(fileName, blob, {
      contentType: `image/${fileExt}`,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('progress-photos')
    .getPublicUrl(fileName);

  // Save photo record to database
  const { data, error } = await supabase
    .from('progress_photos')
    .insert({
      ...photoData,
      user_id: user.id,
      photo_url: publicUrl,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ProgressPhoto;
}

export async function getProgressPhotos(limit?: number, category?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  let query = supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', user.id)
    .order('photo_date', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as ProgressPhoto[];
}

export async function updateProgressPhoto(id: string, updates: Partial<ProgressPhoto>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('progress_photos')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as ProgressPhoto;
}

export async function deleteProgressPhoto(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get photo data to delete from storage
  const { data: photo } = await supabase
    .from('progress_photos')
    .select('photo_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (photo) {
    // Extract filename from URL
    const fileName = photo.photo_url.split('/').pop();
    if (fileName) {
      // Delete from storage
      await supabase.storage
        .from('progress-photos')
        .remove([`${user.id}/${fileName}`]);
    }
  }

  // Delete from database
  const { error } = await supabase
    .from('progress_photos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function getPhotosByType(photoType: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', user.id)
    .eq('photo_type', photoType)
    .order('photo_date', { ascending: false });

  if (error) throw error;
  return data as ProgressPhoto[];
}

export async function createPhotoComparison(beforePhotoId: string, afterPhotoId: string): Promise<PhotoComparison> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: photos, error } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', user.id)
    .in('id', [beforePhotoId, afterPhotoId]);

  if (error) throw error;
  if (photos.length !== 2) throw new Error('Photos not found');

  const beforePhoto = photos.find(p => p.id === beforePhotoId);
  const afterPhoto = photos.find(p => p.id === afterPhotoId);

  if (!beforePhoto || !afterPhoto) throw new Error('Photos not found');

  const beforeDate = new Date(beforePhoto.photo_date);
  const afterDate = new Date(afterPhoto.photo_date);
  const timeDifference = Math.abs(afterDate.getTime() - beforeDate.getTime());
  const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

  const weightChange = (afterPhoto.weight_at_time && beforePhoto.weight_at_time) 
    ? afterPhoto.weight_at_time - beforePhoto.weight_at_time 
    : undefined;

  const bodyFatChange = (afterPhoto.body_fat_at_time && beforePhoto.body_fat_at_time)
    ? afterPhoto.body_fat_at_time - beforePhoto.body_fat_at_time
    : undefined;

  return {
    before_photo: beforePhoto as ProgressPhoto,
    after_photo: afterPhoto as ProgressPhoto,
    time_difference_days: daysDifference,
    weight_change: weightChange,
    body_fat_change: bodyFatChange,
  };
}

export async function getRecentComparisons(limit: number = 5): Promise<PhotoComparison[]> {
  const photos = await getProgressPhotos();
  if (photos.length < 2) return [];

  const comparisons: PhotoComparison[] = [];
  
  // Group photos by type for better comparisons
  const photosByType = photos.reduce((acc, photo) => {
    if (!acc[photo.photo_type]) acc[photo.photo_type] = [];
    acc[photo.photo_type].push(photo);
    return acc;
  }, {} as Record<string, ProgressPhoto[]>);

  // Create comparisons for each photo type
  for (const [type, typePhotos] of Object.entries(photosByType)) {
    if (typePhotos.length < 2) continue;

    // Sort by date
    typePhotos.sort((a, b) => new Date(a.photo_date).getTime() - new Date(b.photo_date).getTime());

    // Create comparison between first and last photo
    const comparison = await createPhotoComparison(typePhotos[0].id, typePhotos[typePhotos.length - 1].id);
    comparisons.push(comparison);

    if (comparisons.length >= limit) break;
  }

  return comparisons;
}

export async function getPhotoStats() {
  const photos = await getProgressPhotos();
  
  const stats = {
    total_photos: photos.length,
    photos_this_month: 0,
    photos_by_type: {} as Record<string, number>,
    photos_by_category: {} as Record<string, number>,
    oldest_photo_date: null as string | null,
    latest_photo_date: null as string | null,
  };

  if (photos.length === 0) return stats;

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  photos.forEach(photo => {
    const photoDate = new Date(photo.photo_date);
    
    // Count photos this month
    if (photoDate >= thisMonth) {
      stats.photos_this_month++;
    }

    // Count by type
    stats.photos_by_type[photo.photo_type] = (stats.photos_by_type[photo.photo_type] || 0) + 1;
    
    // Count by category
    stats.photos_by_category[photo.category] = (stats.photos_by_category[photo.category] || 0) + 1;
  });

  // Set date ranges
  const sortedPhotos = photos.sort((a, b) => new Date(a.photo_date).getTime() - new Date(b.photo_date).getTime());
  stats.oldest_photo_date = sortedPhotos[0].photo_date;
  stats.latest_photo_date = sortedPhotos[sortedPhotos.length - 1].photo_date;

  return stats;
}
