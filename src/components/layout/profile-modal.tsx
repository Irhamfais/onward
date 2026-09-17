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

  useEffect(() => {
    if (isOpen && profile) {
      setName(profile.name || '');
      setMajor(profile.major || '');
      setSemester(profile.semester || 1);
      setPhoneWa(profile.phone_wa || '');
      setToastMessage(null);
    }
  }, [isOpen, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setToastMessage(null);

    const success = await updateProfile({
      name: name.trim() || 'Mahasiswa',
      major: major.trim() || 'Mahasiswa Onward',
      semester: Number(semester) || 1,
      phone_wa: phoneWa.trim(),
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
              toastMessage.includes('berhasil')
                ? 'bg-status-completed-tint text-status-completed border border-status-completed/20'
                : 'bg-semantic-urgent-tint text-semantic-urgent border border-semantic-urgent/20'
            }`}
          >
            {toastMessage.includes('berhasil') ? <CheckCircle size={16} weight="bold" /> : <WarningCircle size={16} weight="bold" />}
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

        {/* WhatsApp Phone Number */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-text-secondary">Nomor WhatsApp (Pengingat)</label>
            {profile?.is_wa_verified ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-completed-tint text-status-completed">
                <CheckCircle size={12} weight="bold" /> Terverifikasi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-category-lomba-tint text-[#B45309]">
                Belum Terverifikasi
              </span>
            )}
          </div>
          <div className="relative">
            <WhatsappLogo size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#25D366] pointer-events-none" weight="fill" />
            <input
              type="tel"
              value={phoneWa}
              onChange={(e) => setPhoneWa(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-page-background border border-border-subtle focus:border-primary focus:bg-white focus:outline-none text-sm text-text-primary transition-all"
            />
          </div>
          <span className="text-[10px] text-text-secondary mt-1 block">
            Digunakan untuk pengingat deadline WhatsApp via Twilio Gateway (Fase 5).
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:bg-page-background transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
