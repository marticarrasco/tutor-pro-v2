-- Add user_id columns if they do not exist
ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE tutoring_sessions ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE scheduled_classes ADD COLUMN IF NOT EXISTS user_id UUID;

-- TODO: Replace the example update statements below with the correct mapping between
--       existing records and the auth.users they belong to before running the
--       NOT NULL constraints. For example, if all legacy data belongs to a single
--       user you can run:
--
-- UPDATE students SET user_id = '<USER_UUID>' WHERE user_id IS NULL;
-- UPDATE tutoring_sessions SET user_id = '<USER_UUID>' WHERE user_id IS NULL;
-- UPDATE scheduled_classes SET user_id = '<USER_UUID>' WHERE user_id IS NULL;
--
-- Repeat the UPDATE statements as needed for each user so that every row has the
-- appropriate owner set.

-- Ensure foreign key references exist
ALTER TABLE students
  ADD CONSTRAINT IF NOT EXISTS students_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE tutoring_sessions
  ADD CONSTRAINT IF NOT EXISTS tutoring_sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE scheduled_classes
  ADD CONSTRAINT IF NOT EXISTS scheduled_classes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure composite foreign keys align students with child tables
ALTER TABLE students
  ADD CONSTRAINT IF NOT EXISTS students_id_user_unique UNIQUE (id, user_id);

ALTER TABLE tutoring_sessions
  ADD CONSTRAINT IF NOT EXISTS tutoring_sessions_student_fk
  FOREIGN KEY (student_id, user_id) REFERENCES students(id, user_id) ON DELETE CASCADE;

ALTER TABLE scheduled_classes
  ADD CONSTRAINT IF NOT EXISTS scheduled_classes_student_fk
  FOREIGN KEY (student_id, user_id) REFERENCES students(id, user_id) ON DELETE CASCADE;

-- Apply NOT NULL constraints once data has been backfilled
ALTER TABLE students ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE tutoring_sessions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE scheduled_classes ALTER COLUMN user_id SET NOT NULL;

-- Update unique constraint on tutoring_sessions to be per-user
ALTER TABLE tutoring_sessions
  DROP CONSTRAINT IF EXISTS tutoring_sessions_student_id_date_key;
ALTER TABLE tutoring_sessions
  DROP CONSTRAINT IF EXISTS tutoring_sessions_student_id_date_unique;
ALTER TABLE tutoring_sessions
  DROP CONSTRAINT IF EXISTS unique_student_date;
ALTER TABLE tutoring_sessions
  ADD CONSTRAINT IF NOT EXISTS tutoring_sessions_student_date_user_key UNIQUE (student_id, date, user_id);

-- Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_students_user ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_user_date ON tutoring_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_scheduled_classes_user_day ON scheduled_classes(user_id, day_of_week);

-- Refresh RLS policies to enforce tenant isolation
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to view students" ON students;
DROP POLICY IF EXISTS "Allow authenticated users to insert students" ON students;
DROP POLICY IF EXISTS "Allow authenticated users to update students" ON students;
DROP POLICY IF EXISTS "Allow authenticated users to delete students" ON students;
CREATE POLICY "Students select by owner" ON students FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students insert by owner" ON students FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students update by owner" ON students FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students delete by owner" ON students FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow authenticated users to view sessions" ON tutoring_sessions;
DROP POLICY IF EXISTS "Allow authenticated users to insert sessions" ON tutoring_sessions;
DROP POLICY IF EXISTS "Allow authenticated users to update sessions" ON tutoring_sessions;
DROP POLICY IF EXISTS "Allow authenticated users to delete sessions" ON tutoring_sessions;
CREATE POLICY "Sessions select by owner" ON tutoring_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sessions insert by owner" ON tutoring_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Sessions update by owner" ON tutoring_sessions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Sessions delete by owner" ON tutoring_sessions FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow authenticated users to view scheduled classes" ON scheduled_classes;
DROP POLICY IF EXISTS "Allow authenticated users to insert scheduled classes" ON scheduled_classes;
DROP POLICY IF EXISTS "Allow authenticated users to update scheduled classes" ON scheduled_classes;
DROP POLICY IF EXISTS "Allow authenticated users to delete scheduled classes" ON scheduled_classes;
CREATE POLICY "Classes select by owner" ON scheduled_classes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Classes insert by owner" ON scheduled_classes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Classes update by owner" ON scheduled_classes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Classes delete by owner" ON scheduled_classes FOR DELETE USING (auth.uid() = user_id);
