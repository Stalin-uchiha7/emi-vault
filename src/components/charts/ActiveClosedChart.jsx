// ============================================================================
// ActiveClosedChart — simple split of active vs closed loans.
// ============================================================================
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Paper, Typography, useTheme, Box, Stack } from '@mui/material';
import { brand } from '../../theme/theme';

export default function ActiveClosedChart({ loans }) {
  const theme = useTheme();
  const active = loans.filter((l) => l.status !== 'Closed').length;
  const closed = loans.filter((l) => l.status === 'Closed').length;
  const data = [
    { name: 'Active', value: active, color: brand.success },
    { name: 'Closed', value: closed, color: '#9CA3AF' },
  ];
  const total = active + closed;

  return (
    <Paper sx={{ p: 2.5, height: 340, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Active vs Closed Loans
      </Typography>
      {total === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary" variant="body2">No loans added yet</Typography>
        </Box>
      ) : (
        <>
          <ResponsiveContainer width="100%" height="75%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4} cornerRadius={6}>
                {data.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', background: theme.palette.background.paper, boxShadow: '0px 8px 24px rgba(0,0,0,0.12)' }} />
            </PieChart>
          </ResponsiveContainer>
          <Stack direction="row" justifyContent="center" spacing={3}>
            <Stack direction="row" alignItems="center" spacing={0.7}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: brand.success }} />
              <Typography variant="body2">Active ({active})</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.7}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#9CA3AF' }} />
              <Typography variant="body2">Closed ({closed})</Typography>
            </Stack>
          </Stack>
        </>
      )}
    </Paper>
  );
}
