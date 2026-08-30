// ============================================================================
// Register page — family members create accounts. The designated owner
// email becomes Super Admin; everyone else starts as a Member.
// ============================================================================
import { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Stack, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { registerUser } from '../firebase/authService';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authLoading && user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await registerUser(form);
      navigate('/');
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use' ? 'This email is already registered.' : 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (t) =>
          t.palette.mode === 'light'
            ? 'radial-gradient(circle at 80% 20%, #EEF0FF 0%, #F7F7FB 55%)'
            : 'radial-gradient(circle at 80% 20%, #1a1a2e 0%, #0B0B10 55%)',
        p: 2,
      }}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Paper sx={{ width: 400, maxWidth: '92vw', p: 4, borderRadius: '24px' }} elevation={0}>
          <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #635BFF, #4F46E5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <UserPlus size={26} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Create your account</Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Join your family's EMI Vault. New accounts start as Member;
              Super Admin can promote you.
            </Typography>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField label="Full Name" fullWidth required value={form.name} onChange={handleChange('name')} />
              <TextField label="Email" type="email" fullWidth required value={form.email} onChange={handleChange('email')} />
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                helperText="At least 6 characters"
                value={form.password}
                onChange={handleChange('password')}
              />
              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py: 1.3 }}>
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'inherit', fontWeight: 700 }}>
              Sign in
            </Link>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
}
