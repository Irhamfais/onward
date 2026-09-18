'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { useApp } from '@/context/app-context';
import { Committee } from '@/types';
import { Users, Trash, CalendarBlank } from '@phosphor-icons/react';
import { calculatePeriodProgress, formatDateDisplay } from '@/lib/date-utils';

interface CommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCommittee?: Committee | null;
}

export const CommitteeModal: React.FC<CommitteeModalProps> = ({
  isOpen,
  onClose,
  editingCommittee,
}) => {
  const { addCommittee, updateCommittee, deleteCommittee } = useApp();

  const [name, setName] = useState('');
  const [division, setDivision] = useState('');
  const [role, setRole] = useState('Anggota Aktif');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingCommittee) {
        setName(editingCommittee.organization_event_name);
        setDivision(editingCommittee.role_division);
        setRole(editingCommittee.role || 'Anggota Aktif');
        setStartDate(editingCommittee.start_date);
        setEndDate(editingCommittee.end_date);
        setNotes(editingCommittee.notes || '');
      } else {
        setName('');
        setDivision('');
        setRole('Anggota Aktif');
        setNotes('');

        const today = new Date();
        setStartDate(today.toISOString().split('T')[0]);

        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
        setEndDate(threeMonthsLater.toISOString().split('T')[0]);
      }
    }
  }, [isOpen, editingCommittee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !division.trim() || !startDate || !endDate) return;

    const periodProgress = calculatePeriodProgress(startDate, endDate);
    const periodDisplay = `${formatDateDisplay(startDate)} – ${formatDateDisplay(endDate)}`;

    if (editingCommittee) {
      updateCommittee(editingCommittee.id, {
        organization_event_name: name.trim(),
        role_division: division.trim(),
        role,
        start_date: startDate,
        end_date: endDate,
        periodDisplay,
        progressPct: periodProgress.progressPct,
        remainingDays: periodProgress.remainingText,
        status: periodProgress.isEnded ? 'Arsip Selesai' : 'Sedang Berjalan',
        notes: notes.trim() || undefined,
      });
    } else {
      addCommittee({
        organization_event_name: name.trim(),
        role_division: division.trim(),
        role,
        start_date: startDate,
        end_date: endDate,
        periodDisplay,
        progressPct: periodProgress.progressPct,
        remainingDays: periodProgress.remainingText,
        status: periodProgress.isEnded ? 'Arsip Selesai' : 'Sedang Berjalan',
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (
      editingCommittee &&
      confirm(`Hapus kepanitiaan "${editingCommittee.organization_event_name}" beserta seluruh jadwal rapat dan job desc-nya?`)
    ) {
      deleteCommittee(editingCommittee.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCommittee ? 'Edit Data Kepanitiaan' : 'Tambah Kepanitiaan Baru'}
      subtitle="Kelola kepengurusan organisasi, divisi, dan rentang periode aktif"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Organization / Event Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary">
            Nama Organisasi / Event <span className="text-semantic-urgent">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Misal: BEM Fakultas, Seminar Nasional AI 2026, Dies Natalis"
            className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Division & Role */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary">
              Divisi / Bidang <span className="text-semantic-urgent">*</span>
            </label>
            <input
              type="text"
              required
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              placeholder="Misal: Sie Acara, Humas, IT"
              className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary">Peran / Jabatan</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all cursor-pointer"
            >
              <option value="Ketua Pelaksana">Ketua Pelaksana</option>
              <option value="Wakil Ketua">Wakil Ketua</option>
              <option value="Koordinator Divisi">Koordinator Divisi</option>
              <option value="Sekretaris">Sekretaris</option>
              <option value="Bendahara">Bendahara</option>
              <option value="Staff Ahli">Staff Ahli</option>
              <option value="Anggota Aktif">Anggota Aktif</option>
            </select>
          </div>
        </div>

        {/* Period Range */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
            <CalendarBlank size={14} className="text-category-kepanitiaan" />
            <span>Rentang Periode Masa Kepengurusan</span>
            <span className="text-semantic-urgent">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-text-secondary block mb-1">Tanggal Mulai</span>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div>
              <span className="text-[10px] text-text-secondary block mb-1">Tanggal Berakhir</span>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary">Catatan / Deskripsi Kepanitiaan</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Misal: Tanggung jawab mengoordinasikan rundown dan MC selama acara..."
            className="w-full px-3.5 py-2.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle mt-2">
          {editingCommittee ? (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 text-xs text-semantic-urgent hover:bg-status-not-started-tint px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Trash size={15} />
              <span>Hapus Kepanitiaan</span>
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
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark active:scale-[0.98] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Users size={16} weight="bold" />
              <span>{editingCommittee ? 'Simpan Perubahan' : 'Simpan Kepanitiaan'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
