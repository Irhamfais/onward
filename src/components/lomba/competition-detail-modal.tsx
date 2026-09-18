'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { useApp } from '@/context/app-context';
import { Competition, UnifiedTask, TaskStatus } from '@/types';
import { 
  Trophy, 
  PencilSimple, 
  Trash, 
  Plus, 
  CalendarBlank, 
  Clock, 
  HourglassHigh, 
  Users, 
  LinkSimple, 
  ArrowSquareOut,
  CheckCircle,
  Circle,
  Hourglass,
  Medal,
  Check
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { formatCountdown, formatFullDate } from '@/lib/date-utils';
import { CompetitionTaskModal } from './competition-task-modal';

interface CompetitionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  competition: Competition;
  onEditCompetition: () => void;
}

export const CompetitionDetailModal: React.FC<CompetitionDetailModalProps> = ({
  isOpen,
  onClose,
  competition,
  onEditCompetition,
}) => {
  const { tasks, cycleTaskStatus, deleteTask, deleteCompetition } = useApp();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<UnifiedTask | null>(null);

  // Filter tasks belonging to this competition
  const compTasks = tasks.filter(
    (t) =>
      t.category === 'LOMBA' &&
      (t.parent_id === competition.id ||
        (!t.parent_id && t.parent_title?.trim().toLowerCase() === competition.name?.trim().toLowerCase()))
  );

  const doneCount = compTasks.filter((t) => t.status === 'SELESAI').length;
  const inProgressCount = compTasks.filter((t) => t.status === 'SEDANG_DIKERJAKAN').length;
  const totalCount = compTasks.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Countdown calculations
  const subCountdown = formatCountdown(competition.submission_deadline, 'Submisi');
  const regCountdown = competition.reg_deadline
    ? formatCountdown(competition.reg_deadline, 'Pendaftaran')
    : null;

  const avatarList = competition.team_members
    ? competition.team_members.split(',').map((m) => m.trim()).filter((m) => m.length > 0)
    : ['AR'];

  const handleDeleteComp = () => {
    if (confirm(`Hapus kompetisi "${competition.name}" beserta seluruh tugas milestonenya?`)) {
      deleteCompetition(competition.id);
      onClose();
    }
  };

  const getStatusBadge = () => {
    switch (competition.status) {
      case 'MENDAFTAR':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF8EB] text-[#C27803] border border-[#FDE68A]">
            Mendaftar
          </span>
        );
      case 'PROSES_PENGERJAAN':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-category-lomba-tint text-[#B45309] border border-category-lomba/30">
            Proses Pengerjaan
          </span>
        );
      case 'SUDAH_SUBMIT':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-category-kuliah-tint text-[#4F46E5] border border-category-kuliah/30">
            Sudah Submit
          </span>
        );
      case 'HASIL_KELUAR':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-status-completed-tint text-[#16A34A] border border-status-completed/30 flex items-center gap-1">
            <Medal size={14} weight="bold" />
            {competition.achievement || 'Hasil Keluar'}
          </span>
        );
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={competition.name}
        subtitle={`${competition.category || 'Kompetisi'} • Tingkat ${competition.level || 'Nasional'}`}
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col gap-6">
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <span className="text-xs text-text-secondary">
                {competition.level || 'Nasional'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onEditCompetition}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-subtle bg-surface-card hover:bg-page-background text-text-primary text-xs font-semibold transition-colors cursor-pointer"
              >
                <PencilSimple size={14} />
                <span>Edit Lomba</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteComp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-semantic-urgent/30 bg-status-not-started-tint hover:bg-semantic-urgent/10 text-semantic-urgent text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash size={14} />
                <span>Hapus</span>
              </button>
            </div>
          </div>

          {/* Countdown & Deadline Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Submisi Deadline */}
            <div
              className={cn(
                'p-4 rounded-2xl border flex items-center gap-3.5',
                subCountdown.isUrgent
                  ? 'bg-[#FEF2F2] border-[#FECACA]'
                  : 'bg-category-lomba-tint/50 border-category-lomba/30'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  subCountdown.isUrgent
                    ? 'bg-semantic-urgent text-white'
                    : 'bg-category-lomba text-white'
                )}
              >
                <HourglassHigh size={20} weight="bold" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Tenggat Submisi
                </span>
                <span
                  className={cn(
                    'text-sm font-bold',
                    subCountdown.isUrgent ? 'text-semantic-urgent' : 'text-text-primary'
                  )}
                >
                  {subCountdown.text}
                </span>
                <span className="text-[11px] text-text-secondary">
                  {formatFullDate(competition.submission_deadline)}
                </span>
              </div>
            </div>

            {/* Pendaftaran / Info status */}
            {competition.reg_deadline ? (
              <div className="p-4 rounded-2xl border border-border-subtle bg-page-background/60 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-page-background border border-border-subtle text-text-secondary flex items-center justify-center shrink-0">
                  <CalendarBlank size={20} weight="bold" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    Batas Pendaftaran
                  </span>
                  <span className="text-sm font-bold text-text-primary">
                    {regCountdown ? regCountdown.text : '-'}
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    {formatFullDate(competition.reg_deadline)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-border-subtle bg-page-background/60 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-category-kuliah-tint text-[#4F46E5] flex items-center justify-center shrink-0">
                  <Trophy size={20} weight="bold" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    Kategori & Bidang
                  </span>
                  <span className="text-sm font-bold text-text-primary">
                    {competition.category || 'Umum'}
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    Status: {competition.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Description & Team & Links */}
          <div className="flex flex-col gap-3">
            {competition.description && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-text-primary">Deskripsi Proyek</span>
                <p className="text-xs text-text-secondary leading-relaxed bg-page-background/40 p-3 rounded-xl border border-border-subtle/60">
                  {competition.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Tim */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <Users size={14} className="text-text-secondary" />
                  <span>Anggota Tim</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {avatarList.map((m, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-page-background border border-border-subtle text-text-primary font-medium"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tautan Terkait */}
              {competition.related_links && competition.related_links.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <LinkSimple size={14} className="text-text-secondary" />
                    <span>Tautan Terkait</span>
                  </span>
                  <div className="flex flex-col gap-1">
                    {competition.related_links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.startsWith('http') ? link : `https://${link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
                      >
                        <ArrowSquareOut size={13} className="shrink-0" />
                        <span className="truncate">{link}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Milestones Section */}
          <div className="flex flex-col gap-3 pt-2 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-bold text-text-primary">
                  Tugas & Milestone Pengerjaan
                </h3>
                <p className="text-xs text-text-secondary">
                  {totalCount > 0
                    ? `${doneCount} dari ${totalCount} tugas selesai (${progressPct}%)`
                    : 'Belum ada milestone tugas'}
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
                <span>Tambah Milestone</span>
              </button>
            </div>

            {/* Progress Bar */}
            {totalCount > 0 && (
              <div className="w-full h-2 bg-status-not-started-tint rounded-full overflow-hidden">
                <div
                  className="h-full bg-category-lomba rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            )}

            {/* Task List */}
            <div className="flex flex-col gap-2 mt-1">
              {compTasks.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-border-subtle flex flex-col items-center justify-center gap-2 bg-page-background/30">
                  <div className="w-10 h-10 rounded-full bg-category-lomba-tint text-category-lomba flex items-center justify-center">
                    <Trophy size={20} weight="bold" />
                  </div>
                  <span className="text-xs font-semibold text-text-primary">
                    Belum ada milestone lomba
                  </span>
                  <p className="text-[11px] text-text-secondary max-w-xs">
                    Rancang pembagian pengerjaan seperti proposal, prototype figma, video pitching, dan submisi.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="mt-1 text-xs text-primary font-bold hover:underline"
                  >
                    + Tambah Milestone Pertama
                  </button>
                </div>
              ) : (
                compTasks.map((t) => {
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
                      {/* Left: Cycle checkbox & details */}
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
                            <div className="w-5 h-5 rounded-full border-2 border-category-lomba bg-category-lomba-tint flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-category-lomba" />
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

                      {/* Right: Actions */}
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

      {/* Task Modal for milestone */}
      {isTaskModalOpen && (
        <CompetitionTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          competition={competition}
          editingTask={selectedTask}
        />
      )}
    </>
  );
};
