# Multi-tenant data migration

The application now scopes students, scheduled classes, and tutoring sessions to the authenticated Supabase user. Follow the steps below to backfill and enforce tenant isolation in an existing database.

## 1. Add the new structure
Run the migration SQL:

```sql
\i scripts/006_add_user_scoping.sql
```

This script adds the `user_id` column to each table, creates foreign keys and indexes, refreshes row-level security (RLS) policies, and updates the tutoring session uniqueness constraint to include `user_id`.

## 2. Backfill `user_id`
Before the NOT NULL constraints succeed you must update every legacy row with the appropriate owner. For example, if all existing data belongs to a single tutor run:

```sql
UPDATE students SET user_id = '<USER_UUID>' WHERE user_id IS NULL;
UPDATE tutoring_sessions SET user_id = '<USER_UUID>' WHERE user_id IS NULL;
UPDATE scheduled_classes SET user_id = '<USER_UUID>' WHERE user_id IS NULL;
```

Repeat the `UPDATE` statements as needed if multiple tutors already exist. When the updates finish re-run `scripts/006_add_user_scoping.sql` to apply the NOT NULL constraints and recreate the policies.

## 3. Verify RLS
After the migration, confirm that RLS is working by testing queries through the Supabase SQL editor or the API using an authenticated session for each user. Each user should only see the rows they own.

## 4. Seed data (optional)
If you want fresh demo content for a newly created user, the seed script automatically assigns ownership to the first Supabase user:

```sql
\i scripts/002_seed_sample_data.sql
```

The script skips seeding if the user already has students.
