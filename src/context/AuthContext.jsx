// ============================================================================
// AuthContext — tracks the current Firebase user + their Firestore profile
// (which carries the `role` used for Super Admin / Admin / Member checks).
// ============================================================================
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { ensureUserProfile } from '../firebase/authService';
import { hasAdminAccess, isSuperAdminRole } from '../utils/roles';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const resolvedProfile = await ensureUserProfile(firebaseUser);
        setProfile(resolvedProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const isSuperAdmin = isSuperAdminRole(profile?.role);
  const isAdmin = hasAdminAccess(profile?.role);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isSuperAdmin, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
