'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { useApp } from '@/context/app-context';
import { User, Envelope, GraduationCap, CalendarBlank, WhatsappLogo, CheckCircle, WarningCircle } from '@phosphor-icons/react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile } = useApp();

  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [semester, setSemester] = useState<number>(1);
  const [phoneWa, setPhoneWa] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // WhatsApp OTP Verification states
  const [isVerifyingWa, setIsVerifyingWa] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && profile) {
      setName(profile.name || '');
      setMajor(profile.major || '');
      setSemester(profile.semester || 1);
      setPhoneWa(profile.phone_wa || '');
      setToastMessage(null);
      setIsVerifyingWa(false);
      setOtpCode('');
      setOtpError(null);
      setOtpSuccess(null);
    }
  }, [isOpen, profile]);

  // Cooldown countdown timer
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  const handleSendOtp = async () => {
    if (!phoneWa || phoneWa.trim().length < 9) {
      setOtpError('Masukkan nomor WhatsApp yang valid terlebih dahulu.');
      return;
    }

    setIsSendingOtp(true);
    setOtpError(null);
    setOtpSuccess(null);

    try {
      const res = await fetch('/api/notifications/verify-wa/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneWa.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setIsVerifyingWa(true);
        setOtpCooldown(60);
        setOtpSuccess(data.message || 'Kode OTP berhasil dikirim via WhatsApp.');
        if (data.demoOtp) {
          setOtpSuccess(`[Mode Simulasi] Kode OTP Anda: ${data.demoOtp}`);
        }
      } else {
        setOtpError(data.error || 'Gagal mengirim kode OTP.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length < 4) {
      setOtpError('Masukkan kode OTP 6 digit yang valid.');
      return;
    }

    setIsSubmittingOtp(true);
    setOtpError(null);

    try {
      const res = await fetch('/api/notifications/verify-wa/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneWa.trim(),
          otp: otpCode.trim(),
          userId: user?.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await updateProfile({
          name: name.trim() || 'Mahasiswa',
          major: major.trim() || 'Mahasiswa Onward',
          semester: Number(semester) || 1,
          phone_wa: phoneWa.trim(),
          is_wa_verified: true,
        });

        setIsVerifyingWa(false);
        setOtpSuccess('Nomor WhatsApp berhasil diverifikasi!');
        setToastMessage('Nomor WhatsApp terverifikasi & profil berhasil disimpan!');
      } else {
        setOtpError(data.error || 'Kode OTP salah atau kedaluwarsa.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Terjadi kesalahan verifikasi.');
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setToastMessage(null);

    // If user changed phone number, reset verification status
    const isPhoneChanged = profile?.phone_wa && profile.phone_wa !== phoneWa.trim();
    const isVerified = isPhoneChanged ? false : (profile?.is_wa_verified || false);

    const success = await updateProfile({
      name: name.trim() || 'Mahasiswa',
      major: major.trim() || 'Mahasiswa Onward',
      semester: Number(semester) || 1,
      phone_wa: phoneWa.trim(),
      is_wa_verified: isVerified,
    });

    setIsSaving(false);

    if (success) {
      setToastMessage('Profil berhasil diperbarui!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setToastMessage('Gagal memperbarui profil. Silakan coba lagi.');
    }
  };

  const isCurrentPhoneVerified =
    Boolean(profile?.is_wa_verified && profile?.phone_wa && profile.phone_wa === phoneWa.trim());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profil Mahasiswa"
      subtitle="Kelola data identitas akademik dan nomor kontak pengingat"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {toastMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              toastMessage.includes('berhasil') || toastMessage.includes('terverifikasi')
                ? 'bg-status-completed-tint text-status-completed border border-status-completed/20'
                : 'bg-semantic-urgent-tint text-semantic-urgent border border-semantic-urgent/20'
            }`}
          >
            {toastMessage.includes('berhasil') || toastMessage.includes('terverifikasi') ? (
              <CheckCircle size={16} weight="bold" />
            ) : (
              <WarningCircle size={16} weight="bold" />
            )}
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">Nama Lengkap</label>
          <div className="relative">
            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Alya Rahmawati"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-page-background border border-border-subtle focus:border-primary focus:bg-white focus:outline-none text-sm text-text-primary transition-all"
            />
          </div>
        </div>

        {/* Email (Read only) */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">Email Akun</label>
          <div className="relative">
            <Envelope size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <input
              type="email"
              disabled
              value={user?.email || profile?.email || ''}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-page-background/60 border border-border-subtle text-sm text-text-secondary cursor-not-allowed opacity-80"
            />
          </div>
          <span className="text-[10px] text-text-secondary/70 mt-1 block">
            Email terhubung ke akun autentikasi Supabase.
          </span>
        </div>

        {/* Major & Semester (2 cols) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Program Studi</label>
            <div className="relative">
              <GraduationCap size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="Fasilkom / SI"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-page-background border border-border-subtle focus:border-primary focus:bg-white focus:outline-none text-sm text-text-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Semester</label>
            <div className="relative">
              <CalendarBlank size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-page-background border border-border-subtle focus:border-primary focus:bg-white focus:outline-none text-sm text-text-primary transition-all"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* WhatsApp Phone Number & Verification */}
        <div className="p-3.5 rounded-2xl bg-page-background/60 border border-border-subtle flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-text-primary">Nomor WhatsApp Pengingat</label>
            {isCurrentPhoneVerified ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-completed-tint text-status-completed">
                <CheckCircle size={12} weight="bold" /> Terverifikasi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-category-lomba-tint text-[#B45309]">
                Belum Terverifikasi
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <WhatsappLogo size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#25D366] pointer-events-none" weight="fill" />
              <input
                type="tel"
                value={phoneWa}
                onChange={(e) => {
                  setPhoneWa(e.target.value);
                  if (isVerifyingWa) setIsVerifyingWa(false);
                }}
                placeholder="Contoh: 081234567890"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-border-subtle focus:border-primary focus:outline-none text-sm text-text-primary transition-all"
              />
            </div>

            {/* OTP Trigger Button */}
            {!isCurrentPhoneVerified && phoneWa.trim().length >= 9 && !isVerifyingWa && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold shadow-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <WhatsappLogo size={16} weight="fill" />
                <span>{isSendingOtp ? 'Mengirim...' : 'Verifikasi WA'}</span>
              </button>
            )}
          </div>

          {/* OTP Verification Form */}
          {isVerifyingWa && (
            <div className="mt-1 p-3 rounded-xl bg-white border border-primary/30 flex flex-col gap-2.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">Masukkan 6-Digit Kode OTP</span>
                {otpCooldown > 0 ? (
                  <span className="text-[11px] text-text-secondary font-mono">Kirim ulang dalam {otpCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                  >
                    Kirim Ulang OTP
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Contoh: 123456"
                  className="flex-1 px-3 py-2 text-center text-base tracking-widest font-mono font-bold rounded-xl border border-border-subtle focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isSubmittingOtp || otpCode.trim().length < 4}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingOtp ? 'Memeriksa...' : 'Validasi'}
                </button>
              </div>

              {otpError && (
                <p className="text-[11px] text-semantic-urgent font-medium">{otpError}</p>
              )}
              {otpSuccess && (
                <p className="text-[11px] text-status-completed font-medium">{otpSuccess}</p>
              )}
            </div>
          )}

          <span className="text-[10px] text-text-secondary">
            Pengingat otomatis H-3, H-1 deadline, dan 2 jam sebelum rapat dikirimkan langsung ke nomor ini via WhatsApp Gateway (Fonnte).
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:bg-page-background transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
