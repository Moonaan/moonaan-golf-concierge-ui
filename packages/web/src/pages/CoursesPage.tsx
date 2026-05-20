// ============================================================
// CoursesPage — Filterable course grid
// ============================================================

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { SearchBar, type SearchParams } from '@/components/SearchBar';
import { CourseCard } from '@/components/CourseCard';
import { useCourses } from '@/hooks/useCourses';

const regions = [
  { value: '', label: 'All Regions' },
  { value: 'BRANSON', label: 'Branson' },
  { value: 'LAKE_OF_THE_OZARKS', label: 'Lake of the Ozarks' },
  { value: 'KANSAS_CITY', label: 'Kansas City' },
  { value: 'ST_LOUIS', label: 'St. Louis' },
  { value: 'SPRINGFIELD', label: 'Springfield' },
  { value: 'COLUMBIA', label: 'Columbia' },
  { value: 'JOPLIN', label: 'Joplin' },
];

const priceRanges = [
  { value: '', label: 'Any Price' },
  { value: '0-50', label: 'Under $50' },
  { value: '50-100', label: '$50–$100' },
  { value: '100-200', label: '$100–$200' },
  { value: '200-999', label: '$200+' },
];

const sortOptions = [
  { value: 'name', label: 'Name A–Z' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

export function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(
    searchParams.get('region') || '',
  );
  const [selectedPrice, setSelectedPrice] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('q') || '',
  );

  const { courses, isLoading, error } = useCourses(selectedRegion || undefined);

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.shortName.toLowerCase().includes(q) ||
          c.address.city.toLowerCase().includes(q) ||
          c.region.toLowerCase().replace(/_/g, ' ').includes(q),
      );
    }

    // Region filter
    if (selectedRegion) {
      result = result.filter((c) => c.region === selectedRegion);
    }

    // Price filter
    if (selectedPrice) {
      const [min, max] = selectedPrice.split('-').map(Number);
      result = result.filter(
        (c) =>
          c.pricing.weekday18.min >= min && c.pricing.weekday18.min <= max,
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.courseRating || 0) - (a.courseRating || 0);
        case 'price-low':
          return a.pricing.weekday18.min - b.pricing.weekday18.min;
        case 'price-high':
          return b.pricing.weekday18.min - a.pricing.weekday18.min;
        default:
          return 0;
      }
    });

    return result;
  }, [courses, searchQuery, selectedRegion, selectedPrice, sortBy]);

  function handleSearch(params: SearchParams) {
    setSearchQuery(params.course);
    const newParams = new URLSearchParams();
    if (params.course) newParams.set('q', params.course);
    if (params.date) newParams.set('date', params.date);
    setSearchParams(newParams);
  }

  function clearFilters() {
    setSelectedRegion('');
    setSelectedPrice('');
    setSearchQuery('');
    setSortBy('rating');
    setSearchParams({});
  }

  const activeFilterCount =
    (selectedRegion ? 1 : 0) + (selectedPrice ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className="py-8">
      <div className="page-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-heading">Courses</h1>
          <p className="mt-2 text-gray-500">
            Find your next round on the Missouri Golf Trail
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} compact initialValues={{ course: searchQuery }} />
        </div>

        {/* Filters bar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Region pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {regions.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setSelectedRegion(r.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedRegion === r.value
                      ? 'bg-golf-green-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* More filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                showFilters
                  ? 'bg-golf-green-100 text-golf-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 w-4 h-4 bg-golf-green-700 text-white rounded-full text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-red-500"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl flex flex-wrap gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                Price Range
              </label>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
              >
                {priceRanges.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-golf-green-700 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No courses found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your filters
            </p>
            <button onClick={clearFilters} className="btn-outline mt-4 text-sm">
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {filteredCourses.length} course{filteredCourses.length !== 1 && 's'} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.courseId} course={course} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
