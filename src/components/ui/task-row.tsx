import React from 'react';
import { UnifiedTask, TaskStatus } from '@/types';
import { CategoryBadge, StatusBadge } from './badge';
import { Check, Clock, Trash, ArrowsClockwise } from '@phosphor-icons/react';
import { cn, formatDateTimeIndonesian } from '@/lib/utils';

interface TaskRowProps {
  task: UnifiedTask;
  onCycleStatus: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  className?: string;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  onCycleStatus,
  onDelete,
  className,
}) => {
  const isCompleted = task.status === 'SELESAI';
  const isPending = task.status === 'SEDANG_DIKERJAKAN';

  const deadlineDate = new Date(task.deadline);
  const now = new Date();
  const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isUrgent = diffHours > 0 && diffHours <= 48 && !isCompleted;
  const isOverdue = diffHours <= 0 && !isCompleted;

  return (
    <div
      className={cn(
        'group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-surface-card border border-border-subtle hover:border-primary/40 hover:shadow-xs transition-all gap-3',
        isCompleted && 'bg-page-background/50 border-border-subtle/60',
        className
      )}
    >
      {/* Left: Checkbox + Title + Parent */}
      <div className="flex items-start gap-3 min-w-0">
        {/* Status Toggle Button */}
        <button
          type="button"
          onClick={() => onCycleStatus(task.id)}
          title={`Status: ${task.status}. Klik untuk ubah siklus status.`}
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer',
            task.status === 'BELUM_MULAI' && 'border-2 border-status-not-started/50 hover:border-primary',
            task.status === 'SEDANG_DIKERJAKAN' && 'bg-status-in-progress-tint text-status-in-progress border-2 border-status-in-progress animate-pulse',
            task.status === 'SELESAI' && 'bg-status-completed text-white border-2 border-status-completed'
          )}
        >
          {task.status === 'SELESAI' && <Check size={14} weight="bold" />}
          {task.status === 'SEDANG_DIKERJAKAN' && <Clock size={12} weight="bold" />}
        </button>

        {/* Title and Parent Category Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={cn(
                'text-sm font-semibold text-text-primary transition-all line-clamp-1',
                isCompleted && 'line-through text-text-secondary/70'
              )}
            >
              {task.title}
            </h4>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
            <span className="font-medium text-text-secondary/80 truncate max-w-[200px]">
              {task.parent_title}
            </span>
            <span>•</span>
            <CategoryBadge category={task.category} />
          </div>
        </div>
      </div>

      {/* Right: Deadline + Status + Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle/50">
        <div className="flex items-center gap-2">
          {/* Deadline Label */}
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-lg flex items-center gap-1',
              isOverdue && 'bg-semantic-urgent-tint text-semantic-urgent font-semibold',
              isUrgent && 'bg-semantic-urgent-tint/80 text-semantic-urgent font-medium',
              !isOverdue && !isUrgent && 'bg-page-background text-text-secondary'
            )}
          >
            {formatDateTimeIndonesian(task.deadline)}
          </span>

          {/* Status Badge */}
          <StatusBadge status={task.status} />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onCycleStatus(task.id)}
            title="Siklus status berikutnya"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-primary hover:bg-page-background transition-colors"
          >
            <ArrowsClockwise size={15} />
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              title="Hapus tugas"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-semantic-urgent hover:bg-semantic-urgent-tint transition-colors"
            >
              <Trash size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
