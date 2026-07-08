// ============================================================================
// DocumentsNotes — lightweight document links (stored as URL + name in
// Firestore, no binary upload) and a free-text notes field.
// Keeping documents as links (rather than file uploads) avoids needing
// Firebase Storage / a paid plan, so the whole app stays on the free tier.
// ============================================================================
import { useState } from 'react';
import {
  Paper,
  Typography,
  Stack,
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
  Link,
} from '@mui/material';
import { Plus, Trash2, FileText, Save } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { updateLoan } from '../../firebase/firestoreService';
import EmptyState from '../common/EmptyState';

export default function DocumentsNotes({ loan, isAdmin }) {
  const { enqueueSnackbar } = useSnackbar();
  const [docOpen, setDocOpen] = useState(false);
  const [docForm, setDocForm] = useState({ name: '', url: '' });
  const [notes, setNotes] = useState(loan.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  const documents = loan.documents || [];

  const handleAddDoc = async () => {
    if (!docForm.name || !docForm.url) return;
    try {
      await updateLoan(loan.id, { documents: [...documents, docForm] });
      enqueueSnackbar('Document added', { variant: 'success' });
      setDocForm({ name: '', url: '' });
      setDocOpen(false);
    } catch {
      enqueueSnackbar('Could not add document', { variant: 'error' });
    }
  };

  const handleRemoveDoc = async (index) => {
    const next = documents.filter((_, i) => i !== index);
    try {
      await updateLoan(loan.id, { documents: next });
      enqueueSnackbar('Document removed', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not remove document', { variant: 'error' });
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateLoan(loan.id, { notes });
      enqueueSnackbar('Notes saved', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not save notes', { variant: 'error' });
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Documents</Typography>
          {isAdmin && (
            <Button size="small" startIcon={<Plus size={16} />} onClick={() => setDocOpen(true)}>
              Add Link
            </Button>
          )}
        </Stack>
        {documents.length === 0 ? (
          <EmptyState icon={FileText} title="No documents yet" description="Add links to loan agreements, statements, or receipts." />
        ) : (
          <List disablePadding>
            {documents.map((doc, i) => (
              <ListItem
                key={i}
                divider
                secondaryAction={isAdmin && (
                  <IconButton edge="end" size="small" onClick={() => handleRemoveDoc(i)}>
                    <Trash2 size={16} />
                  </IconButton>
                )}
              >
                <ListItemText
                  primary={<Link href={doc.url} target="_blank" rel="noopener" sx={{ fontWeight: 600 }}>{doc.name}</Link>}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Notes</Typography>
        <TextField
          fullWidth
          multiline
          minRows={3}
          placeholder="Add any notes about this loan…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={!isAdmin}
        />
        {isAdmin && (
          <Button size="small" startIcon={<Save size={15} />} sx={{ mt: 1.5 }} onClick={handleSaveNotes} disabled={savingNotes}>
            {savingNotes ? 'Saving…' : 'Save Notes'}
          </Button>
        )}
      </Paper>

      <Dialog open={docOpen} onClose={() => setDocOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Document Link</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Document Name" fullWidth value={docForm.name} onChange={(e) => setDocForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Loan Agreement.pdf" />
            <TextField label="URL" fullWidth value={docForm.url} onChange={(e) => setDocForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://drive.google.com/…" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDocOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleAddDoc} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
