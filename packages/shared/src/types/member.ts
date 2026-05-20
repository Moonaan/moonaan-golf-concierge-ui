// ============================================================
// Member Types — AI Golf Concierge
// ============================================================

import { UUID, ISODateTimeString, PhoneNumber, MemberTier, PaceOfPlay, CartOption, GeoLocation } from './common';

export interface Member {
  memberId: UUID;
  email: string;
  phone: PhoneNumber;
  firstName: string;
  lastName: string;
  tier: MemberTier;
  cognitoUserId: string;
  voiceIdProfileId?: string;
  ghinNumber?: string;
  handicapIndex?: number;
  homeLocation?: GeoLocation;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
  lastActiveAt?: ISODateTimeString;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

export interface MemberPreferences {
  memberId: UUID;
  preferredCourses: string[];
  preferredTimes: {
    weekday?: string; // HH:MM
    weekend?: string;
  };
  pacePreference: PaceOfPlay;
  cartPreference: CartOption;
  maxPrice?: number;
  preferredHoles: 9 | 18;
  notificationPreferences: {
    sms: boolean;
    push: boolean;
    email: boolean;
    departureReminder: boolean;
    reminderHoursBefore: number;
  };
  dietaryPreferences?: string[];
  accessibilityNeeds?: string[];
}

export interface PlayerRelationship {
  memberId: UUID;
  playerId: UUID;
  playerName: string;
  relationship: 'FRIEND' | 'FAMILY' | 'COLLEAGUE' | 'REGULAR';
  roundsTogether: number;
  lastPlayedTogether?: ISODateTimeString;
  averageGroupSize?: number;
}

// DynamoDB item shapes
export interface MemberDynamoItem {
  PK: `MEMBER#${string}`;
  SK: 'PROFILE';
  GSI1PK?: string; // EMAIL#email
  GSI1SK?: string;
  Type: 'Member';
  data: Member;
}

export interface MemberPreferencesDynamoItem {
  PK: `MEMBER#${string}`;
  SK: `PREF#${string}`;
  Type: 'MemberPreference';
  data: MemberPreferences;
}

export interface PlayerRelationshipDynamoItem {
  PK: `MEMBER#${string}`;
  SK: `PLAYER#${string}`;
  Type: 'PlayerRelationship';
  data: PlayerRelationship;
}

export interface CreateMemberRequest {
  email: string;
  phone: PhoneNumber;
  firstName: string;
  lastName: string;
  tier?: MemberTier;
  ghinNumber?: string;
}

export interface UpdateMemberRequest {
  memberId: UUID;
  firstName?: string;
  lastName?: string;
  phone?: PhoneNumber;
  tier?: MemberTier;
  ghinNumber?: string;
  handicapIndex?: number;
}

export interface UpdatePreferencesRequest {
  memberId: UUID;
  preferences: Partial<MemberPreferences>;
}
