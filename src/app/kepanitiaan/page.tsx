'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/app-context';
import { Committee } from '@/types';
import { 
  Plus, 
  Users, 
  CalendarBlank, 
  VideoCamera, 
  MapPin, 
  ArrowsClockwise, 
  CheckCircle, 
  CaretRight, 
  X,
  Check
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export default function KepanitiaanPage() {
  const { committees, addCommittee } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [division, setDivision] = useState('');
  const [role, setRole] = useState('Anggota Aktif');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-11-30');
  const [meetingTime, setMeetingTime] = useState('Kamis · 16:00 WIB');
  const [meetingLoc, setMeetingLoc] = useState('via Zoom Meeting');
  const [recurring, setRecurring] = useState(true);

  const handleCreateCommittee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !division.trim()) return;

    addCommittee({
      organization_event_name: name.trim(),
      role_division: division.trim(),
      role,
      status: 'Sedang Berjalan',
      start_date: startDate,
      end_date: endDate,
      periodDisplay: `${startDate} – ${endDate}`,
      progressPct: 20,
      remainingDays: '45 hari tersisa',
      meetingTitle: 'Rapat Koordinasi Divisi',
      meetingTime,
      meetingLocation: meetingLoc,
      recurring,
      jobDescDone: 1,
      jobDescTotal: 5,
      jobDescPct: 20,
      notes: `Peran: ${role} di divisi ${division}`,
    });

    setName('');
    setDivision('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary">Kepanitiaan</h1>
          <p className="text-sm text-text-secondary mt-1">
            Kelola peran organisasi mahasiswa, jadwal rapat rutin, dan progres job desc divisi.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold text-sm rounded-xl px-5 py-2.5 shadow-[0_4px_16px_rgba(124,92,252,0.25)] transition-all active:scale-[0.98] cursor-pointer shrink-0"
        >
          <Plus size={18} weight="bold" />
          <span>Tambah Kepanitiaan</span>
        </button>
      </div>

      {/* 2. Summary Callout Banner (Exact Stitch Specimen) */}
      <div className="relative overflow-hidden bg-category-kepanitiaan-tint rounded-2xl p-5 md:p-6 border border-category-kepanitiaan/30 flex flex-col md:flex-row items-start md:items-center gap-5 card-spec mb-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
          style={{
            background: 'linear-gradient(135deg, rgb(77, 209, 184) 0%, rgb(53, 192, 165) 100%)',
            boxShadow: 'rgba(53, 192, 165, 0.25) 0px 4px 12px',
          }}
        >
          <Users size={22} weight="bold" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-category-kepanitiaan tracking-wider uppercase">
            Ringkasan Organisasi
          </span>
          <p className="text-xs md:text-sm font-medium text-text-primary">
            2 Kepanitiaan Aktif · 1 Kepanitiaan Selesai · 1 Rapat Minggu Ini · 6 dari 13 Job Desc Selesai
          </p>
        </div>
      </div>

      {/* 3. Single-Column Wide Horizontal Cards (Exact 60:40 Split from Stitch) */}
      <div className="flex flex-col gap-6 w-full pt-2">
        {committees.map((comm) => {
          const isDone = comm.status === 'Arsip Selesai' || comm.progressPct === 100;
          const isVideo = comm.meetingLocation?.toLowerCase().includes('zoom') || comm.meetingLocation?.toLowerCase().includes('meet');

          return (
            <div
              key={comm.id}
              className={cn(
                'bg-surface-card rounded-2xl border border-border-subtle card-spec overflow-hidden flex flex-col lg:flex-row relative transition-all',
                isDone ? 'opacity-90' : 'hover:shadow-md'
              )}
            >
              {/* Left Color Accent Bar */}
              <div
                className={cn(
                  'absolute left-0 top-0 bottom-0 w-1.5',
                  isDone ? 'bg-status-not-started' : 'bg-category-kepanitiaan'
                )}
              />

              {/* Left Zone (~60%) */}
              <div className="flex-1 p-6 pl-8 flex flex-col justify-between gap-5">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2
                      className={cn(
                        'font-display text-lg font-bold',
                        isDone ? 'text-text-secondary' : 'text-text-primary'
                      )}
                    >
                      {comm.organization_event_name}
                    </h2>
                    <span
                      className={cn(
                        'px-3 py-0.5 rounded-full text-xs font-semibold',
                        isDone
                          ? 'bg-status-not-started-tint text-text-secondary'
                          : 'bg-category-kepanitiaan-tint text-category-kepanitiaan'
                      )}
                    >
                      {comm.role_division}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-text-secondary text-xs">
                    <div className="flex items-center gap-1.5">
                      <CalendarBlank size={16} />
                      <span>{comm.periodDisplay || `${comm.start_date} – ${comm.end_date}`}</span>
                    </div>
                    {!isDone ? (
                      <span className="inline-flex items-center text-[11px] font-semibold text-category-kepanitiaan bg-category-kepanitiaan-tint/80 px-2 py-0.5 rounded-full">
                        {comm.status || 'Sedang Berjalan'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[11px] font-semibold text-status-completed bg-status-completed-tint px-2 py-0.5 rounded-full">
                        Selesai
                      </span>
                    )}
                  </div>
                </div>

                {/* Duration Progress */}
                {!isDone ? (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="w-full h-2 bg-status-not-started-tint rounded-full overflow-hidden">
                      <div
                        className="h-full bg-category-kepanitiaan rounded-full transition-all duration-500"
                        style={{ width: `${comm.progressPct || 65}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <span>Periode berjalan {comm.progressPct || 65}%</span>
                      <span className="font-semibold text-text-primary">
                        {comm.remainingDays || '12 hari tersisa'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-status-completed-tint text-status-completed">
                      <CheckCircle size={15} weight="bold" /> Selesai
                    </span>
                    <span className="text-xs text-text-secondary">
                      Kepanitiaan telah selesai (100% periode berakhir)
                    </span>
                  </div>
                )}
              </div>

              {/* Right Zone (~40%) */}
              <div
                className={cn(
                  'w-full lg:w-[42%] p-6 flex flex-col justify-between gap-4 border-t lg:border-t-0 lg:border-l border-border-subtle',
                  isDone ? 'bg-page-background/40' : 'bg-page-background/60'
                )}
              >
                {/* Rapat Terdekat */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] tracking-wider uppercase text-text-secondary font-semibold">
                    {isDone ? 'Status Rapat' : 'Rapat Terdekat'}
                  </span>

                  {!isDone ? (
                    <div className="bg-surface-card p-3 rounded-xl border border-border-subtle/80 flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-text-primary text-xs font-bold">
                        {isVideo ? (
                          <VideoCamera size={16} className="text-category-kepanitiaan shrink-0" />
                        ) : (
                          <MapPin size={16} className="text-category-kepanitiaan shrink-0" />
                        )}
                        <span>{comm.meetingTime || 'Kamis, 18 Sep · 16:00 WIB'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                        <span>{comm.meetingLocation || 'via Zoom Meeting'}</span>
                        {comm.recurring && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1 text-category-kepanitiaan font-semibold">
                              <ArrowsClockwise size={14} />
                              <span>Berulang mingguan</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface-card p-3 rounded-xl border border-border-subtle/80 flex items-center gap-2 text-xs text-status-not-started italic">
                      <CheckCircle size={18} weight="fill" className="text-status-completed shrink-0" />
                      <span>Semua agenda rapat telah selesai</span>
                    </div>
                  )}
                </div>

                {/* Job Desc Divisi */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-text-primary">Job Desc</span>
                    <span
                      className={cn(
                        'font-semibold',
                        isDone ? 'text-status-completed' : 'text-category-kepanitiaan'
                      )}
                    >
                      {comm.jobDescDone ?? 5} dari {comm.jobDescTotal ?? 7} selesai ({comm.jobDescPct ?? 71}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-status-not-started-tint rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        isDone ? 'bg-status-completed' : 'bg-category-kepanitiaan'
                      )}
                      style={{ width: `${comm.jobDescPct ?? (isDone ? 100 : 71)}%` }}
                    />
                  </div>
                </div>

                {/* Action Footer */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedDetail(comm.organization_event_name)}
                    className="inline-flex items-center gap-1.5 bg-surface-card hover:bg-page-background text-text-primary text-xs font-semibold rounded-xl px-3.5 py-1.5 border border-border-subtle transition-colors cursor-pointer"
                  >
                    <span>{isDone ? 'Lihat Arsip' : 'Lihat Detail'}</span>
                    <CaretRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== MODAL TAMBAH KEPANITIAAN ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1B2E]/45 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-[500px] bg-surface-card rounded-2xl border border-border-subtle shadow-modal flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-card">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-category-kepanitiaan-tint text-category-kepanitiaan flex items-center justify-center">
                  <Users size={18} weight="bold" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-text-primary">Tambah Kepanitiaan Baru</h2>
                  <p className="text-[11px] text-text-secondary">Kelola peran kepanitiaan dan agenda rapat divisi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-status-not-started-tint hover:text-text-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateCommittee} className="p-6 flex flex-col gap-4 max-h-[82vh] overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Nama Acara / Event Kepanitiaan</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Seminar Nasional AI 2026..."
                  className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Divisi / Bidang</label>
                  <input
                    type="text"
                    required
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    placeholder="Misal: Sie Acara / Publikasi"
                    className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Peran Anda</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="Koordinator Divisi">Koordinator Divisi</option>
                    <option value="Ketua Pelaksana">Ketua Pelaksana</option>
                    <option value="Staff Ahli">Staff Ahli</option>
                    <option value="Anggota Aktif">Anggota Aktif</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Periode Kepanitiaan (Mulai & Selesai)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                  />
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Jadwal & Tempat Rapat Terdekat</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    placeholder="Misal: Kamis · 16:00 WIB"
                    className="h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                  />
                  <input
                    type="text"
                    required
                    value={meetingLoc}
                    onChange={(e) => setMeetingLoc(e.target.value)}
                    placeholder="Misal: via Zoom / Sekre"
                    className="h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="check-panitia-recurring"
                  checked={recurring}
                  onChange={(e) => setRecurring(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="check-panitia-recurring" className="text-xs text-text-secondary cursor-pointer select-none">
                  Rapat berulang mingguan / dwimingguan
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle mt-1">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-page-background transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark active:scale-[0.98] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Plus size={16} weight="bold" />
                  <span>Simpan Kepanitiaan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Modal / Toast for Detail */}
      {selectedDetail && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#1F1B2E] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 text-xs animate-in slide-in-from-bottom-5">
          <CheckCircle size={18} weight="fill" className="text-status-completed" />
          <span>Menampilkan detail: {selectedDetail}</span>
          <button
            type="button"
            onClick={() => setSelectedDetail(null)}
            className="ml-2 text-text-secondary hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
