'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/app-context';
import { Course, UnifiedTask } from '@/types';
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
  PencilSimple,
  Trash,
  CaretDown,
  Archive,
  CheckSquare
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { SemesterModal } from '@/components/kuliah/semester-modal';
import { CourseModal } from '@/components/kuliah/course-modal';
import { CourseTaskModal } from '@/components/kuliah/course-task-modal';
import { EmptyState } from '@/components/ui/empty-state';
import {
  GRID_START_MINUTES,
  GRID_END_MINUTES,
  TOTAL_GRID_MINUTES,
  TOTAL_GRID_HEIGHT,
  HOUR_HEIGHT,
  PX_PER_MINUTE,
  HOURLY_GRID_SLOTS,
  timeToMinutes,
} from '@/lib/course-utils';

export default function KuliahPage() {
  const { 
    courses, 
    tasks, 
    semesters, 
    activeSemesterId, 
    setActiveSemesterId,
    cycleTaskStatus,
    deleteCourse,
    deleteTask
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Modals state
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<UnifiedTask | null>(null);
  const [taskTargetCourse, setTaskTargetCourse] = useState<Course | null>(null);

  const [isSemesterDropdownOpen, setIsSemesterDropdownOpen] = useState(false);

  // Active semester
  const currentSemester = useMemo(() => {
    return (
      semesters.find((s) => s.id === activeSemesterId) ||
      semesters.find((s) => s.is_active) ||
      semesters[0] ||
      { id: 'sem-ganjil-2026', name: 'Ganjil 2026/2027', is_active: true }
    );
  }, [semesters, activeSemesterId]);

  // Filter courses by selected semester
  const currentSemesterCourses = useMemo(() => {
    return courses.filter((c) => !c.semester_id || c.semester_id === currentSemester.id);
  }, [courses, currentSemester.id]);

  // Calculate selected course
  const selectedCourse = useMemo(() => {
    if (selectedCourseId) {
      const found = currentSemesterCourses.find((c) => c.id === selectedCourseId);
      if (found) return found;
    }
    return currentSemesterCourses[0] || null;
  }, [currentSemesterCourses, selectedCourseId]);

  const totalSks = useMemo(() => {
    return currentSemesterCourses.reduce((sum, c) => sum + (c.credits_sks || 0), 0);
  }, [currentSemesterCourses]);

  // Tasks for current semester courses
  const academicTasks = useMemo(() => {
    return tasks
      .filter((t) => t.category === 'KULIAH')
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [tasks]);

  const selectedCourseTasks = useMemo(() => {
    if (!selectedCourse) return [];
    return tasks.filter(
      (t) =>
        t.parent_id === selectedCourse.id ||
        t.parent_title?.toLowerCase() === selectedCourse.course_name.toLowerCase()
    );
  }, [tasks, selectedCourse]);

  // Days configuration
  const hasSaturdayClass = currentSemesterCourses.some((c) => c.day_of_week === 6);
  const daysOfWeek = useMemo(() => {
    const list = [
      { id: 1, name: 'Senin' },
      { id: 2, name: 'Selasa' },
      { id: 3, name: 'Rabu' },
      { id: 4, name: 'Kamis' },
      { id: 5, name: 'Jumat' },
    ];
    if (hasSaturdayClass) {
      list.push({ id: 6, name: 'Sabtu' });
    }
    return list;
  }, [hasSaturdayClass]);

  // Check if course has pending tasks
  const courseHasPendingTask = (course: Course) => {
    return tasks.some(
      (t) =>
        (t.parent_id === course.id || t.parent_title?.toLowerCase() === course.course_name.toLowerCase()) &&
        t.status !== 'SELESAI'
    );
  };

  // Today's day index (1 = Senin ... 7 = Minggu)
  const currentDayIndex = useMemo(() => {
    const day = new Date().getDay();
    return day === 0 ? 7 : day;
  }, []);

  const [courseModalPreset, setCourseModalPreset] = useState<{
    day?: number;
    startTime?: string;
  }>({});

  const openAddCourseModal = () => {
    setEditingCourse(null);
    setCourseModalPreset({});
    setIsCourseModalOpen(true);
  };

  const openAddCourseModalWithPreset = (dayId: number, startTimeStr: string) => {
    setEditingCourse(null);
    setCourseModalPreset({ day: dayId, startTime: startTimeStr });
    setIsCourseModalOpen(true);
  };

  const openEditCourseModal = (course: Course) => {
    setEditingCourse(course);
    setCourseModalPreset({});
    setIsCourseModalOpen(true);
  };

  const openAddTaskModal = (course: Course) => {
    setTaskTargetCourse(course);
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: UnifiedTask, course: Course) => {
    setTaskTargetCourse(course);
    setEditingTask(task);
    setIsTaskModalOpen(true);
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
              Kelola rutinitas perkuliahan mingguan semester aktif dan tugas akademik
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Semester Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSemesterDropdownOpen(!isSemesterDropdownOpen)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border-subtle bg-white text-sm font-semibold text-text-primary hover:border-primary transition-colors shadow-xs cursor-pointer"
              >
                <CalendarBlank size={16} className="text-primary" />
                <span>{currentSemester.name}</span>
                {currentSemester.is_active ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-completed-tint text-status-completed">
                    Aktif
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-not-started-tint text-text-secondary">
                    Arsip
                  </span>
                )}
                <CaretDown size={14} className="text-text-secondary ml-1" />
              </button>

              {isSemesterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-surface-card rounded-2xl border border-border-subtle shadow-dropdown z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border-subtle mb-1">
                    Pilih Semester
                  </div>
                  <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
                    {semesters.map((sem) => (
                      <button
                        key={sem.id}
                        type="button"
                        onClick={() => {
                          setActiveSemesterId(sem.id);
                          setIsSemesterDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer',
                          sem.id === currentSemester.id
                            ? 'bg-primary-tint text-primary'
                            : 'text-text-primary hover:bg-page-background'
                        )}
                      >
                        <span className="truncate">{sem.name}</span>
                        {sem.is_active && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-status-completed-tint text-status-completed shrink-0">
                            Aktif
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-border-subtle mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSemesterDropdownOpen(false);
                        setIsSemesterModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-primary hover:bg-primary-tint transition-colors cursor-pointer text-left"
                    >
                      <Plus size={14} weight="bold" />
                      <span>Kelola & Tambah Semester</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add Course Button */}
            <button
              type="button"
              onClick={openAddCourseModal}
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
                'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
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
                'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                viewMode === 'list'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <ListBullets size={16} />
              <span>Daftar ({currentSemesterCourses.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A4C]" />
              <span>Ada tugas pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#6C8CFF]" />
              <span>Kategori Kuliah ({totalSks} SKS Total)</span>
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
              {/* Table Header (Days of week dynamically calculated) */}
              <div
                className={cn(
                  'grid border-b border-border-subtle bg-white text-center',
                  daysOfWeek.length === 6
                    ? 'grid-cols-[80px_repeat(6,1fr)]'
                    : 'grid-cols-[80px_repeat(5,1fr)]'
                )}
              >
                <div className="py-3.5 px-2 text-[11px] font-semibold text-text-secondary uppercase tracking-wider border-r border-border-subtle flex items-center justify-center">
                  Waktu
                </div>

                {daysOfWeek.map((day) => {
                  const dayCourses = currentSemesterCourses.filter((c) => c.day_of_week === day.id);
                  const isToday = currentDayIndex === day.id;

                  return (
                    <div
                      key={day.id}
                      className={cn(
                        'py-3 px-2 border-r border-border-subtle last:border-r-0 transition-colors',
                        isToday ? 'bg-primary/[0.04]' : ''
                      )}
                    >
                      <div className="flex items-center gap-1.5 justify-center">
                        <span
                          className={cn(
                            'font-display text-sm',
                            isToday ? 'font-bold text-primary' : 'font-semibold text-text-primary'
                          )}
                        >
                          {day.name}
                        </span>
                        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </div>
                      <div
                        className={cn(
                          'text-[11px] mt-0.5',
                          isToday ? 'text-primary font-medium' : 'text-text-secondary'
                        )}
                      >
                        {isToday ? 'Hari Ini • ' : ''}
                        {dayCourses.length} Kuliah
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Minute-Based Timetable Grid (Google Calendar / Outlook Style) */}
              <div
                className={cn(
                  'grid relative divide-x divide-border-subtle bg-white overflow-hidden',
                  daysOfWeek.length === 6
                    ? 'grid-cols-[72px_repeat(6,1fr)] sm:grid-cols-[80px_repeat(6,1fr)]'
                    : 'grid-cols-[72px_repeat(5,1fr)] sm:grid-cols-[80px_repeat(5,1fr)]'
                )}
                style={{ height: `${TOTAL_GRID_HEIGHT}px` }}
              >
                {/* 1. Left Time Labels Column */}
                <div className="relative h-full select-none bg-surface-card/25 border-r border-border-subtle">
                  {HOURLY_GRID_SLOTS.map((slot) => (
                    <div
                      key={slot.time}
                      className="h-[72px] px-2 py-1.5 border-b border-border-subtle/80 flex flex-col justify-start items-end"
                    >
                      <span className="text-[11px] font-bold text-text-primary font-mono leading-none">
                        {slot.time}
                      </span>
                      <span className="text-[10px] text-text-secondary font-mono leading-none mt-1">
                        {slot.nextTime}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 2. Day Columns */}
                {daysOfWeek.map((day) => {
                  const dayCourses = currentSemesterCourses.filter((c) => c.day_of_week === day.id);
                  const isToday = currentDayIndex === day.id;

                  return (
                    <div
                      key={day.id}
                      className={cn(
                        'relative h-full transition-colors',
                        isToday ? 'bg-primary/[0.015]' : ''
                      )}
                    >
                      {/* Background Hourly Guidelines & Clickable Empty Slots */}
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {HOURLY_GRID_SLOTS.map((slot) => (
                          <div
                            key={slot.time}
                            className="h-[72px] border-b border-border-subtle/70 relative group/slot pointer-events-auto"
                          >
                            <button
                              type="button"
                              onClick={() => openAddCourseModalWithPreset(day.id, slot.time)}
                              className="opacity-0 group-hover/slot:opacity-100 absolute inset-1 rounded-lg border border-dashed border-primary/40 hover:border-primary hover:bg-primary/[0.04] flex items-center justify-center transition-all cursor-pointer z-0"
                              title={`Tambah kuliah di ${day.name} jam ${slot.time}`}
                            >
                              <Plus size={14} className="text-primary" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Course Blocks: Rendered ONCE as an accurate minute-based block */}
                      {dayCourses.map((course) => {
                        const startMins = timeToMinutes(course.start_time);
                        const endMins = course.end_time
                          ? timeToMinutes(course.end_time)
                          : startMins + (course.credits_sks || 3) * 50;

                        const durationMins = Math.max(30, endMins - startMins);
                        const topPx = Math.max(0, (startMins - GRID_START_MINUTES) * PX_PER_MINUTE);
                        // Ensure comfortable minimum height (at least 80px) so all 4 vertical rows fit cleanly on 1/2/3 SKS
                        const heightPx = Math.max(80, durationMins * PX_PER_MINUTE);
                        const isSelected = selectedCourse?.id === course.id;
                        const hasPending = courseHasPendingTask(course);

                        return (
                          <div
                            key={course.id}
                            onClick={() => setSelectedCourseId(course.id)}
                            style={{
                              top: `${topPx}px`,
                              height: `${heightPx - 4}px`, // 4px margin bottom
                            }}
                            className={cn(
                              'absolute left-1.5 right-1.5 rounded-xl bg-category-kuliah-tint border-l-[3.5px] border-category-kuliah p-2.5 z-10 transition-all cursor-pointer group flex flex-col justify-between overflow-hidden shadow-2xs',
                              isSelected
                                ? 'ring-2 ring-primary shadow-md z-20 bg-category-kuliah-tint/95'
                                : 'hover:shadow-md hover:z-20 hover:border-category-kuliah'
                            )}
                          >
                            {hasPending && (
                              <span
                                className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF8A4C] ring-2 ring-category-kuliah-tint shrink-0 z-10"
                                title="Ada tugas pending"
                              />
                            )}

                            <div>
                              {/* 1. Baris 1: Nama Mata Kuliah */}
                              <div className={cn('flex items-start justify-between gap-1', hasPending && 'pr-2.5')}>
                                <h4
                                  className="text-xs font-bold text-text-primary leading-snug group-hover:text-category-kuliah transition-colors line-clamp-2"
                                  title={course.course_name}
                                >
                                  {course.course_name}
                                </h4>
                                {isSelected && (
                                  <CheckCircle size={14} weight="fill" className="text-primary shrink-0 mt-0.5 ml-1" />
                                )}
                              </div>

                              {/* Jarak vertikal kecil (5px) antar Baris 2 dan Baris 3 */}
                              <div className="flex flex-col gap-1.5 mt-1.5 min-w-0">
                                {/* 2. Baris 2: Jam */}
                                <p className="text-[11px] font-semibold text-category-kuliah leading-tight">
                                  {course.start_time} – {course.end_time}
                                </p>

                                {/* 3. Baris 3: Badge SKS (di bawah jam perkuliahan) */}
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-category-kuliah border border-category-kuliah/20 shadow-2xs leading-none">
                                    {course.credits_sks} SKS
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* 4. Baris 4: Ruangan/Lokasi (baris paling bawah, sendiri, ikon pin, text-overflow: ellipsis) */}
                            <div
                              className="flex items-center gap-1 text-[11px] text-text-secondary w-full min-w-0 pt-1 border-t border-category-kuliah/15"
                              title={course.room_location}
                            >
                              <MapPin size={11} className="shrink-0 text-category-kuliah/70" />
                              <span className="truncate font-medium">{course.room_location}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Zero Course Helper Banner */}
              {currentSemesterCourses.length === 0 && (
                <div className="p-8 text-center bg-page-background/40 border-t border-border-subtle flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-category-kuliah-tint text-category-kuliah flex items-center justify-center shadow-xs">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-text-primary">
                      Belum Ada Jadwal Kuliah di {currentSemester.name}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 max-w-md">
                      Tambahkan mata kuliah untuk semester ini agar jadwal mingguan otomatis tersusun pada grid di atas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openAddCourseModal}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Plus size={14} weight="bold" />
                    <span>Tambah Mata Kuliah Pertama</span>
                  </button>
                </div>
              )}
            </div>

            {/* SELECTED CLASS DETAIL CARD */}
            {selectedCourse ? (
              <div className="bg-white rounded-2xl border border-border-subtle p-6 card-spec space-y-4 animate-in fade-in duration-150">
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
                      <div className="flex items-center gap-2 flex-wrap">
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
                          <Clock size={14} className="text-text-secondary" />{' '}
                          {selectedCourse.time || `${selectedCourse.start_time} - ${selectedCourse.end_time} WIB`}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="text-text-secondary" /> {selectedCourse.room_location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Course */}
                  <div className="flex items-center gap-2 shrink-0 self-start">
                    <button
                      type="button"
                      onClick={() => openEditCourseModal(selectedCourse)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-subtle bg-white text-xs font-semibold text-text-primary hover:border-primary transition-colors cursor-pointer"
                    >
                      <PencilSimple size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus mata kuliah "${selectedCourse.course_name}"?`)) {
                          deleteCourse(selectedCourse.id);
                        }
                      }}
                      className="p-1.5 rounded-xl text-text-secondary hover:text-semantic-urgent hover:bg-semantic-urgent-tint transition-colors cursor-pointer"
                      title="Hapus Mata Kuliah"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>

                {/* Recurring Note Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-page-background border border-border-subtle text-xs text-text-secondary w-fit">
                  <ArrowsClockwise size={14} className="text-primary" />
                  <span>
                    Berulang setiap {daysOfWeek.find((d) => d.id === selectedCourse.day_of_week)?.name || 'pekan'} selama semester ini
                  </span>
                </div>

                {/* Sub-list of Tasks for this Course */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Tugas Mata Kuliah Ini ({selectedCourseTasks.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => openAddTaskModal(selectedCourse)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-tint rounded-xl transition-colors border border-dashed border-primary/40 cursor-pointer"
                    >
                      <Plus size={14} weight="bold" />
                      <span>Tambah Tugas</span>
                    </button>
                  </div>

                  {selectedCourseTasks.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-border-subtle text-center">
                      <p className="text-xs text-text-secondary">
                        Belum ada tugas khusus untuk mata kuliah ini.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {selectedCourseTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 rounded-xl border border-border-subtle bg-page-background/40 flex items-center justify-between gap-3 hover:border-primary/40 transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* 3-State Checkbox */}
                            <button
                              type="button"
                              onClick={() => cycleTaskStatus(task.id)}
                              className={cn(
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer',
                                task.status === 'SEDANG_DIKERJAKAN'
                                  ? 'border-status-in-progress bg-status-in-progress-tint'
                                  : task.status === 'SELESAI'
                                  ? 'border-status-completed bg-status-completed text-white'
                                  : 'border-status-not-started hover:border-primary'
                              )}
                              title="Klik untuk mengubah status tugas"
                            >
                              {task.status === 'SEDANG_DIKERJAKAN' && (
                                <div className="w-2 h-2 rounded-full bg-status-in-progress" />
                              )}
                              {task.status === 'SELESAI' && <Check size={12} weight="bold" />}
                            </button>

                            <div className="truncate">
                              <div
                                className={cn(
                                  'text-sm font-medium text-text-primary truncate',
                                  task.status === 'SELESAI' && 'line-through text-text-secondary'
                                )}
                              >
                                {task.title}
                              </div>
                              {task.notes && (
                                <p className="text-[11px] text-text-secondary truncate mt-0.5">{task.notes}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-semantic-urgent-tint text-semantic-urgent">
                              <CalendarBlank size={12} /> {task.deadlineDisplay || 'Deadline'}
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
                              {task.status === 'SEDANG_DIKERJAKAN'
                                ? 'Sedang Dikerjakan'
                                : task.status === 'SELESAI'
                                ? 'Selesai'
                                : 'Belum Mulai'}
                            </span>

                            {/* Task Actions */}
                            <button
                              type="button"
                              onClick={() => openEditTaskModal(task, selectedCourse)}
                              className="p-1 text-text-secondary hover:text-primary transition-colors cursor-pointer"
                              title="Edit Tugas"
                            >
                              <PencilSimple size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-text-secondary hover:text-semantic-urgent transition-colors cursor-pointer"
                              title="Hapus Tugas"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
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
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-category-kuliah-tint text-category-kuliah">
                  {academicTasks.filter((t) => t.status !== 'SELESAI').length} Aktif
                </span>
              </div>

              <p className="text-xs text-text-secondary">
                Daftar seluruh tugas akademik dari jadwal semester ini, diurutkan menurut tenggat waktu terdekat.
              </p>

              {/* Vertical Task List */}
              {academicTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-text-secondary">
                  Belum ada tugas kuliah yang dicatat.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {academicTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-border-subtle bg-white hover:border-primary/40 transition-colors space-y-2"
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => cycleTaskStatus(task.id)}
                          className={cn(
                            'w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-all cursor-pointer',
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
                        </button>
                        <div className="min-w-0 flex-1">
                          <h4
                            className={cn(
                              'text-xs font-semibold text-text-primary truncate',
                              task.status === 'SELESAI' && 'line-through text-text-secondary'
                            )}
                          >
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-text-secondary mt-0.5 truncate">{task.parent_title}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-semantic-urgent font-semibold">
                          Tenggat: {task.deadlineDisplay || 'Tenggat Waktu'}
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
              )}
            </div>

            {/* Total SKS Summary Card */}
            <div className="bg-surface-card rounded-2xl p-5 border border-border-subtle card-spec flex items-center justify-between">
              <div>
                <span className="text-xs text-text-secondary block">Total Beban Akademik</span>
                <span className="font-display font-bold text-lg text-text-primary">
                  {totalSks} SKS / {currentSemesterCourses.length} Mata Kuliah
                </span>
              </div>
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  totalSks >= 18
                    ? 'bg-status-completed-tint text-status-completed'
                    : totalSks > 0
                    ? 'bg-category-kuliah-tint text-category-kuliah'
                    : 'bg-status-not-started-tint text-text-secondary'
                )}
              >
                {totalSks >= 18 ? 'Beban Penuh' : totalSks > 0 ? 'Beban Aktif' : 'Belum Ada Jadwal'}
              </span>
            </div>
          </aside>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="flex flex-col gap-4 pt-2">
          {currentSemesterCourses.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={36} />}
              title="Belum Ada Mata Kuliah Terdaftar"
              description={`Mata kuliah untuk semester ${currentSemester.name} masih kosong. Tambahkan jadwal mata kuliah Anda sekarang.`}
              action={
                <button
                  type="button"
                  onClick={openAddCourseModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Plus size={14} weight="bold" />
                  <span>Tambah Mata Kuliah</span>
                </button>
              }
            />
          ) : (
            currentSemesterCourses.map((c) => {
              const courseTasks = tasks.filter(
                (t) => t.parent_id === c.id || t.parent_title?.toLowerCase() === c.course_name.toLowerCase()
              );
              const pendingCount = courseTasks.filter((t) => t.status !== 'SELESAI').length;

              return (
                <div
                  key={c.id}
                  className="bg-surface-card rounded-2xl p-5 border border-border-subtle card-spec flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary/40"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-category-kuliah-tint text-category-kuliah flex items-center justify-center font-bold text-sm shrink-0">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-base text-text-primary">{c.course_name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-category-kuliah-tint text-category-kuliah">
                          {c.credits_sks} SKS
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-not-started-tint text-text-secondary">
                          {c.type || 'Wajib Prodi'}
                        </span>
                        {pendingCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFEDE2] text-[#FF8A4C]">
                            {pendingCount} Tugas Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary mt-1">
                        {c.time || `${c.start_time} - ${c.end_time}`} • {c.room_location} • Dosen: {c.lecturer || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      type="button"
                      onClick={() => openAddTaskModal(c)}
                      className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} weight="bold" />
                      <span>Tambah Tugas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditCourseModal(c)}
                      className="px-3 py-2 rounded-xl border border-border-subtle hover:bg-page-background text-xs font-semibold text-text-primary transition-all cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus mata kuliah "${c.course_name}"?`)) {
                          deleteCourse(c.id);
                        }
                      }}
                      className="p-2 rounded-xl text-text-secondary hover:text-semantic-urgent hover:bg-semantic-urgent-tint transition-colors cursor-pointer"
                      title="Hapus Mata Kuliah"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* Semester Modal */}
      <SemesterModal
        isOpen={isSemesterModalOpen}
        onClose={() => setIsSemesterModalOpen(false)}
      />

      {/* Course Modal (Add & Edit) */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setCourseModalPreset({});
        }}
        editingCourse={editingCourse}
        initialDay={courseModalPreset.day}
        initialStartTime={courseModalPreset.startTime}
      />

      {/* Course Sub-Task Modal (Add & Edit) */}
      {taskTargetCourse && (
        <CourseTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          course={taskTargetCourse}
          editingTask={editingTask}
        />
      )}
    </div>
  );
}
