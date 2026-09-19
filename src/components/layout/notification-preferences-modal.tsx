'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { WhatsappLogo, CheckCircle, Info } from '@phosphor-icons/react';
import { useApp } from '@/context/app-context';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'ONWARD_NOTIF_PREFERENCES';

interface NotifPrefs {
  waH3: boolean;
  waH1: boolean;
  waMeeting2Hours: boolean;
}

const defaultPrefs: NotifPrefs = {
  waH3: true,
  waH1: true,
  waMeeting2Hours: true,
};

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile } = useApp();
  const [prefs, setPrefs] = useState<NotifPrefs>(defaultPrefs);
  const [isSaved, setIsSaved] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setPrefs({
            waH3: parsed.waH3 ?? true,
            waH1: parsed.waH1 ?? true,
            waMeeting2Hours: parsed.waMeeting2Hours ?? parsed.meetingReminder ?? true,
          });
        }
      } catch {}
      setIsSaved(false);
      setTestResult(null);
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
    }, 900);
  };

  const handleSendTestMessage = async () => {
    if (!profile?.phone_wa) {
      setTestResult({
        success: false,
        message: 'Nomor WhatsApp belum terdaftar. Silakan atur di menu Profil terlebih dahulu.',
      });
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/notifications/send-wa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: profile.phone_wa,
          name: profile.name,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setTestResult({
          success: true,
          message: 'Pesan uji coba berhasil dikirim ke WhatsApp Anda!',
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Gagal mengirim pesan uji coba.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Terjadi kesalahan jaringan.',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Preferensi Notifikasi"
      subtitle="Atur pengiriman pengingat jadwal dan deadline Anda"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-5">
        {isSaved && (
          <div className="p-3 rounded-xl bg-status-completed-tint text-status-completed border border-status-completed/20 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle size={16} weight="bold" />
            <span>Pengaturan preferensi WhatsApp berhasil disimpan!</span>
          </div>
        )}

        {/* WhatsApp Phone Status Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-page-background border border-border-subtle text-xs">
          <div className="flex items-center gap-2 text-text-secondary">
            <Info size={16} className="text-primary shrink-0" />
            <span className="truncate">
              {profile?.phone_wa ? `Nomor WA: ${profile.phone_wa}` : 'Nomor WhatsApp belum terdaftar di profil'}
            </span>
          </div>
          {profile?.is_wa_verified ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-completed-tint text-status-completed shrink-0">
              Terverifikasi
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-border-subtle text-text-secondary shrink-0">
              {profile?.phone_wa ? 'Siap Digunakan' : 'Atur di Profil'}
            </span>
          )}
        </div>

        {/* Channel: WhatsApp (Fonnte Gateway) */}
        <div className="rounded-2xl border border-border-subtle p-4 bg-page-background/50">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-border-subtle mb-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#E5F9EC] text-[#25D366] flex items-center justify-center shrink-0">
              <WhatsappLogo size={18} weight="fill" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary">Notifikasi WhatsApp (Fonnte Gateway)</h3>
              <p className="text-[10px] text-text-secondary">Pesan otomatis instan ke nomor WhatsApp aktif Anda</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <label className="flex items-start justify-between gap-3 cursor-pointer group">
              <div className="flex flex-col">
                <span className="text-text-primary font-medium group-hover:text-primary transition-colors">
                  Pengingat WhatsApp H-3 Deadline
                </span>
                <span className="text-[10px] text-text-secondary">
                  Notifikasi 3 hari sebelum batas pengumpulan tugas dan submit lomba
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.waH3}
                onChange={() => handleToggle('waH3')}
                className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
              />
            </label>

            <div className="border-t border-border-subtle/60" />

            <label className="flex items-start justify-between gap-3 cursor-pointer group">
              <div className="flex flex-col">
                <span className="text-text-primary font-medium group-hover:text-primary transition-colors">
                  Pengingat WhatsApp H-1 Deadline Mendesak
                </span>
                <span className="text-[10px] text-text-secondary">
                  Peringatan prioritas 24 jam sebelum batas waktu berakhir
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.waH1}
                onChange={() => handleToggle('waH1')}
                className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
              />
            </label>

            <div className="border-t border-border-subtle/60" />

            <label className="flex items-start justify-between gap-3 cursor-pointer group">
              <div className="flex flex-col">
                <span className="text-text-primary font-medium group-hover:text-primary transition-colors">
                  Ingatkan 2 Jam Sebelum Rapat Dimulai
                </span>
                <span className="text-[10px] text-text-secondary">
                  Notifikasi pengingat via WhatsApp 2 jam sebelum jadwal rapat kepanitiaan
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.waMeeting2Hours}
                onChange={() => handleToggle('waMeeting2Hours')}
                className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
              />
            </label>

            {/* Test WhatsApp Button */}
            <div className="border-t border-border-subtle/60 pt-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-text-primary font-semibold text-xs block">Uji Coba Pengiriman</span>
                  <span className="text-[10px] text-text-secondary">Kirim pesan demonstrasi notifikasi ke nomor WhatsApp Anda</span>
                </div>
                <button
                  type="button"
                  onClick={handleSendTestMessage}
                  disabled={isSendingTest}
                  className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <WhatsappLogo size={15} weight="fill" />
                  <span>{isSendingTest ? 'Mengirim...' : 'Tes Kirim WA'}</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-2.5 rounded-xl text-[11px] font-medium flex items-center gap-2 animate-in fade-in ${
                    testResult.success
                      ? 'bg-status-completed-tint text-status-completed border border-status-completed/20'
                      : 'bg-semantic-urgent-tint text-semantic-urgent border border-semantic-urgent/20'
                  }`}
                >
                  {testResult.success ? <CheckCircle size={15} weight="bold" /> : <Info size={15} />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:bg-page-background transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            Simpan Preferensi
          </button>
        </div>
      </div>
    </Modal>
  );
};
