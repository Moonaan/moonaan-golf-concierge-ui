// ============================================================
// Waitlist Types — AI Golf Concierge
// ============================================================

import { UUID, ISODateString, ISODateTimeString, WaitlistStatus, TimeRange } from './common';

export interface WaitlistEntry {
  waitlistId: UUID;
  memberId: UUID;
  memberName: string;
  courseId: string;
  courseName: string;
  date: ISODateString;
  preferredTimeRange: TimeRange;
  partySize: number;
  flexibleDate: boolean;
  flexibleTime: boolean;
  priorityScore: number;
  status: WaitlistStatus;
  notifiedAt?: ISODateTimeString;
  holdExpiresAt?: ISODateTimeString;
  convertedBookingId?: UUID;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface WaitlistPriorityFactors {
  memberTier: number;     // 0-40 points
  bookingHistory: number; // 0-20 points
  waitTime: number;       // 0-20 points
  revenueScore: number;   // 0-10 points
  flexibilityBonus: number; // 0-10 points
}

export interface JoinWaitlistRequest {
  memberId: UUID;
  courseId: string;
  date: ISODateString;
  preferredTimeRange: TimeRange;
  partySize: number;
  flexibleDate?: boolean;
  flexibleTime?: boolean;
}

export interface WaitlistNotification {
  waitlistId: UUID;
  memberId: UUID;
  courseId: string;
  date: ISODateString;
  availableTime: string; // HH:MM
  availableSpots: number;
  holdMinutes: number; // 15 min default
  holdExpiresAt: ISODateTimeString;
}

// DynamoDB item shapes
export interface WaitlistDynamoItem {
  PK: `WAITLIST#${string}#${string}`; // WAITLIST#courseId#date
  SK: `PRIORITY#${string}#${string}`; // PRIORITY#score#memberId
  GSI1PK: `MEMBER#${string}`;
  GSI1SK: `WAITLIST#${string}`;       // WAITLIST#date
  Type: 'WaitlistEntry';
  data: WaitlistEntry;
  TTL: number;
}
