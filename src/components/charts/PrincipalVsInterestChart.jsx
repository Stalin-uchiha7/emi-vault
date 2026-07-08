// ============================================================================
// PrincipalVsInterestChart — stacked bar of principal vs interest per month
// for a single loan's amortization schedule.
// ============================================================================
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Paper, Typography, useTheme } from '@mui/material';
import { brand } from '../../theme/theme';

export default function PrincipalVsInterestChart({ schedule, currencySymbol = '₹' }) {
  const theme = useTheme();
  // Downsample to keep the chart readable for long tenures
  const step = Math.max(1, Math.ceil(schedule.length / 36));
  const data = schedule.filter((_, i) => i % step === 0).map((row) => ({
    month: `M${row.month}`,
    principal: row.principal,
    interest: row.interest,
  }));

  return (
    <Paper sx={{ p: 2.5, height: 320 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Principal vs Interest
      </Typography>
      <ResponsiveContainer width="100%" height="88%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={Math.ceil(data.length / 8)} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) => `${currencySymbol}${Number(value).toLocaleString('en-IN')}`}
            contentStyle={{ borderRadius: 12, border: 'none', background: theme.palette.background.paper, boxShadow: '0px 8px 24px rgba(0,0,0,0.12)' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="principal" stackId="a" fill={brand.primary} name="Principal" radius={[0, 0, 0, 0]} />
          <Bar dataKey="interest" stackId="a" fill={brand.warning} name="Interest" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
