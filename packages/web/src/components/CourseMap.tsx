// ============================================================
// CourseMap — Interactive Missouri map with course pins
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { MapPin, Star, Clock, DollarSign, X, Navigation, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { REGIONS, type RegionKey } from '@/lib/constants';
import { MOCK_COURSES as MOCK_COURSES_DATA } from '@/lib/mock-data';

interface CoursePin {
  courseId: string;
  name: string;
  region: RegionKey;
  rating: number;
  price: string;
  nextAvailable?: string;
  lat: number;
  lng: number;
}

// Generate pins from mock courses data
const MOCK_COURSES: CoursePin[] = MOCK_COURSES_DATA.map((c) => ({
  courseId: c.courseId,
  name: c.name,
  region: (c.region === 'KANSAS_CITY' ? 'KC' : c.region === 'ST_LOUIS' ? 'STL' : c.region === 'LAKE_OF_THE_OZARKS' ? 'LAKE_OZARKS' : c.region === 'SPRINGFIELD' || c.region === 'COLUMBIA' ? 'OZARKS' : c.region === 'OTHER' ? 'OTHER' : c.region) as RegionKey,
  rating: c.courseRating || 4.0,
  price: `$${c.pricing.weekday18.min}–$${c.pricing.weekend18.max}`,
  lat: c.location.lat,
  lng: c.location.lng,
}));

// Missouri regions positioned on a simplified map (percentages)
const regionPositions: Record<RegionKey, { x: number; y: number }> = {
  KC: { x: 18, y: 28 },
  STL: { x: 82, y: 35 },
  LAKE_OZARKS: { x: 48, y: 45 },
  OZARKS: { x: 40, y: 65 },
  BRANSON: { x: 38, y: 82 },
  OTHER: { x: 60, y: 55 },
};

// Map course lat/lng to approximate percentage positions on Missouri outline
function courseToPosition(course: CoursePin): { x: number; y: number } {
  const base = regionPositions[course.region];
  // Add slight offset per course to prevent overlap
  const hash = course.courseId.charCodeAt(0) + course.courseId.charCodeAt(course.courseId.length - 1);
  return {
    x: base.x + ((hash % 7) - 3) * 2,
    y: base.y + ((hash % 5) - 2) * 2,
  };
}

interface CourseMapProps {
  onCourseSelect?: (courseId: string) => void;
  compact?: boolean;
}

export function CourseMap({ onCourseSelect, compact = false }: CourseMapProps) {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<CoursePin | null>(null);
  const [activeRegion, setActiveRegion] = useState<RegionKey | null>(null);
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const filteredCourses = useMemo(() => {
    let courses = MOCK_COURSES;
    if (activeRegion) {
      courses = courses.filter((c) => c.region === activeRegion);
    }
    if (priceFilter !== 'all') {
      courses = courses.filter((c) => {
        const min = parseInt(c.price.replace(/[^0-9]/g, ''));
        if (priceFilter === 'budget') return min < 50;
        if (priceFilter === 'mid') return min >= 50 && min < 100;
        if (priceFilter === 'premium') return min >= 100;
        return true;
      });
    }
    return courses;
  }, [activeRegion, priceFilter]);

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    MOCK_COURSES.forEach((c) => {
      counts[c.region] = (counts[c.region] || 0) + 1;
    });
    return counts;
  }, []);

  const handleNearestToMe = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Fallback: center of Missouri
          setUserLocation({ lat: 38.5, lng: -92.5 });
        }
      );
    }
  }, []);

  const handlePinClick = (course: CoursePin) => {
    setSelectedCourse(course);
    onCourseSelect?.(course.courseId);
  };

  return (
    <div className={`relative ${compact ? '' : 'min-h-[500px]'}`}>
      {/* Filter Bar */}
      {!compact && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Region filters */}
          <button
            onClick={() => setActiveRegion(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !activeRegion
                ? 'bg-golf-green-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Regions
          </button>
          {(Object.keys(REGIONS) as RegionKey[]).filter(k => k !== 'OTHER').map((key) => (
            <button
              key={key}
              onClick={() => setActiveRegion(activeRegion === key ? null : key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeRegion === key
                  ? 'bg-golf-green-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {REGIONS[key].label}
              <span className="ml-1 opacity-60">({regionCounts[key] || 0})</span>
            </button>
          ))}

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm"
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>
            <button
              onClick={handleNearestToMe}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-golf-gold-400/10 text-golf-gold-600 hover:bg-golf-gold-400/20 text-sm font-medium"
            >
              <Navigation className="w-3.5 h-3.5" />
              Nearest to Me
            </button>
          </div>
        </div>
      )}

      {/* Price filter dropdown */}
      {showFilters && (
        <div className="flex gap-2 mb-4 p-3 bg-gray-50 rounded-lg animate-fade-in">
          <span className="text-sm text-gray-500 self-center">Price:</span>
          {[
            { value: 'all', label: 'Any' },
            { value: 'budget', label: 'Under $50' },
            { value: 'mid', label: '$50–$100' },
            { value: 'premium', label: '$100+' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPriceFilter(opt.value)}
              className={`px-3 py-1 rounded-full text-sm ${
                priceFilter === opt.value
                  ? 'bg-golf-green-700 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Map Container */}
      <div className="relative bg-gradient-to-br from-golf-green-50 to-green-50 rounded-2xl border border-golf-green-100 overflow-hidden">
        <div className={`relative ${compact ? 'h-[300px]' : 'h-[500px] md:h-[600px]'}`}>
          {/* Missouri Outline (simplified SVG) */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Simplified Missouri outline */}
            <path
              d="M 8,18 L 25,16 L 40,15 L 55,14 L 70,14 L 85,15 L 88,20 L 90,30 L 88,35 L 85,38 L 82,42 L 80,48 L 82,55 L 85,60 L 87,65 L 85,70 L 80,75 L 75,78 L 70,80 L 65,82 L 60,85 L 55,87 L 50,88 L 45,87 L 40,85 L 35,82 L 30,78 L 25,75 L 22,70 L 18,65 L 15,60 L 12,55 L 10,48 L 8,40 L 7,30 Z"
              fill="rgba(27,77,62,0.06)"
              stroke="rgba(27,77,62,0.2)"
              strokeWidth="0.5"
            />

            {/* Region labels */}
            {!compact && (Object.keys(regionPositions) as RegionKey[]).filter(k => k !== 'OTHER').map((key) => {
              const pos = regionPositions[key];
              return (
                <text
                  key={key}
                  x={pos.x}
                  y={pos.y - 5}
                  textAnchor="middle"
                  className="fill-golf-green-300 text-[2.5px] font-sans uppercase tracking-wider"
                >
                  {REGIONS[key].label}
                </text>
              );
            })}
          </svg>

          {/* Course Pins */}
          {filteredCourses.map((course) => {
            const pos = courseToPosition(course);
            const isSelected = selectedCourse?.courseId === course.courseId;
            return (
              <button
                key={course.courseId}
                onClick={() => handlePinClick(course)}
                className={`absolute transform -translate-x-1/2 -translate-y-full transition-all duration-200 group ${
                  isSelected ? 'z-20 scale-125' : 'z-10 hover:scale-110 hover:z-20'
                }`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                title={course.name}
              >
                <div className={`relative ${isSelected ? 'animate-bounce-subtle' : ''}`}>
                  <MapPin
                    className={`w-8 h-8 drop-shadow-md ${
                      isSelected
                        ? 'text-golf-gold-400 fill-golf-gold-400'
                        : 'text-golf-green-700 fill-golf-green-700 group-hover:text-golf-gold-400 group-hover:fill-golf-gold-400'
                    }`}
                  />
                  {!compact && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-[8px] font-bold text-golf-green-700 shadow-sm">
                      {course.rating.toFixed(1).split('.')[0]}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* User location pin */}
          {userLocation && (
            <div
              className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: '50%', top: '45%' }}
            >
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
            </div>
          )}
        </div>

        {/* Selected Course Popup */}
        {selectedCourse && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-30 animate-slide-up">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Course image placeholder */}
              <div className="h-32 bg-gradient-to-br from-golf-green-600 to-golf-green-800 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl opacity-30">⛳</span>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-display font-bold text-gray-900 text-lg">
                  {selectedCourse.name}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {REGIONS[selectedCourse.region].label}
                </p>

                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1 text-golf-gold-400">
                    <Star className="w-4 h-4 fill-current" />
                    {selectedCourse.rating}
                  </span>
                  {selectedCourse.nextAvailable && (
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      Next: {selectedCourse.nextAvailable}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-gray-500">
                    <DollarSign className="w-4 h-4" />
                    {selectedCourse.price}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/courses/${selectedCourse.courseId}`)}
                    className="btn-primary text-sm py-2 flex-1"
                  >
                    View Course
                  </button>
                  <button
                    onClick={() => navigate(`/book?course=${selectedCourse.courseId}`)}
                    className="btn-secondary text-sm py-2 flex-1"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course count */}
      <p className="text-sm text-gray-400 mt-2 text-center">
        Showing {filteredCourses.length} of {MOCK_COURSES.length} courses
      </p>
    </div>
  );
}
