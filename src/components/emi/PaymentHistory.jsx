// ============================================================================
// PaymentHistory — lists recorded manual payments for a loan; admins can add
// new payments or delete incorrect entries.
// ============================================================================
import { useState } from 'react';
import {
  Paper,
  Typography,
  Stack,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Plus, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { addPayment, deletePayment } from '../../firebase/firestoreService';
import EmptyState from '../common/EmptyState';
import ConfirmDialog from '../common/ConfirmDialog';
import { Receipt } from 'lucide-react';

export default function PaymentHistory({ loan, payments, isAdmin, currencySymbol = '₹' }) {
  const { enqueueSnackbar } = useSnackbar();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ amount: loan.emiAmount, date: dayjs().format('YYYY-MM-DD'), note: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    try {
      await addPayment({ loanId: loan.id, amount: Number(form.amount), date: form.date, note: form.note });
      enqueueSnackbar('Payment added', { variant: 'success' });
      setAddOpen(false);
      setForm({ amount: loan.emiAmount, date: dayjs().format('YYYY-MM-DD'), note: '' });
    } catch {
      enqueueSnackbar('Could not add payment', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePayment(deleteTarget.id);
      enqueueSnackbar('Payment removed', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not remove payment', { variant: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Payment History</Typography>
        {isAdmin && (
          <Button size="small" startIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
            Add Payment
          </Button>
        )}
      </Stack>

      {payments.length === 0 ? (
        <EmptyState icon={Receipt} title="No payments recorded" description="Payments logged manually will appear here." />
      ) : (
        <List disablePadding>
          {payments
            .slice()
            .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)))
            .map((p) => (
              <ListItem
                key={p.id}
                divider
                secondaryAction={
                  isAdmin && (
                    <IconButton edge="end" size="small" onClick={() => setDeleteTarget(p)}>
                      <Trash2 size={16} />
                    </IconButton>
                  )
                }
              >
                <ListItemText
                  primary={`${currencySymbol}${Number(p.amount).toLocaleString('en-IN')}`}
                  secondary={`${dayjs(p.date).format('DD MMM YYYY')}${p.note ? ' • ' + p.note : ''}`}
                  primaryTypographyProps={{ fontWeight: 700 }}
                />
              </ListItem>
            ))}
        </List>
      )}

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Manual Payment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }}
            />
            <TextField
              label="Payment Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
            <TextField
              label="Note (optional)"
              fullWidth
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAddOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleAdd} variant="contained" disabled={saving}>{saving ? 'Saving…' : 'Add Payment'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        danger
        title="Remove this payment?"
        description="This payment record will be permanently deleted."
        confirmLabel="Remove"
      />
    </Paper>
  );
}
