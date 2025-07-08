/*
  # Social Features & Community Schema

  1. New Tables
    - `user_profiles` - Extended user profile information
    - `social_posts` - User posts and updates
    - `post_likes` - Post engagement tracking
    - `post_comments` - Comment system
    - `comment_likes` - Comment engagement tracking
    - `user_follows` - Following/follower relationships
    - `workout_shares` - Shared workout sessions
    - `community_challenges` - Group challenges
    - `challenge_participants` - Challenge participation tracking
    - `activity_feed` - User activity notifications

  2. Security
    - Enable RLS on all tables
    - Privacy controls for posts and profiles
    - Follower-based access controls

  3. Features
    - Complete social networking functionality
    - Post creation, likes, and comments
    - Following/follower system
    - Workout sharing capabilities
    - Community challenges and leaderboards
    - Activity feed and notifications
*/

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS activity_feed CASCADE;
DROP TABLE IF EXISTS challenge_participants CASCADE;
DROP TABLE IF EXISTS community_challenges CASCADE;
DROP TABLE IF EXISTS workout_shares CASCADE;
DROP TABLE IF EXISTS user_follows CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS social_posts CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- User Profiles (extended user information)
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  bio text,
  avatar_url text,
  cover_photo_url text,
  location text,
  website text,
  birth_date date,
  gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  fitness_level text DEFAULT 'beginner' CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  fitness_goals text[] DEFAULT ARRAY[]::text[],
  preferred_workout_types text[] DEFAULT ARRAY[]::text[],
  is_private boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  is_trainer boolean DEFAULT false,
  trainer_certification text,
  social_media_links jsonb DEFAULT '{}',
  privacy_settings jsonb DEFAULT '{"show_workouts": true, "show_progress": false, "show_measurements": false}',
  notification_settings jsonb DEFAULT '{"likes": true, "comments": true, "follows": true, "challenges": true}',
  follower_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  post_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Social Posts
CREATE TABLE social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  content text NOT NULL,
  post_type text DEFAULT 'text' CHECK (post_type IN ('text', 'workout', 'progress', 'achievement', 'photo', 'video')),
  media_urls text[] DEFAULT ARRAY[]::text[],
  workout_session_id uuid REFERENCES workout_sessions(id),
  progress_photo_id uuid REFERENCES progress_photos(id),
  tags text[] DEFAULT ARRAY[]::text[],
  mentions uuid[] DEFAULT ARRAY[]::uuid[],
  is_public boolean DEFAULT true,
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Post Likes
CREATE TABLE post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  post_id uuid NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Post Comments
CREATE TABLE post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  post_id uuid NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES post_comments(id),
  content text NOT NULL,
  mentions uuid[] DEFAULT ARRAY[]::uuid[],
  like_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  is_edited boolean DEFAULT false,
  edited_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comment Likes
CREATE TABLE comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  comment_id uuid NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

-- User Follows
CREATE TABLE user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id),
  following_id uuid NOT NULL REFERENCES auth.users(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'pending')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Workout Shares
CREATE TABLE workout_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  workout_session_id uuid NOT NULL REFERENCES workout_sessions(id),
  share_type text DEFAULT 'public' CHECK (share_type IN ('public', 'followers', 'friends', 'private')),
  title text,
  description text,
  share_url text,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Community Challenges
CREATE TABLE community_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  description text NOT NULL,
  challenge_type text CHECK (challenge_type IN ('workout_count', 'total_volume', 'streak', 'distance', 'time', 'custom')),
  target_value numeric NOT NULL,
  target_unit text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_public boolean DEFAULT true,
  max_participants integer,
  entry_fee numeric DEFAULT 0,
  prize_description text,
  rules jsonb DEFAULT '{}',
  participant_count integer DEFAULT 0,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  featured boolean DEFAULT false,
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Challenge Participants
CREATE TABLE challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES community_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  joined_at timestamptz DEFAULT now(),
  current_progress numeric DEFAULT 0,
  best_progress numeric DEFAULT 0,
  rank integer,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Activity Feed
CREATE TABLE activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  actor_id uuid NOT NULL REFERENCES auth.users(id),
  activity_type text NOT NULL CHECK (activity_type IN ('like', 'comment', 'follow', 'workout_share', 'achievement', 'challenge_join', 'challenge_complete')),
  target_type text CHECK (target_type IN ('post', 'comment', 'user', 'workout', 'achievement', 'challenge')),
  target_id uuid,
  content text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX idx_social_posts_created_at ON social_posts(created_at);
CREATE INDEX idx_social_posts_type ON social_posts(post_type);
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX idx_workout_shares_user_id ON workout_shares(user_id);
CREATE INDEX idx_community_challenges_status ON community_challenges(status);
CREATE INDEX idx_community_challenges_dates ON community_challenges(start_date, end_date);
CREATE INDEX idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_user_id ON challenge_participants(user_id);
CREATE INDEX idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX idx_activity_feed_created_at ON activity_feed(created_at);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (NOT is_private OR id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Social Posts
CREATE POLICY "Public posts are viewable by everyone"
  ON social_posts FOR SELECT
  TO authenticated
  USING (
    is_public = true OR 
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_follows 
      WHERE follower_id = auth.uid() 
      AND following_id = social_posts.user_id 
      AND status = 'active'
    )
  );

CREATE POLICY "Users can manage their own posts"
  ON social_posts FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Post Likes
CREATE POLICY "Users can view likes on visible posts"
  ON post_likes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM social_posts 
      WHERE id = post_likes.post_id 
      AND (
        is_public = true OR 
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_follows 
          WHERE follower_id = auth.uid() 
          AND following_id = social_posts.user_id 
          AND status = 'active'
        )
      )
    )
  );

CREATE POLICY "Users can manage their own likes"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own likes"
  ON post_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Post Comments
CREATE POLICY "Users can view comments on visible posts"
  ON post_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM social_posts 
      WHERE id = post_comments.post_id 
      AND (
        is_public = true OR 
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_follows 
          WHERE follower_id = auth.uid() 
          AND following_id = social_posts.user_id 
          AND status = 'active'
        )
      )
    )
  );

CREATE POLICY "Users can manage their own comments"
  ON post_comments FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Comment Likes
CREATE POLICY "Users can manage comment likes"
  ON comment_likes FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User Follows
CREATE POLICY "Users can view follow relationships"
  ON user_follows FOR SELECT
  TO authenticated
  USING (follower_id = auth.uid() OR following_id = auth.uid());

CREATE POLICY "Users can manage their own follows"
  ON user_follows FOR ALL
  TO authenticated
  USING (follower_id = auth.uid())
  WITH CHECK (follower_id = auth.uid());

-- Workout Shares
CREATE POLICY "Users can view public workout shares"
  ON workout_shares FOR SELECT
  TO authenticated
  USING (
    share_type = 'public' OR 
    user_id = auth.uid() OR
    (share_type = 'followers' AND EXISTS (
      SELECT 1 FROM user_follows 
      WHERE follower_id = auth.uid() 
      AND following_id = workout_shares.user_id 
      AND status = 'active'
    ))
  );

CREATE POLICY "Users can manage their own workout shares"
  ON workout_shares FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Community Challenges
CREATE POLICY "Users can view public challenges"
  ON community_challenges FOR SELECT
  TO authenticated
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create challenges"
  ON community_challenges FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own challenges"
  ON community_challenges FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Challenge Participants
CREATE POLICY "Users can view challenge participants"
  ON challenge_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_challenges 
      WHERE id = challenge_participants.challenge_id 
      AND is_public = true
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can manage their own participation"
  ON challenge_participants FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Activity Feed
CREATE POLICY "Users can view their own activity feed"
  ON activity_feed FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert activity feed items"
  ON activity_feed FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, username, display_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'New User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user profile creation (only if it doesn't exist)
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();
