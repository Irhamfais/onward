'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SquaresFour, BookOpen, Trophy, Users } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: SquaresFour },
    { label: 'Kuliah', href: '/kuliah', icon: BookOpen },
    { label: 'Lomba', href: '/lomba', icon: Trophy },
    { label: 'Kepanitiaan', href: '/kepanitiaan', icon: Users },
  ];

  return (
    <nav
      aria-label="Navigasi Utama Mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-card border-t border-border-subtle z-40 flex items-center justify-around px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'relative flex flex-col items-center justify-center flex-1 max-w-[80px] h-full py-1 transition-all group',
              isActive
                ? 'text-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary font-medium'
            )}
          >
            {/* Active Top Indicator Bar */}
            {isActive && (
              <span className="absolute top-0 w-8 h-1 rounded-b-full bg-primary transition-all animate-in fade-in" />
            )}

            <div className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
              isActive && 'bg-primary-tint'
            )}>
              <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
