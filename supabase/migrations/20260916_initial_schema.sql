-- Onward Schema Migration: Initial Relational Tables, RLS, & Unified Tasks View
-- Based on agents.md Blueprint Section 3

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_wa VARCHAR(50),
    is_wa_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SEMESTERS
CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COURSE SCHEDULES (Jadwal Kuliah)
CREATE TABLE IF NOT EXISTS public.course_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
    course_name VARCHAR(255) NOT NULL,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1: Senin, 7: Minggu
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_location VARCHAR(100) NOT NULL,
    lecturer VARCHAR(255),
    credits_sks SMALLINT DEFAULT 3,
    color_code VARCHAR(20) DEFAULT '#6C8CFF',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COURSE TASKS (Tugas Kuliah)
CREATE TYPE public.task_status AS ENUM ('BELUM_MULAI', 'SEDANG_DIKERJAKAN', 'SELESAI');

CREATE TABLE IF NOT EXISTS public.course_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.course_schedules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    status public.task_status NOT NULL DEFAULT 'BELUM_MULAI',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COMPETITIONS (Lomba)
CREATE TYPE public.competition_status AS ENUM ('MENDAFTAR', 'PROSES_PENGERJAAN', 'SUDAH_SUBMIT', 'HASIL_KELUAR');

CREATE TABLE IF NOT EXISTS public.competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    reg_deadline TIMESTAMPTZ,
    submission_deadline TIMESTAMPTZ NOT NULL,
    team_members TEXT,
    status public.competition_status NOT NULL DEFAULT 'PROSES_PENGERJAAN',
    related_links TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COMPETITION TASKS (Tugas/Milestone Lomba)
CREATE TABLE IF NOT EXISTS public.competition_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    status public.task_status NOT NULL DEFAULT 'BELUM_MULAI',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COMMITTEES (Kepanitiaan)
CREATE TABLE IF NOT EXISTS public.committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_event_name VARCHAR(255) NOT NULL,
    role_division VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COMMITTEE MEETINGS (Jadwal Rapat)
CREATE TABLE IF NOT EXISTS public.committee_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID NOT NULL REFERENCES public.committees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    meeting_date DATE NOT NULL,
    day_of_week SMALLINT,
    start_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. COMMITTEE TASKS (Job Desc / Tugas Kepanitiaan)
CREATE TABLE IF NOT EXISTS public.committee_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID NOT NULL REFERENCES public.committees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    status public.task_status NOT NULL DEFAULT 'BELUM_MULAI',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 10. UNIFIED TASKS VIEW (Query Agregasi Dashboard - Sesuai agents.md 3.3)
-- =====================================================================
CREATE OR REPLACE VIEW public.unified_tasks_view AS
SELECT 
    ct.id, 
    ct.title, 
    ct.deadline, 
    ct.status, 
    'KULIAH' AS category, 
    cs.course_name AS parent_title, 
    cs.id AS parent_id,
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
    cm.user_id,
    cmt.created_at,
    cmt.updated_at
FROM public.committee_tasks cmt
JOIN public.committees cm ON cmt.committee_id = cm.id;

-- =====================================================================
-- 11. ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_tasks ENABLE ROW LEVEL SECURITY;

-- Profiles: Only owner can read & update
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Semesters
CREATE POLICY "Users manage own semesters" ON public.semesters FOR ALL USING (auth.uid() = user_id);

-- Course schedules
CREATE POLICY "Users manage own course schedules" ON public.course_schedules FOR ALL USING (
    EXISTS (SELECT 1 FROM public.semesters s WHERE s.id = course_schedules.semester_id AND s.user_id = auth.uid())
);

-- Course tasks
CREATE POLICY "Users manage own course tasks" ON public.course_tasks FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.course_schedules cs 
        JOIN public.semesters s ON s.id = cs.semester_id 
        WHERE cs.id = course_tasks.course_id AND s.user_id = auth.uid()
    )
);

-- Competitions
CREATE POLICY "Users manage own competitions" ON public.competitions FOR ALL USING (auth.uid() = user_id);

-- Competition tasks
CREATE POLICY "Users manage own competition tasks" ON public.competition_tasks FOR ALL USING (
    EXISTS (SELECT 1 FROM public.competitions c WHERE c.id = competition_tasks.competition_id AND c.user_id = auth.uid())
);

-- Committees
CREATE POLICY "Users manage own committees" ON public.committees FOR ALL USING (auth.uid() = user_id);

-- Committee meetings
CREATE POLICY "Users manage own committee meetings" ON public.committee_meetings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.committees cm WHERE cm.id = committee_meetings.committee_id AND cm.user_id = auth.uid())
);

-- Committee tasks
CREATE POLICY "Users manage own committee tasks" ON public.committee_tasks FOR ALL USING (
    EXISTS (SELECT 1 FROM public.committees cm WHERE cm.id = committee_tasks.committee_id AND cm.user_id = auth.uid())
);
