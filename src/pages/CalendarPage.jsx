// ============================================================================
// CalendarPage — month-grid calendar highlighting EMI due dates. Overdue
// dates are flagged red, upcoming (within 7 days) amber, future normal.
// ============================================================================
import { useMemo, useState } from 'react';
import { Box, Paper, Typography, Grid, IconButton, Stack, Chip, useTheme, alpha } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import { useLoans } from '../hooks/useLoans';
import { useThemeMode } from '../context/ThemeModeContext';
import { useNavigate } from 'react-router-dom';
import { DetailPageSkeleton } from '../components/common/LoadingSkeletons';

export default function CalendarPage() {
  const { loans, loading } = useLoans();
  const { currencySymbol } = useThemeMode();
  const theme = useTheme();
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(dayjs());

  const dueDatesByDay = useMemo(() => {
    const map = {};
    loans.forEach((loan) => {
      if (loan.status === 'Closed' || !loan.nextDueDate) return;
      const key = loan.nextDueDate.format('YYYY-MM-DD');
      if (!map[key]) map[key] = [];
      map[key].push(loan);
    });
    return map;
  }, [loans]);

  if (loading) return <DetailPageSkeleton />;

  const startOfMonth = cursor.startOf('month');
  const daysInMonth = cursor.daysInMonth();
  const startWeekday = startOfMonth.day();
  const today = dayjs();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(cursor.date(d));

  const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Box>
      <Paper sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{cursor.format('MMMM YYYY')}</Typography>
          <Stack direction="row" spacing={1}>
            <IconButton size="small" onClick={() => setCursor((c) => c.subtract(1, 'month'))}><ChevronLeft size={18} /></IconButton>
            <IconButton size="small" onClick={() => setCursor(dayjs())}>
              <Typography variant="caption" sx={{ fontWeight: 600, px: 0.5 }}>Today</Typography>
            </IconButton>
            <IconButton size="small" onClick={() => setCursor((c) => c.add(1, 'month'))}><ChevronRight size={18} /></IconButton>
          </Stack>
        </Stack>

        <Grid container>
          {weekLabels.map((d) => (
            <Grid item xs key={d} sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{d}</Typography>
            </Grid>
          ))}
        </Grid>

        <Grid container>
          {cells.map((date, i) => {
            if (!date) return <Grid item xs key={i} sx={{ minHeight: 92 }} />;
            const key = date.format('YYYY-MM-DD');
            const dueLoans = dueDatesByDay[key] || [];
            const isOverdue = date.isBefore(today, 'day') && dueLoans.length > 0;
            const isToday = date.isSame(today, 'day');

            return (
              <Grid item xs key={i} sx={{ p: 0.5 }}>
                <Box
                  sx={{
                    minHeight: 92,
                    borderRadius: '12px',
                    p: 1,
                    border: '1px solid',
                    borderColor: isToday ? 'primary.main' : 'divider',
                    bgcolor: isOverdue ? alpha(theme.palette.error.main, 0.08) : 'transparent',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: isToday ? 800 : 600, color: isToday ? 'primary.main' : 'text.primary' }}>
                    {date.date()}
                  </Typography>
                  <Stack spacing={0.4} sx={{ mt: 0.5 }}>
                    {dueLoans.slice(0, 2).map((loan) => (
                      <Chip
                        key={loan.id}
                        label={loan.loanName}
                        size="small"
                        onClick={() => navigate(`/emis/${loan.id}`)}
                        sx={{
                          height: 18,
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          bgcolor: isOverdue ? 'error.main' : 'warning.main',
                          color: '#fff',
                          '& .MuiChip-label': { px: 0.7 },
                        }}
                      />
                    ))}
                    {dueLoans.length > 2 && (
                      <Typography variant="caption" color="text.secondary">+{dueLoans.length - 2} more</Typography>
                    )}
                  </Stack>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Box>
  );
}
