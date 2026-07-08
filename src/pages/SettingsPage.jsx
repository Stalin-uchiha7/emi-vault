// ============================================================================
// SettingsPage — profile info, theme toggle, currency selector, and
// backup/restore (admin only for restore, since it writes data).
// ============================================================================
import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Switch,
  MenuItem,
  Divider,
  Grid,
  Avatar,
} from '@mui/material';
import { Download, Upload, Moon, Sun } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeModeContext';
import { auth, db } from '../firebase/config';
import { CURRENCIES, COLLECTIONS } from '../constants';
import { downloadBackup, restoreBackup } from '../utils/backupRestore';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function SettingsPage() {
  const { user, profile, isAdmin, setProfile } = useAuth();
  const { mode, toggleMode, currency, setCurrency } = useThemeMode();
  const { enqueueSnackbar } = useSnackbar();

  const [name, setName] = useState(profile?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), { name });
      setProfile((p) => ({ ...p, name }));
      enqueueSnackbar('Profile updated', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not update profile', { variant: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleBackup = async () => {
    try {
      await downloadBackup();
      enqueueSnackbar('Backup downloaded', { variant: 'success' });
    } catch {
      enqueueSnackbar('Backup failed', { variant: 'error' });
    }
  };

  const handleRestoreConfirmed = async () => {
    if (!restoreFile) return;
    setRestoring(true);
    try {
      await restoreBackup(restoreFile);
      enqueueSnackbar('Backup restored successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Restore failed. Check the file and try again.', { variant: 'error' });
    } finally {
      setRestoring(false);
      setConfirmRestore(false);
      setRestoreFile(null);
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {/* Profile */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Profile</Typography>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 700, fontSize: '1.3rem' }}>
                {(name || '?').charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{profile?.email}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Role: {isAdmin ? 'Admin' : 'Member'}
                </Typography>
              </Box>
            </Stack>
            <Stack spacing={2}>
              <TextField label="Full Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
              <Button variant="contained" onClick={handleSaveProfile} disabled={savingProfile} sx={{ alignSelf: 'flex-start' }}>
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Preferences */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Preferences</Typography>
            <Stack spacing={2.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  {mode === 'light' ? <Sun size={18} /> : <Moon size={18} />}
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Dark Mode</Typography>
                </Stack>
                <Switch checked={mode === 'dark'} onChange={toggleMode} />
              </Stack>
              <Divider />
              <TextField
                select
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                fullWidth
              >
                {Object.entries(CURRENCIES).map(([code, c]) => (
                  <MenuItem key={code} value={code}>{c.symbol} — {c.label}</MenuItem>
                ))}
              </TextField>
            </Stack>
          </Paper>
        </Grid>

        {/* Backup & Restore */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>Backup & Restore</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Download a full JSON backup of all loans and payments, or restore from a previous backup.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button variant="outlined" startIcon={<Download size={16} />} onClick={handleBackup}>
                Download Backup
              </Button>
              {isAdmin && (
                <Button variant="outlined" component="label" startIcon={<Upload size={16} />}>
                  Restore from File
                  <input
                    type="file"
                    accept="application/json"
                    hidden
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setRestoreFile(e.target.files[0]);
                        setConfirmRestore(true);
                      }
                    }}
                  />
                </Button>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={confirmRestore}
        onClose={() => { setConfirmRestore(false); setRestoreFile(null); }}
        onConfirm={handleRestoreConfirmed}
        title="Restore from backup?"
        description="This will add all loans and payments from the backup file as new records. Existing data will not be deleted."
        confirmLabel="Restore"
        loading={restoring}
      />
    </Box>
  );
}
