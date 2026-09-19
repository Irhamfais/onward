/**
 * In-memory OTP Store for WhatsApp verification
 * Persisted on global in Node.js for hot-reloads during development.
 */

interface OtpEntry {
  otp: string;
  expiresAt: number;
  lastRequestedAt: number;
  attempts: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __onward_otp_store__: Map<string, OtpEntry> | undefined;
}

const otpStore: Map<string, OtpEntry> =
  global.__onward_otp_store__ || (global.__onward_otp_store__ = new Map());

export function generateOTP(): string {
  // Generate cryptographically or random 6-digit number
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function saveOTP(phone: string, otp: string): { success: boolean; cooldownRemaining?: number } {
  const now = Date.now();
  const existing = otpStore.get(phone);

  // 60-second cooldown
  if (existing && now - existing.lastRequestedAt < 60 * 1000) {
    const remaining = Math.ceil((60 * 1000 - (now - existing.lastRequestedAt)) / 1000);
    return { success: false, cooldownRemaining: remaining };
  }

  otpStore.set(phone, {
    otp,
    expiresAt: now + 5 * 60 * 1000, // 5 minutes expiry
    lastRequestedAt: now,
    attempts: 0,
  });

  return { success: true };
}

export function verifyOTP(
  phone: string,
  inputOtp: string
): { success: boolean; error?: string } {
  const entry = otpStore.get(phone);
  const now = Date.now();

  if (!entry) {
    return {
      success: false,
      error: 'Kode OTP tidak ditemukan atau belum diminta. Silakan minta kode OTP baru.',
    };
  }

  if (now > entry.expiresAt) {
    otpStore.delete(phone);
    return {
      success: false,
      error: 'Kode OTP telah kedaluwarsa. Silakan minta kode OTP baru.',
    };
  }

  if (entry.attempts >= 5) {
    otpStore.delete(phone);
    return {
      success: false,
      error: 'Terlalu banyak percobaan salah. Silakan minta kode OTP baru.',
    };
  }

  if (entry.otp !== inputOtp.trim()) {
    entry.attempts += 1;
    return {
      success: false,
      error: `Kode OTP salah. Sisa kesempatan: ${5 - entry.attempts} kali.`,
    };
  }

  // OTP verified successfully
  otpStore.delete(phone);
  return { success: true };
}
