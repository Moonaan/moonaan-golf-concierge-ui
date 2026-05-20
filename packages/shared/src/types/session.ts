// ============================================================
// Session & Lex Types — AI Golf Concierge
// ============================================================

import { UUID, ISODateTimeString } from './common';
import { ConversationTurn } from './conversation';

export interface ConversationSession {
  sessionId: UUID;
  memberId?: UUID;
  channel: 'VOICE' | 'WEB' | 'SMS';
  connectContactId?: string;
  lexSessionId?: string;
  state: SessionState;
  context: SessionContext;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
  expiresAt: ISODateTimeString;
}

export interface SessionState {
  currentIntent?: string;
  confirmationPending?: boolean;
  pendingBooking?: PendingBookingState;
  searchResults?: SearchResultsState;
  authLevel: 'NONE' | 'VOICE_ID' | 'OTP_VERIFIED';
}

export interface PendingBookingState {
  courseId?: string;
  courseName?: string;
  date?: string;
  time?: string;
  partySize?: number;
  holes?: number;
  cartOption?: string;
  price?: number;
  step: 'SEARCH' | 'SELECT' | 'CONFIRM' | 'COMPLETE';
}

export interface SearchResultsState {
  query: Record<string, unknown>;
  results: Array<{
    courseId: string;
    courseName: string;
    time: string;
    price: number;
    availableSpots: number;
  }>;
  selectedIndex?: number;
}

export interface SessionContext {
  memberName?: string;
  memberTier?: string;
  preferredCourse?: string;
  lastBookingId?: string;
  conversationHistory: ConversationTurn[];
}

// Lex V2 event types
export interface LexV2Event {
  sessionId: string;
  inputTranscript: string;
  interpretations: LexInterpretation[];
  proposedNextState?: {
    dialogAction: {
      type: string;
    };
    intent?: {
      name: string;
      slots: Record<string, LexSlot | null>;
      state: string;
    };
  };
  sessionState: {
    sessionAttributes: Record<string, string>;
    intent: {
      name: string;
      slots: Record<string, LexSlot | null>;
      state: string;
      confirmationState?: string;
    };
    activeContexts?: Array<{
      name: string;
      contextAttributes: Record<string, string>;
      timeToLive: { turnsToLive: number; timeToLiveInSeconds: number };
    }>;
  };
  requestAttributes?: Record<string, string>;
  bot: {
    id: string;
    name: string;
    aliasId: string;
    aliasName: string;
    localeId: string;
    version: string;
  };
  invocationSource: 'DialogCodeHook' | 'FulfillmentCodeHook';
}

export interface LexInterpretation {
  intent: {
    name: string;
    slots: Record<string, LexSlot | null>;
    state: string;
    confirmationState?: string;
  };
  nluConfidence?: {
    score: number;
  };
}

export interface LexSlot {
  value: {
    originalValue: string;
    interpretedValue: string;
    resolvedValues: string[];
  };
  shape?: 'Scalar' | 'List';
  values?: LexSlot[];
}

export interface LexV2Response {
  sessionState: {
    sessionAttributes: Record<string, string>;
    dialogAction: {
      type: 'Close' | 'ConfirmIntent' | 'Delegate' | 'ElicitIntent' | 'ElicitSlot';
      slotToElicit?: string;
    };
    intent: {
      name: string;
      slots: Record<string, LexSlot | null>;
      state: 'Failed' | 'Fulfilled' | 'FulfillmentInProgress' | 'InProgress' | 'ReadyForFulfillment' | 'Waiting';
      confirmationState?: 'Confirmed' | 'Denied' | 'None';
    };
    activeContexts?: Array<{
      name: string;
      contextAttributes: Record<string, string>;
      timeToLive: { turnsToLive: number; timeToLiveInSeconds: number };
    }>;
  };
  messages: Array<{
    contentType: 'PlainText' | 'SSML' | 'ImageResponseCard';
    content?: string;
    imageResponseCard?: {
      title: string;
      subtitle?: string;
      buttons?: Array<{ text: string; value: string }>;
    };
  }>;
  requestAttributes?: Record<string, string>;
}

// DynamoDB item
export interface SessionDynamoItem {
  PK: `SESSION#${string}`;
  SK: 'DETAIL';
  GSI1PK?: `MEMBER#${string}`;
  GSI1SK?: `SESSION#${string}`;
  Type: 'Session';
  data: ConversationSession;
  TTL: number;
}
