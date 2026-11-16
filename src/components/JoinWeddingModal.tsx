import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Users, 
  Heart, 
  ShieldCheck, 
  ArrowRight,
  UserCheck,
  Calendar,
  MapPin,
  Lock,
  Layers
} from 'lucide-react';
import { WeddingConfig, AppUser, WeddingMembership } from '../types/wedding';
import { sampleKnownWeddings } from '../lib/defaultData';

interface JoinWeddingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onJoinWedding: (membership: WeddingMembership, userToLogin?: AppUser) => void;
  initialCode?: string;
  initialSide?: 'ladkiwale' | 'ladkewale' | 'mutual';
}

export const JoinWeddingModal: React.FC<JoinWeddingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onJoinWedding,
  initialCode = '',
  initialSide = 'ladkiwale',
}) => {
  const [weddingCode, setWeddingCode] = useState(initialCode || 'RR-KH27');
  const [targetWedding, setTargetWedding] = useState<WeddingMembership | null>(null);

  // Form Fields for Family Member
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Mama Ji (Logistics & Welcome Lead)');
  const [side, setSide] = useState<'ladkiwale' | 'ladkewale' | 'mutual'>(initialSide);
  const [errorMsg, setErrorMsg] = useState('');

  // Relation presets
  const relationPresets = [
    'Mama Ji (Bride side)',
    'Mami Ji (Bride side)',
    'Chacha Ji (Groom side)',
    'Chachi Ji (Groom side)',
    'Bhabhi (Sister-in-law)',
    'Sister / Bridesmaid',
    'Brother / Groomsman',
    'Maasi Ji (Aunt)',
    'Bua Ji (Aunt)',
    'Jiju / Brother-in-law',
    'Best Friend',
    'Wedding Coordinator',
    'Family Guest',
  ];

  // Look up wedding from known list or default
  useEffect(() => {
    const cleanCode = weddingCode.trim().toUpperCase();
    const found = sampleKnownWeddings.find(w => w.inviteCode.toUpperCase() === cleanCode);
    if (found) {
      setTargetWedding(found);
      setErrorMsg('');
    } else if (cleanCode === 'RR-KH27' || cleanCode === '') {
      setTargetWedding(sampleKnownWeddings[0]);
      setErrorMsg('');
    } else {
      // Allow custom code with fallback
      setTargetWedding({
        weddingId: `wedding-${cleanCode.toLowerCase()}`,
        brideName: 'Couple',
        groomName: 'Vivaah',
        weddingDate: '2027-02-28T18:30:00',
        muhuratTime: 'Auspicious Muhurat',
        location: 'Wedding Venue',
        userRole: role,
        userSide: side,
        isAdmin: false,
        inviteCode: cleanCode,
      });
    }
  }, [weddingCode]);

  useEffect(() => {
    if (initialCode) {
      setWeddingCode(initialCode);
    }
    if (initialSide) {
      setSide(initialSide);
    }
  }, [initialCode, initialSide]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your name');
      return;
    }

    if (!targetWedding) return;

    const membership: WeddingMembership = {
      ...targetWedding,
      userRole: role,
      userSide: side,
      isAdmin: false,
    };

    let userToEnroll: AppUser;

    if (currentUser && currentUser.email) {
      // Already logged in user: append this wedding to their weddings list!
      userToEnroll = {
        ...currentUser,
        side: side,
        role: role,
        activeWeddingId: targetWedding.weddingId,
        weddings: [
          ...(currentUser.weddings || []),
          membership,
        ],
      };
    } else {
      // New family user signing up
      userToEnroll = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@family.com`,
        side: side,
        role: role,
        isAdmin: false,
        avatarLetter: name.trim().charAt(0).toUpperCase(),
        activeWeddingId: targetWedding.weddingId,
        weddings: [membership],
      };
    }

    onJoinWedding(membership, userToEnroll);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FAF7F2] dark:bg-[#1C171F] border border-[#E9E2D8] dark:border-[#382F3B] rounded-3xl p-5 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 my-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#EFECE6] dark:border-[#2C2430]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🪷</span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#38232B] dark:text-stone-100">
                Join Wedding Space
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Join an existing wedding via invite link or wedding code and sign up with your family role.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Wedding Card Preview */}
        {targetWedding && (
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-[#4E2634] to-[#71374C] text-white shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#E9D5C0]">
              <span>Wedding Invitation Pass</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 font-mono font-bold">
                {targetWedding.inviteCode}
              </span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold mt-2">
              {targetWedding.brideName} &amp; {targetWedding.groomName}&apos;s Vivaah
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#EADBD0]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {targetWedding.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                28 Feb 2027
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
              <span className="text-white/80">Inviting Host: <strong>Bride &amp; Groom</strong></span>
              <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                Verified Space
              </span>
            </div>
          </div>
        )}

        {/* Existing User Banner if already logged in */}
        {currentUser && (
          <div className="mb-4 p-3 rounded-2xl bg-white dark:bg-[#251F2A] border border-[#E9E2D8] dark:border-[#382F3B] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#4E2634] text-white flex items-center justify-center font-bold text-xs">
                {currentUser.avatarLetter}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  Signed in as {currentUser.name}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Joining will add this wedding to your multi-wedding switcher!
                </p>
              </div>
            </div>
            <div className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
              Multi-Wedding Ready
            </div>
          </div>
        )}

        {/* Sign Up / Join Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Wedding Code Input */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Wedding Join Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={weddingCode}
                onChange={(e) => setWeddingCode(e.target.value.toUpperCase())}
                placeholder="e.g. RR-KH27 or RR-AK26"
                className="flex-1 px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-mono uppercase font-bold focus:outline-none focus:ring-1 focus:ring-[#4E2634]"
              />
              <span className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 text-[11px] font-medium flex items-center">
                Verified
              </span>
            </div>
            {/* Quick Demo Code helper pills */}
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-stone-500">
              <span>Try sample wedding codes:</span>
              <button
                type="button"
                onClick={() => setWeddingCode('RR-KH27')}
                className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-[#4E2634] dark:text-[#E9D5C0] font-mono font-bold hover:underline"
              >
                RR-KH27 (Ketki)
              </button>
              <button
                type="button"
                onClick={() => setWeddingCode('RR-AK26')}
                className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-[#4E2634] dark:text-[#E9D5C0] font-mono font-bold hover:underline"
              >
                RR-AK26 (Ananya)
              </button>
            </div>
          </div>

          {/* User Name */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vikram Mama, Pooja Bhabhi, or Ananya"
              className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#4E2634]"
            />
          </div>

          {/* Family Side Attribution */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Which Family Side are you with? *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSide('ladkiwale')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  side === 'ladkiwale'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200 shadow-2xs'
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                Ladkiwale (Bride)
              </button>
              <button
                type="button"
                onClick={() => setSide('ladkewale')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  side === 'ladkewale'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 shadow-2xs'
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                Ladkewale (Groom)
              </button>
              <button
                type="button"
                onClick={() => setSide('mutual')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  side === 'mutual'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 shadow-2xs'
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                Shared / Mutual
              </button>
            </div>
          </div>

          {/* Relation / Role Selection */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Your Relation or Role in this Wedding *
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Mama Ji, Sister, Chacha Ji, Best Friend"
              className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#4E2634]"
            />
            {/* Quick Relation Chips */}
            <div className="mt-1.5 flex flex-wrap gap-1">
              {relationPresets.slice(0, 7).map((rel) => (
                <button
                  key={rel}
                  type="button"
                  onClick={() => setRole(rel)}
                  className={`px-2 py-0.5 rounded-lg border text-[10px] font-medium transition-colors ${
                    role === rel
                      ? 'border-[#4E2634] bg-[#4E2634] text-white dark:border-[#E9D5C0] dark:bg-[#E9D5C0] dark:text-[#38232B]'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {rel}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Details (if not logged in) */}
          {!currentUser && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Email or Mobile (Optional)
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. mama@family.com"
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#4E2634]"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Create Passcode / PIN
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. 1234 or password"
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#4E2634]"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
          )}

          {/* Multi-wedding Explanatory footer */}
          <div className="p-3 rounded-xl bg-stone-100/80 dark:bg-stone-800/60 text-[11px] text-stone-600 dark:text-stone-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#4E2634] dark:text-[#E9D5C0] shrink-0" />
            <span>
              If you are part of multiple weddings, you will be able to switch between them anytime from the top bar!
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#EFECE6] dark:border-[#2C2430] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#4E2634] hover:bg-[#3D1D28] text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Accept Invite &amp; Join Wedding</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
