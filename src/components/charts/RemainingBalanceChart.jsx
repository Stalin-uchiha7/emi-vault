// ============================================================================
// RemainingBalanceChart — outstanding balance decline curve for a single loan.
// ============================================================================
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { Paper, Typography, useTheme } from '@mui/material';
import { brand } from '../../theme/theme';

export default function RemainingBalanceChart({ schedule, monthsPaid, currencySymbol = '₹' }) {
  const theme = useTheme();
  const step = Math.max(1, Math.ceil(schedule.length / 36));
  const data = schedule.filter((_, i) => i % step === 0).map((row) => ({
    month: `M${row.month}`,
    balance: row.balance,
  }));

  return (
    <Paper sx={{ p: 2.5, height: 320 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Remaining Balance
      </Typography>
      <ResponsiveContainer width="100%" height="88%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={brand.info} stopOpacity={0.35} />
              <stop offset="95%" stopColor={brand.info} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={Math.ceil(data.length / 8)} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) => `${currencySymbol}${Number(value).toLocaleString('en-IN')}`}
            contentStyle={{ borderRadius: 12, border: 'none', background: theme.palette.background.paper, boxShadow: '0px 8px 24px rgba(0,0,0,0.12)' }}
          />
          <Area type="monotone" dataKey="balance" stroke={brand.info} strokeWidth={2.5} fill="url(#balanceGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
}
