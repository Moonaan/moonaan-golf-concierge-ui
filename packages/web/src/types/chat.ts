// ============================================================
// Chat Types — Message models for the chat-first concierge UI
// ============================================================

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  richContent?: RichContent;
  quickReplies?: string[];
};

export type RichContent =
  | { type: 'course_options'; courses: CourseOption[] }
  | { type: 'trip_itinerary'; trip: TripItinerary }
  | { type: 'booking_confirmation'; booking: BookingConfirmation }
  | { type: 'hotel_options'; hotels: HotelOption[] }
  | { type: 'payment_request'; amount: number; description: string }
  | { type: 'weather_alert'; forecast: WeatherForecast }
  | { type: 'map_location'; lat: number; lng: number; name: string };

export type CourseOption = {
  courseId: string;
  name: string;
  time: string;
  date: string;
  price: number;
  rating: number;
  highlight: string;
  cartIncluded: boolean;
  imageUrl?: string;
};

export type TripItinerary = {
  title: string;
  startDate: string;
  endDate: string;
  hotel: {
    name: string;
    pricePerNight: number;
    distanceToCourse: string;
  };
  days: TripDay[];
  totalPerPerson: number;
  players: number;
};

export type TripDay = {
  date: string;
  dayLabel: string;
  courseName: string;
  teeTime: string;
  driveTimeFromHotel: string;
  cost: number;
};

export type BookingConfirmation = {
  bookingId: string;
  courseName: string;
  date: string;
  time: string;
  players: number;
  holes: number;
  totalCharged: number;
  confirmationCode: string;
  cartIncluded: boolean;
};

export type HotelOption = {
  hotelId: string;
  name: string;
  pricePerNight: number;
  distanceToCourse: string;
  rating: number;
  amenities: string[];
  imageUrl?: string;
};

export type WeatherForecast = {
  location: string;
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
  windSpeed: number;
  golfability: number;
};

export type ChatAction =
  | { type: 'BOOK'; courseId: string; date: string; time: string; players: number }
  | { type: 'PAYMENT'; amount: number; description: string }
  | { type: 'NAVIGATE'; path: string };

export type ChatApiRequest = {
  sessionId: string;
  message: string;
  memberId?: string;
};

export type ChatApiResponse = {
  response: string;
  richContent?: RichContent;
  quickReplies?: string[];
  actions?: ChatAction[];
};
