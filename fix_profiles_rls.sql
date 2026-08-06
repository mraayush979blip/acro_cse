-- Drop the recursive policies on profiles
DROP POLICY IF EXISTS "Users can update their own profile or admins can update all" ON public.profiles;
DROP POLICY IF EXISTS "Only Admins can insert/delete profiles" ON public.profiles;

-- Recreate them specifically for INSERT, UPDATE, and DELETE to prevent infinite recursion on SELECT
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- For Admins, using auth.jwt() to prevent querying the profiles table itself
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING ( (auth.jwt() ->> 'email') IN (SELECT email FROM public.whitelist WHERE role IN ('ADMIN', 'DEVELOPER')) );

CREATE POLICY "Only Admins can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK ( (auth.jwt() ->> 'email') IN (SELECT email FROM public.whitelist WHERE role IN ('ADMIN', 'DEVELOPER')) );

CREATE POLICY "Only Admins can delete profiles" ON public.profiles FOR DELETE TO authenticated USING ( (auth.jwt() ->> 'email') IN (SELECT email FROM public.whitelist WHERE role IN ('ADMIN', 'DEVELOPER')) );
