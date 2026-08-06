-- DANGER: THIS SCRIPT WILL COMPLETELY WIPE THE DATABASE
-- Only run this if you want to start 100% fresh with no data.

DROP TABLE IF EXISTS public.whitelist CASCADE;
DROP TABLE IF EXISTS public.branches CASCADE;
DROP TABLE IF EXISTS public.batches CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.coordinators CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.marks CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.deleted_attendance CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- Note: This does not delete auth.users (Supabase Authentication data).
-- If you want to delete test users, you must do it from the Supabase Authentication -> Users dashboard.
