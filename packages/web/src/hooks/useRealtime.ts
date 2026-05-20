// ============================================================
// useRealtime — AppSync WebSocket subscription for voice
// booking confirmations and real-time updates
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';

export interface VoiceBookingEvent {
  type:
    | 'BOOKING_STARTED'
    | 'SLOT_CONFIRMED'
    | 'BOOKING_CONFIRMED'
    | 'BOOKING_FAILED'
    | 'BOOKING_CANCELLED';
  bookingId?: string;
  courseName?: string;
  date?: string;
  time?: string;
  partySize?: number;
  message: string;
  timestamp: string;
}

interface UseRealtimeReturn {
  events: VoiceBookingEvent[];
  latestEvent: VoiceBookingEvent | null;
  isConnected: boolean;
  error: string | null;
  clearEvents: () => void;
}

export function useRealtime(userId?: string): UseRealtimeReturn {
  const [events, setEvents] = useState<VoiceBookingEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!userId) return;

    const wsEndpoint = import.meta.env.VITE_APPSYNC_REALTIME_ENDPOINT;
    if (!wsEndpoint) {
      // In development, use a mock connection
      setIsConnected(true);
      return;
    }

    try {
      const ws = new WebSocket(wsEndpoint);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;

        // Subscribe to user-specific events
        ws.send(
          JSON.stringify({
            type: 'subscribe',
            channel: `voice-booking/${userId}`,
          }),
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as VoiceBookingEvent;
          setEvents((prev) => [...prev.slice(-49), data]); // Keep last 50
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onerror = () => {
        setError('WebSocket connection error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);

        // Auto-reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * 2 ** reconnectAttempts.current,
            30000,
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
    }
  }, [userId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    latestEvent: events.length > 0 ? events[events.length - 1] : null,
    isConnected,
    error,
    clearEvents,
  };
}
