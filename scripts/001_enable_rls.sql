-- Enable Row Level Security on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_classes ENABLE ROW LEVEL SECURITY;

-- Create policies for students table
-- Allow users to view all students (tutor can see all students)
CREATE POLICY "Allow authenticated users to view students" ON students FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow users to insert students
CREATE POLICY "Allow authenticated users to insert students" ON students FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update students
CREATE POLICY "Allow authenticated users to update students" ON students FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow users to delete students
CREATE POLICY "Allow authenticated users to delete students" ON students FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create policies for tutoring_sessions table
-- Allow users to view all sessions
CREATE POLICY "Allow authenticated users to view sessions" ON tutoring_sessions FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow users to insert sessions
CREATE POLICY "Allow authenticated users to insert sessions" ON tutoring_sessions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update sessions
CREATE POLICY "Allow authenticated users to update sessions" ON tutoring_sessions FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow users to delete sessions
CREATE POLICY "Allow authenticated users to delete sessions" ON tutoring_sessions FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create policies for scheduled_classes table
-- Allow users to view all scheduled classes
CREATE POLICY "Allow authenticated users to view scheduled classes" ON scheduled_classes FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow users to insert scheduled classes
CREATE POLICY "Allow authenticated users to insert scheduled classes" ON scheduled_classes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update scheduled classes
CREATE POLICY "Allow authenticated users to update scheduled classes" ON scheduled_classes FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow users to delete scheduled classes
CREATE POLICY "Allow authenticated users to delete scheduled classes" ON scheduled_classes FOR DELETE USING (auth.uid() IS NOT NULL);
