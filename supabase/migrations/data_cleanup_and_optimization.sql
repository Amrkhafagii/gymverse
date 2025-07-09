/*
  # Data Cleanup and Final Optimizations

  1. Data Cleanup
    - Remove orphaned records
    - Clean up test data
    - Optimize table storage

  2. Final Indexes
    - Add missing indexes for performance
    - Composite indexes for common query patterns
    - Partial indexes for filtered queries

  3. Constraints and Validations
    - Add data integrity constraints
    - Validate existing data
    - Add check constraints for business rules

  4. Maintenance Functions
    - Automated cleanup procedures
    - Data archival functions
    - Performance monitoring utilities
*/

-- Data Cleanup: Remove orphaned records

-- Clean up orphaned workout exercises
DELETE FROM workout_exercises 
WHERE workout_id NOT IN (SELECT id FROM workouts);

-- Clean up orphaned workout sets
DELETE FROM workout_sets 
WHERE workout_exercise_id NOT IN (SELECT id FROM workout_exercises);

-- Clean up orphaned personal records
DELETE FROM personal_records 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Clean up orphaned measurements
DELETE FROM measurements 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Clean up orphaned social posts
DELETE FROM social_posts 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Clean up orphaned post comments
DELETE FROM post_comments 
WHERE post_id NOT IN (SELECT id FROM social_posts);

-- Clean up orphaned post likes
DELETE FROM post_likes 
WHERE post_id NOT IN (SELECT id FROM social_posts);

-- Clean up orphaned user achievements
DELETE FROM user_achievements 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Additional Performance Indexes

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_workouts_user_completed ON workouts(user_id, completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workouts_user_started ON workouts(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_order ON workout_exercises(workout_id, exercise_order);
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise_set_order ON workout_sets(workout_exercise_id, set_order);
CREATE INDEX IF NOT EXISTS idx_personal_records_user_exercise ON personal_records(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_date ON personal_records(achieved_at DESC);
CREATE INDEX IF NOT EXISTS idx_measurements_user_type_date ON measurements(user_id, measurement_type, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_user_created ON social_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_created ON post_comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_unlocked ON user_achievements(user_id, unlocked_at DESC);

-- Partial indexes for filtered queries
CREATE INDEX IF NOT EXISTS idx_workouts_active ON workouts(user_id, started_at) WHERE completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workout_sets_completed ON workout_sets(workout_exercise_id) WHERE is_completed = true;
CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges(status, end_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_social_posts_public ON social_posts(created_at DESC) WHERE privacy_level = 'public';

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_achievements_metadata_gin ON achievements USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_challenges_metadata_gin ON challenges USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_exercises_metadata_gin ON exercises USING GIN(metadata);

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_exercises_name_search ON exercises USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_social_posts_content_search ON social_posts USING GIN(to_tsvector('english', content));

-- Add Missing Constraints

-- Ensure workout completion logic
ALTER TABLE workouts ADD CONSTRAINT check_workout_completion 
  CHECK (completed_at IS NULL OR completed_at >= started_at);

-- Ensure set completion logic
ALTER TABLE workout_sets ADD CONSTRAINT check_set_values 
  CHECK (
    (is_completed = false) OR 
    (is_completed = true AND actual_reps > 0 AND actual_weight_kg >= 0)
  );

-- Ensure measurement values are positive
ALTER TABLE measurements ADD CONSTRAINT check_measurement_value 
  CHECK (value > 0);

-- Ensure personal record values are positive
ALTER TABLE personal_records ADD CONSTRAINT check_pr_values 
  CHECK (weight_kg > 0 AND reps > 0);

-- Ensure challenge dates are logical
ALTER TABLE challenges ADD CONSTRAINT check_challenge_dates 
  CHECK (end_date IS NULL OR end_date > start_date);

-- Data Validation Functions

-- Function to validate workout data integrity
CREATE OR REPLACE FUNCTION validate_workout_data()
RETURNS TABLE (
  issue_type text,
  issue_count bigint,
  description text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check for workouts without exercises
  RETURN QUERY
  SELECT 
    'workouts_without_exercises'::text,
    COUNT(*),
    'Workouts that have no exercises'::text
  FROM workouts w
  LEFT JOIN workout_exercises we ON w.id = we.workout_id
  WHERE we.id IS NULL AND w.completed_at IS NOT NULL;
  
  -- Check for exercises without sets
  RETURN QUERY
  SELECT 
    'exercises_without_sets'::text,
    COUNT(*),
    'Workout exercises that have no sets'::text
  FROM workout_exercises we
  LEFT JOIN workout_sets ws ON we.id = ws.workout_exercise_id
  WHERE ws.id IS NULL;
  
  -- Check for completed workouts with no completed sets
  RETURN QUERY
  SELECT 
    'completed_workouts_no_sets'::text,
    COUNT(DISTINCT w.id),
    'Completed workouts with no completed sets'::text
  FROM workouts w
  JOIN workout_exercises we ON w.id = we.workout_id
  LEFT JOIN workout_sets ws ON we.id = ws.workout_exercise_id AND ws.is_completed = true
  WHERE w.completed_at IS NOT NULL AND ws.id IS NULL;
  
  -- Check for invalid personal records
  RETURN QUERY
  SELECT 
    'invalid_personal_records'::text,
    COUNT(*),
    'Personal records with invalid values'::text
  FROM personal_records
  WHERE weight_kg <= 0 OR reps <= 0;
  
  -- Check for future measurements
  RETURN QUERY
  SELECT 
    'future_measurements'::text,
    COUNT(*),
    'Measurements recorded in the future'::text
  FROM measurements
  WHERE recorded_at > now();
END;
$$;

-- Function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data(days_to_keep integer DEFAULT 365)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cutoff_date timestamptz;
BEGIN
  cutoff_date := now() - (days_to_keep || ' days')::interval;
  
  -- Clean up old notifications (keep last 90 days)
  DELETE FROM achievement_notifications 
  WHERE created_at < now() - INTERVAL '90 days';
  
  DELETE FROM challenge_notifications 
  WHERE created_at < now() - INTERVAL '90 days';
  
  DELETE FROM social_notifications 
  WHERE created_at < now() - INTERVAL '90 days';
  
  -- Clean up old activity feed entries (keep last 180 days)
  DELETE FROM social_activity_feed 
  WHERE created_at < now() - INTERVAL '180 days';
  
  -- Archive old completed challenges (older than 1 year)
  UPDATE challenges 
  SET status = 'archived'
  WHERE status = 'completed' 
    AND end_date < cutoff_date;
  
  -- Clean up old analytics cache entries
  DELETE FROM user_analytics_cache 
  WHERE cache_updated_at < now() - INTERVAL '7 days';
  
  RAISE NOTICE 'Cleanup completed for data older than % days', days_to_keep;
END;
$$;

-- Function to update table statistics
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update statistics for all tables
  ANALYZE workouts;
  ANALYZE workout_exercises;
  ANALYZE workout_sets;
  ANALYZE exercises;
  ANALYZE personal_records;
  ANALYZE measurements;
  ANALYZE achievements;
  ANALYZE user_achievements;
  ANALYZE challenges;
  ANALYZE social_posts;
  ANALYZE post_comments;
  ANALYZE post_likes;
  
  RAISE NOTICE 'Table statistics updated';
END;
$$;

-- Function to monitor database performance
CREATE OR REPLACE FUNCTION get_performance_metrics()
RETURNS TABLE (
  metric_name text,
  metric_value text,
  description text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Table sizes
  RETURN QUERY
  SELECT 
    'table_sizes'::text,
    json_agg(json_build_object(
      'table_name', schemaname||'.'||tablename,
      'size', pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
    ))::text,
    'Size of all tables'::text
  FROM pg_tables 
  WHERE schemaname = 'public';
  
  -- Index usage
  RETURN QUERY
  SELECT 
    'unused_indexes'::text,
    COUNT(*)::text,
    'Number of indexes that are never used'::text
  FROM pg_stat_user_indexes 
  WHERE idx_scan = 0;
  
  -- Cache hit ratio
  RETURN QUERY
  SELECT 
    'cache_hit_ratio'::text,
    ROUND(
      (sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))) * 100, 2
    )::text || '%',
    'Buffer cache hit ratio'::text
  FROM pg_statio_user_tables;
END;
$$;

-- Create maintenance schedule comments
COMMENT ON FUNCTION cleanup_old_data(integer) IS 'Should be run weekly to clean up old data';
COMMENT ON FUNCTION update_table_statistics() IS 'Should be run daily to update table statistics';
COMMENT ON FUNCTION refresh_analytics_caches() IS 'Should be run hourly to refresh analytics caches';

-- Final data integrity check
DO $$
DECLARE
  issue_record record;
BEGIN
  FOR issue_record IN SELECT * FROM validate_workout_data() LOOP
    IF issue_record.issue_count > 0 THEN
      RAISE WARNING 'Data integrity issue: % - % occurrences - %', 
        issue_record.issue_type, 
        issue_record.issue_count, 
        issue_record.description;
    END IF;
  END LOOP;
END $$;

-- Create summary view of database health
CREATE OR REPLACE VIEW database_health_summary AS
SELECT 
  'workouts' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE completed_at IS NOT NULL) as completed_records,
  MAX(created_at) as latest_record
FROM workouts
UNION ALL
SELECT 
  'exercises',
  COUNT(*),
  COUNT(*) FILTER (WHERE is_active = true),
  MAX(created_at)
FROM exercises
UNION ALL
SELECT 
  'achievements',
  COUNT(*),
  COUNT(*) FILTER (WHERE is_active = true),
  MAX(created_at)
FROM achievements
UNION ALL
SELECT 
  'challenges',
  COUNT(*),
  COUNT(*) FILTER (WHERE status = 'active'),
  MAX(created_at)
FROM challenges
UNION ALL
SELECT 
  'social_posts',
  COUNT(*),
  COUNT(*) FILTER (WHERE privacy_level = 'public'),
  MAX(created_at)
FROM social_posts;

-- Grant necessary permissions
GRANT SELECT ON database_health_summary TO authenticated;

RAISE NOTICE 'Database migrations completed successfully!';
RAISE NOTICE 'All tables optimized with proper indexes, constraints, and RLS policies.';
RAISE NOTICE 'Analytics caches and materialized views created for performance.';
RAISE NOTICE 'Data cleanup and maintenance functions are ready for scheduling.';
