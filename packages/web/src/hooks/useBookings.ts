// ============================================================
// useBookings — Fetch and manage bookings via API
// Demo mode: uses mock data
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE, mockGetBookings, mockCreateBooking, mockModifyBooking, mockCancelBooking } from '@/lib/mock-api';
import { bookingsApi, type Booking, ApiError } from '@/lib/api';

interface UseBookingsReturn {
  bookings: Booking[];
  upcomingBookings: Booking[];
  pastBookings: Booking[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createBooking: (data: {
    courseId: string;
    date: string;
    time: string;
    partySize: number;
    holes: number;
    cartPreference: string;
  }) => Promise<Booking>;
  modifyBooking: (
    bookingId: string,
    changes: Partial<{
      date: string;
      time: string;
      partySize: number;
      holes: number;
      cartPreference: string;
    }>,
  ) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

export function useBookings(): UseBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (DEMO_MODE) {
        const result = await mockGetBookings();
        setBookings(result.bookings);
      } else {
        const result = await bookingsApi.list();
        setBookings(result.bookings);
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load bookings';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const now = new Date().toISOString().split('T')[0];

  const upcomingBookings = bookings
    .filter(
      (b) =>
        b.date >= now &&
        (b.status === 'CONFIRMED' || b.status === 'PENDING'),
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const pastBookings = bookings
    .filter(
      (b) =>
        b.date < now ||
        b.status === 'COMPLETED' ||
        b.status === 'CANCELLED' ||
        b.status === 'NO_SHOW',
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const createBooking = useCallback(
    async (data: {
      courseId: string;
      date: string;
      time: string;
      partySize: number;
      holes: number;
      cartPreference: string;
    }) => {
      if (DEMO_MODE) {
        const booking = await mockCreateBooking(data);
        setBookings((prev) => [...prev, booking]);
        return booking;
      }
      const booking = await bookingsApi.create(data);
      setBookings((prev) => [...prev, booking]);
      return booking;
    },
    [],
  );

  const modifyBooking = useCallback(
    async (
      bookingId: string,
      changes: Partial<{
        date: string;
        time: string;
        partySize: number;
        holes: number;
        cartPreference: string;
      }>,
    ) => {
      if (DEMO_MODE) {
        const updated = await mockModifyBooking(bookingId, changes);
        setBookings((prev) =>
          prev.map((b) => (b.bookingId === bookingId ? updated : b)),
        );
        return updated;
      }
      const updated = await bookingsApi.modify(bookingId, changes);
      setBookings((prev) =>
        prev.map((b) => (b.bookingId === bookingId ? updated : b)),
      );
      return updated;
    },
    [],
  );

  const cancelBooking = useCallback(async (bookingId: string) => {
    if (DEMO_MODE) {
      await mockCancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === bookingId ? { ...b, status: 'CANCELLED' as const } : b,
        ),
      );
      return;
    }
    await bookingsApi.cancel(bookingId);
    setBookings((prev) =>
      prev.map((b) =>
        b.bookingId === bookingId ? { ...b, status: 'CANCELLED' as const } : b,
      ),
    );
  }, []);

  return {
    bookings,
    upcomingBookings,
    pastBookings,
    isLoading,
    error,
    refetch: fetchBookings,
    createBooking,
    modifyBooking,
    cancelBooking,
  };
}
