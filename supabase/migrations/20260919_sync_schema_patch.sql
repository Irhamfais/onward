-- Onward Schema Migration Patch (Non-destructive update for existing databases)
-- Run this in Supabase SQL Editor if you have already executed the initial schema

-- 1. PROFILES: Tambah kolom major dan semester
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS major VARCHAR(100) DEFAULT 'Mahasiswa Onward',
    ADD COLUMN IF NOT EXISTS semester SMALLINT DEFAULT 1;

-- Pastikan policy INSERT ada di profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. COMPETITIONS: Tambah kolom level dan achievement
ALTER TABLE public.competitions 
    ADD COLUMN IF NOT EXISTS level VARCHAR(50) DEFAULT 'Nasional',
    ADD COLUMN IF NOT EXISTS achievement VARCHAR(255);

-- 3. COMMITTEES: Tambah kolom role
ALTER TABLE public.committees 
    ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT 'Anggota Aktif';

-- 4. TASKS: Tambah kolom notes di competition_tasks dan committee_tasks
ALTER TABLE public.competition_tasks 
    ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.committee_tasks 
    ADD COLUMN IF NOT EXISTS notes TEXT;

-- 5. Perbarui UNIFIED TASKS VIEW agar menyertakan notes
DROP VIEW IF EXISTS public.unified_tasks_view CASCADE;
CREATE OR REPLACE VIEW public.unified_tasks_view AS
SELECT 
    ct.id, 
    ct.title, 
    ct.deadline, 
    ct.status, 
    'KULIAH' AS category, 
    cs.course_name AS parent_title, 
    cs.id AS parent_id,
    ct.notes,
    s.user_id,
    ct.created_at,
    ct.updated_at
FROM public.course_tasks ct
JOIN public.course_schedules cs ON ct.course_id = cs.id
JOIN public.semesters s ON cs.semester_id = s.id

UNION ALL

SELECT 
    cpt.id, 
    cpt.title, 
    cpt.deadline, 
    cpt.status, 
    'LOMBA' AS category, 
    c.name AS parent_title, 
    c.id AS parent_id,
    cpt.notes,
    c.user_id,
    cpt.created_at,
    cpt.updated_at
FROM public.competition_tasks cpt
JOIN public.competitions c ON cpt.competition_id = c.id

UNION ALL

SELECT 
    cmt.id, 
    cmt.title, 
    cmt.deadline, 
    cmt.status, 
    'KEPANITIAAN' AS category, 
    cm.organization_event_name AS parent_title, 
    cm.id AS parent_id,
    cmt.notes,
    cm.user_id,
    cmt.created_at,
    cmt.updated_at
FROM public.committee_tasks cmt
JOIN public.committees cm ON cmt.committee_id = cm.id;

-- 6. Trigger pembuatan profil otomatis saat user mendaftar di auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, major, semester)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'major', 'Mahasiswa Onward'),
        1
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(public.profiles.name, EXCLUDED.name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
