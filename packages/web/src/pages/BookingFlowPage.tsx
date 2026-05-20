// ============================================================
// BookingFlowPage — Multi-step booking wizard
// ============================================================

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  ShoppingCart,
  Footprints,
  Check,
  Loader2,
  X,
  Mail,
  User,
} from 'lucide-react';
import { BookingConfirmation } from '@/components/BookingConfirmation';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import type { Booking } from '@/lib/api';

interface PartyMember {
  name: string;
  email: string;
}

const STEPS = ['Select Time', 'Options', 'Party Details', 'Review', 'Confirmed'];

export function BookingFlowPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBooking } = useBookings();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Booking state from search params
  const courseId = searchParams.get('courseId') || '';
  const courseName = searchParams.get('courseName') || 'Selected Course';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const price = Number(searchParams.get('price') || 0);
  const initialPartySize = Number(searchParams.get('partySize') || 2);
  const holes = Number(searchParams.get('holes') || 18);
  const cartIncluded = searchParams.get('cartIncluded') === 'true';

  const [partySize, setPartySize] = useState(initialPartySize);
  const [cartPreference, setCartPreference] = useState<'cart' | 'walking'>(
    cartIncluded ? 'cart' : 'cart',
  );
  const [partyMembers, setPartyMembers] = useState<PartyMember[]>(() => {
    const members: PartyMember[] = [
      { name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '', email: user?.email || '' },
    ];
    for (let i = 1; i < initialPartySize; i++) {
      members.push({ name: '', email: '' });
    }
    return members;
  });

  // Update party members when party size changes
  useEffect(() => {
    setPartyMembers((prev) => {
      const updated = [...prev];
      while (updated.length < partySize) updated.push({ name: '', email: '' });
      return updated.slice(0, partySize);
    });
  }, [partySize]);

  const totalCost = price * partySize;

  function updatePartyMember(index: number, field: keyof PartyMember, value: string) {
    setPartyMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  async function handleConfirm() {
    try {
      setIsSubmitting(true);
      setError(null);
      const booking = await createBooking({
        courseId,
        date,
        time,
        partySize,
        holes,
        cartPreference,
      });
      setConfirmedBooking(booking);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0:
        return Boolean(courseId && date && time);
      case 1:
        return true;
      case 2:
        return partyMembers.slice(0, partySize).every((m) => m.name.trim().length > 0);
      case 3:
        return true;
      default:
        return false;
    }
  }

  function formatDate(d: string): string {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatTime(t: string): string {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
  }

  // No booking params — redirect
  if (!courseId || !date || !time) {
    return (
      <div className="page-container py-20 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-display font-bold text-gray-700 mb-2">No Tee Time Selected</h2>
        <p className="text-gray-500 mb-6">Browse courses and select a tee time to start booking.</p>
        <button onClick={() => navigate('/courses')} className="btn-primary">
          Browse Courses
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50">
      {/* Progress Bar */}
      {step < 4 && (
        <div className="bg-white border-b border-gray-200">
          <div className="page-container py-4">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {STEPS.slice(0, 4).map((label, i) => (
                <div key={label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        i < step
                          ? 'bg-golf-green-700 text-white'
                          : i === step
                            ? 'bg-golf-green-700 text-white ring-4 ring-golf-green-100'
                            : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {i < step ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span
                      className={`text-xs mt-1 hidden sm:block ${
                        i <= step ? 'text-golf-green-700 font-medium' : 'text-gray-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div
                      className={`w-12 sm:w-20 h-0.5 mx-1 sm:mx-2 ${
                        i < step ? 'bg-golf-green-700' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="page-container py-8">
        <div className="max-w-2xl mx-auto">
          {/* Step 0: Confirm Selection */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-golf-green-700">
                Confirm Your Tee Time
              </h2>

              <div className="card border border-gray-200 p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-golf-green-700 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{courseName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-golf-green-700" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-golf-green-700" />
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="font-medium">{formatTime(time)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-gray-600">
                    {holes} holes · {partySize} {partySize === 1 ? 'player' : 'players'}
                  </span>
                  <span className="text-lg font-bold text-golf-green-700">
                    ${price}/player
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Options */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-golf-green-700">
                Customize Your Round
              </h2>

              {/* Party Size */}
              <div className="card border border-gray-200 p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Users className="w-4 h-4 inline mr-1.5" />
                  Party Size
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setPartySize(n)}
                      className={`py-3 rounded-lg border-2 font-semibold transition-colors ${
                        partySize === n
                          ? 'border-golf-green-700 bg-golf-green-50 text-golf-green-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cart vs Walking */}
              <div className="card border border-gray-200 p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Transportation
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCartPreference('cart')}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                      cartPreference === 'cart'
                        ? 'border-golf-green-700 bg-golf-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <ShoppingCart
                      className={`w-6 h-6 ${
                        cartPreference === 'cart' ? 'text-golf-green-700' : 'text-gray-400'
                      }`}
                    />
                    <div className="text-left">
                      <p className={`font-semibold ${cartPreference === 'cart' ? 'text-golf-green-700' : 'text-gray-700'}`}>
                        Cart
                      </p>
                      <p className="text-xs text-gray-500">
                        {cartIncluded ? 'Included in fee' : 'Additional fee'}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => setCartPreference('walking')}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                      cartPreference === 'walking'
                        ? 'border-golf-green-700 bg-golf-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Footprints
                      className={`w-6 h-6 ${
                        cartPreference === 'walking' ? 'text-golf-green-700' : 'text-gray-400'
                      }`}
                    />
                    <div className="text-left">
                      <p className={`font-semibold ${cartPreference === 'walking' ? 'text-golf-green-700' : 'text-gray-700'}`}>
                        Walking
                      </p>
                      <p className="text-xs text-gray-500">Enjoy the fresh air</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Running total */}
              <div className="bg-golf-green-50 rounded-lg p-4 flex justify-between items-center">
                <span className="text-gray-700">
                  {partySize} {partySize === 1 ? 'player' : 'players'} × ${price}
                </span>
                <span className="text-xl font-bold text-golf-green-700">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Step 2: Party Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-golf-green-700">
                Party Details
              </h2>
              <p className="text-gray-500">
                Enter the details for each player in your group.
              </p>

              <div className="space-y-4">
                {partyMembers.slice(0, partySize).map((member, i) => (
                  <div key={i} className="card border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-golf-green-100 flex items-center justify-center text-sm font-bold text-golf-green-700">
                        {i + 1}
                      </div>
                      <span className="font-semibold text-gray-700">
                        {i === 0 ? 'You (Lead Player)' : `Player ${i + 1}`}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          <User className="w-3 h-3 inline mr-1" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => updatePartyMember(i, 'name', e.target.value)}
                          placeholder="John Doe"
                          className="input-field text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          <Mail className="w-3 h-3 inline mr-1" />
                          Email {i === 0 ? '*' : '(optional)'}
                        </label>
                        <input
                          type="email"
                          value={member.email}
                          onChange={(e) => updatePartyMember(i, 'email', e.target.value)}
                          placeholder="john@example.com"
                          className="input-field text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Review & Payment */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-golf-green-700">
                Review & Confirm
              </h2>

              <div className="card border border-gray-200 divide-y divide-gray-100">
                {/* Course & Time */}
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Tee Time
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-golf-green-700" />
                      <span className="font-semibold">{courseName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-golf-green-700" />
                      <span>{formatDate(date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-golf-green-700" />
                      <span>{formatTime(time)} · {holes} holes</span>
                    </div>
                  </div>
                </div>

                {/* Party */}
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Party ({partySize} {partySize === 1 ? 'player' : 'players'})
                  </h3>
                  <div className="space-y-2">
                    {partyMembers.slice(0, partySize).map((m, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-golf-green-100 flex items-center justify-center text-xs font-bold text-golf-green-700">
                          {i + 1}
                        </div>
                        <span className="font-medium">{m.name}</span>
                        {m.email && (
                          <span className="text-gray-400">({m.email})</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Transportation: {cartPreference === 'cart' ? '🛒 Cart' : '🚶 Walking'}
                  </p>
                </div>

                {/* Payment Summary */}
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Payment Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Green fee × {partySize}
                      </span>
                      <span>${totalCost.toFixed(2)}</span>
                    </div>
                    {cartPreference === 'cart' && !cartIncluded && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cart fee</span>
                        <span>Included</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-100 font-bold text-lg">
                      <span>Total</span>
                      <span className="text-golf-green-700">${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment method placeholder */}
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Payment Method
                  </h3>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Pay at course — no prepayment required</span>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="flex items-start gap-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold">Cancellation Policy</p>
                  <p className="mt-1">
                    Free cancellation up to 24 hours before your tee time. Cancellations within
                    24 hours may incur a fee.
                  </p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && confirmedBooking && (
            <BookingConfirmation
              booking={confirmedBooking}
              courseName={courseName}
              cancellationPolicy="Free cancellation up to 24 hours before your tee time. Cancellations within 24 hours may incur a fee."
              onViewBookings={() => navigate('/bookings')}
              onBookAnother={() => navigate('/courses')}
            />
          )}

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => (step === 0 ? navigate(-1) : setStep(step - 1))}
                className="flex items-center gap-2 text-gray-600 hover:text-golf-green-700 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {step === 0 ? 'Back' : 'Previous'}
              </button>

              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canAdvance()}
                  className="btn-primary flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirm Booking
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
