import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase';

type AdminContextValue = {
  isAdmin: boolean;
  isLoading: boolean;
  adminEmail: string | null;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminContext = createContext<AdminContextValue | null>(null);

// Mot de passe de démonstration utilisé uniquement quand aucun projet Firebase
// n'est encore configuré, pour pouvoir tester le mode admin hors-ligne.
const DEMO_ADMIN_PASSWORD = 'romainville2026';

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAdminEmail(user?.email ?? null);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isFirebaseConfigured && auth) {
      await signInWithEmailAndPassword(auth, email, password);
      return;
    }
    if (password !== DEMO_ADMIN_PASSWORD) {
      throw new Error(
        `Mode démo (Firebase non configuré) : utilisez le mot de passe "${DEMO_ADMIN_PASSWORD}".`
      );
    }
    setAdminEmail(email || 'demo@romainvilleavenir.fr');
  };

  const signOut = async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
      return;
    }
    setAdminEmail(null);
  };

  const value = useMemo(
    () => ({
      isAdmin: Boolean(adminEmail),
      isLoading,
      adminEmail,
      isDemo: !isFirebaseConfigured,
      signIn,
      signOut,
    }),
    [adminEmail, isLoading]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
