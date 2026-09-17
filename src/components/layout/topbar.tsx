'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  CaretDown
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/app-context';
import { ProfileModal } from './profile-modal';
import { NotificationPreferencesModal } from './notification-preferences-modal';

interface TopbarProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
}) => {
  const { user, profile, signOut } = useApp();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotifPrefsModalOpen, setIsNotifPrefsModalOpen] = useState(false);

  // Toggle for mock empty state vs populated list (matching legacy-prototype)
  const [isNotifMockEmpty, setIsNotifMockEmpty] = useState(false);

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
              {!isNotifMockEmpty && (
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
                      isNotifMockEmpty
                        ? 'bg-status-completed-tint text-status-completed'
                        : 'bg-semantic-urgent-tint text-semantic-urgent'
                    )}>
                      {isNotifMockEmpty ? '0 Baru' : '3 Baru'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNotifMockEmpty(!isNotifMockEmpty)}
                    className="text-xs text-primary hover:underline font-medium cursor-pointer"
                  >
                    Beralih Mock
                  </button>
                </div>

                {/* Populated Notification Items */}
                {!isNotifMockEmpty ? (
                  <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                    <div className="p-3 rounded-xl bg-semantic-urgent-tint/50 border border-semantic-urgent/20 flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-lg bg-semantic-urgent text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Alarm size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-primary">Deadline Besok: Laporan SQL</p>
                        <p className="text-[11px] text-text-secondary mt-0.5">Sistem Basis Data • Besok, 23:59</p>
                        <span className="inline-block text-[10px] text-semantic-urgent font-medium mt-1">
                          H-1 • Notifikasi Email (Resend) & WA (Twilio)
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-category-lomba-tint/60 border border-category-lomba/20 flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-lg bg-category-lomba text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Trophy size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-primary">Submit 3 Hari Lagi: Pitch Deck</p>
                        <p className="text-[11px] text-text-secondary mt-0.5">UI/UX Hackathon 2026</p>
                        <span className="inline-block text-[10px] text-[#B45309] font-medium mt-1">
                          H-3 • Pengingat WhatsApp Twilio
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-category-kepanitiaan-tint/60 border border-category-kepanitiaan/20 flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-lg bg-category-kepanitiaan text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Users size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-primary">Rapat Rutin Sie Acara</p>
                        <p className="text-[11px] text-text-secondary mt-0.5">Kamis, 16:00 via Zoom</p>
                        <span className="inline-block text-[10px] text-category-kepanitiaan font-medium mt-1">
                          🔁 Rapat Berulang Tiap Kamis
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty State View */
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-status-completed-tint text-status-completed flex items-center justify-center mb-2">
                      <Checks size={24} weight="bold" />
                    </div>
                    <p className="text-sm font-semibold text-text-primary">Semua beres!</p>
                    <p className="text-xs text-text-secondary mt-1">Tidak ada deadline yang mendesak hari ini.</p>
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
