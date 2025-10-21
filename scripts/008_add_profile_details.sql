-- Add age and country to the profiles table for richer tutor metadata
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS country text;

-- Backfill the new columns from the latest auth metadata when available
UPDATE public.profiles AS p
SET
  age = NULLIF(u.raw_user_meta_data ->> 'age', '')::integer,
  country = u.raw_user_meta_data ->> 'country',
  updated_at = now()
FROM auth.users AS u
WHERE p.id = u.id;

-- Ensure new signups keep the profile table in sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, age, country)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    NULLIF(new.raw_user_meta_data ->> 'age', '')::integer,
    new.raw_user_meta_data ->> 'country'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = excluded.email,
    full_name = excluded.full_name,
    age = excluded.age,
    country = excluded.country,
    updated_at = now();

  RETURN new;
END;
$$;
