import { NextResponse } from 'next/server';
import { normalizeIndonesianPhone } from '@/lib/whatsapp';
import { verifyOTP } from '@/lib/otp-store';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { phone, otp, userId } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: 'Nomor telepon dan kode OTP wajib diisi.' },
        { status: 400 }
      );
    }

    const normalized = normalizeIndonesianPhone(phone);
    const verification = verifyOTP(normalized, otp);

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Kode OTP tidak valid.' },
        { status: 400 }
      );
    }

    // Optional: update Supabase profile if userId or session exists
    try {
      const supabase = createClient();
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;

      if (targetUserId) {
        await supabase
          .from('profiles')
          .update({
            phone_wa: normalized,
            is_wa_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetUserId);
      }
    } catch (dbErr) {
      console.warn('Could not sync verification to database (continuing with local verification):', dbErr);
    }

    return NextResponse.json({
      success: true,
      verified: true,
      phone: normalized,
      message: 'Nomor WhatsApp berhasil diverifikasi!',
    });
  } catch (err: any) {
    console.error('Verify OTP error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Terjadi kesalahan saat memverifikasi OTP.' },
      { status: 500 }
    );
  }
}
