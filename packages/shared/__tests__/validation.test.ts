// ============================================================
// Validation Tests — AI Golf Concierge
// All validators: email, phone, date, time, party, UUID, etc.
// ============================================================

import {
  isValidEmail,
  isValidPhone,
  isValidDate,
  isValidTime,
  isValidPartySize,
  isValidUUID,
  sanitizeInput,
  generateConfirmationCode,
} from '../src/utils/validation';

// ============================================================
// Email Validation
// ============================================================
describe('isValidEmail', () => {
  it('should accept valid emails', () => {
    expect(isValidEmail('john@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co')).toBe(true);
    expect(isValidEmail('test+tag@gmail.com')).toBe(true);
    expect(isValidEmail('a@b.c')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user @domain.com')).toBe(false);
    expect(isValidEmail('user@@domain.com')).toBe(false);
  });
});

// ============================================================
// Phone Validation (E.164)
// ============================================================
describe('isValidPhone', () => {
  it('should accept valid E.164 US numbers', () => {
    expect(isValidPhone('+15551234567')).toBe(true);
    expect(isValidPhone('+19198165275')).toBe(true);
    expect(isValidPhone('+12125551234')).toBe(true);
  });

  it('should reject invalid phone formats', () => {
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('5551234567')).toBe(false);
    expect(isValidPhone('+1555123456')).toBe(false); // Too short
    expect(isValidPhone('+155512345678')).toBe(false); // Too long
    expect(isValidPhone('+44123456789')).toBe(false); // Not US
    expect(isValidPhone('555-123-4567')).toBe(false);
    expect(isValidPhone('+1abcdefghij')).toBe(false);
  });
});

// ============================================================
// Date Validation (YYYY-MM-DD)
// ============================================================
describe('isValidDate', () => {
  it('should accept valid dates', () => {
    expect(isValidDate('2026-04-15')).toBe(true);
    expect(isValidDate('2026-01-01')).toBe(true);
    expect(isValidDate('2026-12-31')).toBe(true);
    expect(isValidDate('2025-02-28')).toBe(true);
  });

  it('should reject invalid date formats', () => {
    expect(isValidDate('')).toBe(false);
    expect(isValidDate('04-15-2026')).toBe(false);
    expect(isValidDate('2026/04/15')).toBe(false);
    expect(isValidDate('April 15, 2026')).toBe(false);
    expect(isValidDate('2026-4-15')).toBe(false);
    expect(isValidDate('20260415')).toBe(false);
  });

  it('should reject invalid dates that match format', () => {
    expect(isValidDate('2026-13-01')).toBe(false); // Month 13
    expect(isValidDate('2026-00-15')).toBe(false); // Month 0
    expect(isValidDate('abcd-ef-gh')).toBe(false);
  });
});

// ============================================================
// Time Validation (HH:MM)
// ============================================================
describe('isValidTime', () => {
  it('should accept valid times', () => {
    expect(isValidTime('00:00')).toBe(true);
    expect(isValidTime('06:30')).toBe(true);
    expect(isValidTime('12:00')).toBe(true);
    expect(isValidTime('14:45')).toBe(true);
    expect(isValidTime('23:59')).toBe(true);
  });

  it('should reject invalid times', () => {
    expect(isValidTime('')).toBe(false);
    expect(isValidTime('24:00')).toBe(false);
    expect(isValidTime('12:60')).toBe(false);
    expect(isValidTime('6:30')).toBe(false); // No padding
    expect(isValidTime('12:5')).toBe(false);
    expect(isValidTime('12:00:00')).toBe(false);
    expect(isValidTime('noon')).toBe(false);
    expect(isValidTime('12:00 PM')).toBe(false);
  });
});

// ============================================================
// Party Size Validation
// ============================================================
describe('isValidPartySize', () => {
  it('should accept valid party sizes 1-8', () => {
    for (let i = 1; i <= 8; i++) {
      expect(isValidPartySize(i)).toBe(true);
    }
  });

  it('should reject invalid party sizes', () => {
    expect(isValidPartySize(0)).toBe(false);
    expect(isValidPartySize(-1)).toBe(false);
    expect(isValidPartySize(9)).toBe(false);
    expect(isValidPartySize(100)).toBe(false);
    expect(isValidPartySize(1.5)).toBe(false);
    expect(isValidPartySize(NaN)).toBe(false);
  });
});

// ============================================================
// UUID Validation
// ============================================================
describe('isValidUUID', () => {
  it('should accept valid UUIDs', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    expect(isValidUUID('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
  });

  it('should accept case-insensitive UUIDs', () => {
    expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
    expect(isValidUUID('550e8400-E29B-41d4-a716-446655440000')).toBe(true);
  });

  it('should reject invalid UUIDs', () => {
    expect(isValidUUID('')).toBe(false);
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false); // No dashes
    expect(isValidUUID('550e8400-e29b-41d4-a716-44665544000')).toBe(false); // Too short
    expect(isValidUUID('550e8400-e29b-41d4-a716-4466554400001')).toBe(false); // Too long
    expect(isValidUUID('zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz')).toBe(false);
  });
});

// ============================================================
// Input Sanitization
// ============================================================
describe('sanitizeInput', () => {
  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
    expect(sanitizeInput('\thello\n')).toBe('hello');
  });

  it('should remove HTML angle brackets', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    expect(sanitizeInput('Hello <b>World</b>')).toBe('Hello bWorld/b');
  });

  it('should handle clean input', () => {
    expect(sanitizeInput('John Doe')).toBe('John Doe');
    expect(sanitizeInput("O'Brien")).toBe("O'Brien");
  });
});

// ============================================================
// Confirmation Code Generation
// ============================================================
describe('generateConfirmationCode', () => {
  it('should generate MGT- prefixed code', () => {
    const code = generateConfirmationCode();
    expect(code).toMatch(/^MGT-[A-Z0-9]{6}$/);
  });

  it('should not contain ambiguous characters (0, O, I, 1, L)', () => {
    // Run multiple times to increase confidence
    for (let i = 0; i < 50; i++) {
      const code = generateConfirmationCode();
      const suffix = code.slice(4);
      expect(suffix).not.toMatch(/[01OIL]/);
    }
  });

  it('should generate unique codes', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateConfirmationCode());
    }
    // With 31^6 possible combinations (~887M), 100 codes should be unique
    expect(codes.size).toBe(100);
  });
});
