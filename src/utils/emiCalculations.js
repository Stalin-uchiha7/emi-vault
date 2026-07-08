// ============================================================================
// EMI Financial Calculation Engine
// ----------------------------------------------------------------------------
// All derived loan metrics (outstanding balance, interest remaining, progress,
// next due date, amortization schedule) are computed here so the rest of the
// app can stay purely presentational. Uses the standard reducing-balance EMI
// formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
// ============================================================================
import dayjs from 'dayjs';

/** Calculate EMI amount from principal, annual rate %, and tenure in months */
export function calculateEMI(principal, annualRate, tenureMonths) {
  if (!principal || !tenureMonths) return 0;
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / tenureMonths;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/** Build the full month-by-month amortization schedule for a loan */
export function buildAmortizationSchedule(loan) {
  const { totalLoan, interestRate, tenureMonths, startDate } = loan;
  const monthlyRate = interestRate / 12 / 100;
  const emi = loan.emiAmount || calculateEMI(totalLoan, interestRate, tenureMonths);
  let balance = totalLoan;
  const schedule = [];

  for (let i = 1; i <= tenureMonths; i++) {
    const interestComponent = balance * monthlyRate;
    let principalComponent = emi - interestComponent;
    if (principalComponent > balance) principalComponent = balance;
    balance = Math.max(0, balance - principalComponent);

    schedule.push({
      month: i,
      date: dayjs(startDate).add(i - 1, 'month').format('YYYY-MM-DD'),
      emi: Math.round(emi),
      principal: Math.round(principalComponent),
      interest: Math.round(interestComponent),
      balance: Math.round(balance),
    });
    if (balance <= 0) break;
  }
  return schedule;
}

/** Number of months paid so far, based on start date + manual payment records */
export function getMonthsPaid(loan, payments = []) {
  if (payments && payments.length > 0) return payments.length;
  const monthsElapsed = dayjs().diff(dayjs(loan.startDate), 'month');
  return Math.max(0, Math.min(monthsElapsed, loan.tenureMonths));
}

/** Months remaining until loan is fully repaid */
export function getMonthsRemaining(loan, payments = []) {
  const paid = getMonthsPaid(loan, payments);
  return Math.max(0, loan.tenureMonths - paid);
}

/** Outstanding principal balance today, from the amortization schedule */
export function getOutstandingAmount(loan, payments = []) {
  if (loan.status === 'Closed') return 0;
  const schedule = buildAmortizationSchedule(loan);
  const paid = getMonthsPaid(loan, payments);
  if (paid >= schedule.length) return 0;
  return schedule[paid] ? schedule[paid].balance : schedule[schedule.length - 1].balance;
}

/** Remaining interest to be paid over the rest of the loan's life */
export function getInterestRemaining(loan, payments = []) {
  const schedule = buildAmortizationSchedule(loan);
  const paid = getMonthsPaid(loan, payments);
  return schedule.slice(paid).reduce((sum, row) => sum + row.interest, 0);
}

/** Total interest paid so far */
export function getInterestPaid(loan, payments = []) {
  const schedule = buildAmortizationSchedule(loan);
  const paid = getMonthsPaid(loan, payments);
  return schedule.slice(0, paid).reduce((sum, row) => sum + row.interest, 0);
}

/** Repayment progress as a percentage (0-100) */
export function getProgressPercent(loan, payments = []) {
  if (loan.status === 'Closed') return 100;
  const paid = getMonthsPaid(loan, payments);
  return Math.min(100, Math.round((paid / loan.tenureMonths) * 100));
}

/** Next EMI due date (first unpaid month) */
export function getNextDueDate(loan, payments = []) {
  if (loan.status === 'Closed') return null;
  const paid = getMonthsPaid(loan, payments);
  if (paid >= loan.tenureMonths) return null;
  return dayjs(loan.startDate).add(paid, 'month');
}

/** Derive a live status label: Overdue / Upcoming Due / Active / Closed */
export function getDerivedStatus(loan, payments = []) {
  if (loan.status === 'Closed') return 'Closed';
  const nextDue = getNextDueDate(loan, payments);
  if (!nextDue) return 'Closed';
  const today = dayjs();
  const daysUntilDue = nextDue.diff(today, 'day');
  if (daysUntilDue < 0) return 'Overdue';
  if (daysUntilDue <= 7) return 'Upcoming Due';
  return 'Active';
}

/** End date of the loan (start + tenure) */
export function getEndDate(loan) {
  return dayjs(loan.startDate).add(loan.tenureMonths, 'month');
}

/** Aggregate portfolio-wide metrics used by summary cards */
export function computePortfolioSummary(loans, paymentsByLoan = {}) {
  let totalLoanAmount = 0;
  let totalOutstanding = 0;
  let monthlyEmiTotal = 0;
  let totalInterestRemaining = 0;
  let activeCount = 0;
  let closedCount = 0;
  let nextDueDate = null;

  loans.forEach((loan) => {
    const payments = paymentsByLoan[loan.id] || [];
    totalLoanAmount += Number(loan.totalLoan) || 0;
    const outstanding = getOutstandingAmount(loan, payments);
    totalOutstanding += outstanding;
    totalInterestRemaining += getInterestRemaining(loan, payments);

    if (loan.status === 'Closed') {
      closedCount += 1;
    } else {
      activeCount += 1;
      monthlyEmiTotal += Number(loan.emiAmount) || 0;
      const nd = getNextDueDate(loan, payments);
      if (nd && (!nextDueDate || nd.isBefore(nextDueDate))) {
        nextDueDate = nd;
      }
    }
  });

  return {
    totalLoanAmount,
    totalOutstanding,
    monthlyEmiTotal,
    totalEmis: loans.length,
    activeEmis: activeCount,
    closedEmis: closedCount,
    totalInterestRemaining,
    nextDueDate,
  };
}

export function formatCurrency(value, symbol = '₹') {
  if (value === null || value === undefined || isNaN(value)) return `${symbol}0`;
  return `${symbol}${Math.round(value).toLocaleString('en-IN')}`;
}
