import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Check, 
  Plus, 
  UserPlus, 
  Layers, 
  MapPin, 
  Calendar, 
  Sparkles,
  Heart,
  Crown
} from 'lucide-react';
import { WeddingConfig, WeddingMembership, AppUser } from '../types/wedding';

interface WeddingSwitcherProps {
  currentWedding: WeddingConfig;
  currentUser: AppUser | null;
  joinedWeddings: WeddingMembership[];
  onSelectWedding: (weddingId: string) => void;
  onOpenJoinModal: () => void;
  onOpenInviteModal: () => void;
  onOpenCreateWedding?: () => void;
}

export const WeddingSwitcher: React.FC<WeddingSwitcherProps> = ({
  currentWedding,
  currentUser,
  joinedWeddings,
  onSelectWedding,
  onOpenJoinModal,
  onOpenInviteModal,
  onOpenCreateWedding,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find membership record for current wedding
  const activeMembership = joinedWeddings.find(w => w.weddingId === currentWedding.id) || {
    weddingId: currentWedding.id,
    brideName: currentWedding.brideName,
    groomName: currentWedding.groomName,
    weddingDate: currentWedding.weddingDate,
    location: currentWedding.location,
    userRole: currentUser?.role || 'Bride & Groom Space',
    userSide: currentUser?.side || 'mutual',
    isAdmin: currentUser?.isAdmin || true,
    inviteCode: currentWedding.inviteCode || 'RR-KH27',
  };

  const totalWeddingsCount = joinedWeddings.length > 0 ? joinedWeddings.length : 1;

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Switcher Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/80 dark:bg-stone-800/80 hover:bg-white dark:hover:bg-stone-800 border border-[#E9E2D8] dark:border-[#332A37] shadow-2xs transition-all text-left group"
        title="Switch between weddings or join another"
      >
        {/* Monogram / Icon */}
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#4E2634] to-[#7A3A4F] text-white flex items-center justify-center font-serif text-xs font-bold shadow-2xs shrink-0">
          {(currentWedding.brideName?.charAt(0) || 'K')}&amp;{(currentWedding.groomName?.charAt(0) || 'H')}
        </div>

        {/* Text Details */}
        <div className="hidden sm:flex flex-col min-w-0 pr-1">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="font-serif font-bold text-xs text-[#38232B] dark:text-stone-100 truncate max-w-[130px]">
              {currentWedding.brideName} &amp; {currentWedding.groomName}
            </span>
            {totalWeddingsCount > 1 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#4E2634]/10 dark:bg-white/10 text-[#4E2634] dark:text-[#E9D5C0] text-[9px] font-bold">
                {totalWeddingsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate max-w-[140px]">
            {activeMembership.userRole || 'Wedding Space'}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-[#FAF7F2] dark:bg-[#1C171F] border border-[#E9E2D8] dark:border-[#382F3B] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 px-1 border-b border-[#EFECE6] dark:border-[#2C2430]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#4E2634] dark:text-[#E9D5C0]" />
              <span className="font-serif font-bold text-stone-900 dark:text-stone-100">
                My Wedding Spaces
              </span>
            </div>
            <span className="text-[10px] text-stone-500 font-medium">
              {totalWeddingsCount} {totalWeddingsCount === 1 ? 'Wedding' : 'Weddings Joined'}
            </span>
          </div>

          {/* List of Joined Weddings */}
          <div className="mt-2 space-y-1.5 max-h-60 overflow-y-auto">
            {joinedWeddings.map((wed) => {
              const isActive = wed.weddingId === currentWedding.id;
              return (
                <div
                  key={wed.weddingId}
                  onClick={() => {
                    if (!isActive) {
                      onSelectWedding(wed.weddingId);
                    }
                    setIsOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#4E2634] dark:border-[#7A3A4F] bg-[#FAF3EC] dark:bg-[#2C212D] shadow-2xs'
                      : 'border-transparent hover:border-stone-200 dark:hover:border-stone-800 hover:bg-stone-100/60 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-serif text-xs font-bold text-white shrink-0 ${
                        isActive ? 'bg-[#4E2634]' : 'bg-stone-400 dark:bg-stone-700'
                      }`}>
                        {wed.brideName.charAt(0)}&amp;{wed.groomName.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-serif font-bold text-stone-900 dark:text-stone-100 truncate">
                            {wed.brideName} &amp; {wed.groomName}&apos;s Vivaah
                          </p>
                          {isActive && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold">
                              <Check className="w-2.5 h-2.5" />
                              Active
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-1 truncate">
                          <span>📍 {wed.location}</span>
                        </p>

                        <div className="mt-1 flex items-center gap-2 text-[10px]">
                          <span className="font-semibold text-stone-700 dark:text-stone-300">
                            Role: {wed.userRole}
                          </span>
                          <span>•</span>
                          <span className={`capitalize font-medium ${
                            wed.userSide === 'ladkiwale'
                              ? 'text-rose-700 dark:text-rose-400'
                              : wed.userSide === 'ladkewale'
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-emerald-700 dark:text-emerald-400'
                          }`}>
                            {wed.userSide}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isActive && (
                      <button
                        type="button"
                        className="px-2 py-1 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-[#4E2634] hover:text-white text-stone-700 dark:text-stone-300 text-[10px] font-semibold transition-colors shrink-0"
                      >
                        Switch
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="mt-3 pt-2.5 border-t border-[#EFECE6] dark:border-[#2C2430] grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenJoinModal();
              }}
              className="py-2 px-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold flex items-center justify-center gap-1.5 transition-colors text-[11px]"
            >
              <Plus className="w-3.5 h-3.5 text-[#4E2634] dark:text-[#E9D5C0]" />
              <span>Join with Code/Link</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenInviteModal();
              }}
              className="py-2 px-2.5 rounded-xl bg-[#4E2634] hover:bg-[#3D1D28] text-white font-semibold flex items-center justify-center gap-1.5 transition-colors text-[11px] shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Family</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
