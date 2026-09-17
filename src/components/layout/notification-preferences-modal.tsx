'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Envelope, WhatsappLogo, Users, CheckCircle } from '@phosphor-icons/react';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'ONWARD_NOTIF_PREFERENCES';

interface NotifPrefs {
  emailH3: boolean;
  emailH1: boolean;
  waH3: boolean;
  waH1: boolean;
  meetingReminder: boolean;
}

const defaultPrefs: NotifPrefs = {
  emailH3: true,
  emailH1: true,
  waH3: true,
  waH1: true,
  meetingReminder: true,
};

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [prefs, setPrefs] = useState<NotifPrefs>(defaultPrefs);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setPrefs(JSON.parse(saved));
        }
      } catch {}
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleToggle = (key: keyof NotifPrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {}
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Preferensi Notifikasi"
      subtitle="Atur waktu dan kanal pengiriman pengingat deadline Anda"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-5">
        {isSaved && (
          <div className="p-3 rounded-xl bg-status-completed-tint text-status-completed border border-status-completed/20 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle size={16} weight="bold" />
            <span>Pengaturan preferensi berhasil disimpan!</span>
          </div>
        )}

        {/* Channel 1: Email (Resend) */}
        <div className="rounded-2xl border border-border-subtle p-4 bg-page-background/50">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-border-subtle mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary-tint text-primary flex items-center justify-center">
              <Envelope size={16} weight="bold" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary">Notifikasi Email (Resend API)</h3>
              <p className="text-[10px] text-text-secondary">Kirim rangkuman jadwal ke alamat email terdaftar</p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-text-primary font-medium">Pengingat H-3 Sebelum Deadline</span>
              <input
                type="checkbox"
                checked={prefs.emailH3}
                onChange={() => handleToggle('emailH3')}
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-text-primary font-medium">Pengingat Mendesak H-1 Sebelum Deadline</span>
              <input
                type="checkbox"
                checked={prefs.emailH1}
                onChange={() => handleToggle('emailH1')}
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Channel 2: WhatsApp (Twilio Gateway) */}
        <div className="rounded-2xl border border-border-subtle p-4 bg-page-background/50">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-border-subtle mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#E5F9EC] text-[#25D366] flex items-center justify-center">
              <WhatsappLogo size={16} weight="fill" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary">Notifikasi WhatsApp (Twilio Gateway)</h3>
              <p className="text-[10px] text-text-secondary">Pesan otomatis instan ke nomor WhatsApp Anda</p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-text-primary font-medium">Pengingat WhatsApp H-3 Deadline</span>
              <input
                type="checkbox"
                checked={prefs.waH3}
                onChange={() => handleToggle('waH3')}
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-text-primary font-medium">Pengingat WhatsApp H-1 Deadline Mendesak</span>
              <input
                type="checkbox"
                checked={prefs.waH1}
                onChange={() => handleToggle('waH1')}
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Channel 3: Rapat Kepanitiaan */}
        <div className="rounded-2xl border border-border-subtle p-4 bg-page-background/50">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-border-subtle mb-3">
            <div className="w-7 h-7 rounded-lg bg-category-kepanitiaan-tint text-category-kepanitiaan flex items-center justify-center">
              <Users size={16} weight="bold" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary">Pengingat Jadwal Rapat Kepanitiaan</h3>
              <p className="text-[10px] text-text-secondary">Pemberitahuan rapat divisi atau event organisasi</p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-text-primary font-medium">Ingatkan 2 Jam Sebelum Rapat Dimulai</span>
              <input
                type="checkbox"
                checked={prefs.meetingReminder}
                onChange={() => handleToggle('meetingReminder')}
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:bg-page-background transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-xs transition-all"
          >
            Simpan Preferensi
          </button>
        </div>
      </div>
    </Modal>
  );
};
