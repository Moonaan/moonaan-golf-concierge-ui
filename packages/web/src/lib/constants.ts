// ============================================================
// Constants — App-wide configuration and reference data
// ============================================================

export const PHONE_NUMBER = '+18336484653'; // (833) MGT-GOLF
export const PHONE_DISPLAY = '(833) MGT-GOLF';
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const DEFAULT_SEARCH_RADIUS_MILES = 50;

export const REGIONS = {
  BRANSON: { label: 'Branson', slug: 'branson', lat: 36.6437, lng: -93.2185 },
  LAKE_OZARKS: { label: 'Lake of the Ozarks', slug: 'lake-ozarks', lat: 38.1156, lng: -92.6826 },
  KC: { label: 'Kansas City', slug: 'kansas-city', lat: 39.0997, lng: -94.5786 },
  STL: { label: 'St. Louis', slug: 'st-louis', lat: 38.627, lng: -90.1994 },
  OZARKS: { label: 'Ozarks', slug: 'ozarks', lat: 37.2153, lng: -93.2982 },
  OTHER: { label: 'Other', slug: 'other', lat: 38.5767, lng: -92.1735 },
} as const;

export type RegionKey = keyof typeof REGIONS;

export const MEMBERSHIP_TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: '',
    color: 'gray',
    features: [
      'Browse all courses',
      'Basic search & filters',
      'View tee time availability',
      'Phone booking via AI',
    ],
    excluded: [
      'Online booking',
      'Member pricing',
      'Trip planning tools',
      'Priority tee times',
    ],
  },
  {
    id: 'trail-member',
    name: 'Trail Member',
    price: 999,
    period: '/mo',
    color: 'green',
    features: [
      'Everything in Free',
      'Online tee time booking',
      '5% off green fees',
      'Booking history & stats',
      'Weather alerts for rounds',
      'Digital trail pass card',
    ],
    excluded: [
      'Priority tee times',
      'Trip planning tools',
      'Concierge support',
    ],
  },
  {
    id: 'trail-pro',
    name: 'Trail Pro',
    price: 2999,
    period: '/mo',
    color: 'gold',
    popular: true,
    features: [
      'Everything in Trail Member',
      '15% off green fees',
      'Priority tee time access',
      'AI trip planning tools',
      'Hotel & travel bundles',
      'Dedicated concierge line',
      'Free cart at select courses',
      'Guest passes (2/month)',
    ],
    excluded: [],
  },
  {
    id: 'trail-pass',
    name: 'Trail Pass',
    price: 29900,
    period: '/yr',
    color: 'platinum',
    features: [
      'Everything in Trail Pro',
      '25% off green fees trail-wide',
      'Unlimited guest passes',
      'VIP lounge access',
      'Annual member tournament entry',
      'Exclusive course previews',
      'Personal concierge',
      'Free cart everywhere',
    ],
    excluded: [],
  },
] as const;

export const PACE_OPTIONS = [
  { value: 'REGULAR', label: 'Regular', minutes: 270 },
  { value: 'FAST', label: 'Fast Play', minutes: 210 },
  { value: 'TWILIGHT', label: 'Twilight', minutes: 180 },
] as const;

export const CART_OPTIONS = [
  { value: 'CART', label: 'Riding Cart' },
  { value: 'WALK', label: 'Walking' },
  { value: 'PUSH', label: 'Push Cart' },
] as const;

export const TRIP_PACKAGES = [
  {
    id: 'business',
    name: 'Business Golf',
    icon: '💼',
    description: 'Impress clients on Missouri\'s finest courses',
    defaultPlayers: 4,
    defaultNights: 1,
    suggestedRegions: ['KC', 'STL'] as RegionKey[],
  },
  {
    id: 'buddy',
    name: 'Buddy Trip',
    icon: '🍻',
    description: 'Boys\' weekend with 36+ holes of golf',
    defaultPlayers: 4,
    defaultNights: 2,
    suggestedRegions: ['BRANSON', 'LAKE_OZARKS'] as RegionKey[],
  },
  {
    id: 'family',
    name: 'Family Getaway',
    icon: '👨‍👩‍👧‍👦',
    description: 'Fun for all ages with resort amenities',
    defaultPlayers: 4,
    defaultNights: 3,
    suggestedRegions: ['BRANSON', 'LAKE_OZARKS'] as RegionKey[],
  },
  {
    id: 'vip',
    name: 'VIP Experience',
    icon: '🏆',
    description: 'Premium courses, luxury stays, white-glove service',
    defaultPlayers: 2,
    defaultNights: 2,
    suggestedRegions: ['BRANSON'] as RegionKey[],
  },
] as const;
