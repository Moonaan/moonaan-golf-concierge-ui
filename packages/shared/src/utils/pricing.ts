// ============================================================
// Pricing Utilities — AI Golf Concierge
// ============================================================

import { MemberTier } from '../types/common';
import { CoursePricing } from '../types/course';

export interface PriceCalculation {
  basePrice: number;
  cartFee: number;
  discount: number;
  totalPrice: number;
  currency: string;
}

export function calculatePrice(
  pricing: CoursePricing,
  options: {
    holes: 9 | 18;
    isWeekend: boolean;
    isTwilight: boolean;
    includeCart: boolean;
    memberTier: MemberTier;
    partySize: number;
  }
): PriceCalculation {
  let basePrice: number;

  if (options.isTwilight) {
    basePrice = (pricing.twilight.min + pricing.twilight.max) / 2;
  } else if (options.isWeekend) {
    const range = options.holes === 18 ? pricing.weekend18 : pricing.weekend9;
    basePrice = (range.min + range.max) / 2;
  } else {
    const range = options.holes === 18 ? pricing.weekday18 : pricing.weekday9;
    basePrice = (range.min + range.max) / 2;
  }

  const cartFee = options.includeCart
    ? (options.holes === 18 ? pricing.cartFee18 : pricing.cartFee9)
    : 0;

  let discountPct = 0;
  if (options.memberTier === MemberTier.TRAIL_MEMBER && pricing.memberDiscount) {
    discountPct = pricing.memberDiscount;
  } else if (options.memberTier === MemberTier.TRAIL_PRO && pricing.memberDiscount) {
    discountPct = pricing.memberDiscount * 1.5;
  } else if (options.memberTier === MemberTier.TRAIL_PASS && pricing.trailPassDiscount) {
    discountPct = pricing.trailPassDiscount;
  }

  const discount = basePrice * (discountPct / 100);
  const perPlayerTotal = basePrice - discount + cartFee;
  const totalPrice = perPlayerTotal * options.partySize;

  return {
    basePrice: basePrice * options.partySize,
    cartFee: cartFee * options.partySize,
    discount: discount * options.partySize,
    totalPrice: Math.round(totalPrice * 100) / 100,
    currency: 'USD',
  };
}

export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}
