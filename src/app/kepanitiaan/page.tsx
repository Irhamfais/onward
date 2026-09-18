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
  Sparkle
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { calculatePeriodProgress, formatFullDate, formatDateDisplay } from '@/lib/date-utils';
import { CommitteeModal } from '@/components/kepanitiaan/committee-modal';
import { CommitteeDetailModal } from '@/components/kepanitiaan/committee-detail-modal';

export default function KepanitiaanPage() {
  const { committees, meetings, tasks } = useApp();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<Committee | null>(null);
  const [detailCommittee, setDetailCommittee] = useState<Committee | null>(null);

  // Filter active and ended
  const activeCommittees = committees.filter((c) => {
    const prog = calculatePeriodProgress(c.start_date, c.end_date);
    return !prog.isEnded;
  });
  const endedCommittees = committees.filter((c) => {
    const prog = calculatePeriodProgress(c.start_date, c.end_date);
    return prog.isEnded;
  });

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
          onClick={() => {
            setEditingCommittee(null);
            setIsCreateModalOpen(true);
          }}
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
            {committees.length > 0
              ? `${activeCommittees.length} Kepanitiaan Aktif · ${endedCommittees.length} Kepanitiaan Selesai`
              : 'Belum ada kepanitiaan yang didaftarkan. Tambahkan kepanitiaan pertama Anda.'}
          </p>
        </div>
      </div>

      {/* 3. Single-Column Wide Horizontal Cards (Exact 60:40 Split from Stitch) */}
      <div className="flex flex-col gap-6 w-full pt-2">
        {committees.length === 0 ? (
          <div className="bg-surface-card rounded-2xl border-2 border-dashed border-border-subtle p-12 flex flex-col items-center justify-center text-center card-spec">
            <div className="w-14 h-14 rounded-2xl bg-category-kepanitiaan-tint text-category-kepanitiaan flex items-center justify-center mb-3.5">
              <Users size={28} weight="bold" />
            </div>
            <h3 className="font-display font-bold text-base text-text-primary">
              Belum Ada Kepanitiaan
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mt-1.5 mb-5 leading-relaxed">
              Catat organisasi atau kepanitiaan aktifmu untuk memantau rapat koordinasi, pembagian job desc divisi, dan sisa masa kepengurusan.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingCommittee(null);
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Plus size={16} weight="bold" />
              <span>Tambah Kepanitiaan Sekarang</span>
            </button>
          </div>
        ) : (
          committees.map((comm) => {
            const periodProgress = calculatePeriodProgress(comm.start_date, comm.end_date);
            const isDone = periodProgress.isEnded;

            // Get meetings for this committee
            const commMeetings = meetings
              .filter((m) => m.committee_id === comm.id)
              .sort((a, b) => new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime());

            // Nearest upcoming meeting
            const todayStr = new Date().toISOString().split('T')[0];
            const upcomingMeeting = commMeetings.find((m) => m.meeting_date >= todayStr) || commMeetings[0];

            const isVideo =
              upcomingMeeting?.location.toLowerCase().includes('zoom') ||
              upcomingMeeting?.location.toLowerCase().includes('meet');

            // Job desc tasks
            const commTasks = tasks.filter(
              (t) =>
                t.category === 'KEPANITIAAN' &&
                (t.parent_id === comm.id ||
                  (!t.parent_id &&
                    t.parent_title?.trim().toLowerCase() === comm.organization_event_name?.trim().toLowerCase()))
            );
            const doneTasks = commTasks.filter((t) => t.status === 'SELESAI').length;
            const totalTasks = commTasks.length;
            const jobDescPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : (isDone ? 100 : 0);

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
                      {comm.role && (
                        <span className="text-xs text-text-secondary font-medium">
                          • {comm.role}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-text-secondary text-xs">
                      <div className="flex items-center gap-1.5">
                        <CalendarBlank size={16} />
                        <span>
                          {comm.periodDisplay || `${formatDateDisplay(comm.start_date)} – ${formatDateDisplay(comm.end_date)}`}
                        </span>
                      </div>
                      {!isDone ? (
                        <span className="inline-flex items-center text-[11px] font-semibold text-category-kepanitiaan bg-category-kepanitiaan-tint/80 px-2 py-0.5 rounded-full">
                          Sedang Berjalan
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
                          style={{ width: `${periodProgress.progressPct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-text-secondary">
                        <span>Periode berjalan {periodProgress.progressPct}%</span>
                        <span className="font-semibold text-text-primary">
                          {periodProgress.remainingText}
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
                      upcomingMeeting ? (
                        <div className="bg-surface-card p-3 rounded-xl border border-border-subtle/80 flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-text-primary text-xs font-bold">
                            {isVideo ? (
                              <VideoCamera size={16} className="text-category-kepanitiaan shrink-0" />
                            ) : (
                              <MapPin size={16} className="text-category-kepanitiaan shrink-0" />
                            )}
                            <span>
                              {formatFullDate(upcomingMeeting.meeting_date)} · {upcomingMeeting.start_time} WIB
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                            <span className="truncate">{upcomingMeeting.title} ({upcomingMeeting.location})</span>
                            {upcomingMeeting.is_recurring && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-1 text-category-kepanitiaan font-semibold shrink-0">
                                  <ArrowsClockwise size={14} />
                                  <span>Rutin</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => setDetailCommittee(comm)}
                          className="bg-surface-card p-3 rounded-xl border border-dashed border-border-subtle hover:border-category-kepanitiaan flex items-center justify-between gap-2 text-xs text-text-secondary cursor-pointer transition-colors"
                        >
                          <span className="italic">Belum ada jadwal rapat</span>
                          <span className="text-[11px] text-category-kepanitiaan font-semibold">+ Jadwalkan</span>
                        </div>
                      )
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
                        {totalTasks > 0
                          ? `${doneTasks} dari ${totalTasks} selesai (${jobDescPct}%)`
                          : `${jobDescPct}% progres`}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-status-not-started-tint rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          isDone ? 'bg-status-completed' : 'bg-category-kepanitiaan'
                        )}
                        style={{ width: `${jobDescPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setDetailCommittee(comm)}
                      className="inline-flex items-center gap-1.5 bg-surface-card hover:bg-page-background text-text-primary text-xs font-semibold rounded-xl px-3.5 py-1.5 border border-border-subtle transition-colors cursor-pointer"
                    >
                      <span>{isDone ? 'Lihat Arsip' : 'Lihat Detail'}</span>
                      <CaretRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Tambah / Edit Kepanitiaan */}
      {isCreateModalOpen && (
        <CommitteeModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingCommittee(null);
          }}
          editingCommittee={editingCommittee}
        />
      )}

      {/* Modal Detail Kepanitiaan (Jadwal Rapat & Job Desc) */}
      {detailCommittee && (
        <CommitteeDetailModal
          isOpen={!!detailCommittee}
          onClose={() => setDetailCommittee(null)}
          committee={detailCommittee}
          onEditCommittee={() => {
            const comm = detailCommittee;
            setDetailCommittee(null);
            setEditingCommittee(comm);
            setIsCreateModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
