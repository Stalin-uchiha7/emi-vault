// ============================================================================
// Auth service — thin wrapper around Firebase Authentication.
// New sign-ups get a `users/{uid}` Firestore doc with role="member" by default;
// the very first user to register in a fresh project is promoted to "admin"
// automatically so the family always has someone who can manage EMIs.
// ============================================================================
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';
import { COLLECTIONS, USER_ROLES } from '../constants';

export async function registerUser({ name, email, password }) {
  const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
  const isFirstUser = usersSnap.empty;

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });

  await setDoc(doc(db, COLLECTIONS.USERS, credential.user.uid), {
    uid: credential.user.uid,
    name,
    email,
    role: isFirstUser ? USER_ROLES.ADMIN : USER_ROLES.MEMBER,
    createdAt: serverTimestamp(),
  });

  return credential.user;
}

export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logoutUser() {
  return signOut(auth);
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return snap.exists() ? snap.data() : null;
}
