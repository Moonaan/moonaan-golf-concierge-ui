// ============================================================
// TripItineraryCard — Collapsible multi-day trip plan
// ============================================================

import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Clock, Hotel } from 'lucide-react';
import type { TripItinerary } from '@/types/chat';

interface TripItineraryCardProps {
  trip: TripItinerary;
  onBookAll: () => void;
  onModify: () => void;
}

export function TripItineraryCard({ trip, onBookAll, onModify }: TripItineraryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-golf-green-700 text-white"
      >
        <div className="text-left">
          <h3 className="font-semibold text-base">{trip.title}</h3>
          <p className="text-golf-green-200 text-sm mt-0.5">
            {trip.days.length} days · {trip.players} players
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 flex-shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {/* Hotel info */}
          <div className="px-4 py-3 bg-golf-sand/50 flex items-center gap-3">
            <Hotel className="w-4 h-4 text-golf-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{trip.hotel.name}</p>
              <p className="text-xs text-gray-500">
                ${trip.hotel.pricePerNight}/night · {trip.hotel.distanceToCourse}
              </p>
            </div>
          </div>

          {/* Days */}
          {trip.days.map((day) => (
            <div key={day.date} className="px-4 py-3">
              <p className="text-xs font-semibold text-golf-green-600 uppercase tracking-wide">
                {day.dayLabel}
              </p>
              <div className="flex items-center justify-between mt-1.5">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{day.courseName}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {day.teeTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {day.driveTimeFromHotel} drive
                    </span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                  ${day.cost}
                </span>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="px-4 py-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total per person</span>
              <span className="text-lg font-bold text-gray-900">${trip.totalPerPerson}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-4 py-3 flex gap-2">
            <button
              onClick={onBookAll}
              className="flex-1 py-2.5 rounded-lg bg-golf-green-700 text-white text-sm font-semibold
                         hover:bg-golf-green-600 active:bg-golf-green-800 transition-all
                         min-h-[44px]"
            >
              Book Everything
            </button>
            <button
              onClick={onModify}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium
                         hover:bg-gray-50 active:bg-gray-100 transition-all
                         min-h-[44px]"
            >
              Modify
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
