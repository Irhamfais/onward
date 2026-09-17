export type TaskStatus = 'BELUM_MULAI' | 'SEDANG_DIKERJAKAN' | 'SELESAI';
export type TaskCategory = 'KULIAH' | 'LOMBA' | 'KEPANITIAAN';
export type CompetitionStatus = 'MENDAFTAR' | 'PROSES_PENGERJAAN' | 'SUDAH_SUBMIT' | 'HASIL_KELUAR';

export interface UnifiedTask {
  id: string;
  title: string;
  deadline: string;
  deadlineDisplay?: string;
  status: TaskStatus;
  category: TaskCategory;
  parent_title: string;
  parent_id?: string;
  notes?: string;
  user_id?: string;
}

export interface Course {
  id: string;
  course_name: string;
  day_of_week: number; // 1 = Senin ... 7 = Minggu
  start_time: string;
  end_time: string;
  room_location: string;
  lecturer?: string;
  credits_sks?: number;
  color_code?: string;
  type?: string;
  time?: string;
  hasPendingTask?: boolean;
}

export interface Competition {
  id: string;
  name: string;
  category?: string;
  description?: string;
  reg_deadline?: string;
  submission_deadline: string;
  deadlineDisplay?: string;
  team_members?: string;
  status: CompetitionStatus;
  level?: string;
  progressPct?: number;
  progressDone?: number;
  progressTotal?: number;
  achievement?: string;
  related_links?: string[];
}

export interface Committee {
  id: string;
  organization_event_name: string;
  role_division: string;
  role?: string;
  status?: string;
  start_date: string;
  end_date: string;
  periodDisplay?: string;
  progressPct?: number;
  remainingDays?: string;
  meetingTitle?: string;
  meetingTime?: string;
  meetingLocation?: string;
  recurring?: boolean;
  jobDescDone?: number;
  jobDescTotal?: number;
  jobDescPct?: number;
  notes?: string;
}

export interface CommitteeMeeting {
  id: string;
  committee_id: string;
  title: string;
  meeting_date: string;
  start_time: string;
  location: string;
  is_recurring?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone_wa?: string;
  is_wa_verified?: boolean;
  avatar_url?: string;
  major?: string;
  semester?: number;
}


