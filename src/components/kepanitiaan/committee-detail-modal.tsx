'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { useApp } from '@/context/app-context';
import { Committee, CommitteeMeeting, UnifiedTask, TaskStatus } from '@/types';
import { 
  Users, 
  PencilSimple, 
  Trash, 
  Plus, 
  CalendarBlank, 
  Clock, 
  MapPin, 
  VideoCamera, 
  ArrowsClockwise, 
  CheckCircle,
  Circle,
  HourglassHigh
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { calculatePeriodProgress, formatFullDate } from '@/lib/date-utils';
import { CommitteeMeetingModal } from './committee-meeting-modal';
import { CommitteeTaskModal } from './committee-task-modal';

interface CommitteeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  committee: Committee;
  onEditCommittee: () => void;
}

export const CommitteeDetailModal: React.FC<CommitteeDetailModalProps> = ({
  isOpen,
  onClose,
  committee,
  onEditCommittee,
}) => {
  const { meetings, tasks, cycleTaskStatus, deleteTask, deleteMeeting, deleteCommittee } = useApp();

  // Sub-modals state
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<CommitteeMeeting | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<UnifiedTask | null>(null);

  // Filter meetings & tasks belonging to this committee
  const commMeetings = meetings
    .filter((m) => m.committee_id === committee.id)
    .sort((a, b) => new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime());

  const commTasks = tasks.filter(
    (t) =>
      t.category === 'KEPANITIAAN' &&
      (t.parent_id === committee.id ||
        (!t.parent_id &&
          t.parent_title?.trim().toLowerCase() === committee.organization_event_name?.trim().toLowerCase()))
  );

  const doneCount = commTasks.filter((t) => t.status === 'SELESAI').length;
  const totalCount = commTasks.length;
  const jobDescPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Period progress calculation
  const periodProgress = calculatePeriodProgress(committee.start_date, committee.end_date);

  const handleDeleteCommittee = () => {
    if (
      confirm(
        `Hapus kepanitiaan "${committee.organization_event_name}" beserta seluruh jadwal rapat dan job desc-nya?`
      )
    ) {
      deleteCommittee(committee.id);
      onClose();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={committee.organization_event_name}
        subtitle={`${committee.role_division} • ${committee.role || 'Anggota'}`}
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col gap-6">
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-category-kepanitiaan-tint text-category-kepanitiaan border border-category-kepanitiaan/30">
                {committee.role_division}
              </span>
              <span className="text-xs text-text-secondary font-medium">
                {committee.role || 'Anggota Aktif'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onEditCommittee}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-subtle bg-surface-card hover:bg-page-background text-text-primary text-xs font-semibold transition-colors cursor-pointer"
              >
                <PencilSimple size={14} />
                <span>Edit Kepanitiaan</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteCommittee}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-semantic-urgent/30 bg-status-not-started-tint hover:bg-semantic-urgent/10 text-semantic-urgent text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash size={14} />
                <span>Hapus</span>
              </button>
            </div>
          </div>

          {/* Period Progress Card */}
          <div className="p-4 rounded-2xl bg-page-background/60 border border-border-subtle flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text-primary flex items-center gap-1.5">
                <CalendarBlank size={16} className="text-category-kepanitiaan" />
                <span>Masa Periode Kepengurusan</span>
              </span>
              <span
                className={cn(
                  'font-semibold text-xs',
                  periodProgress.isEnded ? 'text-status-completed' : 'text-text-primary'
                )}
              >
                {periodProgress.remainingText}
              </span>
            </div>

            <div className="w-full h-2.5 bg-status-not-started-tint rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  periodProgress.isEnded ? 'bg-status-completed' : 'bg-category-kepanitiaan'
                )}
                style={{ width: `${periodProgress.progressPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-text-secondary">
              <span>Mulai: {formatFullDate(committee.start_date)}</span>
              <span className="font-bold text-text-primary">
                {periodProgress.progressPct}% Berjalan
              </span>
              <span>Selesai: {formatFullDate(committee.end_date)}</span>
            </div>
          </div>

          {/* Notes if any */}
          {committee.notes && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-text-primary">Catatan Kepanitiaan</span>
              <p className="text-xs text-text-secondary leading-relaxed bg-page-background/40 p-3 rounded-xl border border-border-subtle/60">
                {committee.notes}
              </p>
            </div>
          )}

          {/* Section 1: Jadwal Rapat */}
          <div className="flex flex-col gap-3 pt-2 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-bold text-text-primary">
                  Jadwal Rapat & Koordinasi
                </h3>
                <p className="text-xs text-text-secondary">
                  {commMeetings.length > 0
                    ? `${commMeetings.length} rapat terdaftar`
                    : 'Belum ada agenda rapat'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedMeeting(null);
                  setIsMeetingModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-category-kepanitiaan hover:bg-category-kepanitiaan/90 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus size={14} weight="bold" />
                <span>Tambah Rapat</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 mt-1">
              {commMeetings.length === 0 ? (
                <div className="p-6 text-center rounded-2xl border-2 border-dashed border-border-subtle flex flex-col items-center justify-center gap-2 bg-page-background/30">
                  <div className="w-10 h-10 rounded-full bg-category-kepanitiaan-tint text-category-kepanitiaan flex items-center justify-center">
                    <CalendarBlank size={20} weight="bold" />
                  </div>
                  <span className="text-xs font-semibold text-text-primary">
                    Belum ada jadwal rapat
                  </span>
                  <p className="text-[11px] text-text-secondary max-w-xs">
                    Jadwalkan rapat divisi atau rapat pleno, lengkapi link Zoom atau ruang pertemuan.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMeeting(null);
                      setIsMeetingModalOpen(true);
                    }}
                    className="mt-1 text-xs text-category-kepanitiaan font-bold hover:underline"
                  >
                    + Jadwalkan Rapat Pertama
                  </button>
                </div>
              ) : (
                commMeetings.map((m) => {
                  const isVideo =
                    m.location.toLowerCase().includes('zoom') ||
                    m.location.toLowerCase().includes('meet');

                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl border border-border-subtle bg-surface-card hover:border-category-kepanitiaan/40 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-category-kepanitiaan-tint text-category-kepanitiaan flex items-center justify-center shrink-0 mt-0.5">
                          {isVideo ? <VideoCamera size={16} /> : <MapPin size={16} />}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text-primary truncate">
                              {m.title}
                            </span>
                            {m.is_recurring && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-category-kepanitiaan bg-category-kepanitiaan-tint px-2 py-0.5 rounded-full shrink-0">
                                <ArrowsClockwise size={12} />
                                <span>Rutin</span>
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-secondary mt-0.5">
                            <span className="font-medium text-text-primary">
                              {formatFullDate(m.meeting_date)} · {m.start_time}
                            </span>
                            <span>•</span>
                            <span className="truncate">{m.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMeeting(m);
                            setIsMeetingModalOpen(true);
                          }}
                          className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-page-background rounded-lg transition-colors cursor-pointer"
                          title="Edit rapat"
                        >
                          <PencilSimple size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus rapat "${m.title}"?`)) deleteMeeting(m.id);
                          }}
                          className="p-1.5 text-text-secondary hover:text-semantic-urgent hover:bg-status-not-started-tint rounded-lg transition-colors cursor-pointer"
                          title="Hapus rapat"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 2: Job Desc & Tugas Kepanitiaan */}
          <div className="flex flex-col gap-3 pt-2 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-bold text-text-primary">
                  Job Desc & Tugas Divisi
                </h3>
                <p className="text-xs text-text-secondary">
                  {totalCount > 0
                    ? `${doneCount} dari ${totalCount} tugas selesai (${jobDescPct}%)`
                    : 'Belum ada job desc terdaftar'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus size={14} weight="bold" />
                <span>Tambah Job Desc</span>
              </button>
            </div>

            {/* Progress Bar */}
            {totalCount > 0 && (
              <div className="w-full h-2 bg-status-not-started-tint rounded-full overflow-hidden">
                <div
                  className="h-full bg-category-kepanitiaan rounded-full transition-all duration-500"
                  style={{ width: `${jobDescPct}%` }}
                />
              </div>
            )}

            <div className="flex flex-col gap-2 mt-1">
              {commTasks.length === 0 ? (
                <div className="p-6 text-center rounded-2xl border-2 border-dashed border-border-subtle flex flex-col items-center justify-center gap-2 bg-page-background/30">
                  <div className="w-10 h-10 rounded-full bg-page-background border border-border-subtle text-text-secondary flex items-center justify-center">
                    <Users size={20} weight="bold" />
                  </div>
                  <span className="text-xs font-semibold text-text-primary">
                    Belum ada job desc divisi
                  </span>
                  <p className="text-[11px] text-text-secondary max-w-xs">
                    Catat rincian tanggung jawab dan tugas kepanitiaanmu agar progress divisi terpantau rapi.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="mt-1 text-xs text-primary font-bold hover:underline"
                  >
                    + Tambah Job Desc Pertama
                  </button>
                </div>
              ) : (
                commTasks.map((t) => {
                  const isDone = t.status === 'SELESAI';
                  const isInProgress = t.status === 'SEDANG_DIKERJAKAN';

                  return (
                    <div
                      key={t.id}
                      className={cn(
                        'p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all',
                        isDone
                          ? 'bg-page-background/50 border-border-subtle/70 opacity-75'
                          : 'bg-surface-card border-border-subtle hover:border-primary/40'
                      )}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => cycleTaskStatus(t.id)}
                          className="mt-0.5 text-text-secondary hover:text-primary transition-transform active:scale-90 cursor-pointer shrink-0"
                          title="Klik untuk ubah status tugas"
                        >
                          {isDone ? (
                            <CheckCircle size={20} weight="fill" className="text-status-completed" />
                          ) : isInProgress ? (
                            <div className="w-5 h-5 rounded-full border-2 border-category-kepanitiaan bg-category-kepanitiaan-tint flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-category-kepanitiaan" />
                            </div>
                          ) : (
                            <Circle size={20} className="text-status-not-started hover:text-primary" />
                          )}
                        </button>

                        <div className="flex flex-col min-w-0">
                          <span
                            className={cn(
                              'text-xs font-semibold break-words',
                              isDone ? 'line-through text-text-secondary' : 'text-text-primary'
                            )}
                          >
                            {t.title}
                          </span>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-secondary mt-0.5">
                            <span className="flex items-center gap-1">
                              <CalendarBlank size={12} />
                              {t.deadlineDisplay || t.deadline.split('T')[0]}
                            </span>
                            {t.notes && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[200px] italic">{t.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-page-background rounded-lg transition-colors cursor-pointer"
                          title="Edit tugas"
                        >
                          <PencilSimple size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus tugas "${t.title}"?`)) deleteTask(t.id);
                          }}
                          className="p-1.5 text-text-secondary hover:text-semantic-urgent hover:bg-status-not-started-tint rounded-lg transition-colors cursor-pointer"
                          title="Hapus tugas"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Sub-modal: Meeting */}
      {isMeetingModalOpen && (
        <CommitteeMeetingModal
          isOpen={isMeetingModalOpen}
          onClose={() => {
            setIsMeetingModalOpen(false);
            setSelectedMeeting(null);
          }}
          committee={committee}
          editingMeeting={selectedMeeting}
        />
      )}

      {/* Sub-modal: Job Desc Task */}
      {isTaskModalOpen && (
        <CommitteeTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          committee={committee}
          editingTask={selectedTask}
        />
      )}
    </>
  );
};
