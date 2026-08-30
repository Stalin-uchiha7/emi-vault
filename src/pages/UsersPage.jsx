// ============================================================================
// UsersPage — admin-only. Lists family member accounts.
// Super Admin can assign Super Admin / Admin / Member.
// Regular Admins can promote Members to Admin, but cannot touch Super Admins.
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
  Alert,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { subscribeToUsers, updateUserRole } from '../firebase/firestoreService';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../constants';
import { assignableRolesFor, getRoleLabel } from '../utils/roles';
import { TableSkeleton } from '../components/common/LoadingSkeletons';
import EmptyState from '../components/common/EmptyState';
import { Users } from 'lucide-react';

const ROLE_CHIP_COLOR = {
  [USER_ROLES.SUPER_ADMIN]: 'warning',
  [USER_ROLES.ADMIN]: 'primary',
  [USER_ROLES.MEMBER]: 'default',
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, profile, isSuperAdmin } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const unsub = subscribeToUsers((data) => {
      setUsers(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleRoleChange = async (target, role) => {
    const allowed = assignableRolesFor({
      actorRole: profile?.role,
      actorUid: currentUser?.uid,
      target,
      users,
    });
    if (!allowed.includes(role)) {
      enqueueSnackbar('You cannot assign that role', { variant: 'error' });
      return;
    }
    try {
      await updateUserRole(target.uid, role);
      enqueueSnackbar('Role updated', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not update role', { variant: 'error' });
    }
  };

  if (loading) return <TableSkeleton rows={4} />;

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2, borderRadius: '12px' }}>
        {isSuperAdmin
          ? 'You are Super Admin. You can promote family members to Admin so they can add and edit loans. Super Admin cannot be removed from the last owner account.'
          : 'Admins can add and edit loans, and can promote Members. Only Super Admin can create or change Super Admin accounts.'}
      </Alert>
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
              {users.map((familyMember) => {
                const allowedRoles = assignableRolesFor({
                  actorRole: profile?.role,
                  actorUid: currentUser?.uid,
                  target: familyMember,
                  users,
                });
                const menuRoles = [...new Set([familyMember.role, ...allowedRoles])];
                const canEdit = allowedRoles.length > 1
                  || (allowedRoles.length === 1 && allowedRoles[0] !== familyMember.role);

                return (
                  <TableRow key={familyMember.uid} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.85rem', fontWeight: 700 }}>
                          {(familyMember.name || '?').charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography sx={{ fontWeight: 600 }}>
                          {familyMember.name}{' '}
                          {familyMember.uid === currentUser?.uid && (
                            <Chip label="You" size="small" sx={{ ml: 1, height: 18 }} />
                          )}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{familyMember.email}</TableCell>
                    <TableCell>
                      {canEdit ? (
                        <Select
                          size="small"
                          value={familyMember.role}
                          onChange={(event) => handleRoleChange(familyMember, event.target.value)}
                          sx={{ minWidth: 150 }}
                        >
                          {menuRoles.map((role) => (
                            <MenuItem key={role} value={role}>
                              {getRoleLabel(role)}
                            </MenuItem>
                          ))}
                        </Select>
                      ) : (
                        <Chip
                          size="small"
                          color={ROLE_CHIP_COLOR[familyMember.role] || 'default'}
                          label={getRoleLabel(familyMember.role)}
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
