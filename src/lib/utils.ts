import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, subDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d, yyyy h:mm a');
}

export function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = subDays(end, days);
  return { start, end };
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function getSentimentColor(
  sentiment: 'positive' | 'negative' | 'neutral'
): string {
  switch (sentiment) {
    case 'positive':
      return 'text-success-700 bg-success-50';
    case 'negative':
      return 'text-danger-700 bg-danger-50';
    case 'neutral':
      return 'text-gray-700 bg-gray-50';
  }
}

export function getSentimentBadgeColor(
  sentiment: 'positive' | 'negative' | 'neutral'
): string {
  switch (sentiment) {
    case 'positive':
      return 'bg-success-100 text-success-800 border-success-200';
    case 'negative':
      return 'bg-danger-100 text-danger-800 border-danger-200';
    case 'neutral':
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

