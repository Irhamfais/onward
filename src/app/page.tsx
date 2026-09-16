'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/app-context';
import { TaskCategory, TaskStatus } from '@/types';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  HourglassHigh, 
  ClipboardText,
  CalendarBlank,
  BookOpen,
  Trophy,
  Users,
  ArrowsClockwise,
  Trash,
  Check,
  X,
  Alarm
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { 
    tasks, 
    courses, 
    competitions,
    committees,
    searchQuery, 
    cycleTaskStatus, 
    deleteTask, 
    addTask, 
    stats 
  } = useApp();

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal Add Task
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TaskCategory>('KULIAH');
  const [newParentTitle, setNewParentTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-09-20');
  const [newTime, setNewTime] = useState('23:59');
  const [newStatus, setNewStatus] = useState<TaskStatus>('BELUM_MULAI');
  const [remindEmail, setRemindEmail] = useState(true);
  const [remindWA, setRemindWA] = useState(true);

  // Dynamic Parent Options based on Category
  const parentOptions = useMemo(() => {
    if (newCategory === 'KULIAH') {
      return courses.map((c) => c.course_name);
    } else if (newCategory === 'LOMBA') {
      return competitions.map((c) => c.name);
    } else {
      return committees.map((c) => c.organization_event_name);
    }
  }, [newCategory, courses, competitions, committees]);

  // Set default parent title when category changes
  React.useEffect(() => {
    if (parentOptions.length > 0 && !parentOptions.includes(newParentTitle)) {
      setNewParentTitle(parentOptions[0]);
    }
  }, [newCategory, parentOptions, newParentTitle]);

  // Filter and sort tasks (Strictly by deadline ASC)
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesCategory = selectedCategory === 'ALL' || task.category === selectedCategory;
        const matchesStatus = selectedStatus === 'ALL' || task.status === selectedStatus;
        const matchesSearch =
          !searchQuery ||
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.parent_title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesStatus && matchesSearch;
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [tasks, selectedCategory, selectedStatus, searchQuery]);

  // Nearest deadlines (top 3 upcoming incomplete)
  const nearestDeadlines = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'SELESAI')
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 3);
  }, [tasks]);

  // Task distribution for Donut Chart
  const kuliahCount = tasks.filter((t) => t.category === 'KULIAH').length;
  const lombaCount = tasks.filter((t) => t.category === 'LOMBA').length;
  const kepanitiaanCount = tasks.filter((t) => t.category === 'KEPANITIAAN').length;
  const totalCount = tasks.length || 1;

  // Donut SVG circumference calculation (r = 38 => circumference = 2 * PI * 38 ≈ 238.76)
  const circumference = 238.76;
  const kuliahRatio = kuliahCount / totalCount;
  const lombaRatio = lombaCount / totalCount;
  const kepanitiaanRatio = kepanitiaanCount / totalCount;

  const kuliahDash = `${kuliahRatio * circumference} ${circumference}`;
  const lombaDash = `${lombaRatio * circumference} ${circumference}`;
  const kepanitiaanDash = `${kepanitiaanRatio * circumference} ${circumference}`;

  const kuliahOffset = 0;
  const lombaOffset = -(kuliahRatio * circumference);
  const kepanitiaanOffset = -((kuliahRatio + lombaRatio) * circumference);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const fullDeadline = `${newDate}T${newTime}:00`;
    const d = new Date(fullDeadline);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const deadlineDisplay = `${d.getDate()} ${months[d.getMonth()]}`;

    addTask({
      title: newTitle.trim(),
      category: newCategory,
      parent_title: newParentTitle || (newCategory === 'KULIAH' ? 'Kuliah Umum' : 'Projek'),
      deadline: fullDeadline,
      deadlineDisplay,
      status: newStatus,
    });

    // Reset form
    setNewTitle('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* 1. Greeting & Action Header (Exact reference: clean typography, no giant gradient) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
            Selamat pagi, Alya 👋
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Ada 3 tugas yang jatuh tempo minggu ini.
          </p>
        </div>

        {/* The ONLY '+ Tambah Tugas' button on Dashboard */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-semibold text-sm shadow-[0_4px_16px_rgba(124,92,252,0.25)] transition-all shrink-0 cursor-pointer"
        >
          <Plus size={18} weight="bold" />
          <span>Tambah Tugas</span>
        </button>
      </div>

      {/* 2. Four Summary Stat Cards with authentic 3D Tactile Icon Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Card 1: Total Tugas Aktif (Purple Badge) */}
        <div className="bg-surface-card rounded-2xl p-5 card-spec border border-border-subtle flex items-center gap-4 transition-all hover:-translate-y-0.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{
              background: 'linear-gradient(135deg, #8F7FFF 0%, #7C5CFC 100%)',
              boxShadow: '0 4px 12px rgba(124, 92, 252, 0.25)',
            }}
          >
            <ClipboardText size={24} weight="bold" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold text-text-primary">
              {stats.total}
            </span>
            <span className="text-xs text-text-secondary mt-0.5">Total Tugas Aktif</span>
          </div>
        </div>

        {/* Card 2: Belum Mulai (Gray Badge) */}
        <div className="bg-surface-card rounded-2xl p-5 card-spec border border-border-subtle flex items-center gap-4 transition-all hover:-translate-y-0.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{
              background: 'linear-gradient(135deg, #B2ADC4 0%, #9C97AE 100%)',
              boxShadow: '0 4px 12px rgba(156, 151, 174, 0.25)',
            }}
          >
            <Clock size={24} weight="bold" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold text-text-primary">
              {stats.notStarted}
            </span>
            <span className="text-xs text-text-secondary mt-0.5">Belum Mulai</span>
          </div>
        </div>

        {/* Card 3: Sedang Dikerjakan (Orange Badge) */}
        <div className="bg-surface-card rounded-2xl p-5 card-spec border border-border-subtle flex items-center gap-4 transition-all hover:-translate-y-0.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{
              background: 'linear-gradient(135deg, #FFA36C 0%, #FF8A4C 100%)',
              boxShadow: '0 4px 12px rgba(255, 138, 76, 0.25)',
            }}
          >
            <HourglassHigh size={24} weight="bold" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold text-text-primary">
              {stats.inProgress}
            </span>
            <span className="text-xs text-text-secondary mt-0.5">Sedang Dikerjakan</span>
          </div>
        </div>

        {/* Card 4: Selesai (Green Badge) */}
        <div className="bg-surface-card rounded-2xl p-5 card-spec border border-border-subtle flex items-center gap-4 transition-all hover:-translate-y-0.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{
              background: 'linear-gradient(135deg, #5ED08C 0%, #3FBE72 100%)',
              boxShadow: '0 4px 12px rgba(63, 190, 114, 0.25)',
            }}
          >
            <CheckCircle size={24} weight="bold" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold text-text-primary">
              {stats.completed}
            </span>
            <span className="text-xs text-text-secondary mt-0.5">Selesai</span>
          </div>
        </div>

      </div>

      {/* 3. Main 2-Column Section (8 cols vs 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Tugas Mendatang (8 cols) */}
        <div className="lg:col-span-8 bg-surface-card rounded-2xl p-6 border border-border-subtle card-spec flex flex-col">
          
          {/* Section Header & Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-border-subtle">
            <div>
              <h2 className="font-display text-lg font-bold text-text-primary">Tugas Mendatang</h2>
              <span className="text-xs text-text-secondary">Urutan tenggat terdekat (murni deadline ASC)</span>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 px-3.5 rounded-xl bg-page-background border border-border-subtle text-xs font-medium text-text-primary focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="KULIAH">🔵 Kuliah</option>
                <option value="LOMBA">🟡 Lomba</option>
                <option value="KEPANITIAAN">🟢 Kepanitiaan</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3.5 rounded-xl bg-page-background border border-border-subtle text-xs font-medium text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="BELUM_MULAI">Belum Mulai</option>
                <option value="SEDANG_DIKERJAKAN">Sedang Dikerjakan</option>
                <option value="SELESAI">Selesai</option>
              </select>
            </div>
          </div>

          {/* Task List Container */}
          <div className="flex flex-col divide-y divide-border-subtle/80 pt-2 min-h-[300px]">
            {filteredTasks.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-status-not-started-tint text-text-secondary flex items-center justify-center mb-2">
                  <CheckCircle size={24} />
                </div>
                <p className="text-sm font-semibold text-text-primary">Tidak ada tugas ditemukan</p>
                <p className="text-xs text-text-secondary mt-1">Coba ubah filter atau kata kunci pencarian Anda.</p>
              </div>
            ) : (
              filteredTasks.map((t) => {
                // Urgent threshold: within 48h of demo baseline 2026-09-16
                const isUrgent =
                  new Date(t.deadline).getTime() - new Date('2026-09-16T19:00:00').getTime() < 48 * 3600 * 1000 &&
                  t.status !== 'SELESAI';

                return (
                  <div
                    key={t.id}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl hover:bg-page-background transition-colors gap-3"
                  >
                    {/* Left: Interactive checkbox & Task title */}
                    <div className="flex items-start md:items-center gap-3.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => cycleTaskStatus(t.id)}
                        title="Klik untuk ubah status (Belum Mulai -> Sedang Dikerjakan -> Selesai)"
                        className={cn(
                          'w-5 h-5 mt-0.5 md:mt-0 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all',
                          t.status === 'BELUM_MULAI' && 'border border-border-subtle bg-status-not-started-tint text-transparent hover:text-text-secondary',
                          t.status === 'SEDANG_DIKERJAKAN' && 'border-2 border-status-in-progress bg-status-in-progress-tint text-status-in-progress',
                          t.status === 'SELESAI' && 'border-2 border-status-completed bg-status-completed text-white'
                        )}
                      >
                        {t.status === 'SELESAI' ? (
                          <Check size={12} weight="bold" />
                        ) : t.status === 'SEDANG_DIKERJAKAN' ? (
                          <HourglassHigh size={11} weight="bold" />
                        ) : (
                          <Check size={10} />
                        )}
                      </button>

                      <div className="flex flex-col min-w-0">
                        <span
                          className={cn(
                            'font-display font-semibold text-[15px] truncate',
                            t.status === 'SELESAI' ? 'line-through text-text-secondary' : 'text-text-primary'
                          )}
                        >
                          {t.title}
                        </span>
                        <span className="text-xs text-text-secondary truncate mt-0.5">
                          {t.parent_title}
                        </span>
                      </div>
                    </div>

                    {/* Right: Badges & Controls */}
                    <div className="flex items-center flex-wrap md:flex-nowrap gap-2.5 justify-between md:justify-end ml-8 md:ml-0">
                      
                      {/* Category Badge */}
                      {t.category === 'KULIAH' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-category-kuliah-tint text-category-kuliah text-xs font-semibold">
                          <BookOpen size={14} weight="bold" />
                          <span>Kuliah</span>
                        </span>
                      )}
                      {t.category === 'LOMBA' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-category-lomba-tint text-category-lomba text-xs font-semibold">
                          <Trophy size={14} weight="bold" />
                          <span>Lomba</span>
                        </span>
                      )}
                      {t.category === 'KEPANITIAAN' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-category-kepanitiaan-tint text-category-kepanitiaan text-xs font-semibold">
                          <Users size={14} weight="bold" />
                          <span>Kepanitiaan</span>
                        </span>
                      )}

                      {/* Deadline Badge */}
                      {isUrgent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-semantic-urgent-tint text-semantic-urgent text-xs font-bold">
                          <CalendarBlank size={14} weight="bold" />
                          <span>{t.deadlineDisplay || t.deadline.split('T')[0]}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-text-secondary text-xs px-1">
                          <CalendarBlank size={14} />
                          <span>{t.deadlineDisplay || t.deadline.split('T')[0]}</span>
                        </span>
                      )}

                      {/* Status Badge */}
                      {t.status === 'BELUM_MULAI' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-not-started-tint text-text-secondary text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-not-started" />
                          <span>Belum Mulai</span>
                        </span>
                      )}
                      {t.status === 'SEDANG_DIKERJAKAN' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-in-progress-tint text-status-in-progress text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-in-progress" />
                          <span>Sedang Dikerjakan</span>
                        </span>
                      )}
                      {t.status === 'SELESAI' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-completed-tint text-status-completed text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-completed" />
                          <span>Selesai</span>
                        </span>
                      )}

                      {/* Action buttons */}
                      <button
                        type="button"
                        onClick={() => cycleTaskStatus(t.id)}
                        title="Ubah status tugas"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white transition-colors"
                      >
                        <ArrowsClockwise size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTask(t.id)}
                        title="Hapus tugas"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-semantic-urgent hover:bg-semantic-urgent-tint transition-colors"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Task Count Footer */}
          <div className="pt-4 flex items-center justify-between text-xs text-text-secondary border-t border-border-subtle/80 mt-2">
            <span>Menampilkan {filteredTasks.length} dari {tasks.length} tugas</span>
            <span className="text-[11px] text-text-secondary italic">
              Tip: Klik ikon siklus untuk mengubah status tugas
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Mini Kalender & Target Ringkas (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Mini Calendar (September 2026) */}
          <div className="bg-surface-card rounded-2xl p-5 border border-border-subtle card-spec flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-bold text-sm text-text-primary">
                Kalender • September 2026
              </span>
              <span className="text-xs text-primary font-semibold">Semester Ganjil</span>
            </div>

            {/* Weekday Header */}
            <div className="grid grid-cols-7 text-center text-xs font-medium text-text-secondary mb-2">
              <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {/* Aug 31 */}
              <span className="py-1.5 text-text-secondary/40">31</span>
              {/* Sep 1 to 30 */}
              {Array.from({ length: 30 }).map((_, i) => {
                const day = i + 1;
                const isToday = day === 16;
                const hasTaskKuliah = [18, 23, 25, 27].includes(day);
                const hasTaskLomba = [19, 21, 28].includes(day);
                const hasTaskPanitia = [20, 22, 26].includes(day);

                return (
                  <div
                    key={day}
                    className={cn(
                      'py-1.5 rounded-lg flex flex-col items-center justify-center relative transition-colors',
                      isToday ? 'bg-primary text-white font-bold shadow-xs' : 'hover:bg-page-background text-text-primary'
                    )}
                  >
                    <span>{day}</span>
                    {/* Indicators */}
                    <div className="flex items-center justify-center gap-0.5 mt-0.5 h-1">
                      {hasTaskKuliah && (
                        <span className={cn('w-1 h-1 rounded-full', isToday ? 'bg-white' : 'bg-category-kuliah')} />
                      )}
                      {hasTaskLomba && (
                        <span className={cn('w-1 h-1 rounded-full', isToday ? 'bg-white' : 'bg-category-lomba')} />
                      )}
                      {hasTaskPanitia && (
                        <span className={cn('w-1 h-1 rounded-full', isToday ? 'bg-white' : 'bg-category-kepanitiaan')} />
                      )}
                    </div>
                  </div>
                );
              })}
              {/* Oct 1 to 4 */}
              <span className="py-1.5 text-text-secondary/40">1</span>
              <span className="py-1.5 text-text-secondary/40">2</span>
              <span className="py-1.5 text-text-secondary/40">3</span>
              <span className="py-1.5 text-text-secondary/40">4</span>
            </div>

            {/* Calendar Legend */}
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-around text-[10px] text-text-secondary">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-category-kuliah" />Kuliah
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-category-lomba" />Lomba
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-category-kepanitiaan" />Kepanitiaan
              </span>
            </div>
          </div>

          {/* Overall Progress Card (67% target) */}
          <div className="bg-surface-card rounded-2xl p-5 border border-border-subtle card-spec flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wider">
                Progress Keseluruhan
              </span>
              <span className="text-xs font-bold text-primary">
                {stats.completionPercentage}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-status-not-started-tint rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-text-secondary">
              {stats.completed} dari {stats.total} tugas telah diselesaikan dengan baik.
            </p>
          </div>

          {/* Deadline Terdekat Card */}
          <div className="bg-surface-card rounded-2xl p-5 border border-border-subtle card-spec flex flex-col">
            <span className="font-display font-bold text-sm text-text-primary mb-3">
              Deadline Terdekat
            </span>
            <div className="flex flex-col gap-2.5">
              {nearestDeadlines.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl border border-border-subtle bg-white hover:border-primary/40 transition-colors flex items-start justify-between gap-2"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-text-primary truncate">
                      {t.title}
                    </span>
                    <span className="text-[11px] text-text-secondary truncate mt-0.5">
                      {t.parent_title}
                    </span>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-semantic-urgent-tint text-semantic-urgent">
                    {t.deadlineDisplay || t.deadline.split('T')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 4. BOTTOM ROW (50% / 50% from stitch-screens/dashboard-desktop.html) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        
        {/* Card 1: Tugas per Kategori (Donut Chart SVG) */}
        <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle card-spec">
          <div className="mb-5">
            <h3 className="font-display text-base font-bold text-text-primary">Tugas per Kategori</h3>
            <p className="text-xs text-text-secondary mt-0.5">Distribusi beban kerja aktif</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            {/* Donut Chart SVG */}
            <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Kuliah circle */}
                <circle
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="38"
                  stroke="#6C8CFF"
                  strokeDasharray={kuliahDash}
                  strokeDashoffset={kuliahOffset}
                  strokeWidth="12"
                  className="transition-all duration-500"
                />
                {/* Lomba circle */}
                <circle
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="38"
                  stroke="#FFB648"
                  strokeDasharray={lombaDash}
                  strokeDashoffset={lombaOffset}
                  strokeWidth="12"
                  className="transition-all duration-500"
                />
                {/* Kepanitiaan circle */}
                <circle
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="38"
                  stroke="#35C0A5"
                  strokeDasharray={kepanitiaanDash}
                  strokeDashoffset={kepanitiaanOffset}
                  strokeWidth="12"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-display text-2xl font-bold text-text-primary leading-tight">
                  {tasks.length}
                </span>
                <span className="text-[10px] text-text-secondary uppercase tracking-wider">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-3 w-full max-w-[200px]">
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-page-background transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-category-kuliah shrink-0" />
                  <span className="text-xs font-medium text-text-primary">Kuliah</span>
                </div>
                <span className="text-xs font-bold text-text-primary">{kuliahCount}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-page-background transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-category-lomba shrink-0" />
                  <span className="text-xs font-medium text-text-primary">Lomba</span>
                </div>
                <span className="text-xs font-bold text-text-primary">{lombaCount}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-page-background transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-category-kepanitiaan shrink-0" />
                  <span className="text-xs font-medium text-text-primary">Kepanitiaan</span>
                </div>
                <span className="text-xs font-bold text-text-primary">{kepanitiaanCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Aktivitas Minggu Ini (Area Curve Chart SVG) */}
        <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle card-spec">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-text-primary">Aktivitas Minggu Ini</h3>
              <p className="text-xs text-text-secondary mt-0.5">Tugas selesai per hari</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary bg-primary-fixed/60 px-2.5 py-1 rounded-full font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>16 Selesai</span>
            </div>
          </div>

          <div className="w-full flex flex-col justify-end pt-2">
            <svg className="w-full h-32 overflow-visible" viewBox="0 0 460 140">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#7C5CFC" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#7C5CFC" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line stroke="#E7E3F5" strokeDasharray="3 3" strokeWidth="1" x1="20" x2="440" y1="20" y2="20" />
              <line stroke="#E7E3F5" strokeDasharray="3 3" strokeWidth="1" x1="20" x2="440" y1="55" y2="55" />
              <line stroke="#E7E3F5" strokeDasharray="3 3" strokeWidth="1" x1="20" x2="440" y1="90" y2="90" />
              <line stroke="#E7E3F5" strokeWidth="1" x1="20" x2="440" y1="125" y2="125" />

              {/* Area path */}
              <path
                d="M 30 125 L 30 100 C 60 75, 75 45, 95 45 C 115 45, 140 75, 160 75 C 180 75, 205 20, 225 20 C 245 20, 270 75, 290 75 C 310 75, 335 45, 355 45 C 375 45, 400 100, 420 100 L 420 125 Z"
                fill="url(#chartGradient)"
              />
              {/* Line path */}
              <path
                d="M 30 100 C 60 75, 75 45, 95 45 C 115 45, 140 75, 160 75 C 180 75, 205 20, 225 20 C 245 20, 270 75, 290 75 C 310 75, 335 45, 355 45 C 375 45, 400 100, 420 100"
                fill="none"
                stroke="#7C5CFC"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />

              {/* Points */}
              <circle cx="30" cy="100" fill="#FFFFFF" r="4.5" stroke="#7C5CFC" strokeWidth="2.5" />
              <circle cx="95" cy="45" fill="#FFFFFF" r="4.5" stroke="#7C5CFC" strokeWidth="2.5" />
              <circle cx="160" cy="75" fill="#FFFFFF" r="4.5" stroke="#7C5CFC" strokeWidth="2.5" />
              <circle cx="225" cy="20" fill="#7C5CFC" r="5" stroke="#FFFFFF" strokeWidth="2.5" />
              <circle cx="290" cy="75" fill="#FFFFFF" r="4.5" stroke="#7C5CFC" strokeWidth="2.5" />
              <circle cx="355" cy="45" fill="#FFFFFF" r="4.5" stroke="#7C5CFC" strokeWidth="2.5" />
              <circle cx="420" cy="100" fill="#FFFFFF" r="4.5" stroke="#7C5CFC" strokeWidth="2.5" />
            </svg>

            <div className="grid grid-cols-7 text-center text-xs text-text-secondary pt-2">
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span className="font-bold text-primary">Kam</span>
              <span>Jum</span>
              <span>Sab</span>
              <span>Min</span>
            </div>
          </div>
        </div>

      </div>

      {/* ==================== MODAL TAMBAH TUGAS ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1B2E]/45 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-[480px] bg-surface-card rounded-2xl border border-border-subtle shadow-modal flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-card">
              <h2 className="font-display text-lg font-bold text-text-primary">Tambah Tugas Baru</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-status-not-started-tint hover:text-text-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTask} className="p-6 flex flex-col gap-4">
              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Kategori Tugas</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewCategory('KULIAH')}
                    className={cn(
                      'py-2 px-3 rounded-xl border-2 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all',
                      newCategory === 'KULIAH'
                        ? 'border-category-kuliah bg-category-kuliah-tint text-category-kuliah'
                        : 'border-border-subtle text-text-secondary hover:border-category-kuliah'
                    )}
                  >
                    <BookOpen size={14} />
                    <span>Kuliah</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory('LOMBA')}
                    className={cn(
                      'py-2 px-3 rounded-xl border-2 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all',
                      newCategory === 'LOMBA'
                        ? 'border-category-lomba bg-category-lomba-tint text-category-lomba'
                        : 'border-border-subtle text-text-secondary hover:border-category-lomba'
                    )}
                  >
                    <Trophy size={14} />
                    <span>Lomba</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory('KEPANITIAAN')}
                    className={cn(
                      'py-2 px-3 rounded-xl border-2 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all',
                      newCategory === 'KEPANITIAAN'
                        ? 'border-category-kepanitiaan bg-category-kepanitiaan-tint text-category-kepanitiaan'
                        : 'border-border-subtle text-text-secondary hover:border-category-kepanitiaan'
                    )}
                  >
                    <Users size={14} />
                    <span>Panitia</span>
                  </button>
                </div>
              </div>

              {/* Terkait dengan */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">
                  {newCategory === 'KULIAH'
                    ? 'Mata Kuliah Terkait'
                    : newCategory === 'LOMBA'
                    ? 'Kompetisi Terkait'
                    : 'Kepanitiaan Terkait'}
                </label>
                <select
                  value={newParentTitle}
                  onChange={(e) => setNewParentTitle(e.target.value)}
                  className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all cursor-pointer"
                >
                  {parentOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Nama Tugas / Aktivitas</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Misal: Kumpulkan Laporan Praktikum..."
                  className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Deadline */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Tenggat Waktu (Deadline)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                  />
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Status Awal */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Status Awal</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus('BELUM_MULAI')}
                    className={cn(
                      'py-1.5 rounded-full border-[1.5px] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all',
                      newStatus === 'BELUM_MULAI'
                        ? 'border-status-not-started bg-status-not-started-tint text-text-primary'
                        : 'border-border-subtle bg-surface-card text-text-secondary'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-status-not-started" />
                    <span>Belum Mulai</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('SEDANG_DIKERJAKAN')}
                    className={cn(
                      'py-1.5 rounded-full border-[1.5px] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all',
                      newStatus === 'SEDANG_DIKERJAKAN'
                        ? 'border-status-in-progress bg-status-in-progress-tint text-status-in-progress'
                        : 'border-border-subtle bg-surface-card text-text-secondary'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-status-in-progress" />
                    <span>Sedang Kerja</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('SELESAI')}
                    className={cn(
                      'py-1.5 rounded-full border-[1.5px] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all',
                      newStatus === 'SELESAI'
                        ? 'border-status-completed bg-status-completed-tint text-status-completed'
                        : 'border-border-subtle bg-surface-card text-text-secondary'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-status-completed" />
                    <span>Selesai</span>
                  </button>
                </div>
              </div>

              {/* Reminders */}
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-xs font-semibold text-text-primary">Kirim Pengingat Ke:</span>
                <div className="flex items-center gap-6 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={remindEmail}
                      onChange={(e) => setRemindEmail(e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-text-primary">Email (Resend)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={remindWA}
                      onChange={(e) => setRemindWA(e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-text-primary">WhatsApp (Twilio)</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle mt-1">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-page-background transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark active:scale-[0.98] text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
