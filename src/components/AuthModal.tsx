import React, { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { X } from 'lucide-react';
import { auth } from '../lib/firebase';
import { createWedding } from '../lib/workspace';
import type { AppUser, WeddingConfig } from '../types/wedding';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  wedding: WeddingConfig;
  onSelectWedding: (id: string) => void;
  onError: (error: unknown) => void;
  joiningWedding?: boolean;
  onOpenJoinModal?: () => void;
}

export function AuthModal({ isOpen, onClose, currentUser, wedding, onSelectWedding, onError, joiningWedding, onOpenJoinModal }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'create'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [persona, setPersona] = useState<'bride' | 'groom' | 'family'>('bride');
  const [partner, setPartner] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (isOpen) {
      setMode(auth.currentUser ? 'create' : 'login');
      setName(auth.currentUser?.displayName || '');
      setPersona(!auth.currentUser && joiningWedding ? 'family' : 'bride');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;
  const fieldClass = 'mt-1 w-full rounded-xl border border-stone-300 bg-white p-2.5 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-white';
  const makesWedding = mode === 'create' || (mode === 'signup' && persona !== 'family');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        if (mode === 'signup') {
          const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
          await updateProfile(credential.user, { displayName: name.trim() });
        }
        if (makesWedding) {
          const userName = name.trim() || auth.currentUser?.displayName || '';
          const config: WeddingConfig = {
            id: '', brideName: persona === 'groom' ? partner.trim() : userName,
            groomName: persona === 'groom' ? userName : partner.trim(),
            weddingDate: date, location: venue.trim(), currency: 'INR',
            primarySide: 'joint', createdAt: '', updatedAt: '',
          };
          const id = await createWedding(config, persona === 'groom' ? 'ladkewale' : 'ladkiwale');
          onSelectWedding(id);
        }
      }
      setPassword('');
      onClose();
      if (mode === 'signup' && persona === 'family') onOpenJoinModal?.();
    } catch (error) {
      console.error('Account operation failed:', error);
      onError(error);
      setError(error instanceof Error ? error.message : String(error));
      if (auth.currentUser && mode === 'signup') setMode('create');
    } finally { setBusy(false); }
  };

  const logout = async () => {
    setBusy(true);
    setError('');
    try { await signOut(auth); setMode('login'); setPassword(''); onClose(); }
    catch (error) { setError(error instanceof Error ? error.message : String(error)); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <section role="dialog" aria-modal="true" aria-labelledby="account-title" className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-stone-200 bg-[#FAF7F2] p-6 text-stone-900 shadow-xl dark:border-stone-700 dark:bg-[#1E1921] dark:text-white">
        <button disabled={busy} aria-label="Close account" className="absolute right-4 top-4 p-2" onClick={onClose}><X className="h-5 w-5" /></button>
        <h2 id="account-title" className="font-serif text-2xl font-bold">RasmReady</h2>
        <p className="my-2 text-sm text-stone-500">Sign in to your private, shared wedding workspace.</p>
        {joiningWedding && !currentUser && <p className="my-2 text-sm">You have a wedding invitation. Sign in, or create a family member account to join.</p>}
        {error && <p role="alert" className="my-3 rounded-xl bg-rose-100 p-3 text-sm text-rose-900">{error}</p>}
        {currentUser ? (
          <div className="my-4 rounded-xl border border-stone-300 p-3 text-sm">
            Signed in as {currentUser.name} ({currentUser.email})
            <button disabled={busy} onClick={logout} className="ml-3 text-rose-600 underline">Sign out</button>
          </div>
        ) : (
          <div className="my-4 flex gap-2">
            <button disabled={busy} onClick={() => { setMode('login'); setError(''); }} className={`flex-1 rounded-xl p-2 ${mode === 'login' ? 'bg-[#4E2634] text-white' : 'border'}`}>Sign In</button>
            <button disabled={busy} onClick={() => { setMode('signup'); setError(''); }} className={`flex-1 rounded-xl p-2 ${mode === 'signup' ? 'bg-[#4E2634] text-white' : 'border'}`}>Create Account</button>
          </div>
        )}
        <form onSubmit={submit} className="space-y-3 text-sm">
          <fieldset disabled={busy} className="space-y-3">
            {mode !== 'login' && (
              <>
                <label className="block">Your name
                  <input aria-label="Your name" required maxLength={100} value={name} onChange={event => setName(event.target.value)} className={fieldClass} />
                </label>
                <label className="block">I am the
                  <select aria-label="I am the" value={persona} onChange={event => setPersona(event.target.value as typeof persona)} className={fieldClass}>
                    <option value="bride">Bride</option><option value="groom">Groom</option>
                    {mode === 'signup' && <option value="family">Family member / Guest</option>}
                  </select>
                </label>
              </>
            )}
            {!currentUser && (
              <>
                <label className="block">Email address
                  <input aria-label="Email address" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} className={fieldClass} />
                </label>
                <label className="block">Password
                  <input aria-label="Password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={6} value={password} onChange={event => setPassword(event.target.value)} className={fieldClass} />
                </label>
              </>
            )}
            {makesWedding && (
              <>
                <h3 className="pt-2 font-semibold">{wedding.id ? 'Create another wedding' : 'Create your wedding'}</h3>
                <label className="block">Partner's name
                  <input aria-label="Partner's name" required maxLength={100} value={partner} onChange={event => setPartner(event.target.value)} className={fieldClass} />
                </label>
                <label className="block">Wedding date and time
                  <input aria-label="Wedding date and time" type="datetime-local" required value={date} onChange={event => setDate(event.target.value)} className={fieldClass} />
                </label>
                <label className="block">Venue and location
                  <input aria-label="Venue and location" required maxLength={250} value={venue} onChange={event => setVenue(event.target.value)} className={fieldClass} />
                </label>
              </>
            )}
            <button type="submit" className="w-full rounded-xl bg-[#4E2634] p-3 font-semibold text-white disabled:opacity-50">
              {busy ? 'Please wait...' : mode === 'login' ? 'Sign In' : makesWedding ? 'Create wedding' : 'Create account & join family'}
            </button>
          </fieldset>
        </form>
        {currentUser && <button disabled={busy} onClick={() => { onClose(); onOpenJoinModal?.(); }} className="mt-4 w-full rounded-xl border p-2 text-sm">Join with Code/Link</button>}
      </section>
    </div>
  );
}
