/*
  # Create progress photos table and storage
  
  1. New Tables
    - `progress_photos`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `photo_url` (text)
      - `photo_date` (date)
      - `photo_type` (enum: front, side, back, custom)
      - `category` (enum: progress, before, after, milestone)
      - `weight_at_time` (decimal, optional)
      - `body_fat_at_time` (decimal, optional)
      - `notes` (text, optional)
      - `is_public` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Storage
    - Create `progress-photos` bucket for photo storage

  3. Security
    - Enable RLS on `progress_photos` table
    - Add policies for authenticated users to manage their own photos
    - Set up storage policies for photo uploads
*/

-- Create enum types
CREATE TYPE photo_type_enum AS ENUM ('front', 'side', 'back', 'custom');
CREATE TYPE photo_category_enum AS ENUM ('progress', 'before', 'after', 'milestone');

-- Create progress_photos table
CREATE TABLE IF NOT EXISTS progress_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  photo_url text NOT NULL,
  photo_date date NOT NULL DEFAULT CURRENT_DATE,
  photo_type photo_type_enum NOT NULL DEFAULT 'front',
  category photo_category_enum NOT NULL DEFAULT 'progress',
  weight_at_time decimal(5,2),
  body_fat_at_time decimal(4,1),
  notes text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for progress_photos
CREATE POLICY "Users can view own photos" ON progress_photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public photos" ON progress_photos
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own photos" ON progress_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos" ON progress_photos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON progress_photos
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS progress_photos_user_id_idx ON progress_photos(user_id);
CREATE INDEX IF NOT EXISTS progress_photos_date_idx ON progress_photos(photo_date DESC);
CREATE INDEX IF NOT EXISTS progress_photos_user_date_idx ON progress_photos(user_id, photo_date DESC);
CREATE INDEX IF NOT EXISTS progress_photos_type_idx ON progress_photos(photo_type);
CREATE INDEX IF NOT EXISTS progress_photos_category_idx ON progress_photos(category);
CREATE INDEX IF NOT EXISTS progress_photos_public_idx ON progress_photos(is_public) WHERE is_public = true;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_progress_photos_updated_at 
  BEFORE UPDATE ON progress_photos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for progress photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload own photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'progress-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'progress-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'progress-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'progress-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public photos are viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'progress-photos');