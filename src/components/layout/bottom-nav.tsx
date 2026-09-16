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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-card border-t border-border-subtle z-40 flex items-center justify-around px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all',
              isActive
                ? 'text-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary font-medium'
            )}
          >
            <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
            <span className="text-[10px] mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
