// ============================================================================
// Dashboard — the landing page: summary KPIs, six charts, and a quick-glance
// EMI table preview.
// ============================================================================
import { useMemo, useState } from 'react';
import { Grid, Box, Button, Typography, Stack } from '@mui/material';
import {
  Wallet,
  TrendingDown,
  CalendarClock,
  Landmark,
  CheckCircle2,
  XCircle,
  Percent,
  CalendarDays,
  Plus,
} from 'lucide-react';
import { useLoans } from '../hooks/useLoans';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeModeContext';
import { computePortfolioSummary, formatCurrency } from '../utils/emiCalculations';
import SummaryCard from '../components/common/SummaryCard';
import { SummaryCardsSkeleton, ChartsSkeleton, TableSkeleton } from '../components/common/LoadingSkeletons';
import CategoryDonutChart from '../components/charts/CategoryDonutChart';
import MonthlyEmiBarChart from '../components/charts/MonthlyEmiBarChart';
import PayoffTimelineChart from '../components/charts/PayoffTimelineChart';
import CashOutflowChart from '../components/charts/CashOutflowChart';
import ActiveClosedChart from '../components/charts/ActiveClosedChart';
import PrincipalProgressChart from '../components/charts/PrincipalProgressChart';
import EMITable from '../components/emi/EMITable';
import EMIFormDialog from '../components/emi/EMIFormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { deleteLoan, closeLoan, addPayment } from '../firebase/firestoreService';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

export default function Dashboard() {
  const { loans, payments, loading } = useLoans();
  const { isAdmin } = useAuth();
  const { currencySymbol } = useThemeMode();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [formOpen, setFormOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [closeTarget, setCloseTarget] = useState(null);

  const summary = useMemo(() => computePortfolioSummary(loans), [loans]);

  const handleMarkPaid = async (loan) => {
    try {
      await addPayment({
        loanId: loan.id,
        amount: loan.emiAmount,
        date: dayjs().format('YYYY-MM-DD'),
        note: 'Marked paid from dashboard',
      });
      enqueueSnackbar('Payment recorded', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not record payment', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLoan(deleteTarget.id);
      enqueueSnackbar('EMI deleted', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not delete EMI', { variant: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleClose = async () => {
    try {
      await closeLoan(closeTarget.id);
      enqueueSnackbar('Loan marked as closed 🎉', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not close loan', { variant: 'error' });
    } finally {
      setCloseTarget(null);
    }
  };

  if (loading) {
    return (
      <Stack spacing={3}>
        <SummaryCardsSkeleton />
        <ChartsSkeleton />
        <TableSkeleton />
      </Stack>
    );
  }

  const cards = [
    { label: 'Total Loan Amount', value: summary.totalLoanAmount, prefix: currencySymbol, icon: Landmark, accent: '#6366F1' },
    { label: 'Total Outstanding', value: summary.totalOutstanding, prefix: currencySymbol, icon: TrendingDown, accent: '#EF4444' },
    { label: 'Monthly EMI Total', value: summary.monthlyEmiTotal, prefix: currencySymbol, icon: Wallet, accent: '#10B981' },
    { label: 'Total EMIs', value: summary.totalEmis, icon: Landmark, accent: '#3B82F6' },
    { label: 'Active EMIs', value: summary.activeEmis, icon: CheckCircle2, accent: '#10B981' },
    { label: 'Closed EMIs', value: summary.closedEmis, icon: XCircle, accent: '#9CA3AF' },
    { label: 'Total Interest Remaining', value: summary.totalInterestRemaining, prefix: currencySymbol, icon: Percent, accent: '#F59E0B' },
    {
      label: 'Next EMI Due',
      customValue: summary.nextDueDate ? summary.nextDueDate.format('DD MMM YYYY') : '—',
      icon: CalendarClock,
      accent: '#635BFF',
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5} sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Here's your family's complete EMI overview.
        </Typography>
        {isAdmin && (
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => { setEditingLoan(null); setFormOpen(true); }}>
            Add EMI
          </Button>
        )}
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((c, i) => (
          <Grid item xs={12} sm={6} md={3} key={c.label}>
            <SummaryCard {...c} delay={i * 0.04} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}><CategoryDonutChart loans={loans} currencySymbol={currencySymbol} /></Grid>
        <Grid item xs={12} md={4}><MonthlyEmiBarChart loans={loans} currencySymbol={currencySymbol} /></Grid>
        <Grid item xs={12} md={4}><ActiveClosedChart loans={loans} /></Grid>
        <Grid item xs={12} md={6}><PayoffTimelineChart loans={loans} currencySymbol={currencySymbol} /></Grid>
        <Grid item xs={12} md={6}><CashOutflowChart payments={payments} currencySymbol={currencySymbol} /></Grid>
        <Grid item xs={12}><PrincipalProgressChart loans={loans} currencySymbol={currencySymbol} /></Grid>
      </Grid>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent EMIs</Typography>
        <Button onClick={() => navigate('/emis')}>View all</Button>
      </Stack>
      <EMITable
        loans={loans.slice(0, 5)}
        isAdmin={isAdmin}
        currencySymbol={currencySymbol}
        onEdit={(loan) => { setEditingLoan(loan); setFormOpen(true); }}
        onDelete={setDeleteTarget}
        onMarkPaid={handleMarkPaid}
        onCloseLoan={setCloseTarget}
        onAddNew={() => { setEditingLoan(null); setFormOpen(true); }}
      />

      <EMIFormDialog open={formOpen} onClose={() => setFormOpen(false)} editingLoan={editingLoan} />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        danger
        title="Delete this EMI?"
        description={`This will permanently remove "${deleteTarget?.loanName}" and all its payment history.`}
        confirmLabel="Delete"
      />
      <ConfirmDialog
        open={!!closeTarget}
        onClose={() => setCloseTarget(null)}
        onConfirm={handleClose}
        title="Close this loan?"
        description={`Mark "${closeTarget?.loanName}" as fully paid off and closed.`}
        confirmLabel="Close Loan"
      />
    </Box>
  );
}
