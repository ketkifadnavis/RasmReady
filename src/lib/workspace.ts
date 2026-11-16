import { type User } from 'firebase/auth';
import { collection, doc, getDocFromServer, writeBatch } from 'firebase/firestore';
import { auth, db } from './firebase';
import { initialChecklistItems, initialMoodboards } from './defaultData';
import type { WeddingConfig, WeddingMembership } from '../types/wedding';

export interface WeddingMember {
  userId: string;
  name: string;
  email: string;
  role: string;
  side: WeddingMembership['userSide'];
  isAdmin: boolean;
  inviteCode: string;
}

export const emptyWedding: WeddingConfig = {
  id: '', brideName: '', groomName: '', weddingDate: '',
  location: '', currency: 'INR', primarySide: 'joint', createdAt: '', updatedAt: '',
};

function requireUser(): User {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in before creating or joining a wedding.');
  return user;
}

export function membershipFor(wedding: WeddingConfig, member: WeddingMember): WeddingMembership {
  return {
    weddingId: wedding.id, brideName: wedding.brideName, groomName: wedding.groomName,
    weddingDate: wedding.weddingDate, location: wedding.location,
    muhuratTime: wedding.muhuratTime || '', inviteCode: wedding.inviteCode || '',
    userRole: member.role, userSide: member.side, isAdmin: member.isAdmin,
  };
}

export async function createWedding(config: WeddingConfig, side: 'ladkiwale' | 'ladkewale'): Promise<string> {
  const user = requireUser();
  const ref = doc(collection(db, 'weddings'));
  const now = new Date().toISOString();
  const inviteCode = `RR-${crypto.randomUUID().replaceAll('-', '').toUpperCase()}`;
  const wedding: WeddingConfig = { ...config, id: ref.id, inviteCode, createdAt: now, updatedAt: now };
  const member: WeddingMember = {
    userId: user.uid, name: user.displayName || 'Wedding host', email: user.email || '',
    side, role: side === 'ladkiwale' ? 'Bride (Owner & Admin)' : 'Groom (Owner & Admin)',
    isAdmin: true, inviteCode,
  };
  const batch = writeBatch(db);
  batch.set(ref, { ...wedding, ownerId: user.uid });
  batch.set(doc(ref, 'members', user.uid), member);
  batch.set(doc(ref, 'team', user.uid), {
    id: user.uid, name: member.name, role: member.role, email: member.email,
    relation: member.role, avatarLetter: member.name.charAt(0).toUpperCase(), tasksCount: 0,
  });
  batch.set(doc(db, 'users', user.uid, 'weddings', ref.id), membershipFor(wedding, member));
  batch.set(doc(db, 'invites', inviteCode), { ...wedding });
  for (const item of initialChecklistItems) {
    batch.set(doc(ref, 'checklists', item.id), { ...item });
  }
  for (const item of initialMoodboards) {
    batch.set(doc(ref, 'moodboards', item.id), { ...item, weddingId: ref.id });
  }
  await batch.commit();
  return ref.id;
}

export async function findWeddingInvite(code: string): Promise<WeddingConfig> {
  requireUser();
  const cleanCode = code.trim().toUpperCase();
  if (!/^RR-[A-Z0-9-]{4,64}$/.test(cleanCode)) throw new Error('Enter a valid wedding invitation code.');
  const snapshot = await getDocFromServer(doc(db, 'invites', cleanCode));
  if (!snapshot.exists()) throw new Error('Invitation not found. Ask the couple for a new link or code.');
  return snapshot.data() as WeddingConfig;
}

export async function joinWedding(code: string, side: WeddingMembership['userSide'], role: string): Promise<string> {
  const user = requireUser();
  const wedding = await findWeddingInvite(code);
  const ref = doc(db, 'weddings', wedding.id, 'members', user.uid);
  const existing = await getDocFromServer(ref);
  if (existing.exists()) return wedding.id;
  const member: WeddingMember = {
    userId: user.uid, name: user.displayName || 'Family member', email: user.email || '',
    side, role: role.trim() || 'Family member', isAdmin: false, inviteCode: wedding.inviteCode || '',
  };
  const batch = writeBatch(db);
  batch.set(ref, member);
  batch.set(doc(db, 'users', user.uid, 'weddings', wedding.id), membershipFor(wedding, member));
  batch.set(doc(db, 'weddings', wedding.id, 'team', user.uid), {
    id: user.uid, name: member.name, role: member.role, email: member.email,
    relation: member.role, avatarLetter: member.name.charAt(0).toUpperCase(), tasksCount: 0,
  });
  await batch.commit();
  return wedding.id;
}
