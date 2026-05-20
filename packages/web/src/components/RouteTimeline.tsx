// ============================================================
// RouteTimeline — Vertical timeline showing trip schedule
// ============================================================

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

// ── Types ───────────────────────────────────────────────────

interface RouteWaypoint {
  order: number;
  type: string;
  name: string;
  address: string;
  arrivalTime?: string;
  departureTime?: string;
  teeTime?: string;
  bufferMinutes?: number;
  urgency: string;
}

interface RouteLeg {
  order: number;
  startName: string;
  endName: string;
  distanceMiles: number;
  durationMinutes: number;
  urgency: string;
  steps?: Array<{
    instruction: string;
    distanceMeters: number;
    durationSeconds: number;
  }>;
  interestingStops?: Array<{
    name: string;
    type: string;
    rating?: number;
    detourTimeMinutes?: number;
  }>;
}

interface RouteTimelineProps {
  waypoints: RouteWaypoint[];
  legs: RouteLeg[];
  suggestedDepartureTime?: string;
  totalDurationMinutes?: number;
  totalDistanceMiles?: number;
  onSuggestStop?: (legIndex: number) => void;
  className?: string;
}

// ── Icon Map ────────────────────────────────────────────────

const WAYPOINT_ICONS: Record<string, string> = {
  COURSE: '🏌️',
  HOTEL: '🏨',
  AIRPORT: '✈️',
  FOOD: '🍖',
  GAS: '⛽',
  START: '📍',
  END: '🏁',
  ATTRACTION: '🎯',
};

const URGENCY_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  RELAXED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', label: 'Plenty of time' },
  COMFORTABLE: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', label: 'On schedule' },
  TIGHT: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', label: 'Tight' },
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', label: 'Cutting it close!' },
};

// ── Component ───────────────────────────────────────────────

export function RouteTimeline({
  waypoints,
  legs,
  suggestedDepartureTime,
  totalDurationMinutes,
  totalDistanceMiles,
  onSuggestStop,
  className = '',
}: RouteTimelineProps) {
  const [expandedLegs, setExpandedLegs] = useState<Set<number>>(new Set());

  const toggleLeg = (index: number) => {
    setExpandedLegs(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className={`${className}`}>
      {/* Trip Summary */}
      <div className="bg-gray-900 text-white p-4 rounded-t-lg">
        <h3 className="font-display font-bold text-lg">Trip Schedule</h3>
        <div className="flex gap-4 mt-2 text-sm text-gray-300">
          {suggestedDepartureTime && (
            <span>🚗 Depart: <strong className="text-white">{suggestedDepartureTime}</strong></span>
          )}
          {totalDurationMinutes && (
            <span>⏱ {formatDuration(totalDurationMinutes)}</span>
          )}
          {totalDistanceMiles && (
            <span>📏 {totalDistanceMiles} mi</span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="border border-t-0 border-gray-200 rounded-b-lg bg-white">
        {waypoints.map((wp, wpIdx) => {
          const leg = legs.find(l => l.order === wpIdx);
          const isLast = wpIdx === waypoints.length - 1;
          const urgencyStyle = URGENCY_STYLES[wp.urgency] || URGENCY_STYLES.RELAXED;
          const isExpanded = expandedLegs.has(wpIdx);

          return (
            <div key={wpIdx}>
              {/* Waypoint */}
              <div className={`flex items-start gap-3 p-4 ${urgencyStyle.bg} border-b border-gray-100`}>
                {/* Timeline dot */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${urgencyStyle.border} bg-white`}>
                    {WAYPOINT_ICONS[wp.type] || '📍'}
                  </div>
                  {!isLast && (
                    <div className="w-0.5 h-6 bg-gray-300 mt-1" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 truncate">{wp.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{wp.address}</p>
                    </div>
                    {wp.urgency !== 'RELAXED' && wp.type === 'COURSE' && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${urgencyStyle.bg} ${urgencyStyle.text} border ${urgencyStyle.border} whitespace-nowrap`}>
                        {urgencyStyle.label}
                      </span>
                    )}
                  </div>

                  {/* Times */}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs">
                    {wp.arrivalTime && (
                      <span className="text-gray-600">
                        📍 Arrive <strong>{wp.arrivalTime}</strong>
                      </span>
                    )}
                    {wp.teeTime && (
                      <span className="text-golf-green-700">
                        🏌️ Tee Time <strong>{wp.teeTime}</strong>
                      </span>
                    )}
                    {wp.departureTime && (
                      <span className="text-gray-600">
                        🚗 Depart <strong>{wp.departureTime}</strong>
                      </span>
                    )}
                    {wp.bufferMinutes !== undefined && wp.type === 'COURSE' && (
                      <span className={`${urgencyStyle.text}`}>
                        ⏱ {wp.bufferMinutes} min buffer
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Drive Leg */}
              {leg && !isLast && (
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => toggleLeg(wpIdx)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 flex justify-center flex-shrink-0">
                      <div className="w-0.5 h-full bg-gray-200" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        🚗 {formatDuration(leg.durationMinutes)} · {leg.distanceMiles} mi
                      </span>
                      <div className="flex items-center gap-2">
                        {onSuggestStop && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onSuggestStop(wpIdx); }}
                            className="text-xs text-golf-green-600 hover:text-golf-green-700 flex items-center gap-1"
                          >
                            <Search className="w-3 h-3" />
                            Suggest a stop
                          </button>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-3 pl-[68px]">
                      {/* Turn-by-turn */}
                      {leg.steps && leg.steps.length > 0 && (
                        <div className="space-y-1 mb-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Directions</p>
                          {leg.steps.slice(0, 5).map((step, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                              <span className="text-gray-400 flex-shrink-0">{i + 1}.</span>
                              <span dangerouslySetInnerHTML={{ __html: step.instruction }} />
                            </div>
                          ))}
                          {leg.steps.length > 5 && (
                            <p className="text-xs text-gray-400">+ {leg.steps.length - 5} more steps</p>
                          )}
                        </div>
                      )}

                      {/* Interesting stops */}
                      {leg.interestingStops && leg.interestingStops.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nearby Stops</p>
                          {leg.interestingStops.map((stop, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-600 py-0.5">
                              <span>{getPoiIcon(stop.type)}</span>
                              <span>{stop.name}</span>
                              {stop.rating && <span className="text-amber-500">⭐ {stop.rating}</span>}
                              {stop.detourTimeMinutes && (
                                <span className="text-gray-400">+{stop.detourTimeMinutes} min detour</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getPoiIcon(type: string): string {
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

export default RouteTimeline;
