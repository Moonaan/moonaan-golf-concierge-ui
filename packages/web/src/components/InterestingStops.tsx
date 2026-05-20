// ============================================================
// InterestingStops — Side panel showing POIs along the route
// Grouped by type: Eat, Fuel, See, Play
// ============================================================

import { useState } from 'react';
import { X, Plus, Star, Clock, MapPin, ChevronDown } from 'lucide-react';

// ── Types ───────────────────────────────────────────────────

interface PlaceOfInterest {
  placeId: string;
  name: string;
  address: string;
  location: { latitude: number; longitude: number };
  type: string;
  types: string[];
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  isOpen?: boolean;
  photoReference?: string;
  photoUrl?: string;
  detourTimeMinutes?: number;
  distanceFromRouteMeters?: number;
  website?: string;
  phone?: string;
}

interface InterestingStopsProps {
  stops: PlaceOfInterest[];
  onAddToTrip?: (stop: PlaceOfInterest) => void;
  onClose?: () => void;
  isOpen: boolean;
  className?: string;
}

// ── Category Config ─────────────────────────────────────────

interface Category {
  id: string;
  label: string;
  emoji: string;
  types: string[];
}

const CATEGORIES: Category[] = [
  { id: 'eat', label: 'Eat', emoji: '🍽️', types: ['restaurant', 'bbq_joint', 'brewery', 'winery', 'food'] },
  { id: 'fuel', label: 'Fuel', emoji: '⛽', types: ['gas_station'] },
  { id: 'see', label: 'See', emoji: '👀', types: ['tourist_attraction', 'state_park', 'scenic_overlook', 'park', 'museum'] },
  { id: 'play', label: 'Play', emoji: '🏌️', types: ['golf_course'] },
];

// ── Component ───────────────────────────────────────────────

export function InterestingStops({
  stops,
  onAddToTrip,
  onClose,
  isOpen,
  className = '',
}: InterestingStopsProps) {
  const [activeCategory, setActiveCategory] = useState<string>('eat');
  const [expandedStop, setExpandedStop] = useState<string | null>(null);

  if (!isOpen) return null;

  // Group stops by category
  const groupedStops = CATEGORIES.reduce<Record<string, PlaceOfInterest[]>>((acc, cat) => {
    acc[cat.id] = stops.filter(s =>
      cat.types.includes(s.type) ||
      s.types?.some(t => cat.types.includes(t)),
    );
    return acc;
  }, {});

  const activeStops = groupedStops[activeCategory] || [];

  return (
    <div className={`bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col max-h-[80vh] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-display font-bold text-gray-900">Points of Interest</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-gray-100">
        {CATEGORIES.map(cat => {
          const count = groupedStops[cat.id]?.length || 0;
          const isActive = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 py-2.5 px-2 text-center text-sm font-medium transition-colors relative
                ${isActive
                  ? 'text-golf-green-700 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <span className="text-lg">{cat.emoji}</span>
              <span className="block text-xs mt-0.5">{cat.label}</span>
              {count > 0 && (
                <span className={`absolute top-1 right-1 text-[10px] w-4 h-4 rounded-full flex items-center justify-center
                  ${isActive ? 'bg-golf-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {count}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-golf-green-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Stop List */}
      <div className="flex-1 overflow-y-auto">
        {activeStops.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <span className="text-3xl block mb-2">
              {CATEGORIES.find(c => c.id === activeCategory)?.emoji}
            </span>
            <p className="text-sm">No stops found in this category</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activeStops.map(stop => {
              const isExpanded = expandedStop === stop.placeId;
              return (
                <div
                  key={stop.placeId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <button
                    onClick={() => setExpandedStop(isExpanded ? null : stop.placeId)}
                    className="w-full text-left p-3 flex items-start gap-3"
                  >
                    {/* Photo or Icon */}
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-xl">
                      {getStopIcon(stop.type)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {stop.name}
                        </h4>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-300 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        {stop.rating && (
                          <span className="flex items-center gap-0.5 text-xs">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-gray-700 font-medium">{stop.rating}</span>
                            {stop.userRatingsTotal && (
                              <span className="text-gray-400">({formatCount(stop.userRatingsTotal)})</span>
                            )}
                          </span>
                        )}
                        {stop.priceLevel !== undefined && (
                          <span className="text-xs text-gray-400">
                            {'$'.repeat(stop.priceLevel + 1)}
                          </span>
                        )}
                        {stop.isOpen && (
                          <span className="text-xs text-green-600">Open</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        {stop.detourTimeMinutes !== undefined && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            +{stop.detourTimeMinutes} min
                          </span>
                        )}
                        {stop.distanceFromRouteMeters !== undefined && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            {(stop.distanceFromRouteMeters / 1609.344).toFixed(1)} mi off route
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pl-[60px]">
                      <p className="text-xs text-gray-500 mb-2">{stop.address}</p>

                      <div className="flex items-center gap-2">
                        {onAddToTrip && (
                          <button
                            onClick={() => onAddToTrip(stop)}
                            className="flex items-center gap-1 text-xs bg-golf-green-600 text-white px-3 py-1.5 rounded-md hover:bg-golf-green-700 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Add to trip
                          </button>
                        )}
                        {stop.website && (
                          <a
                            href={stop.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-golf-green-600 hover:underline"
                          >
                            Website ↗
                          </a>
                        )}
                        {stop.phone && (
                          <a
                            href={`tel:${stop.phone}`}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            📞 {stop.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────

function getStopIcon(type: string): string {
  const icons: Record<string, string> = {
    restaurant: '🍴',
    bbq_joint: '🍖',
    brewery: '🍺',
    winery: '🍷',
    gas_station: '⛽',
    golf_course: '⛳',
    tourist_attraction: '🎯',
    state_park: '🌲',
    scenic_overlook: '🏔️',
    lodging: '🏨',
  };
  return icons[type] || '📍';
}

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

export default InterestingStops;
