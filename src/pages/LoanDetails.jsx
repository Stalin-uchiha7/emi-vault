// ============================================================================
// LoanDetails — deep-dive page for a single loan: summary, schedule charts,
// timeline, documents/notes, and full payment history.
// ============================================================================
import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Chip,
  Button,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { ArrowLeft, Pencil, Trash2, XCircle } from 'lucide-react';
import { useLoans } from '../hooks/useLoans';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeModeContext';
import { buildAmortizationSchedule } from '../utils/emiCalculations';
import { STATUS_COLORS, CATEGORY_COLORS } from '../constants';
import ProgressRing from '../components/common/ProgressRing';
import PrincipalVsInterestChart from '../components/charts/PrincipalVsInterestChart';
import RemainingBalanceChart from '../components/charts/RemainingBalanceChart';
import PaymentHistory from '../components/emi/PaymentHistory';
import DocumentsNotes from '../components/emi/DocumentsNotes';
import EMIFormDialog from '../components/emi/EMIFormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { DetailPageSkeleton } from '../components/common/LoadingSkeletons';
import { deleteLoan, closeLoan } from '../firebase/firestoreService';
import { useSnackbar } from 'notistack';

export default function LoanDetails() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const { loans, paymentsByLoan, loading } = useLoans();
  const { isAdmin } = useAuth();
  const { currencySymbol } = useThemeMode();
  const { enqueueSnackbar } = useSnackbar();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);

  const loan = loans.find((l) => l.id === loanId);
  const payments = paymentsByLoan[loanId] || [];
  const schedule = useMemo(() => (loan ? buildAmortizationSchedule(loan) : []), [loan]);

  if (loading) return <DetailPageSkeleton />;

  if (!loan) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6">Loan not found</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/emis')}>Back to EMIs</Button>
      </Box>
    );
  }

  const fmt = (v) => `${currencySymbol}${Number(v || 0).toLocaleString('en-IN')}`;

  const handleDelete = async () => {
    try {
      await deleteLoan(loan.id);
      enqueueSnackbar('EMI deleted', { variant: 'success' });
      navigate('/emis');
    } catch {
      enqueueSnackbar('Could not delete EMI', { variant: 'error' });
    }
  };

  const handleClose = async () => {
    try {
      await closeLoan(loan.id);
      enqueueSnackbar('Loan marked as closed 🎉', { variant: 'success' });
      setCloseOpen(false);
    } catch {
      enqueueSnackbar('Could not close loan', { variant: 'error' });
    }
  };

  // Timeline steps: Start -> Halfway -> Now -> End
  const timelineSteps = [
    { label: 'Loan Started', date: loan.startDate },
    { label: `${loan.monthsPaid} Months Paid`, date: null },
    { label: 'Today', date: null, active: true },
    { label: 'Loan Ends', date: loan.endDate.format('YYYY-MM-DD') },
  ];

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate('/emis')} size="small"><ArrowLeft size={18} /></IconButton>
        <Typography variant="body2" color="text.secondary">Back to EMIs</Typography>
      </Stack>

      {/* Summary Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{loan.loanName}</Typography>
              <Chip label={loan.derivedStatus} size="small" sx={{ bgcolor: `${STATUS_COLORS[loan.derivedStatus]}22`, color: STATUS_COLORS[loan.derivedStatus], fontWeight: 700 }} />
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip label={loan.category} size="small" sx={{ bgcolor: `${CATEGORY_COLORS[loan.category]}1E`, color: CATEGORY_COLORS[loan.category], fontWeight: 600 }} />
              <Chip label={loan.bank} size="small" variant="outlined" />
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">EMI Amount</Typography>
                <Typography sx={{ fontWeight: 700 }}>{fmt(loan.emiAmount)}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Interest Rate</Typography>
                <Typography sx={{ fontWeight: 700 }}>{loan.interestRate}%</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Total Loan</Typography>
                <Typography sx={{ fontWeight: 700 }}>{fmt(loan.totalLoan)}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Outstanding</Typography>
                <Typography sx={{ fontWeight: 700 }}>{fmt(loan.outstandingAmount)}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Start Date</Typography>
                <Typography sx={{ fontWeight: 700 }}>{loan.startDate}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">End Date</Typography>
                <Typography sx={{ fontWeight: 700 }}>{loan.endDate.format('YYYY-MM-DD')}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Months Paid / Remaining</Typography>
                <Typography sx={{ fontWeight: 700 }}>{loan.monthsPaid} / {loan.monthsRemaining}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Next Due Date</Typography>
                <Typography sx={{ fontWeight: 700 }}>{loan.nextDueDate ? loan.nextDueDate.format('DD MMM YYYY') : '—'}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={5}>
            <Stack direction="row" alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} spacing={3}>
              <ProgressRing percent={loan.progressPercent} size={100} strokeWidth={8} />
              <Stack spacing={1}>
                {isAdmin && (
                  <>
                    <Button size="small" variant="outlined" startIcon={<Pencil size={15} />} onClick={() => setEditOpen(true)}>Edit</Button>
                    {loan.status !== 'Closed' && (
                      <Button size="small" variant="outlined" color="warning" startIcon={<XCircle size={15} />} onClick={() => setCloseOpen(true)}>Close Loan</Button>
                    )}
                    <Button size="small" variant="outlined" color="error" startIcon={<Trash2 size={15} />} onClick={() => setDeleteOpen(true)}>Delete</Button>
                  </>
                )}
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Timeline */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Timeline</Typography>
        <Stepper activeStep={2} alternativeLabel>
          {timelineSteps.map((step) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Charts */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}><PrincipalVsInterestChart schedule={schedule} currencySymbol={currencySymbol} /></Grid>
        <Grid item xs={12} md={6}><RemainingBalanceChart schedule={schedule} monthsPaid={loan.monthsPaid} currencySymbol={currencySymbol} /></Grid>
      </Grid>

      {/* Payment history + Documents/Notes */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <PaymentHistory loan={loan} payments={payments} isAdmin={isAdmin} currencySymbol={currencySymbol} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DocumentsNotes loan={loan} isAdmin={isAdmin} />
        </Grid>
      </Grid>

      <EMIFormDialog open={editOpen} onClose={() => setEditOpen(false)} editingLoan={loan} />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        danger
        title="Delete this EMI?"
        description={`This will permanently remove "${loan.loanName}" and all its payment history.`}
        confirmLabel="Delete"
      />
      <ConfirmDialog
        open={closeOpen}
        onClose={() => setCloseOpen(false)}
        onConfirm={handleClose}
        title="Close this loan?"
        description={`Mark "${loan.loanName}" as fully paid off and closed.`}
        confirmLabel="Close Loan"
      />
    </Box>
  );
}
