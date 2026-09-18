'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { useApp } from '@/context/app-context';
import { Committee, CommitteeMeeting } from '@/types';
import { Trash, CalendarBlank, Clock, MapPin, ArrowsClockwise } from '@phosphor-icons/react';

interface CommitteeMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  committee: Committee;
  editingMeeting?: CommitteeMeeting | null;
}

export const CommitteeMeetingModal: React.FC<CommitteeMeetingModalProps> = ({
  isOpen,
  onClose,
  committee,
  editingMeeting,
}) => {
  const { addMeeting, updateMeeting, deleteMeeting } = useApp();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('16:00');
  const [location, setLocation] = useState('via Zoom Meeting');
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingMeeting) {
        setTitle(editingMeeting.title);
        setDate(editingMeeting.meeting_date);
        setTime(editingMeeting.start_time || '16:00');
        setLocation(editingMeeting.location);
        setIsRecurring(!!editingMeeting.is_recurring);
      } else {
        setTitle('Rapat Koordinasi Divisi');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDate(tomorrow.toISOString().split('T')[0]);
        setTime('16:00');
        setLocation('via Zoom Meeting');
        setIsRecurring(false);
      }
    }
  }, [isOpen, editingMeeting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !location.trim()) return;

    if (editingMeeting) {
      updateMeeting(editingMeeting.id, {
        title: title.trim(),
        meeting_date: date,
        start_time: time,
        location: location.trim(),
        is_recurring: isRecurring,
      });
    } else {
      addMeeting({
        committee_id: committee.id,
        title: title.trim(),
        meeting_date: date,
        start_time: time,
        location: location.trim(),
        is_recurring: isRecurring,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (editingMeeting && confirm(`Hapus jadwal rapat "${editingMeeting.title}"?`)) {
      deleteMeeting(editingMeeting.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMeeting ? 'Edit Jadwal Rapat' : `Jadwalkan Rapat • ${committee.organization_event_name}`}
      subtitle={`Kelola agenda dan lokasi rapat untuk divisi ${committee.role_division}`}
      maxWidth="max-w-[460px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary">
            Agenda / Judul Rapat <span className="text-semantic-urgent">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Misal: Rapat Koordinasi Rundown, Evaluasi Progress..."
            className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <CalendarBlank size={14} className="text-text-secondary" />
              <span>Tanggal Rapat</span>
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
              <span>Waktu Mulai</span>
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

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
            <MapPin size={14} className="text-text-secondary" />
            <span>Lokasi / Platform Pertemuan</span>
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Misal: via Zoom Meeting, Ruang Sidang BEM, Selasar..."
            className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Recurring Toggle */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="meeting-recurring-check"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="rounded text-primary focus:ring-primary cursor-pointer"
          />
          <label
            htmlFor="meeting-recurring-check"
            className="text-xs text-text-primary font-medium cursor-pointer select-none flex items-center gap-1.5"
          >
            <ArrowsClockwise size={14} className="text-category-kepanitiaan" />
            <span>Tandai sebagai rapat rutin berulang (Mingguan / Dwimingguan)</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle mt-1">
          {editingMeeting ? (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1 text-xs text-semantic-urgent hover:bg-status-not-started-tint px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Trash size={14} />
              <span>Hapus Rapat</span>
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
              {editingMeeting ? 'Simpan Perubahan' : 'Jadwalkan Rapat'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
