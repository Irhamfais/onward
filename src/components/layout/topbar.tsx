'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  SidebarSimple, 
  MagnifyingGlass, 
  Bell, 
  Alarm, 
  Trophy, 
  Users, 
  SignOut,
  User,
  BellRinging,
  LockKey,
  Checks,
  CaretDown,
  BookOpen
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/app-context';
import { formatDateDisplay, formatCountdown } from '@/lib/date-utils';
import { ProfileModal } from './profile-modal';
import { NotificationPreferencesModal } from './notification-preferences-modal';

interface TopbarProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface NotifItem {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeColor: string;
  iconType: 'KULIAH' | 'LOMBA' | 'KEPANITIAAN';
  href: string;
  isUrgent: boolean;
  sortTime: number;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
}) => {
  const { user, profile, signOut, tasks, meetings, committees } = useApp();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotifPrefsModalOpen, setIsNotifPrefsModalOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.name || (user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || user?.email?.split('@')[0] || 'Mahasiswa';
  const displayEmail = user?.email || profile?.email || 'Akun Mahasiswa';
  const displayMajor = profile?.major ? `${profile.major} • Smst ${profile.semester || 1}` : 'Mahasiswa Onward';
  
  // Initials from display name
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ON';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute dynamic notifications from active tasks and meetings
  const notifications: NotifItem[] = useMemo(() => {
    const items: NotifItem[] = [];

    // 1. Active / Uncompleted tasks
    const activeTasks = (tasks || []).filter((t) => t.status !== 'SELESAI');
    for (const task of activeTasks) {
      const countdown = formatCountdown(task.deadline, 'Deadline');
      const targetDate = new Date(task.deadline);
      const timeMs = isNaN(targetDate.getTime()) ? Date.now() + 86400000 : targetDate.getTime();

      let iconType: 'KULIAH' | 'LOMBA' | 'KEPANITIAAN' = 'KULIAH';
      let href = '/kuliah';
      let parentName = task.parent_title || 'Mata Kuliah';

      if (task.category === 'LOMBA') {
        iconType = 'LOMBA';
        href = '/lomba';
        parentName = task.parent_title || 'Lomba';
      } else if (task.category === 'KEPANITIAAN') {
        iconType = 'KEPANITIAAN';
        href = '/kepanitiaan';
        parentName = task.parent_title || 'Kepanitiaan';
      }

      const formattedDate = formatDateDisplay(task.deadline);
      const timePart = task.deadline.includes('T') ? ` • ${task.deadline.split('T')[1].slice(0, 5)}` : '';

      let badgeText = '';
      let badgeColor = '';

      if (countdown.isOverdue) {
        badgeText = '⚠️ Lewat Deadline • WhatsApp Gateway';
        badgeColor = 'text-semantic-urgent font-semibold';
      } else if (countdown.daysRemaining === 0) {
        badgeText = '🔥 Deadline Hari Ini • WhatsApp Gateway';
        badgeColor = 'text-semantic-urgent font-semibold';
      } else if (countdown.daysRemaining === 1) {
        badgeText = '⚡ H-1 Besok • WhatsApp Gateway';
        badgeColor = 'text-semantic-urgent font-medium';
      } else if (countdown.daysRemaining <= 3) {
        badgeText = `H-${countdown.daysRemaining} • WhatsApp Gateway`;
        badgeColor = 'text-[#B45309] font-medium';
      } else {
        badgeText = `Tenggat ${countdown.text} • WhatsApp Gateway`;
        badgeColor = 'text-primary font-medium';
      }

      items.push({
        id: `task-${task.id}`,
        title: countdown.isOverdue 
          ? `Lewat Deadline: ${task.title}` 
          : countdown.daysRemaining <= 1 
          ? `Deadline Segera: ${task.title}` 
          : task.title,
        subtitle: `${parentName} • ${formattedDate}${timePart}`,
        badgeText,
        badgeColor,
        iconType,
        href,
        isUrgent: countdown.isUrgent,
        sortTime: timeMs,
      });
    }

    // 2. Upcoming / recurring committee meetings
    const now = Date.now();
    for (const meeting of meetings || []) {
      const committee = (committees || []).find((c) => c.id === meeting.committee_id);
      const committeeName = committee?.organization_event_name || 'Kepanitiaan';
      const meetingDateTimeStr = meeting.start_time 
        ? `${meeting.meeting_date}T${meeting.start_time}:00` 
        : `${meeting.meeting_date}T00:00:00`;
      const meetingDate = new Date(meetingDateTimeStr);
      const timeMs = isNaN(meetingDate.getTime()) ? now : meetingDate.getTime();

      // Show meetings that are recurring or within upcoming horizon
      if (meeting.is_recurring || timeMs >= now - 24 * 60 * 60 * 1000) {
        const formattedDate = formatDateDisplay(meeting.meeting_date);
        const locPart = meeting.location ? ` di ${meeting.location}` : '';
        const timePart = meeting.start_time ? ` • ${meeting.start_time}` : '';
        const isNear = Math.abs(timeMs - now) < 24 * 60 * 60 * 1000;

        items.push({
          id: `meeting-${meeting.id}`,
          title: `Rapat: ${meeting.title}`,
          subtitle: `${committeeName} • ${formattedDate}${timePart}${locPart}`,
          badgeText: meeting.is_recurring 
            ? '🔁 Rapat Berulang • Ingatkan 2 Jam Sebelumnya (WA)' 
            : isNear
            ? '📅 Rapat Segera • Ingatkan 2 Jam Sebelumnya (WA)'
            : '📅 Jadwal Rapat • Ingatkan 2 Jam Sebelumnya (WA)',
          badgeColor: 'text-category-kepanitiaan font-medium',
          iconType: 'KEPANITIAAN',
          href: '/kepanitiaan',
          isUrgent: isNear,
          sortTime: timeMs,
        });
      }
    }

    // Sort chronologically ascending
    items.sort((a, b) => a.sortTime - b.sortTime);

    return items;
  }, [tasks, meetings, committees]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-[72px] bg-surface-card border-b border-border-subtle px-4 md:px-8 flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.03)] gap-4">
        {/* Left: Sidebar Toggle + Global Search */}
        <div className="flex items-center gap-3 w-full max-w-[500px]">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Buka / Ciutkan Sidebar"
            title="Buka / Ciutkan Sidebar (Ctrl+B)"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary-tint border border-border-subtle shrink-0 transition-colors cursor-pointer"
          >
            <SidebarSimple size={22} weight="bold" />
          </button>

          {/* Search Bar with Desktop Ctrl+K shortcut badge */}
          <div className="relative w-full">
            <MagnifyingGlass
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
            />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari tugas, mata kuliah, lomba..."
              className="w-full pl-11 pr-20 py-2.5 rounded-full bg-page-background border border-transparent focus:border-primary focus:bg-white focus:outline-none text-sm text-text-primary placeholder:text-text-secondary transition-all"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="text-xs text-text-secondary hover:text-primary p-0.5"
                  title="Bersihkan Pencarian"
                >
                  ✕
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-text-secondary/70 bg-surface-card border border-border-subtle rounded-md shadow-2xs pointer-events-none">
                  Ctrl K
                </kbd>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls: Notification Bell + Divider + User Profile Dropdown */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Notification Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false);
              }}
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-page-background transition-colors cursor-pointer"
              title="Notifikasi Pengingat"
            >
              <Bell size={22} />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-semantic-urgent ring-2 ring-white"></span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface-card rounded-2xl border border-border-subtle shadow-dropdown z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-sm text-text-primary">
                      Notifikasi Pengingat
                    </span>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-semibold',
                      notifications.length === 0
                        ? 'bg-status-completed-tint text-status-completed'
                        : 'bg-semantic-urgent-tint text-semantic-urgent'
                    )}>
                      {notifications.length === 0 ? '0 Pengingat' : `${notifications.length} Pengingat`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotifOpen(false);
                      setIsNotifPrefsModalOpen(true);
                    }}
                    className="text-xs text-primary hover:underline font-medium cursor-pointer"
                  >
                    Preferensi
                  </button>
                </div>

                {/* Notification Items List */}
                {notifications.length > 0 ? (
                  <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {notifications.map((notif) => (
                      <Link
                        key={notif.id}
                        href={notif.href}
                        onClick={() => setIsNotifOpen(false)}
                        className={cn(
                          "p-3 rounded-xl border flex gap-3 items-start transition-all hover:scale-[1.01] cursor-pointer",
                          notif.iconType === 'KULIAH'
                            ? "bg-category-kuliah-tint/50 border-category-kuliah/20 hover:border-category-kuliah/40"
                            : notif.iconType === 'LOMBA'
                            ? "bg-category-lomba-tint/50 border-category-lomba/20 hover:border-category-lomba/40"
                            : "bg-category-kepanitiaan-tint/50 border-category-kepanitiaan/20 hover:border-category-kepanitiaan/40"
                        )}
                      >
                        <div
                          className={cn(
                            "w-7 h-7 rounded-lg text-white flex items-center justify-center shrink-0 mt-0.5",
                            notif.iconType === 'KULIAH'
                              ? (notif.isUrgent ? "bg-semantic-urgent" : "bg-category-kuliah")
                              : notif.iconType === 'LOMBA'
                              ? "bg-category-lomba"
                              : "bg-category-kepanitiaan"
                          )}
                        >
                          {notif.iconType === 'KULIAH' && (notif.isUrgent ? <Alarm size={16} /> : <BookOpen size={16} />)}
                          {notif.iconType === 'LOMBA' && <Trophy size={16} />}
                          {notif.iconType === 'KEPANITIAAN' && <Users size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-text-primary truncate">{notif.title}</p>
                          <p className="text-[11px] text-text-secondary mt-0.5 truncate">{notif.subtitle}</p>
                          <span className={cn("inline-block text-[10px] mt-1", notif.badgeColor)}>
                            {notif.badgeText}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  /* Empty State View */
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-status-completed-tint text-status-completed flex items-center justify-center mb-2">
                      <Checks size={24} weight="bold" />
                    </div>
                    <p className="text-sm font-semibold text-text-primary">Semua beres!</p>
                    <p className="text-xs text-text-secondary mt-1">Tidak ada deadline tugas atau jadwal rapat yang mendesak.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-border-subtle hidden sm:block"></div>

          {/* User Profile Avatar Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-3 cursor-pointer group text-left p-1 rounded-xl hover:bg-page-background transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-display font-semibold text-sm flex items-center justify-center ring-2 ring-primary/20">
                {initials}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-sm font-semibold text-text-primary leading-tight truncate max-w-[140px]">{displayName}</span>
                <span className="text-xs text-text-secondary leading-tight truncate max-w-[140px]">{displayMajor}</span>
              </div>
              <CaretDown size={14} className="hidden lg:block text-text-secondary" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-surface-card rounded-2xl border border-border-subtle shadow-dropdown z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-border-subtle mb-1">
                  <p className="text-xs font-semibold text-text-primary truncate">{displayName}</p>
                  <p className="text-[11px] text-text-secondary truncate">{displayEmail}</p>
                  {profile?.is_wa_verified && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-category-kuliah-tint text-category-kuliah">
                      WhatsApp Verified
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-0.5 text-xs font-medium text-text-secondary">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-page-background hover:text-text-primary transition-colors text-left cursor-pointer"
                  >
                    <User size={16} />
                    <span>Profil Saya</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsNotifPrefsModalOpen(true);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-page-background hover:text-text-primary transition-colors text-left cursor-pointer"
                  >
                    <BellRinging size={16} />
                    <span>Preferensi Notifikasi</span>
                  </button>

                  <Link
                    href="/forgot-password"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-page-background hover:text-text-primary transition-colors text-left"
                  >
                    <LockKey size={16} />
                    <span>Reset Password</span>
                  </Link>

                  <div className="my-1 border-t border-border-subtle/60" />

                  <button
                    type="button"
                    disabled={isSigningOut}
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-semantic-urgent hover:bg-semantic-urgent-tint transition-colors text-left font-medium disabled:opacity-50 cursor-pointer"
                  >
                    <SignOut size={16} />
                    <span>{isSigningOut ? 'Keluar...' : 'Keluar'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Notification Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={isNotifPrefsModalOpen}
        onClose={() => setIsNotifPrefsModalOpen(false)}
      />
    </>
  );
};
