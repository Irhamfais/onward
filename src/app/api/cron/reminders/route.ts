import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

function formatReadableDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date) + ' WIB';
  } catch {
    return date.toISOString();
  }
}

async function executeReminderEngine(request: Request) {
  try {
    // 1. Validasi Keamanan: Authorization Header dengan CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const configuredSecret = process.env.CRON_SECRET;

    if (configuredSecret && configuredSecret.trim() !== '') {
      const expectedAuth = `Bearer ${configuredSecret.trim()}`;
      if (authHeader !== expectedAuth) {
        return NextResponse.json(
          { 
            status: 'unauthorized', 
            message: 'Invalid or missing Authorization Bearer token' 
          }, 
          { status: 401 }
        );
      }
    } else {
      console.warn('Cron: CRON_SECRET is not configured in environment variables. Running in open-dev mode.');
    }

    // Ekstrak optional payload body dari pg_cron / caller jika ada
    let requestSource = 'vercel_cron';
    try {
      if (request.method === 'POST') {
        const body = await request.json();
        if (body?.source) {
          requestSource = body.source;
        }
      }
    } catch {}

    const supabase = createClient();
    const now = new Date();

    // WIB Date Strings (Asia/Jakarta)
    const wibDateFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const todayWIBStr = wibDateFormatter.format(now);
    const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowWIBStr = wibDateFormatter.format(tomorrowDate);

    // 2. Ambil data pengingat dari RPC SECURITY DEFINER
    const { data: payload, error: rpcError } = await supabase.rpc('get_pending_reminders_payload');

    if (rpcError) {
      console.error('Cron: Error calling get_pending_reminders_payload RPC:', rpcError.message);
      return NextResponse.json(
        {
          status: 'error',
          error: rpcError.message,
          hint: 'Pastikan Anda telah menjalankan migrasi supabase/migrations/20260920_notification_logs.sql di Supabase SQL Editor.',
        },
        { status: 500 }
      );
    }

    const users = payload?.users || [];
    let sentCount = 0;
    let skippedCount = 0;
    const processLogs: Array<{
      userId: string;
      phone: string;
      type: string;
      title: string;
      status: 'SENT' | 'FAILED' | 'SKIPPED';
      reason?: string;
    }> = [];

    // 3. Iterasi setiap pengguna yang telah terverifikasi WhatsApp
    for (const u of users) {
      const userId = u.user_id;
      const userName = u.name || 'Mahasiswa';
      const userPhone = u.phone_wa;
      const userPrefs = u.preferences || {};
      const tasks = u.tasks || [];
      const meetings = u.meetings || [];
      const recentLogs = u.recent_logs || [];

      // Flag preferensi pengguna (default true jika belum disetel)
      const prefH1 = userPrefs.waH1 ?? true;
      const prefToday = userPrefs.waToday ?? true;
      const prefMeeting2H = userPrefs.waMeeting2Hours ?? true;

      // ===================================================================
      // A. EVALUASI TUGAS (H-1 & H-0 DEADLINE)
      // ===================================================================
      for (const t of tasks) {
        if (!t.deadline) continue;
        const taskDeadline = new Date(t.deadline);
        const taskDeadlineDateStr = wibDateFormatter.format(taskDeadline);
        const formattedDeadline = formatReadableDate(taskDeadline);

        // Kasus 1: Deadline Hari Ini (H-0)
        if (taskDeadlineDateStr === todayWIBStr) {
          if (!prefToday) {
            skippedCount++;
            continue;
          }

          const alreadySent = recentLogs.some(
            (log: any) =>
              log.reference_id === String(t.id) &&
              log.notification_type === 'TASK_DEADLINE_TODAY'
          );

          if (alreadySent) {
            skippedCount++;
            continue;
          }

          const message = 
`⚡ *Perhatian: Deadline Tugas Hari Ini!*

Halo *${userName}*, tugas berikut jatuh tempo *hari ini*:

📝 *${t.title}*
📂 Kategori: ${t.category} (${t.parent_title || '-'})
⏰ Deadline: ${formattedDeadline}

Yuk selesaikan sebelum tenggat waktu berakhir! 💪`;

          const sendResult = await sendWhatsAppMessage({
            to: userPhone,
            message,
          });

          if (sendResult.success) {
            sentCount++;
            processLogs.push({
              userId,
              phone: userPhone,
              type: 'TASK_DEADLINE_TODAY',
              title: t.title,
              status: 'SENT',
            });

            await supabase.rpc('record_notification_log', {
              p_user_id: userId,
              p_notification_type: 'TASK_DEADLINE_TODAY',
              p_reference_id: String(t.id),
              p_recipient_phone: userPhone,
              p_status: 'SENT',
              p_details: { title: t.title, category: t.category },
            });
          } else {
            processLogs.push({
              userId,
              phone: userPhone,
              type: 'TASK_DEADLINE_TODAY',
              title: t.title,
              status: 'FAILED',
              reason: sendResult.error,
            });
          }
        }

        // Kasus 2: Deadline Besok (H-1)
        else if (taskDeadlineDateStr === tomorrowWIBStr) {
          if (!prefH1) {
            skippedCount++;
            continue;
          }

          const alreadySent = recentLogs.some(
            (log: any) =>
              log.reference_id === String(t.id) &&
              log.notification_type === 'TASK_DEADLINE_H1'
          );

          if (alreadySent) {
            skippedCount++;
            continue;
          }

          const message = 
`🔔 *Pengingat Tugas Onward (H-1)*

Halo *${userName}*, ada tugas yang akan jatuh tempo *besok*:

📝 *${t.title}*
📂 Kategori: ${t.category} (${t.parent_title || '-'})
⏰ Deadline: ${formattedDeadline}

Semangat menyelesaikan tugasnya, jangan lupa periksa checklist di Onward! 🚀`;

          const sendResult = await sendWhatsAppMessage({
            to: userPhone,
            message,
          });

          if (sendResult.success) {
            sentCount++;
            processLogs.push({
              userId,
              phone: userPhone,
              type: 'TASK_DEADLINE_H1',
              title: t.title,
              status: 'SENT',
            });

            await supabase.rpc('record_notification_log', {
              p_user_id: userId,
              p_notification_type: 'TASK_DEADLINE_H1',
              p_reference_id: String(t.id),
              p_recipient_phone: userPhone,
              p_status: 'SENT',
              p_details: { title: t.title, category: t.category },
            });
          } else {
            processLogs.push({
              userId,
              phone: userPhone,
              type: 'TASK_DEADLINE_H1',
              title: t.title,
              status: 'FAILED',
              reason: sendResult.error,
            });
          }
        }
      }

      // ===================================================================
      // B. EVALUASI RAPAT KEPANITIAAN (TOLERANSI WINDOW ~2 JAM SEBELUM RAPAT)
      // ===================================================================
      if (prefMeeting2H) {
        for (const m of meetings) {
          if (!m.meeting_date || !m.start_time) continue;

          // Parse meeting datetime di WIB (UTC+7)
          const [year, month, day] = m.meeting_date.split('-').map(Number);
          const [hour, minute] = m.start_time.split(':').map(Number);
          // Jam UTC = Jam WIB - 7
          const meetingDateUTC = new Date(Date.UTC(year, month - 1, day, hour - 7, minute));

          // Selisih dalam menit antara jadwal rapat dan waktu saat ini
          const diffMinutes = (meetingDateUTC.getTime() - now.getTime()) / (1000 * 60);

          // Toleransi window: 90 s.d. 150 menit (sekitar 1,5 hingga 2,5 jam sebelum rapat)
          if (diffMinutes >= 90 && diffMinutes <= 150) {
            const alreadySent = recentLogs.some(
              (log: any) =>
                log.reference_id === String(m.id) &&
                log.notification_type === 'MEETING_2H'
            );

            if (alreadySent) {
              skippedCount++;
              continue;
            }

            const cleanStartTime = m.start_time.slice(0, 5);
            const message = 
`📢 *Pengingat Rapat Kepanitiaan (2 Jam Lagi)*

Halo *${userName}*, rapat kepanitiaan Anda akan segera dimulai:

📌 Agenda: *${m.title}*
🏛️ Organisasi/Event: *${m.organization_name || '-'}*
⏰ Waktu: *${cleanStartTime} WIB* (kurang lebih 2 jam lagi)
📍 Lokasi / Link: *${m.location || 'Online'}*

Persiapkan materi Anda dan hadir tepat waktu ya! 🤝`;

            const sendResult = await sendWhatsAppMessage({
              to: userPhone,
              message,
            });

            if (sendResult.success) {
              sentCount++;
              processLogs.push({
                userId,
                phone: userPhone,
                type: 'MEETING_2H',
                title: m.title,
                status: 'SENT',
              });

              await supabase.rpc('record_notification_log', {
                p_user_id: userId,
                p_notification_type: 'MEETING_2H',
                p_reference_id: String(m.id),
                p_recipient_phone: userPhone,
                p_status: 'SENT',
                p_details: { title: m.title, organization: m.organization_name },
              });
            } else {
              processLogs.push({
                userId,
                phone: userPhone,
                type: 'MEETING_2H',
                title: m.title,
                status: 'FAILED',
                reason: sendResult.error,
              });
            }
          }
        }
      }
    }

    return NextResponse.json({
      status: 'ok',
      source: requestSource,
      timestamp: now.toISOString(),
      verifiedUsersCount: users.length,
      notificationsSent: sentCount,
      notificationsSkipped: skippedCount,
      logs: processLogs,
    });
  } catch (err: any) {
    console.error('Cron reminder fatal error:', err);
    return NextResponse.json(
      { status: 'error', error: err?.message || 'Unknown server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return executeReminderEngine(request);
}

export async function POST(request: Request) {
  return executeReminderEngine(request);
}
