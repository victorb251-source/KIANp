/**
 * Checks if a given date is today.
 * @param someDate The date to check.
 * @returns True if the date is today, false otherwise.
 */
export const isToday = (someDate: Date): boolean => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
};

/**
 * Checks if a given date was yesterday.
 * @param someDate The date to check.
 * @returns True if the date was yesterday, false otherwise.
 */
export const isYesterday = (someDate: Date): boolean => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return someDate.getDate() === yesterday.getDate() &&
        someDate.getMonth() === yesterday.getMonth() &&
        someDate.getFullYear() === yesterday.getFullYear();
};

/**
 * Checks if two dates are on the same day, ignoring time.
 * @param d1 First date.
 * @param d2 Second date.
 * @returns True if they are the same day.
 */
export const isSameDay = (d1: Date, d2: Date): boolean => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

/**
 * Formats a date into a relative time string (e.g., "hoje", "ontem", "há 3 dias").
 * @param date The date to format.
 * @returns A human-readable relative time string.
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (isToday(date)) {
    return 'hoje';
  }
  if (isYesterday(date)) {
    return 'ontem';
  }
  if (diffInDays < 7) {
    return `há ${diffInDays} dias`;
  }
  
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};