// ============================================================
// BookingConfirmationCard — Booking confirmation in chat
// ============================================================

import { CheckCircle2, Calendar, Share2, ShoppingCart, Footprints } from 'lucide-react';
import type { BookingConfirmationCard as BookingConfirmationCardType } from '@golf-concierge/shared';

interface BookingConfirmationCardProps {
  booking: BookingConfirmationCardType;
}

function generateICS(booking: BookingConfirmationCardType): string {
  // Simple ICS generation
  const dateStr = booking.date.replace(/[^0-9]/g, '');
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Missouri Golf Trail//Concierge//EN',
    'BEGIN:VEVENT',
    `DTSTART:${dateStr}`,
    `SUMMARY:Golf - ${booking.courseName}`,
    `DESCRIPTION:Tee Time: ${booking.teeTime}\\nPlayers: ${booking.players}\\nConfirmation: ${booking.confirmationCode}`,
    `LOCATION:${booking.courseName}`,
    `DTSTAMP:${now}`,
    `UID:${booking.bookingId}@mogolftrail.com`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function downloadICS(booking: BookingConfirmationCardType) {
  const ics = generateICS(booking);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `golf-${booking.confirmationCode}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

function shareBooking(booking: BookingConfirmationCardType) {
  const text = [
    `⛳ Golf Booking Confirmed!`,
    `📍 ${booking.courseName}`,
    `📅 ${booking.date} at ${booking.teeTime}`,
    `👥 ${booking.players} players`,
    `🎫 Confirmation: ${booking.confirmationCode}`,
    `💰 Total: $${booking.totalCharged}`,
  ].join('\n');

  if (navigator.share) {
    navigator.share({ title: 'Golf Booking', text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert('Booking details copied to clipboard!');
    });
  }
}

export function BookingConfirmationCard({ booking }: BookingConfirmationCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-green-200 shadow-sm">
      {/* Success header */}
      <div className="bg-green-50 px-4 py-3 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
        <span className="font-semibold text-green-800 text-sm">Booking Confirmed!</span>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900">{booking.courseName}</h3>
          <p className="text-sm text-gray-600 mt-0.5">
            {booking.date} at {booking.teeTime}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Players</span>
            <p className="font-medium text-gray-900">{booking.players}</p>
          </div>
          <div>
            <span className="text-gray-500">Holes</span>
            <p className="font-medium text-gray-900">{booking.holes}</p>
          </div>
          <div>
            <span className="text-gray-500">Cart</span>
            <p className="font-medium text-gray-900 flex items-center gap-1">
              {booking.cartIncluded ? (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" /> Included
                </>
              ) : (
                <>
                  <Footprints className="w-3.5 h-3.5" /> Walking
                </>
              )}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Total</span>
            <p className="font-bold text-gray-900 text-lg">${booking.totalCharged}</p>
          </div>
        </div>

        {/* Confirmation code */}
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
          <span className="text-xs text-gray-500">Confirmation Code</span>
          <p className="font-mono font-bold text-gray-900 text-lg tracking-wider">
            {booking.confirmationCode}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => downloadICS(booking)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                       border border-gray-300 text-gray-700 text-sm font-medium
                       hover:bg-gray-50 active:bg-gray-100 transition-all
                       min-h-[44px]"
          >
            <Calendar className="w-4 h-4" />
            Add to Calendar
          </button>
          <button
            onClick={() => shareBooking(booking)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                       border border-gray-300 text-gray-700 text-sm font-medium
                       hover:bg-gray-50 active:bg-gray-100 transition-all
                       min-h-[44px]"
          >
            <Share2 className="w-4 h-4" />
            Share with Group
          </button>
        </div>
      </div>
    </div>
  );
}
