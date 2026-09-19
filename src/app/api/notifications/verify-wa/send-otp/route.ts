import { NextResponse } from 'next/server';
import { normalizeIndonesianPhone, sendWhatsAppMessage } from '@/lib/whatsapp';
import { generateOTP, saveOTP } from '@/lib/otp-store';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Nomor WhatsApp wajib diisi.' },
        { status: 400 }
      );
    }

    const normalized = normalizeIndonesianPhone(phone);
    if (!normalized || normalized.length < 9) {
      return NextResponse.json(
        { success: false, error: 'Format nomor WhatsApp tidak valid. Contoh: 081234567890' },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    const saveResult = saveOTP(normalized, otp);

    if (!saveResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Tunggu ${saveResult.cooldownRemaining} detik sebelum meminta kode OTP kembali.`,
        },
        { status: 429 }
      );
    }

    const message = `*KODE VERIFIKASI ONWARD*\n\nHalo Mahasiswa Onward! 👋\n\nKode verifikasi WhatsApp Anda adalah:\n👉 *${otp}*\n\nKode ini berlaku selama 5 menit. Masukkan kode ini pada aplikasi Onward untuk mengaktifkan pengingat jadwal kuliah, lomba, dan rapat Anda.\n\n_Jangan berikan kode ini kepada orang lain._`;

    const sendResult = await sendWhatsAppMessage({
      to: normalized,
      message,
    });

    if (!sendResult.success) {
      return NextResponse.json(
        { success: false, error: sendResult.error || 'Gagal mengirim pesan OTP WhatsApp.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kode OTP berhasil dikirim ke nomor WhatsApp Anda!',
      simulated: sendResult.simulated,
      demoOtp: sendResult.simulated ? otp : undefined,
    });
  } catch (err: any) {
    console.error('Send OTP error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Terjadi kesalahan pada server saat mengirim OTP.' },
      { status: 500 }
    );
  }
}
