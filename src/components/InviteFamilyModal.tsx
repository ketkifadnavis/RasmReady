import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  Users, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Send,
  MessageCircle
} from 'lucide-react';
import { WeddingConfig } from '../types/wedding';

interface InviteFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  wedding: WeddingConfig;
}

export const InviteFamilyModal: React.FC<InviteFamilyModalProps> = ({
  isOpen,
  onClose,
  wedding,
}) => {
  const [selectedSide, setSelectedSide] = useState<'ladkiwale' | 'ladkewale' | 'mutual'>('ladkiwale');
  const [selectedRoleType, setSelectedRoleType] = useState<'family' | 'guest' | 'vip'>('family');
  const [isCopied, setIsCopied] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  if (!isOpen) return null;

  const inviteCode = wedding.inviteCode || '';
  const appBaseUrl = new URL(import.meta.env.BASE_URL, window.location.origin).href;
  const joinLink = `${appBaseUrl}?join=${encodeURIComponent(wedding.id)}&code=${encodeURIComponent(inviteCode)}&side=${selectedSide}`;
  const weddingDate = new Date(wedding.weddingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const sideLabel = selectedSide === 'ladkiwale' 
    ? "Ladkiwale (Bride's Family)" 
    : selectedSide === 'ladkewale' 
    ? "Ladkewale (Groom's Family)" 
    : "Shared / Mutual Family";

  const generateWhatsAppMessage = () => {
    const text = `🌸 *Wedding Invitation to Join RasmReady* 🌸\n\nNamaste! 🙏\n*${wedding.brideName} & ${wedding.groomName}* cordially invite you to join our private wedding planning & celebration portal on *RasmReady* as part of *${sideLabel}*!\n\n📍 *Venue:* ${wedding.location}\n📅 *Wedding Date:* ${weddingDate} (${wedding.muhuratTime || 'Wedding ceremony'})\n\n👉 *Click here to sign up & join our wedding team:*\n${joinLink}\n\n🔑 *Wedding Join Code:* *${inviteCode}*\n\nCollaborate on tasks, coordinate shopping, view ceremony moodboards, and share memories together! 🪷\n\nWith love,\n${wedding.brideName} & ${wedding.groomName}`;
    return encodeURIComponent(text);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinLink);
      setCopyError('');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (error) {
      setCopyError(error instanceof Error ? error.message : 'Could not copy the invitation. Select and copy the link below.');
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopyError('');
      setIsCodeCopied(true);
      setTimeout(() => setIsCodeCopied(false), 2500);
    } catch (error) {
      setCopyError(error instanceof Error ? error.message : 'Could not copy the code. Copy it manually below.');
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(`https://wa.me/?text=${generateWhatsAppMessage()}`, '_blank');
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
                Invite Family &amp; Collaborators
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Share this private join link so family members can sign up directly into <span className="font-semibold text-stone-800 dark:text-stone-200">{wedding.brideName} &amp; {wedding.groomName}&apos;s</span> wedding space.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wedding Pass Preview Card */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-[#4E2634] to-[#71374C] text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#E9D5C0]">
              Official RasmReady Pass
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono tracking-wider font-bold">
              {inviteCode}
            </span>
          </div>

          <h3 className="font-serif text-xl font-bold mt-2">
            {wedding.brideName} &amp; {wedding.groomName}&apos;s Wedding
          </h3>

          <p className="text-xs text-[#EADBD0] mt-0.5 flex items-center gap-2">
            <span>📍 {wedding.location}</span>
            <span>•</span>
            <span>{weddingDate}</span>
          </p>

          <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
            <span className="text-white/80">Inviting as: <strong className="text-white">{sideLabel}</strong></span>
            <span className="text-[11px] text-white/70">Automatic Member Access</span>
          </div>
        </div>

        {/* Invite Customization */}
        <div className="space-y-4 text-xs">
          {copyError && <p role="alert" className="rounded-xl bg-rose-100 p-3 text-rose-900">{copyError}</p>}
          {/* Side Selector */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              1. Assign Family Side for this Invite Link:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedSide('ladkiwale')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  selectedSide === 'ladkiwale'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200 shadow-2xs'
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                Ladkiwale (Bride)
              </button>
              <button
                type="button"
                onClick={() => setSelectedSide('ladkewale')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  selectedSide === 'ladkewale'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 shadow-2xs'
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                Ladkewale (Groom)
              </button>
              <button
                type="button"
                onClick={() => setSelectedSide('mutual')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  selectedSide === 'mutual'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 shadow-2xs'
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                Mutual / Shared
              </button>
            </div>
          </div>

          {/* 1-Click WhatsApp Share */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              2. Share via WhatsApp or Copy Link:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleOpenWhatsApp}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share Invite via WhatsApp</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="py-3 px-4 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Direct Link Preview & 6-Digit Code */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#251F2A] border border-[#E9E2D8] dark:border-[#382F3B] space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-stone-600 dark:text-stone-300">Wedding Link:</span>
              <span className="text-stone-400">Open in browser to join</span>
            </div>
            
            <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 font-mono text-[11px] text-stone-600 dark:text-stone-400 truncate">
              {joinLink}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="text-stone-500 text-[11px]">Or join with Code:</span>
                <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 font-mono font-bold text-xs text-[#4E2634] dark:text-[#E9D5C0]">
                  {inviteCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="text-[11px] font-semibold text-[#4E2634] dark:text-[#E9D5C0] hover:underline flex items-center gap-1"
              >
                {isCodeCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{isCodeCopied ? 'Code Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Explanatory Banner */}
          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">How Family Join Works:</p>
              <p className="text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                When your family members (Mama, Chacha, Bhabhi, Sisters, Friends) click this link, they will be greeted with your wedding pass and invited to sign up with their relation/role. They can also switch seamlessly between multiple weddings if they are attending more than one!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-[#EFECE6] dark:border-[#2C2430] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#4E2634] hover:bg-[#3D1D28] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
