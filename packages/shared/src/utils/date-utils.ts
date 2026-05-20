// ============================================================
// Date Utilities — AI Golf Concierge
// Central timezone operations for Missouri
// ============================================================

const MISSOURI_TZ = 'America/Chicago';

export function nowCentral(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: MISSOURI_TZ }));
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3600000);
}

export function isWithinHours(date: Date, hours: number): boolean {
  const diff = date.getTime() - Date.now();
  return diff > 0 && diff <= hours * 3600000;
}

export function hoursUntil(date: Date): number {
  return (date.getTime() - Date.now()) / 3600000;
}

export function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

/** Format for voice readback: "Saturday, March twenty-eighth at ten thirty AM" */
export function formatForVoice(date: string, time: string): string {
  const d = parseDate(date);
  const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long', timeZone: MISSOURI_TZ });
  const month = d.toLocaleDateString('en-US', { month: 'long', timeZone: MISSOURI_TZ });
  const day = d.getDate();
  
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes === 0 ? '' : ` ${minutes.toString().padStart(2, '0')}`;

  return `${dayOfWeek}, ${month} ${day} at ${displayHours}${displayMinutes} ${ampm}`;
}

export function getDepartureTime(teeTime: string, driveMinutes: number, prepMinutes: number = 30): string {
  const [hours, minutes] = teeTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes - driveMinutes - prepMinutes;
  const depHours = Math.floor(totalMinutes / 60);
  const depMinutes = totalMinutes % 60;
  return `${String(depHours).padStart(2, '0')}:${String(depMinutes).padStart(2, '0')}`;
}
