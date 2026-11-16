import React, { useState } from 'react';
import { 
  X, 
  FileDown, 
  Printer, 
  Copy, 
  Check, 
  Sparkles, 
  Calendar, 
  IndianRupee, 
  CheckSquare, 
  Users, 
  Phone,
  Share2
} from 'lucide-react';
import { WeddingConfig, BudgetItem, TaskItem, VendorItem, GuestItem } from '../types/wedding';
import { generateWeddingSummaryPdf } from '../lib/pdfExport';
import { weddingContacts, weddingSchedule } from '../lib/weddingDetails';

interface WeddingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  wedding: WeddingConfig;
  budgetItems: BudgetItem[];
  tasks: TaskItem[];
  vendors: VendorItem[];
  guests: GuestItem[];
}

export const WeddingSummaryModal: React.FC<WeddingSummaryModalProps> = ({
  isOpen,
  onClose,
  wedding,
  budgetItems,
  tasks,
  vendors,
  guests,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [actionError, setActionError] = useState('');

  if (!isOpen) return null;

  // Key Calculations
  const totalBudget = budgetItems.reduce((acc, b) => acc + b.estimatedAmount, 0);
  const totalPaid = budgetItems.reduce((acc, b) => acc + b.paidAmount, 0);
  const totalPending = Math.max(0, totalBudget - totalPaid);

  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'done').length;
  const taskPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const attendingGuests = guests.filter(g => g.rsvpStatus === 'attending');
  const totalAttendingGuests = attendingGuests.reduce((acc, g) => acc + g.adultsCount + g.kidsCount, 0);
  const jainGuests = attendingGuests.filter(g => g.dietaryPreference === 'jain').length;
  const hotelRooms = attendingGuests.filter(g => g.hotelStayRequired).length;

  const celebrations = weddingSchedule(wedding);
  const contacts = weddingContacts(tasks);

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    setActionError('');
    try {
      generateWeddingSummaryPdf({
        wedding,
        budgetItems,
        tasks,
        vendors,
        guests,
      });
    } catch (err) {
      console.error('PDF Generation Error:', err);
      setActionError('Could not generate the PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsApp = async () => {
    const text = `🌸 *RASMREADY — WEDDING PLANNING SUMMARY* 🌸
*${wedding.brideName} & ${wedding.groomName}*
📍 Venue: ${wedding.location}
📅 Vivaah Muhurat: ${celebrations[0].date}, ${celebrations[0].time}

📊 *EXECUTIVE SUMMARY*
• Total Estimated Budget: ₹${(totalBudget / 100000).toFixed(2)} Lakhs (Paid: ₹${(totalPaid / 100000).toFixed(2)} Lakhs)
• Tasks Completed: ${completedTasks}/${tasks.length} (${taskPercent}%)
• Confirmed Guests: ${totalAttendingGuests} Attending (${jainGuests} Jain Meals, ${hotelRooms} Hotel Rooms)

📅 *CEREMONIES & MUHURATS*
${celebrations.map(celebration => `${celebration.name}: ${celebration.date}, ${celebration.time}`).join('\n')}

📞 *FAMILY COORDINATORS*
${contacts.map(contact => `${contact.name} (${contact.role}): ${contact.phone}`).join('\n')}

_Generated via RasmReady • Har taiyaari, apno ke saath._`;

    setCopied(false);
    setActionError('');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error('Summary copy failed:', error);
      setActionError('Could not copy the summary. Allow clipboard access and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#FAF7F2] dark:bg-[#1D1720] border border-[#E8DFD3] dark:border-[#382D3D] rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Modal Action Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-white/80 dark:bg-[#251E28]/80 backdrop-blur-md border-b border-[#EFECE6] dark:border-[#352B3A] print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#4E2634] text-white flex items-center justify-center shadow-xs text-sm">
              🪷
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#38232B] dark:text-stone-100">
                Wedding Executive Summary
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Stylized document ready for PDF export &amp; family sharing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 rounded-xl transition-colors border border-emerald-200 dark:border-emerald-800"
              title="Copy formatted summary to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-emerald-600" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy WhatsApp'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-[#2F2633] hover:bg-stone-50 dark:hover:bg-[#3A303F] border border-stone-200 dark:border-stone-700 rounded-xl transition-colors shadow-2xs"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#4E2634] hover:bg-[#3D1D28] dark:bg-[#683345] rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {actionError && <p role="alert" className="px-6 py-3 text-xs text-rose-700 dark:text-rose-300">{actionError}</p>}

        {/* Printable Patrika Document Container */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible text-stone-900 dark:text-stone-100 font-sans">
          
          {/* Royal Patrika Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4E2634] via-[#5D2B3D] to-[#4E2634] text-white p-6 sm:p-7 shadow-md border-b-2 border-[#C9A984]">
            <div className="absolute top-2 right-4 text-4xl opacity-15 select-none pointer-events-none">
              🪷
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
              <div className="w-16 h-20 rounded-t-full rounded-b-lg overflow-hidden border-2 border-[#C9A984] shadow-md shrink-0 bg-[#FAF7F2]">
                <img
                  src={`${import.meta.env.BASE_URL}assets/aistudio/Screenshot_2026-11-06_at_12.09.50_AM_0ee25bbd.png`}
                  alt="Bride and Groom Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold tracking-[0.3em] text-[#E8D4BE] block">
                  || RasmReady · Executive Patrika ||
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
                  {wedding.brideName} &amp; {wedding.groomName}
                </h2>
                <p className="text-xs text-[#EADBD0] font-medium flex items-center justify-center sm:justify-start gap-2">
                  <span>📍 {wedding.location}</span>
                  <span>•</span>
                  <span>Vivaah Muhurat: {celebrations[0].date}, {celebrations[0].time}</span>
                </p>
                <div className="text-[10px] text-white/60">
                  Shared Family Wedding Workspace · Generated via RasmReady
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Strip (4 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#251E28] border border-[#EBE4DA] dark:border-[#382D3D] shadow-2xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                Total Budget
              </span>
              <p className="text-lg font-serif font-bold text-[#4E2634] dark:text-rose-200 mt-1">
                ₹{(totalBudget / 100000).toFixed(1)}L
              </p>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                Paid: ₹{(totalPaid / 100000).toFixed(1)}L
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#251E28] border border-[#EBE4DA] dark:border-[#382D3D] shadow-2xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                Remaining Due
              </span>
              <p className="text-lg font-serif font-bold text-amber-700 dark:text-amber-400 mt-1">
                ₹{(totalPending / 100000).toFixed(1)}L
              </p>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                {vendors.length} vendors contracted
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#251E28] border border-[#EBE4DA] dark:border-[#382D3D] shadow-2xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                Task Progress
              </span>
              <p className="text-lg font-serif font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                {taskPercent}% Done
              </p>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                {completedTasks}/{tasks.length} tasks completed
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#251E28] border border-[#EBE4DA] dark:border-[#382D3D] shadow-2xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                Confirmed Guests
              </span>
              <p className="text-lg font-serif font-bold text-indigo-700 dark:text-indigo-400 mt-1">
                {totalAttendingGuests}
              </p>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                {jainGuests} Jain · {hotelRooms} Rooms
              </span>
            </div>
          </div>

          {/* Section 1: Auspicious Ceremonies & Muhurats */}
          <div className="bg-white dark:bg-[#251E28] border border-[#EBE4DA] dark:border-[#382D3D] rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#EFECE6] dark:border-[#352B3A] pb-2.5">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#4E2634] dark:text-rose-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>1. Auspicious Ceremonies &amp; Muhurats</span>
              </h4>
              <span className="text-[11px] text-stone-400">6 Multi-Event Celebrations</span>
            </div>

            <div className="divide-y divide-[#F2EFE9] dark:divide-[#2F2633] text-xs">
              {celebrations.map((cel, idx) => (
                <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="font-bold text-stone-800 dark:text-stone-100">{cel.name}</span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 ml-2">
                      {cel.date} · {cel.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="font-serif italic text-[#8B4459] dark:text-rose-300 font-medium">
                      {cel.muhurat}
                    </span>
                    <span className="text-stone-400">Theme: {cel.theme}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Budget Breakdown & Family Split */}
          <div className="bg-white dark:bg-[#251E28] border border-[#EBE4DA] dark:border-[#382D3D] rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#EFECE6] dark:border-[#352B3A] pb-2.5">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#4E2634] dark:text-rose-200 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>2. Financial Overview &amp; Side Split</span>
              </h4>
              <span className="text-[11px] text-stone-400">
                Total Budget: ₹{(totalBudget / 100000).toFixed(2)} Lakhs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1821] border border-[#E8E2D8] dark:border-[#382E3C]">
                <span className="font-bold text-rose-800 dark:text-rose-300 block">Ladkiwale (Bride)</span>
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 mt-1">
                  ₹{(budgetItems.filter(b => b.side === 'ladkiwale').reduce((a, b) => a + b.estimatedAmount, 0) / 100000).toFixed(2)} Lakhs
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Paid: ₹{(budgetItems.filter(b => b.side === 'ladkiwale').reduce((a, b) => a + b.paidAmount, 0) / 100000).toFixed(2)}L
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1821] border border-[#E8E2D8] dark:border-[#382E3C]">
                <span className="font-bold text-amber-800 dark:text-amber-300 block">Ladkewale (Groom)</span>
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 mt-1">
                  ₹{(budgetItems.filter(b => b.side === 'ladkewale').reduce((a, b) => a + b.estimatedAmount, 0) / 100000).toFixed(2)} Lakhs
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Paid: ₹{(budgetItems.filter(b => b.side === 'ladkewale').reduce((a, b) => a + b.paidAmount, 0) / 100000).toFixed(2)}L
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1821] border border-[#E8E2D8] dark:border-[#382E3C]">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Shared Ceremonies</span>
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 mt-1">
                  ₹{(budgetItems.filter(b => b.side === 'shared').reduce((a, b) => a + b.estimatedAmount, 0) / 100000).toFixed(2)} Lakhs
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Paid: ₹{(budgetItems.filter(b => b.side === 'shared').reduce((a, b) => a + b.paidAmount, 0) / 100000).toFixed(2)}L
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Priority Pending Tasks */}
          <div className="bg-white dark:bg-[#251E28] border border-[#EBE4DA] dark:border-[#382D3D] rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#EFECE6] dark:border-[#352B3A] pb-2.5">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#4E2634] dark:text-rose-200 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>3. Key Tasks in Motion</span>
              </h4>
              <span className="text-[11px] text-stone-400">{tasks.length - completedTasks} Pending Action Items</span>
            </div>

            <div className="space-y-2 text-xs">
              {tasks.filter(t => t.status !== 'completed' && t.status !== 'done').slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1821] border border-[#EDE7DE] dark:border-[#352A38]">
                  <div className="min-w-0 pr-2">
                    <p className="font-medium text-stone-800 dark:text-stone-200 truncate">{task.title}</p>
                    <p className="text-[10px] text-stone-400">
                      Assigned to: {task.assignedToName || 'Unassigned'} ({task.assignedSide})
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    task.priority === 'urgent' 
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' 
                      : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                  }`}>
                    Due: {task.dueDate}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Family Coordinators Directory */}
          <div className="bg-white dark:bg-[#251E28] border border-[#EBE4DA] dark:border-[#382D3D] rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#EFECE6] dark:border-[#352B3A] pb-2.5">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#4E2634] dark:text-rose-200 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>4. Family Hospitality &amp; Coordinators</span>
              </h4>
              <span className="text-[11px] text-stone-400">Direct Contact Numbers</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {contacts.map(contact => (
                <div key={contact.phone} className="rounded-xl border border-stone-200 p-3 dark:border-stone-700">
                  <p className="font-bold">{contact.name}</p>
                  <p className="mt-1 text-stone-500">{contact.role}</p>
                  <a href={`tel:${contact.phone.replace(/[^+0-9]/g, '')}`} className="mt-2 inline-flex items-center gap-1 text-emerald-700">
                    <Phone className="h-3 w-3" />{contact.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 text-center text-[11px] text-stone-400 border-t border-[#EFECE6] dark:border-[#2C2430]">
            🪷 RasmReady · Har taiyaari, apno ke saath. Shared family wedding portal.
          </div>

        </div>

      </div>
    </div>
  );
};
