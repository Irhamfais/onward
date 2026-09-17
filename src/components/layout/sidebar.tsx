'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CheckCircle, 
  SquaresFour, 
  BookOpen, 
  Trophy, 
  Users, 
  CaretDoubleLeft, 
  CaretDoubleRight,
  X
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: SquaresFour },
    { label: 'Jadwal Kuliah', href: '/kuliah', icon: BookOpen },
    { label: 'Lomba', href: '/lomba', icon: Trophy },
    { label: 'Kepanitiaan', href: '/kepanitiaan', icon: Users },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-surface-card border-r border-border-subtle z-50 flex flex-col justify-between py-6 transition-all duration-300',
          isCollapsed ? 'w-[72px] px-2.5' : 'w-60 px-4',
          isMobileOpen ? 'translate-x-0 w-64 px-4 shadow-modal' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col gap-8">
          {/* Wordmark & Logo */}
          <div
            className={cn(
              'flex items-center pt-1 transition-all',
              isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'justify-between px-2'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                style={{
                  background: 'linear-gradient(135deg, rgb(143, 127, 255) 0%, rgb(124, 92, 252) 100%)',
                  boxShadow: 'rgba(124, 92, 252, 0.25) 0px 4px 12px',
                }}
              >
                <CheckCircle size={22} weight="bold" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <span className="font-display font-bold text-xl tracking-tight text-text-primary whitespace-nowrap">
                  Onward
                </span>
              )}
            </div>

            {/* Mobile Drawer Close Button */}
            {isMobileOpen && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-page-background transition-colors"
                aria-label="Tutup Menu"
              >
                <X size={18} weight="bold" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={item.label}
                  className={cn(
                    'group relative w-full flex items-center rounded-xl text-sm font-semibold transition-all',
                    isCollapsed && !isMobileOpen ? 'justify-center px-0 py-2.5' : 'gap-3 px-3.5 py-2.5',
                    isActive
                      ? 'bg-primary-fixed text-primary'
                      : 'text-text-secondary hover:bg-page-background hover:text-text-primary font-medium'
                  )}
                >
                  <Icon size={20} weight={isActive ? 'fill' : 'regular'} className="shrink-0" />
                  {(!isCollapsed || isMobileOpen) ? (
                    <span className="whitespace-nowrap">{item.label}</span>
                  ) : (
                    <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-text-primary text-white text-xs font-medium shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Single Collapse / Restore Control at Bottom */}
        <div className="pt-4 border-t border-border-subtle hidden md:block">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Kembalikan Sidebar (Ctrl+B)' : 'Ciutkan Sidebar (Ctrl+B)'}
            className={cn(
              'group relative flex items-center rounded-xl text-xs font-semibold transition-all w-full py-2',
              isCollapsed
                ? 'justify-center bg-primary-tint text-primary px-0'
                : 'gap-2.5 px-3 text-text-secondary hover:text-primary hover:bg-page-background'
            )}
          >
            {isCollapsed ? (
              <>
                <CaretDoubleRight size={18} weight="bold" className="shrink-0 text-primary" />
                <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-text-primary text-white text-xs font-medium shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  Kembalikan Sidebar (Ctrl+B)
                </span>
              </>
            ) : (
              <>
                <CaretDoubleLeft size={16} className="shrink-0" />
                <span className="whitespace-nowrap">Ciutkan Sidebar</span>
                <span className="ml-auto text-[10px] text-text-secondary/70 font-mono">Ctrl+B</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
