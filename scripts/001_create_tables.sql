-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  hourly_rate DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (id, user_id)
);

-- Create tutoring_sessions table
CREATE TABLE IF NOT EXISTS tutoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE
      WHEN is_cancelled = true THEN 0
      ELSE hourly_rate * duration_minutes / 60.0
    END
  ) STORED,
  is_paid BOOLEAN DEFAULT false,
  notes TEXT,
  is_cancelled BOOLEAN DEFAULT false,
  cancelled_by TEXT CHECK (cancelled_by IN ('teacher', 'student')),
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, date, user_id), -- One session per student per day per tutor
  CONSTRAINT tutoring_sessions_student_fk FOREIGN KEY (student_id, user_id)
    REFERENCES students(id, user_id) ON DELETE CASCADE
);

-- Create scheduled_classes table
CREATE TABLE IF NOT EXISTS scheduled_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT scheduled_classes_student_fk FOREIGN KEY (student_id, user_id)
    REFERENCES students(id, user_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_user ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_active ON students(is_active);
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_user_date ON tutoring_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_student_date ON tutoring_sessions(student_id, date);
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_paid ON tutoring_sessions(is_paid);
CREATE INDEX IF NOT EXISTS idx_scheduled_classes_user_day ON scheduled_classes(user_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_scheduled_classes_student ON scheduled_classes(student_id);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_classes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies enforcing tenant isolation
-- Students policies
CREATE POLICY "Students select by owner" ON students
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students insert by owner" ON students
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students update by owner" ON students
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students delete by owner" ON students
  FOR DELETE USING (auth.uid() = user_id);

-- Tutoring sessions policies
CREATE POLICY "Sessions select by owner" ON tutoring_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sessions insert by owner" ON tutoring_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Sessions update by owner" ON tutoring_sessions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Sessions delete by owner" ON tutoring_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Scheduled classes policies
CREATE POLICY "Classes select by owner" ON scheduled_classes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Classes insert by owner" ON scheduled_classes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Classes update by owner" ON scheduled_classes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Classes delete by owner" ON scheduled_classes
  FOR DELETE USING (auth.uid() = user_id);
