/*
          # [Initial Schema Setup]
          This script sets up the initial database schema for the MeetingAI application. It includes tables for user profiles and meetings, enables Row Level Security, and creates policies to ensure users can only access their own data. It also includes a trigger to automatically create a user profile upon new user registration.

          ## Query Description:
          This is a structural operation that creates new tables and security policies. It is safe to run on a new database but should be reviewed carefully if you have existing data. It does not delete any data but does restrict access by enabling RLS. Ensure you have a database backup if you are modifying an existing schema.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Medium"
          - Requires-Backup: true
          - Reversible: false

          ## Structure Details:
          - Tables Created: `profiles`, `meetings`
          - Functions Created: `public.handle_new_user`
          - Triggers Created: `on_auth_user_created` on `auth.users`
          - RLS Policies: Enabled for `profiles` and `meetings` with user-specific access rules.

          ## Security Implications:
          - RLS Status: Enabled on `profiles` and `meetings`.
          - Policy Changes: Yes. New policies are created to restrict data access to the data owner.
          - Auth Requirements: Policies are based on `auth.uid()`.

          ## Performance Impact:
          - Indexes: Primary key and foreign key indexes are created automatically.
          - Triggers: A trigger is added to `auth.users` which runs once per user creation. The performance impact is negligible.
          - Estimated Impact: Low.
          */

-- 1. PROFILES TABLE
-- Stores public-facing user information.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  email text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 2. MEETINGS TABLE
-- Stores all meeting-related data.
CREATE TABLE IF NOT EXISTS public.meetings (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  title text NOT NULL,
  transcription_text text,
  summary jsonb,
  translation jsonb,
  status text DEFAULT 'processing',
  duration_seconds integer,
  file_type text,
  PRIMARY KEY (id)
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meetings."
ON public.meetings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meetings."
ON public.meetings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meetings."
ON public.meetings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meetings."
ON public.meetings FOR DELETE
USING (auth.uid() = user_id);


-- 3. TRIGGER FOR NEW USER PROFILES
-- This function is called when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );
  RETURN new;
END;
$$;

-- This trigger calls the function when a new user is created.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
