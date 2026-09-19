import { NextResponse } from 'next/server';
import { normalizeIndonesianPhone, sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(req: Request) {
  try {
    const { phone, message, name } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Nomor WhatsApp tujuan wajib diisi.' },
        { status: 400 }
      );
    }

    const normalized = normalizeIndonesianPhone(phone);
    const recipientName = name || 'Mahasiswa Onward';

    const text =
      message ||
      `🔔 *UJI COBA NOTIFIKASI ONWARD*

Halo ${recipientName}! 👋
Integrasi *WhatsApp Gateway (Fonnte)* Anda telah berhasil terhubung dan *AKTIF*.

Layanan ini siap mengirimkan pengingat otomatis ke WhatsApp Anda:
• 📌 *H-3* Tenggat pengumpulan tugas kuliah & lomba
• ⚠️ *H-1* Peringatan batas waktu mendesak
• 👥 *2 Jam* Sebelum jadwal rapat kepanitiaan dimulai

Selamat belajar dan raih prestasi maksimal bersama Onward! ✨`;

    const result = await sendWhatsAppMessage({
      to: normalized,
      message: text,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Gagal mengirim pesan WhatsApp.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pesan notifikasi WhatsApp berhasil dikirim!',
      messageId: result.messageId,
      detail: result.detail,
    });
  } catch (err: any) {
    console.error('Send WhatsApp error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Terjadi kesalahan saat memproses pengiriman.' },
      { status: 500 }
    );
  }
}
