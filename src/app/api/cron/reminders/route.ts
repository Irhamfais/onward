import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWhatsAppMessage, normalizeIndonesianPhone } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();

    // Scan profiles with verified WhatsApp
    const { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('id, name, phone_wa, is_wa_verified')
      .eq('is_wa_verified', true);

    if (profileErr) {
      console.warn('Cron: Could not fetch profiles:', profileErr.message);
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Reminder cron executed successfully',
      verifiedUsersCount: profiles?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Cron reminder error:', err);
    return NextResponse.json({ status: 'error', error: err.message }, { status: 500 });
  }
}
