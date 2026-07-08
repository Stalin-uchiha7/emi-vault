// ============================================================================
// EMIFormDialog — create or edit a loan. Auto-calculates EMI amount from
// principal + rate + tenure, but allows manual override.
// ============================================================================
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  InputAdornment,
  Stack,
  IconButton,
  Typography,
} from '@mui/material';
import { X } from 'lucide-react';
import dayjs from 'dayjs';
import { LOAN_CATEGORIES } from '../../constants';
import { calculateEMI } from '../../utils/emiCalculations';
import { addLoan, updateLoan } from '../../firebase/firestoreService';
import { useSnackbar } from 'notistack';

const emptyForm = {
  loanName: '',
  category: 'Personal Loan',
  bank: '',
  totalLoan: '',
  interestRate: '',
  tenureMonths: '',
  emiAmount: '',
  startDate: dayjs().format('YYYY-MM-DD'),
  notes: '',
};

export default function EMIFormDialog({ open, onClose, editingLoan }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (editingLoan) {
      setForm({
        loanName: editingLoan.loanName || '',
        category: editingLoan.category || 'Personal Loan',
        bank: editingLoan.bank || '',
        totalLoan: editingLoan.totalLoan || '',
        interestRate: editingLoan.interestRate || '',
        tenureMonths: editingLoan.tenureMonths || '',
        emiAmount: editingLoan.emiAmount || '',
        startDate: editingLoan.startDate || dayjs().format('YYYY-MM-DD'),
        notes: editingLoan.notes || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingLoan, open]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (['totalLoan', 'interestRate', 'tenureMonths'].includes(field)) {
        const p = Number(next.totalLoan);
        const r = Number(next.interestRate);
        const n = Number(next.tenureMonths);
        if (p && r >= 0 && n) {
          next.emiAmount = Math.round(calculateEMI(p, r, n));
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        totalLoan: Number(form.totalLoan),
        interestRate: Number(form.interestRate),
        tenureMonths: Number(form.tenureMonths),
        emiAmount: Number(form.emiAmount),
      };
      if (editingLoan) {
        await updateLoan(editingLoan.id, payload);
        enqueueSnackbar('EMI updated successfully', { variant: 'success' });
      } else {
        await addLoan(payload);
        enqueueSnackbar('EMI added successfully', { variant: 'success' });
      }
      onClose();
    } catch (err) {
      enqueueSnackbar('Something went wrong. Please try again.', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
        {editingLoan ? 'Edit EMI' : 'Add New EMI'}
        <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
      </DialogTitle>
      <Stack component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Loan Name" fullWidth required value={form.loanName} onChange={handleChange('loanName')} placeholder="e.g. Home Renovation Loan" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Category" fullWidth required value={form.category} onChange={handleChange('category')}>
                {LOAN_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Bank / Lender" fullWidth required value={form.bank} onChange={handleChange('bank')} placeholder="e.g. HDFC Bank" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={form.startDate}
                onChange={handleChange('startDate')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Total Loan Amount"
                type="number"
                fullWidth
                required
                value={form.totalLoan}
                onChange={handleChange('totalLoan')}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Interest Rate"
                type="number"
                fullWidth
                required
                value={form.interestRate}
                onChange={handleChange('interestRate')}
                InputProps={{ endAdornment: <InputAdornment position="end">% p.a.</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Tenure"
                type="number"
                fullWidth
                required
                value={form.tenureMonths}
                onChange={handleChange('tenureMonths')}
                InputProps={{ endAdornment: <InputAdornment position="end">months</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="EMI Amount (auto-calculated, editable)"
                type="number"
                fullWidth
                required
                value={form.emiAmount}
                onChange={handleChange('emiAmount')}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Notes (optional)" fullWidth multiline minRows={2} value={form.notes} onChange={handleChange('notes')} />
            </Grid>
          </Grid>
          {form.totalLoan && form.interestRate && form.tenureMonths && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Suggested EMI based on reducing balance: ₹{Math.round(calculateEMI(Number(form.totalLoan), Number(form.interestRate), Number(form.tenureMonths))).toLocaleString('en-IN')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} variant="outlined" disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : editingLoan ? 'Save Changes' : 'Add EMI'}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}
