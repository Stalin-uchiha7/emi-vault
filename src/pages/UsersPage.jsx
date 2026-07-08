// ============================================================================
// UsersPage — admin-only. Lists all family member accounts, lets an admin
// promote/demote roles. Users self-register via /register; admins can't
// create accounts directly (Firebase Auth requires the user's own password),
// but they fully control access levels here.
// ============================================================================
import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Stack,
  Chip,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { subscribeToUsers, updateUserRole } from '../firebase/firestoreService';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../constants';
import { TableSkeleton } from '../components/common/LoadingSkeletons';
import EmptyState from '../components/common/EmptyState';
import { Users } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const unsub = subscribeToUsers((data) => {
      setUsers(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleRoleChange = async (uid, role) => {
    try {
      await updateUserRole(uid, role);
      enqueueSnackbar('Role updated', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not update role', { variant: 'error' });
    }
  };

  if (loading) return <TableSkeleton rows={4} />;

  return (
    <Box>
      <Paper>
        {users.length === 0 ? (
          <EmptyState icon={Users} title="No family members yet" description="Members will appear here once they register." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.uid} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.85rem', fontWeight: 700 }}>
                        {(u.name || '?').charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography sx={{ fontWeight: 600 }}>
                        {u.name} {u.uid === currentUser?.uid && <Chip label="You" size="small" sx={{ ml: 1, height: 18 }} />}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                      disabled={u.uid === currentUser?.uid}
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value={USER_ROLES.ADMIN}>Admin</MenuItem>
                      <MenuItem value={USER_ROLES.MEMBER}>Member</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
