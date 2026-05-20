// ============================================================
// Format — Display formatting utilities
// ============================================================

/**
 * Format cents to currency string
 * formatCurrency(4500) → "$45.00"
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Format ISO date to friendly string
 * formatDate("2026-03-29") → "Sat, Mar 29"
 */
export function formatDate(iso: string): string {
  const date = new Date(iso + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time string to 12-hour display
 * formatTime("08:30") → "8:30 AM"
 */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Format E.164 phone to display
 * formatPhone("+18336484653") → "(833) 648-4653"
 */
export function formatPhone(e164: string): string {
  const digits = e164.replace(/\D/g, '');
  const n = digits.length === 11 ? digits.slice(1) : digits;
  if (n.length !== 10) return e164;
  return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
}

/**
 * Format course rating and slope
 * formatCourseRating(143, 74.2) → "Slope 143 / Rating 74.2"
 */
export function formatCourseRating(slope: number, rating: number): string {
  return `Slope ${slope} / Rating ${rating.toFixed(1)}`;
}

/**
 * Pluralize a word
 * pluralize(3, "player") → "3 players"
 * pluralize(1, "course") → "1 course"
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural || singular + 's');
  return `${count} ${word}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + '…';
}

/**
 * Relative time display
 * timeAgo(date) → "2 hours ago"
 */
export function timeAgo(date: Date | string): string {
  const now = Date.now();
  const then = typeof date === 'string' ? new Date(date).getTime() : date.getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;

  return formatDate(typeof date === 'string' ? date : date.toISOString());
}

/**
 * Generate a confirmation code
 * generateConfirmationCode() → "MGT-AB3F7K"
 */
export function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MGT-${code}`;
}

/**
 * Format price range for display
 * formatPriceRange(6500, 9500) → "$65–$95"
 */
export function formatPriceRange(minCents: number, maxCents: number): string {
  const min = Math.floor(minCents / 100);
  const max = Math.floor(maxCents / 100);
  if (min === max) return `$${min}`;
  return `$${min}–$${max}`;
}
