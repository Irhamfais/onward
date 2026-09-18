'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { useApp } from '@/context/app-context';
import { Competition, UnifiedTask, TaskStatus } from '@/types';
import { Trash, CalendarBlank, Clock } from '@phosphor-icons/react';
import { formatDateDisplay } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

interface CompetitionTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  competition: Competition;
  editingTask?: UnifiedTask | null;
}

export const CompetitionTaskModal: React.FC<CompetitionTaskModalProps> = ({
  isOpen,
  onClose,
  competition,
  editingTask,
}) => {
  const { addTask, updateTask, deleteTask } = useApp();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('23:59');
  const [status, setStatus] = useState<TaskStatus>('BELUM_MULAI');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTitle(editingTask.title);
        setStatus(editingTask.status);
        setNotes(editingTask.notes || '');
        if (editingTask.deadline) {
          const d = new Date(editingTask.deadline);
          setDate(d.toISOString().split('T')[0]);
          setTime(
            `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
          );
        }
      } else {
        setTitle('');
        setStatus('BELUM_MULAI');
        setNotes('');
        // Default deadline to 3 days before submission or tomorrow
        const defDate = new Date();
        defDate.setDate(defDate.getDate() + 3);
        setDate(defDate.toISOString().split('T')[0]);
        setTime('23:59');
      }
    }
  }, [isOpen, editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const fullDeadline = `${date}T${time || '23:59'}:00`;
    const deadlineDisplay = formatDateDisplay(fullDeadline);

    if (editingTask) {
      updateTask(editingTask.id, {
        title: title.trim(),
        deadline: fullDeadline,
        deadlineDisplay,
        status,
        notes: notes.trim() || undefined,
      });
    } else {
      addTask({
        title: title.trim(),
        category: 'LOMBA',
        parent_title: competition.name,
        parent_id: competition.id,
        deadline: fullDeadline,
        deadlineDisplay,
        status,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (editingTask && confirm(`Hapus milestone tugas "${editingTask.title}"?`)) {
      deleteTask(editingTask.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTask ? 'Edit Milestone Lomba' : `Tambah Milestone • ${competition.name}`}
      subtitle={`Tugas milestone kompetisi ${competition.name}`}
      maxWidth="max-w-[460px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary">
            Judul Tugas / Milestone <span className="text-semantic-urgent">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Misal: Finalisasi proposal, Submit video demo, Pitch deck..."
            className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Status Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary">Status Pengerjaan</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setStatus('BELUM_MULAI')}
              className={cn(
                'py-1.5 px-2 rounded-xl border text-[11px] font-medium flex items-center justify-center transition-all cursor-pointer',
                status === 'BELUM_MULAI'
                  ? 'border-status-not-started bg-status-not-started-tint text-text-primary font-bold ring-1 ring-status-not-started'
                  : 'border-border-subtle bg-surface-card text-text-secondary'
              )}
            >
              Belum Mulai
            </button>
            <button
              type="button"
              onClick={() => setStatus('SEDANG_DIKERJAKAN')}
              className={cn(
                'py-1.5 px-2 rounded-xl border text-[11px] font-medium flex items-center justify-center transition-all cursor-pointer',
                status === 'SEDANG_DIKERJAKAN'
                  ? 'border-category-lomba bg-category-lomba-tint text-[#B45309] font-bold ring-1 ring-category-lomba'
                  : 'border-border-subtle bg-surface-card text-text-secondary'
              )}
            >
              Dikerjakan
            </button>
            <button
              type="button"
              onClick={() => setStatus('SELESAI')}
              className={cn(
                'py-1.5 px-2 rounded-xl border text-[11px] font-medium flex items-center justify-center transition-all cursor-pointer',
                status === 'SELESAI'
                  ? 'border-status-completed bg-status-completed-tint text-status-completed font-bold ring-1 ring-status-completed'
                  : 'border-border-subtle bg-surface-card text-text-secondary'
              )}
            >
              Selesai
            </button>
          </div>
        </div>

        {/* Deadline */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <CalendarBlank size={14} className="text-text-secondary" />
              <span>Tenggat Tanggal</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <Clock size={14} className="text-text-secondary" />
              <span>Jam</span>
            </label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Catatan */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary">Catatan / Link Tugas</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Misal: Penanggung jawab: AR, file ada di folder GDrive..."
            className="w-full px-3.5 py-2.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle mt-1">
          {editingTask ? (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1 text-xs text-semantic-urgent hover:bg-status-not-started-tint px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Trash size={14} />
              <span>Hapus</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-page-background transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark active:scale-[0.98] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              {editingTask ? 'Simpan Perubahan' : 'Tambah Milestone'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
