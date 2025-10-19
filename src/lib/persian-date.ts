// Persian Date and Time utilities for Tehran timezone
export const getPersianDateTime = (): string => {
  const now = new Date();
  const persianDate = new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now);
  
  return persianDate;
};

export const getPersianDate = (): string => {
  const now = new Date();
  return new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
};

export const getPersianTime = (): string => {
  const now = new Date();
  return new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now);
};

export const formatPersianDateTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};