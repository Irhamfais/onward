import React from 'react';
import { TaskCategory, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: TaskCategory;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className }) => {
  switch (category) {
    case 'KULIAH':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-category-kuliah-tint text-category-kuliah border border-category-kuliah/20', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-category-kuliah"></span>
          Kuliah
        </span>
      );
    case 'LOMBA':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-category-lomba-tint text-[#B45309] border border-category-lomba/30', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-category-lomba"></span>
          Lomba
        </span>
      );
    case 'KEPANITIAAN':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-category-kepanitiaan-tint text-[#0D9488] border border-category-kepanitiaan/20', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-category-kepanitiaan"></span>
          Kepanitiaan
        </span>
      );
    default:
      return null;
  }
};

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  switch (status) {
    case 'BELUM_MULAI':
      return (
        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-not-started-tint text-status-not-started', className)}>
          Belum Mulai
        </span>
      );
    case 'SEDANG_DIKERJAKAN':
      return (
        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-in-progress-tint text-status-in-progress', className)}>
          Sedang Dikerjakan
        </span>
      );
    case 'SELESAI':
      return (
        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-completed-tint text-status-completed', className)}>
          Selesai
        </span>
      );
    default:
      return null;
  }
};
