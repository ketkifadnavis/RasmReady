import React from 'react';
import { 
  Home, 
  Palette, 
  CheckSquare, 
  IndianRupee, 
  Briefcase,
  ShoppingBag, 
  ListChecks, 
  Users, 
  UserPlus,
  Sparkles,
  Heart,
  ChevronRight,
  Camera,
  Layers,
  X
} from 'lucide-react';
import { SideFilter, WeddingConfig, AppUser } from '../types/wedding';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

interface SidebarProps {
  wedding: WeddingConfig;
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeSide: SideFilter;
  onSideChange: (side: SideFilter) => void;
  pendingTasksCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenInviteModal: () => void;
  currentUser?: AppUser | null;
  onOpenAuthModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  wedding,
  activeTab,
  onTabChange,
  activeSide,
  onSideChange,
  pendingTasksCount,
  isOpenMobile,
  onCloseMobile,
  onOpenInviteModal,
  currentUser,
  onOpenAuthModal,
}) => {
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'moodboards', label: 'Events & moodboards', icon: Palette },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'budget', label: 'Money tracker', icon: IndianRupee },
    { id: 'vendors', label: 'Vendors', icon: Briefcase },
    { id: 'shopping', label: 'Shopping list', icon: ShoppingBag },
    { id: 'checklists', label: 'Couple checklists', icon: ListChecks },
    { id: 'guests', label: 'Guests', icon: Users },
    { id: 'people', label: 'Our people', icon: Heart },
    { id: 'album', label: 'Shared album', icon: Camera },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#FAF7F2] dark:bg-[#1C171E] border-r border-[#EFECE6] dark:border-[#2B232E]
        flex flex-col justify-between transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Header & Couple Brand */}
        <div className="p-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#4E2634] text-white flex items-center justify-center shadow-xs">
                <span className="text-sm">🪷</span>
              </div>
              <div>
                <span className="font-serif text-lg font-bold tracking-tight text-[#38232B] dark:text-stone-100 flex items-center gap-1.5">
                  RasmReady
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block -mt-0.5">
                  Shaadi, with ease
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Couple Card snippet with official Logo */}
          <div className="mt-4 p-2.5 rounded-2xl bg-[#EFECE6]/70 dark:bg-[#251F29] border border-[#E4DFD7] dark:border-[#382E3C] flex items-center gap-2.5">
            <div className="w-10 h-12 rounded-t-full rounded-b-md overflow-hidden border border-[#C9A984]/70 shadow-2xs shrink-0 bg-[#FAF7F2]">
              <img 
                src={`${import.meta.env.BASE_URL}assets/aistudio/Screenshot_2026-11-06_at_12.09.50_AM_0ee25bbd.png`}
                alt={`${wedding.brideName} & ${wedding.groomName} Logo`} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-serif font-semibold text-xs text-[#38232B] dark:text-stone-100 truncate">
                {wedding.brideName} &amp; {wedding.groomName}
              </p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">
                {new Date(wedding.weddingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · Vivaah
              </p>
            </div>
          </div>

          {/* Side Selector (Ladkiwale / All / Ladkewale) */}
          <div className="mt-3">
            <label className="text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500 mb-1.5 block">
              Perspective
            </label>
            <div className="grid grid-cols-3 gap-1 bg-[#E8E4DD] dark:bg-[#2A232E] p-1 rounded-xl">
              <button
                onClick={() => onSideChange('ladkiwale')}
                className={`py-1 text-[11px] font-medium rounded-lg transition-all ${
                  activeSide === 'ladkiwale'
                    ? 'bg-[#4E2634] text-white shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                }`}
              >
                Ladki
              </button>
              <button
                onClick={() => onSideChange('all')}
                className={`py-1 text-[11px] font-medium rounded-lg transition-all ${
                  activeSide === 'all'
                    ? 'bg-[#4E2634] text-white shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                }`}
              >
                Both
              </button>
              <button
                onClick={() => onSideChange('ladkewale')}
                className={`py-1 text-[11px] font-medium rounded-lg transition-all ${
                  activeSide === 'ladkewale'
                    ? 'bg-[#4E2634] text-white shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                }`}
              >
                Ladke
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-2 overflow-y-auto space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile();
                }}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left
                  ${isActive 
                    ? 'bg-[#4E2634] text-white font-semibold shadow-xs' 
                    : 'text-stone-600 dark:text-stone-300 hover:bg-[#EFECE6] dark:hover:bg-[#251E28] hover:text-[#38232B] dark:hover:text-stone-100'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-200' : 'text-stone-400 dark:text-stone-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`
                    text-[10px] px-2 py-0.5 rounded-full font-semibold
                    ${isActive ? 'bg-white/20 text-white' : 'bg-[#E5DFD5] dark:bg-[#342A38] text-stone-700 dark:text-stone-300'}
                  `}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom User Card & Invite Button */}
        <div className="p-4 border-t border-[#EFECE6] dark:border-[#2B232E] space-y-3">
          <button
            onClick={() => {
              onOpenInviteModal();
              onCloseMobile();
            }}
            className="w-full py-2.5 px-3 bg-[#EAE4DC] dark:bg-[#2B232E] hover:bg-[#E2DCD3] dark:hover:bg-[#352B3A] text-[#38232B] dark:text-stone-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-[#DBD3C8] dark:border-[#3E3243]"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#8B4459]" />
            <span>+ Invite your people</span>
          </button>

          <div 
            onClick={() => onOpenAuthModal && onOpenAuthModal()}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#EFECE6] dark:hover:bg-[#251E28] transition-colors cursor-pointer group"
            title="Click to Switch User / Login / Validate Roles"
          >
            <div className={`
              w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0
              ${currentUser?.isAdmin ? 'bg-[#4E2634]' : 'bg-[#8B4459]'}
            `}>
              {currentUser ? currentUser.avatarLetter : wedding.brideName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate flex items-center justify-between">
                <span>{currentUser ? currentUser.name : wedding.brideName}</span>
                <span className="text-[9px] text-[#8B4459] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Switch
                </span>
              </p>
              <p className="text-[10px] text-stone-400 truncate">
                {currentUser ? `${currentUser.role}` : "Apna log. Apno' ke saath."}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
