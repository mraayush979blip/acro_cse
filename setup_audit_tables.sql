-- ACRO AMS: AUDIT & RECOVERY SETUP SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Drop existing tables to clean up type mismatches if necessary
-- DROP TABLE IF EXISTS public.deleted_attendance;
-- DROP TABLE IF EXISTS public.audit_logs;

-- 2. Create deleted_attendance table (Recycle Bin)
-- We use TEXT for 'id' because the app generates 'att_...' strings
CREATE TABLE IF NOT EXISTS public.deleted_attendance (
    id TEXT PRIMARY KEY, 
    date DATE NOT NULL,
    student_id UUID NOT NULL REFERENCES public.profiles(id),
    subject_id TEXT REFERENCES public.subjects(id),
    branch_id TEXT NOT NULL REFERENCES public.branches(id),
    batch_id TEXT NOT NULL,
    is_present BOOLEAN NOT NULL,
    marked_by UUID NOT NULL REFERENCES public.profiles(id),
    deleted_by UUID NOT NULL REFERENCES public.profiles(id),
    timestamp BIGINT NOT NULL,
    lecture_slot INTEGER,
    reason TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create audit_logs table (Admin Activity Trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.deleted_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Only the teacher who deleted the record can see it in their recycle bin
-- Admin/Dev can see everything
DROP POLICY IF EXISTS "Access deleted_attendance" ON public.deleted_attendance;
CREATE POLICY "Access deleted_attendance" 
ON public.deleted_attendance FOR ALL 
USING (
    auth.uid() = deleted_by 
    OR 
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('ADMIN', 'DEVELOPER'))
);

DROP POLICY IF EXISTS "Admin access to audit_logs" ON public.audit_logs;
CREATE POLICY "Admin access to audit_logs" 
ON public.audit_logs FOR SELECT 
USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('ADMIN', 'DEVELOPER'))
);

DROP POLICY IF EXISTS "System can create audit_logs" ON public.audit_logs;
CREATE POLICY "System can create audit_logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 6. Permissions
GRANT ALL ON public.deleted_attendance TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated;
