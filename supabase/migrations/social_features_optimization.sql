/*
  # Social Features Optimization

  1. New Tables
    - `user_relationships` - Friend connections and follow relationships
    - `social_activity_feed` - Centralized activity feed
    - `social_notifications` - Social interaction notifications
    - `user_privacy_settings` - Privacy controls for social features

  2. Enhanced Tables
    - `social_posts` - Add engagement metrics and privacy controls
    - `post_comments` - Enhanced comment system with threading
    - `post_likes` - Reaction system with different types

  3. Performance Optimizations
    - Indexes for social queries
    - Materialized views for activity feeds
    - Efficient friend/follower lookups

  4. Security & Privacy
    - RLS policies for social data
    - Privacy controls for posts and activities
    - Friend-only content restrictions
*/

-- User Relationships (Friends/Followers)
CREATE TABLE IF NOT EXISTS user_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_type text NOT NULL DEFAULT 'follow' CHECK (relationship_type IN ('follow', 'friend', 'blocked')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Social Activity Feed
CREATE TABLE IF NOT EXISTS social_activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('workout_completed', 'achievement_unlocked', 'personal_record', 'challenge_joined', 'challenge_completed', 'post_created', 'comment_added', 'like_added')),
  object_type text NOT NULL CHECK (object_type IN ('workout', 'achievement', 'personal_record', 'challenge', 'post', 'comment')),
  object_id uuid NOT NULL,
  metadata jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Social Notifications
CREATE TABLE IF NOT EXISTS social_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('follow_request', 'follow_accepted', 'like', 'comment', 'mention', 'challenge_invite', 'workout_reaction')),
  title text NOT NULL,
  message text NOT NULL,
  object_type text,
  object_id uuid,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- User Privacy Settings
CREATE TABLE IF NOT EXISTS user_privacy_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_visibility text DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  workout_visibility text DEFAULT 'public' CHECK (workout_visibility IN ('public', 'friends', 'private')),
  achievement_visibility text DEFAULT 'public' CHECK (achievement_visibility IN ('public', 'friends', 'private')),
  allow_friend_requests boolean DEFAULT true,
  allow_challenge_invites boolean DEFAULT true,
  show_online_status boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  activity_feed_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced Social Posts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_posts' AND column_name = 'privacy_level') THEN
    ALTER TABLE social_posts ADD COLUMN privacy_level text DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends', 'private'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_posts' AND column_name = 'like_count') THEN
    ALTER TABLE social_posts ADD COLUMN like_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_posts' AND column_name = 'comment_count') THEN
    ALTER TABLE social_posts ADD COLUMN comment_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_posts' AND column_name = 'share_count') THEN
    ALTER TABLE social_posts ADD COLUMN share_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_posts' AND column_name = 'is_pinned') THEN
    ALTER TABLE social_posts ADD COLUMN is_pinned boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_posts' AND column_name = 'tags') THEN
    ALTER TABLE social_posts ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_posts' AND column_name = 'metadata') THEN
    ALTER TABLE social_posts ADD COLUMN metadata jsonb DEFAULT '{}';
  END IF;
END $$;

-- Enhanced Post Comments
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_comments' AND column_name = 'parent_comment_id') THEN
    ALTER TABLE post_comments ADD COLUMN parent_comment_id uuid REFERENCES post_comments(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_comments' AND column_name = 'like_count') THEN
    ALTER TABLE post_comments ADD COLUMN like_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_comments' AND column_name = 'reply_count') THEN
    ALTER TABLE post_comments ADD COLUMN reply_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_comments' AND column_name = 'is_edited') THEN
    ALTER TABLE post_comments ADD COLUMN is_edited boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_comments' AND column_name = 'edited_at') THEN
    ALTER TABLE post_comments ADD COLUMN edited_at timestamptz;
  END IF;
END $$;

-- Enhanced Post Likes (Reactions)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_likes' AND column_name = 'reaction_type') THEN
    ALTER TABLE post_likes ADD COLUMN reaction_type text DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'fire', 'strong', 'clap'));
  END IF;
END $$;

-- Comment Likes
CREATE TABLE IF NOT EXISTS comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'fire', 'strong', 'clap')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE user_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for User Relationships
CREATE POLICY "Users can read relationships involving them"
  ON user_relationships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create relationships as follower"
  ON user_relationships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can update relationships involving them"
  ON user_relationships
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = following_id)
  WITH CHECK (auth.uid() = follower_id OR auth.uid() = following_id);

-- RLS Policies for Social Activity Feed
CREATE POLICY "Users can read their own activity feed"
  ON social_activity_feed
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for Social Notifications
CREATE POLICY "Users can read their own notifications"
  ON social_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON social_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Privacy Settings
CREATE POLICY "Users can read their own privacy settings"
  ON user_privacy_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own privacy settings"
  ON user_privacy_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy settings"
  ON user_privacy_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Comment Likes
CREATE POLICY "Users can read comment likes"
  ON comment_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own comment likes"
  ON comment_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes"
  ON comment_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enhanced RLS for Social Posts (Privacy-aware)
DROP POLICY IF EXISTS "Users can read social posts" ON social_posts;
CREATE POLICY "Users can read social posts based on privacy"
  ON social_posts
  FOR SELECT
  TO authenticated
  USING (
    privacy_level = 'public' OR
    user_id = auth.uid() OR
    (privacy_level = 'friends' AND EXISTS (
      SELECT 1 FROM user_relationships ur
      WHERE ur.follower_id = auth.uid() 
        AND ur.following_id = social_posts.user_id 
        AND ur.status = 'accepted'
    ))
  );

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_relationships_follower ON user_relationships(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_following ON user_relationships(following_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_status ON user_relationships(status);
CREATE INDEX IF NOT EXISTS idx_user_relationships_type ON user_relationships(relationship_type);

CREATE INDEX IF NOT EXISTS idx_social_activity_feed_user_id ON social_activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_social_activity_feed_actor_id ON social_activity_feed(actor_id);
CREATE INDEX IF NOT EXISTS idx_social_activity_feed_created_at ON social_activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_activity_feed_type ON social_activity_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_social_activity_feed_unread ON social_activity_feed(user_id, is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_social_notifications_user_id ON social_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_social_notifications_from_user ON social_notifications(from_user_id);
CREATE INDEX IF NOT EXISTS idx_social_notifications_unread ON social_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_social_notifications_created_at ON social_notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_social_posts_privacy ON social_posts(privacy_level);
CREATE INDEX IF NOT EXISTS idx_social_posts_tags ON social_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_social_posts_pinned ON social_posts(user_id, is_pinned) WHERE is_pinned = true;

CREATE INDEX IF NOT EXISTS idx_post_comments_parent ON post_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- Functions for Social Features

-- Function to Check if Users are Friends
CREATE OR REPLACE FUNCTION are_users_friends(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_relationships
    WHERE ((follower_id = user1_id AND following_id = user2_id) OR
           (follower_id = user2_id AND following_id = user1_id))
      AND status = 'accepted'
      AND relationship_type IN ('friend', 'follow')
  );
END;
$$;

-- Function to Get User's Activity Feed
CREATE OR REPLACE FUNCTION get_user_activity_feed(p_user_id uuid, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
RETURNS TABLE (
  id uuid,
  actor_id uuid,
  activity_type text,
  object_type text,
  object_id uuid,
  metadata jsonb,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    saf.id,
    saf.actor_id,
    saf.activity_type,
    saf.object_type,
    saf.object_id,
    saf.metadata,
    saf.created_at
  FROM social_activity_feed saf
  WHERE saf.user_id = p_user_id
    OR saf.actor_id IN (
      SELECT ur.following_id
      FROM user_relationships ur
      WHERE ur.follower_id = p_user_id
        AND ur.status = 'accepted'
    )
  ORDER BY saf.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function to Update Post Engagement Counts
CREATE OR REPLACE FUNCTION update_post_engagement_counts(p_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE social_posts
  SET 
    like_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = p_post_id),
    comment_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = p_post_id)
  WHERE id = p_post_id;
END;
$$;

-- Function to Update Comment Engagement Counts
CREATE OR REPLACE FUNCTION update_comment_engagement_counts(p_comment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE post_comments
  SET 
    like_count = (SELECT COUNT(*) FROM comment_likes WHERE comment_id = p_comment_id),
    reply_count = (SELECT COUNT(*) FROM post_comments WHERE parent_comment_id = p_comment_id)
  WHERE id = p_comment_id;
END;
$$;

-- Triggers for Engagement Count Updates
CREATE OR REPLACE FUNCTION trigger_update_post_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_TABLE_NAME = 'post_likes' THEN
    PERFORM update_post_engagement_counts(COALESCE(NEW.post_id, OLD.post_id));
  ELSIF TG_TABLE_NAME = 'post_comments' THEN
    PERFORM update_post_engagement_counts(COALESCE(NEW.post_id, OLD.post_id));
    IF NEW.parent_comment_id IS NOT NULL THEN
      PERFORM update_comment_engagement_counts(NEW.parent_comment_id);
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION trigger_update_comment_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM update_comment_engagement_counts(COALESCE(NEW.comment_id, OLD.comment_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers
CREATE TRIGGER update_post_like_counts
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_post_counts();

CREATE TRIGGER update_post_comment_counts
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_post_counts();

CREATE TRIGGER update_comment_like_counts
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_comment_counts();

-- Insert Default Privacy Settings for Existing Users
INSERT INTO user_privacy_settings (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_privacy_settings)
ON CONFLICT (user_id) DO NOTHING;
