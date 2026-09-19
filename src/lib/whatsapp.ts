/**
 * Onward WhatsApp Gateway Service
 * Supports Fonnte API as primary gateway with fallback to simulation/mock.
 */

export function normalizeIndonesianPhone(phone: string): string {
  if (!phone) return '';
  // Remove spaces, hyphens, parentheses, plus
  let cleaned = phone.replace(/[^0-9+]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Convert 08xx to 628xx
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }

  // If starts with 8, prepend 62
  if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }

  return cleaned;
}

export interface SendWhatsAppResult {
  success: boolean;
  messageId?: string;
  detail?: string;
  error?: string;
  simulated?: boolean;
}

export async function sendWhatsAppMessage({
  to,
  message,
}: {
  to: string;
  message: string;
}): Promise<SendWhatsAppResult> {
  const normalizedPhone = normalizeIndonesianPhone(to);

  if (!normalizedPhone || normalizedPhone.length < 9) {
    return {
      success: false,
      error: 'Nomor WhatsApp tidak valid. Gunakan format contoh: 081234567890 atau 6281234567890',
    };
  }

  const fonnteToken = process.env.FONNTE_TOKEN;

  // 1. Primary: Fonnte Gateway
  if (fonnteToken && fonnteToken.trim() !== '') {
    try {
      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': fonnteToken.trim(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          target: normalizedPhone,
          message: message,
          countryCode: '62',
        }),
      });

      const data = await response.json();

      if (data && (data.status === true || data.status === 'true')) {
        return {
          success: true,
          messageId: Array.isArray(data.id) ? data.id[0] : data.id || 'FONNTE_' + Date.now(),
          detail: data.detail || 'Pesan WhatsApp berhasil dikirim.',
        };
      } else {
        const errMsg = data?.reason || data?.message || 'Gagal mengirim pesan melalui Fonnte API';
        console.warn('Fonnte API warning:', errMsg);
        return {
          success: false,
          error: errMsg,
        };
      }
    } catch (err: any) {
      console.error('Fonnte API network error:', err);
      return {
        success: false,
        error: err.message || 'Terjadi kesalahan jaringan saat memanggil Fonnte API',
      };
    }
  }

  // 2. Fallback: Mock / Simulation mode (if token is not configured)
  console.log(`[WhatsApp Mock Simulation] To: ${normalizedPhone}\nMessage: ${message}`);
  return {
    success: true,
    simulated: true,
    messageId: 'MOCK_' + Date.now(),
    detail: 'Pesan disimulasikan (FONNTE_TOKEN belum diisi).',
  };
}
