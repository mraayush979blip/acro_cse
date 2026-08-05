-- ACRO AMS: 4th YEAR DATABASE SETUP SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR TO INITIALIZE THE 4TH YEAR PROJECT

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Whitelist Table
CREATE TABLE IF NOT EXISTS public.whitelist (
    email TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Branches Table
CREATE TABLE IF NOT EXISTS public.branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    view_only BOOLEAN DEFAULT false
);

-- 3. Batches Table
CREATE TABLE IF NOT EXISTS public.batches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE
);

-- 4. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT
);

-- 5. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    role TEXT NOT NULL,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    batch_id TEXT,
    enrollment_id TEXT,
    roll_no TEXT,
    mobile_no TEXT,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 6. Faculty Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
    id TEXT PRIMARY KEY,
    faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    batch_id TEXT NOT NULL,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE
);

-- 7. Coordinator Assignments Table
CREATE TABLE IF NOT EXISTS public.coordinators (
    id TEXT PRIMARY KEY,
    faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE
);

-- 8. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    batch_id TEXT NOT NULL,
    is_present BOOLEAN NOT NULL,
    marked_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    timestamp BIGINT NOT NULL,
    lecture_slot INTEGER,
    reason TEXT
);

-- 9. Marks Table
CREATE TABLE IF NOT EXISTS public.marks (
    id TEXT PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mid_sem_type TEXT NOT NULL,
    marks_obtained REAL NOT NULL,
    max_marks REAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    from_user_name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    data JSONB,
    timestamp BIGINT NOT NULL
);

-- 11. System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id TEXT PRIMARY KEY,
    student_login_enabled BOOLEAN DEFAULT true
);

-- Insert default system settings
INSERT INTO public.system_settings (id, student_login_enabled) VALUES ('default', true) ON CONFLICT DO NOTHING;

-- 12. Deleted Attendance (Recycle Bin)
CREATE TABLE IF NOT EXISTS public.deleted_attendance (
    id TEXT PRIMARY KEY, 
    date DATE NOT NULL,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
    branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    batch_id TEXT NOT NULL,
    is_present BOOLEAN NOT NULL,
    marked_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    deleted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    timestamp BIGINT NOT NULL,
    lecture_slot INTEGER,
    reason TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS for ease of use (Since the app doesn't seem to heavily rely on strict RLS for normal operation, or if it does, it can be added later)
-- Note: It is recommended to enable RLS and set appropriate policies for production.
ALTER TABLE public.whitelist DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordinators DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings DISABLE ROW LEVEL SECURITY;

-- If RLS was explicitly used in original setup, please configure policies as required.
