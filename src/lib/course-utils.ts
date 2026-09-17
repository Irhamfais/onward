import type { Course } from '@/types';

// Grid Constants
export const GRID_START_HOUR = 8;
export const GRID_START_MINUTE = 30;
export const GRID_START_MINUTES = 8 * 60 + 30; // 510 minutes (08:30)
export const GRID_END_MINUTES = 18 * 60 + 30;  // 1110 minutes (18:30)
export const TOTAL_GRID_MINUTES = GRID_END_MINUTES - GRID_START_MINUTES; // 600 minutes (10 hours)
export const HOUR_HEIGHT = 72; // pixels per 60 minutes
export const PX_PER_MINUTE = HOUR_HEIGHT / 60; // 1.2 px per minute
export const TOTAL_GRID_HEIGHT = 10 * HOUR_HEIGHT; // 720 pixels

/**
 * Converts a time string "HH:mm" into minutes from midnight (00:00).
 */
export const timeToMinutes = (timeStr?: string): number => {
  if (!timeStr) return GRID_START_MINUTES;
  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return (isNaN(h) ? 8 : h) * 60 + (isNaN(m) ? 30 : m);
};

/**
 * Converts minutes from midnight into a formatted time string "HH:mm".
 */
export const minutesToTime = (totalMinutes: number): string => {
  const normalized = Math.max(0, totalMinutes);
  const h = Math.floor(normalized / 60) % 24;
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Calculates end time based on:
 * durasi_menit = SKS * 50
 * jam_selesai = jam_mulai + durasi_menit
 */
export const calculateEndTime = (startTime: string, sks: number): string => {
  const startMins = timeToMinutes(startTime || '08:30');
  const durationMins = Math.max(1, sks || 1) * 50;
  const endMins = startMins + durationMins;
  return minutesToTime(endMins);
};

/**
 * Checks whether a course overlaps with existing courses on the same day in the same semester.
 * Returns the clashing course if found, or null otherwise.
 */
export const checkCourseOverlap = (
  target: {
    id?: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    semester_id?: string;
  },
  allCourses: Course[]
): Course | null => {
  const targetStart = timeToMinutes(target.start_time);
  const targetEnd = timeToMinutes(target.end_time);

  for (const course of allCourses) {
    // Ignore self if editing
    if (target.id && course.id === target.id) continue;

    // Must be on the same day of week
    if (course.day_of_week !== target.day_of_week) continue;

    // Must belong to the same semester if both have semester_id
    if (target.semester_id && course.semester_id && target.semester_id !== course.semester_id) {
      continue;
    }

    const courseStart = timeToMinutes(course.start_time);
    const courseEnd = timeToMinutes(course.end_time);

    // Two intervals [A_start, A_end] and [B_start, B_end] overlap if:
    // A_start < B_end && A_end > B_start
    if (targetStart < courseEnd && targetEnd > courseStart) {
      return course;
    }
  }

  return null;
};

/**
 * Hourly guideline slots from 08:30 to 16:30 (with 17:30 as the final boundary).
 */
export interface HourSlot {
  index: number;
  time: string;
  nextTime: string;
  startMinutes: number;
}

export const HOURLY_GRID_SLOTS: HourSlot[] = [
  { index: 0, time: '08:30', nextTime: '09:30', startMinutes: 510 },
  { index: 1, time: '09:30', nextTime: '10:30', startMinutes: 570 },
  { index: 2, time: '10:30', nextTime: '11:30', startMinutes: 630 },
  { index: 3, time: '11:30', nextTime: '12:30', startMinutes: 690 },
  { index: 4, time: '12:30', nextTime: '13:30', startMinutes: 750 },
  { index: 5, time: '13:30', nextTime: '14:30', startMinutes: 810 },
  { index: 6, time: '14:30', nextTime: '15:30', startMinutes: 870 },
  { index: 7, time: '15:30', nextTime: '16:30', startMinutes: 930 },
  { index: 8, time: '16:30', nextTime: '17:30', startMinutes: 990 },
  { index: 9, time: '17:30', nextTime: '18:30', startMinutes: 1050 },
];
