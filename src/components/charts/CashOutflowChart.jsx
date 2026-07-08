// ============================================================================
// CashOutflowChart — actual monthly cash outflow trend, derived from
// recorded payments over the last 12 months.
// ============================================================================
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Paper, Typography, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import { brand } from '../../theme/theme';
import EmptyState from '../common/EmptyState';
import { Activity } from 'lucide-react';

export default function CashOutflowChart({ payments, currencySymbol = '₹' }) {
  const theme = useTheme();
  const months = Array.from({ length: 12 }).map((_, i) => dayjs().subtract(11 - i, 'month'));

  const data = months.map((m) => {
    const total = payments
      .filter((p) => dayjs(p.date).isSame(m, 'month'))
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return { month: m.format('MMM YY'), amount: total };
  });

  const hasData = data.some((d) => d.amount > 0);

  return (
    <Paper sx={{ p: 2.5, height: 340 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Monthly Cash Outflow Trend
      </Typography>
      {!hasData ? (
        <EmptyState icon={Activity} title="No payments recorded" description="Record EMI payments to see your cash outflow trend." />
      ) : (
        <ResponsiveContainer width="100%" height="88%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
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
            <Line type="monotone" dataKey="amount" stroke={brand.success} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
}
