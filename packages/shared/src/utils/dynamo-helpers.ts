// ============================================================
// DynamoDB Helpers — AI Golf Concierge
// ============================================================

export const TableNames = {
  MEMBERS: process.env.MEMBERS_TABLE || 'GolfConcierge-Members',
  BOOKINGS: process.env.BOOKINGS_TABLE || 'GolfConcierge-Bookings',
  COURSES: process.env.COURSES_TABLE || 'GolfConcierge-Courses',
  WAITLIST: process.env.WAITLIST_TABLE || 'GolfConcierge-Waitlist',
  SESSIONS: process.env.SESSIONS_TABLE || 'GolfConcierge-Sessions',
} as const;

export function memberPK(memberId: string): string {
  return `MEMBER#${memberId}`;
}

export function bookingPK(bookingId: string): string {
  return `BOOKING#${bookingId}`;
}

export function coursePK(courseId: string): string {
  return `COURSE#${courseId}`;
}

export function waitlistPK(courseId: string, date: string): string {
  return `WAITLIST#${courseId}#${date}`;
}

export function sessionPK(sessionId: string): string {
  return `SESSION#${sessionId}`;
}

export function inventorySK(date: string, time: string): string {
  return `INVENTORY#${date}#${time}`;
}

export function prioritySK(score: number, memberId: string): string {
  return `PRIORITY#${String(score).padStart(5, '0')}#${memberId}`;
}

export function courseDateGSI(courseId: string, date: string): string {
  return `COURSE#${courseId}#${date}`;
}

export function memberBookingGSI(memberId: string): string {
  return `MEMBER#${memberId}`;
}

/** Calculate TTL epoch for DynamoDB */
export function ttlEpoch(hoursFromNow: number): number {
  return Math.floor(Date.now() / 1000) + (hoursFromNow * 3600);
}

/** Calculate TTL epoch from a specific date */
export function ttlFromDate(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}
