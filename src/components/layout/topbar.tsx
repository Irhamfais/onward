'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  SidebarSimple, 
  MagnifyingGlass, 
  Bell, 
  Alarm, 
  Trophy, 
  Users, 
  ArrowCounterClockwise,
  SignOut,
  User,
  Gear
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface TopbarProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetDemoData?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  onResetDemoData,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="sticky top-0 z-40 h-[72px] bg-surface-card border-b border-border-subtle px-4 md:px-8 flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.03)] gap-4">
      {/* Left: Sidebar Toggle + Global Search */}
      <div className="flex items-center gap-3 w-full max-w-[500px]">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Buka / Ciutkan Sidebar"
          title="Buka / Ciutkan Sidebar (Ctrl+B)"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary-tint border border-border-subtle shrink-0 transition-colors"
        >
          <SidebarSimple size={22} weight="bold" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full">
          <MagnifyingGlass
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari tugas, mata kuliah, lomba..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-page-background border border-transparent focus:border-primary focus:bg-white focus:outline-none text-sm text-text-primary placeholder:text-text-secondary transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-primary"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Controls: Notification Bell + User Profile Dropdown */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-page-background transition-colors"
            title="Notifikasi Pengingat"
          >
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-semantic-urgent ring-2 ring-white"></span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface-card rounded-2xl border border-border-subtle shadow-dropdown z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-3">
                <span className="font-display font-semibold text-sm text-text-primary">
                  Notifikasi Pengingat
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-semantic-urgent-tint text-semantic-urgent">
                  3 Baru
                </span>
              </div>

              {/* Notification Items */}
              <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                <div className="p-3 rounded-xl bg-semantic-urgent-tint/50 border border-semantic-urgent/20 flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-lg bg-semantic-urgent text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Alarm size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary">Deadline Besok: Laporan SQL</p>
                    <p className="text-[11px] text-text-secondary mt-0.5">Sistem Basis Data • Besok, 23:59</p>
                    <span className="inline-block text-[10px] text-semantic-urgent font-medium mt-1">
                      H-1 • Notifikasi Email (Resend)
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
            </div>
          )}
        </div>

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
              AR
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-sm font-semibold text-text-primary leading-tight">Alya Rahmawati</span>
              <span className="text-xs text-text-secondary leading-tight">Semester 5 • Fasilkom</span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-surface-card rounded-2xl border border-border-subtle shadow-dropdown z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-border-subtle mb-1">
                <p className="text-xs font-semibold text-text-primary">Alya Rahmawati</p>
                <p className="text-[11px] text-text-secondary truncate">alya.rahmawati@kampus.ac.id</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-category-kuliah-tint text-category-kuliah">
                  WhatsApp Verified
                </span>
              </div>

              <div className="flex flex-col gap-0.5 text-xs font-medium text-text-secondary">
                <button
                  type="button"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-page-background hover:text-text-primary transition-colors text-left"
                >
                  <User size={16} />
                  <span>Profil Saya</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-page-background hover:text-text-primary transition-colors text-left"
                >
                  <Gear size={16} />
                  <span>Preferensi Notifikasi</span>
                </button>

                {onResetDemoData && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onResetDemoData();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-primary hover:bg-primary-tint transition-colors text-left font-semibold"
                  >
                    <ArrowCounterClockwise size={16} />
                    <span>Reset Data Demo</span>
                  </button>
                )}

                <div className="my-1 border-t border-border-subtle/60" />

                <button
                  type="button"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-semantic-urgent hover:bg-semantic-urgent-tint transition-colors text-left font-medium"
                >
                  <SignOut size={16} />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
