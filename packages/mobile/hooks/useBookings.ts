import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';
import type { Booking } from '../lib/types';

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
      const response = await api.get<{ upcoming: Booking[]; past: Booking[] }>('/bookings');
      setUpcoming(response.upcoming);
      setPast(response.past);
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ upcoming: response.upcoming, past: response.past })
      );
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
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
    );

    try {
      await api.delete(`/bookings/${bookingId}`);
      // Move to past
      setUpcoming((prev) => {
        const cancelled = prev.find((b) => b.id === bookingId);
        if (cancelled) {
          setPast((pastPrev) => [{ ...cancelled, status: 'cancelled' as const }, ...pastPrev]);
        }
        return prev.filter((b) => b.id !== bookingId);
      });
    } catch {
      // Revert optimistic update
      await fetchBookings();
      throw new Error('Failed to cancel booking');
    }
  }, []);

  return { upcoming, past, loading, refreshing, refresh, cancelBooking };
}
