// ============================================================
// CourseOptionCard — Inline course tee time card in chat
// ============================================================

import { Star, ShoppingCart, Footprints } from 'lucide-react';
import type { CourseOption } from '@/types/chat';

interface CourseOptionCardProps {
  course: CourseOption;
  onBook: () => void;
}

export function CourseOptionCard({ course, onBook }: CourseOptionCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Course image placeholder */}
      {course.imageUrl ? (
        <img
          src={course.imageUrl}
          alt={course.name}
          className="w-full h-28 object-cover"
        />
      ) : (
        <div className="w-full h-28 bg-gradient-to-br from-golf-green-600 to-golf-green-800 flex items-center justify-center">
          <span className="text-3xl">⛳</span>
        </div>
      )}

      <div className="p-3">
        {/* Course name & rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-[15px] leading-tight">
            {course.name}
          </h3>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Star className="w-3.5 h-3.5 fill-golf-gold-400 text-golf-gold-400" />
            <span className="text-xs font-medium text-gray-600">{course.rating}</span>
          </div>
        </div>

        {/* Highlight tag */}
        {course.highlight && (
          <p className="text-xs text-golf-green-600 font-medium mt-1">
            ✨ {course.highlight}
          </p>
        )}

        {/* Time, date, cart info */}
        <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
          <span className="font-medium">{course.time}</span>
          <span className="text-gray-300">|</span>
          <span>{course.date}</span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1">
            {course.cartIncluded ? (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="text-xs">Cart incl.</span>
              </>
            ) : (
              <>
                <Footprints className="w-3.5 h-3.5" />
                <span className="text-xs">Walking</span>
              </>
            )}
          </span>
        </div>

        {/* Price & book button */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-gray-900">${course.price}</span>
          <button
            onClick={onBook}
            className="px-5 py-2 rounded-lg bg-golf-green-700 text-white text-sm font-semibold
                       hover:bg-golf-green-600 active:bg-golf-green-800 transition-all
                       min-h-[44px] min-w-[44px]"
          >
            Book This
          </button>
        </div>
      </div>
    </div>
  );
}
