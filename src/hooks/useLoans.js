// ============================================================================
// useLoans — subscribes to live Firestore loans & payments, and enriches each
// loan with derived fields (outstanding, progress, status, next due date...)
// so every consuming component gets ready-to-render data.
// ============================================================================
import { useEffect, useMemo, useState } from 'react';
import { subscribeToLoans, subscribeToPayments } from '../firebase/firestoreService';
import {
  getOutstandingAmount,
  getInterestRemaining,
  getInterestPaid,
  getMonthsPaid,
  getMonthsRemaining,
  getProgressPercent,
  getNextDueDate,
  getDerivedStatus,
  getEndDate,
} from '../utils/emiCalculations';

export function useLoans() {
  const [rawLoans, setRawLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubLoans = subscribeToLoans((data) => {
      setRawLoans(data);
      setLoading(false);
    });
    const unsubPayments = subscribeToPayments(setPayments);
    return () => {
      unsubLoans();
      unsubPayments();
    };
  }, []);

  const paymentsByLoan = useMemo(() => {
    const map = {};
    payments.forEach((p) => {
      if (!map[p.loanId]) map[p.loanId] = [];
      map[p.loanId].push(p);
    });
    return map;
  }, [payments]);

  const loans = useMemo(() => {
    return rawLoans.map((loan) => {
      const loanPayments = paymentsByLoan[loan.id] || [];
      return {
        ...loan,
        monthsPaid: getMonthsPaid(loan, loanPayments),
        monthsRemaining: getMonthsRemaining(loan, loanPayments),
        outstandingAmount: getOutstandingAmount(loan, loanPayments),
        interestRemaining: getInterestRemaining(loan, loanPayments),
        interestPaid: getInterestPaid(loan, loanPayments),
        progressPercent: getProgressPercent(loan, loanPayments),
        nextDueDate: getNextDueDate(loan, loanPayments),
        derivedStatus: getDerivedStatus(loan, loanPayments),
        endDate: getEndDate(loan),
        paymentCount: loanPayments.length,
      };
    });
  }, [rawLoans, paymentsByLoan]);

  return { loans, payments, paymentsByLoan, loading };
}
