// ============================================================================
// ConfirmDialog — reusable confirmation modal, used before delete/close
// actions across the app. Supports a "danger" variant for destructive ops.
// ============================================================================
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ pt: 4, textAlign: 'center' }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            mx: 'auto',
            mb: 2,
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: danger ? 'error.main' : 'warning.main',
            color: '#fff',
            opacity: 0.9,
          }}
        >
          <AlertTriangle size={26} />
        </Box>
        <DialogTitle sx={{ p: 0, mb: 1, fontWeight: 700 }}>{title}</DialogTitle>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button fullWidth variant="outlined" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          color={danger ? 'error' : 'primary'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Please wait…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
