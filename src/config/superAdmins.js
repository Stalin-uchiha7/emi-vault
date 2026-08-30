// ============================================================================
// Super Admin allowlist.
// Keep this list in sync with `isDesignatedSuperAdmin()` in firestore.rules
// — rules are what actually enforce the role. Extra emails can also be set
// via VITE_SUPER_ADMIN_EMAILS (comma-separated) without a code change.
// ============================================================================

const BUILT_IN_SUPER_ADMIN_EMAILS = [
  's76652@gmail.com',
  'stalin.nadar@privacera.com',
];

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function getSuperAdminEmails() {
  const fromEnv = String(
    import.meta.env.VITE_SUPER_ADMIN_EMAILS || import.meta.env.VITE_SUPER_ADMIN_EMAIL || '',
  )
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean);

  return [...new Set([...BUILT_IN_SUPER_ADMIN_EMAILS.map(normalizeEmail), ...fromEnv])];
}

export function isSuperAdminEmail(email) {
  return getSuperAdminEmails().includes(normalizeEmail(email));
}
