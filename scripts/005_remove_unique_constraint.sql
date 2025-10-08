-- Remove the unique constraint that prevents multiple sessions per student per day
-- This allows tutors to log multiple sessions for the same student on the same day

-- Find the constraint name first (it might be different)
-- Common names: tutoring_sessions_student_id_date_key

-- Drop the unique constraint
ALTER TABLE tutoring_sessions 
DROP CONSTRAINT IF EXISTS tutoring_sessions_student_id_date_key;

-- Also try alternative constraint names
ALTER TABLE tutoring_sessions 
DROP CONSTRAINT IF EXISTS tutoring_sessions_student_id_date_unique;

ALTER TABLE tutoring_sessions 
DROP CONSTRAINT IF EXISTS unique_student_date;

-- Verify the constraint is removed
-- Run this to check remaining constraints:
-- SELECT conname FROM pg_constraint WHERE conrelid = 'tutoring_sessions'::regclass;

