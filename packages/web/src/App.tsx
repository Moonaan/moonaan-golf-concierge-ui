// ============================================================
// App — Chat-first Missouri Golf Trail Concierge
// ============================================================

import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext, useAuthProvider, useAuth } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/Toast';
import { ChatPage } from '@/pages/ChatPage';
import { LoginPage } from '@/pages/LoginPage';
import { ProfilePage } from '@/pages/ProfilePage';

// Legacy pages — accessible from hamburger menu
import { CoursesPage } from '@/pages/CoursesPage';
import { CourseDetailPage } from '@/pages/CourseDetailPage';
import { TrailMapPage } from '@/pages/TrailMapPage';
import { TripPlannerPage } from '@/pages/TripPlannerPage';
import { BookingFlowPage } from '@/pages/BookingFlowPage';
import { MyBookingsPage } from '@/pages/MyBookingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

import { DEMO_MODE } from '@/lib/mock-api';

import {
  Menu,
  X,
  User,
  Map,
  BookOpen,
  CalendarDays,
  MessageCircle,
  LogOut,
  LogIn,
} from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  // In demo mode, always allow access
  if (DEMO_MODE) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-golf-green-200 border-t-golf-green-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// ── Chat Layout — minimal header, full-height chat ──────────

function ChatLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const isChatRoute = location.pathname === '/';

  const menuItems = [
    { label: 'Chat', icon: MessageCircle, path: '/' },
    { label: 'Browse Courses', icon: BookOpen, path: '/courses' },
    { label: 'Trail Map', icon: Map, path: '/trail-map' },
    { label: 'Trip Planner', icon: CalendarDays, path: '/trip-planner' },
    ...(isAuthenticated
      ? [
          { label: 'My Bookings', icon: CalendarDays, path: '/bookings' },
          { label: 'Profile', icon: User, path: '/profile' },
        ]
      : []),
  ];

  return (
    <div className="h-[100dvh] flex flex-col bg-white">
      {/* Header — minimal */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 h-14 border-b border-gray-200 bg-white z-20">
        {/* Hamburger / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">⛳</span>
            <span className="font-display font-bold text-golf-green-700 text-lg hidden sm:block">
              MO Golf Trail
            </span>
          </Link>
        </div>

        {/* Profile icon / login */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full bg-golf-green-100 flex items-center justify-center
                         hover:bg-golf-green-200 transition-colors"
              aria-label="Profile"
            >
              <User className="w-4 h-4 text-golf-green-700" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                         text-golf-green-700 hover:bg-golf-green-50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Slide-out menu */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-30 animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />
          {/* Menu panel */}
          <div className="fixed top-0 left-0 h-full w-72 bg-white z-40 shadow-2xl animate-slide-in-left">
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xl">⛳</span>
                <span className="font-display font-bold text-golf-green-700">MO Golf Trail</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                      ${
                        isActive
                          ? 'bg-golf-green-50 text-golf-green-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}

              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 my-2" />
                  <button
                    onClick={async () => {
                      await logout();
                      setMenuOpen(false);
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium
                               text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              )}
            </nav>
          </div>
        </>
      )}

      {/* Main content */}
      <main className={`flex-1 min-h-0 ${isChatRoute ? '' : 'overflow-y-auto'}`}>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Legacy pages — still accessible */}
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/trail-map" element={<TrailMapPage />} />
          <Route path="/trip-planner" element={<TripPlannerPage />} />
          <Route
            path="/book"
            element={
              <ProtectedRoute>
                <BookingFlowPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export function App() {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      <ToastProvider>
        <ChatLayout />
      </ToastProvider>
    </AuthContext.Provider>
  );
}
