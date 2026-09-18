const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export function formatDateDisplay(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  } catch {
    return isoString;
  }
}

export function formatFullDate(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return isoString;
  }
}

export function formatCountdown(
  deadlineIso: string,
  prefix = 'Submit'
): { text: string; isUrgent: boolean; isOverdue: boolean; daysRemaining: number } {
  if (!deadlineIso) {
    return { text: '-', isUrgent: false, isOverdue: false, daysRemaining: 0 };
  }

  try {
    const targetDate = new Date(deadlineIso);
    if (isNaN(targetDate.getTime())) {
      return { text: deadlineIso, isUrgent: false, isOverdue: false, daysRemaining: 0 };
    }

    const now = new Date();
    // Normalize to midnight for fair day count or compare directly
    const diffMs = targetDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return {
        text: 'Lewat tenggat',
        isUrgent: true,
        isOverdue: true,
        daysRemaining,
      };
    }

    if (daysRemaining === 0) {
      return {
        text: `${prefix} hari ini!`,
        isUrgent: true,
        isOverdue: false,
        daysRemaining: 0,
      };
    }

    if (daysRemaining === 1) {
      return {
        text: `${prefix} besok!`,
        isUrgent: true,
        isOverdue: false,
        daysRemaining: 1,
      };
    }

    return {
      text: `${prefix} ${daysRemaining} hari lagi`,
      isUrgent: daysRemaining <= 3,
      isOverdue: false,
      daysRemaining,
    };
  } catch {
    return { text: deadlineIso, isUrgent: false, isOverdue: false, daysRemaining: 0 };
  }
}

export function calculatePeriodProgress(
  startDateIso: string,
  endDateIso: string
): {
  progressPct: number;
  remainingDays: number;
  isEnded: boolean;
  remainingText: string;
} {
  if (!startDateIso || !endDateIso) {
    return { progressPct: 0, remainingDays: 0, isEnded: false, remainingText: '-' };
  }

  try {
    const start = new Date(startDateIso).getTime();
    const end = new Date(endDateIso).getTime();
    const now = Date.now();

    if (isNaN(start) || isNaN(end) || end <= start) {
      return { progressPct: 0, remainingDays: 0, isEnded: false, remainingText: '-' };
    }

    const totalDuration = end - start;
    const elapsed = Math.max(0, now - start);
    const progressPct = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

    const remainingMs = end - now;
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

    if (remainingDays <= 0) {
      return {
        progressPct: 100,
        remainingDays: 0,
        isEnded: true,
        remainingText: 'Periode kepengurusan selesai',
      };
    }

    return {
      progressPct,
      remainingDays,
      isEnded: false,
      remainingText: `${remainingDays} hari tersisa`,
    };
  } catch {
    return { progressPct: 0, remainingDays: 0, isEnded: false, remainingText: '-' };
  }
}
