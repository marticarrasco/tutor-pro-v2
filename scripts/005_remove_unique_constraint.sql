-- Ensure the tutoring_sessions uniqueness constraint allows per-user isolation
ALTER TABLE tutoring_sessions
DROP CONSTRAINT IF EXISTS tutoring_sessions_student_id_date_key;

ALTER TABLE tutoring_sessions
DROP CONSTRAINT IF EXISTS tutoring_sessions_student_id_date_unique;

ALTER TABLE tutoring_sessions
DROP CONSTRAINT IF EXISTS unique_student_date;

ALTER TABLE tutoring_sessions
ADD CONSTRAINT IF NOT EXISTS tutoring_sessions_student_date_user_key UNIQUE (student_id, date, user_id);
