# Capture tutor demographics in profiles

Collecting a tutor's name, age, and country now enriches both the sign-up flow and profile management screens. Apply the
following database changes so the Supabase schema stays in sync.

## 1. Run the migration script

Execute the new helper script from the Supabase SQL editor or the `psql` CLI:

```sql
\i scripts/008_add_profile_details.sql
```

This script performs three actions:

1. Adds `age` and `country` columns to `public.profiles`.
2. Backfills the columns using the current values stored in `auth.users.raw_user_meta_data`.
3. Replaces the `public.handle_new_user` trigger function so that future sign ups keep the profile record updated.

## 2. Verify the trigger

After the script runs, confirm that `public.handle_new_user` contains the additional insert columns and `ON CONFLICT` update.
You can inspect the function with:

```sql
SELECT pg_get_functiondef('public.handle_new_user'::regprocedure);
```

Any new user created through the application should now populate the profile record with name, age, and country.

## 3. Manually backfill existing tutors

If a tutor signed up before you collected the new metadata, update both the `auth.users` record and the corresponding
`public.profiles` row so the application sees consistent values. The following snippet shows how to backfill the tutor you
mentioned:

```sql
-- Enrich the Supabase auth metadata
UPDATE auth.users
SET
  raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
    'full_name', 'Martí Carrasco',
    'age', 18,
    'country', 'Spain'
  ),
  updated_at = now()
WHERE id = '91a82c59-ec3a-4d9a-80e4-137d9fe71682';

-- Mirror the same data to the public profile
UPDATE public.profiles
SET
  full_name = 'Martí Carrasco',
  age = 18,
  country = 'Spain',
  updated_at = now()
WHERE id = '91a82c59-ec3a-4d9a-80e4-137d9fe71682';
```

Repeat the pattern for any other legacy tutors—just change the `id` and demographic values to match each account.

