// ============================================================
// ProfilePage — User profile with preferences and partners
// ============================================================

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Hash,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  CreditCard,
  Settings,
  Users,
  Heart,
  ShoppingCart,
  Footprints,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { profileApi, type UserProfile } from '@/lib/api';
import { DEMO_MODE, mockGetProfile, mockUpdateProfile } from '@/lib/mock-api';

interface PlayingPartner {
  name: string;
  email: string;
  handicap?: number;
}

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [ghinNumber, setGhinNumber] = useState('');

  // Preferences
  const [pacePreference, setPacePreference] = useState('normal');
  const [cartPreference, setCartPreference] = useState('cart');
  const [defaultPartySize, setDefaultPartySize] = useState(2);
  const [defaultHoles, setDefaultHoles] = useState(18);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);

  // Playing Partners
  const [partners, setPartners] = useState<PlayingPartner[]>([]);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerEmail, setNewPartnerEmail] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const data = DEMO_MODE ? await mockGetProfile() : await profileApi.get();
        setProfile(data);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setPhone(data.phone || '');
        setGhinNumber(data.ghinNumber || '');
        setPacePreference(data.preferences.pacePreference || 'normal');
        setCartPreference(data.preferences.cartPreference || 'cart');
        setDefaultPartySize(data.preferences.defaultPartySize || 2);
        setDefaultHoles(data.preferences.defaultHoles || 18);
        setEmailNotifs(data.preferences.notifications?.email ?? true);
        setSmsNotifs(data.preferences.notifications?.sms ?? false);
      } catch {
        // Use auth user data as fallback
        setFirstName(user?.firstName || '');
        setLastName(user?.lastName || '');
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  async function handleSave() {
    try {
      setIsSaving(true);
      setError(null);
      const updateFn = DEMO_MODE ? mockUpdateProfile : profileApi.update;
      await updateFn({
        firstName,
        lastName,
        phone,
        ghinNumber,
        preferences: {
          pacePreference,
          cartPreference,
          defaultPartySize,
          defaultHoles,
          notifications: { email: emailNotifs, sms: smsNotifs, push: false },
          favoriteCoursesIds: profile?.preferences.favoriteCoursesIds || [],
        },
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : '') || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  }

  function addPartner() {
    if (!newPartnerName.trim()) return;
    setPartners((prev) => [
      ...prev,
      { name: newPartnerName.trim(), email: newPartnerEmail.trim() },
    ]);
    setNewPartnerName('');
    setNewPartnerEmail('');
  }

  function removePartner(index: number) {
    setPartners((prev) => prev.filter((_, i) => i !== index));
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-golf-green-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      {/* Header */}
      <div className="bg-hero-gradient text-white py-10">
        <div className="page-container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-golf-gold-400/20 border-2 border-golf-gold-400 flex items-center justify-center">
                <span className="text-2xl font-bold text-golf-gold-400">
                  {(firstName || user?.email || '?').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                  {firstName} {lastName}
                </h1>
                <p className="text-green-200 text-sm">{user?.email}</p>
              </div>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-golf-gold-400 text-golf-green-700 text-sm font-bold hover:bg-golf-gold-300 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="page-container py-8 -mt-4">
        {/* Success banner */}
        {saveSuccess && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Profile updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
            <X className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="card border border-gray-200 p-6">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-golf-green-700 mb-6">
                <User className="w-5 h-5" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="input-field"
                    />
                  ) : (
                    <p className="py-3 px-4 bg-gray-50 rounded-lg text-gray-900">{firstName || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="input-field"
                    />
                  ) : (
                    <p className="py-3 px-4 bg-gray-50 rounded-lg text-gray-900">{lastName || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    <Mail className="w-3.5 h-3.5 inline mr-1" />
                    Email
                  </label>
                  <p className="py-3 px-4 bg-gray-50 rounded-lg text-gray-900">{user?.email || '—'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    <Phone className="w-3.5 h-3.5 inline mr-1" />
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="input-field"
                    />
                  ) : (
                    <p className="py-3 px-4 bg-gray-50 rounded-lg text-gray-900">{phone || '—'}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    <Hash className="w-3.5 h-3.5 inline mr-1" />
                    GHIN Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={ghinNumber}
                      onChange={(e) => setGhinNumber(e.target.value)}
                      placeholder="1234567"
                      className="input-field max-w-xs"
                    />
                  ) : (
                    <p className="py-3 px-4 bg-gray-50 rounded-lg text-gray-900 max-w-xs">
                      {ghinNumber || 'Not set'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="card border border-gray-200 p-6">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-golf-green-700 mb-6">
                <Settings className="w-5 h-5" />
                Golf Preferences
              </h2>

              <div className="space-y-6">
                {/* Pace Preference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Pace
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'fast', label: 'Fast', desc: 'Under 4 hours' },
                        { value: 'normal', label: 'Normal', desc: '4–4.5 hours' },
                        { value: 'relaxed', label: 'Relaxed', desc: '4.5+ hours' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setPacePreference(opt.value)}
                          className={`p-3 rounded-lg border-2 text-left transition-colors ${
                            pacePreference === opt.value
                              ? 'border-golf-green-700 bg-golf-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className={`text-sm font-semibold ${pacePreference === opt.value ? 'text-golf-green-700' : 'text-gray-700'}`}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-gray-500">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="py-3 px-4 bg-gray-50 rounded-lg text-gray-900 capitalize">{pacePreference}</p>
                  )}
                </div>

                {/* Cart Preference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Default Transportation
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setCartPreference('cart')}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                          cartPreference === 'cart'
                            ? 'border-golf-green-700 bg-golf-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <ShoppingCart className={`w-5 h-5 ${cartPreference === 'cart' ? 'text-golf-green-700' : 'text-gray-400'}`} />
                        <span className={`font-semibold text-sm ${cartPreference === 'cart' ? 'text-golf-green-700' : 'text-gray-700'}`}>
                          Cart
                        </span>
                      </button>
                      <button
                        onClick={() => setCartPreference('walking')}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                          cartPreference === 'walking'
                            ? 'border-golf-green-700 bg-golf-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Footprints className={`w-5 h-5 ${cartPreference === 'walking' ? 'text-golf-green-700' : 'text-gray-400'}`} />
                        <span className={`font-semibold text-sm ${cartPreference === 'walking' ? 'text-golf-green-700' : 'text-gray-700'}`}>
                          Walking
                        </span>
                      </button>
                    </div>
                  ) : (
                    <p className="py-3 px-4 bg-gray-50 rounded-lg text-gray-900 capitalize">{cartPreference}</p>
                  )}
                </div>

                {/* Defaults */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Default Players
                    </label>
                    {isEditing ? (
                      <select
                        value={defaultPartySize}
                        onChange={(e) => setDefaultPartySize(Number(e.target.value))}
                        className="input-field"
                      >
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="py-3 px-4 bg-gray-50 rounded-lg text-gray-900">{defaultPartySize}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Default Holes
                    </label>
                    {isEditing ? (
                      <select
                        value={defaultHoles}
                        onChange={(e) => setDefaultHoles(Number(e.target.value))}
                        className="input-field"
                      >
                        <option value={9}>9 Holes</option>
                        <option value={18}>18 Holes</option>
                      </select>
                    ) : (
                      <p className="py-3 px-4 bg-gray-50 rounded-lg text-gray-900">{defaultHoles} Holes</p>
                    )}
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Notifications
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailNotifs}
                        onChange={(e) => isEditing && setEmailNotifs(e.target.checked)}
                        disabled={!isEditing}
                        className="w-4 h-4 rounded border-gray-300 text-golf-green-700 focus:ring-golf-green-500"
                      />
                      <span className="text-sm text-gray-700">Email notifications</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smsNotifs}
                        onChange={(e) => isEditing && setSmsNotifs(e.target.checked)}
                        disabled={!isEditing}
                        className="w-4 h-4 rounded border-gray-300 text-golf-green-700 focus:ring-golf-green-500"
                      />
                      <span className="text-sm text-gray-700">SMS notifications</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Playing Partners */}
            <div className="card border border-gray-200 p-6">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-golf-green-700 mb-6">
                <Users className="w-5 h-5" />
                Playing Partners
              </h2>

              {partners.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {partners.map((partner, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-golf-green-100 flex items-center justify-center text-sm font-bold text-golf-green-700">
                          {partner.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{partner.name}</p>
                          {partner.email && (
                            <p className="text-xs text-gray-500">{partner.email}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removePartner(i)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 mb-4">
                  <Heart className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No playing partners yet</p>
                </div>
              )}

              {/* Add Partner Form */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-600 mb-3">Add a Partner</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newPartnerName}
                    onChange={(e) => setNewPartnerName(e.target.value)}
                    placeholder="Name"
                    className="input-field text-sm flex-1"
                  />
                  <input
                    type="email"
                    value={newPartnerEmail}
                    onChange={(e) => setNewPartnerEmail(e.target.value)}
                    placeholder="Email (optional)"
                    className="input-field text-sm flex-1"
                  />
                  <button
                    onClick={addPartner}
                    disabled={!newPartnerName.trim()}
                    className="btn-primary py-2.5 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="card border border-gray-200 p-6">
              <h3 className="font-display text-lg font-bold text-golf-green-700 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Handicap Index</span>
                  <span className="font-bold text-golf-green-700">
                    {profile?.handicapIndex ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">GHIN #</span>
                  <span className="font-mono text-sm text-gray-900">
                    {ghinNumber || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Partners</span>
                  <span className="font-bold">{partners.length}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="card border border-gray-200 p-6">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-golf-green-700 mb-4">
                <CreditCard className="w-5 h-5" />
                Payment Methods
              </h3>

              {profile?.paymentMethods && profile.paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {profile.paymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">
                            •••• {pm.last4}
                          </p>
                          <p className="text-xs text-gray-500">
                            Exp {pm.expMonth}/{pm.expYear}
                          </p>
                        </div>
                      </div>
                      {pm.isDefault && (
                        <span className="badge-available text-xs">Default</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CreditCard className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 mb-3">No payment methods</p>
                  <p className="text-xs text-gray-400">
                    Pay at the course — no card required for booking.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
