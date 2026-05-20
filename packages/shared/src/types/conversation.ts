// ============================================================
// Conversation Types — AI Golf Concierge
// The core state model for the voice-first AI brain.
// Every conversation is a living, accumulating context that
// the AI uses to be proactive, smart, and zero-friction.
// ============================================================

import {
  UUID, ISODateString, ISODateTimeString, PhoneNumber,
  PaceOfPlay, CartOption, HoleCount, MemberTier, GeoLocation,
} from './common';
import { Booking, TeeTimeSlot, BookingPlayer } from './booking';
import { Member, MemberPreferences, PlayerRelationship } from './member';
import { MissouriRegion } from './course';

// Re-declare lightweight versions of travel types to avoid cross-package imports.
// The full types live in packages/lambdas/src/travel-handler/types.ts

export interface ConvHotelResult {
  hotelId: string;
  name: string;
  starRating: number;
  distanceMiles: number;
  bestRate: {
    nightlyRate: number;
    totalRate: number;
    currency: string;
    freeCancellation: boolean;
    breakfastIncluded: boolean;
  };
}

export interface ConvHotelBooking {
  bookingId: string;
  hotelName: string;
  checkIn: ISODateString;
  checkOut: ISODateString;
  totalPrice: number;
  confirmationNumber: string;
  status: string;
}

// ── Core Conversation State ─────────────────────────────────

/**
 * The full conversation state — persisted in DynamoDB per session.
 * This is the AI's "working memory" for an entire customer interaction.
 */
export interface ConversationState {
  /** Unique session identifier (from Lex or Connect) */
  sessionId: string;
  /** Authenticated member ID, if known */
  memberId?: UUID;
  /** Channel: voice (Connect), web chat, or SMS */
  channel: 'VOICE' | 'WEB' | 'SMS';
  /** Full turn history for this session */
  turns: ConversationTurn[];
  /** Accumulated context — what we know about what they want */
  context: ConversationContext;
  /** Loaded member profile (if authenticated) */
  memberProfile?: Member;
  /** Loaded member preferences */
  preferences?: MemberPreferences;
  /** Known player relationships for group suggestions */
  playerGraph?: PlayerRelationship[];
  /** When the session started */
  createdAt: ISODateTimeString;
  /** Last activity timestamp */
  lastActivityAt: ISODateTimeString;
  /** DynamoDB TTL — 30 min after last activity */
  ttl: number;
}

/**
 * Accumulated conversation context — the AI builds this up
 * across multiple turns. This is what makes multi-turn
 * conversations feel natural and smart.
 */
export interface ConversationContext {
  // ── Location & Region ───────────────────────
  /** Natural language location: "Branson", "near the lake" */
  location?: string;
  /** Resolved Missouri region */
  region?: MissouriRegion;
  /** Specific geo coordinates if we have them */
  coordinates?: GeoLocation;

  // ── Time & Date ─────────────────────────────
  /** Dates they've mentioned (accumulated) */
  dates?: string[];
  /** Resolved target date for current search */
  targetDate?: ISODateString;
  /** Time preference: "morning", "early", "afternoon", or specific "9:00" */
  timePreference?: string;
  /** Resolved time range */
  timeRange?: { start: string; end: string };

  // ── Course & Play Preferences ───────────────
  /** Course IDs they've discussed */
  courses?: string[];
  /** Specific course they're focused on */
  targetCourse?: string;
  /** Party size */
  partySize?: number;
  /** Hole count */
  holes?: HoleCount;
  /** Cart preference */
  cartOption?: CartOption;
  /** Pace preference */
  pacePreference?: PaceOfPlay;
  /** Max price constraint */
  maxPrice?: number;

  // ── Search State ────────────────────────────
  /** Full search constraints built from conversation */
  constraints?: SearchConstraints;
  /** Last search results we showed them */
  searchResults?: TeeTimeSlot[];
  /** Options they explicitly rejected */
  rejectedOptions?: RejectedOption[];
  /** Option they're leaning toward or selected */
  selectedOption?: TeeTimeSlot;

  // ── Trip Planning ───────────────────────────
  /** Active trip plan being built */
  tripPlan?: TripPlanContext;

  // ── Booking State ───────────────────────────
  /** Pending bookings awaiting confirmation */
  pendingBookings?: PendingBooking[];
  /** Whether payment is ready to process */
  paymentReady?: boolean;
  /** Completed bookings in this session */
  completedBookings?: CompletedBooking[];

  // ── Modification State ──────────────────────
  /** Booking being modified */
  modifyingBooking?: {
    bookingId: UUID;
    original: Partial<Booking>;
    changes: Partial<Booking>;
  };

  // ── Weather Context ─────────────────────────
  /** Weather info we've fetched (to proactively mention) */
  weather?: WeatherContext;
}

// ── Search Constraints ──────────────────────────────────────

/**
 * Structured search constraints extracted from natural language.
 * Built up incrementally as the customer provides more details.
 */
export interface SearchConstraints {
  location?: string;
  region?: MissouriRegion;
  courseIds?: string[];
  date?: ISODateString;
  dateRange?: { start: ISODateString; end: ISODateString };
  timeRange?: { start: string; end: string };
  partySize?: number;
  holes?: HoleCount;
  cartOption?: CartOption;
  pacePreference?: PaceOfPlay;
  maxPrice?: number;
  minRating?: number;
  amenities?: string[];
  walkingOnly?: boolean;
  /** Priority order for constraint relaxation */
  relaxationOrder?: (keyof SearchConstraints)[];
}

// ── Conversation Turns ──────────────────────────────────────

/**
 * A single turn in the conversation — user utterance or AI response.
 * Each turn can carry structured data about what happened.
 */
export interface ConversationTurn {
  /** Who spoke */
  role: 'user' | 'assistant' | 'system';
  /** The natural language content */
  content: string;
  /** When this turn happened */
  timestamp: ISODateTimeString;
  /** Detected intent (if user turn) */
  intent?: string;
  /** Extracted slot values (if user turn) */
  slots?: Record<string, string>;
  /** NLU confidence score */
  confidence?: number;
  /** Actions taken during this turn */
  actions?: ConversationAction[];
  /** SSML version of the response (if assistant turn) */
  ssml?: string;
}

// ── Conversation Actions ────────────────────────────────────

/**
 * Actions the AI took or needs to take during a turn.
 * These are the "side effects" of the conversation.
 */
export type ConversationAction =
  | SearchAction
  | BookAction
  | CancelAction
  | ModifyAction
  | PlanTripAction
  | SearchHotelsAction
  | BookHotelAction
  | PaymentAction
  | NotifyAction
  | WeatherCheckAction
  | RecommendAction;

export interface SearchAction {
  type: 'SEARCH';
  params: SearchConstraints;
  results: TeeTimeSlot[];
  resultCount: number;
  /** Were constraints relaxed to find results? */
  relaxed?: boolean;
  relaxedConstraints?: string[];
}

export interface BookAction {
  type: 'BOOK';
  booking: Partial<Booking>;
  success?: boolean;
  confirmationCode?: string;
  error?: string;
}

export interface CancelAction {
  type: 'CANCEL';
  bookingId: UUID;
  success?: boolean;
  refundAmount?: number;
}

export interface ModifyAction {
  type: 'MODIFY';
  bookingId: UUID;
  changes: Record<string, unknown>;
  success?: boolean;
}

export interface PlanTripAction {
  type: 'PLAN_TRIP';
  plan: TripPlanContext;
}

export interface SearchHotelsAction {
  type: 'SEARCH_HOTELS';
  params: Record<string, unknown>;
  results: ConvHotelResult[];
}

export interface BookHotelAction {
  type: 'BOOK_HOTEL';
  booking: ConvHotelBooking;
}

export interface PaymentAction {
  type: 'PAYMENT';
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  paymentIntentId?: string;
}

export interface NotifyAction {
  type: 'NOTIFY';
  channel: 'SMS' | 'EMAIL' | 'PUSH';
  recipient: string;
  message: string;
  sent: boolean;
}

export interface WeatherCheckAction {
  type: 'WEATHER_CHECK';
  location: string;
  date: ISODateString;
  result: WeatherContext;
}

export interface RecommendAction {
  type: 'RECOMMEND';
  basis: 'history' | 'preferences' | 'popularity' | 'context';
  recommendations: CourseRecommendation[];
}

// ── Trip Planning Context ───────────────────────────────────

export interface TripPlanContext {
  /** Trip title/description */
  title?: string;
  /** Number of days */
  days: number;
  /** Number of players */
  players: number;
  /** Player names if provided */
  playerNames?: string[];
  /** Budget per person per day */
  budgetPerPersonPerDay?: number;
  /** Total budget */
  totalBudget?: number;
  /** Location/region */
  location: string;
  /** Rounds per day */
  roundsPerDay?: number;
  /** Trip type */
  tripType?: string;
  /** Day-by-day itinerary */
  itinerary?: TripDay[];
  /** Selected hotel */
  hotel?: ConvHotelResult;
  /** Hotel booking if booked */
  hotelBooking?: ConvHotelBooking;
  /** Computed total cost per person */
  costPerPerson?: number;
  /** Total trip cost */
  totalCost?: number;
  /** Status of the trip plan */
  status: 'building' | 'presented' | 'modifying' | 'confirmed' | 'booked';
}

export interface TripDay {
  dayNumber: number;
  date?: ISODateString;
  rounds: TripRound[];
  hotel?: string;
  driveTimeBetweenMinutes?: number;
  notes?: string;
}

export interface TripRound {
  courseId?: string;
  courseName: string;
  teeTime?: string;
  price?: number;
  timeOfDay: 'morning' | 'afternoon';
  difficulty?: 'easy' | 'moderate' | 'championship';
  highlight?: string; // "stunning Ozark views", "Jack Nicklaus design"
  slot?: TeeTimeSlot;
}

// ── Rejected Options Tracking ───────────────────────────────

export interface RejectedOption {
  courseId: string;
  courseName: string;
  date?: ISODateString;
  time?: string;
  price?: number;
  reason?: string; // "too expensive", "too early", "don't like that course"
  rejectedAt: ISODateTimeString;
}

// ── Pending & Completed Bookings ────────────────────────────

export interface PendingBooking {
  courseId: string;
  courseName: string;
  date: ISODateString;
  teeTime: string;
  partySize: number;
  holes: HoleCount;
  cartOption: CartOption;
  price: number;
  totalPrice: number;
  slotId?: string;
  players?: BookingPlayer[];
  step: 'selected' | 'confirmed' | 'payment_pending' | 'processing';
}

export interface CompletedBooking {
  bookingId: UUID;
  confirmationCode: string;
  courseName: string;
  date: ISODateString;
  teeTime: string;
  partySize: number;
  totalPrice: number;
  bookedAt: ISODateTimeString;
}

// ── Weather Context ─────────────────────────────────────────

export interface WeatherContext {
  location: string;
  date: ISODateString;
  condition: string; // "sunny", "partly cloudy", "rain likely"
  highTemp: number;
  lowTemp: number;
  precipChance: number; // 0-100
  windMph: number;
  advisory?: string; // "Thunderstorms expected after 2pm"
  fetchedAt: ISODateTimeString;
}

// ── Course Recommendations ──────────────────────────────────

export interface CourseRecommendation {
  courseId: string;
  courseName: string;
  region: MissouriRegion;
  score: number; // 0-100 match score
  reason: string; // Human-readable: "Matches your preference for morning rounds"
  highlight: string; // "Fastest pace on the trail"
  price?: number;
  availableTimes?: string[];
  distanceMiles?: number;
}

// ── Response Types ──────────────────────────────────────────

/**
 * The AI generates both a spoken (SSML) and display response.
 * Voice-first, but the web app gets structured data too.
 */
export interface AIResponse {
  /** SSML-formatted response for Polly/voice output */
  spoken: string;
  /** Display response for web/chat UI */
  display: DisplayResponse;
  /** Actions to execute after responding */
  actions: ConversationAction[];
  /** Updated conversation context */
  updatedContext: Partial<ConversationContext>;
  /** Whether the conversation is complete (close session) */
  sessionComplete?: boolean;
}

export interface DisplayResponse {
  /** Plain text version of the response */
  text: string;
  /** Structured options for buttons/cards */
  options?: DisplayOption[];
  /** Rich card for trip plans, confirmations, etc. */
  card?: ResponseCard;
  /** Quick reply suggestions */
  suggestions?: string[];
}

export interface DisplayOption {
  label: string;
  value: string;
  subtitle?: string;
  price?: number;
  time?: string;
  courseName?: string;
}

export interface ResponseCard {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  fields: Array<{ label: string; value: string }>;
  actions?: Array<{ label: string; action: string }>;
}

// ── DynamoDB Item Shape ─────────────────────────────────────

export interface ConversationDynamoItem {
  PK: `SESSION#${string}`;
  SK: 'CONVERSATION';
  GSI1PK?: `MEMBER#${string}`;
  GSI1SK?: `SESSION#${string}`;
  Type: 'Conversation';
  data: ConversationState;
  TTL: number;
}

// ── Intent Classification ───────────────────────────────────

export type ConversationIntent =
  | 'SEARCH_TEE_TIMES'
  | 'BOOK_TEE_TIME'
  | 'MODIFY_BOOKING'
  | 'CANCEL_BOOKING'
  | 'PLAN_TRIP'
  | 'GET_RECOMMENDATION'
  | 'CHECK_WEATHER'
  | 'CHECK_IN'
  | 'JOIN_WAITLIST'
  | 'CONFIRM_YES'
  | 'CONFIRM_NO'
  | 'MODIFY_CONSTRAINTS'
  | 'ASK_QUESTION'
  | 'GREETING'
  | 'FAREWELL'
  | 'UNKNOWN';

/**
 * Result of intent classification — used by the orchestrator
 * to decide what to do next.
 */
export interface IntentClassification {
  intent: ConversationIntent;
  confidence: number;
  /** Extracted entities/slots from the utterance */
  entities: Record<string, string>;
  /** Whether this is a follow-up to a previous turn */
  isFollowUp: boolean;
  /** Whether this modifies existing constraints */
  modifiesConstraints: boolean;
  /** Raw Lex interpretation if available */
  lexInterpretation?: Record<string, unknown>;
}
