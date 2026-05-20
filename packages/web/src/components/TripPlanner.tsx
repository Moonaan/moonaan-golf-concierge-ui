// ============================================================
// TripPlanner — Multi-step golf trip builder
// ============================================================

import { useState, useMemo } from 'react';
import {
  MapPin, Calendar, Users, Plane, Check, ChevronRight, ChevronLeft,
  Clock, Car, Hotel, Star, Sparkles,
} from 'lucide-react';
import { REGIONS, TRIP_PACKAGES, type RegionKey } from '@/lib/constants';
import { formatCurrency } from '@/lib/format';

type Step = 'package' | 'where' | 'when' | 'who' | 'how' | 'review';

const STEPS: { key: Step; label: string; icon: typeof MapPin }[] = [
  { key: 'package', label: 'Style', icon: Sparkles },
  { key: 'where', label: 'Where', icon: MapPin },
  { key: 'when', label: 'When', icon: Calendar },
  { key: 'who', label: 'Who', icon: Users },
  { key: 'how', label: 'How', icon: Plane },
  { key: 'review', label: 'Review', icon: Check },
];

interface TripState {
  packageId: string;
  selectedCourses: string[];
  region: RegionKey | null;
  startDate: string;
  endDate: string;
  players: number;
  playerNames: string[];
  includeFlights: boolean;
  departureCity: string;
  hotel: string | null;
}

// Mock hotels
const MOCK_HOTELS = [
  { id: 'big-cedar', name: 'Big Cedar Lodge', region: 'BRANSON', rating: 4.8, pricePerNight: 28900, distance: '5 min to courses' },
  { id: 'chateau-lake', name: 'Chateau on the Lake', region: 'BRANSON', rating: 4.6, pricePerNight: 19900, distance: '15 min to courses' },
  { id: 'branson-hilton', name: 'Hilton Branson Convention Center', region: 'BRANSON', rating: 4.3, pricePerNight: 14900, distance: '20 min to courses' },
  { id: 'lodge-four-seasons', name: 'Lodge of Four Seasons', region: 'LAKE_OZARKS', rating: 4.5, pricePerNight: 22900, distance: 'On-site course' },
  { id: 'camden-lake', name: 'Camden on the Lake', region: 'LAKE_OZARKS', rating: 4.4, pricePerNight: 17900, distance: '10 min to courses' },
  { id: 'kc-marriott', name: 'KC Marriott Downtown', region: 'KC', rating: 4.2, pricePerNight: 16900, distance: '25 min to courses' },
];

// Mock available courses
const MOCK_TRIP_COURSES = [
  { id: 'buffalo-ridge', name: 'Buffalo Ridge Springs', region: 'BRANSON', price: 15000, rating: 4.8 },
  { id: 'paynes-valley', name: "Payne's Valley", region: 'BRANSON', price: 27500, rating: 4.9 },
  { id: 'ledgestone', name: 'LedgeStone Championship', region: 'BRANSON', price: 8000, rating: 4.5 },
  { id: 'thousand-hills', name: 'Thousand Hills', region: 'BRANSON', price: 4900, rating: 4.2 },
  { id: 'old-kinderhook', name: 'Old Kinderhook', region: 'LAKE_OZARKS', price: 9900, rating: 4.6 },
  { id: 'the-cove', name: 'The Cove at Four Seasons', region: 'LAKE_OZARKS', price: 8400, rating: 4.4 },
  { id: 'swope-memorial', name: 'Swope Memorial', region: 'KC', price: 4200, rating: 4.1 },
  { id: 'gateway-national', name: 'Gateway National', region: 'STL', price: 7000, rating: 4.5 },
];

export function TripPlanner() {
  const [currentStep, setCurrentStep] = useState<Step>('package');
  const [trip, setTrip] = useState<TripState>({
    packageId: '',
    selectedCourses: [],
    region: null,
    startDate: '',
    endDate: '',
    players: 4,
    playerNames: ['', '', '', ''],
    includeFlights: false,
    departureCity: '',
    hotel: null,
  });

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[stepIndex + 1].key);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].key);
    }
  };

  const filteredCourses = useMemo(
    () =>
      trip.region
        ? MOCK_TRIP_COURSES.filter((c) => c.region === trip.region)
        : MOCK_TRIP_COURSES,
    [trip.region]
  );

  const filteredHotels = useMemo(
    () =>
      trip.region
        ? MOCK_HOTELS.filter((h) => h.region === trip.region)
        : MOCK_HOTELS,
    [trip.region]
  );

  const nights = useMemo(() => {
    if (!trip.startDate || !trip.endDate) return 0;
    const diff = new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [trip.startDate, trip.endDate]);

  const selectedHotel = MOCK_HOTELS.find((h) => h.id === trip.hotel);
  const totalCoursesCost = trip.selectedCourses.reduce((sum, id) => {
    const course = MOCK_TRIP_COURSES.find((c) => c.id === id);
    return sum + (course ? course.price * trip.players : 0);
  }, 0);
  const totalHotelCost = selectedHotel ? selectedHotel.pricePerNight * nights : 0;
  const totalCost = totalCoursesCost + totalHotelCost;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
        {STEPS.map((step, i) => {
          const isActive = i === stepIndex;
          const isDone = i < stepIndex;
          return (
            <div key={step.key} className="flex items-center">
              <button
                onClick={() => i <= stepIndex && setCurrentStep(step.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-golf-green-700 text-white'
                    : isDone
                    ? 'bg-golf-green-100 text-golf-green-700 cursor-pointer'
                    : 'text-gray-400 cursor-default'
                }`}
              >
                <step.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-300 mx-1 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="animate-fade-in">
        {/* ── Package Selection ────────── */}
        {currentStep === 'package' && (
          <div>
            <h2 className="text-2xl font-display font-bold text-golf-green-700 mb-2">
              What kind of trip?
            </h2>
            <p className="text-gray-500 mb-6">Choose your golf trip style</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TRIP_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => {
                    setTrip((t) => ({
                      ...t,
                      packageId: pkg.id,
                      players: pkg.defaultPlayers,
                      playerNames: Array(pkg.defaultPlayers).fill(''),
                      region: pkg.suggestedRegions[0] || null,
                    }));
                  }}
                  className={`text-left p-6 rounded-xl border-2 transition-all ${
                    trip.packageId === pkg.id
                      ? 'border-golf-green-700 bg-golf-green-50 shadow-md'
                      : 'border-gray-200 hover:border-golf-green-300 hover:shadow-sm'
                  }`}
                >
                  <span className="text-3xl">{pkg.icon}</span>
                  <h3 className="font-bold text-gray-900 mt-3">{pkg.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{pkg.description}</p>
                  <div className="flex gap-3 mt-3 text-xs text-gray-400">
                    <span>{pkg.defaultPlayers} players</span>
                    <span>{pkg.defaultNights} nights</span>
                    <span>{pkg.suggestedRegions.map((r) => REGIONS[r].label).join(', ')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Where ────────── */}
        {currentStep === 'where' && (
          <div>
            <h2 className="text-2xl font-display font-bold text-golf-green-700 mb-2">
              Where do you want to play?
            </h2>
            <p className="text-gray-500 mb-6">Select a region and pick your courses</p>

            {/* Region selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(Object.keys(REGIONS) as RegionKey[]).filter(k => k !== 'OTHER').map((key) => (
                <button
                  key={key}
                  onClick={() => setTrip((t) => ({ ...t, region: key, selectedCourses: [] }))}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    trip.region === key
                      ? 'bg-golf-green-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {REGIONS[key].label}
                </button>
              ))}
            </div>

            {/* Course selection */}
            <div className="space-y-3">
              {filteredCourses.map((course) => {
                const isSelected = trip.selectedCourses.includes(course.id);
                return (
                  <button
                    key={course.id}
                    onClick={() =>
                      setTrip((t) => ({
                        ...t,
                        selectedCourses: isSelected
                          ? t.selectedCourses.filter((id) => id !== course.id)
                          : [...t.selectedCourses, course.id],
                      }))
                    }
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-golf-green-700 bg-golf-green-50'
                        : 'border-gray-200 hover:border-golf-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-golf-green-700 bg-golf-green-700'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{course.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Star className="w-3.5 h-3.5 text-golf-gold-400 fill-current" />
                          {course.rating}
                        </div>
                      </div>
                    </div>
                    <span className="font-semibold text-golf-green-700">
                      {formatCurrency(course.price)}
                      <span className="text-xs text-gray-400 font-normal">/player</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Hotel selection */}
            {trip.selectedCourses.length > 0 && (
              <div className="mt-8">
                <h3 className="font-display font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-golf-green-700" />
                  Hotels Near Your Courses
                </h3>
                <div className="space-y-3">
                  {filteredHotels.map((hotel) => (
                    <button
                      key={hotel.id}
                      onClick={() => setTrip((t) => ({ ...t, hotel: hotel.id }))}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                        trip.hotel === hotel.id
                          ? 'border-golf-gold-400 bg-golf-gold-400/5'
                          : 'border-gray-200 hover:border-golf-gold-300'
                      }`}
                    >
                      <div>
                        <h4 className="font-semibold text-gray-900">{hotel.name}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-golf-gold-400 fill-current" />
                            {hotel.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Car className="w-3.5 h-3.5" />
                            {hotel.distance}
                          </span>
                        </div>
                      </div>
                      <span className="font-semibold text-golf-green-700">
                        {formatCurrency(hotel.pricePerNight)}
                        <span className="text-xs text-gray-400 font-normal">/night</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── When ────────── */}
        {currentStep === 'when' && (
          <div>
            <h2 className="text-2xl font-display font-bold text-golf-green-700 mb-2">
              When are you going?
            </h2>
            <p className="text-gray-500 mb-6">Select your travel dates</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check In
                </label>
                <input
                  type="date"
                  value={trip.startDate}
                  onChange={(e) => setTrip((t) => ({ ...t, startDate: e.target.value }))}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check Out
                </label>
                <input
                  type="date"
                  value={trip.endDate}
                  onChange={(e) => setTrip((t) => ({ ...t, endDate: e.target.value }))}
                  className="input-field"
                  min={trip.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            {nights > 0 && (
              <p className="mt-3 text-sm text-gray-500">
                {nights} night{nights !== 1 ? 's' : ''} • {trip.selectedCourses.length} round{trip.selectedCourses.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* ── Who ────────── */}
        {currentStep === 'who' && (
          <div>
            <h2 className="text-2xl font-display font-bold text-golf-green-700 mb-2">
              Who&apos;s playing?
            </h2>
            <p className="text-gray-500 mb-6">Add your party details</p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Players
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() =>
                      setTrip((t) => ({
                        ...t,
                        players: n,
                        playerNames: Array(n)
                          .fill('')
                          .map((_, i) => t.playerNames[i] || ''),
                      }))
                    }
                    className={`w-14 h-14 rounded-xl font-bold text-lg transition-all ${
                      trip.players === n
                        ? 'bg-golf-green-700 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {trip.playerNames.slice(0, trip.players).map((name, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Player {i + 1} {i === 0 ? '(You)' : ''}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setTrip((t) => {
                        const names = [...t.playerNames];
                        names[i] = e.target.value;
                        return { ...t, playerNames: names };
                      })
                    }
                    placeholder={`Player ${i + 1} name`}
                    className="input-field"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── How (flights) ────────── */}
        {currentStep === 'how' && (
          <div>
            <h2 className="text-2xl font-display font-bold text-golf-green-700 mb-2">
              Getting there
            </h2>
            <p className="text-gray-500 mb-6">Optional: add flight info for complete planning</p>

            <button
              onClick={() => setTrip((t) => ({ ...t, includeFlights: !t.includeFlights }))}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all w-full text-left mb-4 ${
                trip.includeFlights
                  ? 'border-golf-green-700 bg-golf-green-50'
                  : 'border-gray-200 hover:border-golf-green-300'
              }`}
            >
              <Plane className={`w-5 h-5 ${trip.includeFlights ? 'text-golf-green-700' : 'text-gray-400'}`} />
              <div>
                <p className="font-semibold text-gray-900">I need to fly in</p>
                <p className="text-sm text-gray-500">We&apos;ll help coordinate arrival with tee times</p>
              </div>
            </button>

            {trip.includeFlights && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departing from
                </label>
                <input
                  type="text"
                  value={trip.departureCity}
                  onChange={(e) => setTrip((t) => ({ ...t, departureCity: e.target.value }))}
                  placeholder="City or airport code"
                  className="input-field max-w-sm"
                />
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-500">
              <p className="font-medium text-gray-700 mb-1">💡 Driving?</p>
              <p>No worries — skip this step and we&apos;ll still build your full itinerary with drive times between courses and hotel.</p>
            </div>
          </div>
        )}

        {/* ── Review ────────── */}
        {currentStep === 'review' && (
          <div>
            <h2 className="text-2xl font-display font-bold text-golf-green-700 mb-2">
              Your Trip Summary
            </h2>
            <p className="text-gray-500 mb-6">Review and book everything in one click</p>

            {/* Itinerary Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
              {trip.selectedCourses.map((courseId, i) => {
                const course = MOCK_TRIP_COURSES.find((c) => c.id === courseId);
                if (!course) return null;
                const teeTime = `${7 + i}:${i % 2 === 0 ? '00' : '30'}`;
                const driveMin = selectedHotel ? 15 + (i * 5) : 0;
                const leaveTime = `${6 + i}:${45 - driveMin > 0 ? 45 - driveMin : '00'}`;

                return (
                  <div key={courseId} className={`p-4 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-golf-green-100 text-golf-green-700 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{course.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Day {i + 1} • Tee time {teeTime} AM
                        </p>
                        {selectedHotel && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              Leave hotel at {leaveTime} AM → {driveMin} min drive → Arrive {parseInt(teeTime) - 0}:{(parseInt(teeTime.split(':')[1]) - 30 + 60) % 60 || '00'} → Warmup → Tee off {teeTime} AM
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-golf-green-700">
                        {formatCurrency(course.price * trip.players)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {selectedHotel && (
                <div className="p-4 border-t border-gray-100 bg-golf-gold-400/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-golf-gold-400/20 text-golf-gold-600 flex items-center justify-center flex-shrink-0">
                      <Hotel className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{selectedHotel.name}</h4>
                      <p className="text-sm text-gray-500">
                        {nights} night{nights !== 1 ? 's' : ''} • {selectedHotel.distance}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-golf-green-700">
                      {formatCurrency(totalHotelCost)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-4 bg-golf-green-50 rounded-xl mb-6">
              <div>
                <p className="text-sm text-gray-500">Total for {trip.players} players</p>
                <p className="text-2xl font-bold text-golf-green-700">{formatCurrency(totalCost)}</p>
              </div>
              <button className="btn-secondary text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-shadow">
                Book Everything
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={goBack}
          disabled={stepIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            stepIndex === 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {currentStep !== 'review' && (
          <button
            onClick={goNext}
            className="btn-primary flex items-center gap-2"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
