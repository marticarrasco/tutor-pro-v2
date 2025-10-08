-- Enable Row Level Security on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_classes ENABLE ROW LEVEL SECURITY;

-- Students policies
CREATE POLICY IF NOT EXISTS "Students select by owner" ON students
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Students insert by owner" ON students
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Students update by owner" ON students
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Students delete by owner" ON students
  FOR DELETE USING (auth.uid() = user_id);

-- Tutoring sessions policies
CREATE POLICY IF NOT EXISTS "Sessions select by owner" ON tutoring_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Sessions insert by owner" ON tutoring_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Sessions update by owner" ON tutoring_sessions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Sessions delete by owner" ON tutoring_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Scheduled classes policies
CREATE POLICY IF NOT EXISTS "Classes select by owner" ON scheduled_classes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Classes insert by owner" ON scheduled_classes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Classes update by owner" ON scheduled_classes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Classes delete by owner" ON scheduled_classes
  FOR DELETE USING (auth.uid() = user_id);
