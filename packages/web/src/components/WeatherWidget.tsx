// ============================================================
// WeatherWidget — Current conditions + forecast
// ============================================================

import { useState, useEffect } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  Eye,
} from 'lucide-react';
import { weatherApi, type WeatherData } from '@/lib/api';
import { DEMO_MODE, mockGetWeather } from '@/lib/mock-api';

interface WeatherWidgetProps {
  courseId: string;
  date?: string;
  compact?: boolean;
}

const conditionIcons: Record<string, React.ElementType> = {
  sunny: Sun,
  clear: Sun,
  cloudy: Cloud,
  'partly cloudy': Cloud,
  overcast: Cloud,
  rain: CloudRain,
  drizzle: CloudRain,
  snow: CloudSnow,
  thunderstorm: CloudLightning,
  storm: CloudLightning,
};

function getConditionIcon(condition: string) {
  const lower = condition.toLowerCase();
  for (const [key, Icon] of Object.entries(conditionIcons)) {
    if (lower.includes(key)) return Icon;
  }
  return Sun;
}

function getGolfabilityLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: 'text-green-600' };
  if (score >= 60) return { label: 'Good', color: 'text-green-500' };
  if (score >= 40) return { label: 'Fair', color: 'text-yellow-600' };
  if (score >= 20) return { label: 'Poor', color: 'text-orange-500' };
  return { label: 'Stay Home', color: 'text-red-600' };
}

export function WeatherWidget({
  courseId,
  date,
  compact = false,
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setIsLoading(true);
        const data = DEMO_MODE ? await mockGetWeather(courseId, date) : await weatherApi.get(courseId, date);
        setWeather(data);
      } catch {
        setError('Weather unavailable');
      } finally {
        setIsLoading(false);
      }
    }

    fetchWeather();
  }, [courseId, date]);

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-4">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-8 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
        {error || 'Weather data unavailable'}
      </div>
    );
  }

  const ConditionIcon = getConditionIcon(weather.current.condition);
  const golfability = getGolfabilityLabel(weather.golfability);

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-3">
        <ConditionIcon className="w-8 h-8 text-sky-500" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{weather.current.temp}°F</span>
            <span className="text-sm text-gray-500">
              {weather.current.condition}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-0.5">
              <Wind className="w-3 h-3" /> {weather.current.windSpeed} mph
            </span>
            <span className={`font-medium ${golfability.color}`}>
              Golf: {golfability.label}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-sky-100">{weather.location}</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-4xl font-bold">
                {weather.current.temp}°
              </span>
              <span className="text-sky-100 pb-1">
                Feels like {weather.current.feelsLike}°
              </span>
            </div>
            <p className="text-sm mt-1">{weather.current.condition}</p>
          </div>
          <ConditionIcon className="w-16 h-16 text-white/80" />
        </div>
      </div>

      {/* Golfability Score */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            Golf Playability
          </span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  weather.golfability >= 60
                    ? 'bg-green-500'
                    : weather.golfability >= 40
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${weather.golfability}%` }}
              />
            </div>
            <span className={`text-sm font-bold ${golfability.color}`}>
              {weather.golfability}/100
            </span>
          </div>
        </div>
      </div>

      {/* Current conditions detail */}
      <div className="grid grid-cols-2 gap-3 p-4">
        <div className="flex items-center gap-2 text-sm">
          <Wind className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            {weather.current.windSpeed} mph {weather.current.windDirection}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Droplets className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            {weather.current.humidity}% humidity
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Eye className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">UV {weather.current.uvIndex}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Thermometer className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            Feels {weather.current.feelsLike}°F
          </span>
        </div>
      </div>

      {/* 5-day forecast */}
      {weather.forecast.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Forecast
          </h4>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {weather.forecast.slice(0, 5).map((day) => {
              const DayIcon = getConditionIcon(day.condition);
              const dayName = new Date(day.date + 'T00:00:00').toLocaleDateString(
                'en-US',
                { weekday: 'short' },
              );
              return (
                <div
                  key={day.date}
                  className="flex-shrink-0 text-center p-2 rounded-lg hover:bg-gray-50 min-w-[60px]"
                >
                  <p className="text-xs text-gray-500">{dayName}</p>
                  <DayIcon className="w-5 h-5 mx-auto my-1 text-gray-600" />
                  <p className="text-xs">
                    <span className="font-semibold">{day.high}°</span>
                    <span className="text-gray-400 ml-1">{day.low}°</span>
                  </p>
                  {day.precipitation > 0 && (
                    <p className="text-[10px] text-blue-500">
                      {day.precipitation}%
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
