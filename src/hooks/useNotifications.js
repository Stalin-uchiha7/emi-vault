// ============================================================================
// useNotifications — derives real-time notification items (no separate
// Firestore writes needed) from each loan's next due date:
//   - Upcoming EMI in 7 days
//   - Due tomorrow
//   - Overdue
//   - Loan completed (status flips to Closed)
// ============================================================================
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useLoans } from './useLoans';

export function useNotifications() {
  const { loans } = useLoans();

  return useMemo(() => {
    const items = [];
    const today = dayjs();

    loans.forEach((loan) => {
      if (loan.status === 'Closed') return;
      if (!loan.nextDueDate) return;

      const daysUntil = loan.nextDueDate.diff(today, 'day');

      if (daysUntil < 0) {
        items.push({
          loanId: loan.id,
          type: 'overdue',
          title: `${loan.loanName} payment is overdue`,
          subtitle: `Was due on ${loan.nextDueDate.format('DD MMM YYYY')}`,
        });
      } else if (daysUntil === 0) {
        items.push({
          loanId: loan.id,
          type: 'due_tomorrow',
          title: `${loan.loanName} is due today`,
          subtitle: `₹${Number(loan.emiAmount).toLocaleString('en-IN')}`,
        });
      } else if (daysUntil === 1) {
        items.push({
          loanId: loan.id,
          type: 'due_tomorrow',
          title: `${loan.loanName} is due tomorrow`,
          subtitle: `₹${Number(loan.emiAmount).toLocaleString('en-IN')}`,
        });
      } else if (daysUntil <= 7) {
        items.push({
          loanId: loan.id,
          type: 'upcoming_7_days',
          title: `${loan.loanName} due in ${daysUntil} days`,
          subtitle: loan.nextDueDate.format('DD MMM YYYY'),
        });
      }
    });

    // Sort: overdue first, then soonest due
    const priority = { overdue: 0, due_tomorrow: 1, upcoming_7_days: 2 };
    return items.sort((a, b) => priority[a.type] - priority[b.type]);
  }, [loans]);
}
