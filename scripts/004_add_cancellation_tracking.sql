-- Add cancellation tracking to tutoring_sessions table
ALTER TABLE tutoring_sessions 
ADD COLUMN IF NOT EXISTS cancelled_by TEXT CHECK (cancelled_by IN ('teacher', 'student')),
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT false;

-- Update the total_amount calculation to be 0 if cancelled
-- First drop the existing generated column
ALTER TABLE tutoring_sessions DROP COLUMN IF EXISTS total_amount;

-- Add it back with cancellation logic
ALTER TABLE tutoring_sessions 
ADD COLUMN total_amount DECIMAL(10,2) GENERATED ALWAYS AS (
  CASE 
    WHEN is_cancelled = true THEN 0 
    ELSE hourly_rate * duration_minutes / 60.0 
  END
) STORED;

-- Add index for cancelled sessions
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_cancelled ON tutoring_sessions(is_cancelled);

-- Add comments for clarity
COMMENT ON COLUMN tutoring_sessions.cancelled_by IS 'Who cancelled the session: teacher or student';
COMMENT ON COLUMN tutoring_sessions.cancellation_reason IS 'Optional reason for cancellation';
COMMENT ON COLUMN tutoring_sessions.is_cancelled IS 'Whether the session was cancelled';
