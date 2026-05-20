// ============================================================
// HotelOptionCard — Hotel option card in chat
// ============================================================

import { Star, MapPin } from 'lucide-react';
import type { HotelOption } from '@/types/chat';

interface HotelOptionCardProps {
  hotel: HotelOption;
  onBook: () => void;
}

export function HotelOptionCard({ hotel, onBook }: HotelOptionCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Hotel image placeholder */}
      {hotel.imageUrl ? (
        <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-24 object-cover" />
      ) : (
        <div className="w-full h-24 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
          <span className="text-3xl">🏨</span>
        </div>
      )}

      <div className="p-3">
        {/* Name & rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-[15px] leading-tight">
            {hotel.name}
          </h3>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Star className="w-3.5 h-3.5 fill-golf-gold-400 text-golf-gold-400" />
            <span className="text-xs font-medium text-gray-600">{hotel.rating}</span>
          </div>
        </div>

        {/* Distance */}
        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
          <MapPin className="w-3.5 h-3.5" />
          {hotel.distanceToCourse} to course
        </div>

        {/* Amenities */}
        {hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {hotel.amenities.map((amenity) => (
              <span
                key={amenity}
                className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        {/* Price & book */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-xl font-bold text-gray-900">${hotel.pricePerNight}</span>
            <span className="text-sm text-gray-500">/night</span>
          </div>
          <button
            onClick={onBook}
            className="px-5 py-2 rounded-lg bg-golf-green-700 text-white text-sm font-semibold
                       hover:bg-golf-green-600 active:bg-golf-green-800 transition-all
                       min-h-[44px] min-w-[44px]"
          >
            Book Hotel
          </button>
        </div>
      </div>
    </div>
  );
}
