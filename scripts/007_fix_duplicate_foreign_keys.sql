-- Fix duplicate foreign key constraints causing ambiguity in Supabase queries
-- This script removes redundant foreign keys that don't include user_id scoping

-- Drop the redundant foreign key from tutoring_sessions
-- We keep the composite FK (student_id, user_id) and drop the simple FK (student_id)
ALTER TABLE tutoring_sessions 
DROP CONSTRAINT IF EXISTS tutoring_sessions_student_id_fkey;

-- Drop the redundant foreign key from scheduled_classes
-- We keep the composite FK (student_id, user_id) and drop the simple FK (student_id)
ALTER TABLE scheduled_classes 
DROP CONSTRAINT IF EXISTS scheduled_classes_student_id_fkey;
