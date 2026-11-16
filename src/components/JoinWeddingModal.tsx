import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { findWeddingInvite, joinWedding } from '../lib/workspace';
import type { AppUser, WeddingConfig, WeddingMembership } from '../types/wedding';

interface JoinWeddingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onSelectWedding: (id: string) => void;
  initialCode?: string;
  initialSide?: WeddingMembership['userSide'];
}

export function JoinWeddingModal({
  isOpen, onClose, currentUser, onSelectWedding, initialCode = '', initialSide = 'ladkiwale',
}: JoinWeddingModalProps) {
  const [code, setCode] = useState(initialCode);
  const [side, setSide] = useState(initialSide);
  const [role, setRole] = useState('Family member');
  const [preview, setPreview] = useState<WeddingConfig | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (isOpen) { setCode(initialCode); setSide(initialSide); setPreview(null); setError(''); }
  }, [isOpen, initialCode, initialSide]);
  if (!isOpen) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      if (!currentUser) throw new Error('Sign in before accepting a wedding invitation.');
      if (!preview) setPreview(await findWeddingInvite(code));
      else {
        const id = await joinWedding(code, side, role);
        onSelectWedding(id);
        onClose();
      }
    } catch (error) {
      console.error('Wedding invitation failed:', error);
      setError(error instanceof Error ? error.message : String(error));
    } finally { setBusy(false); }
  };
  const fieldClass = 'mt-1 w-full rounded-xl border border-stone-300 bg-white p-2.5 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-white';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <section role="dialog" aria-modal="true" aria-labelledby="join-title" className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-stone-200 bg-[#FAF7F2] p-6 shadow-xl dark:border-stone-700 dark:bg-[#1E1921]">
        <button disabled={busy} aria-label="Close invitation" onClick={onClose} className="absolute right-4 top-4 p-2"><X className="h-5 w-5" /></button>
        <h2 id="join-title" className="font-serif text-2xl font-bold">Join Wedding Space</h2>
        <p className="my-3 text-sm text-stone-500">Signed in as {currentUser?.name}. Enter the private code shared by the couple.</p>
        {error && <p role="alert" className="my-3 rounded-xl bg-rose-100 p-3 text-sm text-rose-900">{error}</p>}
        {preview && (
          <div className="my-4 rounded-xl bg-[#4E2634] p-4 text-white">
            <h3 className="font-serif text-xl">{preview.brideName} &amp; {preview.groomName}</h3>
            <p>{preview.location}</p>
            <p>{new Date(preview.weddingDate).toLocaleString()}</p>
          </div>
        )}
        <form onSubmit={submit}>
          <fieldset disabled={busy} className="space-y-4 text-sm">
            <label className="block">Wedding Join Code
              <input aria-label="Wedding Join Code" required value={code} onChange={event => { setCode(event.target.value); setPreview(null); }} className={fieldClass} />
            </label>
            <label className="block">Family side
              <select aria-label="Family side" value={side} onChange={event => setSide(event.target.value as typeof side)} className={fieldClass}>
                <option value="ladkiwale">Ladkiwale (Bride)</option><option value="ladkewale">Ladkewale (Groom)</option><option value="mutual">Shared / Mutual</option>
              </select>
            </label>
            <label className="block">Relation or role
              <input aria-label="Relation or role" required maxLength={100} value={role} onChange={event => setRole(event.target.value)} className={fieldClass} />
            </label>
            <button type="submit" className="w-full rounded-xl bg-[#4E2634] p-3 font-semibold text-white disabled:opacity-50">
              {busy ? 'Please wait...' : preview ? 'Accept Invite & Join Wedding' : 'Find wedding'}
            </button>
          </fieldset>
        </form>
      </section>
    </div>
  );
}
