// ============================================================================
// EMIsPage — full EMI list with search + status/category filters.
// ============================================================================
import { useMemo, useState } from 'react';
import { Box, Button, Stack } from '@mui/material';
import { Plus } from 'lucide-react';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useLoans } from '../hooks/useLoans';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeModeContext';
import EMIFilters from '../components/emi/EMIFilters';
import EMITable from '../components/emi/EMITable';
import EMIFormDialog from '../components/emi/EMIFormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { TableSkeleton } from '../components/common/LoadingSkeletons';
import { deleteLoan, closeLoan, addPayment } from '../firebase/firestoreService';

export default function EMIsPage() {
  const { loans, loading } = useLoans();
  const { isAdmin } = useAuth();
  const { currencySymbol } = useThemeMode();
  const { enqueueSnackbar } = useSnackbar();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [closeTarget, setCloseTarget] = useState(null);

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const matchesSearch =
        !search ||
        loan.loanName?.toLowerCase().includes(search.toLowerCase()) ||
        loan.bank?.toLowerCase().includes(search.toLowerCase()) ||
        loan.category?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'All' || loan.derivedStatus === statusFilter;
      const matchesCategory = categoryFilter === 'All' || loan.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [loans, search, statusFilter, categoryFilter]);

  const handleMarkPaid = async (loan) => {
    try {
      await addPayment({ loanId: loan.id, amount: loan.emiAmount, date: dayjs().format('YYYY-MM-DD'), note: 'Marked paid' });
      enqueueSnackbar('Payment recorded', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not record payment', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLoan(deleteTarget.id);
      enqueueSnackbar('EMI deleted', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not delete EMI', { variant: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleClose = async () => {
    try {
      await closeLoan(closeTarget.id);
      enqueueSnackbar('Loan marked as closed 🎉', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not close loan', { variant: 'error' });
    } finally {
      setCloseTarget(null);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        {isAdmin && (
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => { setEditingLoan(null); setFormOpen(true); }}>
            Add EMI
          </Button>
        )}
      </Stack>

      <EMIFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <EMITable
          loans={filteredLoans}
          isAdmin={isAdmin}
          currencySymbol={currencySymbol}
          onEdit={(loan) => { setEditingLoan(loan); setFormOpen(true); }}
          onDelete={setDeleteTarget}
          onMarkPaid={handleMarkPaid}
          onCloseLoan={setCloseTarget}
          onAddNew={() => { setEditingLoan(null); setFormOpen(true); }}
        />
      )}

      <EMIFormDialog open={formOpen} onClose={() => setFormOpen(false)} editingLoan={editingLoan} />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        danger
        title="Delete this EMI?"
        description={`This will permanently remove "${deleteTarget?.loanName}" and all its payment history.`}
        confirmLabel="Delete"
      />
      <ConfirmDialog
        open={!!closeTarget}
        onClose={() => setCloseTarget(null)}
        onConfirm={handleClose}
        title="Close this loan?"
        description={`Mark "${closeTarget?.loanName}" as fully paid off and closed.`}
        confirmLabel="Close Loan"
      />
    </Box>
  );
}
