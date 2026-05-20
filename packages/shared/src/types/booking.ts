// ============================================================
// Booking Types — AI Golf Concierge
// ============================================================

import {
  UUID, ISODateString, ISODateTimeString, BookingStatus,
  PaceOfPlay, CartOption, HoleCount, PhoneNumber,
} from './common';

export interface Booking {
  bookingId: UUID;
  memberId: UUID;
  courseId: string;
  courseName: string;
  date: ISODateString;
  teeTime: string; // HH:MM
  partySize: number;
  holes: HoleCount;
  cartOption: CartOption;
  pacePreference?: PaceOfPlay;
  status: BookingStatus;
  totalPrice: number;
  currency: string;
  foreUpBookingId?: string;
  confirmationCode: string;
  players: BookingPlayer[];
  specialRequests?: string;
  checkedInAt?: ISODateTimeString;
  cartNumber?: string;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
  cancelledAt?: ISODateTimeString;
  cancellationReason?: string;
  source: 'VOICE' | 'WEB' | 'API';
}

export interface BookingPlayer {
  memberId?: UUID;
  name: string;
  email?: string;
  phone?: PhoneNumber;
  handicapIndex?: number;
  isGuest: boolean;
}

export interface SearchAvailabilityRequest {
  courseIds?: string[];
  date: ISODateString;
  dateRange?: {
    start: ISODateString;
    end: ISODateString;
  };
  timeRange?: {
    start: string; // HH:MM
    end: string;
  };
  partySize: number;
  holes?: HoleCount;
  cartOption?: CartOption;
  pacePreference?: PaceOfPlay;
  maxPrice?: number;
  memberId?: UUID;
}

export interface TeeTimeSlot {
  courseId: string;
  courseName: string;
  date: ISODateString;
  time: string; // HH:MM
  availableSpots: number;
  price: number;
  currency: string;
  holes: HoleCount;
  cartIncluded: boolean;
  cartFee?: number;
  foreUpInventoryId?: string;
  restrictions?: string[];
}

export interface CreateBookingRequest {
  memberId: UUID;
  courseId: string;
  date: ISODateString;
  teeTime: string;
  partySize: number;
  holes: HoleCount;
  cartOption: CartOption;
  players?: BookingPlayer[];
  specialRequests?: string;
  source: 'VOICE' | 'WEB' | 'API';
}

export interface ModifyBookingRequest {
  bookingId: UUID;
  memberId: UUID;
  date?: ISODateString;
  teeTime?: string;
  partySize?: number;
  courseId?: string;
  cartOption?: CartOption;
}

export interface CancelBookingRequest {
  bookingId: UUID;
  memberId: UUID;
  reason?: string;
}

export interface BookingConfirmation {
  bookingId: UUID;
  confirmationCode: string;
  courseName: string;
  date: ISODateString;
  teeTime: string;
  partySize: number;
  totalPrice: number;
  cancellationPolicy: string;
  departureReminderSet: boolean;
}

// DynamoDB item shapes
export interface BookingDynamoItem {
  PK: `BOOKING#${string}`;
  SK: 'DETAIL';
  GSI1PK: `COURSE#${string}#${string}`; // COURSE#courseId#date
  GSI1SK: string; // teeTime
  GSI2PK: `MEMBER#${string}`;           // MEMBER#memberId
  GSI2SK: `${string}#${string}`;         // date#teeTime
  Type: 'Booking';
  data: Booking;
  TTL?: number;
}

export interface BookingByPhoneDynamoItem {
  PK: `PHONE#${string}`;
  SK: `BOOKING#${string}`;
  GSI1PK: `EMAIL#${string}`;
  GSI1SK: `BOOKING#${string}`;
  Type: 'BookingByPhone';
  data: Booking;
}
