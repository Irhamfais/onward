'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { useApp } from '@/context/app-context';
import { Semester } from '@/types';
import { 
  CalendarBlank, 
  Plus, 
  Archive, 
  CheckCircle, 
  Check,
  CalendarCheck
} from '@phosphor-icons/react';

interface SemesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SemesterModal: React.FC<SemesterModalProps> = ({ isOpen, onClose }) => {
  const { 
    semesters, 
    activeSemesterId, 
    setActiveSemesterId, 
    addSemester, 
    archiveSemester 
  } = useApp();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleCreateSemester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSemester({
      name: name.trim(),
      is_active: isActive,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });

    setName('');
    setStartDate('');
    setEndDate('');
    setIsAddingNew(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengelolaan Semester"
      subtitle="Kelola semester perkuliahan aktif dan arsipkan semester lama"
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col gap-6">
        {/* Semester List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Daftar Semester ({semesters.length})
            </span>
            {!isAddingNew && (
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-tint text-primary text-xs font-semibold hover:bg-primary hover:text-white transition-colors cursor-pointer"
              >
                <Plus size={14} weight="bold" />
                <span>Tambah Semester</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
            {semesters.map((sem) => {
              const isSelected = sem.id === activeSemesterId;

              return (
                <div
                  key={sem.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-primary/40 bg-primary-tint/30 shadow-xs'
                      : 'border-border-subtle bg-surface-card hover:bg-page-background/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        sem.is_active
                          ? 'bg-category-kuliah-tint text-category-kuliah font-bold'
                          : 'bg-status-not-started-tint text-text-secondary'
                      }`}
                    >
                      <CalendarCheck size={18} weight={sem.is_active ? 'fill' : 'regular'} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-text-primary truncate">
                          {sem.name}
                        </span>
                        {sem.is_active ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-completed-tint text-status-completed">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-not-started-tint text-text-secondary">
                            Diarsipkan
                          </span>
                        )}
                      </div>
                      {sem.start_date && (
                        <p className="text-[11px] text-text-secondary mt-0.5">
                          {sem.start_date} s/d {sem.end_date || 'Selesai'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isSelected && (
                      <button
                        type="button"
                        onClick={() => setActiveSemesterId(sem.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-primary hover:bg-primary-tint transition-colors cursor-pointer"
                        title="Buka Semester Ini"
                      >
                        Pilih
                      </button>
                    )}
                    {sem.is_active && semesters.length > 1 && (
                      <button
                        type="button"
                        onClick={() => archiveSemester(sem.id)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-category-lomba hover:bg-category-lomba-tint transition-colors cursor-pointer"
                        title="Arsipkan Semester Ini"
                      >
                        <Archive size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add New Semester Form */}
        {isAddingNew && (
          <form
            onSubmit={handleCreateSemester}
            className="p-4 rounded-2xl border border-primary/30 bg-primary-tint/20 flex flex-col gap-3.5 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-primary/20">
              <span className="text-xs font-bold text-primary">Form Semester Baru</span>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-xs text-text-secondary hover:text-text-primary"
              >
                Batal
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">Nama Semester</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Genap 2026/2027"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is-active-sem"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <label htmlFor="is-active-sem" className="text-xs text-text-primary font-medium cursor-pointer select-none">
                Jadikan sebagai semester aktif saat ini
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Check size={14} weight="bold" />
                <span>Simpan Semester</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-page-background text-text-primary hover:bg-border-subtle text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
