'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { useApp } from '@/context/app-context';
import { Competition, CompetitionStatus } from '@/types';
import { Trophy, Trash, CalendarBlank, Clock, LinkSimple, Users } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { formatDateDisplay } from '@/lib/date-utils';

interface CompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCompetition?: Competition | null;
}

export const CompetitionModal: React.FC<CompetitionModalProps> = ({
  isOpen,
  onClose,
  editingCompetition,
}) => {
  const { addCompetition, updateCompetition, deleteCompetition } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('UI/UX Design');
  const [level, setLevel] = useState('Nasional');
  const [status, setStatus] = useState<CompetitionStatus>('PROSES_PENGERJAAN');
  const [description, setDescription] = useState('');
  const [subDate, setSubDate] = useState('');
  const [subTime, setSubTime] = useState('23:59');
  const [hasRegDeadline, setHasRegDeadline] = useState(false);
  const [regDate, setRegDate] = useState('');
  const [regTime, setRegTime] = useState('23:59');
  const [members, setMembers] = useState('');
  const [achievement, setAchievement] = useState('');
  const [linksText, setLinksText] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingCompetition) {
        setName(editingCompetition.name);
        setCategory(editingCompetition.category || 'UI/UX Design');
        setLevel(editingCompetition.level || 'Nasional');
        setStatus(editingCompetition.status);
        setDescription(editingCompetition.description || '');
        setMembers(editingCompetition.team_members || '');
        setAchievement(editingCompetition.achievement || '');
        setLinksText(editingCompetition.related_links ? editingCompetition.related_links.join('\n') : '');

        if (editingCompetition.submission_deadline) {
          const d = new Date(editingCompetition.submission_deadline);
          setSubDate(d.toISOString().split('T')[0]);
          setSubTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
        } else {
          setSubDate('');
          setSubTime('23:59');
        }

        if (editingCompetition.reg_deadline) {
          setHasRegDeadline(true);
          const d = new Date(editingCompetition.reg_deadline);
          setRegDate(d.toISOString().split('T')[0]);
          setRegTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
        } else {
          setHasRegDeadline(false);
          setRegDate('');
          setRegTime('23:59');
        }
      } else {
        setName('');
        setCategory('UI/UX Design');
        setLevel('Nasional');
        setStatus('PROSES_PENGERJAAN');
        setDescription('');
        setMembers('');
        setAchievement('');
        setLinksText('');
        setHasRegDeadline(false);
        setRegDate('');
        setRegTime('23:59');

        // Default submission deadline 2 weeks ahead
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 14);
        setSubDate(defaultDate.toISOString().split('T')[0]);
        setSubTime('23:59');
      }
    }
  }, [isOpen, editingCompetition]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subDate) return;

    const submission_deadline = `${subDate}T${subTime || '23:59'}:00`;
    const reg_deadline = hasRegDeadline && regDate ? `${regDate}T${regTime || '23:59'}:00` : undefined;

    const related_links = linksText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const deadlineDisplay = `Tenggat ${formatDateDisplay(submission_deadline)}`;

    if (editingCompetition) {
      updateCompetition(editingCompetition.id, {
        name: name.trim(),
        category,
        level,
        status,
        description: description.trim() || undefined,
        submission_deadline,
        reg_deadline,
        deadlineDisplay,
        team_members: members.trim() || undefined,
        achievement: status === 'HASIL_KELUAR' ? (achievement.trim() || undefined) : undefined,
        related_links: related_links.length > 0 ? related_links : undefined,
      });
    } else {
      addCompetition({
        name: name.trim(),
        category,
        level,
        status,
        description: description.trim() || undefined,
        submission_deadline,
        reg_deadline,
        deadlineDisplay,
        team_members: members.trim() || 'AR',
        achievement: status === 'HASIL_KELUAR' ? (achievement.trim() || undefined) : undefined,
        related_links: related_links.length > 0 ? related_links : undefined,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (editingCompetition && confirm(`Hapus kompetisi "${editingCompetition.name}" beserta seluruh tugas milestonenya?`)) {
      deleteCompetition(editingCompetition.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCompetition ? 'Edit Data Kompetisi' : 'Daftarkan Kompetisi Baru'}
      subtitle="Kelola detail lomba, tenggat pendaftaran & submisi, serta tim"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Nama Kompetisi */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary">
            Nama Kompetisi / Lomba <span className="text-semantic-urgent">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Misal: UI/UX National Challenge 2026"
            className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Kategori & Tingkat */}
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
              <option value="LKTI / Karya Tulis">LKTI / Karya Tulis</option>
              <option value="Datathon">Datathon</option>
              <option value="Competitive Programming">Competitive Programming</option>
              <option value="Game Development">Game Development</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary">Tingkat</label>
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
                'py-2 px-2 rounded-xl border text-[11px] font-medium flex items-center justify-center transition-all cursor-pointer',
                status === 'MENDAFTAR'
                  ? 'border-category-lomba bg-category-lomba-tint text-[#B45309] font-bold ring-1 ring-category-lomba'
                  : 'border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary'
              )}
            >
              Mendaftar
            </button>
            <button
              type="button"
              onClick={() => setStatus('PROSES_PENGERJAAN')}
              className={cn(
                'py-2 px-2 rounded-xl border text-[11px] font-medium flex items-center justify-center transition-all cursor-pointer',
                status === 'PROSES_PENGERJAAN'
                  ? 'border-category-lomba bg-category-lomba-tint text-[#B45309] font-bold ring-1 ring-category-lomba'
                  : 'border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary'
              )}
            >
              Proses Kerja
            </button>
            <button
              type="button"
              onClick={() => setStatus('SUDAH_SUBMIT')}
              className={cn(
                'py-2 px-2 rounded-xl border text-[11px] font-medium flex items-center justify-center transition-all cursor-pointer',
                status === 'SUDAH_SUBMIT'
                  ? 'border-category-kuliah bg-category-kuliah-tint text-[#4F46E5] font-bold ring-1 ring-category-kuliah'
                  : 'border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary'
              )}
            >
              Sudah Submit
            </button>
            <button
              type="button"
              onClick={() => setStatus('HASIL_KELUAR')}
              className={cn(
                'py-2 px-2 rounded-xl border text-[11px] font-medium flex items-center justify-center transition-all cursor-pointer',
                status === 'HASIL_KELUAR'
                  ? 'border-status-completed bg-status-completed-tint text-[#16A34A] font-bold ring-1 ring-status-completed'
                  : 'border-border-subtle bg-surface-card text-text-secondary hover:text-text-primary'
              )}
            >
              Hasil Keluar
            </button>
          </div>
        </div>

        {/* Jika Hasil Keluar: Field Prestasi/Pencapaian */}
        {status === 'HASIL_KELUAR' && (
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-status-completed-tint/50 border border-status-completed/30">
            <label className="text-xs font-semibold text-status-completed flex items-center gap-1.5">
              <Trophy size={15} weight="bold" />
              <span>Pencapaian / Prestasi Hasil Lomba</span>
            </label>
            <input
              type="text"
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              placeholder="Misal: Juara 1, Juara 2, Juara 3, Finalis Top 5"
              className="w-full h-9 px-3 bg-white border border-status-completed/40 rounded-lg text-xs text-text-primary focus:outline-none focus:border-status-completed transition-all"
            />
          </div>
        )}

        {/* Deskripsi */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary">Deskripsi Singkat / Fokus Proyek</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Misal: Solusi aplikasi kesehatan mental untuk mahasiswa gen-Z..."
            className="w-full px-3.5 py-2.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all resize-none"
          />
        </div>

        {/* Tenggat Submisi */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
            <CalendarBlank size={14} className="text-category-lomba" />
            <span>Tenggat Pengumpulan (Deadline Submission)</span>
            <span className="text-semantic-urgent">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              required
              value={subDate}
              onChange={(e) => setSubDate(e.target.value)}
              className="h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
            />
            <input
              type="time"
              required
              value={subTime}
              onChange={(e) => setSubTime(e.target.value)}
              className="h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Toggle & Tenggat Pendaftaran */}
        <div className="flex flex-col gap-2 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasRegDeadline}
              onChange={(e) => setHasRegDeadline(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            <span className="text-xs text-text-secondary">Ada batas pendaftaran (Registration Deadline) terpisah</span>
          </label>

          {hasRegDeadline && (
            <div className="grid grid-cols-2 gap-3 pl-6">
              <input
                type="date"
                value={regDate}
                onChange={(e) => setRegDate(e.target.value)}
                className="h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
              />
              <input
                type="time"
                value={regTime}
                onChange={(e) => setRegTime(e.target.value)}
                className="h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
              />
            </div>
          )}
        </div>

        {/* Anggota Tim */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
            <Users size={14} className="text-text-secondary" />
            <span>Anggota Tim (Inisial / Nama dipisahkan koma)</span>
          </label>
          <input
            type="text"
            value={members}
            onChange={(e) => setMembers(e.target.value)}
            placeholder="Misal: AR (Ketua), KH (Hacker), RT (Hipster)"
            className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Tautan Terkait */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
            <LinkSimple size={14} className="text-text-secondary" />
            <span>Tautan Terkait (1 baris per link: Guidebook, Figma, Drive, Repo)</span>
          </label>
          <textarea
            rows={2}
            value={linksText}
            onChange={(e) => setLinksText(e.target.value)}
            placeholder="https://drive.google.com/...&#10;https://figma.com/file/..."
            className="w-full px-3.5 py-2.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle mt-2">
          {editingCompetition ? (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 text-xs text-semantic-urgent hover:bg-status-not-started-tint px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Trash size={15} />
              <span>Hapus Kompetisi</span>
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
              <Trophy size={16} weight="bold" />
              <span>{editingCompetition ? 'Simpan Perubahan' : 'Daftarkan Lomba'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
