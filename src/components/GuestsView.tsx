import React, { useState } from 'react';
import { weddingContacts, weddingSchedule } from '../lib/weddingDetails';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Phone, 
  Send, 
  Hotel, 
  Utensils, 
  Check, 
  Clock, 
  X,
  Filter,
  Car,
  PieChart,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { 
  GuestItem, 
  SideFilter, 
  CeremonyEvent, 
  DietaryPreference, 
  RSVPStatus,
  WeddingConfig,
  TaskItem
} from '../types/wedding';

interface GuestsViewProps {
  wedding: WeddingConfig;
  tasks: TaskItem[];
  guests: GuestItem[];
  activeSide: SideFilter;
  onAdd: (guest: Omit<GuestItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<GuestItem>) => void;
  onDelete: (id: string) => void;
}

export const GuestsView: React.FC<GuestsViewProps> = ({
  wedding,
  tasks,
  guests,
  activeSide,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [selectedRSVP, setSelectedRSVP] = useState<string>('all');
  const [selectedDiet, setSelectedDiet] = useState<string>('all');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);
  const [inviteModalGuest, setInviteModalGuest] = useState<GuestItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    side: 'ladkiwale' as 'ladkiwale' | 'ladkewale' | 'mutual',
    familyGroup: '',
    relation: '',
    adultsCount: 2,
    kidsCount: 0,
    eventsInvited: ['shaadi', 'reception'] as CeremonyEvent[],
    eventsAttending: ['shaadi', 'reception'] as CeremonyEvent[],
    rsvpStatus: 'pending' as RSVPStatus,
    dietaryPreference: 'pure_veg' as DietaryPreference,
    hotelStayRequired: true,
    roomAllocated: '',
    pickupRequired: false,
    notes: '',
  });

  const filtered = guests.filter(g => {
    const matchesSide = activeSide === 'all' || g.side === activeSide || g.side === 'mutual';
    const matchesRSVP = selectedRSVP === 'all' || g.rsvpStatus === selectedRSVP;
    const matchesDiet = selectedDiet === 'all' || g.dietaryPreference === selectedDiet;
    return matchesSide && matchesRSVP && matchesDiet;
  });

  const totalAdults = guests.filter(g => g.rsvpStatus === 'attending').reduce((a, c) => a + c.adultsCount, 0);
  const totalKids = guests.filter(g => g.rsvpStatus === 'attending').reduce((a, c) => a + c.kidsCount, 0);
  const jainCount = guests.filter(g => g.rsvpStatus === 'attending' && g.dietaryPreference === 'jain').length;
  const hotelCount = guests.filter(g => g.hotelStayRequired).length;

  // Active focal ceremony for the visual progress ring
  const [activeRingEvent, setActiveRingEvent] = useState<CeremonyEvent | 'all'>('all');

  // Multi-Event RSVP Progress Ring Computations
  const getEventRsvpStats = (ev: CeremonyEvent | 'all') => {
    if (ev === 'all') {
      const totalHeadcount = guests.reduce((a, c) => a + (c.adultsCount || 0) + (c.kidsCount || 0), 0);
      const attendingHeadcount = guests.filter(g => g.rsvpStatus === 'attending').reduce((a, c) => a + (c.adultsCount || 0) + (c.kidsCount || 0), 0);
      const pendingHeadcount = guests.filter(g => g.rsvpStatus === 'pending').reduce((a, c) => a + (c.adultsCount || 0) + (c.kidsCount || 0), 0);
      const declinedHeadcount = guests.filter(g => g.rsvpStatus === 'declined').reduce((a, c) => a + (c.adultsCount || 0) + (c.kidsCount || 0), 0);
      const percent = totalHeadcount > 0 ? Math.round((attendingHeadcount / totalHeadcount) * 100) : 0;
      return {
        label: 'Overall Vivaah Festivities',
        sub: 'Across all guest invitations',
        total: totalHeadcount,
        attending: attendingHeadcount,
        pending: pendingHeadcount,
        declined: declinedHeadcount,
        percent,
        color: '#10B981', // emerald
      };
    }

    const invited = guests.filter(g => g.eventsInvited && g.eventsInvited.includes(ev));
    const totalHeadcount = invited.reduce((a, c) => a + (c.adultsCount || 0) + (c.kidsCount || 0), 0);
    const attendingHeadcount = invited
      .filter(g => g.rsvpStatus === 'attending' && g.eventsAttending && g.eventsAttending.includes(ev))
      .reduce((a, c) => a + (c.adultsCount || 0) + (c.kidsCount || 0), 0);
    const pendingHeadcount = invited
      .filter(g => g.rsvpStatus === 'pending')
      .reduce((a, c) => a + (c.adultsCount || 0) + (c.kidsCount || 0), 0);
    const declinedHeadcount = Math.max(0, totalHeadcount - attendingHeadcount - pendingHeadcount);
    const percent = totalHeadcount > 0 ? Math.round((attendingHeadcount / totalHeadcount) * 100) : 0;

    const eventMeta: Record<string, { label: string; sub: string; color: string }> = {
      haldi: { label: 'Haldi Ceremony', sub: 'Phoolon ki Holi', color: '#F59E0B' },
      mehendi: { label: `${wedding.brideName}'s Mehendi`, sub: 'Henna & Music', color: '#059669' },
      sangeet: { label: 'Sangeet Gala', sub: 'Bollywood Night', color: '#6366F1' },
      shaadi: { label: 'Vedic Pheras & Vivaah', sub: 'Main Muhurat Ceremony', color: '#E11D48' },
      reception: { label: 'Grand Reception', sub: 'Dinner & Blessings', color: '#8B5CF6' },
    };

    const meta = eventMeta[ev] || { label: ev, sub: 'Ceremony', color: '#4E2634' };

    return {
      label: meta.label,
      sub: meta.sub,
      total: totalHeadcount,
      attending: attendingHeadcount,
      pending: pendingHeadcount,
      declined: declinedHeadcount,
      percent,
      color: meta.color,
    };
  };

  const activeStats = getEventRsvpStats(activeRingEvent);
  const ceremoniesList: CeremonyEvent[] = ['haldi', 'mehendi', 'sangeet', 'shaadi', 'reception'];

  // Side-by-side RSVP breakdown
  const ladkiGuests = guests.filter(g => g.side === 'ladkiwale');
  const ladkiTotal = ladkiGuests.reduce((a, c) => a + c.adultsCount + c.kidsCount, 0);
  const ladkiAttending = ladkiGuests.filter(g => g.rsvpStatus === 'attending').reduce((a, c) => a + c.adultsCount + c.kidsCount, 0);
  const ladkiPercent = ladkiTotal > 0 ? Math.round((ladkiAttending / ladkiTotal) * 100) : 0;

  const ladkeGuests = guests.filter(g => g.side === 'ladkewale');
  const ladkeTotal = ladkeGuests.reduce((a, c) => a + c.adultsCount + c.kidsCount, 0);
  const ladkeAttending = ladkeGuests.filter(g => g.rsvpStatus === 'attending').reduce((a, c) => a + c.adultsCount + c.kidsCount, 0);
  const ladkePercent = ladkeTotal > 0 ? Math.round((ladkeAttending / ladkeTotal) * 100) : 0;

  const openCreateModal = () => {
    setEditingGuest(null);
    setFormData({
      name: '',
      phone: '+91 ',
      email: '',
      side: activeSide === 'all' ? 'ladkiwale' : activeSide,
      familyGroup: '',
      relation: '',
      adultsCount: 2,
      kidsCount: 0,
      eventsInvited: ['haldi', 'mehendi', 'sangeet', 'shaadi', 'reception'],
      eventsAttending: ['shaadi', 'reception'],
      rsvpStatus: 'pending',
      dietaryPreference: 'pure_veg',
      hotelStayRequired: true,
      roomAllocated: '',
      pickupRequired: false,
      notes: '',
    });
    setModalMode('create');
  };

  const openEditModal = (g: GuestItem) => {
    setEditingGuest(g);
    setFormData({
      name: g.name,
      phone: g.phone,
      email: g.email || '',
      side: g.side,
      familyGroup: g.familyGroup,
      relation: g.relation,
      adultsCount: g.adultsCount,
      kidsCount: g.kidsCount,
      eventsInvited: g.eventsInvited,
      eventsAttending: g.eventsAttending,
      rsvpStatus: g.rsvpStatus,
      dietaryPreference: g.dietaryPreference,
      hotelStayRequired: g.hotelStayRequired,
      roomAllocated: g.roomAllocated || '',
      pickupRequired: g.pickupRequired,
      notes: g.notes || '',
    });
    setModalMode('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      onAdd({
        weddingId: 'wedding-ketki-hardik-2027',
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        side: formData.side,
        familyGroup: formData.familyGroup || formData.name,
        relation: formData.relation || 'Relative',
        adultsCount: Number(formData.adultsCount),
        kidsCount: Number(formData.kidsCount),
        eventsInvited: formData.eventsInvited,
        eventsAttending: formData.eventsAttending,
        rsvpStatus: formData.rsvpStatus,
        dietaryPreference: formData.dietaryPreference,
        hotelStayRequired: Boolean(formData.hotelStayRequired),
        roomAllocated: formData.roomAllocated,
        pickupRequired: Boolean(formData.pickupRequired),
        notes: formData.notes,
      });
    } else if (modalMode === 'edit' && editingGuest) {
      onUpdate(editingGuest.id, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        side: formData.side,
        familyGroup: formData.familyGroup,
        relation: formData.relation,
        adultsCount: Number(formData.adultsCount),
        kidsCount: Number(formData.kidsCount),
        eventsInvited: formData.eventsInvited,
        eventsAttending: formData.eventsAttending,
        rsvpStatus: formData.rsvpStatus,
        dietaryPreference: formData.dietaryPreference,
        hotelStayRequired: Boolean(formData.hotelStayRequired),
        roomAllocated: formData.roomAllocated,
        pickupRequired: Boolean(formData.pickupRequired),
        notes: formData.notes,
      });
    }
    setModalMode(null);
  };

  const [isECardModalOpen, setIsECardModalOpen] = useState(false);
  const [selectedECardEvent, setSelectedECardEvent] = useState<CeremonyEvent>('shaadi');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [copyError, setCopyError] = useState('');

  const keyContacts = weddingContacts(tasks);
  const ceremony = weddingSchedule(wedding)[0];

  const generateWhatsAppMessage = (guest?: GuestItem, eventName?: CeremonyEvent) => {
    const guestGreeting = guest ? `Dear ${guest.name},` : 'Dear Family & Friends,';
    const eventDetail = eventName && eventName !== 'all' ? `for the *${eventName.toUpperCase()}* ceremony` : 'for the auspicious wedding ceremonies';
    
    const text = `🌸 *RasmReady Wedding Invitation* 🌸\n\n${guestGreeting}\nWe cordially invite you and your family to celebrate the joyful union of *${wedding.brideName} & ${wedding.groomName}* ${eventDetail}! 🪷\n\n📍 *Venue & Map:* ${wedding.location}\nhttps://maps.google.com/?q=${encodeURIComponent(wedding.location)}\n\n📅 *Wedding:* ${ceremony.date}, ${ceremony.time}\n\nPlease reply to this invitation with your RSVP and dietary preferences.\n\n${keyContacts.map(contact => `${contact.name} (${contact.role}): ${contact.phone}`).join('\n')}\n\nWith love and respect,\n${wedding.brideName} & ${wedding.groomName} and Families 🙏`;
    return encodeURIComponent(text);
  };

  const handleCopyInviteText = async (guest?: GuestItem, eventName?: CeremonyEvent) => {
    const rawText = decodeURIComponent(generateWhatsAppMessage(guest, eventName));
    setCopyFeedback(false);
    setCopyError('');
    try {
      await navigator.clipboard.writeText(rawText);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    } catch (error) {
      console.error('Invitation copy failed:', error);
      setCopyError('Could not copy the invitation. Allow clipboard access and try again.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            Guest List &amp; Multi-Event RSVPs
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Track Ladkiwale &amp; Ladkewale guests, Jain/Pure Veg meals, hotel room assignments, and send WhatsApp invites.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Digital E-Card & WhatsApp Broadcast Button */}
          <button
            onClick={() => setIsECardModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors shadow-2xs shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-emerald-600" />
            <span>Digital E-Cards &amp; WhatsApp</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#4E2634] hover:bg-[#3D1D28] dark:bg-[#683345] dark:hover:bg-[#572939] rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* Visual RSVP Progress Ring & Multi-Event Attendance Visualizer */}
      <div className="rounded-3xl bg-gradient-to-br from-[#FAF7F2] via-[#F5EFE6] to-[#EFE7DC] dark:from-[#211B24] dark:via-[#1D1720] dark:to-[#171219] border border-[#E6DDD1] dark:border-[#382D3D] p-5 sm:p-6 shadow-sm">
        
        {/* Top Header of the Visualizer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8DFD3] dark:border-[#332738]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#4E2634] text-white flex items-center justify-center shadow-xs text-xs">
              <PieChart className="w-4 h-4 text-rose-200" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#38232B] dark:text-stone-100 flex flex-wrap items-center gap-2">
                <span>Multi-Event RSVP Attendance Ring</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Live Attendance
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Visual confirmation rate across individual ceremonies &amp; guest sides
              </p>
            </div>
          </div>

          {/* Ceremony Filter Switcher */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveRingEvent('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeRingEvent === 'all'
                  ? 'bg-[#4E2634] text-white shadow-xs'
                  : 'bg-white/80 dark:bg-[#2A232E] text-stone-600 dark:text-stone-300 hover:bg-white border border-[#E5DDD0] dark:border-[#3A2E3F]'
              }`}
            >
              Overall All Functions
            </button>
            {ceremoniesList.map(ev => {
              const evStats = getEventRsvpStats(ev);
              const isActive = activeRingEvent === ev;
              return (
                <button
                  key={ev}
                  onClick={() => setActiveRingEvent(ev)}
                  className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#4E2634] text-white shadow-xs'
                      : 'bg-white/80 dark:bg-[#2A232E] text-stone-600 dark:text-stone-300 hover:bg-white border border-[#E5DDD0] dark:border-[#3A2E3F]'
                  }`}
                >
                  <span>{ev}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-stone-200/80 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                  }`}>
                    {evStats.percent}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Grid: Main Visual Progress Ring + Ceremony Breakdown + Side Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-5">
          
          {/* Left: Main Focal Circular SVG Progress Ring */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  className="stroke-[#E8DFD3] dark:stroke-[#352B3A]"
                  strokeWidth="9"
                  fill="transparent"
                />
                {/* Progress Ring with strokeDashoffset */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  stroke={activeStats.color}
                  strokeWidth="9"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 - (activeStats.percent / 100) * (2 * Math.PI * 48)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Inside Ring Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-serif font-extrabold text-[#38232B] dark:text-stone-100 tracking-tight leading-none">
                  {activeStats.percent}%
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mt-1">
                  Confirmed
                </span>
                <span className="text-[11px] font-mono text-stone-600 dark:text-stone-300 mt-0.5">
                  {activeStats.attending} / {activeStats.total}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold capitalize bg-white/80 dark:bg-[#2C2330] border border-[#E5DDD2] dark:border-[#382D3D] text-[#4E2634] dark:text-rose-200">
                {activeStats.label}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {activeStats.sub}
              </p>
              
              <div className="space-y-1 pt-1 text-xs">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-stone-700 dark:text-stone-300 font-medium">Attending:</span>
                  <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{activeStats.attending} guests</span>
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-stone-700 dark:text-stone-300 font-medium">Pending:</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{activeStats.pending} guests</span>
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-400 shrink-0" />
                  <span className="text-stone-700 dark:text-stone-300 font-medium">Declined:</span>
                  <span className="font-mono text-stone-500">{activeStats.declined} guests</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Comparative Mini Rings for all 5 events */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
              <span>Ceremony Attendance Rings At-A-Glance:</span>
              <span className="text-[11px] text-[#8B4459] font-serif italic">Tap ceremony to view</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {ceremoniesList.map(ev => {
                const s = getEventRsvpStats(ev);
                const isSelected = activeRingEvent === ev;
                return (
                  <button
                    key={ev}
                    onClick={() => setActiveRingEvent(ev)}
                    className={`p-2.5 rounded-2xl transition-all text-center flex flex-col items-center justify-between gap-1.5 border cursor-pointer ${
                      isSelected 
                        ? 'bg-white dark:bg-[#2C2330] border-[#4E2634] shadow-sm ring-1 ring-[#4E2634]' 
                        : 'bg-white/60 dark:bg-[#251E28]/60 hover:bg-white dark:hover:bg-[#2B232E] border-[#E8DFD3] dark:border-[#382D3D]'
                    }`}
                  >
                    <span className="text-[11px] font-bold capitalize text-stone-800 dark:text-stone-200 truncate w-full">
                      {ev}
                    </span>

                    {/* Mini Circular SVG */}
                    <div className="relative w-12 h-12 flex items-center justify-center my-0.5">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                        <circle
                          cx="20"
                          cy="20"
                          r="15"
                          className="stroke-[#EBE3D7] dark:stroke-[#382E3C]"
                          strokeWidth="3.5"
                          fill="transparent"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r="15"
                          stroke={s.color}
                          strokeWidth="3.5"
                          strokeDasharray={2 * Math.PI * 15}
                          strokeDashoffset={2 * Math.PI * 15 - (s.percent / 100) * (2 * Math.PI * 15)}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-500"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-mono font-bold text-stone-800 dark:text-stone-200">
                        {s.percent}%
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                      {s.attending}/{s.total}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Ladkiwale vs Ladkewale Confirmation Progress Meters */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#251E28] border border-[#E7DFD4] dark:border-[#382E3C] space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-rose-800 dark:text-rose-300">Ladkiwale RSVP Rate:</span>
                  <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{ladkiPercent}% ({ladkiAttending}/{ladkiTotal})</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#E8E2D8] dark:bg-[#342A38] overflow-hidden">
                  <div className="h-full bg-rose-600 rounded-full transition-all duration-500" style={{ width: `${ladkiPercent}%` }} />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#251E28] border border-[#E7DFD4] dark:border-[#382E3C] space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-amber-800 dark:text-amber-300">Ladkewale RSVP Rate:</span>
                  <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{ladkePercent}% ({ladkeAttending}/{ladkeTotal})</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#E8E2D8] dark:bg-[#342A38] overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full transition-all duration-500" style={{ width: `${ladkePercent}%` }} />
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Confirmed Adults</span>
          <div className="mt-2 text-2xl font-mono tabular-nums font-bold text-stone-900 dark:text-stone-100">
            {totalAdults}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">Plus {totalKids} kids attending</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Jain Food (No Onion/Garlic)</span>
          <div className="mt-2 text-2xl font-mono tabular-nums font-bold text-amber-700 dark:text-amber-400">
            {jainCount} families
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">Dedicated Jain live buffet counter</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Hotel Rooms Needed</span>
          <div className="mt-2 text-2xl font-mono tabular-nums font-bold text-indigo-700 dark:text-indigo-400">
            {hotelCount}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">Outstation guest accommodation</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Side Split Attendance</span>
          <div className="mt-2 space-y-1 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-rose-700 font-sans font-medium">Ladkiwale:</span>
              <span>{guests.filter(g => g.side === 'ladkiwale').length} entries</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-700 font-sans font-medium">Ladkewale:</span>
              <span>{guests.filter(g => g.side === 'ladkewale').length} entries</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-700 font-sans font-medium">Mutual Friends:</span>
              <span>{guests.filter(g => g.side === 'mutual').length} entries</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] rounded-xl text-xs">
        <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 mr-2 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        <select
          value={selectedRSVP}
          onChange={(e) => setSelectedRSVP(e.target.value)}
          className="px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300 focus:outline-none"
        >
          <option value="all">All RSVP Statuses</option>
          <option value="attending">Confirmed Attending</option>
          <option value="pending">Pending Confirmation</option>
          <option value="declined">Declined</option>
        </select>

        <select
          value={selectedDiet}
          onChange={(e) => setSelectedDiet(e.target.value)}
          className="px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300 focus:outline-none"
        >
          <option value="all">All Dietary Preferences</option>
          <option value="pure_veg">Pure Vegetarian</option>
          <option value="jain">Jain (No Onion / Garlic)</option>
          <option value="non_veg">Non-Vegetarian</option>
          <option value="standard">Standard Buffet</option>
        </select>

        <span className="ml-auto text-stone-400">
          Showing {filtered.length} of {guests.length} guest records
        </span>
      </div>

      {/* Guests Table */}
      <div className="overflow-x-auto rounded-xl bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700 bg-stone-50/75 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Guest / Family Name</th>
              <th className="py-3 px-4">Family Side</th>
              <th className="py-3 px-4">Relation / Group</th>
              <th className="py-3 px-4 text-center">Heads</th>
              <th className="py-3 px-4">Dietary</th>
              <th className="py-3 px-4">Stay &amp; Room</th>
              <th className="py-3 px-4 text-center">RSVP</th>
              <th className="py-3 px-4 text-right">Actions &amp; WhatsApp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-stone-400">
                  No guests found matching current filters. Click &quot;Add Guest / Family&quot; to begin.
                </td>
              </tr>
            ) : (
              filtered.map((guest) => {
                const cleanPhone = guest.phone.replace(/[^0-9]/g, '');
                return (
                  <tr key={guest.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{guest.name}</div>
                      <div className="text-[11px] text-stone-400">{guest.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      {guest.side === 'ladkiwale' && (
                        <span className="text-rose-700 dark:text-rose-400 font-medium">Ladkiwale</span>
                      )}
                      {guest.side === 'ladkewale' && (
                        <span className="text-amber-700 dark:text-amber-400 font-medium">Ladkewale</span>
                      )}
                      {guest.side === 'mutual' && (
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">Mutual</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div>{guest.relation}</div>
                      <div className="text-[11px] text-stone-400">{guest.familyGroup}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums font-medium">
                      {guest.adultsCount} Adults {guest.kidsCount > 0 ? `+ ${guest.kidsCount} K` : ''}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                        guest.dietaryPreference === 'jain'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : guest.dietaryPreference === 'pure_veg'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300'
                      }`}>
                        <Utensils className="w-3 h-3" />
                        <span className="capitalize">{guest.dietaryPreference.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {guest.hotelStayRequired ? (
                        <div className="flex items-center gap-1 text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
                          <Hotel className="w-3 h-3" />
                          <span>{guest.roomAllocated || 'Room Needed'}</span>
                        </div>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Local stay</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          const next: Record<RSVPStatus, RSVPStatus> = {
                            pending: 'attending',
                            attending: 'declined',
                            declined: 'pending',
                            tentative: 'attending'
                          };
                          onUpdate(guest.id, { rsvpStatus: next[guest.rsvpStatus] });
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                          guest.rsvpStatus === 'attending'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : guest.rsvpStatus === 'pending'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                        }`}
                        title="Click to toggle RSVP status"
                      >
                        {guest.rsvpStatus === 'attending' && <Check className="w-3 h-3" />}
                        {guest.rsvpStatus === 'pending' && <Clock className="w-3 h-3" />}
                        <span className="capitalize">{guest.rsvpStatus}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${generateWhatsAppMessage(guest)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors"
                          title="Send Invitation on WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => openEditModal(guest)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
                          title="Edit Guest Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete guest "${guest.name}"?`)) {
                              onDelete(guest.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
                          title="Delete Guest"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Guest Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#FCFBF7] dark:bg-[#1C1A1F] border border-[#E7DFD5] dark:border-[#2E2833] rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D7] dark:border-[#2D2832]">
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                {modalMode === 'create' ? 'Add Guest / Family' : 'Edit Guest Details'}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Primary Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunil Sharma Family"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Phone (with +91) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98200 12345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Family Side *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, side: 'ladkiwale' })}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-colors ${
                      formData.side === 'ladkiwale'
                        ? 'border-rose-600 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Ladkiwale
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, side: 'ladkewale' })}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-colors ${
                      formData.side === 'ladkewale'
                        ? 'border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Ladkewale
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, side: 'mutual' })}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-colors ${
                      formData.side === 'mutual'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Mutual Friends
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Relation / Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mama Ji or College Friend"
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Family Group Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kanpur Relatives"
                    value={formData.familyGroup}
                    onChange={(e) => setFormData({ ...formData, familyGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Adults Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.adultsCount}
                    onChange={(e) => setFormData({ ...formData, adultsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Kids Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.kidsCount}
                    onChange={(e) => setFormData({ ...formData, kidsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Dietary
                  </label>
                  <select
                    value={formData.dietaryPreference}
                    onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value as DietaryPreference })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                  >
                    <option value="pure_veg">Pure Veg</option>
                    <option value="jain">Jain (No Garlic/Onion)</option>
                    <option value="non_veg">Non-Veg</option>
                    <option value="standard">Standard</option>
                  </select>
                </div>
              </div>

              {/* Granular Ceremonies Invited & Attending */}
              <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-700">
                <label className="block font-medium text-stone-700 dark:text-stone-300">
                  Granular Ceremony Invitations &amp; RSVPs
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['haldi', 'mehendi', 'sangeet', 'shaadi', 'reception'] as CeremonyEvent[]).map((ev) => {
                    const isInvited = formData.eventsInvited.includes(ev);
                    const isAttending = formData.eventsAttending.includes(ev);

                    return (
                      <div 
                        key={ev} 
                        className={`p-2 rounded-xl border transition-all ${isInvited ? 'bg-white dark:bg-[#2A232E] border-stone-300 dark:border-stone-600' : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 opacity-60'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold capitalize text-[11px] text-stone-800 dark:text-stone-200">{ev}</span>
                          <input
                            type="checkbox"
                            checked={isInvited}
                            onChange={(e) => {
                              const newInvited = e.target.checked
                                ? [...formData.eventsInvited, ev]
                                : formData.eventsInvited.filter(x => x !== ev);
                              const newAttending = e.target.checked
                                ? formData.eventsAttending
                                : formData.eventsAttending.filter(x => x !== ev);
                              setFormData({ ...formData, eventsInvited: newInvited, eventsAttending: newAttending });
                            }}
                            title="Invited to this ceremony"
                            className="rounded text-[#4E2634]"
                          />
                        </div>
                        {isInvited && (
                          <label className="flex items-center gap-1.5 text-[10px] text-stone-600 dark:text-stone-400 mt-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isAttending}
                              onChange={(e) => {
                                const newAttending = e.target.checked
                                  ? [...formData.eventsAttending, ev]
                                  : formData.eventsAttending.filter(x => x !== ev);
                                setFormData({ ...formData, eventsAttending: newAttending });
                              }}
                              className="rounded text-emerald-600"
                            />
                            <span>Attending</span>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="hotelStay"
                    checked={formData.hotelStayRequired}
                    onChange={(e) => setFormData({ ...formData, hotelStayRequired: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <label htmlFor="hotelStay" className="text-stone-700 dark:text-stone-300 font-medium">
                    Hotel Room Required
                  </label>
                </div>
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Room Number / Wing
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Palace Suite 204"
                    value={formData.roomAllocated}
                    onChange={(e) => setFormData({ ...formData, roomAllocated: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE2D7] dark:border-[#2D2832]">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4E2634] hover:bg-[#3D1D28] text-white font-medium rounded-xl shadow-xs transition-colors"
                >
                  {modalMode === 'create' ? 'Save Guest' : 'Update Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital E-Card & WhatsApp Broadcast Generator Modal */}
      {isECardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FAF7F2] dark:bg-[#1E1921] border border-[#EAE3D8] dark:border-[#382F3B] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFECE6] dark:border-[#2C2430]">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#38232B] dark:text-stone-100 flex items-center gap-2">
                  <span>🌸</span>
                  <span>Digital E-Card &amp; 1-Click WhatsApp Invite</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Send personalized WhatsApp invites with venue maps, timings, dress codes &amp; family contacts
                </p>
              </div>
              <button
                onClick={() => setIsECardModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ceremony Tab Selector */}
            <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {(['all', 'haldi', 'mehendi', 'sangeet', 'shaadi', 'reception'] as CeremonyEvent[]).map((ev) => (
                <button
                  key={ev}
                  onClick={() => setSelectedECardEvent(ev)}
                  className={`px-3 py-1.5 rounded-xl font-semibold capitalize whitespace-nowrap transition-all ${
                    selectedECardEvent === ev
                      ? 'bg-[#4E2634] text-white shadow-xs'
                      : 'bg-white dark:bg-[#2A232E] text-stone-600 dark:text-stone-300 border border-[#E4DFD6] dark:border-[#342A38]'
                  }`}
                >
                  {ev === 'all' ? 'All Celebrations' : ev}
                </button>
              ))}
            </div>

            {/* Visual E-Card Preview Box */}
            <div className="mt-4 p-6 rounded-2xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#F5ECE1] dark:from-[#251F2A] dark:to-[#1C171F] border-2 border-[#8B4459]/30 text-center relative overflow-hidden shadow-inner">
              <div className="absolute top-2 right-2 text-3xl opacity-20 pointer-events-none">🪷</div>
              <div className="absolute bottom-2 left-2 text-3xl opacity-20 pointer-events-none">🪷</div>

              {/* Official Bride & Groom Logo */}
              <div className="w-16 h-20 mx-auto rounded-t-full rounded-b-md overflow-hidden border-2 border-[#C9A984]/80 shadow-md bg-[#FAF7F2] my-2">
                <img
                  src={`${import.meta.env.BASE_URL}assets/aistudio/Screenshot_2026-11-06_at_12.09.50_AM_0ee25bbd.png`}
                  alt="Bride and Groom Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-xs uppercase tracking-[0.25em] text-[#8B4459] font-serif font-bold mt-1">
                RasmReady Nimantran Patrika
              </p>

              <h4 className="font-serif text-2xl sm:text-3xl font-bold text-[#38232B] dark:text-stone-100 mt-1">
                {wedding.brideName} &amp; {wedding.groomName}
              </h4>

              <p className="text-xs text-stone-600 dark:text-stone-300 max-w-md mx-auto mt-2 leading-relaxed">
                With the divine blessings of our elders and the grace of the Almighty, we cordially invite you and your family to join us in celebrating our wedding celebrations.
              </p>

              {/* Ceremony Card Info */}
              <div className="mt-4 p-3.5 rounded-xl bg-white/80 dark:bg-[#2D2431]/80 border border-[#E5DFD6] dark:border-[#382E3C] max-w-md mx-auto text-xs space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-stone-900 dark:text-stone-100 capitalize">
                    {selectedECardEvent === 'all' ? `Wedding Festivities (${ceremony.date})` : `${selectedECardEvent} Ceremony`}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-semibold">
                    Godhuli Muhurat
                  </span>
                </div>
                <p className="text-stone-500 dark:text-stone-400">
                  📍 <strong>Venue:</strong> {wedding.location}
                </p>
                <p className="text-[#8B4459] dark:text-rose-300">
                  👗 <strong>Dress Code:</strong> {selectedECardEvent === 'haldi' ? 'Yellow gotapatti' : selectedECardEvent === 'mehendi' ? 'Mint green & florals' : selectedECardEvent === 'sangeet' ? 'Royal indigo glamour' : 'Regal crimson silk & gold'}
                </p>
              </div>

              {/* Family Coordinator Contacts */}
              <div className="mt-4 border-t border-[#E8E2D8] dark:border-[#362C3A] pt-3 text-left">
                <p className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-2">
                  Family Coordinators for Stay, Transport &amp; Rituals:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {keyContacts.map((c) => (
                    <div key={c.name} className="p-2 rounded-lg bg-white/60 dark:bg-[#251E28] border border-[#E6DFD6] dark:border-[#332A37] text-[11px]">
                      <p className="font-bold text-stone-800 dark:text-stone-200">{c.name}</p>
                      <p className="text-stone-400 text-[10px]">{c.role}</p>
                      <p className="text-[#8B4459] font-mono mt-0.5">{c.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons: 1-Click WhatsApp & Copy */}
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#EFECE6] dark:border-[#2C2430]">
              <div className="text-xs text-stone-500">
                {copyError ? (
                  <span role="alert" className="text-rose-700 dark:text-rose-300">{copyError}</span>
                ) : copyFeedback ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Copied full invite text &amp; contacts to clipboard!
                  </span>
                ) : (
                  <span>Ready to broadcast or send to family</span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleCopyInviteText(undefined, selectedECardEvent)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white dark:bg-[#2A232E] border border-[#DFD8CE] dark:border-[#3A303F] text-stone-700 dark:text-stone-200 text-xs font-semibold hover:bg-stone-50"
                >
                  Copy Message &amp; Contacts
                </button>
                <a
                  href={`https://wa.me/?text=${generateWhatsAppMessage(undefined, selectedECardEvent)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Open WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
