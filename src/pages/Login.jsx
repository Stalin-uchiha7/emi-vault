// ============================================================================
// Login page — email/password sign-in, styled as a premium split-screen.
// ============================================================================
import { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Stack, Alert, InputAdornment, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Wallet } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { loginUser, resetPassword } from '../firebase/authService';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authLoading && user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await loginUser(email, password);
      navigate('/');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setInfo('');
    if (!email) {
      setError('Enter your email first, then click Forgot password.');
      return;
    }
    try {
      await resetPassword(email);
      setInfo('Password reset email sent. Check your inbox.');
    } catch {
      setError('Could not send a reset email. Check the address and try again.');
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
            ? 'radial-gradient(circle at 20% 20%, #EEF0FF 0%, #F7F7FB 55%)'
            : 'radial-gradient(circle at 20% 20%, #1a1a2e 0%, #0B0B10 55%)',
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
              <Wallet size={26} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Welcome back</Typography>
            <Typography variant="body2" color="text.secondary">Sign in to your family's EMI Vault</Typography>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}
          {info && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>{info}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={17} /></InputAdornment> }}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock size={17} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="small">
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py: 1.3 }}>
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
              <Button type="button" variant="text" onClick={handleResetPassword} disabled={loading}>
                Forgot password?
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
            New to the family vault?{' '}
            <Link to="/register" style={{ color: 'inherit', fontWeight: 700 }}>
              Create an account
            </Link>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
}
