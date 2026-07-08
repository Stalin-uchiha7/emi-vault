// ============================================================================
// PDF export helper — builds a clean, branded PDF report of the family's
// EMI portfolio using jsPDF + jspdf-autotable.
// ============================================================================
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

export function exportLoansToPDF(loans, summary, currencySymbol = 'Rs.') {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(99, 91, 255);
  doc.text('EMI Vault — Family Report', 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${dayjs().format('DD MMM YYYY, h:mm A')}`, 14, 25);

  doc.setFontSize(11);
  doc.setTextColor(30);
  const summaryLines = [
    `Total Loan Amount: ${currencySymbol}${Math.round(summary.totalLoanAmount).toLocaleString('en-IN')}`,
    `Total Outstanding: ${currencySymbol}${Math.round(summary.totalOutstanding).toLocaleString('en-IN')}`,
    `Monthly EMI Total: ${currencySymbol}${Math.round(summary.monthlyEmiTotal).toLocaleString('en-IN')}`,
    `Active EMIs: ${summary.activeEmis}  |  Closed EMIs: ${summary.closedEmis}`,
    `Total Interest Remaining: ${currencySymbol}${Math.round(summary.totalInterestRemaining).toLocaleString('en-IN')}`,
  ];
  summaryLines.forEach((line, i) => doc.text(line, 14, 36 + i * 6));

  autoTable(doc, {
    startY: 36 + summaryLines.length * 6 + 6,
    head: [['Loan Name', 'Category', 'Bank', 'EMI', 'Outstanding', 'Status', 'Progress']],
    body: loans.map((l) => [
      l.loanName,
      l.category,
      l.bank,
      `${currencySymbol}${Math.round(l.emiAmount).toLocaleString('en-IN')}`,
      `${currencySymbol}${Math.round(l.outstandingAmount).toLocaleString('en-IN')}`,
      l.derivedStatus,
      `${l.progressPercent}%`,
    ]),
    headStyles: { fillColor: [99, 91, 255] },
    styles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [247, 247, 251] },
  });

  doc.save(`emi-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
