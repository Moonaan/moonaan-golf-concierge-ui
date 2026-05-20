import { ISODateTimeString } from './common';

export interface OtpRecord {
  code: string;
  identifier: string; // phone or email
  identifierType: 'phone' | 'email';
  expiresAt: ISODateTimeString;
  verified: boolean;
  createdAt: ISODateTimeString;
}

export interface OtpDynamoItem {
  PK: `OTP#${string}`;
  SK: 'CODE';
  data: OtpRecord;
  TTL: number;
}

export interface StripeCustomerMapping {
  stripeCustomerId: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: ISODateTimeString;
}

export interface StripeCustomerDynamoItem {
  PK: `STRIPE#${string}`;
  SK: 'CUSTOMER';
  data: StripeCustomerMapping;
}
