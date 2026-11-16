import React from 'react';
import { 
  Sparkles, 
  HeartHandshake, 
  IndianRupee, 
  CheckSquare, 
  Users, 
  Palette, 
  Clock, 
  X, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onNavigateTab }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FCFBF7] dark:bg-[#18161A] border border-[#E7DFD5] dark:border-[#2E2833] rounded-2xl shadow-2xl p-6 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          aria-label="Close welcome guide"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Namaste & Welcome to RasmReady</span>
          </div>
          <h2 id="welcome-modal-title" className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Your Joint Indian Wedding Planning Companion
          </h2>
          <p className="mt-2 text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
            Plan multi-day celebrations smoothly between the Bride&apos;s family (<span className="font-semibold text-rose-700 dark:text-rose-400">Ladkiwale</span>) and Groom&apos;s family (<span className="font-semibold text-amber-700 dark:text-amber-400">Ladkewale</span>) with zero confusion.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Feature 1 */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#201D22] border border-[#EFE8DE] dark:border-[#2D2832] flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Ladkiwale vs Ladkewale Split
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                Filter and assign tasks, expenses, and guests to the Bride’s side, Groom’s side, or shared 50/50 responsibilities.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#201D22] border border-[#EFE8DE] dark:border-[#2D2832] flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Budget & Advance Ledger
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                Track estimated costs vs paid advances in INR (₹) across functions, from Mandap decor to royal catering.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#201D22] border border-[#EFE8DE] dark:border-[#2D2832] flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Family Ritual Delegation
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                Assign specific duties to family members (Mama Ji for Baraat welcome, Bridesmaids for Joota Chupai, Bhabhi for Haldi).
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#201D22] border border-[#EFE8DE] dark:border-[#2D2832] flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Guests & WhatsApp RSVPs
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                Log Jain / Pure Veg dietary choices, hotel room allotments, and send pre-filled WhatsApp invitations in 1 click.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#201D22] border border-[#EFE8DE] dark:border-[#2D2832] flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Ceremony Moodboards
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                Explore curated color swatches, dress codes, decor motifs, and music notes for Haldi, Mehendi, Sangeet, and Shaadi.
              </p>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#201D22] border border-[#EFE8DE] dark:border-[#2D2832] flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Live Muhurat Countdown
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                Real-time ticking countdown to the auspicious Pheras ceremony with date & location details.
              </p>
            </div>
          </div>
        </div>

        {/* Where to start steps */}
        <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl p-4 sm:p-5 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-2.5">
            <BookOpen className="w-4 h-4" />
            Where to start:
          </h4>
          <ol className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 space-y-2 list-decimal list-inside">
            <li><span className="font-medium text-stone-900 dark:text-stone-100">Use the Side Filter</span> in the header to switch between &ldquo;All&rdquo;, &ldquo;Ladkiwale&rdquo;, and &ldquo;Ladkewale&rdquo; views.</li>
            <li><span className="font-medium text-stone-900 dark:text-stone-100">Check Budget &amp; Tasks</span> to review or add new ritual responsibilities and expenses.</li>
            <li><span className="font-medium text-stone-900 dark:text-stone-100">Invite Guests</span> via WhatsApp and track their food choices (Jain/Pure Veg) and hotel room numbers.</li>
          </ol>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#EAE3D9] dark:border-[#2D2832]">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Tip: You can re-open this guide anytime via the &ldquo;App Guide&rdquo; button in the header.
          </span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onNavigateTab('budget');
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Explore Budget
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-semibold text-white bg-[#4E2634] hover:bg-[#3D1D28] dark:bg-[#683345] dark:hover:bg-[#572939] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
