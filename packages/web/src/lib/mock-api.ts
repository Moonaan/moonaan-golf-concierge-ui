// ============================================================
// Mock API — Intercepts all API calls in demo mode
// ============================================================

import {
  MOCK_COURSES,
  MOCK_BOOKINGS,
  DEMO_USER,
  generateTeeTimes,
  generateWeather,
  generateRouteData,
} from '@/lib/mock-data';
import type { RoutePlanInput } from '@/lib/mock-data';
import type { Course, TeeTime, Booking, WeatherData, UserProfile } from '@/lib/api';
import type { ChatApiResponse } from '@/types/chat';
import { generateConfirmationCode } from '@/lib/format';

// Demo mode: true when no API URL is configured
export const DEMO_MODE = !import.meta.env.VITE_API_ENDPOINT;

function delay(ms?: number): Promise<void> {
  const wait = ms ?? 200 + Math.random() * 300;
  return new Promise((resolve) => setTimeout(resolve, wait));
}

// ── Course APIs ──────────────────────────────────────────────

export async function mockGetCourses(params?: { region?: string; status?: string }): Promise<{ courses: Course[] }> {
  await delay();
  let courses = [...MOCK_COURSES];
  if (params?.region) {
    courses = courses.filter((c) => c.region === params.region);
  }
  return { courses };
}

export async function mockGetCourse(courseId: string): Promise<Course> {
  await delay();
  const course = MOCK_COURSES.find((c) => c.courseId === courseId);
  if (!course) throw new Error('Course not found');
  return course;
}

export async function mockGetAvailability(
  courseId: string,
  date: string,
  _partySize?: number,
  _holes?: number,
): Promise<{ teeTimes: TeeTime[] }> {
  await delay(300);
  const teeTimes = generateTeeTimes(courseId, date);
  return { teeTimes };
}

// ── Booking APIs ─────────────────────────────────────────────

let localBookings = [...MOCK_BOOKINGS];

export async function mockGetBookings(_status?: string): Promise<{ bookings: Booking[] }> {
  await delay();
  return { bookings: [...localBookings] };
}

export async function mockGetBooking(bookingId: string): Promise<Booking> {
  await delay();
  const booking = localBookings.find((b) => b.bookingId === bookingId);
  if (!booking) throw new Error('Booking not found');
  return booking;
}

export async function mockCreateBooking(data: {
  courseId: string;
  date: string;
  time: string;
  partySize: number;
  holes: number;
  cartPreference: string;
}): Promise<Booking> {
  await delay(400);
  const course = MOCK_COURSES.find((c) => c.courseId === data.courseId);
  const price = course?.pricing.weekday18.min || 50;

  const booking: Booking = {
    bookingId: `BK-${Date.now()}`,
    courseId: data.courseId,
    courseName: course?.name || 'Unknown Course',
    date: data.date,
    time: data.time,
    partySize: data.partySize,
    holes: data.holes,
    cartPreference: data.cartPreference,
    status: 'CONFIRMED',
    totalCost: price * data.partySize,
    confirmationCode: generateConfirmationCode(),
    createdAt: new Date().toISOString(),
  };

  localBookings = [...localBookings, booking];
  return booking;
}

export async function mockModifyBooking(
  bookingId: string,
  changes: Partial<{
    date: string;
    time: string;
    partySize: number;
    holes: number;
    cartPreference: string;
  }>,
): Promise<Booking> {
  await delay(300);
  const idx = localBookings.findIndex((b) => b.bookingId === bookingId);
  if (idx === -1) throw new Error('Booking not found');
  const updated = { ...localBookings[idx], ...changes };
  localBookings = localBookings.map((b) => (b.bookingId === bookingId ? updated : b));
  return updated;
}

export async function mockCancelBooking(bookingId: string): Promise<void> {
  await delay(300);
  localBookings = localBookings.map((b) =>
    b.bookingId === bookingId ? { ...b, status: 'CANCELLED' as const } : b,
  );
}

// ── Weather API ──────────────────────────────────────────────

export async function mockGetWeather(courseId: string, date?: string): Promise<WeatherData> {
  await delay(200);
  return generateWeather(courseId, date);
}

// ── Profile APIs ─────────────────────────────────────────────

let localProfile = { ...DEMO_USER };

export async function mockGetProfile(): Promise<UserProfile> {
  await delay();
  return { ...localProfile };
}

export async function mockUpdateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  await delay(300);
  localProfile = { ...localProfile, ...data };
  return { ...localProfile };
}

export async function mockUpdatePreferences(prefs: Partial<UserProfile['preferences']>): Promise<UserProfile> {
  await delay(200);
  localProfile = {
    ...localProfile,
    preferences: { ...localProfile.preferences, ...prefs },
  };
  return { ...localProfile };
}

// ── Chat API ─────────────────────────────────────────────────

export async function mockChat(message: string): Promise<ChatApiResponse> {
  await delay(500 + Math.random() * 800);
  const lower = message.toLowerCase();

  if (lower.includes('tee time') || lower.includes('book') || lower.includes('play')) {
    return {
      response: "I found some great options for you! Here are the best available tee times:",
      richContent: {
        type: 'course_options',
        courses: [
          {
            courseId: 'top-of-the-rock',
            name: 'Top of the Rock',
            time: '9:20 AM',
            date: 'Saturday',
            price: 135,
            rating: 4.8,
            highlight: 'Jack Nicklaus design — lake views',
            cartIncluded: true,
          },
          {
            courseId: 'branson-hills',
            name: 'Branson Hills Golf Club',
            time: '8:48 AM',
            date: 'Saturday',
            price: 75,
            rating: 4.5,
            highlight: 'Best value in Branson',
            cartIncluded: true,
          },
          {
            courseId: 'old-kinderhook',
            name: 'Old Kinderhook',
            time: '10:00 AM',
            date: 'Saturday',
            price: 99,
            rating: 4.6,
            highlight: 'Tom Weiskopf gem at the lake',
            cartIncluded: true,
          },
        ],
      },
      quickReplies: ['Book the first one', 'Show me Sunday times', 'Different area'],
    };
  }

  if (lower.includes('trip') || lower.includes('plan') || lower.includes('weekend')) {
    return {
      response: "Here's a killer golf trip I put together for you:",
      richContent: {
        type: 'trip_itinerary',
        trip: {
          title: 'Ozarks Golf Weekend',
          startDate: '2026-04-10',
          endDate: '2026-04-12',
          hotel: {
            name: 'Chateau on the Lake',
            pricePerNight: 159,
            distanceToCourse: '10 min drive',
          },
          days: [
            { date: '2026-04-10', dayLabel: 'Day 1 — Friday', courseName: 'Top of the Rock', teeTime: '9:00 AM', driveTimeFromHotel: '10 min', cost: 135 },
            { date: '2026-04-11', dayLabel: 'Day 2 — Saturday', courseName: 'Branson Hills Golf Club', teeTime: '8:30 AM', driveTimeFromHotel: '15 min', cost: 75 },
            { date: '2026-04-12', dayLabel: 'Day 3 — Sunday', courseName: 'Thousand Hills', teeTime: '9:15 AM', driveTimeFromHotel: '12 min', cost: 59 },
          ],
          totalPerPerson: 899,
          players: 4,
        },
      },
      quickReplies: ['Book it all', 'Change a course', 'Different hotel', 'Add another round'],
    };
  }

  if (lower.includes('best') || lower.includes('recommend') || lower.includes('branson') || lower.includes('kc') || lower.includes('kansas') || lower.includes('louis')) {
    return {
      response: "Here are my top picks:\n\n⛳ **Top of the Rock** (Branson) — Jack Nicklaus par-3 masterpiece overlooking Table Rock Lake. Absolutely stunning. 4.8 rating.\n\n⛳ **Old Kinderhook** (Camdenton) — Tom Weiskopf design in the Ozark hills. Best bang for your buck at the lake. 4.6 rating.\n\n⛳ **Shoal Creek** (Kansas City) — KC's crown jewel municipal course. Tournament conditions. 4.4 rating.\n\nWant me to check availability at any of these?",
      quickReplies: ['Check Top of the Rock times', 'Check Old Kinderhook times', 'Show me all courses'],
    };
  }

  if (lower.includes('yes') || lower.includes('book it') || lower.includes('book the') || lower.includes("let's do")) {
    return {
      response: "Booked! You're all set. Here's your confirmation:",
      richContent: {
        type: 'booking_confirmation',
        booking: {
          bookingId: `BK-${Date.now()}`,
          courseName: 'Top of the Rock',
          date: 'Saturday',
          time: '9:20 AM',
          players: 2,
          holes: 18,
          totalCharged: 270,
          confirmationCode: generateConfirmationCode(),
          cartIncluded: true,
        },
      },
      quickReplies: ['Add another round', 'Book a hotel nearby', "That's all, thanks!"],
    };
  }

  if (lower.includes('hotel') || lower.includes('stay') || lower.includes('lodge')) {
    return {
      response: "Here are the best hotels near the course:",
      richContent: {
        type: 'hotel_options',
        hotels: [
          { hotelId: 'chateau', name: 'Chateau on the Lake', pricePerNight: 159, distanceToCourse: '10 min drive', rating: 4.6, amenities: ['Pool', 'Spa', 'Lake View', 'Restaurant'] },
          { hotelId: 'big-cedar', name: 'Big Cedar Lodge', pricePerNight: 189, distanceToCourse: '5 min drive', rating: 4.8, amenities: ['Pool', 'Spa', 'Golf Shuttle', 'Restaurant'] },
          { hotelId: 'hilton-branson', name: 'Hilton Branson Convention Center', pricePerNight: 129, distanceToCourse: '20 min drive', rating: 4.3, amenities: ['Pool', 'Fitness Center', 'Downtown Location'] },
        ],
      },
      quickReplies: ['Book Chateau on the Lake', 'Cheaper options', 'I have a place'],
    };
  }

  if (lower.includes('weather') || lower.includes('forecast') || lower.includes('rain')) {
    return {
      response: "☀️ Looking great for golf this weekend!\n\n**Saturday:** 72°F, Partly Cloudy, 8 mph wind, 10% chance of rain. Golfability: 85/100 — Excellent!\n\n**Sunday:** 68°F, Mostly Sunny, 12 mph wind, 15% chance of rain. Golfability: 78/100 — Good!\n\nYou're going to have a fantastic round! 🏌️",
      quickReplies: ['Find a tee time Saturday', 'What about next week?', 'Course recommendations'],
    };
  }

  if (lower.includes('bbq') || lower.includes('food') || lower.includes('restaurant') || lower.includes('eat') || lower.includes('dinner')) {
    return {
      response: "Great taste! Here are my top picks near the courses:\n\n🍖 **Danna's BBQ & Burger Shop** (Branson) — Legendary burnt ends and brisket. Cash only, worth every penny.\n\n🍖 **Jack Stack Barbecue** (KC) — Upscale BBQ, perfect for client dinners. Famous crown prime ribs.\n\n🍖 **Pappy's Smokehouse** (St. Louis) — Memphis-style ribs that'll change your life. Get there early — they sell out.\n\n🍖 **Gettin' Basted** (Branson) — Competition-style BBQ with creative sauces.\n\nWant me to plan a dinner after your round?",
      quickReplies: ['Plan dinner + golf', 'More restaurant options', 'Back to tee times'],
    };
  }

  if (lower.includes('thank') || lower.includes("that's all") || lower.includes('bye') || lower.includes('done')) {
    return {
      response: "You're all set! Have an amazing round out there. 🏌️‍♂️⛳\n\nRemember, you can always come back to:\n• Check tee times\n• Plan another trip\n• Get course recommendations\n\nHit 'em straight! 🎯",
      quickReplies: ['Find a tee time', 'Plan a trip', 'Course recommendations'],
    };
  }

  return {
    response: "I can help with that! Here's what I'm great at:\n\n🏌️ **Finding tee times** — Tell me when and where, I'll find the best slots\n📋 **Planning golf trips** — Multi-course weekends with hotels and dining\n⛳ **Course recommendations** — Based on your skill level, budget, and preferences\n🌤️ **Weather updates** — Know before you go\n🍽️ **Local dining** — The best BBQ, steakhouses, and post-round spots\n\nJust tell me what you need!",
    quickReplies: ['Find a tee time', 'Plan a golf trip', 'Best courses near me'],
  };
}

// ── Route API ────────────────────────────────────────────────

export async function mockOptimizeRoute(
  tripPlan: RoutePlanInput,
): Promise<ReturnType<typeof generateRouteData>> {
  await delay(500);
  return generateRouteData(tripPlan);
}
