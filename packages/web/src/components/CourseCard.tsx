// ============================================================
// CourseCard — Course preview card with photo, info, pricing
// ============================================================

import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, DollarSign } from 'lucide-react';
import type { Course } from '@/lib/api';

interface CourseCardProps {
  course: Course;
  nextAvailableTime?: string;
}

// Placeholder images by region
const regionImages: Record<string, string> = {
  BRANSON: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=400&fit=crop',
  LAKE_OF_THE_OZARKS: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=400&fit=crop',
  KANSAS_CITY: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=600&h=400&fit=crop',
  ST_LOUIS: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=600&h=400&fit=crop',
  DEFAULT: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=400&fit=crop',
};

export function CourseCard({ course, nextAvailableTime }: CourseCardProps) {
  const imageUrl =
    course.imageUrls?.[0] ||
    regionImages[course.region] ||
    regionImages.DEFAULT;

  const priceMin = course.pricing.weekday18.min;
  const priceMax = course.pricing.weekend18.max;

  return (
    <Link to={`/courses/${course.courseId}`} className="card group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={course.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Region badge */}
        <div className="absolute top-3 left-3">
          <span className="badge bg-golf-green-700/90 text-white backdrop-blur-sm">
            {course.region.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Rating */}
        {course.courseRating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="w-3.5 h-3.5 text-golf-gold-400 fill-golf-gold-400" />
            <span className="text-xs font-semibold text-gray-800">
              {course.courseRating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Course name overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-display text-lg font-bold leading-tight">
            {course.name}
          </h3>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">
            {course.address.city}, {course.address.state}
          </span>
        </div>

        {/* Course stats */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">
            {course.holes} holes · Par {course.par}
          </span>
          {course.slopeRating && (
            <span className="text-gray-400">
              Slope {course.slopeRating}
            </span>
          )}
        </div>

        {/* Price + availability */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-golf-green-700 font-semibold">
            <DollarSign className="w-4 h-4" />
            <span>
              {priceMin}–{priceMax}
            </span>
          </div>

          {nextAvailableTime ? (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <Clock className="w-3.5 h-3.5" />
              <span>Next: {nextAvailableTime}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">Check availability</span>
          )}
        </div>
      </div>
    </Link>
  );
}
