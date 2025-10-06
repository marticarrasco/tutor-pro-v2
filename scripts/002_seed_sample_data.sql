-- Insert sample students
INSERT INTO students (name, email, phone, hourly_rate, is_active) VALUES
('Alice Johnson', 'alice.johnson@email.com', '+1-555-0101', 45.00, true),
('Bob Smith', 'bob.smith@email.com', '+1-555-0102', 50.00, true),
('Carol Davis', 'carol.davis@email.com', '+1-555-0103', 40.00, true),
('David Wilson', 'david.wilson@email.com', '+1-555-0104', 55.00, false),
('Emma Brown', 'emma.brown@email.com', '+1-555-0105', 48.00, true);

-- Insert sample scheduled classes
INSERT INTO scheduled_classes (student_id, day_of_week, start_time, duration_minutes, is_active)
SELECT 
  s.id,
  CASE s.name
    WHEN 'Alice Johnson' THEN 1 -- Monday
    WHEN 'Bob Smith' THEN 2 -- Tuesday
    WHEN 'Carol Davis' THEN 3 -- Wednesday
    WHEN 'David Wilson' THEN 4 -- Thursday
    WHEN 'Emma Brown' THEN 5 -- Friday
  END,
  CASE s.name
    WHEN 'Alice Johnson' THEN '14:00:00'
    WHEN 'Bob Smith' THEN '15:30:00'
    WHEN 'Carol Davis' THEN '16:00:00'
    WHEN 'David Wilson' THEN '13:00:00'
    WHEN 'Emma Brown' THEN '17:00:00'
  END,
  60,
  s.is_active
FROM students s;

-- Insert sample tutoring sessions for the past week
INSERT INTO tutoring_sessions (student_id, date, duration_minutes, hourly_rate, is_paid, notes)
SELECT 
  s.id,
  CURRENT_DATE - INTERVAL '7 days' + (CASE s.name
    WHEN 'Alice Johnson' THEN INTERVAL '1 day'
    WHEN 'Bob Smith' THEN INTERVAL '2 days'
    WHEN 'Carol Davis' THEN INTERVAL '3 days'
    WHEN 'Emma Brown' THEN INTERVAL '5 days'
  END),
  60,
  s.hourly_rate,
  CASE s.name
    WHEN 'Alice Johnson' THEN true
    WHEN 'Bob Smith' THEN false
    WHEN 'Carol Davis' THEN true
    WHEN 'Emma Brown' THEN false
  END,
  CASE s.name
    WHEN 'Alice Johnson' THEN 'Great progress on algebra'
    WHEN 'Bob Smith' THEN 'Worked on calculus derivatives'
    WHEN 'Carol Davis' THEN 'Review session for upcoming test'
    WHEN 'Emma Brown' THEN 'Introduction to trigonometry'
  END
FROM students s
WHERE s.is_active = true AND s.name != 'David Wilson';
