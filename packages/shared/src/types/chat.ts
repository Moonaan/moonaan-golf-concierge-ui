// ============================================================
// Chat Types — AI Golf Concierge
// Unified chat display types shared across web and mobile.
// These describe how conversational responses are rendered;
// they are intentionally display-oriented and distinct from
// the canonical domain types (Member, Booking, Course, etc).
// ============================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  cards?: ChatCard[];
  quickReplies?: string[];
}

// A single turn in the live voice/WebSocket agent transcript, produced by
// AgentConnection. Distinct from ChatMessage (the rich display message):
// the role is 'user' | 'agent' and the timestamp is a Date, not an ISO
// string. Used by useAgentConnection on both web and mobile.
export interface AgentTranscriptMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

// Discriminated union of all chat card variants. The `type`
// field is the discriminant used by renderers on web and mobile.
export type ChatCard =
  | CourseOptionCard
  | TripItineraryCard
  | BookingConfirmationCard
  | HotelOptionCard
  | WeatherAlertCard
  | MapLocationCard
  | PaymentRequestCard;

export interface CourseOptionCard {
  type: 'course_option';
  courseId: string;
  courseName: string;
  teeTime: string;
  date?: string;
  price: number;
  userRating?: number;
  highlight?: string;
  cartIncluded: boolean;
  holes?: 9 | 18;
  imageUrl?: string;
}

export interface TripItineraryCard {
  type: 'trip_itinerary';
  /** Canonical trip name. (Replaces the former `title` alias.) */
  tripName?: string;
  startDate?: string;
  endDate?: string;
  hotel?: ChatHotelInfo;
  days: ChatTripDay[];
  totalPerPerson: number;
  players?: number;
}

export interface ChatTripDay {
  date: string;
  dayLabel?: string;
  courseName: string;
  courseId?: string;
  teeTime: string;
  /** Canonical drive-time-from-hotel label. (Replaces the former `driveTime` alias.) */
  driveTimeFromHotel?: string;
  cost: number;
  userRating?: number;
}

export interface ChatHotelInfo {
  name: string;
  pricePerNight: number;
  nights?: number;
  distanceToCourse: string;
  rating?: number;
}

export interface HotelOptionCard {
  type: 'hotel_option';
  hotelId: string;
  name: string;
  pricePerNight: number;
  distanceToCourse: string;
  rating: number;
  amenities: string[];
  imageUrl?: string;
}

export interface BookingConfirmationCard {
  type: 'booking_confirmation';
  bookingId: string;
  confirmationCode: string;
  courseName: string;
  courseId?: string;
  date: string;
  teeTime: string;
  players: number;
  holes?: number;
  totalCharged: number;
  cartIncluded?: boolean;
  courseAddress?: string;
  coursePhone?: string;
}

export interface WeatherAlertCard {
  type: 'weather_alert';
  date: string;
  condition: string;
  /** Chance of precipitation, 0–100. Canonical rain field for both platforms. (Replaces the former `rainChance` alias.) */
  precipitation?: number;
  // Web renders a daily high/low range plus a golf-suitability score:
  location?: string;
  high?: number;
  low?: number;
  windSpeed?: number;
  golfability?: number;
  // Mobile renders a single current temperature plus an icon and advisory:
  temp?: number;
  icon?: string;
  message?: string;
}

export interface MapLocationCard {
  type: 'map_location';
  lat: number;
  lng: number;
  name: string;
}

export interface PaymentRequestCard {
  type: 'payment_request';
  amount: number;
  description: string;
}

export type ChatAction =
  | { type: 'BOOK'; courseId: string; date: string; time: string; players: number }
  | { type: 'PAYMENT'; amount: number; description: string }
  | { type: 'NAVIGATE'; path: string };

export interface ChatApiRequest {
  sessionId: string;
  message: string;
  memberId?: string;
}

export interface ChatApiResponse {
  response: string;
  cards?: ChatCard[];
  quickReplies?: string[];
  actions?: ChatAction[];
}
