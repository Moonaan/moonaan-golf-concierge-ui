// ============================================================
// LoginPage — Login and Sign Up with golf theme
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Mic,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { DEMO_MODE } from '@/lib/mock-api';

type Mode = 'login' | 'signup' | 'forgot';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register, forgotPassword, isAuthenticated, isLoading, error, clearError, loginAsDemo } =
    useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/bookings', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  function switchMode(newMode: Mode) {
    setMode(newMode);
    setLocalError(null);
    setForgotSuccess(false);
    clearError();
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }
    try {
      setSubmitting(true);
      await login(email, password);
      navigate('/bookings', { replace: true });
    } catch {
      // Error is set by useAuth
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password || !firstName) {
      setLocalError('Please fill in all required fields');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      setSubmitting(true);
      const result = await register({
        email,
        password,
        firstName,
        lastName,
        phone: phone || undefined,
      });
      if (result.needsConfirmation) {
        setLocalError(null);
        switchMode('login');
        setLocalError('Account created! Please check your email to verify, then log in.');
      }
    } catch {
      // Error is set by useAuth
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (!email) {
      setLocalError('Please enter your email address');
      return;
    }
    try {
      setSubmitting(true);
      await forgotPassword(email);
      setForgotSuccess(true);
    } catch {
      // Error is set by useAuth
    } finally {
      setSubmitting(false);
    }
  }

  const displayError = localError || error;
  const isSubmitting = submitting || isLoading;

  return (
    <div className="min-h-[85vh] flex">
      {/* Left Panel — Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 30%, rgba(196,163,90,0.4) 0%, transparent 60%), radial-gradient(circle at 70% 80%, rgba(196,163,90,0.3) 0%, transparent 50%)',
            }}
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-golf-gold-400/20 rounded-full flex items-center justify-center">
              <Mic className="w-6 h-6 text-golf-gold-400" />
            </div>
            <span className="font-display text-2xl font-bold text-white">
              Golf Concierge
            </span>
          </div>

          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            One Voice.{' '}
            <span className="text-golf-gold-400">Every Course.</span>{' '}
            Zero Friction.
          </h2>
          <p className="text-green-200 text-lg max-w-md leading-relaxed">
            Book tee times across the Missouri Golf Trail with your voice or
            online. AI-powered, instant confirmation, zero hassle.
          </p>

          <div className="mt-12 space-y-4">
            {[
              'Voice-first booking with AI',
              '20+ premier Missouri courses',
              'Real-time availability & instant confirmation',
              'Smart course recommendations',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3 text-green-100">
                <div className="w-5 h-5 rounded-full bg-golf-gold-400/20 flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-3 h-3 text-golf-gold-400" />
                </div>
                <span className="text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-golf-green-700 rounded-full flex items-center justify-center">
              <Mic className="w-5 h-5 text-golf-gold-400" />
            </div>
            <span className="font-display text-xl font-bold text-golf-green-700">
              Golf Concierge
            </span>
          </div>

          {/* Demo Mode Banner */}
          {DEMO_MODE && (
            <div className="mb-6 p-4 bg-golf-green-50 border border-golf-green-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⛳</span>
                <span className="font-display font-bold text-golf-green-700">Demo Mode</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Explore the full Golf Concierge experience with realistic Missouri Golf Trail data.
              </p>
              <button
                onClick={() => {
                  loginAsDemo();
                  navigate('/', { replace: true });
                }}
                className="btn-primary w-full py-3 text-base"
              >
                🏌️ Continue as Demo User
              </button>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-500 mb-8">
                {DEMO_MODE ? 'Or sign in with your account' : 'Sign in to manage your tee times'}
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field pl-11"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field pl-11 pr-11"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-sm text-golf-green-600 hover:text-golf-green-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                {displayError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {displayError}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-golf-green-600 hover:text-golf-green-700 font-semibold"
                >
                  Create one
                </button>
              </p>
            </>
          )}

          {/* Signup Form */}
          {mode === 'signup' && (
            <>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </h1>
              <p className="text-gray-500 mb-8">
                Join thousands of golfers on the Missouri Trail
              </p>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="input-field pl-11"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field pl-11"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="input-field pl-11 pr-11"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field pl-11"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {displayError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {displayError}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-golf-green-600 hover:text-golf-green-700 font-semibold"
                >
                  Sign in
                </button>
              </p>
            </>
          )}

          {/* Forgot Password */}
          {mode === 'forgot' && (
            <>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
                Reset Password
              </h1>
              <p className="text-gray-500 mb-8">
                Enter your email and we&apos;ll send you a reset code
              </p>

              {forgotSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    We sent a password reset code to <strong>{email}</strong>. Check your inbox
                    and follow the instructions.
                  </p>
                  <button onClick={() => switchMode('login')} className="btn-primary">
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input-field pl-11"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {displayError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {displayError}
                    </div>
                  )}

                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Send Reset Code'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700 font-medium"
                  >
                    ← Back to Sign In
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
