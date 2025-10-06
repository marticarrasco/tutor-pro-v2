-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  hourly_rate DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tutoring_sessions table
CREATE TABLE IF NOT EXISTS tutoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) GENERATED ALWAYS AS (hourly_rate * duration_minutes / 60.0) STORED,
  is_paid BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, date) -- One session per student per day
);

-- Create scheduled_classes table
CREATE TABLE IF NOT EXISTS scheduled_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_active ON students(is_active);
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_student_date ON tutoring_sessions(student_id, date);
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_date ON tutoring_sessions(date);
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_paid ON tutoring_sessions(is_paid);
CREATE INDEX IF NOT EXISTS idx_scheduled_classes_student ON scheduled_classes(student_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_classes_day ON scheduled_classes(day_of_week);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_classes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (for single tutor app, we'll allow all operations for authenticated users)
-- Students policies
CREATE POLICY "Allow authenticated users to view students" ON students FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert students" ON students FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update students" ON students FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete students" ON students FOR DELETE USING (auth.uid() IS NOT NULL);

-- Tutoring sessions policies
CREATE POLICY "Allow authenticated users to view sessions" ON tutoring_sessions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert sessions" ON tutoring_sessions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update sessions" ON tutoring_sessions FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete sessions" ON tutoring_sessions FOR DELETE USING (auth.uid() IS NOT NULL);

-- Scheduled classes policies
CREATE POLICY "Allow authenticated users to view scheduled classes" ON scheduled_classes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert scheduled classes" ON scheduled_classes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update scheduled classes" ON scheduled_classes FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete scheduled classes" ON scheduled_classes FOR DELETE USING (auth.uid() IS NOT NULL);
