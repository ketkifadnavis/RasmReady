import { useCallback, useEffect, useRef, useState, type SetStateAction } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  collection, deleteField, doc, increment, onSnapshot, writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { emptyWedding, type WeddingMember } from './workspace';
import type { AppUser, WeddingConfig, WeddingMembership } from '../types/wedding';

export function useWorkspace() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState('');
  const reportError = useCallback((error: unknown) => {
    console.error('Wedding workspace:', error);
    setError(error instanceof Error ? error.message : String(error));
  }, []);
  const [memberships, setMemberships] = useState<{ uid: string; items: WeddingMembership[] } | null>(null);
  const [selection, setSelection] = useState<{ uid: string; id: string } | null>(null);
  const [active, setActive] = useState<{ key: string; wedding: WeddingConfig; member: WeddingMember } | null>(null);
  const [pending, setPending] = useState(0);

  useEffect(() => onAuthStateChanged(auth, next => {
    setUser(next);
    setAuthLoading(false);
    setError('');
  }, reportError), [reportError]);

  useEffect(() => {
    if (!user) return;
    let subscribed = true;
    const unsubscribe = onSnapshot(collection(db, 'users', user.uid, 'weddings'), { includeMetadataChanges: true }, snapshot => {
      if (!subscribed || snapshot.metadata.hasPendingWrites) return;
      const items = snapshot.docs.map(item => item.data() as WeddingMembership);
      setMemberships({ uid: user.uid, items });
      setSelection(previous => {
        const preferred = previous?.uid === user.uid ? previous.id : localStorage.getItem(`rr_active_wedding:${user.uid}`);
        const id = items.find(item => item.weddingId === preferred)?.weddingId || items[0]?.weddingId || '';
        return { uid: user.uid, id };
      });
    }, reportError);
    return () => { subscribed = false; unsubscribe(); };
  }, [user, reportError]);

  const joinedWeddings = memberships?.uid === user?.uid ? memberships?.items || [] : [];
  const id = selection?.uid === user?.uid ? selection?.id || '' : '';
  const key = `${user?.uid || ''}:${id}`;
  const selectWedding = useCallback((id: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) { reportError(new Error('Sign in before selecting a wedding.')); return; }
    localStorage.setItem(`rr_active_wedding:${uid}`, id);
    setSelection({ uid, id });
  }, [reportError]);

  useEffect(() => {
    if (!user || !id) return;
    let wedding: WeddingConfig | null = null;
    let member: WeddingMember | null = null;
    let subscribed = true;
    const publish = () => {
      if (subscribed && wedding && member) setActive({ key, wedding, member });
    };
    const stopWedding = onSnapshot(doc(db, 'weddings', id), snapshot => {
      if (!snapshot.exists()) { reportError(new Error('This wedding no longer exists.')); return; }
      wedding = snapshot.data() as WeddingConfig;
      publish();
    }, reportError);
    const stopMember = onSnapshot(doc(db, 'weddings', id, 'members', user.uid), snapshot => {
      if (!snapshot.exists()) { reportError(new Error('Your wedding membership could not be found.')); return; }
      member = snapshot.data() as WeddingMember;
      publish();
    }, reportError);
    return () => { subscribed = false; stopWedding(); stopMember(); };
  }, [user, id, key, reportError]);

  const wedding = active?.key === key ? active.wedding : emptyWedding;
  const member = active?.key === key ? active.member : null;
  const currentUser: AppUser | null = user ? {
    id: user.uid, email: user.email || '', name: user.displayName || 'Family member',
    avatarLetter: (user.displayName || 'F').charAt(0).toUpperCase(),
    side: member?.side || 'mutual', role: member?.role || 'Family member',
    isAdmin: member?.isAdmin || false, activeWeddingId: id, weddings: joinedWeddings,
  } : null;
  const saveWedding = useCallback((updated: WeddingConfig) => {
    if (!user || updated.id !== id) { reportError(new Error('Select a wedding before saving.')); return; }
    setPending(count => count + 1);
    const batch = writeBatch(db);
    batch.update(doc(db, 'weddings', id), { ...updated, updatedAt: new Date().toISOString() });
    if (updated.inviteCode) batch.update(doc(db, 'invites', updated.inviteCode), { ...updated });
    void batch.commit().catch(reportError).finally(() => setPending(count => count - 1));
  }, [user, id, reportError]);

  return {
    currentUser, authLoading, joinedWeddings, wedding, selectWedding, saveWedding,
    activeWeddingId: id, scope: key, reportError, error, clearError: () => setError(''),
    loading: !!user && (memberships?.uid !== user.uid || (!!id && active?.key !== key)),
    pending,
  };
}

export function useWeddingCollection<T extends { id: string }>(
  weddingId: string, scope: string, name: string, reportError: (error: unknown) => void,
) {
  const [state, setState] = useState<{ scope: string; items: T[]; pending: boolean } | null>(null);
  const current = useRef<{ scope: string; items: T[] } | null>(null);
  useEffect(() => {
    if (!weddingId) return;
    let subscribed = true;
    const unsubscribe = onSnapshot(collection(db, 'weddings', weddingId, name), { includeMetadataChanges: true }, snapshot => {
      if (!subscribed) return;
      const items = snapshot.docs.map(item => item.data() as T);
      current.current = { scope, items };
      setState({ scope, items, pending: snapshot.metadata.hasPendingWrites });
    }, reportError);
    return () => { subscribed = false; unsubscribe(); };
  }, [weddingId, scope, name, reportError]);

  const setItems = useCallback((action: SetStateAction<T[]>) => {
    if (!weddingId || current.current?.scope !== scope) {
      reportError(new Error('Wait for this wedding to finish loading before making changes.'));
      return;
    }
    try {
      const previous = current.current.items;
      const next = typeof action === 'function' ? action(previous) : action;
      const before = new Map(previous.map(item => [item.id, item]));
      const after = new Map(next.map(item => [item.id, item]));
      const batch = writeBatch(db);
      for (const item of next) {
        const existing = before.get(item.id);
        const ref = doc(db, 'weddings', weddingId, name, item.id);
        if (!existing) {
          batch.set(ref, item);
        } else {
          const changes: DocumentData = {};
          for (const field of Object.keys(item) as (keyof T)[]) {
            if (JSON.stringify(item[field]) !== JSON.stringify(existing[field])) {
              changes[String(field)] = item[field] === undefined ? deleteField()
                : field === 'likes' && typeof item[field] === 'number' && typeof existing[field] === 'number'
                  ? increment(Number(item[field]) - Number(existing[field]))
                  : item[field];
            }
          }
          if (Object.keys(changes).length) batch.update(ref, changes);
        }
      }
      for (const item of previous) {
        if (!after.has(item.id)) batch.delete(doc(db, 'weddings', weddingId, name, item.id));
      }
      current.current = { scope, items: next };
      void batch.commit().catch(reportError);
    } catch (error) {
      reportError(error);
    }
  }, [weddingId, scope, name, reportError]);

  return {
    items: state?.scope === scope ? state.items : [],
    setItems,
    loading: !!weddingId && state?.scope !== scope,
    pending: state?.scope === scope && state.pending,
  };
}
