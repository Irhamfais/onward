'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { useApp } from '@/context/app-context';
import { Course, UnifiedTask } from '@/types';
import { Check, Trash, CalendarBlank, Clock } from '@phosphor-icons/react';

interface CourseTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  editingTask?: UnifiedTask | null;
}

export const CourseTaskModal: React.FC<CourseTaskModalProps> = ({
  isOpen,
  onClose,
  course,
  editingTask,
}) => {
  const { addTask, updateTask, deleteTask } = useApp();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('23:59');
  const [notes, setNotes] = useState('');

  // Default date to tomorrow if adding new
  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTitle(editingTask.title);
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
        setNotes('');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDate(tomorrow.toISOString().split('T')[0]);
        setTime('23:59');
      }
    }
  }, [isOpen, editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const fullDeadline = `${date}T${time || '23:59'}:00`;
    const deadlineDateObj = new Date(fullDeadline);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const deadlineDisplay = `${deadlineDateObj.getDate()} ${months[deadlineDateObj.getMonth()]}`;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: title.trim(),
        deadline: fullDeadline,
        deadlineDisplay,
        notes: notes.trim() || undefined,
      });
    } else {
      addTask({
        title: title.trim(),
        category: 'KULIAH',
        parent_title: course.course_name,
        parent_id: course.id,
        deadline: fullDeadline,
        deadlineDisplay,
        status: 'BELUM_MULAI',
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (editingTask && confirm(`Hapus tugas "${editingTask.title}"?`)) {
      deleteTask(editingTask.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTask ? 'Edit Tugas Mata Kuliah' : `Tambah Tugas • ${course.course_name}`}
      subtitle={`Tugas akademik yang terhubung ke mata kuliah ${course.course_name}`}
      maxWidth="max-w-[460px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary">Judul Tugas / Praktikum</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Misal: Tugas ERD & Normalisasi..."
            className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Deadline Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary">Tenggat Tanggal</label>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary">Jam Deadline</label>
            <div className="relative">
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary">Catatan Tambahan (Opsional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Misal: Format PDF dikumpulkan ke portal LMS kampus..."
            className="w-full p-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle mt-1">
          {editingTask ? (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-semantic-urgent hover:bg-semantic-urgent-tint rounded-xl transition-colors cursor-pointer"
            >
              <Trash size={16} />
              <span>Hapus</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-page-background transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={14} weight="bold" />
              <span>{editingTask ? 'Simpan Perubahan' : 'Simpan Tugas'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
