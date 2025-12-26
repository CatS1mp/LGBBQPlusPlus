import {
  format,
  formatDistance,
  formatRelative,
  isDate,
  parseISO,
} from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

const locales = {
  vi,
  en: enUS,
};

export function formatDate(
  date: string | Date,
  formatStr: string = 'PP',
  locale: 'vi' | 'en' = 'vi'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isDate(dateObj)) return '';

  return format(dateObj, formatStr, { locale: locales[locale] });
}

export function formatDateDistance(
  date: string | Date,
  baseDate: Date = new Date(),
  locale: 'vi' | 'en' = 'vi'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isDate(dateObj)) return '';

  return formatDistance(dateObj, baseDate, {
    addSuffix: true,
    locale: locales[locale],
  });
}

export function formatDateRelative(
  date: string | Date,
  baseDate: Date = new Date(),
  locale: 'vi' | 'en' = 'vi'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isDate(dateObj)) return '';

  return formatRelative(dateObj, baseDate, { locale: locales[locale] });
}

