// ============================================================================
// Firestore data-access layer. All reads use onSnapshot for real-time updates
// across family members' devices; all writes go through these typed helpers
// so components never touch the Firestore SDK directly.
// ============================================================================
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from '../constants';

// ---- Loans -----------------------------------------------------------------
export function subscribeToLoans(callback) {
  const q = query(collection(db, COLLECTIONS.LOANS), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function addLoan(loan) {
  return addDoc(collection(db, COLLECTIONS.LOANS), {
    ...loan,
    status: 'Active',
    createdAt: serverTimestamp(),
  });
}

export function updateLoan(loanId, updates) {
  return updateDoc(doc(db, COLLECTIONS.LOANS, loanId), updates);
}

export function deleteLoan(loanId) {
  return deleteDoc(doc(db, COLLECTIONS.LOANS, loanId));
}

export function closeLoan(loanId) {
  return updateDoc(doc(db, COLLECTIONS.LOANS, loanId), { status: 'Closed' });
}

// ---- Payments ----------------------------------------------------------------
export function subscribeToPayments(callback) {
  const q = query(collection(db, COLLECTIONS.PAYMENTS), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function addPayment(payment) {
  return addDoc(collection(db, COLLECTIONS.PAYMENTS), {
    ...payment,
    createdAt: serverTimestamp(),
  });
}

export function deletePayment(paymentId) {
  return deleteDoc(doc(db, COLLECTIONS.PAYMENTS, paymentId));
}

// ---- Users -------------------------------------------------------------------
export function subscribeToUsers(callback) {
  return onSnapshot(collection(db, COLLECTIONS.USERS), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function updateUserRole(uid, role) {
  return updateDoc(doc(db, COLLECTIONS.USERS, uid), { role });
}

export function deleteUserDoc(uid) {
  return deleteDoc(doc(db, COLLECTIONS.USERS, uid));
}

// ---- One-off fetch helpers (for CSV/PDF export & backup) --------------------
export async function fetchAllLoansOnce() {
  const snap = await getDocs(collection(db, COLLECTIONS.LOANS));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchAllPaymentsOnce() {
  const snap = await getDocs(collection(db, COLLECTIONS.PAYMENTS));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
