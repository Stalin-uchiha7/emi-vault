// ============================================================================
// PayoffTimelineChart — projects combined outstanding balance across all
// active loans, month by month, until everything is paid off.
// ============================================================================
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Paper, Typography, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import { buildAmortizationSchedule } from '../../utils/emiCalculations';
import { brand } from '../../theme/theme';
import EmptyState from '../common/EmptyState';
import { TrendingDown } from 'lucide-react';

export default function PayoffTimelineChart({ loans, currencySymbol = '₹' }) {
  const theme = useTheme();
  const activeLoans = loans.filter((l) => l.status !== 'Closed');

  let data = [];
  if (activeLoans.length > 0) {
    const maxMonths = Math.max(...activeLoans.map((l) => l.tenureMonths));
    const monthlyTotals = Array(maxMonths + 1).fill(0);

    activeLoans.forEach((loan) => {
      const schedule = buildAmortizationSchedule(loan);
      const paid = loan.monthsPaid;
      // starting point: current outstanding at month 0 of this projection
      for (let m = 0; m <= maxMonths; m++) {
        const idx = paid + m;
        const balance = idx < schedule.length ? schedule[idx].balance : 0;
        monthlyTotals[m] += balance;
      }
    });

    data = monthlyTotals.map((balance, i) => ({
      month: dayjs().add(i, 'month').format('MMM YY'),
      balance: Math.round(balance),
    })).filter((_, i) => i % Math.ceil(maxMonths / 24 || 1) === 0 || i === monthlyTotals.length - 1);
  }

  return (
    <Paper sx={{ p: 2.5, height: 340 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Loan Payoff Timeline
      </Typography>
      {data.length === 0 ? (
        <EmptyState icon={TrendingDown} title="No active loans" description="Projected payoff timeline will appear here." />
      ) : (
        <ResponsiveContainer width="100%" height="88%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="payoffGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={brand.primary} stopOpacity={0.35} />
                <stop offset="95%" stopColor={brand.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={Math.ceil(data.length / 8)} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => `${currencySymbol}${Number(value).toLocaleString('en-IN')}`}
              contentStyle={{
                borderRadius: 12,
                border: 'none',
                background: theme.palette.background.paper,
                boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
              }}
            />
            <Area type="monotone" dataKey="balance" stroke={brand.primary} strokeWidth={2.5} fill="url(#payoffGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
}
