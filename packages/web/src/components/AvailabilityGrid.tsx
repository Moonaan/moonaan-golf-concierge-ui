// ============================================================
// AvailabilityGrid — Time slots grid with color coding
// ============================================================

import { Clock, Users } from 'lucide-react';
import type { TeeTime } from '@/lib/api';

interface AvailabilityGridProps {
  teeTimes: TeeTime[];
  selectedTime?: string;
  onSelect: (teeTime: TeeTime) => void;
  isLoading?: boolean;
}

function getAvailabilityStatus(teeTime: TeeTime) {
  const ratio = teeTime.availableSpots / teeTime.totalSpots;
  if (ratio === 0) return 'full';
  if (ratio <= 0.25) return 'limited';
  return 'available';
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

function getTimePeriod(time: string): string {
  const hour = parseInt(time.split(':')[0], 10);
  if (hour < 10) return 'Early Morning';
  if (hour < 12) return 'Morning';
  if (hour < 15) return 'Afternoon';
  if (hour < 17) return 'Late Afternoon';
  return 'Twilight';
}

export function AvailabilityGrid({
  teeTimes,
  selectedTime,
  onSelect,
  isLoading,
}: AvailabilityGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-lg bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (teeTimes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="font-medium">No tee times available</p>
        <p className="text-sm mt-1">Try a different date or course</p>
      </div>
    );
  }

  // Group by time period
  const grouped = teeTimes.reduce(
    (acc, tt) => {
      const period = getTimePeriod(tt.time);
      if (!acc[period]) acc[period] = [];
      acc[period].push(tt);
      return acc;
    },
    {} as Record<string, TeeTime[]>,
  );

  const periodOrder = [
    'Early Morning',
    'Morning',
    'Afternoon',
    'Late Afternoon',
    'Twilight',
  ];

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Limited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <span>Full</span>
        </div>
      </div>

      {/* Time periods */}
      {periodOrder.map((period) => {
        const times = grouped[period];
        if (!times?.length) return null;

        return (
          <div key={period}>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {period}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {times.map((tt) => {
                const status = getAvailabilityStatus(tt);
                const isSelected = selectedTime === tt.time;
                const isFull = status === 'full';

                return (
                  <button
                    key={`${tt.time}-${tt.holes}`}
                    onClick={() => !isFull && onSelect(tt)}
                    disabled={isFull}
                    className={`
                      relative p-3 rounded-lg border-2 text-left transition-all duration-200
                      ${
                        isSelected
                          ? 'border-golf-green-700 bg-golf-green-50 ring-2 ring-golf-green-500/20'
                          : isFull
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : status === 'limited'
                              ? 'border-yellow-200 bg-yellow-50/50 hover:border-yellow-400 cursor-pointer'
                              : 'border-gray-200 bg-white hover:border-golf-green-400 cursor-pointer'
                      }
                    `}
                  >
                    {/* Status indicator */}
                    <div
                      className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                        status === 'available'
                          ? 'bg-green-500'
                          : status === 'limited'
                            ? 'bg-yellow-500'
                            : 'bg-red-400'
                      }`}
                    />

                    <div className="font-semibold text-gray-900">
                      {formatTime(tt.time)}
                    </div>

                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>
                          {tt.availableSpots}/{tt.totalSpots}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-golf-green-700">
                        ${tt.price}
                      </span>
                    </div>

                    {tt.cartIncluded && (
                      <span className="text-[10px] text-gray-400 mt-0.5 block">
                        Cart included
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
