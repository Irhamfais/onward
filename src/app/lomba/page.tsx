'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/app-context';
import { Competition, CompetitionStatus } from '@/types';
import { 
  Plus, 
  Trophy, 
  HourglassHigh, 
  CalendarBlank, 
  Users, 
  Medal, 
  Hourglass, 
  X, 
  CheckCircle,
  Check
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export default function LombaPage() {
  const { competitions, addCompetition } = useApp();
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('UI/UX Design');
  const [level, setLevel] = useState('Nasional');
  const [status, setStatus] = useState<CompetitionStatus>('PROSES_PENGERJAAN');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-10-15');
  const [time, setTime] = useState('23:59');
  const [members, setMembers] = useState('AR, KH, RT');

  const filteredCompetitions = competitions.filter((comp) => {
    if (activeFilter === 'ALL') return true;
    return comp.status === activeFilter;
  });

  const countMendaftar = competitions.filter((c) => c.status === 'MENDAFTAR').length;
  const countProses = competitions.filter((c) => c.status === 'PROSES_PENGERJAAN').length;
  const countSubmit = competitions.filter((c) => c.status === 'SUDAH_SUBMIT').length;
  const countHasil = competitions.filter((c) => c.status === 'HASIL_KELUAR').length;

  const handleCreateCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCompetition({
      name: name.trim(),
      category,
      level,
      status,
      description: description.trim() || undefined,
      submission_deadline: `${date}T${time}:00`,
      deadlineDisplay: `Tenggat ${date.split('-')[2]} ${date.split('-')[1]}`,
      team_members: members.trim() || 'AR',
      progressPct: status === 'HASIL_KELUAR' || status === 'SUDAH_SUBMIT' ? 100 : status === 'PROSES_PENGERJAAN' ? 40 : 0,
      progressDone: status === 'HASIL_KELUAR' ? 5 : status === 'PROSES_PENGERJAAN' ? 2 : 0,
      progressTotal: 5,
    });

    setName('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary">Lomba</h1>
          <p className="text-sm text-text-secondary mt-1">
            Kelola kompetisi aktif, delegasi tugas tim, dan progres submission.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold text-sm py-2.5 px-5 rounded-xl shadow-[0_4px_16px_rgba(124,92,252,0.25)] transition-all active:scale-[0.98] cursor-pointer shrink-0"
        >
          <Plus size={18} weight="bold" />
          <span>Tambah Lomba</span>
        </button>
      </div>

      {/* 2. Competition Stats Summary Banner (Exact Stitch Specimen) */}
      <div className="bg-surface-card rounded-2xl p-5 md:p-6 border border-border-subtle card-spec flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgb(255, 196, 107) 0%, rgb(255, 182, 72) 100%)',
              boxShadow: 'rgba(255, 182, 72, 0.25) 0px 4px 12px',
            }}
          >
            <Trophy size={22} weight="bold" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
              Ringkasan Aktivitas
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-primary mt-1">
              <span className="font-bold text-text-primary">{competitions.length} Kompetisi Terdaftar</span>
              <span className="text-border-subtle">•</span>
              <span className="text-semantic-urgent font-semibold">1 Mendekati Deadline</span>
              <span className="text-border-subtle">•</span>
              <span className="text-primary font-medium">1 Menunggu Hasil</span>
              <span className="text-border-subtle">•</span>
              <span className="text-status-completed font-semibold">1 Prestasi</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3 pl-5 border-l border-border-subtle">
          <div className="text-right">
            <span className="text-[11px] text-text-secondary block">Tingkat Penyelesaian</span>
            <span className="font-display text-sm font-bold text-text-primary">75% Target Selesai</span>
          </div>
          <div className="w-10 h-10 relative flex items-center justify-center">
            <svg className="w-9 h-9 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-page-background"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="text-category-lomba"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray="75, 100"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Filter Tab Strip */}
      <div className="border-b border-border-subtle flex items-center gap-5 overflow-x-auto no-scrollbar pt-2 pb-1">
        <button
          type="button"
          onClick={() => setActiveFilter('ALL')}
          className={cn(
            'relative pb-3 text-xs flex items-center gap-1.5 whitespace-nowrap focus:outline-none transition-colors cursor-pointer',
            activeFilter === 'ALL' ? 'font-semibold text-primary' : 'font-medium text-text-secondary hover:text-text-primary'
          )}
        >
          <span>Semua</span>
          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', activeFilter === 'ALL' ? 'bg-primary-fixed text-primary' : 'bg-page-background text-text-secondary')}>
            {competitions.length}
          </span>
          {activeFilter === 'ALL' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('MENDAFTAR')}
          className={cn(
            'relative pb-3 text-xs flex items-center gap-1.5 whitespace-nowrap focus:outline-none transition-colors cursor-pointer',
            activeFilter === 'MENDAFTAR' ? 'font-semibold text-primary' : 'font-medium text-text-secondary hover:text-text-primary'
          )}
        >
          <span>Mendaftar</span>
          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', activeFilter === 'MENDAFTAR' ? 'bg-primary-fixed text-primary' : 'bg-page-background text-text-secondary')}>
            {countMendaftar}
          </span>
          {activeFilter === 'MENDAFTAR' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('PROSES_PENGERJAAN')}
          className={cn(
            'relative pb-3 text-xs flex items-center gap-1.5 whitespace-nowrap focus:outline-none transition-colors cursor-pointer',
            activeFilter === 'PROSES_PENGERJAAN' ? 'font-semibold text-primary' : 'font-medium text-text-secondary hover:text-text-primary'
          )}
        >
          <span>Proses Pengerjaan</span>
          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', activeFilter === 'PROSES_PENGERJAAN' ? 'bg-primary-fixed text-primary' : 'bg-page-background text-text-secondary')}>
            {countProses}
          </span>
          {activeFilter === 'PROSES_PENGERJAAN' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('SUDAH_SUBMIT')}
          className={cn(
            'relative pb-3 text-xs flex items-center gap-1.5 whitespace-nowrap focus:outline-none transition-colors cursor-pointer',
            activeFilter === 'SUDAH_SUBMIT' ? 'font-semibold text-primary' : 'font-medium text-text-secondary hover:text-text-primary'
          )}
        >
          <span>Sudah Submit</span>
          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', activeFilter === 'SUDAH_SUBMIT' ? 'bg-primary-fixed text-primary' : 'bg-page-background text-text-secondary')}>
            {countSubmit}
          </span>
          {activeFilter === 'SUDAH_SUBMIT' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('HASIL_KELUAR')}
          className={cn(
            'relative pb-3 text-xs flex items-center gap-1.5 whitespace-nowrap focus:outline-none transition-colors cursor-pointer',
            activeFilter === 'HASIL_KELUAR' ? 'font-semibold text-primary' : 'font-medium text-text-secondary hover:text-text-primary'
          )}
        >
          <span>Hasil Keluar</span>
          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', activeFilter === 'HASIL_KELUAR' ? 'bg-primary-fixed text-primary' : 'bg-page-background text-text-secondary')}>
            {countHasil}
          </span>
          {activeFilter === 'HASIL_KELUAR' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* 4. Cards Grid (Exact 4 Cards + 1 Add Card from Stitch) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {filteredCompetitions.map((comp) => {
          const isProses = comp.status === 'PROSES_PENGERJAAN';
          const isMendaftar = comp.status === 'MENDAFTAR';
          const isSubmit = comp.status === 'SUDAH_SUBMIT';
          const isHasil = comp.status === 'HASIL_KELUAR';

          const avatarList = comp.team_members
            ? comp.team_members.split(',').map((m) => m.trim().slice(0, 2).toUpperCase())
            : ['AR'];

          return (
            <div
              key={comp.id}
              className={cn(
                'relative bg-surface-card rounded-2xl card-spec flex flex-col justify-between overflow-hidden transition-all duration-200 hover:-translate-y-1',
                isProses
                  ? 'border border-category-lomba/40 ring-2 ring-category-lomba/20'
                  : 'border border-border-subtle'
              )}
            >
              <div className="h-1 w-full bg-category-lomba" />

              <div className="p-5 flex flex-col gap-3.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-base font-bold text-text-primary leading-tight">
                    {comp.name}
                  </h3>
                  
                  {isProses && (
                    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-category-lomba-tint text-[#B45309]">
                      Proses Pengerjaan
                    </span>
                  )}
                  {isMendaftar && (
                    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF8EB] text-[#C27803]">
                      Mendaftar
                    </span>
                  )}
                  {isSubmit && (
                    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-category-kuliah-tint text-[#4F46E5]">
                      Sudah Submit
                    </span>
                  )}
                  {isHasil && (
                    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-status-completed-tint text-[#16A34A]">
                      Hasil Keluar
                    </span>
                  )}
                </div>

                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed min-h-[36px]">
                  {comp.description || 'Fokus pada pengembangan inovasi dan pemecahan masalah.'}
                </p>

                {/* Progress bar */}
                <div className="flex flex-col gap-1 mt-1">
                  <div className="h-2 w-full bg-status-not-started-tint rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        isHasil ? 'bg-status-completed' : 'bg-category-lomba'
                      )}
                      style={{ width: `${comp.progressPct ?? (isHasil || isSubmit ? 100 : isProses ? 57 : 0)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-secondary">
                    <span>
                      {comp.progressDone ?? (isHasil || isSubmit ? 5 : isProses ? 4 : 0)} dari{' '}
                      {comp.progressTotal ?? (isHasil || isSubmit ? 5 : isProses ? 7 : 2)} tugas selesai
                    </span>
                    <span className="font-bold text-text-primary">
                      {comp.progressPct ?? (isHasil || isSubmit ? 100 : isProses ? 57 : 0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 pb-5">
                <div className="border-t border-border-subtle pt-3 flex items-center justify-between">
                  {/* Left status badge */}
                  {isProses && (
                    <div className="flex items-center gap-1.5 text-semantic-urgent text-xs font-semibold">
                      <HourglassHigh size={16} />
                      <span>{comp.deadlineDisplay || 'Submit 3 hari lagi'}</span>
                    </div>
                  )}
                  {isMendaftar && (
                    <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                      <CalendarBlank size={16} />
                      <span>{comp.deadlineDisplay || 'Daftar 12 hari lagi'}</span>
                    </div>
                  )}
                  {isSubmit && (
                    <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                      <Hourglass size={16} />
                      <span>{comp.deadlineDisplay || 'Menunggu pengumuman'}</span>
                    </div>
                  )}
                  {isHasil && (
                    <div className="inline-flex items-center gap-1.5 bg-status-completed-tint text-status-completed text-xs px-2.5 py-0.5 rounded-full font-bold">
                      <Medal size={16} weight="bold" />
                      <span>{comp.achievement || 'Juara 3'}</span>
                    </div>
                  )}

                  {/* Team Avatars */}
                  <div className="flex items-center -space-x-2">
                    {avatarList.map((av, idx) => {
                      const bgClasses = [
                        'bg-primary-fixed text-primary',
                        'bg-category-kuliah-tint text-category-kuliah',
                        'bg-category-kepanitiaan-tint text-category-kepanitiaan',
                        'bg-category-lomba-tint text-[#B45309]',
                      ];
                      return (
                        <div
                          key={idx}
                          className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ring-2 ring-white',
                            bgClasses[idx % bgClasses.length]
                          )}
                          title={av}
                        >
                          {av}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Card 5: Add New Card Placeholder (From Stitch) */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-border-subtle hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px] bg-white/50 hover:bg-surface-card transition-all duration-200 group card-spec"
        >
          <div className="w-12 h-12 rounded-full bg-page-background group-hover:bg-primary-fixed flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors mb-3">
            <Plus size={24} weight="bold" />
          </div>
          <span className="font-display text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
            Daftarkan Lomba Baru
          </span>
          <p className="text-xs text-text-secondary max-w-[210px] mt-1 text-center">
            Tambahkan target kompetisi dan mulai rancang pembagian tugas tim
          </p>
        </div>
      </div>

      {/* ==================== MODAL DAFTARKAN LOMBA ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1B2E]/45 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-[500px] bg-surface-card rounded-2xl border border-border-subtle shadow-modal flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-card">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-category-lomba-tint text-[#B45309] flex items-center justify-center">
                  <Trophy size={18} weight="bold" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-text-primary">Daftarkan Lomba Baru</h2>
                  <p className="text-[11px] text-text-secondary">Catat target kompetisi, tenggat submisi, dan susunan tim</p>
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
            <form onSubmit={handleCreateCompetition} className="p-6 flex flex-col gap-4 max-h-[82vh] overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Nama Kompetisi</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: UI/UX National Challenge 2026..."
                  className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Kategori Kompetisi</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Business Case">Business Case</option>
                    <option value="LKTI">LKTI / Karya Tulis</option>
                    <option value="Datathon">Datathon</option>
                    <option value="Competitive Programming">Competitive Programming</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Tingkat Penyelenggaraan</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                    <option value="Regional">Regional</option>
                    <option value="Universitas">Universitas</option>
                  </select>
                </div>
              </div>

              {/* Status Kompetisi Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Status Kompetisi</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('MENDAFTAR')}
                    className={cn(
                      'py-1.5 px-2 rounded-xl border text-[11px] font-medium flex items-center justify-center transition-all',
                      status === 'MENDAFTAR'
                        ? 'border-category-lomba bg-category-lomba-tint text-[#B45309] font-semibold border-2'
                        : 'border-border-subtle bg-surface-card text-text-secondary'
                    )}
                  >
                    Mendaftar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('PROSES_PENGERJAAN')}
                    className={cn(
                      'py-1.5 px-2 rounded-xl border text-[11px] font-medium flex items-center justify-center transition-all',
                      status === 'PROSES_PENGERJAAN'
                        ? 'border-category-lomba bg-category-lomba-tint text-[#B45309] font-semibold border-2'
                        : 'border-border-subtle bg-surface-card text-text-secondary'
                    )}
                  >
                    Proses Kerja
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('SUDAH_SUBMIT')}
                    className={cn(
                      'py-1.5 px-2 rounded-xl border text-[11px] font-medium flex items-center justify-center transition-all',
                      status === 'SUDAH_SUBMIT'
                        ? 'border-category-lomba bg-category-lomba-tint text-[#B45309] font-semibold border-2'
                        : 'border-border-subtle bg-surface-card text-text-secondary'
                    )}
                  >
                    Sudah Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('HASIL_KELUAR')}
                    className={cn(
                      'py-1.5 px-2 rounded-xl border text-[11px] font-medium flex items-center justify-center transition-all',
                      status === 'HASIL_KELUAR'
                        ? 'border-category-lomba bg-category-lomba-tint text-[#B45309] font-semibold border-2'
                        : 'border-border-subtle bg-surface-card text-text-secondary'
                    )}
                  >
                    Hasil Keluar
                  </button>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Deskripsi Singkat / Fokus Proyek</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Misal: Redesain aplikasi transportasi untuk lansia ramah aksesibilitas..."
                  className="w-full px-3.5 py-2.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Deadline */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Tenggat Pengumpulan (Deadline Submission)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                  />
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Members */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Anggota Tim (Inisial / Nama)</label>
                <input
                  type="text"
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  placeholder="Misal: AR, KH, RT"
                  className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Action Buttons */}
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
                  <span>Daftarkan Lomba</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
