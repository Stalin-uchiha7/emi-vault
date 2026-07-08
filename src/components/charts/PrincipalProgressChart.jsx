// ============================================================================
// PrincipalProgressChart — horizontal bar per loan showing paid vs remaining
// principal, so it doubles as a quick "who's closest to being paid off" view.
// ============================================================================
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Paper, Typography, useTheme } from '@mui/material';
import { brand } from '../../theme/theme';
import EmptyState from '../common/EmptyState';
import { Target } from 'lucide-react';

export default function PrincipalProgressChart({ loans, currencySymbol = '₹' }) {
  const theme = useTheme();
  const activeLoans = loans.filter((l) => l.status !== 'Closed');
  const data = activeLoans.map((loan) => ({
    name: loan.loanName?.length > 14 ? loan.loanName.slice(0, 14) + '…' : loan.loanName,
    paid: Math.round(loan.totalLoan - loan.outstandingAmount),
    remaining: Math.round(loan.outstandingAmount),
  }));

  return (
    <Paper sx={{ p: 2.5, height: 340 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Remaining Principal Progress
      </Typography>
      {data.length === 0 ? (
        <EmptyState icon={Target} title="No active loans" description="Principal payoff progress per loan will appear here." />
      ) : (
        <ResponsiveContainer width="100%" height="88%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
            <Tooltip
              formatter={(value) => `${currencySymbol}${Number(value).toLocaleString('en-IN')}`}
              contentStyle={{ borderRadius: 12, border: 'none', background: theme.palette.background.paper, boxShadow: '0px 8px 24px rgba(0,0,0,0.12)' }}
            />
            <Bar dataKey="paid" stackId="a" fill={brand.success} radius={[0, 0, 0, 0]} maxBarSize={18} name="Paid" />
            <Bar dataKey="remaining" stackId="a" fill="#E5E7EB" radius={[0, 6, 6, 0]} maxBarSize={18} name="Remaining" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
}
