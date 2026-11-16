import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  IndianRupee, 
  CheckSquare, 
  Users, 
  Sparkles, 
  Calendar, 
  HeartHandshake, 
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  MapPin,
  ChevronRight,
  ShoppingBag,
  Heart,
  CalendarDays,
  Flame,
  Flower2,
  ExternalLink,
  FileDown
} from 'lucide-react';
import { WeddingSummaryModal } from './WeddingSummaryModal';
import { 
  BudgetItem, 
  TaskItem, 
  VendorItem, 
  GuestItem, 
  SideFilter,
  WeddingConfig,
  CeremonyEvent,
  AppUser
} from '../types/wedding';

interface OverviewViewProps {
  wedding: WeddingConfig;
  budgetItems: BudgetItem[];
  tasks: TaskItem[];
  vendors: VendorItem[];
  guests: GuestItem[];
  activeSide: SideFilter;
  onNavigateTab: (tab: string) => void;
  onSideChange: (side: SideFilter) => void;
  onQuickAdd?: (action: 'task' | 'expense' | 'guest' | 'shopping') => void;
  onToggleTask?: (taskId: string) => void;
  currentUser?: AppUser | null;
  onOpenAuthModal?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  wedding,
  budgetItems,
  tasks,
  vendors,
  guests,
  activeSide,
  onNavigateTab,
  onSideChange,
  onQuickAdd,
  onToggleTask,
  currentUser,
  onOpenAuthModal,
}) => {
  // Target event for countdown switcher
  type CountdownTarget = 'shaadi' | 'haldi' | 'mehendi' | 'sangeet' | 'engagement';
  const [countdownTarget, setCountdownTarget] = useState<CountdownTarget>('shaadi');
  const [isPdfSummaryOpen, setIsPdfSummaryOpen] = useState<boolean>(false);

  // Interactive Blessings / Rose petals shower counter
  const [blessingsCount, setBlessingsCount] = useState<number>(() => {
    const saved = localStorage.getItem('sv_blessings_count');
    return saved ? parseInt(saved, 10) : 151;
  });

  const celebrationTargetDates: Record<CountdownTarget, { label: string; date: string; muhurat: string }> = {
    shaadi: { label: 'Vivaah & Pheras', date: '2027-02-28T18:30:00', muhurat: 'Godhuli Muhurat (6:30 PM)' },
    haldi: { label: 'Haldi Ceremony', date: '2026-12-17T10:00:00', muhurat: 'Shubh Pratah Muhurat (10:00 AM)' },
    sangeet: { label: 'Sangeet Night', date: '2026-12-17T19:30:00', muhurat: 'Bespoke Evening Gala (7:30 PM)' },
    mehendi: { label: "Ketki's Mehendi", date: '2026-12-16T16:00:00', muhurat: 'Auspicious Afternoon (4:00 PM)' },
    engagement: { label: 'Engagement', date: '2026-12-15T18:30:00', muhurat: 'Sagan Muhurat (6:30 PM)' },
  };

  const currentTarget = celebrationTargetDates[countdownTarget] || celebrationTargetDates.shaadi;

  // Live Countdown timer
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date(currentTarget.date).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [currentTarget.date]);

  // Handle Shower Rose Petals Confetti
  const handleShowerPetals = () => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0.6, y: 0.4 },
      colors: ['#E11D48', '#FDA4AF', '#F43F5E', '#F59E0B', '#FDE68A', '#8B4459'],
      shapes: ['circle'],
      scalar: 1.2
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 0.85, y: 0.4 },
      colors: ['#E11D48', '#FDA4AF', '#F43F5E', '#F59E0B', '#FDE68A', '#8B4459'],
      shapes: ['circle'],
      scalar: 1.2
    });

    setBlessingsCount(prev => {
      const updated = prev + 1;
      localStorage.setItem('sv_blessings_count', updated.toString());
      return updated;
    });
  };

  // Google Calendar Link generator
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Wedding of ${wedding.brideName} & ${wedding.groomName} - ${currentTarget.label}`)}&dates=20270228T130000Z/20270228T190000Z&details=${encodeURIComponent(`RasmReady wedding celebrations of ${wedding.brideName} & ${wedding.groomName} at ${wedding.location}. Muhurat: ${currentTarget.muhurat}`)}&location=${encodeURIComponent(wedding.location)}`;

  // Filter items by side
  const filteredBudget = budgetItems.filter(b => activeSide === 'all' || b.side === activeSide || b.side === 'shared');
  const filteredTasks = tasks.filter(t => activeSide === 'all' || t.assignedSide === activeSide || t.assignedSide === 'shared');
  const filteredGuests = guests.filter(g => activeSide === 'all' || g.side === activeSide || g.side === 'mutual');

  // Calculations
  const totalEstimated = filteredBudget.reduce((acc, curr) => acc + curr.estimatedAmount, 0);
  const totalPaid = filteredBudget.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalPending = Math.max(0, totalEstimated - totalPaid);

  const doneTasks = filteredTasks.filter(t => t.status === 'completed' || t.status === 'done');
  const pendingTasks = filteredTasks.filter(t => t.status !== 'completed' && t.status !== 'done');
  const percentTasksDone = filteredTasks.length > 0 ? Math.round((doneTasks.length / filteredTasks.length) * 100) : 0;

  const attendingGuests = filteredGuests.filter(g => g.rsvpStatus === 'attending');
  const totalGuestCount = attendingGuests.reduce((acc, g) => acc + g.adultsCount + g.kidsCount, 0);
  const jainCount = attendingGuests.filter(g => g.dietaryPreference === 'jain').length;
  const hotelRooms = attendingGuests.filter(g => g.hotelStayRequired).length;

  const celebrations = [
    { id: 'engagement', name: 'Engagement & Ring Ceremony', date: 'Dec 15, 2026', time: '6:30 PM', theme: 'Peach & Champagne' },
    { id: 'mehendi_hardik', name: "Hardik's Mehendi", date: 'Dec 16, 2026', time: '11:00 AM', theme: 'Mint & Marigold' },
    { id: 'haldi', name: 'Haldi Phoolon Ki Holika', date: 'Dec 17, 2026', time: '10:00 AM', theme: 'Pithani Sunshine' },
    { id: 'mehendi_ketki', name: "Ketki's Mehendi Soirée", date: 'Dec 17, 2026', time: '4:00 PM', theme: 'Boho Henna Grove' },
    { id: 'sangeet', name: 'Bollywood Sangeet Night', date: 'Dec 17, 2026', time: '7:30 PM', theme: 'Midnight Glamour' },
    { id: 'shaadi', name: 'Vivaah & Vedic Pheras', date: 'Feb 28, 2027', time: '6:00 PM', theme: 'Sindoor & Rajwada' },
  ];

  return (
    <div className="space-y-7">
      
      {/* Top Greeting with User Role Badge and Quick Persona Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#38232B] dark:text-stone-100 tracking-tight">
              Hello, {currentUser ? currentUser.name : wedding.brideName}
            </h1>
            {currentUser && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                currentUser.isAdmin 
                  ? 'bg-rose-100 dark:bg-rose-950/50 text-[#8B4459] dark:text-rose-300 border border-rose-200 dark:border-rose-900/40' 
                  : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40'
              }`}>
                {currentUser.role} · {currentUser.side === 'ladkiwale' ? 'Ladkiwale' : currentUser.side === 'ladkewale' ? 'Ladkewale' : 'Both Sides'}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Big shaadi energy. A little less chaos. Let&apos;s make it yours.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPdfSummaryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4E2634] hover:bg-[#3D1D28] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
            title="Export Wedding Summary as a stylized PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Summary (PDF)</span>
          </button>

          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#251E28] border border-[#E4DFD7] dark:border-[#382E3C] hover:border-[#8B4459] text-xs font-medium text-stone-700 dark:text-stone-300 shadow-2xs hover:bg-white dark:hover:bg-[#2D2430] transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Switch / Test Personas</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Card with Aesthetic Jharokha Arch & Luxury Countdown */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FAF7F2] via-[#F6F1EA] to-[#F2EBE0] dark:from-[#211A24] dark:via-[#1D1720] dark:to-[#171219] border border-[#E8DFD3] dark:border-[#382D3D] p-6 sm:p-8 shadow-sm">
        
        {/* Subtle decorative background watermarks */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 bg-rose-200/20 dark:bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
          
          {/* Couple Details & Location */}
          <div className="lg:col-span-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            
            {/* Official Bride & Groom Jharokha Arch Logo */}
            <div className="relative group shrink-0">
              <div className="w-28 sm:w-32 rounded-t-full rounded-b-2xl overflow-hidden shadow-md border-2 border-[#C9A984]/70 dark:border-[#8E6E52] bg-[#FAF7F2] dark:bg-[#251E28] transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/assets/aistudio/Screenshot_2026-11-06_at_12.09.50_AM_0ee25bbd.png"
                  alt={`${wedding.brideName} & ${wedding.groomName} Vivaah Official Logo`}
                  className="w-full h-auto object-cover block"
                />
              </div>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-[#2B232E]/80 backdrop-blur-xs text-[11px] text-stone-700 dark:text-stone-300 font-medium border border-[#E5DFD6] dark:border-[#382D3D] shadow-2xs">
                <MapPin className="w-3 h-3 text-[#8B4459]" />
                <span className="truncate">{wedding.location}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#38232B] dark:text-stone-100 tracking-tight">
                {wedding.brideName} &amp; {wedding.groomName}
              </h2>

              <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                28 February 2027 · {wedding.muhuratTime || 'Godhuli Muhurat'}
              </p>

              <p className="text-[11px] text-stone-400 italic font-serif">
                दो दिलों का पावन संगम · Seven vows under starry skies
              </p>

              {/* Quick Action Pills */}
              <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  onClick={() => onQuickAdd ? onQuickAdd('task') : onNavigateTab('tasks')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#4E2634] hover:bg-[#3D1D28] text-white text-[11px] font-semibold transition-colors shadow-2xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add task</span>
                </button>
                <button
                  onClick={() => onQuickAdd ? onQuickAdd('expense') : onNavigateTab('budget')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#2B232E] hover:bg-[#FAF7F2] dark:hover:bg-[#352B3A] text-stone-800 dark:text-stone-200 text-[11px] font-semibold transition-colors border border-[#DFD8CD] dark:border-[#3D3242] shadow-2xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Record expense</span>
                </button>
                <button
                  onClick={() => onQuickAdd ? onQuickAdd('guest') : onNavigateTab('guests')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#2B232E] hover:bg-[#FAF7F2] dark:hover:bg-[#352B3A] text-stone-800 dark:text-stone-200 text-[11px] font-semibold transition-colors border border-[#DFD8CD] dark:border-[#3D3242] shadow-2xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add guests</span>
                </button>
                <button
                  onClick={() => onQuickAdd ? onQuickAdd('shopping') : onNavigateTab('shopping')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#2B232E] hover:bg-[#FAF7F2] dark:hover:bg-[#352B3A] text-stone-800 dark:text-stone-200 text-[11px] font-semibold transition-colors border border-[#DFD8CD] dark:border-[#3D3242] shadow-2xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Shopping item</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Highly Aesthetic Luxury Countdown Card */}
          <div className="lg:col-span-6 bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EF] to-[#F5ECE0] dark:from-[#29202D] dark:via-[#241A27] dark:to-[#1C1420] p-5 sm:p-6 rounded-3xl border-2 border-[#E5D7C5]/90 dark:border-[#4A394E] shadow-md relative overflow-hidden">
            
            {/* Auspicious Arch Filigree Header */}
            <div className="text-center relative">
              <span className="text-[10px] tracking-[0.3em] font-serif text-[#C9A984] dark:text-[#E2C5A5] uppercase font-bold block mb-0.5">
                ॥ ॐ श्री गणेशाय नमः ॥
              </span>
              
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm">🪷</span>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#38232B] dark:text-stone-100">
                  {currentTarget.label}
                </h3>
                <span className="text-sm">🪷</span>
              </div>

              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                {currentTarget.muhurat}
              </p>
            </div>

            {/* Ceremony Countdown Switcher Pills */}
            <div className="mt-3 flex items-center justify-center gap-1 overflow-x-auto pb-1 text-[10px]">
              {(Object.keys(celebrationTargetDates) as CountdownTarget[]).map((key) => {
                const isActive = countdownTarget === key;
                return (
                  <button
                    key={key}
                    onClick={() => setCountdownTarget(key)}
                    className={`px-2.5 py-1 rounded-full font-semibold transition-all whitespace-nowrap ${
                      isActive 
                        ? 'bg-[#4E2634] text-white shadow-xs' 
                        : 'bg-white/70 dark:bg-[#322536] text-stone-600 dark:text-stone-300 hover:bg-white border border-[#EAE2D5] dark:border-[#3F2F44]'
                    }`}
                  >
                    {celebrationTargetDates[key].label}
                  </button>
                );
              })}
            </div>

            {/* Four Luxury Ceramic Ivory Countdown Pods */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 mt-4">
              
              {/* Days Pod */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#201724] border border-[#E8DFD3] dark:border-[#3E2F43] shadow-xs text-center relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C9A984] to-transparent opacity-60" />
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#4E2634] dark:text-[#F3CBD4] block tabular-nums leading-tight">
                  {timeLeft.days}
                </span>
                <span className="text-[9px] uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500 block mt-1">
                  Days
                </span>
              </div>

              {/* Hours Pod */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#201724] border border-[#E8DFD3] dark:border-[#3E2F43] shadow-xs text-center relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C9A984] to-transparent opacity-60" />
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#4E2634] dark:text-[#F3CBD4] block tabular-nums leading-tight">
                  {timeLeft.hours}
                </span>
                <span className="text-[9px] uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500 block mt-1">
                  Hours
                </span>
              </div>

              {/* Minutes Pod */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#201724] border border-[#E8DFD3] dark:border-[#3E2F43] shadow-xs text-center relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C9A984] to-transparent opacity-60" />
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#4E2634] dark:text-[#F3CBD4] block tabular-nums leading-tight">
                  {timeLeft.minutes}
                </span>
                <span className="text-[9px] uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500 block mt-1">
                  Mins
                </span>
              </div>

              {/* Seconds Pod with pulsing ruby accent */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#201724] border border-[#E8DFD3] dark:border-[#3E2F43] shadow-xs text-center relative overflow-hidden group ring-1 ring-[#8B4459]/20">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping opacity-75" />
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#8B4459] dark:text-rose-400 block tabular-nums leading-tight">
                  {timeLeft.seconds}
                </span>
                <span className="text-[9px] uppercase tracking-wider font-semibold text-rose-500/80 dark:text-rose-400/80 block mt-1">
                  Secs
                </span>
              </div>

            </div>

            {/* Bottom Actions: Shower Rose Petals & Save to Calendar */}
            <div className="mt-4 pt-3 border-t border-[#EAE1D3] dark:border-[#36273B] flex flex-wrap items-center justify-between gap-2 text-xs">
              
              {/* Shower Petals Button */}
              <button
                onClick={handleShowerPetals}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/30 text-[#8B4459] dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 font-semibold hover:scale-105 active:scale-95 transition-all shadow-2xs"
                title="Shower auspicious rose petals & marigolds"
              >
                <span>🌸</span>
                <span>Shower Petals ({blessingsCount})</span>
              </button>

              {/* Add to Google Calendar Link */}
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 dark:text-stone-300 hover:text-[#4E2634] dark:hover:text-white transition-colors"
                title="Add celebration to Google Calendar"
              >
                <CalendarDays className="w-3.5 h-3.5 text-[#C9A984]" />
                <span>Save to Calendar</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>

            </div>

          </div>

        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Spent */}
        <div 
          onClick={() => onNavigateTab('budget')}
          className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#221C26] border border-[#E8E2D8] dark:border-[#342A38] hover:border-[#4E2634]/30 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Total spent
            </span>
            <div className="p-1.5 rounded-lg bg-[#EFECE6] dark:bg-[#2E2432] text-[#8B4459]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-serif font-bold text-[#38232B] dark:text-stone-100">
            ₹{totalPaid.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            of ₹{totalEstimated.toLocaleString('en-IN')} estimated
          </p>
        </div>

        {/* KPI 2: Tasks Completed */}
        <div 
          onClick={() => onNavigateTab('tasks')}
          className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#221C26] border border-[#E8E2D8] dark:border-[#342A38] hover:border-[#4E2634]/30 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Tasks completed
            </span>
            <div className="p-1.5 rounded-lg bg-[#EFECE6] dark:bg-[#2E2432] text-amber-700">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-serif font-bold text-[#38232B] dark:text-stone-100">
            {doneTasks.length} of {filteredTasks.length}
          </p>
          <div className="mt-2 w-full h-1.5 rounded-full bg-[#E5DFD6] dark:bg-[#342A38] overflow-hidden">
            <div 
              className="h-full bg-[#8B4459] rounded-full transition-all duration-300"
              style={{ width: `${percentTasksDone}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Guests Confirmed */}
        <div 
          onClick={() => onNavigateTab('guests')}
          className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#221C26] border border-[#E8E2D8] dark:border-[#342A38] hover:border-[#4E2634]/30 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Guests confirmed
            </span>
            <div className="p-1.5 rounded-lg bg-[#EFECE6] dark:bg-[#2E2432] text-emerald-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-serif font-bold text-[#38232B] dark:text-stone-100">
            {totalGuestCount} confirmed
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            {hotelRooms} hotel rooms · {jainCount} Jain families
          </p>
        </div>

        {/* KPI 4: Celebrations */}
        <div 
          onClick={() => onNavigateTab('moodboards')}
          className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#221C26] border border-[#E8E2D8] dark:border-[#342A38] hover:border-[#4E2634]/30 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Our celebrations
            </span>
            <div className="p-1.5 rounded-lg bg-[#EFECE6] dark:bg-[#2E2432] text-purple-700">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-serif font-bold text-[#38232B] dark:text-stone-100">
            {celebrations.length} ceremonies
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            Roka through to Reception
          </p>
        </div>

      </div>

      {/* Aaj ki taiyaari & Your planning pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Aaj ki taiyaari */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#221C26] border border-[#E8E2D8] dark:border-[#342A38] shadow-xs">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#EFECE6] dark:border-[#2F2633]">
            <div>
              <h2 className="font-serif font-bold text-base text-[#38232B] dark:text-stone-100 flex items-center gap-2">
                <span>🪷</span>
                <span>Aaj ki taiyaari (Today&apos;s focus)</span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Top responsibilities requiring immediate care
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs font-semibold text-[#8B4459] hover:underline flex items-center gap-1"
            >
              <span>View all tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {pendingTasks.slice(0, 4).map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#2A232E] border border-[#E8E2D8] dark:border-[#382E3C] hover:border-[#4E2634]/30 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleTask && onToggleTask(task.id)}
                    className="w-5 h-5 rounded-md border border-stone-300 dark:border-stone-600 hover:border-[#4E2634] flex items-center justify-center shrink-0"
                    title="Mark task done"
                  >
                    <Circle className="w-3.5 h-3.5 text-stone-300" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-stone-800 dark:text-stone-200 truncate">
                      {task.title}
                    </p>
                    <p className="text-[10px] text-stone-400 flex items-center gap-2 mt-0.5">
                      <span>{task.assignedToName} ({task.assignedFamilyRole || task.assignedSide})</span>
                      <span>·</span>
                      <span className="capitalize">{task.event}</span>
                    </p>
                  </div>
                </div>

                <span className={`
                  text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2
                  ${task.priority === 'urgent' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-[#EFECE6] text-stone-600 dark:bg-[#322836] dark:text-stone-300'}
                `}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Your planning pulse */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#221C26] border border-[#E8E2D8] dark:border-[#342A38] shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-serif font-bold text-base text-[#38232B] dark:text-stone-100">
              Your planning pulse
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Everything in harmony
            </p>

            <div className="mt-5 space-y-3.5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-stone-600 dark:text-stone-300">Tasks readiness</span>
                  <span className="font-bold text-[#8B4459]">{percentTasksDone}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E5DFD6] dark:bg-[#342A38] overflow-hidden">
                  <div className="h-full bg-[#8B4459] rounded-full" style={{ width: `${percentTasksDone}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-stone-600 dark:text-stone-300">Budget settled</span>
                  <span className="font-bold text-emerald-700">
                    {totalEstimated > 0 ? Math.round((totalPaid / totalEstimated) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E5DFD6] dark:bg-[#342A38] overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full" 
                    style={{ width: `${totalEstimated > 0 ? (totalPaid / totalEstimated) * 100 : 0}%` }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-stone-600 dark:text-stone-300">RSVP confirmations</span>
                  <span className="font-bold text-amber-700">
                    {filteredGuests.length > 0 ? Math.round((attendingGuests.length / filteredGuests.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E5DFD6] dark:bg-[#342A38] overflow-hidden">
                  <div 
                    className="h-full bg-amber-600 rounded-full" 
                    style={{ width: `${filteredGuests.length > 0 ? (attendingGuests.length / filteredGuests.length) * 100 : 0}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-[#EFECE6] dark:bg-[#2A232E] border border-[#E5DFD6] dark:border-[#382E3C] text-[11px] text-stone-500 dark:text-stone-400">
            ✨ You are right on schedule for the February 28, 2027 celebrations!
          </div>
        </div>

      </div>

      {/* Celebration Journey Timeline */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#221C26] border border-[#E8E2D8] dark:border-[#342A38] shadow-xs">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#EFECE6] dark:border-[#2F2633]">
          <div>
            <h2 className="font-serif font-bold text-base text-[#38232B] dark:text-stone-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8B4459]" />
              <span>Celebration journey</span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              The rituals, ceremonies, and milestone celebrations planned for Ketki &amp; Hardik
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('moodboards')}
            className="text-xs font-semibold text-[#8B4459] hover:underline"
          >
            Explore moodboards →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
          {celebrations.map((cel, idx) => (
            <div
              key={cel.id}
              onClick={() => onNavigateTab('moodboards')}
              className="p-4 rounded-xl bg-white dark:bg-[#2A232E] border border-[#E8E2D8] dark:border-[#382E3C] hover:border-[#4E2634]/40 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-serif font-bold text-stone-800 dark:text-stone-100">
                  {cel.name}
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  Step {idx + 1}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                {cel.date} · {cel.time}
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-[#EFECE6] dark:bg-[#342B38] text-stone-700 dark:text-stone-300 font-medium">
                  {cel.theme}
                </span>
                <span className="text-[#8B4459] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  View <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wedding Executive Summary Modal (Print & PDF Export) */}
      <WeddingSummaryModal
        isOpen={isPdfSummaryOpen}
        onClose={() => setIsPdfSummaryOpen(false)}
        wedding={wedding}
        budgetItems={budgetItems}
        tasks={tasks}
        vendors={vendors}
        guests={guests}
      />

    </div>
  );
};
