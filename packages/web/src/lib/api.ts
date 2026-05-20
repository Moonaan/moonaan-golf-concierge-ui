// ============================================================
// API Client — Fetch wrapper with Cognito auth headers
// ============================================================

const API_BASE = import.meta.env.VITE_API_ENDPOINT || '/api';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  authenticated?: boolean;
}

async function getAuthToken(): Promise<string | null> {
  try {
    const { fetchAuthSession } = await import('aws-amplify/auth');
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, authenticated = true, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (authenticated) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorBody.message || `Request failed: ${response.statusText}`,
      errorBody,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Typed API Methods ───────────────────────────────────────

export interface Course {
  courseId: string;
  name: string;
  shortName: string;
  description: string;
  location: { lat: number; lng: number };
  address: { street: string; city: string; state: string; zip: string };
  phone: string;
  website?: string;
  region: string;
  holes: number;
  par: number;
  yardage: { championship: number; mens: number; ladies: number };
  courseRating?: number;
  slopeRating?: number;
  amenities: string[];
  pricing: {
    weekday18: { min: number; max: number };
    weekend18: { min: number; max: number };
    cartFee18: number;
  };
  imageUrls?: string[];
  status: string;
}

export interface TeeTime {
  courseId: string;
  date: string;
  time: string;
  availableSpots: number;
  totalSpots: number;
  price: number;
  cartIncluded: boolean;
  holes: number;
}

export interface Booking {
  bookingId: string;
  courseId: string;
  courseName: string;
  date: string;
  time: string;
  partySize: number;
  holes: number;
  cartPreference: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  totalCost: number;
  confirmationCode: string;
  createdAt: string;
}

export interface WeatherData {
  location: string;
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    condition: string;
    icon: string;
    uvIndex: number;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitation: number;
    windSpeed: number;
  }>;
  golfability: number; // 0-100 score
}

export interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  ghinNumber?: string;
  handicapIndex?: number;
  preferences: {
    favoriteCoursesIds: string[];
    defaultPartySize: number;
    defaultHoles: number;
    cartPreference: string;
    pacePreference: string;
    notifications: { email: boolean; sms: boolean; push: boolean };
  };
  paymentMethods: Array<{
    id: string;
    type: string;
    last4: string;
    expMonth: number;
    expYear: number;
    isDefault: boolean;
  }>;
}

// ── Course Endpoints ────────────────────────────────────────

export const coursesApi = {
  list: (params?: { region?: string; status?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ courses: Course[] }>(`/courses${qs ? `?${qs}` : ''}`);
  },

  get: (courseId: string) =>
    request<Course>(`/courses/${courseId}`),

  getAvailability: (
    courseId: string,
    date: string,
    partySize?: number,
    holes?: number,
  ) => {
    const params = new URLSearchParams({ date });
    if (partySize) params.set('partySize', String(partySize));
    if (holes) params.set('holes', String(holes));
    return request<{ teeTimes: TeeTime[] }>(
      `/courses/${courseId}/availability?${params}`,
    );
  },
};

// ── Booking Endpoints ───────────────────────────────────────

export const bookingsApi = {
  list: (status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return request<{ bookings: Booking[] }>(`/bookings${qs}`);
  },

  get: (bookingId: string) =>
    request<Booking>(`/bookings/${bookingId}`),

  create: (data: {
    courseId: string;
    date: string;
    time: string;
    partySize: number;
    holes: number;
    cartPreference: string;
  }) => request<Booking>('/bookings', { method: 'POST', body: data }),

  modify: (
    bookingId: string,
    data: Partial<{
      date: string;
      time: string;
      partySize: number;
      holes: number;
      cartPreference: string;
    }>,
  ) => request<Booking>(`/bookings/${bookingId}`, { method: 'PATCH', body: data }),

  cancel: (bookingId: string) =>
    request<void>(`/bookings/${bookingId}`, { method: 'DELETE' }),
};

// ── Weather Endpoint ────────────────────────────────────────

export const weatherApi = {
  get: (courseId: string, date?: string) => {
    const qs = date ? `?date=${date}` : '';
    return request<WeatherData>(`/weather/${courseId}${qs}`);
  },
};

// ── Profile Endpoints ───────────────────────────────────────

export const profileApi = {
  get: () => request<UserProfile>('/profile'),

  update: (data: Partial<UserProfile>) =>
    request<UserProfile>('/profile', { method: 'PATCH', body: data }),

  updatePreferences: (prefs: Partial<UserProfile['preferences']>) =>
    request<UserProfile>('/profile/preferences', { method: 'PATCH', body: prefs }),
};

// ── Maps / Route Optimization Endpoints ─────────────────────

export const mapsApi = {
  optimizeRoute: (tripPlan: {
    startLocation: { address?: string; name?: string; location?: { latitude: number; longitude: number } };
    courses: Array<{
      name: string;
      address: string;
      teeTime: string;
      location?: { latitude: number; longitude: number };
    }>;
    hotel?: { address?: string; name?: string };
    returnLocation?: { address?: string; name?: string };
  }) => request<{
    route: unknown;
    interestingStops: unknown[];
    demoMode: boolean;
  }>('/maps/route', { method: 'POST', body: { tripPlan } }),

  getDirections: (params: {
    origin: string;
    destination: string;
    waypoints?: string[];
    mode?: string;
  }) => request<{ directions: unknown; demoMode: boolean }>(
    '/maps/directions',
    { method: 'POST', body: params },
  ),

  searchNearby: (params: {
    lat: number;
    lng: number;
    radius?: number;
    type?: string;
    keyword?: string;
  }) => {
    const qs = new URLSearchParams();
    qs.set('lat', String(params.lat));
    qs.set('lng', String(params.lng));
    if (params.radius) qs.set('radius', String(params.radius));
    if (params.type) qs.set('type', params.type);
    if (params.keyword) qs.set('keyword', params.keyword);
    return request<{ places: unknown[]; count: number; demoMode: boolean }>(
      `/maps/places/nearby?${qs}`,
    );
  },

  getPlaceDetails: (placeId: string) =>
    request<{ place: unknown; demoMode: boolean }>(`/maps/places/${placeId}`),
};

export default {
  courses: coursesApi,
  bookings: bookingsApi,
  weather: weatherApi,
  profile: profileApi,
  maps: mapsApi,
};
