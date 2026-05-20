// ============================================================
// BookingConfirmation — Booking receipt card
// ============================================================

import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import type { Booking } from '@/lib/api';

interface BookingConfirmationProps {
  booking: Booking;
  courseName: string;
  courseAddress?: string;
  cancellationPolicy?: string;
  onViewBookings?: () => void;
  onBookAnother?: () => void;
}

export function BookingConfirmation({
  booking,
  courseName,
  courseAddress,
  cancellationPolicy,
  onViewBookings,
  onBookAnother,
}: BookingConfirmationProps) {
  const [copied, setCopied] = useState(false);

  function formatDate(date: string): string {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
  }

  async function copyConfirmation() {
    try {
      await navigator.clipboard.writeText(booking.confirmationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Success header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-gray-900">
          Booking Confirmed!
        </h2>
        <p className="text-gray-500 mt-1">
          Your tee time has been reserved
        </p>
      </div>

      {/* Confirmation card */}
      <div className="card border border-gray-200">
        {/* Confirmation code */}
        <div className="bg-golf-green-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-golf-green-200 text-xs uppercase tracking-wider">
                Confirmation Code
              </p>
              <p className="text-white text-xl font-mono font-bold mt-0.5">
                {booking.confirmationCode}
              </p>
            </div>
            <button
              onClick={copyConfirmation}
              className="p-2 text-golf-green-200 hover:text-white transition-colors"
              title="Copy confirmation code"
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Booking details */}
        <div className="p-6 space-y-4">
          {/* Course */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-golf-green-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">{courseName}</p>
              {courseAddress && (
                <p className="text-sm text-gray-500">{courseAddress}</p>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-golf-green-700 flex-shrink-0" />
            <p className="text-gray-900">{formatDate(booking.date)}</p>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-golf-green-700 flex-shrink-0" />
            <p className="text-gray-900">
              {formatTime(booking.time)} · {booking.holes} holes
            </p>
          </div>

          {/* Party */}
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-golf-green-700 flex-shrink-0" />
            <p className="text-gray-900">
              {booking.partySize} {booking.partySize === 1 ? 'player' : 'players'}{' '}
              · {booking.cartPreference}
            </p>
          </div>

          {/* Cost */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
            <CreditCard className="w-5 h-5 text-golf-green-700 flex-shrink-0" />
            <div className="flex items-center justify-between flex-1">
              <span className="text-gray-600">Total</span>
              <span className="text-xl font-bold text-golf-green-700">
                ${booking.totalCost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Cancellation policy */}
        {cancellationPolicy && (
          <div className="px-6 pb-6">
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">{cancellationPolicy}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        {onViewBookings && (
          <button onClick={onViewBookings} className="btn-outline flex-1">
            View Bookings
          </button>
        )}
        {onBookAnother && (
          <button onClick={onBookAnother} className="btn-primary flex-1">
            Book Another
          </button>
        )}
      </div>
    </div>
  );
}
