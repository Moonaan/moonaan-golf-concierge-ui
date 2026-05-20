// ============================================================
// Pricing Tests — AI Golf Concierge
// Dynamic pricing, rate fences, member protection
// ============================================================

import { calculatePrice, formatPrice, PriceCalculation } from '../src/utils/pricing';
import { MemberTier } from '../src/types/common';
import { CoursePricing } from '../src/types/course';

const standardPricing: CoursePricing = {
  weekday18: { min: 65, max: 85, currency: 'USD' },
  weekday9: { min: 35, max: 45, currency: 'USD' },
  weekend18: { min: 85, max: 110, currency: 'USD' },
  weekend9: { min: 45, max: 60, currency: 'USD' },
  twilight: { min: 40, max: 55, currency: 'USD' },
  cartFee18: 20,
  cartFee9: 12,
  memberDiscount: 15, // 15%
  trailPassDiscount: 25, // 25%
};

// ============================================================
// Prime vs Soft Pricing
// ============================================================
describe('Prime vs Soft Pricing', () => {
  it('should charge weekend rate for weekend 18 holes', () => {
    const result = calculatePrice(standardPricing, {
      holes: 18,
      isWeekend: true,
      isTwilight: false,
      includeCart: false,
      memberTier: MemberTier.FREE,
      partySize: 1,
    });

    // Weekend 18 midpoint: (85 + 110) / 2 = 97.5
    expect(result.basePrice).toBe(97.5);
    expect(result.cartFee).toBe(0);
    expect(result.discount).toBe(0);
    expect(result.totalPrice).toBe(97.5);
  });

  it('should charge weekday rate for weekday 18 holes', () => {
    const result = calculatePrice(standardPricing, {
      holes: 18,
      isWeekend: false,
      isTwilight: false,
      includeCart: false,
      memberTier: MemberTier.FREE,
      partySize: 1,
    });

    // Weekday 18 midpoint: (65 + 85) / 2 = 75
    expect(result.basePrice).toBe(75);
    expect(result.totalPrice).toBe(75);
  });

  it('should charge 9-hole rate', () => {
    const result = calculatePrice(standardPricing, {
      holes: 9,
      isWeekend: false,
      isTwilight: false,
      includeCart: false,
      memberTier: MemberTier.FREE,
      partySize: 1,
    });

    // Weekday 9 midpoint: (35 + 45) / 2 = 40
    expect(result.basePrice).toBe(40);
  });

  it('should use twilight rate regardless of weekend', () => {
    const result = calculatePrice(standardPricing, {
      holes: 18,
      isWeekend: true,
      isTwilight: true,
      includeCart: false,
      memberTier: MemberTier.FREE,
      partySize: 1,
    });

    // Twilight midpoint: (40 + 55) / 2 = 47.5
    expect(result.basePrice).toBe(47.5);
  });
});

// ============================================================
// Cart Fee Calculations
// ============================================================
describe('Cart Fees', () => {
  it('should add 18-hole cart fee', () => {
    const result = calculatePrice(standardPricing, {
      holes: 18,
      isWeekend: false,
      isTwilight: false,
      includeCart: true,
      memberTier: MemberTier.FREE,
      partySize: 1,
    });

    expect(result.cartFee).toBe(20);
    expect(result.totalPrice).toBe(75 + 20); // base + cart
  });

  it('should add 9-hole cart fee', () => {
    const result = calculatePrice(standardPricing, {
      holes: 9,
      isWeekend: false,
      isTwilight: false,
      includeCart: true,
      memberTier: MemberTier.FREE,
      partySize: 1,
    });

    expect(result.cartFee).toBe(12);
  });

  it('should not add cart fee when not included', () => {
    const result = calculatePrice(standardPricing, {
      holes: 18,
      isWeekend: false,
      isTwilight: false,
      includeCart: false,
      memberTier: MemberTier.FREE,
      partySize: 1,
    });

    expect(result.cartFee).toBe(0);
  });
});

// ============================================================
// Member Protection (Rate Fences)
// ============================================================
describe('Member Discounts & Rate Fences', () => {
  it('should give TRAIL_MEMBER 15% discount', () => {
    const result = calculatePrice(standardPricing, {
      holes: 18,
      isWeekend: false,
      isTwilight: false,
      includeCart: false,
      memberTier: MemberTier.TRAIL_MEMBER,
      partySize: 1,
    });

    const basePrice = 75;
    const expectedDiscount = basePrice * 0.15;
    expect(result.discount).toBe(expectedDiscount);
    expect(result.totalPrice).toBe(basePrice - expectedDiscount);
  });

  it('should give TRAIL_PRO 22.5% discount (1.5x member)', () => {
    const result = calculatePrice(standardPricing, {
      holes: 18,
      isWeekend: false,
      isTwilight: false,
      includeCart: false,
      memberTier: MemberTier.TRAIL_PRO,
      partySize: 1,
    });

    const basePrice = 75;
    const expectedDiscount = basePrice * (15 * 1.5 / 100);
    expect(result.discount).toBe(expectedDiscount);
    expect(result.totalPrice).toBe(basePrice - expectedDiscount);
  });

  it('should give TRAIL_PASS 25% discount', () => {
    const result = calculatePrice(standardPricing, {
      holes: 18,
      isWeekend: false,
      isTwilight: false,
      includeCart: false,
      memberTier: MemberTier.TRAIL_PASS,
      partySize: 1,
    });

    const basePrice = 75;
    const expectedDiscount = basePrice * 0.25;
    expect(result.discount).toBe(expectedDiscount);
    expect(result.totalPrice).toBe(basePrice - expectedDiscount);
  });

  it('should give FREE members no discount', () => {
    const result = calculatePrice(standardPricing, {
      holes: 18,
      isWeekend: false,
      isTwilight: false,
      includeCart: false,
      memberTier: MemberTier.FREE,
      partySize: 1,
    });

    expect(result.discount).toBe(0);
  });
});

// ============================================================
// Party Composition Adjustments
// ============================================================
describe('Party Size Calculations', () => {
  it('should multiply by party size of 4', () => {
    const result = calculatePrice(standardPricing, {
      holes: 18,
      isWeekend: false,
      isTwilight: false,
      includeCart: true,
      memberTier: MemberTier.FREE,
      partySize: 4,
    });

    const perPlayer = 75 + 20; // base + cart
    expect(result.basePrice).toBe(75 * 4);
    expect(result.cartFee).toBe(20 * 4);
    expect(result.totalPrice).toBe(perPlayer * 4);
  });

  it('should apply member discount per player in party', () => {
    const result = calculatePrice(standardPricing, {
      holes: 18,
      isWeekend: false,
      isTwilight: false,
      includeCart: false,
      memberTier: MemberTier.TRAIL_MEMBER,
      partySize: 4,
    });

    const basePerPlayer = 75;
    const discountPerPlayer = basePerPlayer * 0.15;
    expect(result.discount).toBe(discountPerPlayer * 4);
    expect(result.totalPrice).toBe((basePerPlayer - discountPerPlayer) * 4);
  });

  it('should handle single player', () => {
    const result = calculatePrice(standardPricing, {
      holes: 18,
      isWeekend: true,
      isTwilight: false,
      includeCart: true,
      memberTier: MemberTier.FREE,
      partySize: 1,
    });

    expect(result.totalPrice).toBe(97.5 + 20);
  });

  it('should round total to 2 decimal places', () => {
    const trickyPricing: CoursePricing = {
      ...standardPricing,
      weekday18: { min: 33, max: 34, currency: 'USD' },
    };

    const result = calculatePrice(trickyPricing, {
      holes: 18,
      isWeekend: false,
      isTwilight: false,
      includeCart: false,
      memberTier: MemberTier.TRAIL_MEMBER,
      partySize: 3,
    });

    // (33.5 - 33.5*0.15) * 3 = 28.475 * 3 = 85.425
    const cents = result.totalPrice * 100;
    expect(cents).toBe(Math.round(cents));
  });
});

// ============================================================
// formatPrice
// ============================================================
describe('formatPrice', () => {
  it('should format USD correctly', () => {
    expect(formatPrice(79)).toBe('$79.00');
    expect(formatPrice(316.5)).toBe('$316.50');
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('should handle custom currency', () => {
    const result = formatPrice(100, 'EUR');
    expect(result).toContain('100');
  });
});
