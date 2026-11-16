import { after, before, beforeEach, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import assert from 'node:assert/strict';

let environment;
const wedding = {
  id: 'one', ownerId: 'owner', brideName: 'Bride', groomName: 'Groom',
  weddingDate: '2027-02-28T18:30', location: 'Venue', inviteCode: 'RR-PRIVATE',
};
const member = {
  userId: 'owner', name: 'Owner', email: 'owner@example.com', role: 'Bride',
  side: 'ladkiwale', isAdmin: true, inviteCode: 'RR-PRIVATE',
};
const client = uid => environment.authenticatedContext(uid, { email: `${uid}@example.com` }).firestore();

before(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'demo-rasmready',
    firestore: { rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8') },
  });
});
beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, 'weddings/one'), wedding);
    await setDoc(doc(db, 'weddings/one/members/owner'), member);
    await setDoc(doc(db, 'invites/RR-PRIVATE'), wedding);
  });
});
after(async () => { await environment?.cleanup(); });

test('owner can atomically create a wedding, membership, pointer, invite and planning templates', async () => {
  const db = client('creator');
  const batch = writeBatch(db);
  batch.set(doc(db, 'weddings/two'), { ...wedding, id: 'two', ownerId: 'creator', inviteCode: 'RR-SECOND' });
  batch.set(doc(db, 'weddings/two/members/creator'), { ...member, userId: 'creator', email: 'creator@example.com', inviteCode: 'RR-SECOND' });
  batch.set(doc(db, 'users/creator/weddings/two'), { weddingId: 'two', userRole: 'Bride', userSide: 'ladkiwale', isAdmin: true });
  batch.set(doc(db, 'invites/RR-SECOND'), { ...wedding, id: 'two', inviteCode: 'RR-SECOND' });
  batch.set(doc(db, 'weddings/two/tasks/task'), { id: 'task', weddingId: 'two', title: 'Wedding task' });
  await assertSucceeds(batch.commit());
  await assertSucceeds(getDoc(doc(db, 'weddings/two')));
});

test('signed-out visitors and unrelated accounts cannot read or change wedding data', async () => {
  for (const db of [client('stranger'), environment.unauthenticatedContext().firestore()]) {
    await assertFails(getDoc(doc(db, 'weddings/one')));
    await assertFails(getDocs(collection(db, 'weddings/one/tasks')));
    await assertFails(setDoc(doc(db, 'weddings/one/tasks/new'), { id: 'new', weddingId: 'one' }));
  }
  await assertFails(getDoc(doc(environment.unauthenticatedContext().firestore(), 'invites/RR-PRIVATE')));
  await assertFails(getDocs(collection(client('stranger'), 'invites')));
});

test('a valid invitation grants member access without granting admin privileges', async () => {
  const db = client('guest');
  await assertSucceeds(getDoc(doc(db, 'invites/RR-PRIVATE')));
  await assertSucceeds(getDoc(doc(db, 'weddings/one/members/guest')));
  const batch = writeBatch(db);
  batch.set(doc(db, 'weddings/one/members/guest'), { ...member, userId: 'guest', email: 'guest@example.com', role: 'Family', isAdmin: false });
  batch.set(doc(db, 'users/guest/weddings/one'), { weddingId: 'one', userRole: 'Family', userSide: 'ladkiwale', isAdmin: false });
  batch.set(doc(db, 'weddings/one/team/guest'), { id: 'guest', name: 'Guest' });
  await assertSucceeds(batch.commit());
  await assertSucceeds(getDoc(doc(db, 'weddings/one')));
  await assertSucceeds(setDoc(doc(db, 'weddings/one/tasks/new'), { id: 'new', weddingId: 'one', title: 'Shared task' }));
  assert.equal((await getDoc(doc(client('owner'), 'weddings/one/tasks/new'))).data().title, 'Shared task');
  await assertFails(updateDoc(doc(db, 'weddings/one'), { brideName: 'Changed' }));
  await assertFails(updateDoc(doc(db, 'weddings/one/members/guest'), { isAdmin: true }));
});

test('invalid codes, forged owners and forged membership pointers are rejected', async () => {
  const db = client('guest');
  await assertFails(setDoc(doc(db, 'weddings/one/members/guest'), { ...member, userId: 'guest', email: 'guest@example.com', isAdmin: false, inviteCode: 'RR-WRONG' }));
  await assertFails(setDoc(doc(db, 'weddings/one/members/guest'), { ...member, userId: 'guest', email: 'guest@example.com', isAdmin: true }));
  await assertFails(setDoc(doc(db, 'users/guest/weddings/one'), { weddingId: 'one', userRole: 'Bride', userSide: 'ladkiwale', isAdmin: true }));
});

test('planning records cannot be written under a different wedding or document ID', async () => {
  const db = client('owner');
  await assertFails(setDoc(doc(db, 'weddings/one/tasks/item'), { id: 'item', weddingId: 'two' }));
  await assertFails(setDoc(doc(db, 'weddings/one/tasks/item'), { id: 'other', weddingId: 'one' }));
  await assertSucceeds(setDoc(doc(db, 'weddings/one/tasks/item'), { id: 'item', weddingId: 'one' }));
  await assertFails(getDoc(doc(db, 'weddings/two')));
});
