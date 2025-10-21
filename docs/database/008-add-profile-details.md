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

