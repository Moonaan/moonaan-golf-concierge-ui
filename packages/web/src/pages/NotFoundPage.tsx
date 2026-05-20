// ============================================================
// NotFoundPage — Golf-themed 404
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/courses?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16">
      <div className="page-container text-center max-w-lg">
        {/* Golf illustration */}
        <div className="relative inline-block mb-8">
          <div className="text-8xl md:text-9xl font-display font-bold text-golf-green-100 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Trees */}
              <span className="absolute -left-12 bottom-0 text-4xl">🌲</span>
              <span className="absolute -right-10 bottom-2 text-3xl">🌳</span>
              {/* Golf ball in rough */}
              <span className="text-5xl">⛳</span>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-2xl">🏌️</span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold text-golf-green-700 mb-3">
          Looks like your ball went OB
        </h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The page you're looking for has gone out of bounds. 
          Let's get you back on the fairway.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-sm mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a course..."
              className="input-field pl-10 pr-4"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-outline flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button onClick={() => navigate('/')} className="btn-primary flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            Back to Fairway
          </button>
        </div>
      </div>
    </div>
  );
}
