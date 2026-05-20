import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookingStatus } from '@golf-concierge/shared';
import type { Booking } from '@golf-concierge/shared';

const CACHE_KEY = 'bookings_cache';

export interface BookingsState {
  upcoming: Booking[];
  past: Booking[];
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

export function useBookings(): BookingsState {
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [past, setPast] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    // Load from cache first
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const { upcoming: u, past: p } = JSON.parse(cached);
        setUpcoming(u);
        setPast(p);
      }
    } catch {}

    // Then fetch fresh
    await fetchBookings();
  };

  const fetchBookings = async () => {
    try {
      // TODO(MGC-16): rewire to Bedrock AgentCore bookings backend
    } catch {
      // Keep cached data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
  }, []);

  const cancelBooking = useCallback(async (bookingId: string) => {
    // Optimistic update
    setUpcoming((prev) =>
      prev.map((b) => (b.bookingId === bookingId ? { ...b, status: BookingStatus.CANCELLED } : b))
    );

    try {
      // TODO(MGC-16): rewire to Bedrock AgentCore bookings backend
    } catch {
      // Revert optimistic update
      await fetchBookings();
      throw new Error('Failed to cancel booking');
    }
  }, []);

  return { upcoming, past, loading, refreshing, refresh, cancelBooking };
}
