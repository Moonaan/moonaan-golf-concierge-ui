// ============================================================
// MyBookingsPage — Upcoming and Past bookings with management
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  AlertTriangle,
  X,
  Loader2,
  CalendarX,
  History,
  RefreshCw,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import type { Booking } from '@/lib/api';

type Tab = 'upcoming' | 'past';

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  CONFIRMED: { label: 'Confirmed', icon: CheckCircle2, className: 'badge-available' },
  PENDING: { label: 'Pending', icon: Clock, className: 'badge-limited' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, className: 'badge-full' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, className: 'badge bg-gray-100 text-gray-600' },
  NO_SHOW: { label: 'No Show', icon: MinusCircle, className: 'badge bg-red-50 text-red-700' },
};

export function MyBookingsPage() {
  const navigate = useNavigate();
  const {
    upcomingBookings,
    pastBookings,
    isLoading,
    error,
    refetch,
    cancelBooking,
  } = useBookings();

  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const bookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  async function handleCancel() {
    if (!cancelModalBooking) return;
    try {
      setIsCancelling(true);
      setCancelError(null);
      await cancelBooking(cancelModalBooking.bookingId);
      setCancelModalBooking(null);
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  }

  function formatDate(d: string): string {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  function formatTime(t: string): string {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
  }

  function isWithin24Hours(booking: Booking): boolean {
    const teeDateTime = new Date(`${booking.date}T${booking.time}`);
    const now = new Date();
    const diff = teeDateTime.getTime() - now.getTime();
    return diff < 24 * 60 * 60 * 1000;
  }

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="bg-hero-gradient text-white py-10">
        <div className="page-container">
          <h1 className="text-3xl md:text-4xl font-display font-bold">My Bookings</h1>
          <p className="mt-2 text-green-200">Manage your upcoming and past tee times</p>
        </div>
      </div>

      <div className="page-container -mt-4">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'upcoming'
                  ? 'border-golf-green-700 text-golf-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Upcoming
              {upcomingBookings.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-golf-green-100 text-golf-green-700 font-bold">
                  {upcomingBookings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'past'
                  ? 'border-golf-green-700 text-golf-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <History className="w-4 h-4" />
              Past
              {pastBookings.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 font-bold">
                  {pastBookings.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 flex items-center justify-between">
            <span className="text-sm text-red-700">{error}</span>
            <button onClick={refetch} className="text-red-600 hover:text-red-800">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-golf-green-700 animate-spin mb-3" />
            <p className="text-gray-500">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <CalendarX className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-display font-bold text-gray-700 mb-2">
              {activeTab === 'upcoming' ? 'No Upcoming Bookings' : 'No Past Bookings'}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'upcoming'
                ? "You don't have any upcoming tee times. Ready to hit the links?"
                : "You haven't completed any rounds yet."}
            </p>
            {activeTab === 'upcoming' && (
              <button onClick={() => navigate('/courses')} className="btn-primary">
                Browse Courses
              </button>
            )}
          </div>
        ) : (
          /* Booking Cards */
          <div className="space-y-4">
            {bookings.map((booking) => {
              const status = statusConfig[booking.status] || statusConfig.PENDING;
              const StatusIcon = status.icon;

              return (
                <div
                  key={booking.bookingId}
                  className="card border border-gray-200 hover:border-golf-green-200 transition-colors"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Course Name & Status */}
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-display text-lg font-bold text-gray-900">
                            {booking.courseName}
                          </h3>
                          <span className={status.className}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-golf-green-600" />
                            <span>{formatDate(booking.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-golf-green-600" />
                            <span>{formatTime(booking.time)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4 text-golf-green-600" />
                            <span>
                              {booking.partySize} {booking.partySize === 1 ? 'player' : 'players'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-golf-green-600" />
                            <span>{booking.holes} holes</span>
                          </div>
                        </div>

                        {/* Confirmation Code */}
                        <div className="mt-3 text-xs text-gray-400">
                          Confirmation: <span className="font-mono font-medium text-gray-500">{booking.confirmationCode}</span>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-golf-green-700">
                          ${booking.totalCost.toFixed(2)}
                        </p>

                        {activeTab === 'upcoming' && booking.status !== 'CANCELLED' && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() =>
                                navigate(`/courses/${booking.courseId}`)
                              }
                              className="p-2 text-gray-400 hover:text-golf-green-700 hover:bg-golf-green-50 rounded-lg transition-colors"
                              title="Modify booking"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setCancelModalBooking(booking)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel booking"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {activeTab === 'past' && booking.status === 'COMPLETED' && (
                          <button
                            onClick={() => navigate(`/courses/${booking.courseId}`)}
                            className="mt-3 text-xs text-golf-green-600 hover:text-golf-green-700 font-medium flex items-center gap-1"
                          >
                            Book Again <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-gray-900">
                    Cancel Booking?
                  </h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm space-y-1">
                <p className="font-semibold">{cancelModalBooking.courseName}</p>
                <p className="text-gray-600">
                  {formatDate(cancelModalBooking.date)} at {formatTime(cancelModalBooking.time)}
                </p>
                <p className="text-gray-600">
                  {cancelModalBooking.partySize} players · {cancelModalBooking.holes} holes
                </p>
              </div>

              {/* 24h warning */}
              {isWithin24Hours(cancelModalBooking) && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200 mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-semibold">Within 24-Hour Window</p>
                    <p className="mt-0.5">
                      Your tee time is less than 24 hours away. A cancellation fee may apply
                      per the course's cancellation policy.
                    </p>
                  </div>
                </div>
              )}

              {!isWithin24Hours(cancelModalBooking) && (
                <p className="text-sm text-gray-500 mb-4">
                  Free cancellation — your tee time is more than 24 hours away.
                </p>
              )}

              {cancelError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg mb-4 text-sm text-red-700">
                  <X className="w-4 h-4" />
                  {cancelError}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-4 pt-0">
              <button
                onClick={() => {
                  setCancelModalBooking(null);
                  setCancelError(null);
                }}
                className="btn-outline flex-1 py-2.5"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
