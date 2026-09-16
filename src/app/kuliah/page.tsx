'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/app-context';
import { Course } from '@/types';
import { 
  Plus, 
  CalendarBlank, 
  GridFour, 
  ListBullets, 
  MapPin, 
  User, 
  Clock, 
  Laptop, 
  CheckCircle, 
  ArrowsClockwise, 
  BookOpen, 
  Check, 
  X,
  Sparkle
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export default function KuliahPage() {
  const { courses, tasks, addCourse, addTask } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('sbd');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Form State for Add Course
  const [name, setName] = useState('');
  const [sks, setSks] = useState(3);
  const [courseType, setCourseType] = useState('Wajib Prodi');
  const [lecturer, setLecturer] = useState('');
  const [day, setDay] = useState('Senin');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [room, setRoom] = useState('');
  const [recurring, setRecurring] = useState(true);

  // Task form for course
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState('2026-09-22');

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const totalSks = courses.reduce((sum, c) => sum + (c.credits_sks || 0), 0);

  // Academic tasks
  const academicTasks = tasks
    .filter((t) => t.category === 'KULIAH')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const selectedCourseTasks = tasks.filter(
    (t) => t.parent_title.toLowerCase() === selectedCourse?.course_name.toLowerCase()
  );

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !room.trim()) return;

    const dayMap: { [key: string]: number } = {
      Senin: 1,
      Selasa: 2,
      Rabu: 3,
      Kamis: 4,
      Jumat: 5,
      Sabtu: 6,
    };

    addCourse({
      course_name: name.trim(),
      day_of_week: dayMap[day] || 1,
      start_time: startTime,
      end_time: endTime,
      room_location: room.trim(),
      lecturer: lecturer.trim() || undefined,
      credits_sks: Number(sks),
      type: courseType,
      time: `${day} ${startTime} - ${endTime}`,
      hasPendingTask: false,
    });

    setName('');
    setRoom('');
    setLecturer('');
    setIsModalOpen(false);
  };

  const handleCreateTaskForCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      category: 'KULIAH',
      parent_title: selectedCourse.course_name,
      deadline: `${taskDate}T23:59:00`,
      deadlineDisplay: `${new Date(taskDate).getDate()} Sep`,
      status: 'BELUM_MULAI',
    });

    setTaskTitle('');
    setIsTaskModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Header & Action Row */}
      <div className="flex flex-col gap-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-[28px] leading-tight text-text-primary">
              Jadwal Mata Kuliah
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Kelola rutinitas perkuliahan mingguan semester aktif
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Semester Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border-subtle bg-white text-sm font-medium text-text-primary hover:border-primary transition-colors shadow-xs"
              >
                <CalendarBlank size={16} className="text-primary" />
                <span>Ganjil 2026/2027</span>
              </button>
            </div>

            {/* Add Course Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-all shadow-[0_4px_16px_rgba(124,92,252,0.25)] cursor-pointer"
            >
              <Plus size={16} weight="bold" />
              <span>Tambah Mata Kuliah</span>
            </button>
          </div>
        </div>

        {/* Segmented Toggle: Grid Mingguan (active) / Daftar & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-b border-border-subtle/80 pb-6 mb-2">
          <div className="inline-flex p-1 bg-[#EBE7F5]/70 rounded-xl border border-border-subtle">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                viewMode === 'grid'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <GridFour size={16} />
              <span>Grid Mingguan</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                viewMode === 'list'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <ListBullets size={16} />
              <span>Daftar</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A4C]" />
              <span>Ada tugas pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#6C8CFF]" />
              <span>Kategori Kuliah (6 SKS hari ini)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Timetable Area (12 Columns: 8 cols Grid + 4 cols Task List) */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 8 COLS: TIMETABLE GRID */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* TIMETABLE CARD */}
            <div className="bg-white rounded-2xl border border-border-subtle card-spec overflow-hidden">
              
              {/* Table Header (Days of week) */}
              <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-border-subtle bg-white text-center">
                <div className="py-3.5 px-2 text-[11px] font-semibold text-text-secondary uppercase tracking-wider border-r border-border-subtle flex items-center justify-center">
                  Waktu
                </div>
                <div className="py-3 px-2 border-r border-border-subtle">
                  <div className="font-display font-semibold text-sm text-text-primary">Senin</div>
                  <div className="text-[11px] text-text-secondary">2 Kuliah</div>
                </div>
                <div className="py-3 px-2 border-r border-border-subtle">
                  <div className="font-display font-semibold text-sm text-text-primary">Selasa</div>
                  <div className="text-[11px] text-text-secondary">1 Kuliah</div>
                </div>
                <div className="py-3 px-2 border-r border-border-subtle bg-primary/[0.04]">
                  <div className="inline-flex items-center gap-1.5 justify-center">
                    <span className="font-display font-bold text-sm text-primary">Rabu</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <div className="text-[11px] font-medium text-primary">Hari Ini · 1 Kuliah</div>
                </div>
                <div className="py-3 px-2 border-r border-border-subtle">
                  <div className="font-display font-semibold text-sm text-text-primary">Kamis</div>
                  <div className="text-[11px] text-text-secondary">1 Kuliah</div>
                </div>
                <div className="py-3 px-2">
                  <div className="font-display font-semibold text-sm text-text-primary">Jumat</div>
                  <div className="text-[11px] text-text-secondary">1 Kuliah</div>
                </div>
              </div>

              {/* Time Bands: 07:00 to 17:00 */}
              <div className="divide-y divide-border-subtle">
                
                {/* 07:00 - 09:00 */}
                <div className="grid grid-cols-[80px_repeat(5,1fr)] min-h-[96px]">
                  <div className="p-3 text-xs font-medium text-text-secondary border-r border-border-subtle flex flex-col justify-start">
                    <span className="text-text-primary font-semibold">07:00</span>
                    <span className="text-[11px] text-status-not-started">09:00</span>
                  </div>
                  <div className="p-2 border-r border-border-subtle" />
                  
                  {/* Selasa 07:00: Manajemen Proyek TI */}
                  <div className="p-2 border-r border-border-subtle">
                    <div
                      onClick={() => setSelectedCourseId('mpti')}
                      className={cn(
                        'h-full rounded-xl bg-category-kuliah-tint border-l-[3px] border-category-kuliah p-2.5 relative flex flex-col justify-between transition-all cursor-pointer group',
                        selectedCourseId === 'mpti' ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'
                      )}
                    >
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF8A4C] ring-2 ring-category-kuliah-tint" title="Ada tugas pending" />
                      <div>
                        <h4 className="text-xs font-semibold text-text-primary leading-snug group-hover:text-category-kuliah transition-colors">
                          Manajemen Proyek TI
                        </h4>
                        <p className="text-[11px] font-medium text-category-kuliah mt-0.5">07:00 – 09:00</p>
                      </div>
                      <p className="text-[11px] text-text-secondary flex items-center gap-1">
                        <MapPin size={12} /> Ruang C204
                      </p>
                    </div>
                  </div>

                  <div className="p-2 border-r border-border-subtle bg-primary/[0.02]" />
                  <div className="p-2 border-r border-border-subtle" />
                  <div className="p-2" />
                </div>

                {/* 09:00 - 11:00 */}
                <div className="grid grid-cols-[80px_repeat(5,1fr)] min-h-[96px]">
                  <div className="p-3 text-xs font-medium text-text-secondary border-r border-border-subtle flex flex-col justify-start">
                    <span className="text-text-primary font-semibold">09:00</span>
                    <span className="text-[11px] text-status-not-started">11:00</span>
                  </div>
                  
                  {/* Senin 09:00: Algoritma & Struktur Data */}
                  <div className="p-2 border-r border-border-subtle">
                    <div
                      onClick={() => setSelectedCourseId('algo')}
                      className={cn(
                        'h-full rounded-xl bg-category-kuliah-tint border-l-[3px] border-category-kuliah p-2.5 relative flex flex-col justify-between transition-all cursor-pointer group',
                        selectedCourseId === 'algo' ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'
                      )}
                    >
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF8A4C] ring-2 ring-category-kuliah-tint" title="Ada tugas pending" />
                      <div>
                        <h4 className="text-xs font-semibold text-text-primary leading-snug group-hover:text-category-kuliah transition-colors">
                          Algoritma & Struktur Data
                        </h4>
                        <p className="text-[11px] font-medium text-category-kuliah mt-0.5">09:00 – 11:00</p>
                      </div>
                      <p className="text-[11px] text-text-secondary flex items-center gap-1">
                        <MapPin size={12} /> Ruang A301
                      </p>
                    </div>
                  </div>

                  <div className="p-2 border-r border-border-subtle" />
                  
                  {/* Rabu 09:00: Sistem Basis Data (Active/Selected) */}
                  <div className="p-2 border-r border-border-subtle bg-primary/[0.04]">
                    <div
                      onClick={() => setSelectedCourseId('sbd')}
                      className={cn(
                        'h-full rounded-xl bg-category-kuliah-tint border-l-[3px] border-category-kuliah p-2.5 relative flex flex-col justify-between cursor-pointer transition-all',
                        selectedCourseId === 'sbd' ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'
                      )}
                    >
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF8A4C] ring-2 ring-category-kuliah-tint" title="Ada tugas pending" />
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-bold text-text-primary leading-snug">
                            Sistem Basis Data
                          </h4>
                          {selectedCourseId === 'sbd' && (
                            <CheckCircle size={14} weight="fill" className="text-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-category-kuliah mt-0.5">09:00 – 11:00</p>
                      </div>
                      <p className="text-[11px] font-medium text-text-secondary flex items-center gap-1">
                        <Laptop size={12} /> Lab Komputer 2
                      </p>
                    </div>
                  </div>

                  <div className="p-2 border-r border-border-subtle" />

                  {/* Jumat 09:00: Kecerdasan Buatan */}
                  <div className="p-2">
                    <div
                      onClick={() => setSelectedCourseId('ai')}
                      className={cn(
                        'h-full rounded-xl bg-category-kuliah-tint border-l-[3px] border-category-kuliah p-2.5 relative flex flex-col justify-between transition-all cursor-pointer group',
                        selectedCourseId === 'ai' ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'
                      )}
                    >
                      <div>
                        <h4 className="text-xs font-semibold text-text-primary leading-snug group-hover:text-category-kuliah transition-colors">
                          Kecerdasan Buatan
                        </h4>
                        <p className="text-[11px] font-medium text-category-kuliah mt-0.5">09:00 – 11:00</p>
                      </div>
                      <p className="text-[11px] text-text-secondary flex items-center gap-1">
                        <MapPin size={12} /> Ruang A301
                      </p>
                    </div>
                  </div>
                </div>

                {/* 11:00 - 13:00 */}
                <div className="grid grid-cols-[80px_repeat(5,1fr)] min-h-[96px]">
                  <div className="p-3 text-xs font-medium text-text-secondary border-r border-border-subtle flex flex-col justify-start">
                    <span className="text-text-primary font-semibold">11:00</span>
                    <span className="text-[11px] text-status-not-started">13:00</span>
                  </div>
                  <div className="p-2 border-r border-border-subtle" />
                  <div className="p-2 border-r border-border-subtle" />
                  <div className="p-2 border-r border-border-subtle bg-primary/[0.02]" />

                  {/* Kamis 11:00: Jaringan Komputer */}
                  <div className="p-2 border-r border-border-subtle">
                    <div
                      onClick={() => setSelectedCourseId('jarkom')}
                      className={cn(
                        'h-full rounded-xl bg-category-kuliah-tint border-l-[3px] border-category-kuliah p-2.5 relative flex flex-col justify-between transition-all cursor-pointer group',
                        selectedCourseId === 'jarkom' ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'
                      )}
                    >
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF8A4C] ring-2 ring-category-kuliah-tint" title="Ada tugas pending" />
                      <div>
                        <h4 className="text-xs font-semibold text-text-primary leading-snug group-hover:text-category-kuliah transition-colors">
                          Jaringan Komputer
                        </h4>
                        <p className="text-[11px] font-medium text-category-kuliah mt-0.5">11:00 – 13:00</p>
                      </div>
                      <p className="text-[11px] text-text-secondary flex items-center gap-1">
                        <MapPin size={12} /> Ruang A105
                      </p>
                    </div>
                  </div>

                  <div className="p-2" />
                </div>

                {/* 13:00 - 15:00 */}
                <div className="grid grid-cols-[80px_repeat(5,1fr)] min-h-[96px]">
                  <div className="p-3 text-xs font-medium text-text-secondary border-r border-border-subtle flex flex-col justify-start">
                    <span className="text-text-primary font-semibold">13:00</span>
                    <span className="text-[11px] text-status-not-started">15:00</span>
                  </div>

                  {/* Senin 13:00: Bahasa Inggris Teknik */}
                  <div className="p-2 border-r border-border-subtle">
                    <div
                      onClick={() => setSelectedCourseId('bing')}
                      className={cn(
                        'h-full rounded-xl bg-category-kuliah-tint border-l-[3px] border-category-kuliah p-2.5 relative flex flex-col justify-between transition-all cursor-pointer group',
                        selectedCourseId === 'bing' ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'
                      )}
                    >
                      <div>
                        <h4 className="text-xs font-semibold text-text-primary leading-snug group-hover:text-category-kuliah transition-colors">
                          Bahasa Inggris Teknik
                        </h4>
                        <p className="text-[11px] font-medium text-category-kuliah mt-0.5">13:00 – 15:00</p>
                      </div>
                      <p className="text-[11px] text-text-secondary flex items-center gap-1">
                        <MapPin size={12} /> Ruang B102
                      </p>
                    </div>
                  </div>

                  <div className="p-2 border-r border-border-subtle" />
                  <div className="p-2 border-r border-border-subtle bg-primary/[0.02]" />
                  <div className="p-2 border-r border-border-subtle" />
                  <div className="p-2" />
                </div>

              </div>
            </div>

            {/* SELECTED CLASS DETAIL CARD */}
            {selectedCourse && (
              <div className="bg-white rounded-2xl border border-border-subtle p-6 card-spec space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-3 border-b border-border-subtle gap-3">
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5"
                      style={{
                        background: 'linear-gradient(135deg, rgb(140, 168, 255) 0%, rgb(108, 140, 255) 100%)',
                        boxShadow: 'rgba(108, 140, 255, 0.22) 0px 4px 12px',
                      }}
                    >
                      <Laptop size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold text-lg text-text-primary">
                          {selectedCourse.course_name}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-category-kuliah-tint text-category-kuliah">
                          {selectedCourse.credits_sks} SKS
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-not-started-tint text-text-secondary">
                          {selectedCourse.type || 'Wajib Prodi'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-text-secondary mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-text-primary">
                          <User size={14} className="text-category-kuliah" /> Dosen: {selectedCourse.lecturer || '-'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} className="text-text-secondary" /> {selectedCourse.time || `${selectedCourse.start_time} - ${selectedCourse.end_time} WIB`}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="text-text-secondary" /> {selectedCourse.room_location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recurring Note Badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-page-background border border-border-subtle text-xs text-text-secondary shrink-0">
                    <ArrowsClockwise size={14} className="text-primary" />
                    <span>Berulang setiap {selectedCourse.time?.split(' ')[0] || 'pekan'} selama semester ini</span>
                  </div>
                </div>

                {/* Sub-list of Tasks for this Course */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Tugas Mata Kuliah Ini ({selectedCourseTasks.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsTaskModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary-tint rounded-lg transition-colors border border-dashed border-primary/40 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Tambah Tugas</span>
                    </button>
                  </div>

                  {selectedCourseTasks.length === 0 ? (
                    <p className="text-xs text-text-secondary py-3 text-center">
                      Belum ada tugas khusus untuk mata kuliah ini.
                    </p>
                  ) : (
                    selectedCourseTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl border border-border-subtle bg-page-background/50 flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                              task.status === 'SEDANG_DIKERJAKAN'
                                ? 'border-status-in-progress'
                                : task.status === 'SELESAI'
                                ? 'border-status-completed bg-status-completed text-white'
                                : 'border-status-not-started'
                            )}
                          >
                            {task.status === 'SEDANG_DIKERJAKAN' && (
                              <div className="w-2.5 h-2.5 rounded-full bg-status-in-progress" />
                            )}
                            {task.status === 'SELESAI' && <Check size={12} weight="bold" />}
                          </div>
                          <div className="truncate">
                            <div className="text-sm font-medium text-text-primary truncate">
                              {task.title}
                            </div>
                            <div className="text-xs text-text-secondary">
                              {task.parent_title}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-semantic-urgent-tint text-semantic-urgent">
                            <CalendarBlank size={12} /> {task.deadlineDisplay || '18 Sep'}
                          </span>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                              task.status === 'SEDANG_DIKERJAKAN'
                                ? 'bg-status-in-progress-tint text-status-in-progress'
                                : task.status === 'SELESAI'
                                ? 'bg-status-completed-tint text-status-completed'
                                : 'bg-status-not-started-tint text-text-secondary'
                            )}
                          >
                            <span
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                task.status === 'SEDANG_DIKERJAKAN'
                                  ? 'bg-status-in-progress'
                                  : task.status === 'SELESAI'
                                  ? 'bg-status-completed'
                                  : 'bg-status-not-started'
                              )}
                            />
                            <span>
                              {task.status === 'SEDANG_DIKERJAKAN'
                                ? 'Sedang Dikerjakan'
                                : task.status === 'SELESAI'
                                ? 'Selesai'
                                : 'Belum Mulai'}
                            </span>
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT 4 COLS: TUGAS MATA KULIAH PANEL */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-border-subtle p-5 card-spec space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-category-kuliah-tint text-category-kuliah flex items-center justify-center font-bold text-sm">
                    <BookOpen size={16} />
                  </div>
                  <h2 className="font-display font-semibold text-base text-text-primary">
                    Tugas Mata Kuliah
                  </h2>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-category-kuliah-tint text-category-kuliah">
                  {academicTasks.filter((t) => t.status !== 'SELESAI').length} Aktif
                </span>
              </div>

              <p className="text-xs text-text-secondary">
                Daftar seluruh tugas akademik dari jadwal semester ini, diurutkan menurut tenggat waktu terdekat.
              </p>

              {/* Vertical Task List */}
              <div className="space-y-3">
                {academicTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-border-subtle bg-white hover:border-primary/40 transition-colors space-y-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center',
                          task.status === 'SEDANG_DIKERJAKAN'
                            ? 'border-status-in-progress'
                            : task.status === 'SELESAI'
                            ? 'border-status-completed bg-status-completed text-white'
                            : 'border-status-not-started'
                        )}
                      >
                        {task.status === 'SEDANG_DIKERJAKAN' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-status-in-progress" />
                        )}
                        {task.status === 'SELESAI' && <Check size={10} weight="bold" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-text-primary">{task.title}</h4>
                        <p className="text-[11px] text-text-secondary mt-0.5">{task.parent_title}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-semantic-urgent font-semibold">
                        Tenggat: {task.deadlineDisplay || '18 Sep'}
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-medium',
                          task.status === 'SEDANG_DIKERJAKAN'
                            ? 'bg-status-in-progress-tint text-status-in-progress'
                            : task.status === 'SELESAI'
                            ? 'bg-status-completed-tint text-status-completed'
                            : 'bg-status-not-started-tint text-text-secondary'
                        )}
                      >
                        {task.status === 'SEDANG_DIKERJAKAN'
                          ? 'Sedang Dikerjakan'
                          : task.status === 'SELESAI'
                          ? 'Selesai'
                          : 'Belum Mulai'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total SKS Summary Card */}
            <div className="bg-surface-card rounded-2xl p-5 border border-border-subtle card-spec flex items-center justify-between">
              <div>
                <span className="text-xs text-text-secondary block">Total Beban Akademik</span>
                <span className="font-display font-bold text-lg text-text-primary">
                  {totalSks} SKS / {courses.length} Mata Kuliah
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-status-completed-tint text-status-completed">
                Ideal Semester 5
              </span>
            </div>
          </aside>

        </div>
      ) : (
        /* LIST VIEW */
        <div className="flex flex-col gap-4 pt-2">
          {courses.map((c) => (
            <div
              key={c.id}
              className="bg-surface-card rounded-2xl p-5 border border-border-subtle card-spec flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-category-kuliah-tint text-category-kuliah flex items-center justify-center font-bold text-sm shrink-0">
                  <BookOpen size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-base text-text-primary">{c.course_name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-category-kuliah-tint text-category-kuliah">
                      {c.credits_sks} SKS
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-not-started-tint text-text-secondary">
                      {c.type || 'Wajib Prodi'}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    {c.time || `${c.start_time} - ${c.end_time}`} • {c.room_location} • Dosen: {c.lecturer || '-'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCourseId(c.id);
                  setIsTaskModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl border border-border-subtle hover:bg-page-background text-xs font-semibold text-primary transition-all self-start md:self-auto cursor-pointer"
              >
                + Tambah Tugas
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ==================== MODAL TAMBAH MATA KULIAH ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1B2E]/45 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-[500px] bg-surface-card rounded-2xl border border-border-subtle shadow-modal flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-card">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-category-kuliah-tint text-category-kuliah flex items-center justify-center font-bold text-base">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-text-primary">Tambah Mata Kuliah</h2>
                  <p className="text-[11px] text-text-secondary">Daftarkan mata kuliah baru ke jadwal semester aktif</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-status-not-started-tint hover:text-text-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCourse} className="p-6 flex flex-col gap-4 max-h-[82vh] overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Nama Mata Kuliah</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Rekayasa Perangkat Lunak..."
                  className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Bobot SKS</label>
                  <select
                    value={sks}
                    onChange={(e) => setSks(Number(e.target.value))}
                    className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    <option value={1}>1 SKS</option>
                    <option value={2}>2 SKS</option>
                    <option value={3}>3 SKS</option>
                    <option value={4}>4 SKS</option>
                    <option value={6}>6 SKS</option>
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

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Hari & Waktu Perkuliahan</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full h-10 px-3 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>
                  <div className="col-span-2 grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="h-10 px-2.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                    />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="h-10 px-2.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

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

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="check-recurring"
                  checked={recurring}
                  onChange={(e) => setRecurring(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="check-recurring" className="text-xs text-text-secondary cursor-pointer select-none">
                  Jadwal berulang mingguan selama semester aktif
                </label>
              </div>

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
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark active:scale-[0.98] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Check size={14} weight="bold" />
                  <span>Simpan Mata Kuliah</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quick Add Task for Course */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1B2E]/45 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-[440px] bg-surface-card rounded-2xl border border-border-subtle shadow-modal flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-card">
              <h3 className="font-display text-base font-bold text-text-primary">
                Tambah Tugas • {selectedCourse?.course_name}
              </h3>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-status-not-started-tint hover:text-text-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTaskForCourse} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Judul Tugas</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Misal: Tugas ERD & Normalisasi..."
                  className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Tenggat Waktu</label>
                <input
                  type="date"
                  required
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-full h-10 px-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle mt-1">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-page-background transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-sm transition-all"
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
