// ============================================================================
// Role helpers — Super Admin ⊃ Admin ⊃ Member.
// Super Admin is reserved for designated owner emails; Admins manage loans
// and can promote Members, but cannot create or demote Super Admins.
// ============================================================================
import { ROLE_LABELS, USER_ROLES } from '../constants';
import { isSuperAdminEmail } from '../config/superAdmins';

export function hasAdminAccess(role) {
  return role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN;
}

export function isSuperAdminRole(role) {
  return role === USER_ROLES.SUPER_ADMIN;
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || ROLE_LABELS[USER_ROLES.MEMBER];
}

export function resolveSignupRole({ email }) {
  if (isSuperAdminEmail(email)) return USER_ROLES.SUPER_ADMIN;
  return USER_ROLES.MEMBER;
}

/**
 * Returns the roles the actor is allowed to assign to `target`.
 * Empty array means the row should be read-only.
 */
export function assignableRolesFor({ actorRole, actorUid, target, users }) {
  if (!target || target.uid === actorUid) return [];

  const superAdminCount = users.filter((user) => user.role === USER_ROLES.SUPER_ADMIN).length;
  const lastSuperAdmin = target.role === USER_ROLES.SUPER_ADMIN && superAdminCount <= 1;

  if (actorRole === USER_ROLES.SUPER_ADMIN) {
    if (lastSuperAdmin) return [USER_ROLES.SUPER_ADMIN];
    return [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MEMBER];
  }

  if (actorRole === USER_ROLES.ADMIN && target.role !== USER_ROLES.SUPER_ADMIN) {
    return [USER_ROLES.ADMIN, USER_ROLES.MEMBER];
  }

  return [];
}
