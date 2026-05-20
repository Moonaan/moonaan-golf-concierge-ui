// ============================================================
// SearchBar — Course/date/time/party size search inputs
// ============================================================

import { useState } from 'react';
import { Search, MapPin, Calendar, Clock, Users } from 'lucide-react';

export interface SearchParams {
  course: string;
  date: string;
  time: string;
  partySize: number;
}

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  compact?: boolean;
  initialValues?: Partial<SearchParams>;
}

const defaultDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export function SearchBar({
  onSearch,
  compact = false,
  initialValues,
}: SearchBarProps) {
  const [params, setParams] = useState<SearchParams>({
    course: initialValues?.course || '',
    date: initialValues?.date || defaultDate(),
    time: initialValues?.time || '',
    partySize: initialValues?.partySize || 4,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(params);
  }

  function update(field: keyof SearchParams, value: string | number) {
    setParams((prev) => ({ ...prev, [field]: value }));
  }

  if (compact) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2 w-full"
      >
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Course or region..."
            value={params.course}
            onChange={(e) => update('course', e.target.value)}
            className="input-field pl-10 text-sm py-2.5"
          />
        </div>
        <input
          type="date"
          value={params.date}
          onChange={(e) => update('date', e.target.value)}
          className="input-field text-sm py-2.5 w-full sm:w-40"
        />
        <button type="submit" className="btn-primary py-2.5 px-4 text-sm">
          <Search className="w-4 h-4" />
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl border border-gray-200 p-2"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {/* Course */}
        <div className="md:col-span-2 relative">
          <label className="absolute left-3 top-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Course
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 bottom-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={params.course}
              onChange={(e) => update('course', e.target.value)}
              className="w-full pl-10 pr-3 pt-7 pb-2.5 rounded-xl border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-golf-green-500/20 transition-all outline-none text-sm"
            />
          </div>
        </div>

        {/* Date */}
        <div className="relative">
          <label className="absolute left-3 top-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider z-10">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 bottom-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={params.date}
              onChange={(e) => update('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-3 pt-7 pb-2.5 rounded-xl border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-golf-green-500/20 transition-all outline-none text-sm"
            />
          </div>
        </div>

        {/* Time */}
        <div className="relative">
          <label className="absolute left-3 top-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider z-10">
            Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 bottom-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={params.time}
              onChange={(e) => update('time', e.target.value)}
              className="w-full pl-10 pr-3 pt-7 pb-2.5 rounded-xl border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-golf-green-500/20 transition-all outline-none text-sm appearance-none"
            >
              <option value="">Any Time</option>
              <option value="early">Early (6-8 AM)</option>
              <option value="morning">Morning (8-11 AM)</option>
              <option value="midday">Midday (11 AM-1 PM)</option>
              <option value="afternoon">Afternoon (1-4 PM)</option>
              <option value="twilight">Twilight (4+ PM)</option>
            </select>
          </div>
        </div>

        {/* Party size + submit */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <label className="absolute left-3 top-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider z-10">
              Players
            </label>
            <div className="relative">
              <Users className="absolute left-3 bottom-3 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={params.partySize}
                onChange={(e) => update('partySize', parseInt(e.target.value))}
                className="w-full pl-10 pr-3 pt-7 pb-2.5 rounded-xl border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-golf-green-500/20 transition-all outline-none text-sm appearance-none"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="self-end btn-primary rounded-xl px-5 py-3.5"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </form>
  );
}
