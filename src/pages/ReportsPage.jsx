// ============================================================================
// ReportsPage — monthly/yearly spending summaries, outstanding & interest
// breakdowns, and CSV/PDF export actions.
// ============================================================================
import { useMemo } from 'react';
import { Box, Paper, Typography, Grid, Button, Stack, Divider } from '@mui/material';
import { Download, FileText } from 'lucide-react';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { useLoans } from '../hooks/useLoans';
import { useThemeMode } from '../context/ThemeModeContext';
import { computePortfolioSummary } from '../utils/emiCalculations';
import { exportLoansToCSV } from '../utils/csvExport';
import { exportLoansToPDF } from '../utils/pdfExport';
import { brand } from '../theme/theme';
import { DetailPageSkeleton } from '../components/common/LoadingSkeletons';
import SummaryCard from '../components/common/SummaryCard';
import { Wallet, TrendingDown, Percent } from 'lucide-react';

export default function ReportsPage() {
  const { loans, payments, loading } = useLoans();
  const { currencySymbol } = useThemeMode();

  const summary = useMemo(() => computePortfolioSummary(loans), [loans]);

  const monthlySpending = useMemo(() => {
    const months = Array.from({ length: 12 }).map((_, i) => dayjs().subtract(11 - i, 'month'));
    return months.map((m) => ({
      label: m.format('MMM YY'),
      amount: payments.filter((p) => dayjs(p.date).isSame(m, 'month')).reduce((s, p) => s + Number(p.amount || 0), 0),
    }));
  }, [payments]);

  const yearlySpending = useMemo(() => {
    const years = Array.from({ length: 4 }).map((_, i) => dayjs().subtract(3 - i, 'year').year());
    return years.map((y) => ({
      label: String(y),
      amount: payments.filter((p) => dayjs(p.date).year() === y).reduce((s, p) => s + Number(p.amount || 0), 0),
    }));
  }, [payments]);

  const totalInterestPaid = useMemo(() => loans.reduce((s, l) => s + (l.interestPaid || 0), 0), [loans]);

  if (loading) return <DetailPageSkeleton />;

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5} sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          A full breakdown of your family's spending and loan interest.
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Download size={16} />} onClick={() => exportLoansToCSV(loans, currencySymbol)}>
            Export CSV
          </Button>
          <Button variant="contained" startIcon={<FileText size={16} />} onClick={() => exportLoansToPDF(loans, summary, currencySymbol)}>
            Export PDF
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard label="Total Outstanding" value={summary.totalOutstanding} prefix={currencySymbol} icon={TrendingDown} accent="#EF4444" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard label="Interest Paid" value={totalInterestPaid} prefix={currencySymbol} icon={Percent} accent="#F59E0B" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard label="Interest Remaining" value={summary.totalInterestRemaining} prefix={currencySymbol} icon={Percent} accent="#635BFF" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard label="Monthly EMI Total" value={summary.monthlyEmiTotal} prefix={currencySymbol} icon={Wallet} accent="#10B981" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2.5, height: 340 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Monthly Spending (Last 12 Months)</Typography>
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={monthlySpending} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${currencySymbol}${Number(v).toLocaleString('en-IN')}`} />
                <Bar dataKey="amount" fill={brand.primary} radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2.5, height: 340 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Yearly Spending</Typography>
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={yearlySpending} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${currencySymbol}${Number(v).toLocaleString('en-IN')}`} />
                <Bar dataKey="amount" fill={brand.success} radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
