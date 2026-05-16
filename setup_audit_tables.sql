-- ACRO AMS: AUDIT & RECOVERY SETUP SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Create deleted_attendance table (Recycle Bin)
CREATE TABLE IF NOT EXISTS public.deleted_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    student_id TEXT NOT NULL,
    subject_id TEXT,
    branch_id TEXT NOT NULL,
    batch_id TEXT NOT NULL,
    is_present BOOLEAN NOT NULL,
    marked_by TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    lecture_slot INTEGER,
    reason TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create audit_logs table (Admin Activity Trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    performed_by TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.deleted_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for deleted_attendance
DROP POLICY IF EXISTS "Faculty can view deleted attendance" ON public.deleted_attendance;
CREATE POLICY "Faculty can view deleted attendance" 
ON public.deleted_attendance FOR SELECT 
USING (
    auth.uid()::text IN (SELECT id::text FROM public.profiles WHERE role = 'FACULTY' OR role = 'ADMIN' OR role = 'DEVELOPER')
);

DROP POLICY IF EXISTS "Faculty can backup to recycle bin" ON public.deleted_attendance;
CREATE POLICY "Faculty can backup to recycle bin" 
ON public.deleted_attendance FOR INSERT 
WITH CHECK (
    auth.uid()::text IN (SELECT id::text FROM public.profiles WHERE role = 'FACULTY' OR role = 'ADMIN' OR role = 'DEVELOPER')
);

DROP POLICY IF EXISTS "Faculty can restore from recycle bin" ON public.deleted_attendance;
CREATE POLICY "Faculty can restore from recycle bin" 
ON public.deleted_attendance FOR DELETE 
USING (
    auth.uid()::text IN (SELECT id::text FROM public.profiles WHERE role = 'FACULTY' OR role = 'ADMIN' OR role = 'DEVELOPER')
);

-- 5. RLS Policies for audit_logs
DROP POLICY IF EXISTS "Admins/Devs can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins/Devs can view audit logs" 
ON public.audit_logs FOR SELECT 
USING (
    auth.uid()::text IN (SELECT id::text FROM public.profiles WHERE role = 'ADMIN' OR role = 'DEVELOPER')
);

DROP POLICY IF EXISTS "Authenticated users can create logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can create logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated'
);

-- 6. Grant Permissions (Ensure public schema is accessible)
GRANT ALL ON public.deleted_attendance TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated;

-- 7. Indexing for performance
CREATE INDEX IF NOT EXISTS idx_deleted_att_branch ON public.deleted_attendance(branch_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
