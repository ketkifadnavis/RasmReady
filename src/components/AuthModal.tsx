import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Heart, 
  Crown, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Shuffle, 
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Calendar,
  MapPin,
  Clock,
  Sparkle
} from 'lucide-react';
import { AppUser, SideFilter, WeddingConfig } from '../types/wedding';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onLogin: (user: AppUser) => void;
  onLogout: () => void;
  wedding: WeddingConfig;
  onUpdateWedding: (updated: WeddingConfig) => void;
  onOpenJoinModal?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  wedding,
  onUpdateWedding,
  onOpenJoinModal,
}) => {
  const [tab, setTab] = useState<'login' | 'signup' | 'quick'>('signup');
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Signup Persona Selector: Bride, Groom, or Family Member
  const [userType, setUserType] = useState<'bride' | 'groom' | 'family'>('bride');
  const [signupName, setSignupName] = useState(wedding?.brideName || 'Ketki');
  const [partnerName, setPartnerName] = useState(wedding?.groomName || 'Hardik');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupSide, setSignupSide] = useState<'ladkiwale' | 'ladkewale' | 'mutual'>('ladkiwale');
  const [signupRole, setSignupRole] = useState('Bride (Owner & Admin)');
  
  // Wedding Details directly on Sign Up (updates main app immediately)
  const [signupWeddingDate, setSignupWeddingDate] = useState(() => {
    return wedding?.weddingDate ? wedding.weddingDate.slice(0, 16) : '2027-02-28T18:30';
  });
  const [signupVenue, setSignupVenue] = useState(() => {
    return wedding?.location || 'Signature Resorts, Nagpur';
  });
  const [signupMuhurat, setSignupMuhurat] = useState(() => {
    return wedding?.muhuratTime || 'Godhuli Muhurat (6:30 PM)';
  });

  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [successToast, setSuccessToast] = useState('');

  // Synchronize role and side when switching persona without overwriting custom names
  useEffect(() => {
    if (userType === 'bride') {
      setSignupSide('ladkiwale');
      setSignupRole('Bride (Owner & Admin)');
      if (!signupName) setSignupName(wedding?.brideName || '');
      if (!partnerName) setPartnerName(wedding?.groomName || '');
    } else if (userType === 'groom') {
      setSignupSide('ladkewale');
      setSignupRole('Groom (Partner & Admin)');
      if (!signupName) setSignupName(wedding?.groomName || '');
      if (!partnerName) setPartnerName(wedding?.brideName || '');
    } else {
      setSignupSide('ladkiwale');
      setSignupRole('Family Member / Guest');
    }
  }, [userType]);

  if (!isOpen) return null;

  // Preset Family Personas (Dynamic to current wedding couple)
  const presetUsers: AppUser[] = [
    {
      id: 'usr-bride',
      name: wedding?.brideName || 'Ketki',
      email: `${(wedding?.brideName || 'ketki').toLowerCase().replace(/\s+/g, '')}.wed@gmail.com`,
      side: 'ladkiwale',
      role: 'Bride (Owner & Admin)',
      isAdmin: true,
      avatarLetter: (wedding?.brideName || 'K').charAt(0).toUpperCase(),
    },
    {
      id: 'usr-groom',
      name: wedding?.groomName || 'Hardik',
      email: `${(wedding?.groomName || 'hardik').toLowerCase().replace(/\s+/g, '')}.wed@gmail.com`,
      side: 'ladkewale',
      role: 'Groom (Partner & Admin)',
      isAdmin: true,
      avatarLetter: (wedding?.groomName || 'H').charAt(0).toUpperCase(),
    },
    {
      id: 'usr-vikram',
      name: 'Vikram Mama',
      email: 'vikram.mama@family.com',
      side: 'ladkiwale',
      role: 'Mama Ji (Logistics & Welcome Lead)',
      isAdmin: false,
      avatarLetter: 'V',
    },
    {
      id: 'usr-rajesh',
      name: 'Rajesh Chacha',
      email: 'rajesh.chacha@family.com',
      side: 'ladkewale',
      role: 'Chacha Ji (Baraat & Transport Lead)',
      isAdmin: false,
      avatarLetter: 'R',
    },
    {
      id: 'usr-ananya',
      name: 'Ananya',
      email: 'ananya.cute@gmail.com',
      side: 'ladkiwale',
      role: 'Bridesmaid Squad Lead',
      isAdmin: false,
      avatarLetter: 'A',
    },
  ];

  // Random names and roles for instant random user validation
  const randomNames = [
    { name: 'Sunita Mami', side: 'ladkiwale' as const, role: 'Mami Ji (Rituals Lead)' },
    { name: 'Gaurav Bhaiya', side: 'ladkewale' as const, role: 'Groom Squad & Sangeet DJ Lead' },
    { name: 'Pooja Bhabhi', side: 'ladkiwale' as const, role: 'Bhabhi (Haldi & Henna Coordinator)' },
    { name: 'Kabir Verma', side: 'ladkewale' as const, role: 'Cousin Brother (Baraat Coordinator)' },
    { name: 'Meera Didi', side: 'mutual' as const, role: 'College Buddy / Guest Host' },
    { name: 'Deepak Mama', side: 'ladkiwale' as const, role: 'Mama Ji (Hotel Stay Lead)' },
    { name: 'Siddharth', side: 'ladkewale' as const, role: 'Groomsman (Safas & Entry)' },
  ];

  const handleQuickLogin = (user: AppUser) => {
    onLogin(user);
    setSuccessToast(`Signed in as ${user.name} (${user.role})`);
    setTimeout(() => {
      setSuccessToast('');
      onClose();
    }, 1200);
  };

  const handleGenerateRandomUser = () => {
    const randomPick = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomId = `usr-${Date.now()}`;
    const cleanEmail = `${randomPick.name.toLowerCase().replace(/\s+/g, '')}.${Math.floor(Math.random() * 90 + 10)}@shaadi.family`;
    
    const randomUser: AppUser = {
      id: randomId,
      name: randomPick.name,
      email: cleanEmail,
      side: randomPick.side,
      role: randomPick.role,
      isAdmin: false,
      avatarLetter: randomPick.name.charAt(0),
    };

    onLogin(randomUser);
    setSuccessToast(`Generated & Validated: Signed in as ${randomUser.name}!`);
    setTimeout(() => {
      setSuccessToast('');
      onClose();
    }, 1200);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both email and password.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(loginEmail)) {
      setLoginError('Please enter a valid email address.');
      return;
    }

    if (loginPassword.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    // Check if matching preset or existing user
    const matched = presetUsers.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase());
    if (matched) {
      onLogin(matched);
      setSuccessToast(`Welcome back, ${matched.name}!`);
    } else {
      const derivedName = loginEmail.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
      const newUser: AppUser = {
        id: `usr-${Date.now()}`,
        name: formattedName,
        email: loginEmail.trim(),
        side: 'ladkiwale',
        role: 'Family Member',
        isAdmin: false,
        avatarLetter: formattedName.charAt(0).toUpperCase(),
      };
      onLogin(newUser);
      setSuccessToast(`Signed in as ${newUser.name}!`);
    }

    setTimeout(() => {
      setSuccessToast('');
      onClose();
    }, 1200);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!signupName.trim()) {
      errors.name = userType === 'bride' 
        ? "Bride's name is required." 
        : userType === 'groom' 
          ? "Groom's name is required." 
          : 'Full name is required.';
    }

    if ((userType === 'bride' || userType === 'groom') && !partnerName.trim()) {
      errors.partner = userType === 'bride' 
        ? "Groom's name is required." 
        : "Bride's name is required.";
    }

    if (!signupEmail.trim() || !/\S+@\S+\.\S+/.test(signupEmail)) {
      errors.email = 'Valid email is required.';
    }

    if (!signupPassword || signupPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!signupVenue.trim()) {
      errors.venue = 'Wedding venue & location is required.';
    }

    if (Object.keys(errors).length > 0) {
      setSignupErrors(errors);
      return;
    }

    // 1. Compute dynamic Bride and Groom names
    const finalBride = userType === 'bride' 
      ? signupName.trim() 
      : userType === 'groom' 
        ? partnerName.trim() 
        : (wedding?.brideName || 'Ketki');

    const finalGroom = userType === 'groom' 
      ? signupName.trim() 
      : userType === 'bride' 
        ? partnerName.trim() 
        : (wedding?.groomName || 'Hardik');

    // 2. Synchronize wedding config immediately so it reflects on main screen
    const updatedWedding: WeddingConfig = {
      ...(wedding || {}),
      id: 'wedding-ketki-hardik-2027',
      brideName: finalBride,
      groomName: finalGroom,
      weddingDate: signupWeddingDate || '2027-02-28T18:30:00',
      location: signupVenue.trim(),
      muhuratTime: signupMuhurat.trim() || 'Godhuli Muhurat (6:30 PM)',
      currency: wedding?.currency || 'INR',
      primarySide: wedding?.primarySide || 'joint',
      createdAt: wedding?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateWedding(updatedWedding);
    localStorage.setItem('sv_wedding', JSON.stringify(updatedWedding));
    localStorage.setItem('sv_registered_bride', finalBride);
    localStorage.setItem('sv_registered_groom', finalGroom);

    // 3. Authenticate active user
    const isBride = userType === 'bride';
    const isGroom = userType === 'groom';

    const newUser: AppUser = {
      id: `usr-${Date.now()}`,
      name: signupName.trim(),
      email: signupEmail.trim(),
      side: isBride ? 'ladkiwale' : isGroom ? 'ladkewale' : signupSide,
      role: isBride ? 'Bride (Owner & Admin)' : isGroom ? 'Groom (Partner & Admin)' : signupRole,
      isAdmin: isBride || isGroom || signupRole.toLowerCase().includes('admin'),
      avatarLetter: signupName.trim().charAt(0).toUpperCase(),
    };

    onLogin(newUser);
    setSuccessToast(`Welcome ${finalBride} & ${finalGroom}! Wedding details updated directly.`);
    setTimeout(() => {
      setSuccessToast('');
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FAF7F2] dark:bg-[#1E1921] border border-[#EAE3D8] dark:border-[#382F3B] rounded-3xl p-5 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 my-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#EFECE6] dark:border-[#2C2430]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🪷</span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#38232B] dark:text-stone-100">
                RasmReady
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              The Joint Indian Wedding Planning &amp; Collaboration Platform
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="my-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Current Logged In Status Banner */}
        {currentUser && (
          <div className="my-3 p-3 rounded-2xl bg-white dark:bg-[#28212C] border border-[#E8E2D8] dark:border-[#382E3C] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 ${currentUser.isAdmin ? 'bg-[#4E2634]' : 'bg-[#8B4459]'}`}>
                {currentUser.avatarLetter}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                  Logged in as {currentUser.name}
                </p>
                <p className="text-[10px] text-stone-400 truncate">
                  {currentUser.role} · {currentUser.side === 'ladkiwale' ? 'Ladkiwale' : currentUser.side === 'ladkewale' ? 'Ladkewale' : 'Both Sides'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                setSuccessToast('Signed out of session');
                setTimeout(() => setSuccessToast(''), 1500);
              }}
              className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline shrink-0 ml-2"
            >
              Sign out
            </button>
          </div>
        )}

        {/* Invited via Link Banner */}
        {onOpenJoinModal && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <span className="flex items-center gap-1.5 font-medium">
              <span>🎟️</span>
              <span>Invited to a wedding by couple?</span>
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenJoinModal();
              }}
              className="px-2.5 py-1 rounded-lg bg-[#4E2634] text-white font-semibold hover:bg-[#3D1D28] transition-colors shrink-0 text-[11px]"
            >
              Join with Code/Link
            </button>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#EAE4DC] dark:bg-[#28202A] p-1 rounded-xl mt-3 text-xs font-medium">
          <button
            onClick={() => setTab('signup')}
            className={`py-1.5 rounded-lg transition-all ${
              tab === 'signup'
                ? 'bg-[#4E2634] text-white shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => setTab('login')}
            className={`py-1.5 rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-[#4E2634] text-white shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('quick')}
            className={`py-1.5 rounded-lg transition-all ${
              tab === 'quick'
                ? 'bg-[#4E2634] text-white shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            Family Personas
          </button>
        </div>

        {/* MODE 1: SIGN IN */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3.5 text-xs">
            {loginError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. ketki.wed@gmail.com"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#28212C] border border-[#DFD8CE] dark:border-[#3A303F] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#4E2634]"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#28212C] border border-[#DFD8CE] dark:border-[#3A303F] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#4E2634]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#4E2634] hover:bg-[#3D1D28] text-white font-semibold shadow-xs transition-colors mt-2"
            >
              Sign In to Wedding
            </button>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-stone-400">
                Want to test roles instantly?{' '}
                <button
                  type="button"
                  onClick={() => setTab('quick')}
                  className="text-[#8B4459] font-semibold hover:underline"
                >
                  Use Family Personas
                </button>
              </span>
            </div>
          </form>
        )}

        {/* MODE 2: SIGN UP (NEW USER WITH DYNAMIC BRIDE/GROOM & WEDDING DETAILS) */}
        {tab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="mt-4 space-y-4 text-xs">
            
            {/* Step 1: Who are you in this wedding? */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#251E28] border border-[#E7DFD3] dark:border-[#382D3D] space-y-2">
              <label className="block font-bold text-stone-800 dark:text-stone-200">
                1. Who is registering? *
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setUserType('bride')}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    userType === 'bride'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-[#8B4459] text-[#4E2634] dark:text-rose-200 font-bold ring-1 ring-[#8B4459]'
                      : 'border-[#E0D8CE] dark:border-[#352B3A] text-stone-600 dark:text-stone-400 hover:bg-[#FAF7F2]'
                  }`}
                >
                  <span className="text-base">👰‍♀️</span>
                  <span className="text-[11px]">I am the Bride</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType('groom')}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    userType === 'groom'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-700 text-amber-900 dark:text-amber-200 font-bold ring-1 ring-amber-700'
                      : 'border-[#E0D8CE] dark:border-[#352B3A] text-stone-600 dark:text-stone-400 hover:bg-[#FAF7F2]'
                  }`}
                >
                  <span className="text-base">🤵‍♂️</span>
                  <span className="text-[11px]">I am the Groom</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType('family')}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    userType === 'family'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold ring-1 ring-emerald-700'
                      : 'border-[#E0D8CE] dark:border-[#352B3A] text-stone-600 dark:text-stone-400 hover:bg-[#FAF7F2]'
                  }`}
                >
                  <span className="text-base">🪷</span>
                  <span className="text-[11px]">Family / Guest</span>
                </button>
              </div>
            </div>

            {/* Step 2: Dynamic Couple Names */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#251E28] border border-[#E7DFD3] dark:border-[#382D3D] space-y-3">
              <label className="block font-bold text-stone-800 dark:text-stone-200">
                2. Couple Information *
              </label>

              {userType === 'bride' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Bride&apos;s Name (You) *
                    </label>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Ketki"
                      className="w-full px-3 py-2 bg-white dark:bg-[#2C2430] border border-[#DFD8CE] dark:border-[#3A303F] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#4E2634]"
                    />
                    {signupErrors.name && (
                      <p className="text-[10px] text-rose-600 mt-0.5">{signupErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Groom&apos;s Name (Your Partner) *
                    </label>
                    <input
                      type="text"
                      required
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="e.g. Hardik"
                      className="w-full px-3 py-2 bg-white dark:bg-[#2C2430] border border-[#DFD8CE] dark:border-[#3A303F] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#4E2634]"
                    />
                    {signupErrors.partner && (
                      <p className="text-[10px] text-rose-600 mt-0.5">{signupErrors.partner}</p>
                    )}
                  </div>
                </div>
              )}

              {userType === 'groom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Groom&apos;s Name (You) *
                    </label>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Hardik"
                      className="w-full px-3 py-2 bg-white dark:bg-[#2C2430] border border-[#DFD8CE] dark:border-[#3A303F] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#4E2634]"
                    />
                    {signupErrors.name && (
                      <p className="text-[10px] text-rose-600 mt-0.5">{signupErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Bride&apos;s Name (Your Partner) *
                    </label>
                    <input
                      type="text"
                      required
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="e.g. Ketki"
                      className="w-full px-3 py-2 bg-white dark:bg-[#2C2430] border border-[#DFD8CE] dark:border-[#3A303F] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#4E2634]"
                    />
                    {signupErrors.partner && (
                      <p className="text-[10px] text-rose-600 mt-0.5">{signupErrors.partner}</p>
                    )}
                  </div>
                </div>
              )}

              {userType === 'family' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Vikram Mama, Pooja Bhabhi"
                      className="w-full px-3 py-2 bg-white dark:bg-[#2C2430] border border-[#DFD8CE] dark:border-[#3A303F] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                        Side *
                      </label>
                      <select
                        value={signupSide}
                        onChange={(e) => setSignupSide(e.target.value as any)}
                        className="w-full px-2.5 py-2 bg-white dark:bg-[#2C2430] border border-[#DFD8CE] dark:border-[#3A303F] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                      >
                        <option value="ladkiwale">Ladkiwale (Bride Side)</option>
                        <option value="ladkewale">Ladkewale (Groom Side)</option>
                        <option value="mutual">Mutual Friends &amp; Family</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                        Role *
                      </label>
                      <select
                        value={signupRole}
                        onChange={(e) => setSignupRole(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white dark:bg-[#2C2430] border border-[#DFD8CE] dark:border-[#3A303F] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                      >
                        <option value="Mama Ji / Maternal Uncle">Mama Ji / Mami Ji</option>
                        <option value="Chacha Ji / Paternal Uncle">Chacha Ji / Chachi Ji</option>
                        <option value="Bhabhi / Sister-in-law">Bhabhi</option>
                        <option value="Bridesmaid / Sister">Bridesmaid Squad</option>
                        <option value="Groomsman / Brother">Groomsman Squad</option>
                        <option value="Cousin Gang">Cousin Gang</option>
                        <option value="Wedding Coordinator">Wedding Coordinator</option>
                        <option value="Invited Guest">Family Guest</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Wedding Schedule, Venue & Muhurat Details */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#251E28] border border-[#E7DFD3] dark:border-[#382D3D] space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8B4459]" />
                  <span>3. Wedding Schedule &amp; Venue *</span>
                </label>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                  Reflected live on portal
                </span>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Wedding Date &amp; Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={signupWeddingDate}
                  onChange={(e) => setSignupWeddingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#2C2430] border border-[#DFD8CE] dark:border-[#3A303F] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Venue &amp; City *
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={signupVenue}
                      onChange={(e) => setSignupVenue(e.target.value)}
                      placeholder="e.g. Signature Resorts, Nagpur"
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-[#2C2430] border border-[#DFD8CE] dark:border-[#3A303F] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                    />
                  </div>
                  {signupErrors.venue && (
                    <p className="text-[10px] text-rose-600 mt-0.5">{signupErrors.venue}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Auspicious Muhurat *
                  </label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={signupMuhurat}
                      onChange={(e) => setSignupMuhurat(e.target.value)}
                      placeholder="e.g. Godhuli Muhurat (6:30 PM)"
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-[#2C2430] border border-[#DFD8CE] dark:border-[#3A303F] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Login Credentials */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#251E28] border border-[#E7DFD3] dark:border-[#382D3D] space-y-3">
              <label className="block font-bold text-stone-800 dark:text-stone-200">
                4. Account Credentials *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Email address *
                  </label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="e.g. ketki.wed@gmail.com"
                    className="w-full px-3 py-2 bg-white dark:bg-[#2C2430] border border-[#DFD8CE] dark:border-[#3A303F] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                  {signupErrors.email && (
                    <p className="text-[10px] text-rose-600 mt-0.5">{signupErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Password (min 6 chars) *
                  </label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-white dark:bg-[#2C2430] border border-[#DFD8CE] dark:border-[#3A303F] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                  {signupErrors.password && (
                    <p className="text-[10px] text-rose-600 mt-0.5">{signupErrors.password}</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#4E2634] hover:bg-[#3D1D28] text-white font-semibold shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Complete Registration &amp; Update Wedding</span>
            </button>
          </form>
        )}

        {/* MODE 3: QUICK PERSONAS & RANDOM USER GENERATOR */}
        {tab === 'quick' && (
          <div className="mt-4 space-y-3">
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Select any family persona to validate role permissions or generate a random guest:
            </p>

            {/* Random User Button */}
            <button
              onClick={handleGenerateRandomUser}
              className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-xs"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-700" />
              <span>Generate &amp; Validate Random Family Guest</span>
            </button>

            {/* Persona List */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {presetUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#28212C] border border-[#E8E2D8] dark:border-[#382E3C] hover:border-[#4E2634]/40 hover:bg-[#FAF7F2] dark:hover:bg-[#322838] transition-all text-left group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0
                      ${u.isAdmin ? 'bg-[#4E2634] text-white' : 'bg-[#EAE4DC] dark:bg-[#352B3A] text-stone-800 dark:text-stone-200'}
                    `}>
                      {u.avatarLetter}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                        {u.name}
                        {u.isAdmin && <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />}
                      </p>
                      <p className="text-[10px] text-stone-400 truncate">
                        {u.role}
                      </p>
                    </div>
                  </div>

                  <span className={`
                    text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0
                    ${u.side === 'ladkiwale' ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'}
                  `}>
                    {u.side === 'ladkiwale' ? 'Ladki' : 'Ladke'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-[#EFECE6] dark:border-[#2C2430] flex items-center justify-between text-[11px] text-stone-400">
          <span>🪷 Dynamic Couple &amp; Schedule Synchronization</span>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
