/*
  # Progress Photos & Visual Tracking Schema

  1. New Tables
    - `photo_albums` - Organized photo collections
    - `progress_photos` - Individual progress photos with metadata
    - `photo_comparisons` - Side-by-side photo comparisons
    - `photo_tags` - Tagging system for photos
    - `photo_analytics` - Photo-based progress analytics
    - `photo_shares` - Photo sharing and privacy controls

  2. Security
    - Enable RLS on all tables
    - Users can only access their own photos
    - Privacy controls for photo sharing

  3. Features
    - Comprehensive photo organization system
    - Before/after comparison tools
    - Progress timeline visualization
    - Privacy and sharing controls
    - Photo-based analytics and insights
*/

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS photo_shares CASCADE;
DROP TABLE IF EXISTS photo_analytics CASCADE;
DROP TABLE IF EXISTS photo_tags CASCADE;
DROP TABLE IF EXISTS photo_comparisons CASCADE;
DROP TABLE IF EXISTS progress_photos CASCADE;
DROP TABLE IF EXISTS photo_albums CASCADE;

-- Photo Albums (must be created first due to foreign key references)
CREATE TABLE photo_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  description text,
  cover_photo_url text,
  is_default boolean DEFAULT false,
  is_private boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Progress Photos
CREATE TABLE progress_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  album_id uuid REFERENCES photo_albums(id),
  photo_url text NOT NULL,
  thumbnail_url text,
  title text,
  description text,
  photo_date date DEFAULT CURRENT_DATE,
  angle text CHECK (angle IN ('front', 'side', 'back', 'custom')),
  lighting_condition text CHECK (lighting_condition IN ('natural', 'indoor', 'gym', 'outdoor')),
  time_of_day text CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'night')),
  body_state text CHECK (body_state IN ('relaxed', 'flexed', 'posed')),
  clothing_type text,
  weight_kg numeric,
  body_fat_percentage numeric,
  is_private boolean DEFAULT true,
  is_favorite boolean DEFAULT false,
  tags text[] DEFAULT ARRAY[]::text[],
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Photo Comparisons
CREATE TABLE photo_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  description text,
  before_photo_id uuid REFERENCES progress_photos(id),
  after_photo_id uuid REFERENCES progress_photos(id),
  comparison_type text DEFAULT 'before_after' CHECK (comparison_type IN ('before_after', 'side_by_side', 'overlay', 'timeline')),
  time_difference_days integer,
  weight_difference_kg numeric,
  notes text,
  is_private boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Photo Tags
CREATE TABLE photo_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  color text DEFAULT '#3B82F6',
  description text,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Photo Analytics
CREATE TABLE photo_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  photo_id uuid NOT NULL REFERENCES progress_photos(id),
  analysis_date timestamptz DEFAULT now(),
  analysis_type text CHECK (analysis_type IN ('body_composition', 'posture', 'muscle_definition', 'symmetry')),
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 1),
  results jsonb DEFAULT '{}',
  insights text,
  recommendations text,
  created_at timestamptz DEFAULT now()
);

-- Photo Sharing
CREATE TABLE photo_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  photo_id uuid REFERENCES progress_photos(id),
  comparison_id uuid REFERENCES photo_comparisons(id),
  share_type text CHECK (share_type IN ('public', 'friends', 'community', 'trainer')),
  share_url text,
  expires_at timestamptz,
  view_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CHECK (
    (photo_id IS NOT NULL AND comparison_id IS NULL) OR
    (photo_id IS NULL AND comparison_id IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX idx_photo_albums_user_id ON photo_albums(user_id);
CREATE INDEX idx_progress_photos_user_id ON progress_photos(user_id);
CREATE INDEX idx_progress_photos_album_id ON progress_photos(album_id);
CREATE INDEX idx_progress_photos_date ON progress_photos(photo_date);
CREATE INDEX idx_progress_photos_tags ON progress_photos USING GIN(tags);
CREATE INDEX idx_photo_comparisons_user_id ON photo_comparisons(user_id);
CREATE INDEX idx_photo_tags_user_id ON photo_tags(user_id);
CREATE INDEX idx_photo_analytics_user_id ON photo_analytics(user_id);
CREATE INDEX idx_photo_analytics_photo_id ON photo_analytics(photo_id);
CREATE INDEX idx_photo_shares_user_id ON photo_shares(user_id);

-- Enable RLS
ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Photo Albums
CREATE POLICY "Users can manage their own photo albums"
  ON photo_albums FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Progress Photos
CREATE POLICY "Users can manage their own progress photos"
  ON progress_photos FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Photo Comparisons
CREATE POLICY "Users can manage their own photo comparisons"
  ON photo_comparisons FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Photo Tags
CREATE POLICY "Users can manage their own photo tags"
  ON photo_tags FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Photo Analytics
CREATE POLICY "Users can view their own photo analytics"
  ON photo_analytics FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert photo analytics"
  ON photo_analytics FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Photo Shares
CREATE POLICY "Users can manage their own photo shares"
  ON photo_shares FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to create default photo album for new users
CREATE OR REPLACE FUNCTION create_default_photo_album()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO photo_albums (user_id, name, description, is_default, is_private)
  VALUES (NEW.id, 'My Progress', 'Default album for progress photos', true, true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for default album creation (only if it doesn't exist)
DROP TRIGGER IF EXISTS create_default_album_trigger ON auth.users;
CREATE TRIGGER create_default_album_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_photo_album();
