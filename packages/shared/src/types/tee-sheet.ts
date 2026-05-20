// ============================================================
// Tee Sheet Provider Types — AI Golf Concierge
// Adapter pattern for foreUP and future providers
// ============================================================

import { ISODateString } from './common';

/** Generic tee sheet provider interface — all providers implement this */
export interface TeeSheetProvider {
  readonly providerName: string;

  /** Authenticate with the provider */
  authenticate(): Promise<AuthResult>;

  /** Search available tee times */
  searchAvailability(params: TeeSheetSearchParams): Promise<TeeSheetSlot[]>;

  /** Create a booking */
  createBooking(params: TeeSheetBookingParams): Promise<TeeSheetBookingResult>;

  /** Cancel a booking */
  cancelBooking(bookingId: string, facilityId: string): Promise<TeeSheetCancelResult>;

  /** Modify a booking */
  modifyBooking(bookingId: string, params: Partial<TeeSheetBookingParams>): Promise<TeeSheetBookingResult>;

  /** Get booking details */
  getBooking(bookingId: string, facilityId: string): Promise<TeeSheetBookingResult>;

  /** Get real-time inventory for a specific date */
  getInventory(facilityId: string, date: ISODateString): Promise<TeeSheetSlot[]>;

  /** Health check */
  healthCheck(): Promise<boolean>;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  expiresAt?: string;
  error?: string;
}

export interface TeeSheetSearchParams {
  facilityId: string;
  date: ISODateString;
  startTime?: string; // HH:MM
  endTime?: string;
  partySize?: number;
  holes?: 9 | 18;
  includeCartFee?: boolean;
}

export interface TeeSheetSlot {
  slotId: string;
  facilityId: string;
  date: ISODateString;
  time: string; // HH:MM
  holes: number;
  availableSpots: number;
  maxSpots: number;
  price: number;
  currency: string;
  cartIncluded: boolean;
  cartFee?: number;
  isBlocked: boolean;
  rateType?: string;
  metadata?: Record<string, unknown>;
}

export interface TeeSheetBookingParams {
  facilityId: string;
  slotId: string;
  date: ISODateString;
  time: string;
  partySize: number;
  holes: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    ghinNumber?: string;
  };
  players?: Array<{
    firstName: string;
    lastName: string;
    email?: string;
  }>;
  notes?: string;
}

export interface TeeSheetBookingResult {
  success: boolean;
  bookingId?: string;
  confirmationCode?: string;
  status?: string;
  totalPrice?: number;
  error?: string;
  rawResponse?: unknown;
}

export interface TeeSheetCancelResult {
  success: boolean;
  refundAmount?: number;
  error?: string;
}

/** Rate limiter config per provider */
export interface RateLimitConfig {
  maxRequestsPerSecond: number;
  maxRequestsPerMinute: number;
  burstSize: number;
  retryAttempts: number;
  retryBackoffMs: number;
}

/** Cache config */
export interface CacheConfig {
  enabled: boolean;
  ttlSeconds: number;
  keyPrefix: string;
}
