import { digitsEnToFa, digitsFaToEn } from '@persian-tools/persian-tools';

export const toPersianNumber = (num: number | string): string => {
  return digitsEnToFa(num.toString());
};

export const toEnglishNumber = (num: string): string => {
  return digitsFaToEn(num);
};

export const formatPersianDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fa-IR').format(d);
};

export const getCurrentPersianDate = (): string => {
  return new Intl.DateTimeFormat('fa-IR').format(new Date());
};