// ============================================================
// VoiceStatus — Real-time voice booking status indicator
// ============================================================

import { useState } from 'react';
import { Mic, MicOff, Phone, X, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime, type VoiceBookingEvent } from '@/hooks/useRealtime';

const statusConfig: Record<
  VoiceBookingEvent['type'],
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  BOOKING_STARTED: {
    icon: Phone,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  SLOT_CONFIRMED: {
    icon: Loader2,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  BOOKING_CONFIRMED: {
    icon: Check,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  BOOKING_FAILED: {
    icon: X,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  BOOKING_CANCELLED: {
    icon: X,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
};

export function VoiceStatus() {
  const { user, isAuthenticated } = useAuth();
  const { latestEvent, isConnected } = useRealtime(user?.userId);
  const [expanded, setExpanded] = useState(false);

  if (!isAuthenticated) return null;

  // No active voice event — show connection indicator
  if (!latestEvent) {
    return (
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        title={isConnected ? 'Voice assistant connected' : 'Voice assistant offline'}
      >
        {isConnected ? (
          <Mic className="w-5 h-5 text-golf-green-700" />
        ) : (
          <MicOff className="w-5 h-5 text-gray-400" />
        )}
        {isConnected && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
        )}
      </button>
    );
  }

  const config = statusConfig[latestEvent.type];
  const StatusIcon = config.icon;
  const isAnimating = latestEvent.type === 'SLOT_CONFIRMED';

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} transition-all duration-300`}
      >
        <StatusIcon
          className={`w-4 h-4 ${config.color} ${isAnimating ? 'animate-spin' : ''}`}
        />
        <span className={`text-xs font-medium ${config.color} hidden sm:inline`}>
          {latestEvent.type === 'BOOKING_STARTED' && 'Booking in progress...'}
          {latestEvent.type === 'SLOT_CONFIRMED' && 'Confirming...'}
          {latestEvent.type === 'BOOKING_CONFIRMED' && 'Booked!'}
          {latestEvent.type === 'BOOKING_FAILED' && 'Failed'}
          {latestEvent.type === 'BOOKING_CANCELLED' && 'Cancelled'}
        </span>
      </button>

      {/* Expanded details popover */}
      {expanded && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setExpanded(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 z-50 card border border-gray-200 p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}
              >
                <StatusIcon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">
                  Voice Booking
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {latestEvent.message}
                </p>
                {latestEvent.courseName && (
                  <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                    <p>Course: {latestEvent.courseName}</p>
                    {latestEvent.date && <p>Date: {latestEvent.date}</p>}
                    {latestEvent.time && <p>Time: {latestEvent.time}</p>}
                    {latestEvent.partySize && (
                      <p>Players: {latestEvent.partySize}</p>
                    )}
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-2">
                  {new Date(latestEvent.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
