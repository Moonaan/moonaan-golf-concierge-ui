// ============================================================
// MembershipCard — Digital trail pass with QR and stats
// ============================================================

import { useState } from 'react';
import { Award, Share2, TrendingUp, ChevronRight } from 'lucide-react';

interface MembershipCardProps {
  tier: 'free' | 'trail-member' | 'trail-pro' | 'trail-pass';
  memberName: string;
  ghinNumber?: string;
  memberSince: string;
  roundsThisYear: number;
  lifetimeRounds: number;
  memberId: string;
}

const tierConfig = {
  free: {
    label: 'Free',
    gradient: 'from-gray-600 to-gray-800',
    accent: 'bg-gray-400',
    badge: 'bg-gray-500/20 text-gray-200',
  },
  'trail-member': {
    label: 'Trail Member',
    gradient: 'from-golf-green-700 to-golf-green-950',
    accent: 'bg-golf-green-500',
    badge: 'bg-golf-green-500/20 text-golf-green-200',
  },
  'trail-pro': {
    label: 'Trail Pro',
    gradient: 'from-[#C4A35A] via-[#A8882E] to-[#8B6F1F]',
    accent: 'bg-golf-gold-400',
    badge: 'bg-golf-gold-400/20 text-golf-gold-100',
  },
  'trail-pass': {
    label: 'Trail Pass',
    gradient: 'from-gray-800 via-gray-700 to-gray-900',
    accent: 'bg-white',
    badge: 'bg-white/20 text-white',
  },
};

function SimpleQR({ data, size = 120 }: { data: string; size?: number }) {
  // Simple visual QR placeholder — in production, use a QR library
  const hash = Array.from(data).reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = 9;
  return (
    <div
      className="bg-white p-2 rounded-lg inline-block"
      style={{ width: size, height: size }}
    >
      <svg viewBox={`0 0 ${cells} ${cells}`} className="w-full h-full">
        {Array.from({ length: cells * cells }).map((_, i) => {
          const x = i % cells;
          const y = Math.floor(i / cells);
          // Corner patterns (always filled for QR-like look)
          const isCorner =
            (x < 3 && y < 3) ||
            (x >= cells - 3 && y < 3) ||
            (x < 3 && y >= cells - 3);
          const isFilled = isCorner || ((hash * (i + 7) * 31) % 5 < 2);
          return isFilled ? (
            <rect
              key={i}
              x={x}
              y={y}
              width={1}
              height={1}
              fill="#1B4D3E"
              rx={0.1}
            />
          ) : null;
        })}
      </svg>
    </div>
  );
}

export function MembershipCard({
  tier,
  memberName,
  ghinNumber,
  memberSince,
  roundsThisYear,
  lifetimeRounds,
  memberId,
}: MembershipCardProps) {
  const [showUpgrade, setShowUpgrade] = useState(tier === 'free');
  const config = tierConfig[tier];

  return (
    <div className="relative">
      {/* Main Card */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${config.gradient} text-white p-6 shadow-xl max-w-md w-full`}
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/5" />

        {/* Header */}
        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 opacity-80" />
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${config.badge}`}>
                {config.label}
              </span>
            </div>
            <h3 className="text-xl font-display font-bold mt-3">{memberName}</h3>
            {ghinNumber && (
              <p className="text-sm opacity-70 mt-0.5">GHIN: {ghinNumber}</p>
            )}
          </div>
          <SimpleQR data={memberId} size={80} />
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-6 relative z-10">
          <div>
            <p className="text-2xl font-bold">{roundsThisYear}</p>
            <p className="text-xs opacity-60 uppercase tracking-wider">This Year</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{lifetimeRounds}</p>
            <p className="text-xs opacity-60 uppercase tracking-wider">Lifetime</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm opacity-70">Member since</p>
            <p className="font-semibold">{memberSince}</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 relative z-10">
          <span className="text-xs font-medium opacity-50 tracking-widest uppercase">
            Missouri Golf Trail
          </span>
          <button
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Share card"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Upgrade Prompt (for free tier) */}
      {showUpgrade && (
        <div className="mt-3 bg-gradient-to-r from-golf-gold-400/10 to-golf-green-700/10 border border-golf-gold-400/30 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-golf-gold-400/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-golf-gold-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">Upgrade to Trail Member</p>
            <p className="text-xs text-gray-500">Save 5% on every round + book online</p>
          </div>
          <button
            onClick={() => setShowUpgrade(false)}
            className="flex items-center gap-1 text-golf-green-700 text-sm font-semibold hover:text-golf-green-600"
          >
            View
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
