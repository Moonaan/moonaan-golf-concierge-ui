// ============================================================
// Common Types — AI Golf Concierge
// ============================================================

export type UUID = string;
export type ISODateString = string; // YYYY-MM-DD
export type ISODateTimeString = string; // ISO 8601
export type PhoneNumber = string; // E.164

export enum Environment {
  DEV = 'dev',
  STAGING = 'staging',
  PROD = 'prod',
}

export enum MemberTier {
  FREE = 'FREE',
  TRAIL_MEMBER = 'TRAIL_MEMBER',
  TRAIL_PRO = 'TRAIL_PRO',
  TRAIL_PASS = 'TRAIL_PASS',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum PaymentStatus {
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  REFUNDED = 'REFUNDED',
  CREDIT_ISSUED = 'CREDIT_ISSUED',
}

export enum WaitlistStatus {
  ACTIVE = 'ACTIVE',
  NOTIFIED = 'NOTIFIED',
  EXPIRED = 'EXPIRED',
  CONVERTED = 'CONVERTED',
  CANCELLED = 'CANCELLED',
}

export enum PaceOfPlay {
  FAST = 'FAST',
  NORMAL = 'NORMAL',
  RELAXED = 'RELAXED',
}

export enum CartOption {
  WALKING = 'WALKING',
  CART = 'CART',
  PUSH_CART = 'PUSH_CART',
}

export enum HoleCount {
  NINE = 9,
  EIGHTEEN = 18,
}

export enum NotificationType {
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  BOOKING_MODIFICATION = 'BOOKING_MODIFICATION',
  BOOKING_CANCELLATION = 'BOOKING_CANCELLATION',
  WAITLIST_NOTIFICATION = 'WAITLIST_NOTIFICATION',
  WAITLIST_EXPIRY = 'WAITLIST_EXPIRY',
  WEATHER_ALERT = 'WEATHER_ALERT',
  DEPARTURE_REMINDER = 'DEPARTURE_REMINDER',
  CHECKIN_CONFIRMATION = 'CHECKIN_CONFIRMATION',
}

export interface PaginatedResponse<T> {
  items: T[];
  nextToken?: string;
  count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  requestId: string;
  timestamp: ISODateTimeString;
}

export interface TimeRange {
  start: string; // HH:MM
  end: string;   // HH:MM
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}
