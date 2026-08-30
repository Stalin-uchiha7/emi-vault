// ============================================================================
// Auth service — thin wrapper around Firebase Authentication.
// New sign-ups get a `users/{uid}` Firestore doc with role="member" by default.
// A designated owner email is always Super Admin. Everyone else starts as
// Member; Super Admin promotes them on the Family Members page.
// ============================================================================
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';
import { COLLECTIONS, USER_ROLES } from '../constants';
import { isSuperAdminEmail } from '../config/superAdmins';
import { resolveSignupRole } from '../utils/roles';
import { updateUserRole } from './firestoreService';

export async function registerUser({ name, email, password }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });

  const role = resolveSignupRole({ email });

  await setDoc(doc(db, COLLECTIONS.USERS, credential.user.uid), {
    uid: credential.user.uid,
    name,
    email,
    role,
    createdAt: serverTimestamp(),
  });

  return credential.user;
}

/**
 * Guarantee a Firestore /users/{uid} doc exists for the signed-in Auth user.
 * Re-registration creates a new Auth uid; the old profile doc is then orphaned
 * and getUserProfile returns null. Recreate the doc (Super Admin if the email
 * is allowlisted, otherwise Member).
 */
export async function ensureUserProfile(firebaseUser) {
  if (!firebaseUser) return null;

  const existingProfile = await getUserProfile(firebaseUser.uid);
  if (existingProfile) {
    return ensureSuperAdminRole(firebaseUser, existingProfile);
  }

  const role = resolveSignupRole({ email: firebaseUser.email });
  const profile = {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email || 'Member',
    email: firebaseUser.email,
    role,
  };

  try {
    await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), {
      ...profile,
      createdAt: serverTimestamp(),
    });
    return profile;
  } catch {
    return profile;
  }
}

/**
 * If this account's email is on the Super Admin allowlist, persist that role.
 * Safe to call on every login — no-ops when already Super Admin.
 */
export async function ensureSuperAdminRole(firebaseUser, profile) {
  if (!firebaseUser || !profile) return profile;
  if (!isSuperAdminEmail(firebaseUser.email)) return profile;
  if (profile.role === USER_ROLES.SUPER_ADMIN) return profile;

  try {
    await updateUserRole(firebaseUser.uid, USER_ROLES.SUPER_ADMIN);
    return { ...profile, role: USER_ROLES.SUPER_ADMIN };
  } catch {
    return profile;
  }
}

export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export function logoutUser() {
  return signOut(auth);
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return snap.exists() ? snap.data() : null;
}
