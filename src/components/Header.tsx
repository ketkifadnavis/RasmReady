import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Moon, 
  Sun, 
  Calendar, 
  MapPin, 
  Heart,
  LayoutDashboard,
  IndianRupee,
  CheckSquare,
  Users,
  Briefcase,
  Palette,
  Camera,
  UserPlus,
  Plus
} from 'lucide-react';
import { SideFilter, WeddingConfig, WeddingMembership, AppUser } from '../types/wedding';
import { WeddingSwitcher } from './WeddingSwitcher';

interface HeaderProps {
  wedding: WeddingConfig;
  activeSide: SideFilter;
  onSideChange: (side: SideFilter) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenGuide: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onEditWedding: () => void;
  currentUser?: AppUser | null;
  joinedWeddings?: WeddingMembership[];
  onSelectWedding?: (weddingId: string) => void;
  onOpenJoinModal?: () => void;
  onOpenInviteModal?: () => void;
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wedding,
  activeSide,
  onSideChange,
  activeTab,
  onTabChange,
  onOpenGuide,
  isDark,
  onToggleTheme,
  onEditWedding,
  currentUser,
  joinedWeddings = [],
  onSelectWedding,
  onOpenJoinModal,
  onOpenInviteModal,
  onOpenAuthModal,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(wedding.weddingDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [wedding.weddingDate]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'budget', label: 'Budget', icon: IndianRupee },
    { id: 'tasks', label: 'Tasks & Team', icon: CheckSquare },
    { id: 'vendors', label: 'Vendors', icon: Briefcase },
    { id: 'guests', label: 'Guests & RSVP', icon: Users },
    { id: 'moodboards', label: 'Moodboards', icon: Palette },
    { id: 'album', label: 'Photo Vault', icon: Camera },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 dark:bg-[#161318]/95 backdrop-blur-md border-b border-[#EAE2D8] dark:border-[#28232B] transition-colors">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          
          {/* Zone 1: Brand & Wedding Switcher */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button 
              onClick={() => onTabChange('overview')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4E2634] to-[#723A4C] flex items-center justify-center text-white shadow-2xs">
                <Heart className="w-4 h-4 fill-white/80" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-serif font-bold text-lg text-[#38232B] dark:text-[#F7EFEA] leading-tight tracking-tight flex items-center gap-1.5">
                  RasmReady
                  <span className="text-sm">🪷</span>
                </span>
                <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400 tracking-wide">
                  Shaadi, with ease
                </span>
              </div>
            </button>

            {/* Multi-wedding switcher dropdown */}
            {onSelectWedding && onOpenJoinModal && onOpenInviteModal && (
              <WeddingSwitcher
                currentWedding={wedding}
                currentUser={currentUser || null}
                joinedWeddings={joinedWeddings}
                onSelectWedding={onSelectWedding}
                onOpenJoinModal={onOpenJoinModal}
                onOpenInviteModal={onOpenInviteModal}
              />
            )}
          </div>

          {/* Zone 2: Clean Desktop Nav Tabs */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#4E2634] text-white shadow-2xs dark:bg-[#5C2D3D]'
                      : 'text-stone-600 dark:text-stone-300 hover:text-[#38232B] dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Side Filter & Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Global Side Switcher */}
            <div className="flex items-center p-0.5 bg-[#EFECE6] dark:bg-[#201C22] border border-[#E0D9CF] dark:border-[#38323C] rounded-xl text-xs font-medium">
              <button
                onClick={() => onSideChange('all')}
                className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                  activeSide === 'all'
                    ? 'bg-white dark:bg-stone-700 text-[#38232B] dark:text-stone-100 shadow-2xs font-semibold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                title="View combined items for both families"
              >
                All
              </button>
              <button
                onClick={() => onSideChange('ladkiwale')}
                className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                  activeSide === 'ladkiwale'
                    ? 'bg-[#9A3B56] text-white shadow-2xs font-semibold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-[#9A3B56] dark:hover:text-[#EFA4B8]'
                }`}
                title="Filter view for Bride's side"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#EFA4B8]"></span>
                <span>Ladkiwale</span>
              </button>
              <button
                onClick={() => onSideChange('ladkewale')}
                className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                  activeSide === 'ladkewale'
                    ? 'bg-[#9E6523] text-white shadow-2xs font-semibold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-[#9E6523] dark:hover:text-[#F3CA8A]'
                }`}
                title="Filter view for Groom's side"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#F3CA8A]"></span>
                <span>Ladkewale</span>
              </button>
            </div>

            {/* Invite Family Button */}
            {onOpenInviteModal && (
              <button
                onClick={onOpenInviteModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4E2634] hover:bg-[#3D1D28] text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
                title="Share Wedding Link via WhatsApp & Invite Family"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Invite Family</span>
              </button>
            )}

            {/* User Profile Pill */}
            {currentUser && onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-[#EFECE6] dark:bg-[#251E28] hover:bg-[#E5DFD5] dark:hover:bg-[#2F2633] text-stone-700 dark:text-stone-200 text-xs font-medium transition-colors border border-[#E0D9CE] dark:border-[#382E3D] shrink-0"
                title={`Logged in as ${currentUser.name} (${currentUser.role})`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] text-white ${currentUser.isAdmin ? 'bg-[#4E2634]' : 'bg-[#8B4459]'}`}>
                  {currentUser.avatarLetter}
                </div>
                <span className="hidden md:inline font-semibold text-stone-800 dark:text-stone-100 max-w-[90px] truncate">{currentUser.name}</span>
              </button>
            )}

            {/* Guide Button */}
            <button
              onClick={onOpenGuide}
              className="p-2 text-stone-600 hover:text-[#38232B] dark:text-stone-400 dark:hover:text-stone-100 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
              title="First-Time User Guide & Help"
              aria-label="Open App Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Dark Mode Switcher */}
            <button
              onClick={onToggleTheme}
              className="p-2 text-stone-600 hover:text-[#38232B] dark:text-stone-400 dark:hover:text-stone-100 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Horizontal Tab Scrolling */}
        <div className="flex xl:hidden items-center gap-2 overflow-x-auto py-2 border-t border-[#EAE2D8] dark:border-[#28232B] no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#4E2634] text-white shadow-2xs dark:bg-[#5C2D3D]'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-bar: Auspicious Muhurat Countdown & Venue Strip */}
      <div className="bg-[#EFECE6] dark:bg-[#201C22] border-t border-[#E0D9CF] dark:border-[#2E2833] py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Left: Wedding Date, Venue & Muhurat */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-stone-600 dark:text-stone-300">
            <span className="flex items-center gap-1 font-medium text-stone-800 dark:text-stone-200">
              <Calendar className="w-3.5 h-3.5 text-[#9A3B56] dark:text-[#EFA4B8]" />
              {new Date(wedding.weddingDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#9E6523] dark:text-[#F3CA8A]" />
              <span className="truncate max-w-[220px] sm:max-w-none">{wedding.location}</span>
            </span>
            {wedding.muhuratTime && (
              <>
                <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
                <span className="font-semibold text-[#4E2634] dark:text-[#F5EDE8]">
                  {wedding.muhuratTime}
                </span>
              </>
            )}
            <button
              onClick={onEditWedding}
              className="text-[11px] underline text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 ml-1"
            >
              Edit Details
            </button>
          </div>

          {/* Right: Live Ticking Countdown Box */}
          <div className="flex items-center gap-2 font-mono tabular-nums">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-sans font-medium mr-1">
              Until Pheras:
            </span>
            <div className="flex items-center gap-1.5">
              <div className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#28242A] border border-[#E0D9CF] dark:border-[#38323C] font-bold text-[#38232B] dark:text-stone-100 shadow-2xs">
                {String(timeLeft.days).padStart(2, '0')}<span className="text-[10px] font-normal text-stone-400 ml-0.5">d</span>
              </div>
              <span className="text-stone-400 font-bold">:</span>
              <div className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#28242A] border border-[#E0D9CF] dark:border-[#38323C] font-bold text-[#38232B] dark:text-stone-100 shadow-2xs">
                {String(timeLeft.hours).padStart(2, '0')}<span className="text-[10px] font-normal text-stone-400 ml-0.5">h</span>
              </div>
              <span className="text-stone-400 font-bold">:</span>
              <div className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#28242A] border border-[#E0D9CF] dark:border-[#38323C] font-bold text-[#38232B] dark:text-stone-100 shadow-2xs">
                {String(timeLeft.minutes).padStart(2, '0')}<span className="text-[10px] font-normal text-stone-400 ml-0.5">m</span>
              </div>
              <span className="text-stone-400 font-bold">:</span>
              <div className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#28242A] border border-[#E0D9CF] dark:border-[#38323C] font-bold text-[#9A3B56] dark:text-[#EFA4B8] shadow-2xs">
                {String(timeLeft.seconds).padStart(2, '0')}<span className="text-[10px] font-normal text-stone-400 ml-0.5">s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
