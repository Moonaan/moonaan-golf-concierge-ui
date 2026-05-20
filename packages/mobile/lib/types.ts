export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  ghinNumber?: string;
  memberSince: string;
  tier: 'guest' | 'member' | 'premium';
  preferences: UserPreferences;
}

export interface UserPreferences {
  pace: 'relaxed' | 'moderate' | 'fast';
  cartOrWalk: 'cart' | 'walk' | 'no_preference';
  notificationsEnabled: boolean;
  weatherAlerts: boolean;
  bookingReminders: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  cards?: ChatCard[];
  quickReplies?: string[];
}

export type ChatCard =
  | CourseOptionCard
  | TripItineraryCard
  | BookingConfirmationCard
  | HotelCard
  | WeatherAlertCard;

export interface CourseOptionCard {
  type: 'course_option';
  courseId: string;
  courseName: string;
  teeTime: string;
  price: number;
  rating: number;
  cartIncluded: boolean;
  holes: 9 | 18;
  imageUrl?: string;
}

export interface TripItineraryCard {
  type: 'trip_itinerary';
  tripName: string;
  days: TripDay[];
  hotel?: HotelInfo;
  totalPerPerson: number;
}

export interface TripDay {
  date: string;
  courseName: string;
  courseId: string;
  teeTime: string;
  driveTime?: string;
  cost: number;
  rating: number;
}

export interface HotelInfo {
  name: string;
  pricePerNight: number;
  nights: number;
  distanceToCourse: string;
  rating: number;
}

export interface BookingConfirmationCard {
  type: 'booking_confirmation';
  confirmationCode: string;
  courseName: string;
  courseId: string;
  date: string;
  teeTime: string;
  players: number;
  totalCharged: number;
  courseAddress: string;
  coursePhone: string;
}

export interface HotelCard {
  type: 'hotel';
  hotelId: string;
  name: string;
  pricePerNight: number;
  distanceToCourse: string;
  rating: number;
  amenities: string[];
  imageUrl?: string;
}

export interface WeatherAlertCard {
  type: 'weather_alert';
  date: string;
  temp: number;
  condition: string;
  icon: string;
  rainChance: number;
  message: string;
}

export interface Course {
  id: string;
  name: string;
  region: string;
  rating: number;
  priceRange: string;
  par: number;
  slope: number;
  courseRating: number;
  yardage: number;
  amenities: string[];
  phone: string;
  address: string;
  nextAvailableTeeTime?: string;
  imageUrl?: string;
  description?: string;
}

export interface Booking {
  id: string;
  courseId: string;
  courseName: string;
  date: string;
  teeTime: string;
  players: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  confirmationCode: string;
  totalPaid: number;
  courseAddress: string;
  coursePhone: string;
}
