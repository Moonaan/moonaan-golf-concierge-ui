// ============================================================
// CourseDetailPage — Full course detail with availability
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Globe,
  Star,
  ChevronLeft,
  Calendar,
  Users,
  TrendingUp,
  Mountain,
  Dumbbell,
  ShoppingBag,
  UtensilsCrossed,
  Beer,
  BedDouble,
  Warehouse,
} from 'lucide-react';
import { AvailabilityGrid } from '@/components/AvailabilityGrid';
import { WeatherWidget } from '@/components/WeatherWidget';
import { useCourses, useAvailability } from '@/hooks/useCourses';
import type { Course, TeeTime } from '@/lib/api';

const amenityIcons: Record<string, { icon: React.ElementType; label: string }> = {
  DRIVING_RANGE: { icon: Dumbbell, label: 'Driving Range' },
  PRO_SHOP: { icon: ShoppingBag, label: 'Pro Shop' },
  RESTAURANT: { icon: UtensilsCrossed, label: 'Restaurant' },
  BAR: { icon: Beer, label: 'Bar & Grill' },
  LODGING: { icon: BedDouble, label: 'Lodging' },
  LOCKER_ROOM: { icon: Warehouse, label: 'Locker Room' },
};

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCourse } = useCourses();
  const { teeTimes, isLoading: timesLoading, search } = useAvailability();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [partySize, setPartySize] = useState(2);
  const [selectedTeeTime, setSelectedTeeTime] = useState<TeeTime | null>(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        setIsLoading(true);
        const data = await getCourse(id!);
        setCourse(data);
      } catch {
        setError('Course not found');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id, getCourse]);

  useEffect(() => {
    if (!id || !selectedDate) return;
    search({ courseId: id, date: selectedDate, partySize });
  }, [id, selectedDate, partySize, search]);

  function handleBookNow() {
    if (!selectedTeeTime || !course) return;
    const params = new URLSearchParams({
      courseId: course.courseId,
      courseName: course.name,
      date: selectedTeeTime.date,
      time: selectedTeeTime.time,
      price: String(selectedTeeTime.price),
      partySize: String(partySize),
      holes: String(selectedTeeTime.holes),
      cartIncluded: String(selectedTeeTime.cartIncluded),
    });
    navigate(`/book?${params.toString()}`);
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-golf-green-200 border-t-golf-green-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="page-container py-20 text-center">
        <Mountain className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-display font-bold text-gray-700 mb-2">Course Not Found</h2>
        <p className="text-gray-500 mb-6">We couldn&apos;t find the course you&apos;re looking for.</p>
        <button onClick={() => navigate('/courses')} className="btn-primary">
          Browse All Courses
        </button>
      </div>
    );
  }

  const address = `${course.address.street}, ${course.address.city}, ${course.address.state} ${course.address.zip}`;
  const minPrice = course.pricing.weekday18.min;
  const maxPrice = course.pricing.weekend18.max;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-hero-gradient text-white">
        <div className="absolute inset-0 opacity-20">
          {course.imageUrls?.[0] ? (
            <img
              src={course.imageUrls[0]}
              alt={course.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 40% 40%, rgba(196,163,90,0.4) 0%, transparent 60%)',
              }}
            />
          )}
        </div>

        <div className="page-container relative z-10 py-12 md:py-20">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-1 text-sm text-green-200 hover:text-white transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Courses
          </button>

          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="badge bg-golf-gold-400/20 text-golf-gold-300 border border-golf-gold-400/30">
                {course.region.replace(/_/g, ' ')}
              </span>
              {course.courseRating && (
                <span className="flex items-center gap-1 text-sm text-green-200">
                  <Star className="w-4 h-4 text-golf-gold-400 fill-golf-gold-400" />
                  {course.courseRating}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-display font-bold">{course.name}</h1>
            <p className="mt-3 text-lg text-green-100 max-w-2xl">{course.description}</p>

            <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-green-200">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {course.address.city}, {course.address.state}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                {course.phone}
              </span>
              <span className="text-golf-gold-300 font-semibold">
                ${minPrice}–${maxPrice}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="page-container py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Info Grid */}
            <div className="card border border-gray-200 p-6">
              <h2 className="font-display text-xl font-bold text-golf-green-700 mb-4">
                Course Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-golf-green-700">{course.holes}</p>
                  <p className="text-xs text-gray-500 mt-1">Holes</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-golf-green-700">{course.par}</p>
                  <p className="text-xs text-gray-500 mt-1">Par</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-golf-green-700">
                    {course.yardage.championship.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Yards (Champ)</p>
                </div>
                {course.slopeRating && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-golf-green-700">{course.slopeRating}</p>
                    <p className="text-xs text-gray-500 mt-1">Slope</p>
                  </div>
                )}
                {course.courseRating && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-golf-green-700">{course.courseRating}</p>
                    <p className="text-xs text-gray-500 mt-1">Rating</p>
                  </div>
                )}
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-golf-green-700">
                    {course.pricing.cartFee18 === 0 ? 'Incl.' : `$${course.pricing.cartFee18}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Cart Fee</p>
                </div>
              </div>

              {/* Yardage breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Yardage</h3>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-gray-400">Championship:</span>{' '}
                    <span className="font-semibold">{course.yardage.championship.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Men&apos;s:</span>{' '}
                    <span className="font-semibold">{course.yardage.mens.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Ladies:</span>{' '}
                    <span className="font-semibold">{course.yardage.ladies.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {course.amenities.length > 0 && (
              <div className="card border border-gray-200 p-6">
                <h2 className="font-display text-xl font-bold text-golf-green-700 mb-4">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {course.amenities.map((amenity) => {
                    const config = amenityIcons[amenity];
                    const Icon = config?.icon || TrendingUp;
                    const label = config?.label || amenity.replace(/_/g, ' ');
                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 p-3 bg-golf-green-50 rounded-lg"
                      >
                        <Icon className="w-5 h-5 text-golf-green-700" />
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="card border border-gray-200 p-6">
              <h2 className="font-display text-xl font-bold text-golf-green-700 mb-4">
                Available Tee Times
              </h2>

              {/* Date & party size picker */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTeeTime(null);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field"
                  />
                </div>
                <div className="w-full sm:w-32">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    <Users className="w-4 h-4 inline mr-1" />
                    Players
                  </label>
                  <select
                    value={partySize}
                    onChange={(e) => {
                      setPartySize(Number(e.target.value));
                      setSelectedTeeTime(null);
                    }}
                    className="input-field"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Player' : 'Players'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <AvailabilityGrid
                teeTimes={teeTimes}
                selectedTime={selectedTeeTime?.time}
                onSelect={(tt) => setSelectedTeeTime(tt)}
                isLoading={timesLoading}
              />

              {/* Book Now */}
              {selectedTeeTime && (
                <div className="mt-6 p-4 bg-golf-green-50 rounded-lg border border-golf-green-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-golf-green-700">
                      {formatTime(selectedTeeTime.time)} · {selectedTeeTime.holes} holes
                    </p>
                    <p className="text-sm text-gray-600">
                      {partySize} {partySize === 1 ? 'player' : 'players'} ·{' '}
                      <span className="font-semibold">
                        ${(selectedTeeTime.price * partySize).toFixed(2)} total
                      </span>
                    </p>
                  </div>
                  <button onClick={handleBookNow} className="btn-primary w-full sm:w-auto">
                    Book Now
                  </button>
                </div>
              )}
            </div>

            {/* Contact & Location */}
            <div className="card border border-gray-200 p-6">
              <h2 className="font-display text-xl font-bold text-golf-green-700 mb-4">
                Location & Contact
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-golf-green-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{address}</p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-golf-green-600 hover:underline"
                    >
                      Get Directions →
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-golf-green-700 flex-shrink-0" />
                  <a href={`tel:${course.phone}`} className="font-medium text-gray-900 hover:text-golf-green-700">
                    {course.phone}
                  </a>
                </div>
                {course.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-golf-green-700 flex-shrink-0" />
                    <a
                      href={course.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-golf-green-600 hover:underline"
                    >
                      Visit Website →
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Placeholder */}
            <div className="card border border-gray-200 p-6">
              <h2 className="font-display text-xl font-bold text-golf-green-700 mb-4">
                Reviews
              </h2>
              <div className="space-y-4">
                {[
                  {
                    name: 'Mike R.',
                    rating: 5,
                    date: '2 weeks ago',
                    text: 'Absolutely stunning course. The layout challenges every club in your bag while rewarding good shots. Greens were immaculate and the staff was incredibly welcoming.',
                  },
                  {
                    name: 'Sarah T.',
                    rating: 4,
                    date: '1 month ago',
                    text: 'Beautiful scenery and well-maintained fairways. The back nine has some really memorable holes. Cart paths could use some work but overall a great experience.',
                  },
                  {
                    name: 'David L.',
                    rating: 5,
                    date: '1 month ago',
                    text: 'One of the best courses in Missouri. Worth every penny. The pro shop staff helped me pick the right tees for my handicap, and I had the round of my life.',
                  },
                ].map((review, i) => (
                  <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-golf-green-100 flex items-center justify-center text-sm font-bold text-golf-green-700">
                          {review.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{review.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{review.date}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`w-4 h-4 ${
                            j < review.rating
                              ? 'text-golf-gold-400 fill-golf-gold-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="card border border-gray-200 p-6 sticky top-20">
              <h3 className="font-display text-lg font-bold text-golf-green-700 mb-4">
                Green Fees
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Weekday 18</span>
                  <span className="font-semibold">
                    ${course.pricing.weekday18.min}–${course.pricing.weekday18.max}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Weekend 18</span>
                  <span className="font-semibold">
                    ${course.pricing.weekend18.min}–${course.pricing.weekend18.max}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Cart Fee (18)</span>
                  <span className="font-semibold">
                    {course.pricing.cartFee18 === 0 ? 'Included' : `$${course.pricing.cartFee18}`}
                  </span>
                </div>
              </div>

              {selectedTeeTime ? (
                <button onClick={handleBookNow} className="btn-primary w-full mt-6">
                  Book {formatTime(selectedTeeTime.time)} — ${selectedTeeTime.price * partySize}
                </button>
              ) : (
                <p className="text-center text-sm text-gray-400 mt-6">
                  Select a tee time above to book
                </p>
              )}
            </div>

            {/* Weather */}
            <WeatherWidget courseId={id!} date={selectedDate} />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
}
