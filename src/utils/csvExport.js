// ============================================================================
// CSV export helper — converts loans (with derived fields) into a downloadable
// CSV file using PapaParse.
// ============================================================================
import Papa from 'papaparse';

export function exportLoansToCSV(loans, currencySymbol = '₹') {
  const rows = loans.map((loan) => ({
    'Loan Name': loan.loanName,
    Category: loan.category,
    Bank: loan.bank,
    'EMI Amount': loan.emiAmount,
    'Interest Rate (%)': loan.interestRate,
    'Start Date': loan.startDate,
    'End Date': loan.endDate?.format ? loan.endDate.format('YYYY-MM-DD') : loan.endDate,
    'Tenure (months)': loan.tenureMonths,
    'Months Paid': loan.monthsPaid,
    'Months Remaining': loan.monthsRemaining,
    'Total Loan': loan.totalLoan,
    'Outstanding Amount': loan.outstandingAmount,
    'Interest Remaining': loan.interestRemaining,
    'Next Due Date': loan.nextDueDate ? loan.nextDueDate.format('YYYY-MM-DD') : '',
    Status: loan.derivedStatus,
    'Progress (%)': loan.progressPercent,
  }));

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `emi-report-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
