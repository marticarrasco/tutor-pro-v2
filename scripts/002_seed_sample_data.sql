DO $$
DECLARE
  owner_id uuid;
  student_record RECORD;
BEGIN
  SELECT id
    INTO owner_id
  FROM auth.users
  ORDER BY created_at
  LIMIT 1;

  IF owner_id IS NULL THEN
    RAISE NOTICE 'No users found. Skipping seed data.';
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM students WHERE user_id = owner_id) THEN
    RAISE NOTICE 'Seed data already exists for user %, skipping.', owner_id;
    RETURN;
  END IF;

  FOR student_record IN
    INSERT INTO students (user_id, name, email, phone, hourly_rate, is_active)
    VALUES
      (owner_id, 'Alice Johnson', 'alice.johnson@email.com', '+1-555-0101', 45.00, true),
      (owner_id, 'Bob Smith', 'bob.smith@email.com', '+1-555-0102', 50.00, true),
      (owner_id, 'Carol Davis', 'carol.davis@email.com', '+1-555-0103', 40.00, true),
      (owner_id, 'David Wilson', 'david.wilson@email.com', '+1-555-0104', 55.00, false),
      (owner_id, 'Emma Brown', 'emma.brown@email.com', '+1-555-0105', 48.00, true)
    RETURNING id, name, hourly_rate, is_active
  LOOP
    INSERT INTO scheduled_classes (user_id, student_id, day_of_week, start_time, duration_minutes, is_active)
    VALUES (
      owner_id,
      student_record.id,
      CASE student_record.name
        WHEN 'Alice Johnson' THEN 1
        WHEN 'Bob Smith' THEN 2
        WHEN 'Carol Davis' THEN 3
        WHEN 'David Wilson' THEN 4
        WHEN 'Emma Brown' THEN 5
        ELSE 1
      END,
      CASE student_record.name
        WHEN 'Alice Johnson' THEN '14:00:00'
        WHEN 'Bob Smith' THEN '15:30:00'
        WHEN 'Carol Davis' THEN '16:00:00'
        WHEN 'David Wilson' THEN '13:00:00'
        WHEN 'Emma Brown' THEN '17:00:00'
        ELSE '14:00:00'
      END,
      60,
      student_record.is_active
    );

    IF student_record.name <> 'David Wilson' THEN
      INSERT INTO tutoring_sessions (
        user_id,
        student_id,
        date,
        duration_minutes,
        hourly_rate,
        is_paid,
        notes
      )
      VALUES (
        owner_id,
        student_record.id,
        CURRENT_DATE - INTERVAL '7 days' +
          CASE student_record.name
            WHEN 'Alice Johnson' THEN INTERVAL '1 day'
            WHEN 'Bob Smith' THEN INTERVAL '2 days'
            WHEN 'Carol Davis' THEN INTERVAL '3 days'
            WHEN 'Emma Brown' THEN INTERVAL '5 days'
            ELSE INTERVAL '0 days'
          END,
        60,
        student_record.hourly_rate,
        CASE student_record.name
          WHEN 'Alice Johnson' THEN true
          WHEN 'Bob Smith' THEN false
          WHEN 'Carol Davis' THEN true
          WHEN 'Emma Brown' THEN false
          ELSE false
        END,
        CASE student_record.name
          WHEN 'Alice Johnson' THEN 'Great progress on algebra'
          WHEN 'Bob Smith' THEN 'Worked on calculus derivatives'
          WHEN 'Carol Davis' THEN 'Review session for upcoming test'
          WHEN 'Emma Brown' THEN 'Introduction to trigonometry'
          ELSE 'General practice'
        END
      );
    END IF;
  END LOOP;
END $$;
