-- =====================================================================
-- Onward Migration: Notification Logs, Performance & Granular Cron Engine
-- File: supabase/migrations/20260920_notification_logs.sql
-- =====================================================================

-- 1. PROFILES: Tambah kolom notification_preferences jika belum ada
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS notification_preferences JSONB 
    DEFAULT '{"waH1": true, "waToday": true, "waMeeting2Hours": true}'::jsonb;

-- 2. TABEL NOTIFICATION_LOGS (Anti-Spam & Deduplikasi Pengingat)
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'TASK_DEADLINE_H1', 'TASK_DEADLINE_TODAY', 'MEETING_2H'
    reference_id VARCHAR(255) NOT NULL,    -- ID Tugas atau ID Rapat
    recipient_phone VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SENT', -- 'SENT', 'FAILED', 'SIMULATED'
    details JSONB DEFAULT '{}'::jsonb,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indeks untuk pencarian deduplikasi super cepat
CREATE INDEX IF NOT EXISTS idx_notif_logs_dedup 
    ON public.notification_logs(reference_id, notification_type, sent_at);

CREATE INDEX IF NOT EXISTS idx_notif_logs_user 
    ON public.notification_logs(user_id, sent_at);

-- RLS untuk notification_logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notification logs" ON public.notification_logs;
CREATE POLICY "Users can view own notification logs" 
    ON public.notification_logs FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow insertion of notification logs" ON public.notification_logs;
CREATE POLICY "Allow insertion of notification logs" 
    ON public.notification_logs FOR INSERT 
    WITH CHECK (true);

-- 3. INDEKS PERFORMA QUERY DEADLINE & RAPAT
CREATE INDEX IF NOT EXISTS idx_course_tasks_deadline 
    ON public.course_tasks(deadline, status);

CREATE INDEX IF NOT EXISTS idx_competition_tasks_deadline 
    ON public.competition_tasks(deadline, status);

CREATE INDEX IF NOT EXISTS idx_committee_tasks_deadline 
    ON public.committee_tasks(deadline, status);

CREATE INDEX IF NOT EXISTS idx_committee_meetings_datetime 
    ON public.committee_meetings(meeting_date, start_time);

-- 4. RPC: AMBIL DATA PENGINGAT (SECURITY DEFINER untuk Background Cron)
CREATE OR REPLACE FUNCTION public.get_pending_reminders_payload()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'users', COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'user_id', p.id,
                    'name', p.name,
                    'phone_wa', p.phone_wa,
                    'preferences', COALESCE(p.notification_preferences, '{"waH1": true, "waToday": true, "waMeeting2Hours": true}'::jsonb),
                    'tasks', (
                        SELECT COALESCE(
                            jsonb_agg(
                                jsonb_build_object(
                                    'id', t.id,
                                    'title', t.title,
                                    'deadline', t.deadline,
                                    'category', t.category,
                                    'parent_title', t.parent_title,
                                    'status', t.status
                                )
                            ), '[]'::jsonb
                        )
                        FROM public.unified_tasks_view t
                        WHERE t.user_id = p.id
                          AND t.status != 'SELESAI'
                          AND t.deadline >= (NOW() - INTERVAL '6 hours')
                          AND t.deadline <= (NOW() + INTERVAL '48 hours')
                    ),
                    'meetings', (
                        SELECT COALESCE(
                            jsonb_agg(
                                jsonb_build_object(
                                    'id', m.id,
                                    'title', m.title,
                                    'meeting_date', m.meeting_date,
                                    'start_time', m.start_time,
                                    'location', m.location,
                                    'organization_name', c.organization_event_name
                                )
                            ), '[]'::jsonb
                        )
                        FROM public.committee_meetings m
                        JOIN public.committees c ON m.committee_id = c.id
                        WHERE c.user_id = p.id
                          AND m.meeting_date >= (CURRENT_DATE - INTERVAL '1 day')
                          AND m.meeting_date <= (CURRENT_DATE + INTERVAL '2 days')
                    ),
                    'recent_logs', (
                        SELECT COALESCE(
                            jsonb_agg(
                                jsonb_build_object(
                                    'reference_id', nl.reference_id,
                                    'notification_type', nl.notification_type,
                                    'sent_at', nl.sent_at
                                )
                            ), '[]'::jsonb
                        )
                        FROM public.notification_logs nl
                        WHERE nl.user_id = p.id
                          AND nl.sent_at >= (NOW() - INTERVAL '36 hours')
                    )
                )
            ), '[]'::jsonb
        )
    ) INTO result
    FROM public.profiles p
    WHERE p.is_wa_verified = TRUE 
      AND p.phone_wa IS NOT NULL 
      AND length(trim(p.phone_wa)) >= 9;

    RETURN result;
END;
$$;

-- 5. RPC: RECORD NOTIFICATION LOG
CREATE OR REPLACE FUNCTION public.record_notification_log(
    p_user_id UUID,
    p_notification_type VARCHAR(50),
    p_reference_id VARCHAR(255),
    p_recipient_phone VARCHAR(50),
    p_status VARCHAR(20),
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO public.notification_logs (
        user_id,
        notification_type,
        reference_id,
        recipient_phone,
        status,
        details,
        sent_at
    )
    VALUES (
        p_user_id,
        p_notification_type,
        p_reference_id,
        p_recipient_phone,
        p_status,
        p_details,
        NOW()
    )
    RETURNING id INTO new_id;
    RETURN new_id;
END;
$$;

-- 6. PERMISSIONS UNTUK RPC
GRANT EXECUTE ON FUNCTION public.get_pending_reminders_payload() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_notification_log(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, JSONB) TO anon, authenticated, service_role;
