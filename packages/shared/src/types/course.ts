// ============================================================
// Course Types — AI Golf Concierge
// ============================================================

import { UUID, ISODateString, GeoLocation, PriceRange, TimeRange } from './common';

export interface Course {
  courseId: string;
  name: string;
  shortName: string;
  description: string;
  location: GeoLocation;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  phone: string;
  website?: string;
  foreUpFacilityId: string;
  region: MissouriRegion;
  holes: number;
  par: number;
  yardage: {
    championship: number;
    mens: number;
    ladies: number;
  };
  courseRating?: number;
  slopeRating?: number;
  amenities: CourseAmenity[];
  operatingHours: {
    [day: string]: TimeRange;
  };
  seasonalAvailability: {
    open: string; // MM-DD
    close: string;
  };
  pricing: CoursePricing;
  policies: CoursePolicy;
  status: 'ACTIVE' | 'SEASONAL_CLOSED' | 'MAINTENANCE' | 'INACTIVE';
  imageUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

export enum MissouriRegion {
  BRANSON = 'BRANSON',
  LAKE_OF_THE_OZARKS = 'LAKE_OF_THE_OZARKS',
  KANSAS_CITY = 'KANSAS_CITY',
  ST_LOUIS = 'ST_LOUIS',
  SPRINGFIELD = 'SPRINGFIELD',
  COLUMBIA = 'COLUMBIA',
  JOPLIN = 'JOPLIN',
  CAPE_GIRARDEAU = 'CAPE_GIRARDEAU',
  OTHER = 'OTHER',
}

export enum CourseAmenity {
  DRIVING_RANGE = 'DRIVING_RANGE',
  PUTTING_GREEN = 'PUTTING_GREEN',
  PRO_SHOP = 'PRO_SHOP',
  RESTAURANT = 'RESTAURANT',
  BAR = 'BAR',
  LOCKER_ROOM = 'LOCKER_ROOM',
  LESSONS = 'LESSONS',
  CART_GPS = 'CART_GPS',
  PRACTICE_BUNKER = 'PRACTICE_BUNKER',
  CLUB_RENTAL = 'CLUB_RENTAL',
  LODGING = 'LODGING',
}

export interface CoursePricing {
  weekday18: PriceRange;
  weekday9: PriceRange;
  weekend18: PriceRange;
  weekend9: PriceRange;
  twilight: PriceRange;
  cartFee18: number;
  cartFee9: number;
  memberDiscount?: number; // percentage
  trailPassDiscount?: number;
}

export interface CoursePolicy {
  cancellationHours: number; // hours before tee time for full refund
  noShowFee: number;
  maxPartySize: number;
  minPartySize: number;
  dressCode?: string;
  metalSpikesAllowed: boolean;
  walkingAllowed: boolean;
  ageRequirements?: string;
  paceOfPlayTarget: number; // minutes for 18 holes
}

export interface CourseInventory {
  courseId: string;
  date: ISODateString;
  time: string; // HH:MM
  totalSpots: number;
  availableSpots: number;
  price: number;
  cartIncluded: boolean;
  holes: number;
  isBlocked: boolean;
  foreUpTeeTimeId?: string;
}

// DynamoDB item shapes
export interface CourseDynamoItem {
  PK: `COURSE#${string}`;
  SK: 'DETAIL';
  GSI1PK: `REGION#${string}`;
  GSI1SK: string; // courseName
  Type: 'Course';
  data: Course;
}

export interface CourseInventoryDynamoItem {
  PK: `COURSE#${string}`;
  SK: `INVENTORY#${string}#${string}`; // INVENTORY#date#time
  Type: 'CourseInventory';
  data: CourseInventory;
  TTL: number;
}

export interface CoursePolicyDynamoItem {
  PK: `COURSE#${string}`;
  SK: 'POLICY';
  Type: 'CoursePolicy';
  data: CoursePolicy;
}
