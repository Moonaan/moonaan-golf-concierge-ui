// ============================================================
// Input Validation Schemas — AI Golf Concierge
// Comprehensive validation with clear error messages and
// type inference. Zero external dependencies (no zod needed).
// ============================================================

import { isValidEmail, isValidPhone, isValidDate, isValidTime, isValidUUID } from '../utils/validation';
import { CartOption, HoleCount, PaceOfPlay, MemberTier } from '../types/common';
import { MissouriRegion } from '../types/course';

// ── Core Validation Engine ─────────────────────────────────

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
  value?: unknown;
}

class Validator<T extends object> {
  private errors: FieldError[] = [];
  private data: Record<string, unknown> = {};

  constructor(private input: unknown) {}

  private get obj(): Record<string, unknown> {
    if (typeof this.input !== 'object' || this.input === null) {
      this.errors.push({ field: '_root', message: 'Request body must be a JSON object' });
      return {};
    }
    return this.input as Record<string, unknown>;
  }

  required(field: string, validate: (value: unknown) => string | null): this {
    const value = this.obj[field];
    if (value === undefined || value === null || value === '') {
      this.errors.push({ field, message: `${field} is required` });
    } else {
      const error = validate(value);
      if (error) {
        this.errors.push({ field, message: error, value });
      } else {
        this.data[field] = value;
      }
    }
    return this;
  }

  optional(field: string, validate: (value: unknown) => string | null): this {
    const value = this.obj[field];
    if (value !== undefined && value !== null && value !== '') {
      const error = validate(value);
      if (error) {
        this.errors.push({ field, message: error, value });
      } else {
        this.data[field] = value;
      }
    }
    return this;
  }

  build(): ValidationResult<T> {
    if (this.errors.length > 0) {
      return { success: false, errors: this.errors };
    }
    return { success: true, data: this.data as T };
  }
}

// ── Field Validators ───────────────────────────────────────

const isString = (min?: number, max?: number) => (v: unknown): string | null => {
  if (typeof v !== 'string') return 'must be a string';
  if (min !== undefined && v.length < min) return `must be at least ${min} characters`;
  if (max !== undefined && v.length > max) return `must be at most ${max} characters`;
  return null;
};

const isNumber = (min?: number, max?: number) => (v: unknown): string | null => {
  if (typeof v !== 'number' || isNaN(v)) return 'must be a number';
  if (min !== undefined && v < min) return `must be at least ${min}`;
  if (max !== undefined && v > max) return `must be at most ${max}`;
  return null;
};

const isInteger = (min?: number, max?: number) => (v: unknown): string | null => {
  const numErr = isNumber(min, max)(v);
  if (numErr) return numErr;
  if (!Number.isInteger(v)) return 'must be an integer';
  return null;
};

const isBoolean = (v: unknown): string | null => {
  if (typeof v !== 'boolean') return 'must be a boolean';
  return null;
};

const isEnum = <T extends string>(name: string, values: readonly T[] | T[]) => (v: unknown): string | null => {
  if (typeof v !== 'string' || !(values as string[]).includes(v)) {
    return `must be one of: ${values.join(', ')}`;
  }
  return null;
};

const isEnumValue = <T>(name: string, enumObj: Record<string, T>) => (v: unknown): string | null => {
  const values = Object.values(enumObj);
  if (!values.includes(v as T)) {
    return `must be one of: ${values.join(', ')}`;
  }
  return null;
};

const isUUID = (v: unknown): string | null => {
  if (typeof v !== 'string' || !isValidUUID(v)) return 'must be a valid UUID';
  return null;
};

const isEmailAddr = (v: unknown): string | null => {
  if (typeof v !== 'string' || !isValidEmail(v)) return 'must be a valid email address';
  return null;
};

const isPhoneE164 = (v: unknown): string | null => {
  if (typeof v !== 'string' || !isValidPhone(v)) return 'must be a valid phone number in E.164 format (e.g. +12125551234)';
  return null;
};

const isISODate = (v: unknown): string | null => {
  if (typeof v !== 'string' || !isValidDate(v)) return 'must be a valid date in YYYY-MM-DD format';
  return null;
};

const isFutureDate = (maxDaysOut?: number) => (v: unknown): string | null => {
  const dateErr = isISODate(v);
  if (dateErr) return dateErr;
  const date = new Date(v as string);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return 'must be a future date';
  if (maxDaysOut) {
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + maxDaysOut);
    if (date > maxDate) return `must be within the next ${maxDaysOut} days`;
  }
  return null;
};

const isTeeTime = (v: unknown): string | null => {
  if (typeof v !== 'string' || !isValidTime(v)) return 'must be a valid time in HH:MM format';
  const [hours] = (v as string).split(':').map(Number);
  if (hours < 6 || hours > 18) return 'tee time must be between 06:00 and 18:00';
  return null;
};

const isTimeHHMM = (v: unknown): string | null => {
  if (typeof v !== 'string' || !isValidTime(v)) return 'must be a valid time in HH:MM format';
  return null;
};

const isGhinNumber = (v: unknown): string | null => {
  if (typeof v !== 'string') return 'must be a string';
  if (!/^\d{7}$/.test(v)) return 'must be a 7-digit GHIN number';
  return null;
};

const isTimeRange = (v: unknown): string | null => {
  if (typeof v !== 'object' || v === null) return 'must be an object with start and end times';
  const obj = v as Record<string, unknown>;
  const startErr = isTimeHHMM(obj.start);
  if (startErr) return `start ${startErr}`;
  const endErr = isTimeHHMM(obj.end);
  if (endErr) return `end ${endErr}`;
  if ((obj.start as string) >= (obj.end as string)) return 'start must be before end';
  return null;
};

const isArray = (itemValidator?: (v: unknown) => string | null) => (v: unknown): string | null => {
  if (!Array.isArray(v)) return 'must be an array';
  if (itemValidator) {
    for (let i = 0; i < v.length; i++) {
      const err = itemValidator(v[i]);
      if (err) return `item [${i}] ${err}`;
    }
  }
  return null;
};

// ── Schemas ────────────────────────────────────────────────

/**
 * Booking Request — POST /bookings
 */
export interface BookingRequestInput {
  courseId: string;
  date: string;
  teeTime: string;
  partySize: number;
  holes?: number;
  cartOption?: string;
  specialRequests?: string;
  players?: Array<{
    name: string;
    email?: string;
    phone?: string;
    isGuest?: boolean;
  }>;
}

export function validateBookingRequest(input: unknown): ValidationResult<BookingRequestInput> {
  return new Validator<BookingRequestInput>(input)
    .required('courseId', isString(1, 100))
    .required('date', isFutureDate(30))
    .required('teeTime', isTeeTime)
    .required('partySize', isInteger(1, 4))
    .optional('holes', isEnumValue('holes', HoleCount))
    .optional('cartOption', isEnumValue('cartOption', CartOption))
    .optional('specialRequests', isString(0, 500))
    .optional('players', isArray())
    .build();
}

/**
 * Search Availability — GET /availability
 */
export interface SearchRequestInput {
  date: string;
  region?: string;
  courseId?: string;
  timeRange?: { start: string; end: string };
  partySize?: number;
  maxPrice?: number;
  pace?: string;
  holes?: number;
  cartOption?: string;
}

export function validateSearchRequest(input: unknown): ValidationResult<SearchRequestInput> {
  return new Validator<SearchRequestInput>(input)
    .required('date', isFutureDate(30))
    .optional('region', isEnumValue('region', MissouriRegion))
    .optional('courseId', isString(1, 100))
    .optional('timeRange', isTimeRange)
    .optional('partySize', isInteger(1, 8))
    .optional('maxPrice', isNumber(0, 10000))
    .optional('pace', isEnumValue('pace', PaceOfPlay))
    .optional('holes', isEnumValue('holes', HoleCount))
    .optional('cartOption', isEnumValue('cartOption', CartOption))
    .build();
}

/**
 * Member Profile — POST /members, PUT /members/:id
 */
export interface MemberProfileInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ghinNumber?: string;
  tier?: string;
  handicapIndex?: number;
}

export function validateMemberProfile(input: unknown): ValidationResult<MemberProfileInput> {
  return new Validator<MemberProfileInput>(input)
    .required('firstName', isString(2, 100))
    .required('lastName', isString(2, 100))
    .required('email', isEmailAddr)
    .required('phone', isPhoneE164)
    .optional('ghinNumber', isGhinNumber)
    .optional('tier', isEnumValue('tier', MemberTier))
    .optional('handicapIndex', isNumber(-10, 54))
    .build();
}

/**
 * Waitlist Request — POST /waitlist
 */
export interface WaitlistRequestInput {
  courseId: string;
  date: string;
  timeBand: string;
  partySize: number;
  flexibleDate?: boolean;
  flexibleTime?: boolean;
}

const TIME_BANDS = ['morning', 'midday', 'afternoon', 'twilight'] as const;

export function validateWaitlistRequest(input: unknown): ValidationResult<WaitlistRequestInput> {
  return new Validator<WaitlistRequestInput>(input)
    .required('courseId', isString(1, 100))
    .required('date', isFutureDate(30))
    .required('timeBand', isEnum('timeBand', TIME_BANDS))
    .required('partySize', isInteger(1, 4))
    .optional('flexibleDate', isBoolean)
    .optional('flexibleTime', isBoolean)
    .build();
}

/**
 * Cancel Booking — DELETE /bookings/:id
 */
export interface CancelRequestInput {
  bookingId: string;
  reason?: string;
}

export function validateCancelRequest(input: unknown): ValidationResult<CancelRequestInput> {
  return new Validator<CancelRequestInput>(input)
    .required('bookingId', isUUID)
    .optional('reason', isString(0, 500))
    .build();
}

/**
 * Trip Plan — POST /trips
 */
export interface TripPlanInput {
  courseId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  flightNumber?: string;
  hotelPreferences?: {
    maxPrice?: number;
    starRating?: number;
    distanceMiles?: number;
  };
}

export function validateTripPlan(input: unknown): ValidationResult<TripPlanInput> {
  return new Validator<TripPlanInput>(input)
    .required('courseId', isString(1, 100))
    .required('checkIn', isFutureDate(365))
    .required('checkOut', isFutureDate(365))
    .required('guests', isInteger(1, 8))
    .optional('flightNumber', isString(2, 20))
    .build();
}

// ── Re-export for convenience ──────────────────────────────

export { FieldError as ValidationFieldError };

/**
 * Format validation errors into a human-readable string.
 */
export function formatValidationErrors(errors: FieldError[]): string {
  return errors.map((e) => `${e.field}: ${e.message}`).join('; ');
}
