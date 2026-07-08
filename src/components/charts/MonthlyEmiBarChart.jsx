// ============================================================================
// MonthlyEmiBarChart — monthly EMI outflow grouped by loan category.
// ============================================================================
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Paper, Typography, useTheme } from '@mui/material';
import { brand } from '../../theme/theme';
import EmptyState from '../common/EmptyState';
import { BarChart3 } from 'lucide-react';

export default function MonthlyEmiBarChart({ loans, currencySymbol = '₹' }) {
  const theme = useTheme();
  const byCategory = {};
  loans.forEach((loan) => {
    if (loan.status === 'Closed') return;
    byCategory[loan.category] = (byCategory[loan.category] || 0) + Number(loan.emiAmount || 0);
  });
  const data = Object.entries(byCategory).map(([name, amount]) => ({ name, amount }));

  return (
    <Paper sx={{ p: 2.5, height: 340 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Monthly EMI Distribution
      </Typography>
      {data.length === 0 ? (
        <EmptyState icon={BarChart3} title="No active EMIs" description="Your monthly EMI split will appear here." />
      ) : (
        <ResponsiveContainer width="100%" height="88%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
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
            <Bar dataKey="amount" fill={brand.primary} radius={[8, 8, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
}
