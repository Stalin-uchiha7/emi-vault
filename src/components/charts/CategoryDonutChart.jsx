// ============================================================================
// CategoryDonutChart — outstanding balance broken down by loan category.
// ============================================================================
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { CATEGORY_COLORS } from '../../constants';
import EmptyState from '../common/EmptyState';
import { PieChart as PieIcon } from 'lucide-react';

export default function CategoryDonutChart({ loans, currencySymbol = '₹' }) {
  const theme = useTheme();
  const byCategory = {};
  loans.forEach((loan) => {
    if (loan.status === 'Closed') return;
    byCategory[loan.category] = (byCategory[loan.category] || 0) + loan.outstandingAmount;
  });
  const data = Object.entries(byCategory)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <Paper sx={{ p: 2.5, height: 340 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Outstanding by Category
      </Typography>
      {data.length === 0 ? (
        <EmptyState icon={PieIcon} title="No active loans" description="Add an EMI to see the breakdown here." />
      ) : (
        <ResponsiveContainer width="100%" height="88%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              cornerRadius={6}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#8B5CF6'} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${currencySymbol}${Number(value).toLocaleString('en-IN')}`}
              contentStyle={{
                borderRadius: 12,
                border: 'none',
                background: theme.palette.background.paper,
                boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
}
