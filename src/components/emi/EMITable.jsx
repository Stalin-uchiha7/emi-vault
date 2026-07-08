// ============================================================================
// EMITable — the core data table. Renders a full table on desktop and
// stacked cards on mobile. Row actions are role-gated (admin only for
// edit/delete/mark-paid/close).
// ============================================================================
import { useState } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  LinearProgress,
  useMediaQuery,
  useTheme,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import { MoreVertical, Eye, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { STATUS_COLORS, CATEGORY_COLORS } from '../../constants';
import ProgressRing from '../common/ProgressRing';
import EmptyState from '../common/EmptyState';
import { Landmark } from 'lucide-react';

export default function EMITable({ loans, isAdmin, currencySymbol = '₹', onEdit, onDelete, onMarkPaid, onCloseLoan, onAddNew }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuLoan, setMenuLoan] = useState(null);

  const openMenu = (e, loan) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuLoan(loan);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuLoan(null);
  };

  if (loans.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <EmptyState
          icon={Landmark}
          title="No EMIs found"
          description="Try adjusting your filters, or add a new EMI to get started."
          actionLabel={isAdmin ? 'Add EMI' : undefined}
          onAction={onAddNew}
        />
      </Paper>
    );
  }

  const fmt = (v) => `${currencySymbol}${Number(v || 0).toLocaleString('en-IN')}`;

  const ActionsMenu = (
    <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
      <MenuItem onClick={() => { navigate(`/emis/${menuLoan.id}`); closeMenu(); }}>
        <Eye size={16} style={{ marginRight: 10 }} /> View Details
      </MenuItem>
      {isAdmin && [
        <MenuItem key="edit" onClick={() => { onEdit(menuLoan); closeMenu(); }}>
          <Pencil size={16} style={{ marginRight: 10 }} /> Edit
        </MenuItem>,
        menuLoan?.status !== 'Closed' && (
          <MenuItem key="markpaid" onClick={() => { onMarkPaid(menuLoan); closeMenu(); }}>
            <CheckCircle2 size={16} style={{ marginRight: 10 }} /> Mark Paid (this month)
          </MenuItem>
        ),
        menuLoan?.status !== 'Closed' && (
          <MenuItem key="close" onClick={() => { onCloseLoan(menuLoan); closeMenu(); }}>
            <XCircle size={16} style={{ marginRight: 10 }} /> Close Loan
          </MenuItem>
        ),
        <MenuItem key="delete" onClick={() => { onDelete(menuLoan); closeMenu(); }} sx={{ color: 'error.main' }}>
          <Trash2 size={16} style={{ marginRight: 10 }} /> Delete
        </MenuItem>,
      ]}
    </Menu>
  );

  if (isMobile) {
    return (
      <>
        <Stack spacing={1.5}>
          {loans.map((loan) => (
            <Card key={loan.id} onClick={() => navigate(`/emis/${loan.id}`)} sx={{ cursor: 'pointer' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{loan.loanName}</Typography>
                    <Typography variant="caption" color="text.secondary">{loan.bank} • {loan.category}</Typography>
                  </Box>
                  <IconButton size="small" onClick={(e) => openMenu(e, loan)}><MoreVertical size={18} /></IconButton>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{fmt(loan.emiAmount)}<Typography component="span" variant="caption" color="text.secondary">/mo</Typography></Typography>
                    <Chip
                      label={loan.derivedStatus}
                      size="small"
                      sx={{ mt: 0.5, bgcolor: `${STATUS_COLORS[loan.derivedStatus]}22`, color: STATUS_COLORS[loan.derivedStatus], fontWeight: 700 }}
                    />
                  </Box>
                  <ProgressRing percent={loan.progressPercent} size={52} />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Outstanding: {fmt(loan.outstandingAmount)} • Next due: {loan.nextDueDate ? loan.nextDueDate.format('DD MMM YYYY') : '—'}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
        {ActionsMenu}
      </>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Loan Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Bank</TableCell>
              <TableCell align="right">EMI Amount</TableCell>
              <TableCell align="right">Rate</TableCell>
              <TableCell>Tenure</TableCell>
              <TableCell>Paid / Remaining</TableCell>
              <TableCell align="right">Total Loan</TableCell>
              <TableCell align="right">Outstanding</TableCell>
              <TableCell>Next Due</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loans.map((loan) => (
              <TableRow
                key={loan.id}
                hover
                onClick={() => navigate(`/emis/${loan.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Typography sx={{ fontWeight: 600 }}>{loan.loanName}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={loan.category}
                    size="small"
                    sx={{ bgcolor: `${CATEGORY_COLORS[loan.category]}1E`, color: CATEGORY_COLORS[loan.category], fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>{loan.bank}</TableCell>
                <TableCell align="right">{fmt(loan.emiAmount)}</TableCell>
                <TableCell align="right">{loan.interestRate}%</TableCell>
                <TableCell>{loan.tenureMonths}mo</TableCell>
                <TableCell>{loan.monthsPaid} / {loan.monthsRemaining}</TableCell>
                <TableCell align="right">{fmt(loan.totalLoan)}</TableCell>
                <TableCell align="right">{fmt(loan.outstandingAmount)}</TableCell>
                <TableCell>{loan.nextDueDate ? loan.nextDueDate.format('DD MMM YYYY') : '—'}</TableCell>
                <TableCell>
                  <Chip
                    label={loan.derivedStatus}
                    size="small"
                    sx={{ bgcolor: `${STATUS_COLORS[loan.derivedStatus]}22`, color: STATUS_COLORS[loan.derivedStatus], fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell sx={{ width: 140 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={loan.progressPercent}
                      sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'action.hover' }}
                    />
                    <Typography variant="caption" sx={{ minWidth: 32 }}>{loan.progressPercent}%</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={(e) => openMenu(e, loan)}>
                    <MoreVertical size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {ActionsMenu}
    </>
  );
}
