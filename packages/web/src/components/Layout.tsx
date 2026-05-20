// ============================================================
// Layout — Header nav + main content + footer
// ============================================================

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Calendar, MapPin, Mic, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { VoiceStatus } from './VoiceStatus';

const navLinks = [
  { to: '/', label: 'Home', icon: null },
  { to: '/courses', label: 'Courses', icon: MapPin },
  { to: '/trail-map', label: 'Trail Map', icon: MapPin },
  { to: '/trip-planner', label: 'Plan a Trip', icon: Calendar },
  { to: '/bookings', label: 'My Bookings', icon: Calendar },
  { to: '/profile', label: 'Profile', icon: User },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass border-b border-gray-200">
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-golf-green-700 rounded-full flex items-center justify-center">
                <Mic className="w-4 h-4 text-golf-gold-400" />
              </div>
              <span className="font-display text-xl font-bold text-golf-green-700">
                Golf Concierge
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-golf-green-700 text-white'
                      : 'text-gray-600 hover:text-golf-green-700 hover:bg-golf-green-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <VoiceStatus />

              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {user?.firstName || user?.email}
                  </span>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="hidden md:block btn-primary text-sm py-2">
                  Sign In
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive(link.to)
                      ? 'bg-golf-green-700 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              ))}
              <hr className="my-2" />
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center btn-primary w-full"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content ──────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="bg-golf-green-950 text-gray-400">
        <div className="page-container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-golf-gold-400 rounded-full flex items-center justify-center">
                  <Mic className="w-4 h-4 text-golf-green-700" />
                </div>
                <span className="font-display text-xl font-bold text-white">
                  Golf Concierge
                </span>
              </div>
              <p className="text-sm leading-relaxed max-w-md">
                One Voice. Every Course. Zero Friction. AI-powered golf booking
                for the Missouri Golf Trail. Book tee times with your voice or
                online across 20+ premier courses.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/courses" className="hover:text-white transition-colors">Browse Courses</Link></li>
                <li><Link to="/bookings" className="hover:text-white transition-colors">My Bookings</Link></li>
                <li><Link to="/profile" className="hover:text-white transition-colors">Profile</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
                Regions
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/courses?region=BRANSON" className="hover:text-white transition-colors">Branson</Link></li>
                <li><Link to="/courses?region=LAKE_OF_THE_OZARKS" className="hover:text-white transition-colors">Lake of the Ozarks</Link></li>
                <li><Link to="/courses?region=KANSAS_CITY" className="hover:text-white transition-colors">Kansas City</Link></li>
                <li><Link to="/courses?region=ST_LOUIS" className="hover:text-white transition-colors">St. Louis</Link></li>
                <li><Link to="/courses?region=SPRINGFIELD" className="hover:text-white transition-colors">Springfield</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs">
              © {new Date().getFullYear()} Golf Concierge — Missouri Golf Trail. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <span className="text-golf-gold-400/60 flex items-center gap-1">
                <Mic className="w-3 h-3" /> Powered by AI
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
