export interface ProgressPhoto {
  id: string;
  uri: string;
  date: string;
  category: PhotoCategory;
  notes?: string;
  weight?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  tags?: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PhotoCategory = 'front' | 'side' | 'back' | 'progress' | 'workout' | 'custom';

export interface PhotoComparison {
  id: string;
  beforePhoto: ProgressPhoto;
  afterPhoto: ProgressPhoto;
  title: string;
  notes?: string;
  createdAt: string;
}

export interface PhotoGallery {
  id: string;
  name: string;
  photos: ProgressPhoto[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoInsight {
  type: 'progress' | 'consistency' | 'milestone';
  title: string;
  description: string;
  photos: ProgressPhoto[];
  value?: number;
  recommendation?: string;
}
