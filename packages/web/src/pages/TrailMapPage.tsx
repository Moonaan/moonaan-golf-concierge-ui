// ============================================================
// TrailMapPage — Missouri Golf Trail map with course grid by region
// ============================================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Star, ArrowRight, MapPin, SlidersHorizontal } from 'lucide-react';
import { useCourses } from '@/hooks/useCourses';

const REGION_DISPLAY: Record<string, { label: string; color: string; emoji: string }> = {
  BRANSON: { label: 'Branson', color: 'bg-green-100 text-green-800', emoji: '🏔️' },
  LAKE_OF_THE_OZARKS: { label: 'Lake of the Ozarks', color: 'bg-blue-100 text-blue-800', emoji: '🌊' },
  KANSAS_CITY: { label: 'Kansas City', color: 'bg-purple-100 text-purple-800', emoji: '🏙️' },
  ST_LOUIS: { label: 'St. Louis', color: 'bg-red-100 text-red-800', emoji: '🏛️' },
  SPRINGFIELD: { label: 'Springfield', color: 'bg-orange-100 text-orange-800', emoji: '🌻' },
  COLUMBIA: { label: 'Columbia', color: 'bg-yellow-100 text-yellow-800', emoji: '🐯' },
  OTHER: { label: 'Other Regions', color: 'bg-gray-100 text-gray-800', emoji: '⛳' },
};

export function TrailMapPage() {
  const navigate = useNavigate();
  const { courses } = useCourses();
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'name'>('rating');
  const [filterRegion, setFilterRegion] = useState<string | null>(null);

  const coursesByRegion = useMemo(() => {
    const grouped: Record<string, typeof courses> = {};
    for (const course of courses) {
      const region = course.region || 'OTHER';
      if (!grouped[region]) grouped[region] = [];
      grouped[region].push(course);
    }
    // Sort within each group
    for (const key of Object.keys(grouped)) {
      grouped[key].sort((a, b) => {
        if (sortBy === 'rating') return (b.courseRating || 0) - (a.courseRating || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return a.pricing.weekday18.min - b.pricing.weekday18.min;
      });
    }
    return grouped;
  }, [courses, sortBy]);

  const regionKeys = useMemo(() => {
    const keys = Object.keys(coursesByRegion);
    if (filterRegion) return keys.filter((k) => k === filterRegion);
    return keys.sort((a, b) => {
      const order = ['BRANSON', 'LAKE_OF_THE_OZARKS', 'KANSAS_CITY', 'ST_LOUIS', 'SPRINGFIELD', 'COLUMBIA', 'OTHER'];
      return order.indexOf(a) - order.indexOf(b);
    });
  }, [coursesByRegion, filterRegion]);

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const course of courses) {
      const r = course.region || 'OTHER';
      counts[r] = (counts[r] || 0) + 1;
    }
    return counts;
  }, [courses]);

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-golf-green-700 to-golf-green-950 text-white py-10">
        <div className="page-container flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold flex items-center gap-3">
              <Map className="w-8 h-8 text-golf-gold-400" />
              Missouri Golf Trail Map
            </h1>
            <p className="mt-2 text-green-200">
              {courses.length} courses across {Object.keys(regionCounts).length} regions
            </p>
          </div>
          <button
            onClick={() => navigate('/trip-planner')}
            className="btn-secondary flex items-center gap-2"
          >
            Plan a Trip
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <section className="py-8">
        <div className="page-container">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className="text-sm font-medium text-gray-500">Filter by region:</span>
            <button
              onClick={() => setFilterRegion(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !filterRegion ? 'bg-golf-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({courses.length})
            </button>
            {Object.entries(regionCounts)
              .sort(([a], [b]) => {
                const order = ['BRANSON', 'LAKE_OF_THE_OZARKS', 'KANSAS_CITY', 'ST_LOUIS', 'SPRINGFIELD', 'COLUMBIA', 'OTHER'];
                return order.indexOf(a) - order.indexOf(b);
              })
              .map(([region, count]) => {
                const display = REGION_DISPLAY[region] || REGION_DISPLAY.OTHER;
                return (
                  <button
                    key={region}
                    onClick={() => setFilterRegion(filterRegion === region ? null : region)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filterRegion === region ? 'bg-golf-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {display.emoji} {display.label} ({count})
                  </button>
                );
              })}

            <div className="ml-auto flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">Sort:</span>
              {(['rating', 'price', 'name'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    sortBy === s
                      ? 'bg-golf-green-100 text-golf-green-700'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Course Grid by Region */}
          <div className="space-y-10">
            {regionKeys.map((regionKey) => {
              const display = REGION_DISPLAY[regionKey] || REGION_DISPLAY.OTHER;
              const regionCourses = coursesByRegion[regionKey];

              return (
                <div key={regionKey}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{display.emoji}</span>
                    <h2 className="text-xl font-display font-bold text-gray-900">{display.label}</h2>
                    <span className="text-sm text-gray-400">({regionCourses.length} courses)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {regionCourses.map((course) => (
                      <button
                        key={course.courseId}
                        onClick={() => navigate(`/courses/${course.courseId}`)}
                        className="text-left p-4 rounded-xl border border-gray-200 hover:border-golf-green-300 hover:shadow-md transition-all group bg-white"
                      >
                        {/* Image */}
                        <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                          <img
                            src={course.imageUrls?.[0] || 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=400&fit=crop'}
                            alt={course.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          {course.courseRating && (
                            <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-white/90 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                              <Star className="w-3 h-3 text-golf-gold-400 fill-golf-gold-400" />
                              <span className="text-xs font-semibold text-gray-800">{course.courseRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        <h3 className="font-semibold text-gray-900 group-hover:text-golf-green-700 transition-colors">
                          {course.name}
                        </h3>

                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {course.address.city}, {course.address.state}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <span className="text-sm text-gray-500">
                            {course.holes}H · Par {course.par}
                            {course.slopeRating && ` · ${course.slopeRating} slope`}
                          </span>
                          <span className="text-sm font-bold text-golf-green-700">
                            ${course.pricing.weekday18.min}–${course.pricing.weekend18.max}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
