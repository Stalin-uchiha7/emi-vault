// ============================================================================
// Backup & Restore — exports all loans + payments as a single JSON file,
// and can restore from that file (admin only). This is the family's safety
// net independent of Firestore itself.
// ============================================================================
import { fetchAllLoansOnce, fetchAllPaymentsOnce, addLoan, addPayment } from '../firebase/firestoreService';

export async function downloadBackup() {
  const [loans, payments] = await Promise.all([fetchAllLoansOnce(), fetchAllPaymentsOnce()]);
  const backup = {
    exportedAt: new Date().toISOString(),
    version: 1,
    loans,
    payments,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `emi-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Restores a backup file by re-creating loans & payments as new documents. */
export async function restoreBackup(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!data.loans || !Array.isArray(data.loans)) throw new Error('Invalid backup file');

  const idMap = {};
  for (const loan of data.loans) {
    const { id, createdAt, ...rest } = loan;
    const ref = await addLoan(rest);
    idMap[id] = ref.id;
  }
  if (Array.isArray(data.payments)) {
    for (const payment of data.payments) {
      const { id, createdAt, loanId, ...rest } = payment;
      const newLoanId = idMap[loanId] || loanId;
      await addPayment({ ...rest, loanId: newLoanId });
    }
  }
}
