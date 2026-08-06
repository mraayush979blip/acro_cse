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

-- Enable RLS to clear security warnings
ALTER TABLE public.whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordinators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deleted_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies to apply strict ones safely
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.whitelist;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.branches;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.batches;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.subjects;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.assignments;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.coordinators;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.attendance;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.marks;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.system_settings;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.deleted_attendance;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.audit_logs;

-- 1. Read-Only Reference Tables
CREATE POLICY "All authenticated users can read whitelist" ON public.whitelist FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only Admins and Developers can modify whitelist" ON public.whitelist FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DEVELOPER')));

CREATE POLICY "All authenticated users can read branches" ON public.branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only Admins and Developers can modify branches" ON public.branches FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DEVELOPER')));

CREATE POLICY "All authenticated users can read batches" ON public.batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only Admins and Developers can modify batches" ON public.batches FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DEVELOPER')));

CREATE POLICY "All authenticated users can read subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only Admins and Developers can modify subjects" ON public.subjects FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DEVELOPER')));

-- 2. Profiles Table
CREATE POLICY "All authenticated users can read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING ( (auth.jwt() ->> 'email') IN (SELECT email FROM public.whitelist WHERE role IN ('ADMIN', 'DEVELOPER')) );
CREATE POLICY "Only Admins can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK ( (auth.jwt() ->> 'email') IN (SELECT email FROM public.whitelist WHERE role IN ('ADMIN', 'DEVELOPER')) );
CREATE POLICY "Only Admins can delete profiles" ON public.profiles FOR DELETE TO authenticated USING ( (auth.jwt() ->> 'email') IN (SELECT email FROM public.whitelist WHERE role IN ('ADMIN', 'DEVELOPER')) );

-- 3. Sensitive Data Tables
CREATE POLICY "Students read own attendance, others read all" ON public.attendance FOR SELECT TO authenticated USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('FACULTY', 'COORDINATOR', 'ADMIN', 'DEVELOPER')));
CREATE POLICY "Only Staff can modify attendance" ON public.attendance FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('FACULTY', 'COORDINATOR', 'ADMIN', 'DEVELOPER')));

CREATE POLICY "Students read own marks, others read all" ON public.marks FOR SELECT TO authenticated USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('FACULTY', 'COORDINATOR', 'ADMIN', 'DEVELOPER')));
CREATE POLICY "Only Staff can modify marks" ON public.marks FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('FACULTY', 'COORDINATOR', 'ADMIN', 'DEVELOPER')));

-- 4. Internal/Admin Tables
CREATE POLICY "Staff read/write assignments" ON public.assignments FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('FACULTY', 'COORDINATOR', 'ADMIN', 'DEVELOPER')));
CREATE POLICY "Staff read/write coordinators" ON public.coordinators FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('FACULTY', 'COORDINATOR', 'ADMIN', 'DEVELOPER')));
CREATE POLICY "Users read/write own notifications, admins read/write all" ON public.notifications FOR ALL TO authenticated USING (to_user_id = auth.uid() OR from_user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('FACULTY', 'COORDINATOR', 'ADMIN', 'DEVELOPER')));
CREATE POLICY "All users can read system_settings" ON public.system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can modify system_settings" ON public.system_settings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DEVELOPER')));
CREATE POLICY "Staff read/write deleted_attendance" ON public.deleted_attendance FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('FACULTY', 'COORDINATOR', 'ADMIN', 'DEVELOPER')));
CREATE POLICY "Admins read/write audit_logs" ON public.audit_logs FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DEVELOPER')));

-- Fix Performance Warnings (Create Indexes for Foreign Keys)
CREATE INDEX IF NOT EXISTS idx_batches_branch_id ON public.batches(branch_id);

CREATE INDEX IF NOT EXISTS idx_profiles_branch_id ON public.profiles(branch_id);

CREATE INDEX IF NOT EXISTS idx_assignments_faculty_id ON public.assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_assignments_branch_id ON public.assignments(branch_id);
CREATE INDEX IF NOT EXISTS idx_assignments_subject_id ON public.assignments(subject_id);

CREATE INDEX IF NOT EXISTS idx_coordinators_faculty_id ON public.coordinators(faculty_id);
CREATE INDEX IF NOT EXISTS idx_coordinators_branch_id ON public.coordinators(branch_id);

CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_subject_id ON public.attendance(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_branch_id ON public.attendance(branch_id);
CREATE INDEX IF NOT EXISTS idx_attendance_marked_by ON public.attendance(marked_by);

CREATE INDEX IF NOT EXISTS idx_marks_student_id ON public.marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_subject_id ON public.marks(subject_id);
CREATE INDEX IF NOT EXISTS idx_marks_faculty_id ON public.marks(faculty_id);

CREATE INDEX IF NOT EXISTS idx_notifications_to_user_id ON public.notifications(to_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_from_user_id ON public.notifications(from_user_id);

CREATE INDEX IF NOT EXISTS idx_deleted_attendance_student_id ON public.deleted_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_deleted_attendance_subject_id ON public.deleted_attendance(subject_id);
CREATE INDEX IF NOT EXISTS idx_deleted_attendance_branch_id ON public.deleted_attendance(branch_id);
CREATE INDEX IF NOT EXISTS idx_deleted_attendance_marked_by ON public.deleted_attendance(marked_by);
CREATE INDEX IF NOT EXISTS idx_deleted_attendance_deleted_by ON public.deleted_attendance(deleted_by);

CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON public.audit_logs(performed_by);
