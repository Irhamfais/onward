'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { useApp } from '@/context/app-context';
import { Course } from '@/types';
import { Check, Trash, WarningCircle, Warning, Clock } from '@phosphor-icons/react';
import {
  calculateEndTime,
  checkCourseOverlap,
  timeToMinutes,
  GRID_END_MINUTES,
} from '@/lib/course-utils';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCourse?: Course | null;
  initialDay?: number;
  initialStartTime?: string;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  editingCourse,
  initialDay,
  initialStartTime,
}) => {
  const { courses, addCourse, updateCourse, deleteCourse, activeSemesterId } = useApp();

  const [name, setName] = useState('');
  const [sks, setSks] = useState(3);
  const [courseType, setCourseType] = useState('Wajib Prodi');
  const [lecturer, setLecturer] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('08:30');
  const [room, setRoom] = useState('');
  const [recurring, setRecurring] = useState(true);
  const [timeError, setTimeError] = useState<string | null>(null);

  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Automatically calculate end time based on: durasi_menit = SKS * 50
  const calculatedEndTime = useMemo(() => {
    return calculateEndTime(startTime, sks);
  }, [startTime, sks]);

  // Check if calculated schedule exceeds standard university operational hours (17:30)
  const isExceedingOperationalHours = useMemo(() => {
    const endMinutes = timeToMinutes(calculatedEndTime);
    return endMinutes > GRID_END_MINUTES;
  }, [calculatedEndTime]);

  // Check in real-time if schedule clashes with another course on the same day
  const clashingCourse = useMemo(() => {
    if (!isOpen || !startTime || !calculatedEndTime) return null;

    return checkCourseOverlap(
      {
        id: editingCourse?.id,
        day_of_week: Number(dayOfWeek),
        start_time: startTime,
        end_time: calculatedEndTime,
        semester_id: activeSemesterId || undefined,
      },
      courses
    );
  }, [isOpen, editingCourse, dayOfWeek, startTime, calculatedEndTime, courses, activeSemesterId]);

  useEffect(() => {
    if (isOpen) {
      if (editingCourse) {
        setName(editingCourse.course_name);
        setSks(editingCourse.credits_sks || 3);
        setCourseType(editingCourse.type || 'Wajib Prodi');
        setLecturer(editingCourse.lecturer || '');
        setDayOfWeek(editingCourse.day_of_week || 1);
        setStartTime(editingCourse.start_time || '08:30');
        setRoom(editingCourse.room_location || '');
        setRecurring(editingCourse.is_recurring ?? true);
      } else {
        setName('');
        setSks(3);
        setCourseType('Wajib Prodi');
        setLecturer('');
        setDayOfWeek(initialDay ?? 1);
        setStartTime(initialStartTime ?? '08:30');
        setRoom('');
        setRecurring(true);
      }
      setTimeError(null);
    }
  }, [isOpen, editingCourse, initialDay, initialStartTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeError(null);

    if (!name.trim() || !room.trim()) return;

    // Check for clashing course overlap on the same day
    if (clashingCourse) {
      setTimeError(
        `Jadwal bentrok dengan mata kuliah "${clashingCourse.course_name}" (${clashingCourse.start_time} - ${clashingCourse.end_time}) pada hari ${dayNames[dayOfWeek - 1]}. Silakan pilih hari atau jam lain.`
      );
      return;
    }

    const dayName = dayNames[dayOfWeek - 1] || 'Senin';
    const timeFormatted = `${dayName} ${startTime} - ${calculatedEndTime}`;

    if (editingCourse) {
      updateCourse(editingCourse.id, {
        course_name: name.trim(),
        credits_sks: Number(sks),
        type: courseType,
        lecturer: lecturer.trim() || undefined,
        day_of_week: Number(dayOfWeek),
        start_time: startTime,
        end_time: calculatedEndTime,
        room_location: room.trim(),
        is_recurring: recurring,
        time: timeFormatted,
      });
    } else {
      addCourse({
        course_name: name.trim(),
        credits_sks: Number(sks),
        type: courseType,
        lecturer: lecturer.trim() || undefined,
        day_of_week: Number(dayOfWeek),
        start_time: startTime,
        end_time: calculatedEndTime,
        room_location: room.trim(),
        is_recurring: recurring,
        time: timeFormatted,
        semester_id: activeSemesterId || undefined,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (editingCourse && confirm(`Hapus mata kuliah "${editingCourse.course_name}" beserta seluruh tugasnya?`)) {
      deleteCourse(editingCourse.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCourse ? 'Edit Jadwal Mata Kuliah' : 'Tambah Mata Kuliah'}
      subtitle={editingCourse ? 'Perbarui jadwal dan informasi perkuliahan' : 'Daftarkan mata kuliah baru ke jadwal semester aktif'}
      maxWidth="max-w-[520px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Error Validation: Overlap Clash */}
        {timeError && (
          <div className="p-3.5 rounded-xl bg-semantic-urgent-tint text-semantic-urgent text-xs font-semibold border border-semantic-urgent/20 flex items-start gap-2.5 leading-relaxed animate-in fade-in">
            <WarningCircle size={18} weight="fill" className="shrink-0 mt-0.5" />
            <span>{timeError}</span>
          </div>
        )}

        {/* Real-time Overlap Warning if clashing */}
        {!timeError && clashingCourse && (
          <div className="p-3.5 rounded-xl bg-semantic-urgent-tint text-semantic-urgent text-xs font-semibold border border-semantic-urgent/20 flex items-start gap-2.5 leading-relaxed animate-in fade-in">
            <WarningCircle size={18} weight="fill" className="shrink-0 mt-0.5" />
            <span>
              Bentrok dengan mata kuliah <strong>"{clashingCourse.course_name}"</strong> ({clashingCourse.start_time} – {clashingCourse.end_time}) pada hari yang sama.
            </span>
          </div>
        )}

        {/* Warning: Exceeding Operational Hours (Allowed to save, but shown as notice) */}
        {isExceedingOperationalHours && (
          <div className="p-3 rounded-xl bg-[#FFF9E6] text-[#B76E00] text-xs font-medium border border-[#FFE082] flex items-start gap-2 leading-relaxed animate-in fade-in">
            <Warning size={16} weight="fill" className="shrink-0 mt-0.5 text-[#E68A00]" />
            <span>
              Peringatan: Jadwal selesai pukul <strong>{calculatedEndTime}</strong> melebihi jam operasional perkuliahan kampus (18:30). Jadwal tetap diizinkan untuk disimpan.
            </span>
          </div>
        )}

        {/* Nama Mata Kuliah */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary">Nama Mata Kuliah</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (timeError) setTimeError(null);
            }}
            placeholder="Misal: Kecerdasan Tiruan / Basis Data"
            className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* SKS & Sifat */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-primary">Bobot SKS</label>
              <span className="text-[11px] font-semibold text-category-kuliah">
                {sks * 50} Menit
              </span>
            </div>
            <select
              value={sks}
              onChange={(e) => {
                setSks(Number(e.target.value));
                if (timeError) setTimeError(null);
              }}
              className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all cursor-pointer font-medium"
            >
              {[1, 2, 3, 4, 6].map((num) => (
                <option key={num} value={num}>
                  {num} SKS ({num * 50} menit)
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary">Sifat Mata Kuliah</label>
            <select
              value={courseType}
              onChange={(e) => setCourseType(e.target.value)}
              className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all cursor-pointer"
            >
              <option value="Wajib Prodi">Wajib Prodi</option>
              <option value="Pilihan">Pilihan</option>
              <option value="Wajib Universitas">Wajib Universitas</option>
            </select>
          </div>
        </div>

        {/* Dosen */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary">Dosen Pengampu</label>
          <input
            type="text"
            value={lecturer}
            onChange={(e) => setLecturer(e.target.value)}
            placeholder="Misal: Dr. Bayu Pratama, M.Kom"
            className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Hari & Waktu */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary">Hari & Waktu Perkuliahan</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Hari */}
            <div>
              <select
                value={dayOfWeek}
                onChange={(e) => {
                  setDayOfWeek(Number(e.target.value));
                  if (timeError) setTimeError(null);
                }}
                className="w-full h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all cursor-pointer font-medium"
              >
                <option value={1}>Senin</option>
                <option value={2}>Selasa</option>
                <option value={3}>Rabu</option>
                <option value={4}>Kamis</option>
                <option value={5}>Jumat</option>
                <option value={6}>Sabtu</option>
              </select>
            </div>

            {/* Jam Mulai */}
            <div>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (timeError) setTimeError(null);
                  }}
                  className="w-full h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all font-semibold"
                />
              </div>
            </div>

            {/* Jam Selesai (Otomatis) */}
            <div>
              <div
                title="Dihitung otomatis: Jam Mulai + (SKS × 50 menit)"
                className="w-full h-10 px-3 bg-page-background border border-border-subtle rounded-xl text-xs font-bold text-text-primary flex items-center justify-between cursor-default"
              >
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-category-kuliah" />
                  <span>{calculatedEndTime}</span>
                </div>
                <span className="text-[10px] font-semibold text-category-kuliah bg-category-kuliah-tint px-1.5 py-0.5 rounded">
                  Otomatis
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-text-secondary mt-0.5">
            Jam selesai dihitung otomatis berdasarkan bobot {sks} SKS ({sks * 50} menit).
          </p>
        </div>

        {/* Ruangan */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary">Ruang Kuliah / Laboratorium</label>
          <input
            type="text"
            required
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Misal: Lab Komputer 2 / Ruang A201"
            className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Berulang */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="check-recurring"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="rounded text-primary focus:ring-primary cursor-pointer accent-primary"
          />
          <label htmlFor="check-recurring" className="text-xs text-text-secondary cursor-pointer select-none">
            Jadwal berulang mingguan selama semester aktif
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle mt-1">
          {editingCourse ? (
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
              disabled={Boolean(clashingCourse)}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={14} weight="bold" />
              <span>{editingCourse ? 'Simpan Perubahan' : 'Simpan Mata Kuliah'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
